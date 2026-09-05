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
        `${selectedType} reported at ${location}. Nearest team notified.`
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
    <div className="rounded-lg border border-[#223B29] bg-[#16281C] p-6">
      {/* Header */}
      <div className="mb-5">
        <h3 className="mb-1 text-[15px] font-semibold text-[#EAE7DA]">
          Report an incident
        </h3>
        <p className="text-[12px] text-[#93A490]">
          Enter your location, then choose what's happening. It reaches the
          nearest response team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Input */}
        <div>
          <label className="mb-1.5 block text-[11px] text-[#6C7D6A]">
            Your location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Sonapur Ridge, Guwahati"
            disabled={isLoading || submitting}
            className={`w-full rounded border bg-[#1D3423] px-3.5 py-3 text-[13px] text-[#EAE7DA] placeholder-[#6C7D6A] outline-none transition-colors ${
              getFieldError("location")
                ? "border-[#C0392B]"
                : "border-[#2A4632] focus:border-[#E08A3E]"
            }`}
          />
          {getFieldError("location") && (
            <p className="mt-1 text-[11px] text-[#E8756A]">
              {getFieldError("location")}
            </p>
          )}
        </div>

        {/* Disaster Type Selection */}
        <div>
          <label className="mb-1.5 block text-[11px] text-[#6C7D6A]">
            Disaster type
          </label>
          <div className="grid grid-cols-4 gap-2 max-md:grid-cols-2">
            {disasterTypes.map((dtype) => (
              <button
                key={dtype.type}
                type="button"
                onClick={() => setSelectedType(dtype.type)}
                disabled={isLoading || submitting}
                className={`rounded border p-3 text-center transition-all ${
                  selectedType === dtype.type
                    ? "border-[#E08A3E] bg-[rgba(224,138,62,0.15)] text-[#E08A3E]"
                    : "border-[#2A4632] bg-[#1D3423] text-[#93A490] hover:border-[#E08A3E] hover:text-[#E08A3E]"
                } disabled:opacity-50`}
              >
                <div className="mb-1.5 text-[18px]">{dtype.icon}</div>
                <div className="text-[11px] font-medium">{dtype.type}</div>
              </button>
            ))}
          </div>
          {getFieldError("disasterType") && (
            <p className="mt-1 text-[11px] text-[#E8756A]">
              {getFieldError("disasterType")}
            </p>
          )}
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="mb-1.5 block text-[11px] text-[#6C7D6A]">
            Additional details (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the situation in detail..."
            disabled={isLoading || submitting}
            maxLength={500}
            rows={3}
            className="w-full rounded border border-[#2A4632] bg-[#1D3423] px-3.5 py-3 text-[13px] text-[#EAE7DA] placeholder-[#6C7D6A] outline-none transition-colors focus:border-[#E08A3E]"
          />
          <div className="mt-1 text-[10px] text-[#6C7D6A]">
            {description.length}/500 characters
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded border border-[#C0392B] bg-[rgba(192,57,43,0.1)] px-3 py-2.5 text-[12px] text-[#E8756A]">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2.5 rounded border border-[rgba(92,151,100,0.35)] bg-[rgba(92,151,100,0.1)] px-3 py-2.5 text-[12px] text-[#5C9764]">
            <span>✓</span>
            {successMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || submitting || !location || !selectedType}
            className="flex-1 rounded border-none bg-[#E08A3E] px-4.5 py-3 text-[13px] font-semibold text-[#17280F] transition-colors hover:bg-[#ea9950] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Submitting...
              </>
            ) : (
              "Submit report"
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading || submitting}
            className="rounded border border-[#2A4632] bg-transparent px-4.5 py-3 text-[13px] font-semibold text-[#93A490] transition-colors hover:border-[#E08A3E] hover:text-[#E08A3E] disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
