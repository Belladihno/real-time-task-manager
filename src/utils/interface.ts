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
  emailVerified: boolean;
  emailVerificationCode: string;
  emailVerificationCodeValidation: number;
  forgotPasswordCode: string;
  forgotPasswordCodeValidation: number;
  passwordChangedAt: Date;
  isOnline: boolean;
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspace {
  name: string;
  type: "personal" | "team";
  ownerId: Types.ObjectId;
  teamId: Types.ObjectId;
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

export interface ITeamMembership {
  userId: Types.ObjectId;
  teamId: Types.ObjectId;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  invitedBy?: Types.ObjectId;
  status: "active" | "suspended" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailOptions {
  to: string;
  subject: string;
  text: string;
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
  sort?: string | { [key: string]: 1 | -1 }
  filter?: object;
}