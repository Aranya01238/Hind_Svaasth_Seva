import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  FlaskConical,
  Globe2,
  ShieldAlert,
} from "lucide-react";

type OutbreakStory = {
  id: string;
  region: string;
  disease: string;
  status: "monitoring" | "elevated" | "critical";
  summary: string;
  updatedAt: string;
};

type ProblemAlert = {
  id: string;
  title: string;
  region: string;
  impact: string;
  reportedAt: string;
};

type ResearchUpdate = {
  id: string;
  title: string;
  source: string;
  focus: string;
  publishedAt: string;
};

const outbreakStories: OutbreakStory[] = [
  {
    id: "obs-1",
    region: "South-East Asia",
    disease: "Dengue",
    status: "elevated",
    summary:
      "Urban clusters report increased suspected dengue admissions during seasonal transition.",
    updatedAt: "2026-03-01T08:10:00Z",
  },
  {
    id: "obs-2",
    region: "West Africa",
    disease: "Lassa Fever",
    status: "monitoring",
    summary:
      "Cross-border surveillance teams maintain active monitoring with localized containment actions.",
    updatedAt: "2026-03-01T06:20:00Z",
  },
  {
    id: "obs-3",
    region: "South America",
    disease: "Respiratory Viral Cluster",
    status: "critical",
    summary:
      "Critical-care occupancy pressure is rising in selected metros due to severe respiratory complications.",
    updatedAt: "2026-03-01T05:40:00Z",
  },
];

const problemAlerts: ProblemAlert[] = [
  {
    id: "pa-1",
    title: "ICU Oxygen Supply Strain",
    region: "Multiple high-density cities",
    impact: "Delayed critical care admissions in peak hours",
    reportedAt: "2026-03-01T07:15:00Z",
  },
  {
    id: "pa-2",
    title: "Laboratory Turnaround Delay",
    region: "Regional referral hubs",
    impact: "Diagnostic reports for severe infections delayed",
    reportedAt: "2026-03-01T04:55:00Z",
  },
  {
    id: "pa-3",
    title: "Field Workforce Fatigue",
    region: "Disaster-prone zones",
    impact: "Reduced triage throughput in emergency windows",
    reportedAt: "2026-02-28T23:35:00Z",
  },
];

const researchUpdates: ResearchUpdate[] = [
  {
    id: "ru-1",
    title: "Early multi-marker panel for severe respiratory decline",
    source: "International Clinical Consortium",
    focus: "Faster deterioration risk scoring at admission",
    publishedAt: "2026-02-27T12:00:00Z",
  },
  {
    id: "ru-2",
    title: "Adaptive vaccine response durability analysis",
    source: "Global Public Health Network",
    focus: "Immune persistence against fast-mutating strains",
    publishedAt: "2026-02-26T16:30:00Z",
  },
  {
    id: "ru-3",
    title: "Triage optimization under surge conditions",
    source: "Emergency Systems Lab",
    focus: "Queue balancing across district hospitals",
    publishedAt: "2026-02-25T09:40:00Z",
  },
];

const statusStyle: Record<OutbreakStory["status"], string> = {
  monitoring: "bg-secondary text-secondary-foreground",
  elevated: "bg-amber-500/20 text-amber-200",
  critical: "bg-emergency text-emergency-foreground",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const HealthIntelPortal = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const latestUpdate = useMemo(() => {
    const allTimes = [
      ...outbreakStories,
      ...problemAlerts,
      ...researchUpdates,
    ].map((item) =>
      new Date(
        "updatedAt" in item
          ? item.updatedAt
          : "reportedAt" in item
            ? item.reportedAt
            : item.publishedAt,
      ).getTime(),
    );

    return new Date(Math.max(...allTimes));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Global Health Intel Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                Pandemic watch, incidents, and research intelligence
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground">
              Current Time: {currentTime.toLocaleString()}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground">
              Feed Updated: {latestUpdate.toLocaleString()}
            </span>
          </div>
        </motion.div>

        <section className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-emergency" />
            <h2 className="text-lg font-display font-semibold text-foreground">
              Pandemic & Outbreak Stories
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {outbreakStories.map((story) => (
              <div
                key={story.id}
                className="rounded-lg border border-border bg-background p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {story.disease}
                  </p>
                  <span
                    className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${statusStyle[story.status]}`}
                  >
                    {story.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Region: {story.region}
                </p>
                <p className="text-sm text-muted-foreground">{story.summary}</p>
                <p className="text-xs text-muted-foreground">
                  Updated: {formatDateTime(story.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-display font-semibold text-foreground">
                Active Problems
              </h2>
            </div>
            <div className="space-y-3">
              {problemAlerts.map((problem) => (
                <div
                  key={problem.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {problem.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Region: {problem.region}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Impact: {problem.impact}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reported: {formatDateTime(problem.reportedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">
                Latest Research
              </h2>
            </div>
            <div className="space-y-3">
              {researchUpdates.map((research) => (
                <div
                  key={research.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {research.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Source: {research.source}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Focus: {research.focus}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Published: {formatDateTime(research.publishedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">
              Story Timeline
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {outbreakStories.map((story) => (
              <li
                key={`timeline-${story.id}`}
                className="rounded-lg border border-border bg-background px-3 py-2"
              >
                {formatDateTime(story.updatedAt)} • {story.region} •{" "}
                {story.disease}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HealthIntelPortal;
