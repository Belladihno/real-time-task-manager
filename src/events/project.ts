import { wsManager } from "@/lib/websocket.server";
import { logger } from "@/lib/winston";


export const emitProjectUpdated = (project: any, members: string[]) => {
  const message = {
    type: "project:updated",
    data: {
      project,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Project updated event sent", {
    projectId: project._id,
  });
};

export const emitProjectMemberAdded = (
  projectId: string,
  newMember: any,
  members: string[]
) => {
  const message = {
    type: "project:member_added",
    data: {
      projectId,
      member: newMember,
    },
    timestamp: new Date().toISOString(),
  };

  wsManager.sendToClients(members, message);
  logger.info("WebSocket: Project member added event sent", { projectId });
};
