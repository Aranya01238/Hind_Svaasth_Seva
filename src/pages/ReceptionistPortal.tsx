import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CalendarCheck,
  Users,
  Stethoscope,
  Calendar,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAppointments,
  getDoctors,
  getPatients,
  type AppointmentRow,
  type DoctorRow,
  type PatientRow,
} from "../api/googleSheets";

const tabs = [
  { id: "bookings", label: "Online Bookings", icon: CalendarCheck },
  { id: "patients", label: "Patient Database", icon: Users },
  { id: "doctors", label: "Doctor List", icon: Stethoscope },
  { id: "schedule", label: "Schedule", icon: Calendar },
] as const;

type ReceptionistTab = (typeof tabs)[number]["id"];

const ReceptionistPortal = () => {
  const [activeTab, setActiveTab] = useState<ReceptionistTab>("bookings");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);

  const { hospitalId, hospitalName } = useAuth();

  useEffect(() => {
    if (!hospitalId) {
      setLoading(false);
      setError("No hospital_id mapped for this receptionist account.");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [patientsRows, doctorsRows, appointmentRows] = await Promise.all([
          getPatients(hospitalId),
          getDoctors(hospitalId),
          getAppointments(hospitalId),
        ]);

        if (cancelled) {
          return;
        }

        setPatients(patientsRows);
        setDoctors(doctorsRows);
        setAppointments(appointmentRows);
      } catch (apiError) {
        if (!cancelled) {
          setError(
            apiError instanceof Error
              ? apiError.message
              : "Failed to load receptionist data",
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

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return patients;
    }
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(query),
    );
  }, [patients, search]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Receptionist Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                {hospitalName ?? "Hospital not mapped"}{" "}
                {hospitalId ? `(${hospitalId})` : ""}
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-emergency mb-4">{error}</p>}
          {loading && (
            <p className="text-sm text-muted-foreground mb-4">
              Loading hospital schedule...
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

          {activeTab === "bookings" && (
            <div className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Pending Booking Requests
              </h2>
              {appointments.map((booking) => (
                <div
                  key={
                    booking.appointmentId ||
                    `${booking.patientName}-${booking.date}`
                  }
                  className="bg-card rounded-xl p-4 border border-border shadow-card"
                >
                  <p className="font-medium text-foreground">
                    {booking.patientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.doctor} • {booking.date}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "patients" && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search patients..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Age
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Disease
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr
                        key={
                          patient.patientId || `${patient.name}-${patient.date}`
                        }
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 text-foreground font-medium">
                          {patient.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {patient.age || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {patient.disease || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {patient.date || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "doctors" && (
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.doctorId || doctor.name}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialization}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                    Available
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Doctor Schedule
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {doctors.map((doctor) => (
                  <div
                    key={`schedule-${doctor.doctorId || doctor.name}`}
                    className="bg-card rounded-xl p-4 border border-border shadow-card"
                  >
                    <p className="font-display font-semibold text-foreground text-sm mb-1">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-primary mb-2">
                      {doctor.specialization}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.availableDays || "Schedule not configured"}
                    </p>
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

export default ReceptionistPortal;
