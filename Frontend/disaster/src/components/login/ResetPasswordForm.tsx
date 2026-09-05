import { useState, type FormEvent } from "react";
import type { ResetPasswordFormData, ResetPasswordFormProps } from "../../@types/interface/login";
import { validateResetPassword, type ResetPasswordErrors } from "../../validations/login.validation";

export function ResetPasswordForm({ onSuccess, onBackToLogin }: ResetPasswordFormProps) {
  const [values, setValues] = useState<ResetPasswordFormData>({ email: "" });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateResetPassword(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSuccess("Password reset instructions sent to your email.");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#F4F1E8]">Reset your password</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#A9B9A8]">Enter your email and we&apos;ll send reset instructions.</p>
      </div>
      <div>
        <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-[#DCE8D8]">Email address</label>
        <input id="reset-email" type="email" autoComplete="email" value={values.email} onChange={(event) => { setValues({ email: event.target.value }); setErrors({}); }} aria-invalid={Boolean(errors.email)} className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#E3A63F]" />
        {errors.email && <p className="mt-1 text-xs text-[#F0B39B]">{errors.email}</p>}
      </div>
      <button type="submit" className="w-full rounded-md bg-[#E3A63F] px-4 py-3 text-sm font-semibold text-[#1B1204] transition hover:bg-[#EDB454]">Send reset link</button>
      <button type="button" onClick={onBackToLogin} className="w-full text-sm text-[#E3A63F] hover:text-[#EDB454]">Back to login</button>
    </form>
  );
}