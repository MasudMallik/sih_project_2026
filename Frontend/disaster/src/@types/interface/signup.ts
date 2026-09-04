export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: string;
}

export interface SignupFormProps {
  onGeoError: (message: string) => void;
  onSuccess: () => void;
}