import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  CloudRain,
  Droplet,
  FileText,
  Grip,
  Leaf,
  Mountain,
  RotateCcw,
  Rows3,
  ShieldCheck,
  Sparkle,
  Waves,
  Zap,
} from "lucide-react";
import backgroundImage from "../assets/bg2.jpg";
import { Brand } from "../components/GeoRakshakHeader";
import type {
  LandslideRiskFormData,
  LandslideRiskAssessment,
} from "../@types/interface/landslide-risk";
import {
  validateLandslideRiskForm,
  type LandslideRiskFormErrors,
} from "../validations/landslide-risk.validation";
import { predictLandslideRisk } from "../services/landslideRisk.service";

type FieldKey = keyof LandslideRiskFormData;

interface FieldConfig {
  key: FieldKey;
  label: string;
  unit: string;
  validRangeText: string;
  icon: typeof CloudRain;
  iconClass: string;
  min: number;
  max: number;
  step: number;
  tooltip: string;
  isBinary?: boolean;
}

const FIELDS: FieldConfig[] = [
  {
    key: "rainfall",
    label: "Rainfall",
    unit: "mm",
    validRangeText: "50 – 300 mm",
    icon: CloudRain,
    iconClass: "text-[#6FA8DC]",
    min: 50,
    max: 300,
    step: 1,
    tooltip: "Valid range: 50 to 300 mm precipitation",
  },
  {
    key: "slopeAngle",
    label: "Slope Angle",
    unit: "degrees",
    validRangeText: "50 – 60°",
    icon: Mountain,
    iconClass: "text-emerald-400",
    min: 50,
    max: 60,
    step: 0.5,
    tooltip: "Valid range: 50 to 60 degrees incline",
  },
  {
    key: "soilSaturation",
    label: "Soil Saturation",
    unit: "ratio",
    validRangeText: "0 – 1",
    icon: Droplet,
    iconClass: "text-[#4FB8C4]",
    min: 0,
    max: 1,
    step: 0.05,
    tooltip: "Valid range: 0 to 1 soil moisture saturation ratio",
  },
  {
    key: "vegetationCover",
    label: "Vegetation Cover",
    unit: "ratio",
    validRangeText: "0 – 1",
    icon: Leaf,
    iconClass: "text-emerald-400",
    min: 0,
    max: 1,
    step: 0.05,
    tooltip: "Valid range: 0 to 1 vegetation density ratio",
  },
  {
    key: "earthquakeActivity",
    label: "Earthquake Activity",
    unit: "magnitude",
    validRangeText: "0 – 7",
    icon: Activity,
    iconClass: "text-amber-400",
    min: 0,
    max: 7,
    step: 0.1,
    tooltip: "Valid range: 0 to 7 seismic magnitude",
  },
  {
    key: "proximityToWater",
    label: "Proximity to Water",
    unit: "km",
    validRangeText: "0 – 2 km",
    icon: Waves,
    iconClass: "text-[#6FA8DC]",
    min: 0,
    max: 2,
    step: 0.1,
    tooltip: "Valid range: 0 to 2 km proximity index",
  },
  {
    key: "soilGravel",
    label: "Soil Type: Gravel",
    unit: "binary",
    validRangeText: "0 or 1",
    icon: Grip,
    iconClass: "text-[#9FB3A0]",
    min: 0,
    max: 1,
    step: 1,
    tooltip: "Valid value: 0 (No) or 1 (Yes)",
    isBinary: true,
  },
  {
    key: "soilSand",
    label: "Soil Type: Sand",
    unit: "binary",
    validRangeText: "0 or 1",
    icon: Sparkle,
    iconClass: "text-amber-300",
    min: 0,
    max: 1,
    step: 1,
    tooltip: "Valid value: 0 (No) or 1 (Yes)",
    isBinary: true,
  },
  {
    key: "soilSilt",
    label: "Soil Type: Silt",
    unit: "binary",
    validRangeText: "0 or 1",
    icon: Rows3,
    iconClass: "text-orange-400",
    min: 0,
    max: 1,
    step: 1,
    tooltip: "Valid value: 0 (No) or 1 (Yes)",
    isBinary: true,
  },
];

const DEFAULT_VALUES: LandslideRiskFormData = {
  rainfall: 0,
  slopeAngle: 0,
  soilSaturation: 0,
  vegetationCover: 0,
  earthquakeActivity: 0,
  proximityToWater: 0,
  soilGravel: 0,
  soilSand: 0,
  soilSilt: 0,
};

const PRESETS = [
  {
    name: "🌧️ High Hazard Scenario",
    values: {
      rainfall: 260,
      slopeAngle: 58,
      soilSaturation: 0.95,
      vegetationCover: 0.12,
      earthquakeActivity: 5.4,
      proximityToWater: 0.3,
      soilGravel: 0,
      soilSand: 0,
      soilSilt: 1,
    },
  },
  {
    name: "⚠️ Moderate Slope Scenario",
    values: {
      rainfall: 160,
      slopeAngle: 54,
      soilSaturation: 0.65,
      vegetationCover: 0.45,
      earthquakeActivity: 2.8,
      proximityToWater: 0.9,
      soilGravel: 0,
      soilSand: 1,
      soilSilt: 0,
    },
  },
  {
    name: "🛡️ Stable Terrain Scenario",
    values: {
      rainfall: 60,
      slopeAngle: 51,
      soilSaturation: 0.15,
      vegetationCover: 0.90,
      earthquakeActivity: 0.4,
      proximityToWater: 1.8,
      soilGravel: 1,
      soilSand: 0,
      soilSilt: 0,
    },
  },
];

export default function LandslideRiskPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<LandslideRiskFormData>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<LandslideRiskFormErrors>({});
  const [isPredicting, setIsPredicting] = useState(false);
  const [assessment, setAssessment] = useState<LandslideRiskAssessment | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = (key: FieldKey, raw: string) => {
    const parsed = raw === "" ? 0 : Number(raw);
    const updatedValues = {
      ...values,
      [key]: Number.isNaN(parsed) ? 0 : parsed,
    };
    setValues(updatedValues);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const applyPreset = (presetValues: LandslideRiskFormData) => {
    setValues({ ...presetValues });
    setErrors({});
    setAssessment(null);
    setServerError(null);
  };

  const handleReset = () => {
    setValues({
      rainfall: 0,
      slopeAngle: 0,
      soilSaturation: 0,
      vegetationCover: 0,
      earthquakeActivity: 0,
      proximityToWater: 0,
      soilGravel: 0,
      soilSand: 0,
      soilSilt: 0,
    });
    setErrors({});
    setAssessment(null);
    setServerError(null);
  };

  const handlePredict = async () => {
    setServerError(null);

    // Validate all fields strictly via Zod schema
    const validation = validateLandslideRiskForm(values);
    if (!validation.valid || !validation.data) {
      setErrors(validation.errors ?? {});
      return;
    }

    setErrors({});
    setIsPredicting(true);

    try {
      const result = await predictLandslideRisk(validation.data);
      setAssessment(result);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to run AI prediction. Please try again."
      );
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1F17] font-body text-[#F4EFE4] antialiased selection:bg-[#C98A3C]/30 selection:text-[#F4EFE4]">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#223B29] bg-[#0E1F17]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 lg:px-9">
          <div className="flex items-center gap-6">
            <Brand />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl border border-[#223B29] bg-[#162D1F] px-4 py-2 text-xs font-semibold text-[#B7CBB2] transition-colors hover:border-[#C98A3C]/40 hover:bg-[#1C3A27] hover:text-[#F4EFE4] cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-6 py-8 lg:px-9 lg:py-10">
        {/* Hero Section Banner */}
        <section
          className="relative mb-8 overflow-hidden rounded-3xl border border-[#223B29] bg-[#132A1C] p-8 shadow-2xl lg:p-10"
          style={{
            backgroundImage: `linear-gradient(105deg, rgba(14,31,23,0.96) 0%, rgba(14,31,23,0.85) 50%, rgba(14,31,23,0.4) 100%), url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#C98A3C]/40 bg-[#C98A3C]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E3A63F]">
              <Zap size={13} />
              AI-Based Landslide Risk Assessment
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#F4EFE4] sm:text-3xl lg:text-4xl">
              Predict Landslide Vulnerability
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#B7CBB2] sm:text-base">
              Submit geological, seismic, and hydrological telemetry to run real-time inference through the trained Random Forest AI early warning model.
            </p>
          </div>
        </section>

        {/* Preset Scenarios */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8AA68F]">
              Quick Load Preset Hazard Scenarios
            </h2>
            <span className="text-xs text-[#8AA68F]/70">Click to autofill valid telemetry</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.values)}
                className="flex items-center justify-between rounded-2xl border border-[#223B29] bg-[#132A1C]/80 px-4 py-3 text-left transition-all hover:border-[#C98A3C]/50 hover:bg-[#1A3624] hover:shadow-lg cursor-pointer"
              >
                <span className="text-sm font-semibold text-[#F4EFE4]">{preset.name}</span>
                <span className="rounded-md bg-[#0E1F17] px-2 py-0.5 text-[10px] font-bold text-[#C98A3C]">
                  LOAD
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Input Form & Results Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Parameter Inputs Area */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#223B29] bg-[#132A1C]/90 p-6 shadow-xl sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#223B29] pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#F4EFE4]">
                    Geotechnical & Climate Parameters
                  </h2>
                  <p className="text-xs text-[#8AA68F]">
                    All 9 parameters are strictly required by the Random Forest model
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#223B29] px-3 py-1.5 text-xs font-medium text-[#8AA68F] transition-colors hover:bg-[#1A3624] hover:text-[#F4EFE4] cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              {serverError && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200">
                  <AlertOctagon size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <div>
                    <strong className="font-semibold text-red-300">Assessment Error: </strong>
                    {serverError}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {FIELDS.map((field) => {
                  const Icon = field.icon;
                  const error = errors[field.key];
                  const value = values[field.key];

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={field.key}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#D3E0D0]"
                        >
                          <Icon size={14} className={field.iconClass} />
                          <span>{field.label}</span>
                        </label>
                        <span className="text-[11px] text-[#8AA68F]/80">
                          {field.validRangeText}
                        </span>
                      </div>

                      {field.isBinary ? (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "0 — No", val: 0 },
                            { label: "1 — Yes", val: 1 },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => updateField(field.key, String(opt.val))}
                              className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                                value === opt.val
                                  ? "border-[#38E07B] bg-[#38E07B]/15 text-[#38E07B] shadow-inner"
                                  : "border-[#223B29] bg-[#0E1F17] text-[#8AA68F] hover:bg-[#162D1F]"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            id={field.key}
                            type="number"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={value}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            className={`w-full rounded-xl border bg-[#0E1F17] px-3.5 py-2.5 text-sm text-[#F4EFE4] placeholder-[#4F6854] outline-none transition-all focus:border-[#38E07B] focus:ring-2 focus:ring-[#38E07B]/20 ${
                              error ? "border-red-500/70 bg-red-950/20" : "border-[#223B29]"
                            }`}
                            placeholder={`e.g. ${field.min}`}
                          />
                          <span className="pointer-events-none absolute right-3.5 top-2.5 text-xs text-[#8AA68F]">
                            {field.unit}
                          </span>
                        </div>
                      )}

                      {error && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-red-400">
                          <AlertTriangle size={11} />
                          <span>{error}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Submit Button */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={isPredicting}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#38E07B] to-[#25B55E] px-6 py-4 text-sm font-bold text-[#09170E] shadow-xl transition-all hover:opacity-95 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isPredicting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#09170E] border-t-transparent" />
                      <span>Running Random Forest Model Inference...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={18} />
                      <span>Run AI Risk Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Assessment Results Area */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="overflow-hidden rounded-3xl border border-[#223B29] bg-[#132A1C]/90 p-6 shadow-xl sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-[#223B29] pb-4">
                  <h3 className="font-display text-lg font-bold text-[#F4EFE4]">
                    AI Risk Diagnosis
                  </h3>
                  <span className="rounded-full bg-[#38E07B]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#38E07B]">
                    LIVE MODEL
                  </span>
                </div>

                {!assessment ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#223B29] bg-[#0E1F17] text-[#8AA68F]">
                      <FileText size={24} />
                    </div>
                    <h4 className="text-sm font-semibold text-[#F4EFE4]">
                      Awaiting Input Telemetry
                    </h4>
                    <p className="mt-1 max-w-xs text-xs text-[#8AA68F]">
                      Fill in the 9 parameters or select a quick preset scenario to trigger the ML classification engine.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Severity Card */}
                    <div
                      className={`rounded-2xl border p-5 ${
                        assessment.riskLevel === "Critical"
                          ? "border-red-500/50 bg-red-950/30 text-red-200"
                          : assessment.riskLevel === "High"
                          ? "border-orange-500/50 bg-orange-950/30 text-orange-200"
                          : assessment.riskLevel === "Moderate"
                          ? "border-amber-500/50 bg-amber-950/30 text-amber-200"
                          : "border-emerald-500/50 bg-emerald-950/30 text-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                          Assessed Risk Level
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${
                            assessment.riskLevel === "Critical"
                              ? "bg-red-500 text-black"
                              : assessment.riskLevel === "High"
                              ? "bg-orange-500 text-black"
                              : assessment.riskLevel === "Moderate"
                              ? "bg-amber-400 text-black"
                              : "bg-emerald-400 text-black"
                          }`}
                        >
                          {assessment.riskLevel}
                        </span>
                      </div>

                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="font-display text-4xl font-extrabold tracking-tight text-[#F4EFE4]">
                          {assessment.riskLevel === "Critical"
                            ? "Hazard Alert"
                            : assessment.riskLevel === "High"
                            ? "Elevated Risk"
                            : assessment.riskLevel === "Moderate"
                            ? "Moderate Alert"
                            : "Stable Terrain"}
                        </span>
                      </div>
                    </div>

                    {/* Operational Safety Recommendation */}
                    <div className="rounded-2xl border border-[#223B29] bg-[#0E1F17] p-4.5">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38E07B]">
                        <ShieldCheck size={14} />
                        Operational Action Directive
                      </div>
                      <p className="text-xs leading-relaxed text-[#D3E0D0]">
                        {assessment.recommendation}
                      </p>
                    </div>

                    {/* Model Metadata */}
                    <div className="rounded-2xl border border-[#223B29] bg-[#0E1F17]/60 p-4">
                      <div className="flex items-center justify-between text-xs text-[#8AA68F]">
                        <span>Model Classifier</span>
                        <span className="font-semibold text-[#F4EFE4]">RandomForestClassifier</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-[#8AA68F]">
                        <span>Evaluated At</span>
                        <span className="font-semibold text-[#F4EFE4]">{assessment.evaluatedAt}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Protocol Note */}
              <div className="rounded-2xl border border-[#223B29] bg-[#0E1F17] p-5 text-xs text-[#8AA68F]">
                <div className="mb-1 flex items-center gap-1.5 font-semibold text-[#F4EFE4]">
                  <CheckCircle2 size={13} className="text-[#38E07B]" />
                  <span>Verified Geotechnical Envelope</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-[#8AA68F]">
                  In accordance with disaster monitoring protocol, calculations adhere to valid parameter envelopes (Rainfall: 50–300 mm, Slope: 50–60°, Soil Saturation: 0–1, Earthquakes: 0–7 magnitude).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
