import { VALIDATION_RULES } from './constants';
import { FormErrors } from '@/types';
import { sanitizeText } from './sanitizer';

const MAX_LENGTHS = {
  NAME: 50,
  CITY: 100,
  OCCUPATION: 100,
  BIO: 500,
  MESSAGE: 2000,
  NOTE: 500,
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  if (!VALIDATION_RULES.EMAIL.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

export const validateName = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name || name.trim().length === 0) {
    return `${fieldName} is required`;
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  if (trimmed.length > MAX_LENGTHS.NAME) {
    return `${fieldName} must be less than ${MAX_LENGTHS.NAME} characters`;
  }
  // Prevent common injection characters in names
  if (/[<>{}()[\]\\/_|"']/.test(trimmed)) {
    return `${fieldName} contains invalid characters`;
  }
  return null;
};

export const validateBio = (bio: string): string | null => {
  if (bio && bio.length > VALIDATION_RULES.BIO_MAX_LENGTH) {
    return `Bio must be less than ${VALIDATION_RULES.BIO_MAX_LENGTH} characters`;
  }
  return null;
};

export const validateAge = (birthdate: string): string | null => {
  if (!birthdate) {
    return 'Birthdate is required';
  }
  
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < VALIDATION_RULES.MIN_AGE) {
    return `You must be at least ${VALIDATION_RULES.MIN_AGE} years old`;
  }
  
  if (age > VALIDATION_RULES.MAX_AGE) {
    return 'Invalid birthdate';
  }
  
  return null;
};

export const validateMessage = (message: string): string | null => {
  if (!message || message.trim().length === 0) {
    return 'Message cannot be empty';
  }
  if (message.length > VALIDATION_RULES.MESSAGE_MAX_LENGTH) {
    return `Message must be less than ${VALIDATION_RULES.MESSAGE_MAX_LENGTH} characters`;
  }
  return null;
};

export const validatePreferences = (minAge: number, maxAge: number, distance: number): FormErrors => {
  const errors: FormErrors = {};
  
  if (minAge < VALIDATION_RULES.MIN_AGE) {
    errors.minAge = `Minimum age must be at least ${VALIDATION_RULES.MIN_AGE}`;
  }
  
  if (maxAge > VALIDATION_RULES.MAX_AGE) {
    errors.maxAge = `Maximum age cannot exceed ${VALIDATION_RULES.MAX_AGE}`;
  }
  
  if (minAge > maxAge) {
    errors.minAge = 'Minimum age cannot be greater than maximum age';
  }
  
  if (distance < VALIDATION_RULES.MIN_DISTANCE) {
    errors.distance = `Distance must be at least ${VALIDATION_RULES.MIN_DISTANCE} mile`;
  }
  
  if (distance > VALIDATION_RULES.MAX_DISTANCE) {
    errors.distance = `Distance cannot exceed ${VALIDATION_RULES.MAX_DISTANCE} miles`;
  }
  
  return errors;
};

export const validateSignupForm = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthdate: string;
}): FormErrors => {
  const errors: FormErrors = {};
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  const firstNameError = validateName(data.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(data.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const ageError = validateAge(data.birthdate);
  if (ageError) errors.birthdate = ageError;
  
  return errors;
};

/**
 * Validates a file (photo or video) before upload.
 */
export const validateFile = (
  file: { size: number; type: string; name?: string },
  options: { maxSizeBytes: number; allowedMimeTypes: string[] }
): string | null => {
  if (file.size > options.maxSizeBytes) {
    const mb = (options.maxSizeBytes / (1024 * 1024)).toFixed(0);
    return `File size is too large (max ${mb}MB)`;
  }
  
  if (!options.allowedMimeTypes.includes(file.type)) {
    return 'Invalid file type';
  }
  
  return null;
};

export const FILE_LIMITS = {
  PHOTO: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  VIDEO: {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
  },
};

export const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};
