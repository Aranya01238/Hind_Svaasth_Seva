import { motion } from "framer-motion";
import {
  Code,
  Activity,
  Database,
  Shield,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const services = [
  { name: "Google Sheets API", status: "connected", icon: Database },
  { name: "Auth0 Service", status: "pending", icon: Shield },
  { name: "Map Service", status: "connected", icon: MapPin },
  { name: "Lovable Cloud", status: "pending", icon: Activity },
];

const logs = [
  { time: "14:32:05", level: "INFO", message: "GET /api/hospitals — 200 OK (45ms)" },
  { time: "14:31:58", level: "INFO", message: "POST /api/appointments — 201 Created (120ms)" },
  { time: "14:31:42", level: "WARN", message: "Blood bank sync delayed — retrying in 5s" },
  { time: "14:30:15", level: "ERROR", message: "Sheet 'Ambulance' — quota exceeded, backing off" },
  { time: "14:29:50", level: "INFO", message: "SOS triggered — location shared to Apollo Care" },
];

const DeveloperPortal = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Code className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Developer Portal</h1>
              <p className="text-sm text-muted-foreground">System monitoring & debug panel</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {services.map((s) => (
              <div key={s.name} className="bg-card rounded-xl p-4 border border-border shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                  {s.status === "connected" ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warning" />
                  )}
                </div>
                <p className="font-medium text-foreground text-sm">{s.name}</p>
                <p className={`text-xs font-medium ${s.status === "connected" ? "text-success" : "text-warning"}`}>
                  {s.status === "connected" ? "Connected" : "Setup Pending"}
                </p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl p-5 border border-border shadow-card text-center">
              <p className="text-3xl font-display font-bold text-foreground">5,640</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border shadow-card text-center">
              <p className="text-3xl font-display font-bold text-foreground">12,345</p>
              <p className="text-sm text-muted-foreground">API Calls Today</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border shadow-card text-center">
              <p className="text-3xl font-display font-bold text-success">99.8%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display font-semibold text-foreground text-sm">API Logs</h3>
            </div>
            <div className="p-4 font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-muted-foreground w-16 flex-shrink-0">{log.time}</span>
                  <span
                    className={`w-12 flex-shrink-0 font-semibold ${
                      log.level === "ERROR"
                        ? "text-emergency"
                        : log.level === "WARN"
                        ? "text-warning"
                        : "text-success"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-foreground">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeveloperPortal;
