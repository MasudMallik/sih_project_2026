import { z } from "zod";

export const incidentReportSchema = z.object({
  location: z
    .string()
    .min(1, "Location is required")
    .refine((val) => val.trim().length > 0, "Location cannot be only whitespace"),
  disasterType: z
    .enum(["Landslide", "Flood", "Fire", "Accident"] as const)
    .default("Landslide"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});

export type IncidentReportFormData = z.infer<typeof incidentReportSchema>;

export const validateIncidentReport = (data: unknown) => {
  try {
    const validated = incidentReportSchema.parse(data);
    return { valid: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return { valid: false, data: null, errors: fieldErrors };
    }
    return {
      valid: false,
      data: null,
      errors: { general: ["An unknown error occurred"] },
    };
  }
};
