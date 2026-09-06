import { useState, type FormEvent } from "react";
import type { SignupFormData, SignupFormProps } from "../../@types/interface/signup";
import { validateSignup, type SignupErrors } from "../../validations/signup.validation";
import { registerUser } from "../../services/auth.service";

const initialValues: SignupFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  location: "",
};

export function SignupForm({ onGeoError, onSuccess }: SignupFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isLocating, setIsLocating] = useState(false);

  const updateField = (field: keyof SignupFormData, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      onGeoError("Your browser does not support location access. Enter your area manually.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateField("location", `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        onGeoError("Allow location access or enter your area manually to receive relevant alerts.");
      },
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateSignup(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        location: values.location,
      });
      onSuccess();
    }
  };

  const fields: Array<{ name: keyof SignupFormData; label: string; type: string; autoComplete: string }> = [
    { name: "name", label: "Full name", type: "text", autoComplete: "name" },
    { name: "email", label: "Email address", type: "email", autoComplete: "email" },
    { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
    { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-[#DCE8D8]">{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={(event) => updateField(field.name, event.target.value)}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
            className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#9FB3A0] focus:border-[#D9A24B]"
          />
          {errors[field.name] && <p id={`${field.name}-error`} className="mt-1 text-xs text-[#F0B39B]">{errors[field.name]}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-[#DCE8D8]">Alert area</label>
        <div className="flex gap-2">
          <input id="location" name="location" type="text" autoComplete="address-level2" value={values.location} onChange={(event) => updateField("location", event.target.value)} aria-invalid={Boolean(errors.location)} className="min-w-0 flex-1 rounded-md border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#9FB3A0] focus:border-[#D9A24B]" placeholder="City, district, or coordinates" />
          <button type="button" onClick={useCurrentLocation} disabled={isLocating} className="shrink-0 rounded-md border border-[#D9A24B]/70 px-3 text-xs font-medium text-[#F0C77D] hover:bg-[#D9A24B]/10 disabled:opacity-60">{isLocating ? "Locating..." : "Use GPS"}</button>
        </div>
        {errors.location && <p className="mt-1 text-xs text-[#F0B39B]">{errors.location}</p>}
      </div>

      <button type="submit" className="w-full rounded-md bg-[#D9A24B] px-4 py-3 text-sm font-semibold text-[#1B1204] transition hover:bg-[#E8B563] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A24B]">Create account</button>
    </form>
  );
}