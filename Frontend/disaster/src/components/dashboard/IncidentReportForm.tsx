import { useState } from "react";
import type { DisasterType, DisasterTypeOption } from "../../@types/interface/dashboard";
import { validateIncidentReport } from "../../validations/incident-report.validation";

interface IncidentReportFormProps {
  disasterTypes: DisasterTypeOption[];
  onSubmit?: (data: {
    location: string;
    disasterType: DisasterType;
    description?: string;
  }) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
}

export function IncidentReportForm({
  disasterTypes,
  onSubmit,
  isLoading = false,
}: IncidentReportFormProps) {
  const [location, setLocation] = useState("");
  const [selectedType, setSelectedType] = useState<DisasterType | null>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setSuccess(false);
    setErrorMessage("");

    // Frontend validation
    const validation = validateIncidentReport({
      location,
      disasterType: selectedType,
      description,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // If no backend handler provided, show mock success
    if (!onSubmit) {
      setSuccess(true);
      setSuccessMessage(
        `${selectedType} reported at ${location}. Nearest response team notified.`
      );
      resetForm();
      return;
    }

    try {
      setSubmitting(true);
      const result = await onSubmit({
        location,
        disasterType: selectedType!,
        description,
      });

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message);
        resetForm();
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setLocation("");
    setSelectedType(null);
    setDescription("");
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleReset = () => {
    resetForm();
    setErrors(null);
    setErrorMessage("");
  };

  const getFieldError = (field: string): string | undefined => {
    return errors?.[field]?.[0];
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#102419]/85 p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9A441]">
          Community Report
        </div>
        <h3 className="mt-1 text-xl font-semibold text-[#F4EFE4]">
          Report an incident
        </h3>
        <p className="mt-1.5 text-[13px] text-[#8AA68F]">
          Enter your location and hazard type to alert the nearest response team and feed the risk model.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Input */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#B7CBB2]">
            Your location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Sonapur Ridge, Guwahati"
            disabled={isLoading || submitting}
            className={`w-full rounded-xl border bg-[#173123]/90 px-4 py-3 text-[13px] text-[#F4EFE4] placeholder-[#8AA68F]/60 outline-none transition-all ${
              getFieldError("location")
                ? "border-red-500/70"
                : "border-white/10 focus:border-[#E08A3E] focus:bg-[#1A3828]"
            }`}
          />
          {getFieldError("location") && (
            <p className="mt-1 text-[11px] font-medium text-red-300">
              {getFieldError("location")}
            </p>
          )}
        </div>

        {/* Disaster Type Selection */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#B7CBB2]">
            Disaster type
          </label>
          <div className="grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
            {disasterTypes.map((dtype) => {
              const isSelected = selectedType === dtype.type;
              return (
                <button
                  key={dtype.type}
                  type="button"
                  onClick={() => setSelectedType(dtype.type)}
                  disabled={isLoading || submitting}
                  className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                    isSelected
                      ? "border-[#E08A3E] bg-[#E08A3E]/20 text-[#F4EFE4] shadow-md shadow-[#E08A3E]/10"
                      : "border-white/10 bg-[#173123]/80 text-[#B7CBB2] hover:border-[#E08A3E]/50 hover:bg-[#1C3A29] hover:text-[#F4EFE4]"
                  } disabled:opacity-50`}
                >
                  <div className="mb-1.5 text-[22px]">{dtype.icon}</div>
                  <div className="text-[12px] font-semibold">{dtype.type}</div>
                </button>
              );
            })}
          </div>
          {getFieldError("disasterType") && (
            <p className="mt-1 text-[11px] font-medium text-red-300">
              {getFieldError("disasterType")}
            </p>
          )}
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#B7CBB2]">
            Additional details (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the hazard conditions, blockage, or urgent requirements..."
            disabled={isLoading || submitting}
            maxLength={500}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-[#173123]/90 px-4 py-3 text-[13px] text-[#F4EFE4] placeholder-[#8AA68F]/60 outline-none transition-all focus:border-[#E08A3E] focus:bg-[#1A3828]"
          />
          <div className="mt-1 text-[11px] text-[#8AA68F] text-right">
            {description.length}/500 characters
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-xs font-medium text-red-200">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-400/40 bg-emerald-950/50 px-4 py-3 text-xs font-medium text-emerald-200">
            <span>✓</span>
            {successMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || submitting || !location || !selectedType}
            className="flex-1 rounded-xl border border-[#E08A3E]/40 bg-gradient-to-r from-[#C98A3C] via-[#E3A63F] to-[#F2A93D] px-5 py-3 text-[13px] font-bold text-[#102419] shadow-lg shadow-[#E3A63F]/20 transition-all hover:scale-[1.01] hover:shadow-[#E3A63F]/35 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#102419] border-t-transparent" />
                Transmitting report...
              </span>
            ) : (
              "Submit report"
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading || submitting}
            className="rounded-xl border border-white/10 bg-[#173123]/80 px-5 py-3 text-[13px] font-semibold text-[#B7CBB2] transition-colors hover:border-white/20 hover:text-[#F4EFE4] hover:bg-[#1C3A29] disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
