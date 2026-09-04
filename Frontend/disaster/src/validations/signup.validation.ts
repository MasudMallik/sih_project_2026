import { z } from "zod";
import type { SignupFormData } from "../@types/interface/signup";

export type SignupErrors = Partial<Record<keyof SignupFormData, string>>;

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().regex(/^[0-9+\-() ]{7,20}$/, "Enter a valid phone number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
  location: z.string().trim().min(1, "Location is required for local alerts."),
}).superRefine(({ password, confirmPassword }, context) => {
  if (password !== confirmPassword) {
    context.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
});

export function validateSignup(values: SignupFormData): SignupErrors {
  const errors: SignupErrors = {};

  const result = signupSchema.safeParse(values);
  if (result.success) return errors;

  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in values) {
      const key = field as keyof SignupFormData;
      errors[key] ??= issue.message;
    }
  }

  return errors;
}