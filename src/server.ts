import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import limiter from "@/lib/express_rate_limit";
import v1Routes from "@/routes/v1";
import { connectDB, disconnectDB } from "@/config/database";
import { logger } from "@/lib/winston";
import errorHandler from "./middlewares/error.handler";
import ApiError from "./utils/apiError";
import config from "./config/index.config";
import { createServer } from "http";
import { wsManager } from "./lib/websocket.server";

const app = express();
const server = createServer(app)

const PORT = config.PORT || 8000;

app.use(helmet());
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));

if (config.NODE_ENV !== "test") {
  app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));
}

(async () => {
  try {
    await connectDB();

    wsManager.initialize(server)

    app.use("/api/v1", v1Routes);

    app.use((req, res, next) => {
      const error = new ApiError(
        `Can't find ${req.originalUrl} on this server!`,
        404
      );
      next(error);
    });

    app.use(errorHandler);

    server.listen(PORT, () => {
      logger.info(`server is running on http://localhost:${PORT}`);
      logger.info(`WebSocket server running on ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    logger.error("Failed to start the server", error);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectDB();
    logger.warn("Server SHUTDOWN!!!");
    process.exit(1);
  } catch (error) {
    logger.error("Error during server shutdown", error);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
