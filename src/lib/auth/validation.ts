import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .max(254)
  .toLowerCase()
  .pipe(z.email());

// Supabase projects can configure the length of their numeric email codes.
export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/);
