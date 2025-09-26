import Joi from "joi";

const titleSchema = Joi.string().required().trim().min(1).max(200).messages({
  "string.min": "Task title is required",
  "string.max": "Task title cannot exceed 200 characters",
});

const descriptionSchema = Joi.string().optional().trim().max(2000).messages({
  "string.max": "Description cannot exceed 2000 characters",
});

const createTaskSchema = Joi.object({
  title: titleSchema,
  description: descriptionSchema,
  status: Joi.string()
    .optional()
    .valid("todo", "in-progress", "review", "done", "cancelled")
    .default("todo"),
  priority: Joi.string()
    .optional()
    .valid("low", "medium", "high", "urgent")
    .default("medium"),
  assigneeId: Joi.string().optional().hex().length(24).messages({
    "string.hex": "Invalid assignee ID format",
    "string.length": "Invalid assignee ID length",
  }),
  workspaceId: Joi.string().required().hex().length(24).messages({
    "string.hex": "Invalid workspace ID format",
    "string.length": "Invalid workspace ID length",
  }),
  projectId: Joi.string().optional().hex().length(24).messages({
    "string.hex": "Invalid project ID format",
    "string.length": "Invalid project ID length",
  }),
  dueDate: Joi.date().optional().greater("now").messages({
    "date.greater": "Due date must be in the future",
  }),
  startDate: Joi.date().optional().messages({
    "date.base": "Invalid start date format",
  }),
  tags: Joi.array().optional().items(Joi.string().trim()).max(10).messages({
    "array.max": "Maximum 10 tags allowed",
  }),
});

export default { createTaskSchema };
