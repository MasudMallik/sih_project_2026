import { z } from "zod";
import type { LoginFormData, ResetPasswordFormData } from "../@types/interface/login";

export type LoginErrors = Partial<Record<keyof LoginFormData, string>>;
export type ResetPasswordErrors = Partial<Record<keyof ResetPasswordFormData, string>>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export function validateLogin(values: LoginFormData): LoginErrors {
  const result = loginSchema.safeParse(values);
  if (result.success) return {};

  return result.error.issues.reduce<LoginErrors>((errors, issue) => {
    const field = issue.path[0];
    if (field === "email" || field === "password") errors[field] ??= issue.message;
    return errors;
  }, {});
}

export function validateResetPassword(values: ResetPasswordFormData): ResetPasswordErrors {
  const result = resetPasswordSchema.safeParse(values);
  if (result.success) return {};

  return result.error.issues.reduce<ResetPasswordErrors>((errors, issue) => {
    if (issue.path[0] === "email") errors.email ??= issue.message;
    return errors;
  }, {});
}