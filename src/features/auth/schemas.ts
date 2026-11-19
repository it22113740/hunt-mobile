import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginValues = z.infer<typeof loginSchema>;

const phonePattern = /^[+0-9][0-9\s()-]{7,19}$/;

export const registerSchema = z
  .object({
    role: z.enum(['USER', 'OWNER']),
    username: z.string(),
    email: z.string(),
    phone: z.string(),
    password: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.username.trim().length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['username'],
        message: 'Use at least 2 characters',
      });
    }
    if (!z.email().safeParse(value.email).success) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Enter a valid email',
      });
    }
    if (value.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Use at least 8 characters',
      });
    }
    if (value.role === 'OWNER' && !phonePattern.test(value.phone.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Enter a valid mobile number',
      });
    }
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  newPassword: z.string().min(8, 'Use at least 8 characters'),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ['newPassword'],
    message: 'Choose a different password',
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const authSessionSchema = z.object({
  accessToken: z.string(),
});

export const messageSchema = z.object({
  message: z.string(),
});

export const signupPendingSchema = z.object({
  email: z.string(),
  message: z.string(),
});

export const verifyEmailSchema = z.object({
  email: z.email('Enter a valid email'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
