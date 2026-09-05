export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onForgotPassword: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export interface ResetPasswordFormProps {
  onSuccess: (message: string) => void;
  onBackToLogin: () => void;
}

export interface ResetPasswordFormData {
  email: string;
}