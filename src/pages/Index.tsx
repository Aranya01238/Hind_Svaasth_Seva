import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  ClipboardList,
  User,
  AlertTriangle,
  Code,
  Heart,
  ArrowRight,
  Activity,
  Hospital,
  Droplets,
  Bed,
} from "lucide-react";

const portals = [
  {
    title: "Super Admin",
    description: "Manage hospitals, staff, beds, blood bank & equipment across all facilities.",
    icon: Shield,
    path: "/admin",
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "Receptionist",
    description: "Handle patient bookings, doctor schedules, and front-desk operations.",
    icon: ClipboardList,
    path: "/receptionist",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: "Patient Portal",
    description: "View medical history, find nearby hospitals & doctors, book appointments.",
    icon: User,
    path: "/patient",
    color: "bg-accent text-accent-foreground",
  },
  {
    title: "Emergency",
    description: "SOS system, ambulance tracking, nearest hospital contacts. No login required.",
    icon: AlertTriangle,
    path: "/emergency",
    color: "bg-emergency text-emergency-foreground",
  },
  {
    title: "Developer",
    description: "API monitoring, logs, service health, and system analytics.",
    icon: Code,
    path: "/developer",
    color: "bg-muted text-foreground",
  },
];

const stats = [
  { label: "Hospitals", value: "6", icon: Hospital },
  { label: "Beds Available", value: "342", icon: Bed },
  { label: "Blood Units", value: "1,280", icon: Droplets },
  { label: "Active Patients", value: "5,640", icon: Activity },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.06]" />
        <div className="container mx-auto px-4 pt-28 pb-16 md:pt-36 md:pb-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              India's Digital Health Network
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-4">
              Hind Svaasth
              <span className="text-primary"> Seva</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Connecting hospitals, patients, and emergency services across India — one centralized health platform.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/patient"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium shadow-elevated hover:opacity-90 transition-opacity"
              >
                Patient Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/emergency"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emergency text-emergency-foreground font-medium shadow-emergency hover:opacity-90 transition-opacity"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency SOS
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-4 mb-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={item}
              className="bg-card rounded-xl p-5 shadow-card border border-border text-center"
            >
              <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Portals */}
      <section className="container mx-auto px-4 pb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10"
        >
          Access Your Portal
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {portals.map((p) => (
            <motion.div key={p.title} variants={item}>
              <Link
                to={p.path}
                className="group block bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center mb-4`}
                >
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Portal <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-foreground text-sm">
              Hind Svaasth Seva
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Centralized Digital Health Coordination Network — India
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
