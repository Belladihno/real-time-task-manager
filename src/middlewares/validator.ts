import Joi from "joi";

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

export default {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  resetPasswordSchema,
};
