import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CloudRain,
  Droplet,
  FileText,
  Grip,
  Leaf,
  Mountain,
  Rows3,
  Sparkle,
  Waves,
} from "lucide-react";
import backgroundImage from "../assets/bg2.jpg";
import { Brand } from "../components/GeoRakshakHeader";

type FieldKey =
  | "rainfall"
  | "slopeAngle"
  | "soilSaturation"
  | "vegetationCover"
  | "earthquakeActivity"
  | "proximityToWater"
  | "soilGravel"
  | "soilSand"
  | "soilSilt";

const FIELDS: Array<{ key: FieldKey; label: string; unit: string; icon: typeof CloudRain; iconClass: string }> = [
  { key: "rainfall", label: "Rainfall", unit: "mm", icon: CloudRain, iconClass: "text-[#6FA8DC]" },
  { key: "slopeAngle", label: "Slope Angle", unit: "degrees", icon: Mountain, iconClass: "text-moss" },
  { key: "soilSaturation", label: "Soil Saturation", unit: "%", icon: Droplet, iconClass: "text-[#4FB8C4]" },
  { key: "vegetationCover", label: "Vegetation Cover", unit: "%", icon: Leaf, iconClass: "text-moss" },
  { key: "earthquakeActivity", label: "Earthquake Activity", unit: "magnitude", icon: Activity, iconClass: "text-clay-light" },
  { key: "proximityToWater", label: "Proximity to Water", unit: "m", icon: Waves, iconClass: "text-[#6FA8DC]" },
  { key: "soilGravel", label: "Soil Type - Gravel", unit: "%", icon: Grip, iconClass: "text-[#9FB3A0]" },
  { key: "soilSand", label: "Soil Type - Sand", unit: "%", icon: Sparkle, iconClass: "text-gold" },
  { key: "soilSilt", label: "Soil Type - Silt", unit: "%", icon: Rows3, iconClass: "text-clay" },
];

const initialValues: Record<FieldKey, number> = {
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

export default function LandslideRiskPage() {
  const [values, setValues] = useState(initialValues);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const updateField = (key: FieldKey, raw: string) => {
    const parsed = raw === "" ? 0 : Number(raw);
    setValues((current) => ({ ...current, [key]: Number.isNaN(parsed) ? current[key] : parsed }));
    setResult(null);
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setResult(null);
    // Placeholder scoring — swap for a real model/service call when one exists.
    window.setTimeout(() => {
      const score =
        values.rainfall * 0.25 +
        values.slopeAngle * 1.2 +
        values.soilSaturation * 0.8 +
        values.earthquakeActivity * 8 -
        values.vegetationCover * 0.6;
      const level = score > 120 ? "High" : score > 60 ? "Moderate" : "Low";
      setResult(level);
      setIsPredicting(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-forest-dark font-body text-cream">
      <header className="border-b border-[rgba(244,239,228,0.16)] bg-[rgba(14,31,23,0.92)]">
        <div className="mx-auto max-w-[1180px] px-8 py-[18px] max-[520px]:px-5">
          <Brand />
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-12">
        {/* Hero banner */}
        <section
          className="mb-8 flex flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center p-8 shadow-2xl sm:flex-row sm:items-center sm:p-10"
          style={{
            backgroundImage: `linear-gradient(100deg, rgba(9,20,14,0.92) 0%, rgba(9,20,14,0.72) 45%, rgba(9,20,14,0.35) 100%), url(${backgroundImage})`,
          }}
        >
          <div className="relative shrink-0">
            <Mountain size={44} className="text-cream" strokeWidth={1.5} />
            <AlertTriangle size={18} className="absolute -bottom-1 -right-1 fill-gold text-forest-dark" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-[28px]">
              AI-Based Landslide Risk Monitoring System
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-cream-dim">
              Enter the environmental and geological parameters below to predict the landslide risk in the region.
            </p>
          </div>
        </section>

        {/* Input parameters card */}
        <section className="rounded-2xl border border-white/10 bg-[#102419]/85 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-7 flex items-start gap-3">
            <div className="rounded-lg bg-gold/10 p-2 text-gold">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-cream">Input Parameters</h2>
              <p className="mt-0.5 text-sm text-moss">Provide the values for the following factors:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map(({ key, label, unit, icon: Icon, iconClass }) => (
              <div key={key}>
                <label htmlFor={key} className="mb-2 flex items-center gap-2 text-sm font-medium text-cream">
                  <Icon size={16} className={iconClass} aria-hidden="true" />
                  {label}
                  <span className="font-normal text-[#6C7D6A]">({unit})</span>
                </label>
                <input
                  id={key}
                  type="number"
                  inputMode="decimal"
                  value={values[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#173123]/80 px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePredict}
            disabled={isPredicting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold text-[#1B1204] shadow-[0_8px_20px_rgba(201,138,60,0.25)] transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            <BrainCircuit size={18} aria-hidden="true" />
            {isPredicting ? "Predicting…" : "Predict Landslide Risk"}
          </button>

          {result && (
            <div
              role="status"
              className={`mt-5 rounded-lg border px-4 py-3 text-sm font-medium ${
                result === "High"
                  ? "border-red-400/30 bg-red-950/40 text-[#f0a69e]"
                  : result === "Moderate"
                  ? "border-gold/30 bg-gold/10 text-gold"
                  : "border-emerald-400/30 bg-emerald-950/30 text-emerald-300"
              }`}
            >
              Predicted risk level: {result}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
