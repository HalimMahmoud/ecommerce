import { z } from 'zod';

/** Password strength result returned by checkPasswordStrength */
interface PasswordStrengthResult {
  score: number;
  label: string;
  color: string;
}

/**
 * Password strength checker
 * Returns validation result and strength score (0-4)
 */
function passwordStrength(password: string): { valid: boolean; score: number; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, score: 0, message: 'Password must be at least 8 characters' };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  if (checks.length) score++;
  if (checks.lowercase) score++;
  if (checks.uppercase) score++;
  if (checks.numbers) score++;
  if (checks.special) score++;

  if (score < 4) {
    return {
      valid: false,
      score,
      message: 'Password is too weak. Mix letters (case), numbers, and symbols.',
    };
  }

  if (score < 3) {
    return { valid: true, score, message: 'Password is okay, but could be stronger' };
  }

  return { valid: true, score };
}

/**
 * Enhanced password schema with strength validation
 * Exported so it can be reused across multiple auth schemas.
 */
const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    pwd => {
      const result = passwordStrength(pwd);
      return result.valid;
    },
    pwd => {
      const result = passwordStrength(pwd);
      return { message: result.message || 'Password is too weak' };
    }
  );

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false),
});

/**
 * Reusable password and confirmation fields for schemas.
 */
const passwordConfirmationFields = {
  password: strongPasswordSchema,
  passwordConfirmation: z.string().min(1, 'Confirm your password'),
};

/**
 * Reusable refinement for matching passwords.
 */
interface PasswordMatching {
  password?: string;
  passwordConfirmation?: string;
}
const passwordMatchRefinementFn = (data: PasswordMatching) => data.password === data.passwordConfirmation;
const passwordMatchRefinementOptions = {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
};

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username is too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  ...passwordConfirmationFields,
}).refine(passwordMatchRefinementFn, passwordMatchRefinementOptions);

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const resetPasswordSchema = z.object({
  code: z.string().min(1, 'Reset code is required'),
  ...passwordConfirmationFields,
}).refine(passwordMatchRefinementFn, passwordMatchRefinementOptions);

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  ...passwordConfirmationFields,
}).refine(passwordMatchRefinementFn, passwordMatchRefinementOptions);

export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Export for password strength meter component
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { score: 0, label: 'Enter password', color: 'bg-gray-200' };

  const result = passwordStrength(password);

  const levels: Array<{ score: number; label: string; color: string }> = [
    { score: 0, label: 'Very Weak', color: 'bg-red-500' },
    { score: 1, label: 'Weak', color: 'bg-orange-500' },
    { score: 2, label: 'Fair', color: 'bg-yellow-500' },
    { score: 3, label: 'Strong', color: 'bg-green-500' },
    { score: 4, label: 'Very Strong', color: 'bg-emerald-500' },
    { score: 5, label: 'Excellent', color: 'bg-emerald-600' },
  ];

  const index = Math.max(0, Math.min(result.score, levels.length - 1));
  return levels[index]!;
}
