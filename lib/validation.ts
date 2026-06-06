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

export const CreateItemRequestSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  categoryId: z.string().trim().min(1, 'Category is required'),
  images: z.array(z.string().url()).max(6).default([]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  locationName: z.string().trim().max(160).optional().or(z.literal('')),
  radius: z.coerce.number().int().min(1000).max(25000).default(5000),
  ngoId: z.string().trim().min(1).optional().or(z.literal('')),
});

export type CreateItemRequestInput = z.infer<typeof CreateItemRequestSchema>;
