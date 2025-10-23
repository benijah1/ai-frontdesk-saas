"use client";

import { useState, useCallback } from "react";
import { ArrowRight, CheckCircle2, Phone, Bot, MessageSquare, Shield, Zap, Clock, Headset, Star, Wrench, Building2, Send, CreditCard, ChevronRight, Users } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [trade, setTrade] = useState<"General" | "HVAC" | "Plumbing" | "Roofing" | "Electrical" | "Solar">("General");

  const tradeTagline: Record<typeof trade, string> = {
    General: "We answer calls, texts, and website chats in seconds, qualify the lead, quote basics, and book the job into your calendar.",
    HVAC: "We qualify AC/heat issues, collect model photos, suggest windows, and book tune‑ups or diagnostics directly into your calendar.",
    Plumbing: "We triage leaks/clogs, capture fixture photos, give travel+diag estimates, and book visits into your schedule.",
    Roofing: "We intake roof size, material, leak photos, storm details, and schedule inspections with homeowner confirmations.",
    Electrical: "We scope panels/outlet counts, detect emergencies, and schedule estimates or same‑day dispatch when needed.",
    Solar: "We pre‑qualify usage, roof fit, shade, and incentives, then schedule a design consult without back‑and‑forth."
  } as const;

  const baseFeatures = [
    { icon: <Phone className="h-6 w-6" />, title: "Instant Call Pick‑Up", desc: "Never miss a call again. We answer in under 2 seconds 24/7 and qualify every lead." },
    { icon: <MessageSquare className="h-6 w-6" />, title: "Text & Web Chat", desc: "Website chat + SMS so homeowners can reach you however they prefer." },
    { icon: <Zap className="h-6 w-6" />, title: "Booking on Autopilot", desc: "Real‑time scheduling into your calendar or job software, no back‑and‑forth." },
    { icon: <Shield className="h-6 w-6" />, title: "Call Recording + QA", desc: "Every conversation recorded, summarized, and scored for quality." },
    { icon: <Clock className="h-6 w-6" />, title: "After‑Hours Coverage", desc: "Nights, weekends, and holidays — we book jobs while your competitors sleep." }
  ];

  const tradeFeatures: Record<typeof trade, { title: string; desc: string }[]> = {
    General: [{ title: "Built for Contractors", desc: "HVAC, Plumbing, Roofing, Electrical, Solar — trained on trades workflows." }],
    HVAC: [
      { title: "HVAC Intake", desc: "SEER/tonnage prompts, thermostat codes, filter size, photos of nameplate." },
      { title: "Seasonal Upsells", desc: "Tune‑ups, IAQ add‑ons, and club memberships offered naturally." }
    ],
    Plumbing: [
      { title: "Plumbing Triage", desc: "Leak/backup categorization, shutoff instructions, fixture photos via SMS." },
      { title: "Upfront Expectations", desc: "Travel + diagnostic explained; optional ballpark for common jobs." }
    ],
    Roofing: [
      { title: "Storm & Leak Scripts", desc: "Wind/hail qualifiers, emergency tarping, interior damage photos." },
      { title: "Insurance Friendly", desc: "Captures claim details and schedules inspection windows." }
    ],
    Electrical: [
      { title: "Safety First", desc: "Smell of burning, tripping breakers, partial power — auto‑escalate rules." },
      { title: "Scope Capture", desc: "Outlet counts, panel brand/amp, EV charger distance and photos." }
    ],
    Solar: [
      { title: "Pre‑Qual Engine", desc: "Bill amount, roof orientation, shade, HOAs — all captured up front." },
      { title: "Incentive Aware", desc: "Prompts homeowners to provide utility and tax‑credit basics." }
    ]
  } as const;

  const stepsByTrade: Record<typeof trade, { step: string; title: string; text: string }[]> = {
    General: [
      { step: "01", title: "Connect Your Number", text: "Port or forward your business line. Keep your number — we do the rest." },
      { step: "02", title: "Set Your Rules", text: "Service areas, pricing guidance, dispatch windows, emergency rules, upsells." },
      { step: "03", title: "Start Booking Jobs", text: "We qualify, quote basics, collect photos, and put booked jobs on your calendar." }
    ],
    HVAC: [
      { step: "01", title: "Forward or Port Line", text: "Keep your number; we answer in under 2 seconds." },
      { step: "02", title: "HVAC Playbook", text: "Diagnostics price, service windows, membership offers, upsell rules." },
      { step: "03", title: "Book & Confirm", text: "We schedule, send SMS/email confirmations, and log notes + photos to your CRM." }
    ],
    Plumbing: [
      { step: "01", title: "Forward or Port Line", text: "24/7 coverage with emergency routing if needed." },
      { step: "02", title: "Plumbing Playbook", text: "Travel/diag, weekend rules, camera/jetting upsells, warranty language." },
      { step: "03", title: "Book & Confirm", text: "Homeowner gets SMS confirm; CSR‑quality notes saved to your system." }
    ],
    Roofing: [
      { step: "01", title: "Line Connected", text: "We catch storm‑surge calls and off‑hour leads." },
      { step: "02", title: "Roofing Playbook", text: "Leak/emergency logic, inspection durations, insurance data capture." },
      { step: "03", title: "Inspection Scheduled", text: "Calendar event + photo links + claim notes for your estimator." }
    ],
    Electrical: [
      { step: "01", title: "Connect Your Number", text: "Immediate answer; emergencies escalate to on‑call." },
      { step: "02", title: "Electrical Playbook", text: "Panel work rules, permit lead times, safety guidance copy." },
      { step: "03", title: "Dispatch & Notify", text: "We book, notify tech, and capture before/after photos when available." }
    ],
    Solar: [
      { step: "01", title: "Numbers Connected", text: "We capture inquiries from phone, SMS, and web chat." },
      { step: "02", title: "Solar Playbook", text: "Bill + usage, roof data, credit pre‑qual prompts, design consult rules." },
      { step: "03", title: "Consult Booked", text: "Calendar block with all pre‑qual data attached to the event/CRM." }
    ]
  } as const;

  const plans = [
    { name: "Starter", price: "$249", period: "/mo", badge: "Best for solo ops", bullets: ["Up to 200 conversations/mo","1 business line + SMS","Website chat widget","Leads to email + CRM"] },
    { name: "Pro", price: "$499", period: "/mo", badge: "Most popular", highlight: true, bullets: ["Up to 800 conversations/mo","Booking into Google/Outlook","After‑hours + weekends","Call recording + QA scores"] },
    { name: "Scale", price: "Custom", period: "", badge: "High‑volume shops", bullets: ["Unlimited conversations","Multi‑location routing","Job‑software integration","Dedicated success manager"] },
  ];

  const testimonials = [
    { quote: "We went from missing 30% of calls to booking 18 more jobs in the first month. Nights and Sundays are finally covered.", name: "Maria G.", role: "Owner, BrightFlow Plumbing" },
    { quote: "AI Front Desk paid for itself in week one. The summaries in our CRM are better than what we used to get from temps.", name: "Derrick T.", role: "GM, Summit Roofing" },
  ];

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      // Change this to your actual API route or external CRM webhook
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, trade, source: "home", page: "landing", ts: Date.now() })
      });
      if (!res.ok) throw new Error(`Bad status ${res.status}`);
      setSubmitMsg("Thanks! Check your inbox for your demo link.");
      setEmail("");
    } catch (err) {
      setSubmitMsg("Something went wrong. Please try again or email hello@reachsmart.ai.");
    } finally {
      setSubmitting(false);
    }
  }

  const dynamicFeatures = [
    ...baseFeatures.slice(0, 2),
    ...(trade === "General" ? tradeFeatures.General : [{ title: tradeFeatures[trade][0].title, desc: tradeFeatures[trade][0].desc }]),
    ...baseFeatures.slice(2),
  ];

  return (
    <main className="min-h-screen scroll-smooth bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <span className="font-semibold tracking-tight">AI Front Desk</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <button onClick={() => scrollTo("features")} className="hover:text-white/90 focus:outline-none">Features</button>
              <button onClick={() => scrollTo("how")} className="hover:text-white/90 focus:outline-none">How it works</button>
              <button onClick={() => scrollTo("pricing")} className="hover:text-white/90 focus:outline-none">Pricing</button>
              <button onClick={() => scrollTo("faq")} className="hover:text-white/90 focus:outline-none">FAQ</button>
            </nav>
            <div className="flex items-center gap-3">
              <a href="/login" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Sign in</a>
              <button onClick={() => scrollTo("get-demo")} className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">
                Get a Demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                <Star className="h-3.5 w-3.5" />
                Built for contractors
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Your 24/7 <span className="text-indigo-400">AI front desk</span> that books jobs — not just messages
              </h1>

              {/* Trade selector */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(["General","HVAC","Plumbing","Roofing","Electrical","Solar"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTrade(t)}
                    className={`rounded-full border px-3 py-1 text-xs ${trade === t ? "border-indigo-300 bg-indigo-500/20" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                  >{t}</button>
                ))}
              </div>

              <p className="mt-5 text-lg text-white/80">
                {tradeTagline[trade]}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button onClick={() => scrollTo("get-demo")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-medium hover:bg-indigo-400">
                  Book a live demo <CalendarIcon />
                </button>
                <button onClick={() => scrollTo("pricing")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-medium hover:bg-white/5">
                  See pricing <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 flex items-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 2‑second pick‑up</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> After‑hours covered</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No long contracts</div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 -z-10 rounded-[40px] bg-indigo-500/20 blur-3xl" />
              <HeroMockup trade={trade} />
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="border-t border-white/10 bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-sm text-white/60">Works with tools you already use</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 opacity-80">
            {["Google Calendar","Outlook","Jobber","ServiceTitan","Housecall Pro","Zapier"].map((name) => (
              <div key={name} className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {dynamicFeatures.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="inline-flex items-center justify-center rounded-xl bg-white/10 p-2">{"icon" in f ? (f as any).icon : <Wrench className="h-6 w-6" />}</div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/80">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/10 bg-slate-950/40 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">From call to booked job in minutes</h2>
            <p className="mt-3 text-white/80">Purpose‑built AI that follows your playbook and routes urgent jobs instantly.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {stepsByTrade[trade].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-indigo-300 font-semibold">{s.step}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/80">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <figure key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-amber-300">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-lg leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-white/80">{t.name} — {t.role}</figcaption>
              </figure>
            ))}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-transparent p-6">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Headset className="h-5 w-5" /> Live transfer when it matters</h3>
              <p className="mt-2 text-sm text-white/80">Emergency? High‑ticket roof? We detect urgency and warm‑transfer to your on‑call in seconds.</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {["Smart triage & escalation","Photo/video intake via SMS","Detailed CRM notes + call links","Follow‑up reminders if no show"].map((li) => (
                  <li key={li} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> {li}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/10 bg-slate-950/40 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Simple, clear pricing</h2>
            <p className="mt-3 text-white/80">Start small. Scale as you grow. No setup fees. Cancel anytime.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.name} className={"rounded-2xl border p-6 " + (p.highlight ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 bg-white/5") }>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{p.badge}</span>
                  <CreditCard className="h-4 w-4 text-white/60" />
                </div>
                <h3 className="mt-2 text-xl font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="mb-1 text-white/70">{p.period}</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> {b}</li>
                  ))}
                </ul>
                <button onClick={() => scrollTo("get-demo")} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400">
                  Choose {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture + FAQ */}
      <section id="get-demo" className="relative scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-bold">See it book a job in real time</h3>
              <p className="mt-2 text-white/80">Enter your email and we’ll send a 3‑minute interactive demo.</p>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
                <label htmlFor="email" className="sr-only">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none ring-0 placeholder:text-white/50" />
                <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-medium hover:bg-indigo-400 disabled:opacity-60">
                  {submitting ? "Sending…" : "Send demo"} <Send className="h-4 w-4" />
                </button>
              </form>
              {submitMsg && <p className="mt-3 text-sm text-white/80">{submitMsg}</p>}
              <p className="mt-3 text-xs text-white/60 flex items-center gap-2"><Shield className="h-3.5 w-3.5" />We never share your info.</p>
            </div>

            <div id="faq" className="rounded-2xl border border-white/10 bg-white/5 p-6 scroll-mt-24">
              <h3 className="text-2xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Frequently asked</h3>
              <ul className="mt-4 space-y-4">
                {[{q:"Will it sound like a robot?",a:"No. It uses natural prosody and trades vocabulary. Most callers assume it’s a friendly dispatcher."},{q:"How do bookings appear?",a:"Events land on your calendar with full notes, call link, photos, and homeowner contact details."},{q:"Can I keep my number?",a:"Yes. We can port or simply forward — your number stays the same."},{q:"What about emergencies?",a:"You set rules. We escalate and live‑transfer to on‑call when certain keywords or conditions are met."}].map((item) => (
                  <li key={item.q} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                    <div className="font-medium">{item.q}</div>
                    <p className="mt-1 text-sm text-white/80">{item.a}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>AI Front Desk</span>
              <span className="mx-2 opacity-50">•</span>
              <span>Made for contractors</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => scrollTo("pricing")} className="hover:text-white">Pricing</button>
              <button onClick={() => scrollTo("features")} className="hover:text-white">Features</button>
              <a href="/login" className="hover:text-white">Sign in</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CalendarIcon() {
  return <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" /> </span>;
}() {
  return <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" /> </span>;
}

function HeroMockup({ trade }: { trade: "General" | "HVAC" | "Plumbing" | "Roofing" }) {
  const firstLine = trade === "HVAC" ? "Homeowner: “AC stopped cooling and it’s 88°F.”" : trade === "Plumbing" ? "Homeowner: “There’s a leak under the kitchen sink.”" : trade === "Roofing" ? "Homeowner: “Ceiling stain after last night’s storm.”" : "Homeowner: “I need a service appointment.”";
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-rose-400" />
        <div className="h-3 w-3 rounded-full bg-amber-300" />
        <div className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-sm font-semibold flex items-center gap-2"><Phone className="h-4 w-4" /> Incoming Call</div>
          <p className="mt-2 text-sm text-white/80">{firstLine}</p>
          <div className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-white/80">
            AI: “I can help. Are you seeing any error codes or active leaks?”
          </div>
          <div className="mt-2 rounded-lg bg-white/5 p-3 text-xs text-white/80">
            AI: “I have a technician available tomorrow 8–12 or 12–4. What works?”
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-sm font-semibold flex items-center gap-2"><CalendarGlyph /> Booking Created</div>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> Calendar event with notes</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> SMS confirmation to homeowner</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> Job details synced to your CRM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CalendarGlyph() {
  return <span className="inline-flex items-center gap-2"><CalendarIconDot /> <span>AI Calendar</span></span>;
}

function CalendarIconDot() {
  return <div className="h-4 w-4 rounded-md border border-white/20" />;
}
