/**
 * Shape of the signup fields we persist for the Profile page.
 * Deliberately excludes password/confirmPassword — those should
 * never be stored or displayed anywhere past the signup form.
 */
export interface StoredUser {
  name: string;
  email: string;
  phone: string;
  location: string;
}
