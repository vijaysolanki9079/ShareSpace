import { z } from 'zod';

// Sign up validation
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;

// Login validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// NGO Sign up validation
export const NGOSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name is required'),
  registrationNumber: z.string().min(2, 'Registration number is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  categories: z.array(z.string().min(2)).min(1, 'At least one category is required'),
  verificationDocument: z.instanceof(File).optional(),
});

export type NGOSignUpInput = z.infer<typeof NGOSignUpSchema>;
