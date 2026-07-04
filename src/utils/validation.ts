export const passwordRules = {
  minLength: 8,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < passwordRules.minLength) {
    errors.push(`Minimum ${passwordRules.minLength} characters`);
  }
  if (!passwordRules.uppercase.test(password)) {
    errors.push('At least 1 uppercase letter');
  }
  if (!passwordRules.number.test(password)) {
    errors.push('At least 1 number');
  }
  if (!passwordRules.special.test(password)) {
    errors.push('At least 1 special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}