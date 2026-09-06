import { Zap } from "lucide-react";

interface AIPredictionButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function AIPredictionButton({
  disabled = false,
  onClick,
}: AIPredictionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative inline-flex items-center gap-2.5 rounded-xl border border-[#E08A3E]/50 bg-gradient-to-r from-[#C98A3C] via-[#E3A63F] to-[#F2A93D] px-5 py-2.5 text-sm font-bold text-[#102419] shadow-lg shadow-[#E3A63F]/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-[#E3A63F]/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="AI Risk Prediction"
    >
      <Zap size={18} className="fill-[#102419] transition-transform group-hover:rotate-12" />
      <span>AI Risk Prediction</span>
    </button>
  );
}
