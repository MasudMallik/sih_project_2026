import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Bell, ChevronDown, LocateFixed, Menu, Send, Shield, X } from "lucide-react";
import backgroundImage from "../assets/bg.jpg";
import { ActivityFeed } from "../components/emergency/ActivityFeed";
import { DispatchPanel } from "../components/emergency/DispatchPanel";
import { IncidentList } from "../components/emergency/IncidentList";
import { NearestHelp } from "../components/emergency/NearestHelp";
import { ResourceAllocation } from "../components/emergency/ResourceAllocation";
import { VillageCards } from "../components/emergency/VillageCards";
import type { EmergencyResponseData, FeedItem, HelpEntry, SentAlert, Village } from "../@types/interface/emergencyResponse";
import { emergencyResponseSchema } from "../validations/emergencyResponseValidation";

const helpIconByCategory: Record<HelpEntry["category"], HelpEntry["icon"]> = {
  Medical: Shield,
  Shelter: Shield,
  "Food & Water": Shield,
  Rescue: Shield,
};

const rawEmergencyData = {
  incidents: [
    { id: "inc-001", name: "Riverbank surge", location: "Brahmaputra Sector 4", severity: 92, severityLabel: "Critical", status: "Active", detail: "Water has crossed the warning mark. Two hamlets are requesting immediate evacuation support.", updatedAt: "Updated 4 min ago" },
    { id: "inc-002", name: "Slope failure", location: "Sonapur Ridge", severity: 78, severityLabel: "High", status: "Active", detail: "Road access is partially blocked after a fresh landslide. Rescue access is being assessed.", updatedAt: "Updated 11 min ago" },
    { id: "inc-003", name: "Bridge inspection", location: "NH-27 crossing", severity: 48, severityLabel: "Moderate", status: "Monitoring", detail: "Traffic is moving under controlled conditions while structural teams monitor the water level.", updatedAt: "Updated 18 min ago" },
  ],
  villages: [
    { id: "vil-001", name: "Khanapara", distance: "7.8 km away", affected: 340, capacity: 500, needs: ["Water", "Medical"] , progress: 68 },
    { id: "vil-002", name: "Sonapur", distance: "11.4 km away", affected: 218, capacity: 300, needs: ["Shelter", "Food"] , progress: 73 },
    { id: "vil-003", name: "Beltola", distance: "14.2 km away", affected: 126, capacity: 200, needs: ["Blankets", "Water"] , progress: 51 },
    { id: "vil-004", name: "Chandrapur", distance: "18.6 km away", affected: 89, capacity: 180, needs: ["Medical"] , progress: 42 },
  ],
  infrastructure: [
    { id: "infra-001", name: "NH-27 crossing", location: "Khanapara", status: "Compromised", statusDetail: "Single-lane traffic" },
    { id: "infra-002", name: "Guwahati relief hub", location: "Paltan Bazaar", status: "Operational", statusDetail: "12 teams ready" },
  ],
  helpEntries: [
    { id: "help-001", category: "Medical", title: "GMCH Emergency Unit", contact: "+913612520290", availability: "24/7 response" },
    { id: "help-002", category: "Shelter", title: "District relief shelter", contact: "+913612730100", availability: "184 beds available" },
    { id: "help-003", category: "Food & Water", title: "Community supply desk", contact: "1078", availability: "Dispatch within 20 min" },
    { id: "help-004", category: "Rescue", title: "NDRF coordination cell", contact: "1070", availability: "Standby team active" },
  ],
  resources: [
    { id: "res-001", name: "Drinking water", allocated: 740, total: 1000, unit: "packs" },
    { id: "res-002", name: "Medical kits", allocated: 62, total: 90, unit: "kits" },
    { id: "res-003", name: "Rescue boats", allocated: 8, total: 12, unit: "boats" },
    { id: "res-004", name: "Blankets", allocated: 380, total: 600, unit: "units" },
  ],
  feed: [
    { id: "feed-001", time: "09:42", text: "Riverbank surge escalated to critical severity.", type: "alert" },
    { id: "feed-002", time: "09:35", text: "Team Delta dispatched to Sonapur Ridge.", type: "dispatch" },
    { id: "feed-003", time: "09:20", text: "Guwahati relief hub confirmed 12 teams ready.", type: "update" },
    { id: "feed-004", time: "08:56", text: "Dashboard synchronized with field reports.", type: "system" },
  ],
} satisfies Omit<EmergencyResponseData, "helpEntries"> & { helpEntries: Array<Omit<HelpEntry, "icon">> };

const validatedData = emergencyResponseSchema.parse(rawEmergencyData);
const initialEmergencyData: EmergencyResponseData = {
  ...validatedData,
  helpEntries: validatedData.helpEntries.map((entry) => ({ ...entry, icon: helpIconByCategory[entry.category] })),
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function EmergencyResponse() {
  const [data, setData] = useState<EmergencyResponseData>(initialEmergencyData);
  const [sortDescending, setSortDescending] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [sentLog, setSentLog] = useState<SentAlert[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("Command center synchronized");

  const sortedIncidents = useMemo(() => [...data.incidents].sort((left, right) => sortDescending ? right.severity - left.severity : left.severity - right.severity), [data.incidents, sortDescending]);

  const addFeedItem = (text: string, type: FeedItem["type"]): void => {
    setData((previous) => ({
      ...previous,
      feed: [{ id: `feed-${Date.now()}`, time: formatTime(new Date()), text, type }, ...previous.feed],
    }));
  };

  const handleNotifyVillage = (village: Village): void => {
    const action = `Alert sent to ${village.name} response coordinators.`;
    addFeedItem(action, "alert");
    setNotice(action);
  };

  const handleDispatch = (): void => {
    setIsDispatching(true);
    window.setTimeout(() => {
      setIsDispatching(false);
      addFeedItem("Nearest rescue team dispatched to the highest-severity incident.", "dispatch");
      setNotice("Response team dispatched");
    }, 900);
  };

  const handleBroadcast = (): void => {
    setShowBroadcast(true);
    setNotice("Draft a verified community alert");
  };

  const handleSendBroadcast = (): void => {
    const text = broadcastText.trim();
    if (!text) return;
    const alert: SentAlert = { id: `alert-${Date.now()}`, time: formatTime(new Date()), text };
    setSentLog((previous) => [alert, ...previous]);
    addFeedItem(`Broadcast sent: ${text}`, "alert");
    setBroadcastText("");
    setShowBroadcast(false);
    setNotice("Broadcast delivered to response network");
  };

  return (
    <div className="min-h-screen bg-[#0b1810] bg-cover bg-center bg-fixed font-body text-[#f4efe4]" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="min-h-screen bg-[#07140c]/80">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e1f17]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
            <Link to="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d9a441] text-[#17280f]"><Shield size={19} /></span><span><strong className="block font-display text-lg">Geo Rakshak</strong><small className="text-[10px] uppercase tracking-[0.18em] text-[#8aa68f]">Emergency operations</small></span></Link>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-lg border border-white/10 p-2 text-[#b7cbb2] lg:hidden" aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
            <nav className={`${menuOpen ? "absolute left-5 right-5 top-[76px] flex" : "hidden"} flex-col gap-4 rounded-xl border border-white/10 bg-[#102419] p-4 lg:static lg:flex lg:flex-row lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:p-0`}>
              <Link to="/" className="text-sm text-[#b7cbb2] transition hover:text-[#f4efe4]">Home</Link>
              <span className="border-b-2 border-[#d9a441] pb-1 text-sm font-semibold text-[#f4efe4]">Response Center</span>
              <button type="button" className="flex items-center gap-1 text-sm text-[#b7cbb2] transition hover:text-[#f4efe4]">Operations <ChevronDown size={14} /></button>
            </nav>
            <div className="hidden items-center gap-3 lg:flex"><span className="flex items-center gap-2 text-xs text-[#8aa68f]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#5c9764]" /> Live</span><button type="button" title="Notifications" className="rounded-full border border-white/10 p-2 text-[#b7cbb2] hover:border-[#d9a441] hover:text-[#d9a441]"><Bell size={17} /></button></div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
          <section className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d9a441]"><LocateFixed size={14} /> Northeast India command view</p><h1 className="max-w-3xl font-display text-4xl leading-tight text-[#f4efe4] sm:text-5xl">Emergency response center</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#b7cbb2]">Monitor active incidents, coordinate field teams, and keep affected communities connected to verified help.</p></div><div className="rounded-xl border border-[#5c9764]/30 bg-[#102419]/80 px-4 py-3 text-sm text-[#b7cbb2]"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#5c9764]" />{notice}</div></section>

          {showBroadcast && <section className="mb-6 rounded-2xl border border-[#d9a441]/40 bg-[#1d3423]/95 p-5 shadow-2xl"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-[#f4efe4]">Broadcast alert</h2><p className="mt-1 text-xs text-[#8aa68f]">Send a verified message to response coordinators.</p></div><button type="button" onClick={() => setShowBroadcast(false)} aria-label="Close broadcast form" className="text-[#8aa68f] hover:text-[#f4efe4]"><X size={18} /></button></div><textarea value={broadcastText} onChange={(event) => setBroadcastText(event.target.value)} rows={3} placeholder="Type the alert message..." className="mt-4 w-full rounded-xl border border-white/10 bg-[#0d1c13] p-3 text-sm text-[#f4efe4] outline-none placeholder:text-[#6f8b75] focus:border-[#d9a441]" /><button type="button" onClick={handleSendBroadcast} disabled={!broadcastText.trim()} className="mt-3 flex items-center gap-2 rounded-lg bg-[#d9a441] px-4 py-2.5 text-sm font-semibold text-[#17280f] disabled:cursor-not-allowed disabled:opacity-50"><Send size={15} /> Send alert</button></section>}

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"><div className="space-y-6"><IncidentList incidents={sortedIncidents} sortDescending={sortDescending} onToggleSort={() => setSortDescending((value) => !value)} /><VillageCards villages={data.villages} onNotify={handleNotifyVillage} /><DispatchPanel isDispatching={isDispatching} onDispatch={handleDispatch} onBroadcast={handleBroadcast} /></div><div className="space-y-6"><NearestHelp entries={data.helpEntries} /><ResourceAllocation resources={data.resources} /><ActivityFeed items={data.feed} /></div></div>

          {sentLog.length > 0 && <section className="mt-6 rounded-2xl border border-white/10 bg-[#102419]/85 p-5 shadow-2xl backdrop-blur-md"><h2 className="font-semibold text-[#f4efe4]">Sent alerts</h2><div className="mt-3 grid gap-2 md:grid-cols-2">{sentLog.map((alert) => <div key={alert.id} className="rounded-lg border border-white/10 bg-[#173123]/80 p-3 text-sm text-[#c6d5c3]"><span className="mr-2 text-xs text-[#d9a441]">{alert.time}</span>{alert.text}</div>)}</div></section>}
        </main>
      </div>
    </div>
  );
}
