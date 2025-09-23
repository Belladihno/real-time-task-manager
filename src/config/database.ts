import mongoose from "mongoose";
import config from "./index.config";
import type { ConnectOptions } from "mongoose";
import { logger } from "@/lib/winston";


const clientOptions: ConnectOptions = {
  dbName: "TASK_MANAGER_DB",
  appName: "Task_manager_api",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectDB = async (): Promise<void> => {
  if (!config.MONGO_URL) {
    throw new Error("MongoDB URL not found");
  }
  try {
    await mongoose.connect(config.MONGO_URL, clientOptions);
    logger.info("Connected to database successfully.", {
      uri: config.MONGO_URL,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    logger.error("Error connecting to database", error);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from database successfully", {
      uri: config.MONGO_URL,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    logger.error("Error disconnecting from database", error);
  }
};
