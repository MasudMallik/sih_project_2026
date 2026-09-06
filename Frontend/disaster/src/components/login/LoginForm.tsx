import { useState, type FormEvent } from "react";
import type { LoginFormData, LoginFormProps } from "../../@types/interface/login";
import { validateLogin, type LoginErrors } from "../../validations/login.validation";

const initialValues: LoginFormData = { email: "", password: "" };

export function LoginForm({ onForgotPassword, onSuccess, onError }: LoginFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});

  const updateField = (field: keyof LoginFormData, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      onError("Check your email and password and try again.");
      return;
    }
    onSuccess(values.email, values.password);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-[#DCE8D8]">Email address</label>
        <input id="login-email" type="email" autoComplete="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#9FB3A0] focus:border-[#E3A63F]" />
        {errors.email && <p className="mt-1 text-xs text-[#F0B39B]">{errors.email}</p>}
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-4">
          <label htmlFor="login-password" className="block text-sm font-medium text-[#DCE8D8]">Password</label>
          <button type="button" onClick={onForgotPassword} className="text-xs text-[#E3A63F] hover:text-[#EDB454]">Forgot password?</button>
        </div>
        <input id="login-password" type="password" autoComplete="current-password" value={values.password} onChange={(event) => updateField("password", event.target.value)} aria-invalid={Boolean(errors.password)} className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#9FB3A0] focus:border-[#E3A63F]" />
        {errors.password && <p className="mt-1 text-xs text-[#F0B39B]">{errors.password}</p>}
      </div>
      <button type="submit" className="w-full rounded-md bg-[#E3A63F] px-4 py-3 text-sm font-semibold text-[#1B1204] transition hover:bg-[#EDB454] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E3A63F]">Log in</button>
    </form>
  );
}