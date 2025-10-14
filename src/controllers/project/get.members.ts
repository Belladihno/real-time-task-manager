import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import ProjectMember from "@/models/project.member";
import Project from "@/models/project";
import WorkspaceMember from "@/models/workspace.member";
import config from "@/config/index.config";
import { paginate } from "@/utils/pagination";

export const getProjectMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    const workspaceMembership = await WorkspaceMember.findOne({
      workspaceId: project.workspaceId,
      userId,
      isActive: true,
    });

    if (!workspaceMembership) {
      return next(new ApiError("Access denied to this workspace", 403));
    }

    const projectMembership = await ProjectMember.findOne({
      projectId,
      userId,
      isActive: true,
    });

    if (!projectMembership && project.visibility === "private") {
      return next(new ApiError("Access denied to this project", 403));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;

    const filter: any = {
      projectId,
    };

    const isActiveFilter = req.query.isActive as string;
    const canViewInactiveMembers = projectMembership && ["owner", "manager"].includes(projectMembership.role);
    
    if (isActiveFilter !== undefined) {
      if (isActiveFilter === "false" && !canViewInactiveMembers) {
        return next(new ApiError("Only project owners and managers can view inactive members", 403));
      }
      filter.isActive = isActiveFilter === "true";
    } else {
      filter.isActive = true; 
    }

    const roleFilter = req.query.role as string;
    if (roleFilter && ["owner", "manager", "member"].includes(roleFilter)) {
      filter.role = roleFilter;
    }

    const result = await paginate(ProjectMember, {
      page,
      limit,
      filter,
      select: "-__v",
      populate: [
        {
          path: "userId",
          select: "firstName lastName displayName email isOnline lastSeen",
        },
        {
          path: "addedBy",
          select: "displayName email",
        },
      ],
      sort: { joinedAt: -1 },
    });

    res.status(200).json({
      status: "success",
      ...result.pagination,
      members: result.data,
    });
  }
);