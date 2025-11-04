'use client';

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { generateShortPlan, type ShortPlan, type ShortPlanRequest } from "@/lib/short-plan";

type FormState = {
  topic: string;
  audience: string;
  tone: string;
  goal: string;
  product: string;
  callToAction: string;
  keywords: string;
  length: ShortPlanRequest["length"];
  platform: ShortPlanRequest["platform"];
};

const LENGTH_OPTIONS: { label: string; value: ShortPlanRequest["length"]; description: string }[] = [
  { label: "15s burst", value: 15, description: "Pure hook + payoff" },
  { label: "30s punchy", value: 30, description: "Hook, pain and payoff" },
  { label: "45s depth", value: 45, description: "Adds context and proof" },
  { label: "60s mini story", value: 60, description: "Full narrative arc" },
];

const PLATFORMS: ShortPlanRequest["platform"][] = ["YouTube", "Instagram", "TikTok"];

export default function Home() {
  const [form, setForm] = useState<FormState>({
    topic: "Turn long tutorials into bingeable YouTube Shorts",
    audience: "solo content creators",
    tone: "high-energy",
    goal: "grow subscribers",
    product: "Notion content sprint board",
    callToAction: "Subscribe for the complete workflow",
    keywords: "shorts workflow, content batching, repurposing",
    length: 30,
    platform: "YouTube",
  });
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10_000));
  const [plan, setPlan] = useState<ShortPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const request = useMemo<ShortPlanRequest>(() => {
    return {
      ...form,
      keywords: form.keywords.split(","),
      seed,
    };
  }, [form, seed]);

  const runGeneration = useCallback((payload: ShortPlanRequest) => {
    setIsGenerating(true);
    requestAnimationFrame(() => {
      const result = generateShortPlan(payload);
      setPlan(result);
      setIsGenerating(false);
      setCopied(false);
    });
  }, []);

  const handleGenerate = useCallback(() => {
    runGeneration(request);
  }, [request, runGeneration]);

  const handleShuffle = useCallback(() => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    runGeneration({ ...request, seed: nextSeed });
  }, [request, runGeneration, seed]);

  const scriptText = useMemo(() => {
    if (!plan) return "";
    return plan.beats
      .map(
        (beat, index) =>
          `${index + 1}. ${beat.title} (${beat.duration}s)\nVoiceover: ${beat.voiceover}\nVisuals: ${beat.visuals}\nNote: ${beat.editorNote}`
      )
      .join("\n\n");
  }, [plan]);

  const handleCopy = useCallback(async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [plan, scriptText]);

  const handleDownload = useCallback(() => {
    if (!plan) return;
    const blob = new Blob([JSON.stringify({ request, plan }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `youtube-short-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [plan, request]);

  return (
    <main className="min-h-screen bg-slate-950/90 pb-24 text-slate-50">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <div className="w-full space-y-8 lg:w-[430px]">
          <header className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
            <Badge>Agentic builder</Badge>
            <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
              Craft high-performing YouTube Shorts plans in seconds
            </h1>
            <p className="text-pretty text-sm text-slate-200/70 sm:text-base">
              Define the audience, tone, and goal—then generate hook, beats, b-roll cues, captions, call to action, and
              posting playbook instantly.
            </p>
          </header>

          <div className="space-y-6 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
            <FormSection title="Creative blueprint">
              <div className="grid gap-4">
                <TextField
                  label="Core topic"
                  value={form.topic}
                  onChange={(value) => setForm((prev) => ({ ...prev, topic: value }))}
                  placeholder="What is the short about?"
                />
                <TextField
                  label="Audience"
                  value={form.audience}
                  onChange={(value) => setForm((prev) => ({ ...prev, audience: value }))}
                  placeholder="Who are you speaking to?"
                />
                <TextField
                  label="Tone"
                  value={form.tone}
                  onChange={(value) => setForm((prev) => ({ ...prev, tone: value }))}
                  placeholder="Energetic, cinematic, comedic..."
                />
                <TextField
                  label="Product or solution"
                  value={form.product}
                  onChange={(value) => setForm((prev) => ({ ...prev, product: value }))}
                  placeholder="Optional – the thing you highlight"
                />
                <TextField
                  label="Primary goal"
                  value={form.goal}
                  onChange={(value) => setForm((prev) => ({ ...prev, goal: value }))}
                  placeholder="What should the viewer do or feel?"
                />
                <TextField
                  label="Call to action"
                  value={form.callToAction}
                  onChange={(value) => setForm((prev) => ({ ...prev, callToAction: value }))}
                  placeholder="Subscribe for..."
                />
                <TextField
                  label="Keywords"
                  value={form.keywords}
                  onChange={(value) => setForm((prev) => ({ ...prev, keywords: value }))}
                  placeholder="Comma separated tags"
                />
              </div>
            </FormSection>

            <FormSection title="Distribution plan">
              <div className="grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-200/80">
                  Target platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, platform }))}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        form.platform === platform
                          ? "bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-400/40"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-200/80">
                  Runtime target
                </label>
                <div className="grid gap-2 md:grid-cols-2">
                  {LENGTH_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, length: option.value }))}
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.length === option.value
                          ? "border-emerald-400/70 bg-emerald-400/20"
                          : "border-white/10 bg-white/10 hover:border-white/30"
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{option.label}</p>
                      <p className="text-xs text-slate-200/70">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </FormSection>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200 disabled:cursor-wait disabled:bg-emerald-300/60"
                disabled={isGenerating}
              >
                <SparklesIcon className="size-4 text-slate-900" />
                {isGenerating ? "Building plan..." : "Generate short blueprint"}
              </button>
              <button
                type="button"
                onClick={handleShuffle}
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Remix beats
              </button>
            </div>
          </div>
        </div>

        <section className="flex w-full flex-1 flex-col gap-6">
          <div className="grid gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Creative deck</p>
                <h2 className="text-balance text-2xl font-semibold leading-tight sm:text-3xl">
                  {form.topic.length > 0 ? form.topic : "Set a topic to start generating"}
                </h2>
              </div>
              <PlanMetric label="Runtime" value={`${form.length}s`} />
            </div>
            {plan ? (
              <div className="grid gap-4 text-sm text-slate-100/80">
                <InfoRow label="Hook" value={plan.hook} />
                <InfoRow label="Promise" value={plan.promise} />
                <InfoRow label="Call to action" value={plan.callToAction} />
                <InfoRow label="Music cue" value={plan.musicCue} />
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/60">
                Generate a plan to unlock a full scene breakdown, script beats, b-roll recommendations, captions,
                hashtags, and posting tactics crafted for your target audience.
              </p>
            )}
          </div>

          {plan && (
            <>
              <div className="grid gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Shot-by-shot script</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/10"
                    >
                      <ClipboardIcon className="size-4 text-emerald-300/90" />
                      {copied ? "Copied" : "Copy script"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/10"
                    >
                      <DownloadIcon className="size-4 text-emerald-300/90" />
                      Export JSON
                    </button>
                  </div>
                </div>
                <div className="grid gap-3">
                  {plan.beats.map((beat) => (
                    <BeatCard key={beat.id} beat={beat} />
                  ))}
                </div>
              </div>

              <TwoColumnGroup
                left={
                  <ContentCard title="B-roll ideas" items={plan.brollIdeas} emptyHint="Add a topic and generate first." />
                }
                right={
                  <ContentCard
                    title="Transitions & motion"
                    items={plan.transitions}
                    emptyHint="Generate a plan to unlock transitions."
                  />
                }
              />

              <TwoColumnGroup
                left={
                  <ContentCard
                    title="Caption angles"
                    items={plan.captions}
                    emptyHint="Generate to see caption hooks."
                  />
                }
                right={
                  <ContentCard
                    title="Hashtags"
                    items={plan.hashtags}
                    emptyHint="Generate to see hashtag stack."
                    badge="Optimize search"
                  />
                }
              />

              <ContentCard
                title="Posting playbook"
                items={plan.postingNotes}
                emptyHint="Generate to see posting tactics."
                badge="Ship it"
              />
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function BeatCard({ beat }: { beat: ShortPlan["beats"][number] }) {
  return (
    <article className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-white">{beat.title}</h4>
        <Badge>{beat.duration}s</Badge>
      </div>
      <div className="grid gap-3 text-sm text-white/80">
        <div>
          <p className="font-semibold uppercase tracking-wide text-white/50">Voiceover</p>
          <p className="text-pretty">{beat.voiceover}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-white/50">Visuals</p>
          <p className="text-pretty">{beat.visuals}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-white/50">Editor note</p>
          <p className="text-pretty">{beat.editorNote}</p>
        </div>
      </div>
    </article>
  );
}

function ContentCard({
  title,
  items,
  emptyHint,
  badge,
}: {
  title: string;
  items: string[];
  emptyHint: string;
  badge?: string;
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs uppercase tracking-wide text-white/40">Ready to paste into your edit</p>
        </div>
        {badge ? <Badge>{badge}</Badge> : null}
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-white/80">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3 rounded-2xl bg-slate-900/60 p-4">
              <span className="mt-1 inline-flex size-6 flex-none items-center justify-center rounded-full bg-emerald-400/20 text-xs font-semibold text-emerald-200">
                {index + 1}
              </span>
              <p className="text-pretty">{item}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-white/60">
          {emptyHint}
        </p>
      )}
    </article>
  );
}

function TwoColumnGroup({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {left}
      {right}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
      <p className="text-pretty text-sm text-white/85">{value}</p>
    </div>
  );
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-end rounded-2xl bg-emerald-400/10 px-4 py-2 text-right">
      <span className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">{label}</span>
      <span className="text-lg font-semibold text-emerald-200">{value}</span>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-4 text-sm text-white/80">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/70">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-200/80">{label}</span>
      <input
        className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
      {children}
    </span>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.75 8.25 21l-1.563-5.25L1.5 14.25l5.187-1.5L6.75 7.5l1.563 5.25 5.187 1.5-5.187 1.5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 4.125 17.379 6.75 20.25 7.5l-2.871.75L16.5 10.875 15.621 8.25 12.75 7.5l2.871-.75L16.5 4.125Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 13.125 20.004 14.625 21.5 15.125l-1.496.5L19.5 17.125 18.996 15.625 17.5 15.125l1.496-.5L19.5 13.125Z"
      />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <path
        d="M15.75 4.5h1.5a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25 2.25h-10.5A2.25 2.25 0 0 1 4.5 18.75v-12A2.25 2.25 0 0 1 6.75 4.5h1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V6a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 6V3.75Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <path d="M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m15 12-3 3-3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" strokeLinecap="round" />
    </svg>
  );
}
