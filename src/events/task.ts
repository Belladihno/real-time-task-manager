import { wsManager } from "@/lib/websocket.server";
import { logger } from "@/lib/winston";
import { Types } from "mongoose";

export const emitTaskCreated = (
  projectId: Types.ObjectId,
  task: any,
  members: string[]
) => {
  const message = {
    type: "task:created",
    data: {
      projectId: projectId.toString(),
      task,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Task created event sent", {
    projectId,
    taskId: task._id,
  });
};

export const emitTaskUpdated = (
  projectId: Types.ObjectId,
  task: any,
  members: string[]
) => {
  const message = {
    type: "task:updated",
    data: {
      projectId: projectId.toString(),
      task,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Task updated event sent", {
    projectId,
    taskId: task._id,
  });
};

export const emitTaskDeleted = (
  projectId: Types.ObjectId,
  taskId: string,
  members: string[]
) => {
  const message = {
    type: "task:deleted",
    data: {
      projectId: projectId.toString(),
      taskId,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Task deleted event sent", { projectId, taskId });
};

export const emitTaskAssigned = (
  taskId: string,
  assigneeIds: string[],
  assignedBy: string
) => {
  const message = {
    type: "task:assigned",
    data: {
      taskId,
      assignedBy,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(assigneeIds, message);
  logger.info("WebSocket: Task assigned event sent", { taskId, assigneeIds });
};
