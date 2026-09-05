import type { SOSState } from "../../@types/interface/dashboard";

interface SOSButtonProps {
  state?: SOSState;
  onTap?: () => void;
  disabled?: boolean;
}

export function SOSButton({
  state = "idle",
  onTap,
  disabled = false,
}: SOSButtonProps) {
  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isError = state === "error";

  const getButtonText = () => {
    if (isSuccess) return "✓";
    if (isError) return "!";
    return "SOS";
  };

  const getCaption = () => {
    if (isSuccess) return "Calling 1078 — help is on the way";
    if (isError) return "Error — Please try again or call 1078";
    return "Tap for Emergency";
  };

  const getButtonClasses = () => {
    let base =
      "h-[204px] w-[204px] rounded-full border-[8px] border-[#713020] text-[38px] font-bold tracking-wide cursor-pointer transition-all";

    if (isSuccess) {
      return (
        base + " bg-gradient-to-br from-[#6FAE77] to-[#3F7A48] text-white text-[44px]"
      );
    }

    if (isError) {
      return (
        base +
        " bg-gradient-to-br from-[#E9584A] to-[#C0392B] text-white animate-pulse"
      );
    }

    if (isLoading) {
      return (
        base +
        " bg-gradient-to-br from-[#E9584A] to-[#C0392B] text-white opacity-75"
      );
    }

    return (
      base +
      " bg-gradient-to-br from-[#E9584A] to-[#C0392B] text-white animate-pulse shadow-[0_10px_30px_rgba(192,57,43,0.35)]"
    );
  };

  return (
    <section className="flex min-h-[370px] w-full flex-col items-center justify-center border-y border-[#223B29] bg-[#102519] px-6 py-8 text-center">
      <button
        onClick={onTap}
        disabled={disabled || isLoading}
        className={getButtonClasses()}
      >
        {isLoading ? (
          <span className="inline-block animate-spin">⟳</span>
        ) : (
          getButtonText()
        )}
      </button>

      <div className="mt-4 text-[17px] font-semibold text-[#EAE7DA]">
        {getCaption()}
      </div>

      <div className="mt-2 max-w-[460px] text-[14px] leading-5 text-[#93A490]">
        Shares your live location with the nearest rescue team the moment you
        tap
      </div>

      {isError && (
        <div className="mt-4 text-[12px] text-[#E8756A]">
          Failed to send SOS. Please call 1078 directly or try again.
        </div>
      )}
    </section>
  );
}
