import { useState } from "react";
import { useNavigate } from "react-router";
import { SignupForm } from "../../components/signup/SignupForm";
import { ToastContainer } from "../../components/signup/Toast";
import { useToast } from "../../hooks/useToast";
import signupBackground from "../../assets/signup.jpg";

const NAV_LINKS = [{label:"Home",id:"home"},
{label:"About",id:"about"},
{label:"Safety Tips", id: "safety-tips"},
{label:"Contact",id:"contact"}];

export default function SignUp() {
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleNavClick = (sectionId: string) => {
    sessionStorage.setItem("scrollTo", sectionId);
    navigate("/");
  };

  const handleGeoError = (message: string) => {
    showToast("warning", "Location access denied", message);
  };

  const handleSuccess = () => {
    showToast("success", "Account created successfully", "Welcome to Geo Rakshak.");
    setSubmitted(true);
    // Simulated redirect — replace with real router navigation.
    setTimeout(() => {
      console.log("Navigating to /dashboard…");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-position-[70%_bottom] max-md:bg-[position:66%_bottom] max-sm:bg-[position:58%_bottom]"
        style={{ backgroundImage: `url(${signupBackground})` }}
        role="img"
        aria-label="Forest opening toward mountains with the Indian national flag"
      />

      {/* Overlay layers — keeps the forest and flag visible while ensuring contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A140D]/70 via-[#0B160E]/55 to-[#0A140D]/80" />
      <div className="absolute inset-0 bg-[#0D1810]/25" />
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 180px 60px rgba(6,12,8,0.55)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Minimal top navigation */}
        <header className="px-6 py-5 sm:px-10">
          <nav className="mx-auto flex max-w-6xl items-center justify-between" aria-label="Primary">
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity bg-none border-none cursor-pointer p-0"
            >
              <span className="h-2 w-2 rounded-full bg-[#D9A24B]" aria-hidden="true" />
              <span className="text-sm font-semibold tracking-wide text-[#F4EFE6]">
                Geo Rakshak
              </span>
            </button>
            <ul className="hidden sm:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className="text-sm text-[#C3D0BE] hover:text-[#F4EFE6]
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A24B] rounded
                      transition-colors bg-none border-none cursor-pointer p-0"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Signup card */}
        <main className="flex flex-1 items-center justify-start px-4 py-8 sm:pl-[10vw] sm:pr-8">
          <div
            className="w-full max-w-[440px] rounded-2xl border border-white/10
              bg-[#0D1B12]/80 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.45)] px-7 py-8 sm:px-9 sm:py-9"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#D9A24B]" aria-hidden="true" />
              <span className="text-xs font-medium tracking-wide text-[#B7CBB2]">
                Geo Rakshak
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-[#F4EFE6] mb-2">
              Create your account
            </h1>
            <p className="text-sm text-[#B7CBB2] mb-7 leading-relaxed">
              Join the network protecting lives across Northeast India.
            </p>

            <SignupForm onGeoError={handleGeoError} onSuccess={handleSuccess} />

            <p className="mt-6 text-center text-sm text-[#8FA98C]">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-[#D9A24B] hover:text-[#E8B563]
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D9A24B] rounded
                  transition-colors"
              >
                Log in
              </a>
            </p>
          </div>
        </main>

        {/* Trust message */}
        <footer className="px-4 pb-6 text-center">
          <p className="text-xs text-[#8FA98C]/80 max-w-md mx-auto">
            Your location helps us provide relevant disaster alerts for your area.
          </p>
        </footer>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Visually hidden live region confirming submission for assistive tech */}
      <div className="sr-only" role="status" aria-live="polite">
        {submitted ? "Account created. Redirecting to dashboard." : ""}
      </div>
    </div>
  );
}
