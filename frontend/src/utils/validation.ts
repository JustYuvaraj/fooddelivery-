/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Phone number validation
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Address validation
 */
export const validateAddress = (address: string): boolean => {
  return address.trim().length >= 5;
};

/**
 * Postal code validation
 */
export const validatePostalCode = (code: string): boolean => {
  const postalRegex = /^[0-9]{5,6}$/;
  return postalRegex.test(code);
};

/**
 * Form field validation
 */
export const validateField = (
  fieldName: string,
  value: string,
  rules: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp }
): string[] => {
  const errors: string[] = [];

  if (rules.required && !value.trim()) {
    errors.push(`${fieldName} is required`);
  }

  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(`${fieldName} format is invalid`);
  }

  return errors;
};
