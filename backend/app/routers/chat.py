from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    Task,
    TaskChange,
    Conversation,
    Message
)
from app.dependencies import get_current_user
from app.schemas import ChatRequest, ChatResponse
from app.services.context_service import build_user_context
from app.services.ai_service import (
    generate_ai_response,
    AIServiceError
)
from app.services.permission_service import can_change_task_status


router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"]
)


@router.post("/", response_model=ChatResponse)
def chat_with_ai(
    chat_data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Step 1: Validate the user's message
    question = chat_data.message.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    # Step 2: Build context using only accessible projects
    try:
        context = build_user_context(
            db,
            current_user,
            chat_data.project_id
        )
    except PermissionError:
        raise HTTPException(
            status_code=404,
            detail="Project not found or access denied"
        )

    # Step 3: Create or retrieve the conversation
    if chat_data.conversation_id is not None:
        conversation = db.query(Conversation).filter(
            Conversation.id == chat_data.conversation_id,
            Conversation.user_id == current_user.id
        ).first()

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

    else:
        conversation = Conversation(
            user_id=current_user.id,
            title=question[:100]
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Step 4: Retrieve previous messages
    previous_messages = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation.id
        )
        .order_by(Message.id.desc())
        .limit(10)
        .all()
    )

    previous_messages.reverse()

    history = [
        {
            "role": message.role,
            "content": message.content
        }
        for message in previous_messages
    ]

    # Step 5: Ask Gemini to answer using permitted context
    try:
        ai_result = generate_ai_response(
            question=question,
            context=context,
            history=history
        )

    except AIServiceError:
        raise HTTPException(
            status_code=503,
            detail="AI service is currently unavailable. Please try again."
        )

    answer = ai_result["answer"]
    proposed_change = ai_result["proposed_change"]

    # Step 6: Validate and create a pending task-change proposal
    proposal_response = None

    if proposed_change is not None:

        task_id = proposed_change["task_id"]
        new_status = proposed_change["new_status"]

        # Verify that the task belongs to the user's AI context
        accessible_task_ids = {
            task["task_id"]
            for project in context["projects"]
            for task in project["tasks"]
        }

        if task_id not in accessible_task_ids:
            raise HTTPException(
                status_code=404,
                detail="Task not found or access denied"
            )

        task = db.query(Task).filter(
            Task.id == task_id
        ).first()

        if task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        # Fresh permission check before creating the proposal
        if not can_change_task_status(db, current_user, task):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to change this task status"
            )

        proposal = TaskChange(
            task_id=task.id,
            proposed_status=new_status,
            requested_by=current_user.id,
            status="Pending"
        )

        db.add(proposal)
        db.commit()
        db.refresh(proposal)

        proposal_response = {
            "id": proposal.id,
            "task_id": proposal.task_id,
            "proposed_status": proposal.proposed_status,
            "status": proposal.status
        }

    # Step 7: Save the user's message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=question
    )

    db.add(user_message)

    # Step 8: Save the AI response
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=answer
    )

    db.add(assistant_message)

    db.commit()

    # Step 9: Return the response
    return {
        "conversation_id": conversation.id,
        "answer": answer,
        "proposed_change": proposal_response
    }