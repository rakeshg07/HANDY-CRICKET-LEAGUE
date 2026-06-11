'use client';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  let strength = 0;
  if (isLongEnough) strength++;
  if (hasUppercase) strength++;
  if (hasLowercase) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;

  let strengthLabel = 'Weak';
  let colorClass = 'bg-red-500';

  if (strength >= 4 && isLongEnough) {
    strengthLabel = 'Strong';
    colorClass = 'bg-stadium-green';
  } else if (strength >= 3) {
    strengthLabel = 'Medium';
    colorClass = 'bg-yellow-500';
  }

  const percentage = (strength / 5) * 100;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Password Strength</span>
        <span className={`text-xs font-bold ${
          strengthLabel === 'Strong' ? 'text-stadium-green' : 
          strengthLabel === 'Medium' ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {strengthLabel}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-[10px] text-gray-500 mt-1">
        Must contain: 8+ chars, uppercase, lowercase, number, special char.
      </div>
    </div>
  );
}
