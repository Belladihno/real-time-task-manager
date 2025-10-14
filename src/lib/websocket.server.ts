import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { verifyAccessToken } from "@/lib/jwt";
import { Types } from "mongoose";
import User from "@/models/user";
import { logger } from "./winston";

interface AuthWebSocket extends WebSocket {
  userId?: Types.ObjectId;
  isAlive?: boolean;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthWebSocket> = new Map();

  initialize(server: Server): void{
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", this.setUpConnection.bind(this));

    this.startHeartbeat();

    logger.info("WebSocket server initialized on /ws");
  }

  private startHeartbeat(): void {
    setInterval(() => {
      this.clients.forEach((ws, userId) => {
        if (!ws.isAlive) {
          logger.info("Terminating dead connection", { userId });
          this.clients.delete(userId);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private async setUpConnection(ws: AuthWebSocket, req: any): Promise<void> {
    try {
      const token = new URL(
        req.url,
        `http://${req.headers.host}`
      ).searchParams.get("token");
      if (!token) {
        ws.close(4001, "Auth token required");
        logger.warn("Websocket connection rejected: No token provided");
        return;
      }

      const decoded = verifyAccessToken(token) as { userId: string };
      const userId = new Types.ObjectId(decoded.userId);

      const user = await User.findById(userId).select("isActive").lean();
      if (!user || !user.isActive) {
        ws.close(4002, "Invalid or inactive user");
        logger.warn("WebSocket connection rejected: Invalid User", { userId });
        return;
      }

      ws.userId = userId;
      ws.isAlive = true;

      this.clients.set(userId.toString(), ws);

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      logger.info("WebSocket client connected", { userId: userId.toString() });

      this.sendToClient(userId.toString(), {
        type: "connection",
        message: "Connected to WebSocket server",
        timestamp: new Date().toISOString(),
      });

      ws.on("message", (data: Buffer) => this.handleMessage(ws, data));

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("close", () => this.handleDisconnection(ws));

      ws.on("error", (error) => {
        logger.error("WebSocket error", {
          userId: ws.userId?.toString(),
          error,
        });
      });
    } catch (error) {
      ws.close(4003, "Authentication failed");
      logger.error("WebSocket authentication error", error);
    }
  }

  private handleMessage(ws: AuthWebSocket, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());
      const userId = ws.userId?.toString();

      logger.info("Websocket message received", { userId, type: message.type });

      switch (message.type) {
        case "ping":
          this.sendToClient(userId!, {
            type: "pong",
            timeStamp: new Date().toISOString(),
          });
          break;

        default:
          logger.warn("Unknown message type", { type: message.type, userId });
      }
    } catch (error) {
      logger.error("Error handling WebSocket message", error);
    }
  }

  private async handleDisconnection(ws: AuthWebSocket): Promise<void> {
    const userId = ws.userId?.toString();
    if (userId) {
      this.clients.delete(userId);

      await User.findByIdAndUpdate(ws.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      logger.info("WebSocket client disconnected", { userId });
    }
  }

  sendToClient(userId: string, data: any): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  sendToClients(userIds: string[], data: any): void {
    userIds.forEach((userId) => this.sendToClient(userId, data));
  }
}

export const wsManager = new WebSocketManager();
