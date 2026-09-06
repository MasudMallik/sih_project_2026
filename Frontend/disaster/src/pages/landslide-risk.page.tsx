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
    validRangeText: "0 – 2",
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

    // Run real-time Zod validation on change
    const validation = validateLandslideRiskForm(updatedValues);
    setErrors(validation.errors ?? {});
  };

  const applyPreset = (presetValues: LandslideRiskFormData) => {
    setValues(presetValues);
    const validation = validateLandslideRiskForm(presetValues);
    setErrors(validation.errors ?? {});
    setAssessment(null);
    setServerError(null);
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
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
            <span className="hidden h-5 w-[1px] bg-[#223B29] sm:inline-block" />
            <span className="hidden items-center gap-2 rounded-full border border-[#C98A3C]/30 bg-[#C98A3C]/10 px-3 py-1 text-xs font-semibold text-[#E3A63F] sm:inline-flex">
              <BrainCircuit size={13} />
              AI Risk Engine v2.4 (Zod Validated)
            </span>
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
              Geotechnical Inference Model
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#B7CBB2] sm:text-base">
              Enter the validated environmental and geological metrics below. All inputs default to{" "}
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-[#E3A63F]">0</code> and
              are strictly enforced with Zod schemas.
            </p>

            {/* Quick Presets */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8AA68F]">
                Quick Scenarios:
              </span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset.values)}
                  className="rounded-lg border border-[#2A4632] bg-[#162D1F]/90 px-3 py-1.5 text-xs font-semibold text-[#E5ECE3] shadow-sm transition-all hover:border-[#C98A3C] hover:bg-[#1E3B29] cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A4632] bg-[#162D1F]/60 px-3 py-1.5 text-xs font-medium text-[#8AA68F] transition-colors hover:border-red-400/40 hover:bg-red-950/20 hover:text-red-300 cursor-pointer"
              >
                <RotateCcw size={12} />
                Reset (Default: 0)
              </button>
            </div>
          </div>
        </section>

        {/* Form and AI Result Display */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Input Form */}
          <section className="rounded-3xl border border-[#223B29] bg-[#132A1C]/90 p-6 shadow-xl backdrop-blur-md sm:p-8 lg:col-span-7">
            <div className="mb-6 flex items-center justify-between border-b border-[#223B29] pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#C98A3C]/15 p-2.5 text-[#E3A63F]">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F4EFE4]">Input Parameters</h2>
                  <p className="text-xs text-[#8AA68F]">
                    Strict Zod validation enforces permissible value boundaries
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handlePredict();
              }}
              noValidate
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {FIELDS.map(
                  ({
                    key,
                    label,
                    unit,
                    validRangeText,
                    icon: Icon,
                    iconClass,
                    step,
                    tooltip,
                  }) => {
                    const hasError = Boolean(errors[key]);
                    return (
                      <div key={key} className="flex flex-col">
                        <div className="mb-1.5 flex items-center justify-between">
                          <label
                            htmlFor={key}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#E5ECE3]"
                          >
                            <Icon size={14} className={iconClass} aria-hidden="true" />
                            <span>{label}</span>
                            <span className="font-normal text-[#8AA68F]">({unit})</span>
                          </label>
                          <span
                            className="cursor-help text-xs font-semibold text-[#E3A63F]/90 hover:text-[#E3A63F]"
                            title={tooltip}
                          >
                            [{validRangeText}]
                          </span>
                        </div>

                        <div className="relative">
                          <input
                            id={key}
                            name={key}
                            type="number"
                            step={step}
                            value={values[key]}
                            onChange={(event) => updateField(key, event.target.value)}
                            className={`w-full rounded-xl border bg-[#0E1F17]/80 px-3.5 py-2.5 text-sm font-medium text-[#F4EFE4] outline-none transition-all ${
                              hasError
                                ? "border-red-500/80 bg-red-950/30 text-red-100 focus:border-red-400"
                                : "border-[#2A4632] focus:border-[#C98A3C] focus:bg-[#0E1F17]"
                            }`}
                            placeholder="0"
                          />
                        </div>

                        {hasError && (
                          <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-400">
                            <AlertTriangle size={11} className="shrink-0" />
                            {errors[key]}
                          </span>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {serverError && (
                <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-xs font-medium text-red-200">
                  <AlertOctagon size={18} className="shrink-0 text-red-400" />
                  <span>{serverError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPredicting}
                className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E08A3E]/50 bg-gradient-to-r from-[#C98A3C] via-[#E3A63F] to-[#F2A93D] px-6 py-3.5 text-sm font-bold text-[#102419] shadow-lg shadow-[#E3A63F]/20 transition-all hover:scale-[1.01] hover:shadow-[#E3A63F]/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isPredicting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#102419] border-t-transparent" />
                    <span>Validating & Running Prediction…</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit size={19} className="text-[#102419]" />
                    <span>Predict Landslide Risk</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Assessment & AI Results Card */}
          <section className="flex flex-col gap-6 lg:col-span-5">
            {assessment ? (
              <div
                className={`overflow-hidden rounded-3xl border p-6 shadow-2xl transition-all sm:p-8 ${
                  assessment.riskLevel === "High"
                    ? "border-red-500/40 bg-[#2A1111]/90 shadow-red-950/30"
                    : assessment.riskLevel === "Moderate"
                    ? "border-amber-500/40 bg-[#29200F]/90 shadow-amber-950/30"
                    : "border-emerald-500/40 bg-[#0F2618]/90 shadow-emerald-950/30"
                }`}
              >
                {/* Result Status Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-2xl p-3 ${
                        assessment.riskLevel === "High"
                          ? "bg-red-500/20 text-red-400"
                          : assessment.riskLevel === "Moderate"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {assessment.riskLevel === "High" ? (
                        <AlertOctagon size={28} />
                      ) : assessment.riskLevel === "Moderate" ? (
                        <AlertTriangle size={28} />
                      ) : (
                        <ShieldCheck size={28} />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8AA68F]">
                        Inference Result
                      </span>
                      <h3 className="text-2xl font-bold text-[#F4EFE4]">
                        {assessment.riskLevel} Risk
                      </h3>
                    </div>
                  </div>

                  <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-[#B7CBB2]">
                    {assessment.evaluatedAt}
                  </span>
                </div>

                {/* Probability Meter */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#8AA68F]">AI Probability Score</span>
                    <span
                      className={`text-base font-extrabold ${
                        assessment.riskLevel === "High"
                          ? "text-red-400"
                          : assessment.riskLevel === "Moderate"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {assessment.probability.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-[#162D1F]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        assessment.riskLevel === "High"
                          ? "bg-gradient-to-r from-orange-500 to-red-500"
                          : assessment.riskLevel === "Moderate"
                          ? "bg-gradient-to-r from-amber-500 to-orange-400"
                          : "bg-gradient-to-r from-teal-500 to-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, assessment.probability))}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#6C7D6A]">
                    <span>0% (Safe)</span>
                    <span>50% (Hazard Threshold)</span>
                    <span>100% (Critical)</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#F4EFE4]">
                    <Zap size={14} className="text-[#E3A63F]" />
                    <span>Tactical Recommendation</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#D6DFD4]">
                    {assessment.recommendation}
                  </p>
                </div>

                {/* Direct Action Links */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/risk-map")}
                    className="flex-1 rounded-xl border border-[#2A4632] bg-[#162D1F] py-2.5 text-center text-xs font-bold text-[#E5ECE3] transition-colors hover:border-[#C98A3C] hover:bg-[#1E3B29] cursor-pointer"
                  >
                    View Live Risk Map
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/emergency-response")}
                    className="flex-1 rounded-xl border border-red-500/30 bg-red-950/40 py-2.5 text-center text-xs font-bold text-red-200 transition-colors hover:bg-red-900/50 cursor-pointer"
                  >
                    Response Center
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#223B29] bg-[#132A1C]/50 p-8 text-center sm:p-12">
                <div className="mb-4 rounded-2xl bg-[#1E3B29] p-4 text-[#8AA68F]">
                  <BrainCircuit size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-[#F4EFE4]">Ready for Inference</h3>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#8AA68F]">
                  All inputs are initialized to <span className="text-[#E3A63F]">0</span>. Fill in the
                  values within the specified ranges or select a quick scenario, then click &quot;Predict Landslide Risk&quot;.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 text-left text-xs text-[#8AA68F]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Rainfall: 50 – 300 mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Slope Angle: 50 – 60°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Soil Saturation & Vegetation: 0 – 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Earthquake: 0 – 7 | Water: 0 – 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Soil Types (Gravel, Sand, Silt): 0 or 1</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
