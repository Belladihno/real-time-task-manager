import Joi from "joi";

const nameSchema = Joi.string().required().trim().min(2).max(100).messages({
  "string.min": "Name must contain at least 2 characters",
  "string.max": "Name cannot exceed 100 characters",
});

const descriptionSchema = Joi.string().optional().trim().max(500).messages({
  "string.max": "Description cannot exceed 500 characters",
});

const idSchema = Joi.string().required().hex().length(24).messages({
  "string.hex": "Invalid ID format",
  "string.length": "Invalid ID length",
});

const firstNameSchema = Joi.string().required().trim().min(3).messages({
  "string-min": "firstname must contain at least 3 characters",
});

const lastNameSchema = Joi.string().required().trim().min(3).messages({
  "string-min": "lastname must contain at least 3 characters",
});

const displayNameSchema = Joi.string()
  .required()
  .trim()
  .lowercase()
  .min(3)
  .messages({
    "string-min": "name must contain at least 3 letters",
  });

const PASSWORD_PATTERN = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
);

const PASSWORD_MESSAGE =
  "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character";

const passwordSchema = Joi.string()
  .required()
  .pattern(PASSWORD_PATTERN)
  .messages({
    "string-pattern-base": PASSWORD_MESSAGE,
  });

const emailSchema = Joi.string()
  .min(6)
  .max(60)
  .required()
  .email({
    tlds: { allow: ["com", "net"] },
  });

const emailCodeSchema = Joi.number().required();

const registerSchema = Joi.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
  email: emailSchema,
  role: Joi.string().optional().valid("user", "admin"),
});

const updateUserSchema = Joi.object({
  firstName: firstNameSchema.optional(),
  lastName: lastNameSchema.optional(),
  displayName: displayNameSchema.optional(),
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

const changePasswordSchema = Joi.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema.valid(Joi.ref("newPassword")),
});

const resetPasswordSchema = Joi.object({
  password: passwordSchema,
  confirmPassword: passwordSchema.valid(Joi.ref("password")),
});

const createProjectSchema = Joi.object({
  name: nameSchema,
  description: descriptionSchema,
  workspaceId: idSchema,
  priority: Joi.string()
    .optional()
    .valid("low", "medium", "high", "critical")
    .default("medium"),
  visibility: Joi.string()
    .optional()
    .valid("public", "private")
    .default("private"),
  startDate: Joi.date().optional().messages({
    "date.base": "Invalid start date format",
  }),
  dueDate: Joi.date().optional().greater(Joi.ref("startDate")).messages({
    "date.greater": "Due date must be after start date",
  }),
});

const updateProjectSchema = Joi.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  status: Joi.string()
    .optional()
    .valid("active", "on-hold", "completed", "cancelled"),
  priority: Joi.string().optional().valid("low", "medium", "high", "critical"),
  visibility: Joi.string().optional().valid("public", "private"),
  startDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
});

const createWorkspaceSchema = Joi.object({
  name: nameSchema,
  description: descriptionSchema,
  settings: Joi.object({
    isPublic: Joi.boolean().optional(),
    allowMemberInvites: Joi.boolean().optional(),
    defaultProjectVisibility: Joi.string()
      .optional()
      .valid("public", "private"),
  }).optional(),
});
const updateWorkspaceSchema = Joi.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  settings: Joi.object({
    isPublic: Joi.boolean().optional(),
    allowMemberInvites: Joi.boolean().optional(),
    defaultProjectVisibility: Joi.string()
      .optional()
      .valid("public", "private"),
  }).optional(),
});

const createTaskSchema = Joi.object({
  name: nameSchema,
  description: descriptionSchema,
  projectId: idSchema,
  status: Joi.string()
    .optional()
    .valid("todo", "in-progress", "review", "completed", "cancelled"),
  priority: Joi.string().optional().valid("low", "medium", "high", "urgent"),
  assigneeIds: Joi.array().items(idSchema).optional(),
  dueDate: Joi.date().optional(),
  startDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isLocked: Joi.boolean().optional(),
});

const updateTaskSchema = Joi.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  status: Joi.string()
    .optional()
    .valid("todo", "in-progress", "review", "completed", "cancelled"),
  priority: Joi.string().optional().valid("low", "medium", "high", "urgent"),
  assigneeIds: Joi.array().items(idSchema).optional(),
  dueDate: Joi.date().optional(),
  startDate: Joi.date().optional(),
  completedDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

export default {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  resetPasswordSchema,
  createProjectSchema,
  updateProjectSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  createTaskSchema,
  updateTaskSchema,
};
