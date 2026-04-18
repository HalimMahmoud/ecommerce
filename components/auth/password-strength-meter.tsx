'use client';

import { checkPasswordStrength } from '@/lib/auth/schemas';

type PasswordStrengthMeterProps = {
  password: string;
};

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label, color } = checkPasswordStrength(password);
  const activeBars = Math.min(score, 5);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(level => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= activeBars ? color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {label}. Use 8+ characters with letters, numbers, and symbols.
      </p>
    </div>
  );
}
