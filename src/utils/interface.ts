import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
  bio?: string;
  phone?: string;
  occupation?: string;
  role: "user" | "admin";
  status: "active" | "inactive" | "suspended" | "pending-verification";
  isVerified: Boolean;
  verificationToken: string | null;
  verificationTokenExpiresAt: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: Date | null;
  passwordChangedAt: Date;
  isOnline: boolean;
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeam {
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export interface IEmailResponse {
  success: boolean;
  statusCode?: number;
  messageId?: string;
  accepted?: string[];
  result?: any[];
}

export interface IEmailError {
  success: false;
  error: string;
  statusCode: number;
}

export interface IToken {
  token: string;
  userId: Types.ObjectId;
}
export interface IJWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface IUpdataData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface IPaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  select?: string;
  populate?: string;
  sort?: string | { [key: string]: 1 | -1 };
  filter?: object;
}

export interface ITask {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  tags?: string[];
  attachments?: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskComment {
  _id?: Types.ObjectId;
  content: string;
  authorId: Types.ObjectId;
  taskId: Types.ObjectId;
  isEdited: boolean;
  editedAt?: Date;
  mentions?: Types.ObjectId[];
  attachments?: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface ICreateTaskData {
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "review" | "done" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  assigneeId?: string;
  dueDate?: string;
  startDate?: string;
  tags?: string[];
}
