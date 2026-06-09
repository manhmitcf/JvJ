/**
 * Form validation helpers for registration flows
 * All error messages in Vietnamese
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates full name (min 2 characters)
 */
export function validateFullName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Vui lòng nhập họ và tên' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
  }
  return { isValid: true };
}

/**
 * Validates Vietnamese phone number
 * Accepts formats: 0xxxxxxxxx or +84xxxxxxxxx
 */
export function validatePhone(value: string): ValidationResult {
  const normalized = value.replace(/\s/g, '');
  if (!normalized) {
    return { isValid: false, error: 'Vui lòng nhập số điện thoại' };
  }

  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(normalized)) {
    return {
      isValid: false,
      error: 'Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)'
    };
  }

  return { isValid: true };
}

/**
 * Validates email address
 */
export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Vui lòng nhập email' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Email không hợp lệ' };
  }

  return { isValid: true };
}

/**
 * Validates username (min 3 chars, alphanumeric + underscore only)
 */
export function validateUsername(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Vui lòng nhập tên đăng nhập' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'
    };
  }

  return { isValid: true };
}

/**
 * Validates password (min 8 characters)
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) {
    return { isValid: false, error: 'Vui lòng nhập mật khẩu' };
  }

  if (value.length < 8) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }

  return { isValid: true };
}

/**
 * Validates password confirmation matches original password
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Vui lòng xác nhận mật khẩu' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu xác nhận không khớp' };
  }

  return { isValid: true };
}

/**
 * Validates years of experience (non-negative number, max 50)
 */
export function validateYearsOfExperience(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Vui lòng nhập số năm kinh nghiệm' };
  }

  const num = Number(trimmed);
  if (isNaN(num)) {
    return { isValid: false, error: 'Số năm kinh nghiệm phải là số' };
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Số năm kinh nghiệm phải là số nguyên' };
  }

  if (num < 0) {
    return { isValid: false, error: 'Số năm kinh nghiệm không được âm' };
  }

  if (num > 50) {
    return { isValid: false, error: 'Số năm kinh nghiệm không được vượt quá 50' };
  }

  return { isValid: true };
}

/**
 * Validates specialties (at least one selected)
 */
export function validateSpecialties(value: string | string[]): ValidationResult {
  // Support both string (legacy) and array format
  const specialties = Array.isArray(value) ? value : value.trim().split(',').map(s => s.trim()).filter(Boolean);

  if (specialties.length === 0) {
    return { isValid: false, error: 'Vui lòng chọn ít nhất một chuyên môn' };
  }

  return { isValid: true };
}

const maxFileSize = 5 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedCertificateTypes = [...allowedImageTypes, 'application/pdf'];

export function validateRequiredFile(file: File | null, label: string, allowedTypes = allowedImageTypes): ValidationResult {
  if (!file) {
    return { isValid: false, error: `Vui lòng tải lên ${label}` };
  }

  if (file.size > maxFileSize) {
    return { isValid: false, error: `File "${file.name}" vượt quá 5MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    const allowedFormats = allowedTypes.includes('application/pdf') ? 'JPG, PNG, WebP, PDF' : 'JPG, PNG, WebP';
    return {
      isValid: false,
      error: `File "${file.name}" không đúng định dạng (chỉ chấp nhận ${allowedFormats})`
    };
  }

  return { isValid: true };
}

/**
 * Validates certificate files
 * - At least 1 file required
 * - Max 5MB per file
 * - Allowed types: JPG, PNG, WebP, PDF
 */
export function validateCertificates(files: FileList | null): ValidationResult {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      error: 'Vui lòng tải lên ít nhất 1 chứng chỉ'
    };
  }

  for (let i = 0; i < files.length; i++) {
    const result = validateRequiredFile(files[i], 'chứng chỉ', allowedCertificateTypes);
    if (!result.isValid) return result;
  }

  return { isValid: true };
}

export function validateCitizenId(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { isValid: false, error: 'Vui lòng nhập số CCCD' };
  if (!/^\d{12}$/.test(trimmed)) return { isValid: false, error: 'Số CCCD phải gồm đúng 12 chữ số' };
  return { isValid: true };
}

export function validateBio(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { isValid: false, error: 'Vui lòng nhập giới thiệu bản thân' };
  if (trimmed.length < 20) return { isValid: false, error: 'Giới thiệu bản thân phải có ít nhất 20 ký tự' };
  return { isValid: true };
}

export function validateServiceAreas(value: string[]): ValidationResult {
  if (value.length === 0) return { isValid: false, error: 'Vui lòng chọn ít nhất 1 khu vực phục vụ' };
  return { isValid: true };
}

export function validateRequiredConfirmation(value: boolean, error: string): ValidationResult {
  if (!value) return { isValid: false, error };
  return { isValid: true };
}
