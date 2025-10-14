import { wsManager } from "@/lib/websocket.server";
import { logger } from "@/lib/winston";

export const emitCommentCreated = (comment: any, members: string[]) => {
  const message = {
    type: "comment:created",
    data: {
      comment,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Comment created event sent", {
    commentId: comment._id,
  });
};

export const emitCommentUpdated = (comment: any, members: string[]) => {
  const message = {
    type: "comment:updated",
    data: {
      comment,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Comment updated event sent", {
    commentId: comment._id,
  });
};

export const emitCommentDeleted = (commentId: string, members: string[]) => {
  const message = {
    type: "comment:deleted",
    data: {
      commentId,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Comment deleted event sent", { commentId });
};
