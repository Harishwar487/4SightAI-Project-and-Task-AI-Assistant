
import api from "./api";

export const getTasks = async (projectId = null) => {
  const response = await api.get("/tasks/", {
    params: projectId ? { project_id: projectId } : {}
  });

  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post("/tasks/", taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(
    `/tasks/${taskId}`,
    taskData
  );
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(
    `/tasks/${taskId}/status`,
    { status }
  );
  return response.data;
};
