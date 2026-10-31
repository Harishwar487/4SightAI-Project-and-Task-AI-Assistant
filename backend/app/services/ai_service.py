
import os
import json
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load the backend .env file explicitly
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


class AIServiceError(Exception):
    """Raised when the Gemini AI service fails."""
    pass


def generate_ai_response(
    question: str,
    context: dict,
    history: list | None = None
) -> dict:
    """
    Generate a grounded answer or task-change proposal.

    The AI only receives the context prepared by context_service.
    It does not directly modify database records.
    """

    if not API_KEY:
        raise AIServiceError("Gemini API key is not configured.")

    client = genai.Client(api_key=API_KEY)

    history = history or []

    prompt = f"""
You are an AI assistant for a Project and Task Management application.

Your job is to answer questions using ONLY the project and task data
provided below.

SIGNED-IN USER CONTEXT:
{json.dumps(context, indent=2)}

PREVIOUS CONVERSATION:
{json.dumps(history, indent=2)}

CURRENT USER QUESTION:
{question}

IMPORTANT RULES:

1. Use only the projects and tasks in the provided context.
2. Never invent project names, task IDs, task statuses, dates, or assignees.
3. If information is unavailable, clearly say so.
4. Answer questions about task status, overdue tasks, ownership,
   project progress, and task details using the provided data.
5. Mention relevant project names and task IDs when useful.
6. Use the current date supplied in the context to determine overdue work.
7. Respect the user's accessible project scope.
8. Do not claim that a task has been updated or saved.
9. If the user requests a task status change, prepare a proposal only.
10. If the task or requested status is unclear, ask the user for clarification.
11. Allowed task statuses: Pending, In Progress, Completed.

RETURN ONLY VALID JSON IN THIS EXACT STRUCTURE:

{{
    "answer": "Your natural language response",
    "proposed_change": null
}}

For a clear and identifiable task status change request, use:

{{
    "answer": "I prepared a status change proposal for your review.",
    "proposed_change": {{
        "task_id": 1,
        "new_status": "Completed"
    }}
}}

If the user is only asking a question, proposed_change must be null.

If you cannot identify the exact task or requested status,
ask a clarification question and set proposed_change to null.
"""

    try:
        response = None

        # Retry temporary Gemini service failures up to 3 times
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=MODEL_NAME,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    )
                )
                break

            except Exception as exc:
                error_message = str(exc).lower()

                temporary_error = (
                    "503" in error_message
                    or "unavailable" in error_message
                    or "429" in error_message
                    or "resource_exhausted" in error_message
                )

                if not temporary_error or attempt == 2:
                    raise

                wait_time = 2 * (attempt + 1)

                print(
                    f"Gemini temporarily unavailable. "
                    f"Retrying in {wait_time} seconds..."
                )

                time.sleep(wait_time)

        # Validate Gemini response
        if response is None or not response.text:
            raise AIServiceError("Gemini returned an empty response.")

        result = json.loads(response.text)

        if not isinstance(result, dict):
            raise AIServiceError(
                "Gemini returned an invalid response format."
            )

        if "answer" not in result or "proposed_change" not in result:
            raise AIServiceError(
                "Gemini response is missing required fields."
            )

        if not isinstance(result["answer"], str):
            raise AIServiceError("Invalid AI answer format.")

        proposed_change = result["proposed_change"]

        if proposed_change is not None:

            if not isinstance(proposed_change, dict):
                raise AIServiceError("Invalid task-change proposal.")

            if (
                not isinstance(proposed_change.get("task_id"), int)
                or isinstance(proposed_change.get("task_id"), bool)
            ):
                raise AIServiceError("Invalid task ID in proposal.")

            allowed_statuses = {
                "Pending",
                "In Progress",
                "Completed"
            }

            if proposed_change.get("new_status") not in allowed_statuses:
                raise AIServiceError("Invalid proposed task status.")

        return result

    except AIServiceError:
        raise

    except Exception as exc:
        print("Gemini service error:", str(exc))

        raise AIServiceError(
            "The AI service is currently unavailable. Please try again."
        ) from exc
