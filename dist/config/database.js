import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error("MONGO_URL is not defined in environment variables");
        }
        const conn = await mongoose.connect(mongoUrl);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.log("Error connecting to database", error);
    }
};
//# sourceMappingURL=database.js.map