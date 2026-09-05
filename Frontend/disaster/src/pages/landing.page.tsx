import { useEffect, useState, type MouseEvent } from "react";

const navItems = [["Home", "home"], ["About", "about"], ["Safety Tips", "safety-tips"], ["Contact", "contact"]] as const;
const steps = [
  ["01", "Sense", "Rain gauges, soil-moisture probes, and satellite feeds stream live terrain data every few minutes."],
  ["02", "Predict", "An AI model trained on historical slope failures scores landslide and flash-flood risk in real time."],
  ["03", "Alert", "When risk crosses a threshold, SMS and siren alerts reach households, schools, and local authorities."],
  ["04", "Respond", "Response teams get live maps of the affected zone to coordinate evacuation and relief on the ground."],
] as const;
const tips = [
  ["Know your evacuation route", "Identify the nearest high ground and a second route in case the first is blocked by debris."],
  ["Watch for warning signs", "New cracks in the ground, tilting trees, or sudden muddy water are early signs of slope movement."],
  ["Keep an emergency kit ready", "Torch, radio, first aid, and important documents packed and reachable at all times during monsoon season."],
] as const;

function PhoneIcon({ className = "h-[17px] w-[17px]" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}
function Brand() {
  return <span className="flex items-center gap-2.5 font-display text-[19px] font-bold text-cream"><span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_0_4px_rgba(201,138,60,0.25)]" />Geo Rakshak</span>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const scrollToSection = (id: string) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };
  
  useEffect(() => {
    // Priority 1: Check sessionStorage for scroll target (from Signup navigation)
    const scrollTarget = sessionStorage.getItem("scrollTo");
    if (scrollTarget) {
      scrollToSection(scrollTarget);
      sessionStorage.removeItem("scrollTo");
      return;
    }

    // Priority 2: Check URL hash (direct navigation like /#about)
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      scrollToSection(id);
    }
  }, []);
  
  useEffect(() => {
    // Handle hash changes when user clicks hash links on Landing page
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        scrollToSection(id);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  
  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollToSection(id);
    setMenuOpen(false);
  };
  return <main className="min-h-screen bg-cream font-body text-ink antialiased">
    <header className="sticky top-0 z-50 border-b border-[rgba(244,239,228,0.16)] bg-[rgba(14,31,23,0.92)] backdrop-blur-lg"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-[18px] max-[520px]:px-5"><a href="#home" onClick={(event) => handleNavClick(event, "home")}><Brand /></a><nav className="hidden ml-auto items-center gap-[34px] min-[861px]:flex">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={(event) => handleNavClick(event, id)} className="text-[15px] font-medium text-moss transition-colors duration-200 hover:text-cream">{label}</a>)}</nav><div className="flex items-center gap-4"><button type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="hidden text-2xl text-cream max-[860px]:block">{menuOpen ? "×" : "☰"}</button></div></div>{menuOpen && <nav className="border-t border-[rgba(244,239,228,0.12)] px-8 py-4 min-[861px]:hidden">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={(event) => handleNavClick(event, id)} className="block py-2 text-moss hover:text-cream">{label}</a>)}</nav>}</header>
    <section id="home" className="scroll-mt-20 flex min-h-[92vh] items-center bg-[linear-gradient(180deg,rgba(10,20,15,0.42)_0%,rgba(10,20,15,0.62)_55%,rgba(9,17,13,0.88)_100%),url('/src/assets/bg.jpg')] bg-cover bg-[center_30%]"><div className="mx-auto max-w-[760px] px-8 py-[120px] text-center max-[520px]:px-5 max-[520px]:py-20"><span className="mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(201,138,60,0.5)] bg-[rgba(201,138,60,0.16)] px-4 py-[7px] text-[13.5px] font-medium text-cream"><span className="h-[7px] w-[7px] animate-pulse rounded-full bg-gold" />Live monitoring across the North Eastern Region</span><h1 className="font-display text-[clamp(38px,6vw,60px)] font-bold leading-[1.06] tracking-[-0.01em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)]">Protecting Lives.<br />Predicting Risks.</h1><p className="mx-auto mt-[22px] max-w-[480px] text-[clamp(17px,2vw,20px)] text-cream-dim">Any disaster? We are here to help!</p><div className="my-[38px] flex flex-wrap justify-center gap-4"><a href="/signup" className="rounded-lg border border-gold bg-gold px-[30px] py-3.5 text-[15.5px] font-semibold text-[#1B1204] transition hover:-translate-y-px hover:bg-gold-dark">Sign Up</a><a href="/login" className="rounded-lg border-[1.5px] border-[rgba(255,255,255,0.55)] bg-transparent px-[30px] py-3.5 text-[15.5px] font-semibold text-white transition hover:border-white hover:bg-[rgba(255,255,255,0.08)]">Log In</a></div><div className="inline-flex items-center gap-2.5 border-t border-[rgba(244,239,228,0.25)] pt-[22px] text-[15px] text-cream"><PhoneIcon /><span>Call for immediate assistance: <strong className="border-b border-gold pb-px font-semibold text-white"><a href="tel:0301234567">1078</a></strong></span></div></div></section>
    <section id="about" className="scroll-mt-20 bg-cream py-24 max-[520px]:py-16"><div className="mx-auto max-w-[1180px] px-8 max-[520px]:px-5"><div className="mb-14 max-w-[620px]"><span className="mb-2.5 block text-sm font-semibold text-clay">Why this exists</span><h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-bold leading-[1.15] text-forest-dark">Fragile slopes, heavy monsoons, and villages caught in between.</h2></div><div className="grid grid-cols-[1.1fr_0.9fr] items-start gap-16 max-[860px]:grid-cols-1"><div className="max-w-[480px] space-y-[18px] text-[16.5px] text-[#3E4B41]"><p>Every monsoon, the steep terrain of the North Eastern Region absorbs weeks of rainfall in a matter of hours. Slopes give way without warning, rivers surge past their banks, and roads that connect remote villages to hospitals and markets disappear overnight.</p><p>Geo Rakshak combines satellite rainfall data, ground sensors, and machine learning to flag unstable slopes before they fail, giving communities minutes that used to not exist, and giving responders a head start instead of a scramble.</p></div><div className="flex flex-col gap-0.5">{[["140+", "villages under active monitoring"], ["28 min", "average early-warning lead time"], ["24/7", "satellite and sensor coverage"]].map(([num, label], index) => <div key={num} className={`flex items-baseline justify-between bg-forest px-7 py-[26px] ${index === 0 ? "rounded-t-xl" : ""} ${index === 2 ? "rounded-b-xl" : ""}`}><span className="font-display text-[30px] font-bold text-gold">{num}</span><span className="max-w-[180px] text-right text-sm text-moss">{label}</span></div>)}</div></div></div></section>
    <section className="bg-forest-dark py-24 max-[520px]:py-16"><div className="mx-auto max-w-[1180px] px-8 max-[520px]:px-5"><div className="mb-14 max-w-[620px]"><span className="mb-2.5 block text-sm font-semibold text-gold">How it works</span><h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-bold leading-[1.15] text-cream">From rainfall to a warning your phone can act on.</h2><p className="mt-4 text-[16.5px] text-moss">Four stages run continuously, day and night, across every monitored slope.</p></div><div className="grid grid-cols-4 gap-px overflow-hidden rounded-[14px] bg-[rgba(244,239,228,0.12)] max-[860px]:grid-cols-2 max-[520px]:grid-cols-1">{steps.map(([num, title, copy]) => <div key={num} className="bg-forest p-9 max-[520px]:p-7"><div className="mb-[22px] font-display text-[15px] font-bold text-gold">{num}</div><h3 className="mb-2.5 font-display text-lg font-bold text-cream">{title}</h3><p className="text-[14.5px] text-moss">{copy}</p></div>)}</div></div></section>
    <section id="safety-tips" className="scroll-mt-20 bg-cream py-24 max-[520px]:py-16"><div className="mx-auto max-w-[1180px] px-8 max-[520px]:px-5"><div className="mb-14 max-w-[620px]"><span className="mb-2.5 block text-sm font-semibold text-clay">Before disaster strikes</span><h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-bold leading-[1.15] text-forest-dark">Simple habits that save lives.</h2><p className="mt-4 text-[16.5px] text-[#3E4B41]">A few precautions, practiced ahead of time, make the biggest difference when an alert arrives.</p></div><div className="grid grid-cols-3 gap-6 max-[860px]:grid-cols-1">{tips.map(([title, copy], index) => <div key={title} className="rounded-xl border border-[rgba(21,32,24,0.12)] bg-white p-[30px_26px] transition-colors hover:border-clay-light"><div className="mb-[18px] flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-[rgba(169,113,74,0.14)] text-clay">{index === 2 ? <PhoneIcon /> : index === 0 ? "⌁" : "✧"}</div><h3 className="mb-2 font-display text-[17px] font-bold text-forest-dark">{title}</h3><p className="text-[14.5px] text-[#4A564D]">{copy}</p></div>)}</div><a href="#contact" onClick={(event) => handleNavClick(event, "contact")} className="mt-10 inline-flex items-center gap-2 border-b-[1.5px] border-gold pb-0.5 font-semibold text-forest hover:text-clay">See all safety tips <span aria-hidden="true">→</span></a></div></section>
    <section id="emergency" className="scroll-mt-20 bg-[linear-gradient(120deg,#8A5A3B,#1C3A2C)] py-[70px]"><div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-7 px-8 max-[860px]:text-left max-[520px]:px-5"><h2 className="max-w-[480px] font-display text-[clamp(24px,3vw,32px)] font-bold leading-[1.2] text-white">Help us reach the villages that don't have a warning system yet.</h2><div className="text-right max-[860px]:text-left"><span className="mb-1.5 block text-sm text-[rgba(255,255,255,0.75)]">24-hour emergency line</span><span className="font-display text-[clamp(26px,3.4vw,34px)] font-bold text-white">1078</span></div></div></section>
    <footer id="contact" className="scroll-mt-20 bg-forest-dark py-[72px] pb-[30px]"><div className="mx-auto max-w-[1180px] px-8 max-[520px]:px-5"><div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-12 border-b border-[rgba(244,239,228,0.12)] pb-12 max-[860px]:grid-cols-2 max-[520px]:grid-cols-1"><div><div className="mb-3.5"><Brand /></div><p className="max-w-[280px] text-[14.5px] text-moss">An AI-based early warning and landslide risk monitoring system built for the North Eastern Region of India.</p></div>{[["Government resources", "National Disaster Management Authority", "State Disaster Management Authority", "India Meteorological Department"], ["Response partners", "NER Relief Network", "Red Cross NER Chapter", "District Control Rooms"], ["Organization", "About the project", "Safety Tips", "Contact us", "Donate"]].map(([heading, ...links]) => <div key={heading}><h4 className="mb-[18px] text-sm font-semibold text-cream">{heading}</h4>{links.map((link) => <a key={link} href="#contact" className="mb-3 block text-[14.5px] text-moss transition-colors hover:text-cream">{link}</a>)}</div>)}</div><div className="flex flex-wrap items-center justify-between gap-4 pt-7"><p className="text-[13.5px] text-[rgba(138,166,143,0.8)]">&copy; 2026 Geo Rakshak. Built to protect communities across the North Eastern Region.</p><div className="flex gap-3.5">{["f", "𝕏", "◎"].map((icon) => <a key={icon} href="#contact" aria-label="Social media" className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(244,239,228,0.2)] text-moss transition-colors hover:border-gold hover:text-gold">{icon}</a>)}</div></div></div></footer>
+  </main>;
}
