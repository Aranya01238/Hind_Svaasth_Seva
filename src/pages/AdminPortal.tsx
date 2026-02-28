import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Bed,
  CalendarCheck,
  Wrench,
  Users,
  Hospital,
  LogOut,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAppointments,
  getBeds,
  getBloodBank,
  getDoctors,
  getEquipment,
  type AppointmentRow,
  type BedRow,
  type BloodBankRow,
  type DoctorRow,
  type EquipmentRow,
} from "../api/googleSheets";

const tabs = [
  { id: "blood", label: "Blood Bank", icon: Droplets },
  { id: "beds", label: "Beds", icon: Bed },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "equipment", label: "Equipment", icon: Wrench },
  { id: "staff", label: "Staff", icon: Users },
] as const;

type AdminTab = (typeof tabs)[number]["id"];

const isAvailableBed = (status: string) =>
  /avail|free|vacant|open/i.test(status);

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("blood");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [beds, setBeds] = useState<BedRow[]>([]);
  const [blood, setBlood] = useState<BloodBankRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);

  const { user, hospitalId, hospitalName, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!hospitalId) {
      setLoading(false);
      setError("No hospital_id found in Auth0 metadata or mapped email.");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [bedRows, bloodRows, appointmentRows, equipmentRows, doctorRows] =
          await Promise.all([
            getBeds(hospitalId),
            getBloodBank(hospitalId),
            getAppointments(hospitalId),
            getEquipment(hospitalId),
            getDoctors(hospitalId),
          ]);

        if (cancelled) {
          return;
        }

        setBeds(bedRows);
        setBlood(bloodRows);
        setAppointments(appointmentRows);
        setEquipment(equipmentRows);
        setDoctors(doctorRows);
      } catch (apiError) {
        if (!cancelled) {
          setError(
            apiError instanceof Error
              ? apiError.message
              : "Failed to load hospital data",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [hospitalId]);

  const bedSummary = useMemo(() => {
    const byType = new Map<string, { available: number; total: number }>();
    beds.forEach((row) => {
      const type = row.type || "General";
      const current = byType.get(type) ?? { available: 0, total: 0 };
      byType.set(type, {
        total: current.total + 1,
        available: current.available + (isAvailableBed(row.status) ? 1 : 0),
      });
    });

    return Array.from(byType.entries()).map(([type, counts]) => ({
      type,
      available: counts.available,
      total: counts.total,
    }));
  }, [beds]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Hospital className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Super Admin
              </h1>
              <p className="text-sm text-muted-foreground">
                {hospitalName ?? "Hospital not mapped"}{" "}
                {hospitalId ? `(${hospitalId})` : ""}
              </p>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name ?? "Authenticated User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm hover:bg-accent transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-card mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Hospital Access Identity
                </h2>
                <p className="text-sm text-muted-foreground">
                  This dashboard is isolated to your hospital_id only.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
                <KeyRound className="w-4 h-4" /> Auth0 secured
              </div>
            </div>

            <div className="bg-background rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Hospital ID
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Hospital
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Logged-in Email
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Access
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground font-medium">
                      {hospitalId ?? "Not set"}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {hospitalName ?? "Not mapped"}
                    </td>
                    <td className="px-4 py-3 text-primary">
                      {user?.email ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-success">
                      Configured in Auth0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="text-sm text-emergency mb-4">{error}</p>}
          {loading && (
            <p className="text-sm text-muted-foreground mb-4">
              Loading hospital data...
            </p>
          )}

          <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent border border-border"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "blood" && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Blood Bank Inventory
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {blood.map((entry) => (
                  <div
                    key={`${entry.hospitalId}-${entry.bloodGroup}`}
                    className="bg-card rounded-xl p-4 border border-border shadow-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-display font-bold text-foreground">
                        {entry.bloodGroup}
                      </span>
                      <Droplets className="w-5 h-5 text-emergency" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.units || "0"} units available
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "beds" && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Emergency Bed Management
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bedSummary.map((bed) => (
                  <div
                    key={bed.type}
                    className="bg-card rounded-xl p-5 border border-border shadow-card"
                  >
                    <h3 className="font-display font-semibold text-foreground mb-3">
                      {bed.type}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Available / Total
                      </span>
                      <span
                        className={`text-sm font-semibold ${bed.available < 3 ? "text-emergency" : "text-success"}`}
                      >
                        {bed.available}/{bed.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Appointments
              </h2>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Patient
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Doctor
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr
                        key={
                          appointment.appointmentId ||
                          `${appointment.patientName}-${appointment.date}`
                        }
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 text-foreground font-medium">
                          {appointment.patientName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {appointment.doctor}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {appointment.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "equipment" && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Equipment Management
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {equipment.map((entry) => (
                  <div
                    key={entry.equipmentName}
                    className="bg-card rounded-xl p-5 border border-border shadow-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-semibold text-foreground">
                        {entry.equipmentName}
                      </h3>
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-semibold text-foreground">
                        {entry.quantity || "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-semibold text-primary">
                        {entry.status || "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Staff Management
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.doctorId || doctor.name}
                    className="bg-card rounded-xl p-4 border border-border shadow-card flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {doctor.name}
                      </p>
                      <p className="text-xs text-primary font-medium">
                        Doctor — {doctor.specialization}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doctor.availableDays}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPortal;
