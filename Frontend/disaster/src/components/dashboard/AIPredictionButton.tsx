import { Zap } from "lucide-react";
import { useNavigate } from "react-router";

interface AIPredictionButtonProps {
  disabled?: boolean;
}

export function AIPredictionButton({ disabled = false }: AIPredictionButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the AI Analysis page
    navigate("/ai-assistant");
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="group relative inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-[#E3A63F] to-[#F2A93D] px-6 py-3 font-semibold text-[#1B1204] transition-all duration-300 hover:shadow-lg hover:shadow-[#E3A63F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Open AI Prediction Analysis"
    >
      <Zap size={20} className="transition-transform group-hover:scale-110" />
      <span>AI Prediction Analysis</span>
      <div className="absolute inset-0 rounded-lg bg-white/0 transition-all group-hover:bg-white/10" />
    </button>
  );
}
