import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  LayoutDashboard,
  Hospital,
  Stethoscope,
  FlaskConical,
  Bed,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import {
  addPatient,
  createAppointment,
  ensurePatientExists,
  getBeds,
  getBloodBank,
  getDoctors,
  getHospitals,
  type BedRow,
  type BloodBankRow,
  type DoctorRow,
  type HospitalRow,
} from "../api/googleSheets";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "hospitals", label: "Hospitals", icon: Hospital },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "labs", label: "Lab Centers", icon: FlaskConical },
  { id: "emergency", label: "Beds & Blood", icon: Bed },
] as const;

type PatientTab = (typeof tabs)[number]["id"];

const isAvailableBed = (status: string) =>
  /avail|free|vacant|open/i.test(status);

const PatientPortal = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<PatientTab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [beds, setBeds] = useState<BedRow[]>([]);
  const [blood, setBlood] = useState<BloodBankRow[]>([]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientDisease, setPatientDisease] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const syncedHospitalsRef = useRef<Set<string>>(new Set());

  const displayName = useMemo(() => {
    const fromProfile = (user?.name ?? "").trim();
    if (fromProfile) {
      return fromProfile;
    }
    const email = (user?.email ?? "").trim();
    return email.split("@")[0] ?? "";
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (displayName && !patientName) {
      setPatientName(displayName);
    }
  }, [displayName, patientName]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [hospitalRows, doctorRows, bedRows, bloodRows] =
          await Promise.all([
            getHospitals(),
            getDoctors(),
            getBeds(),
            getBloodBank(),
          ]);

        if (cancelled) {
          return;
        }

        setHospitals(hospitalRows);
        setDoctors(doctorRows);
        setBeds(bedRows);
        setBlood(bloodRows);

        if (hospitalRows.length > 0) {
          setSelectedHospitalId(hospitalRows[0].hospitalId);
        }
      } catch (apiError) {
        if (!cancelled) {
          setError(
            apiError instanceof Error
              ? apiError.message
              : "Failed to load patient data",
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
  }, []);

  const doctorsByHospital = useMemo(() => {
    if (!selectedHospitalId) {
      return doctors;
    }
    return doctors.filter((doctor) => doctor.hospitalId === selectedHospitalId);
  }, [doctors, selectedHospitalId]);

  const emergencySummary = useMemo(() => {
    return hospitals.map((hospital) => {
      const hospitalBeds = beds.filter(
        (bed) => bed.hospitalId === hospital.hospitalId,
      );
      const icu = hospitalBeds.filter(
        (bed) => /icu/i.test(bed.type) && isAvailableBed(bed.status),
      ).length;
      const oxygen = hospitalBeds.filter(
        (bed) => /oxygen/i.test(bed.type) && isAvailableBed(bed.status),
      ).length;
      const general = hospitalBeds.filter(
        (bed) => /general/i.test(bed.type) && isAvailableBed(bed.status),
      ).length;
      return { hospital, icu, oxygen, general };
    });
  }, [beds, hospitals]);

  useEffect(() => {
    const syncPatient = async () => {
      if (!isAuthenticated || !selectedHospitalId || !displayName) {
        return;
      }

      if (syncedHospitalsRef.current.has(selectedHospitalId)) {
        return;
      }

      try {
        const result = await ensurePatientExists({
          name: displayName,
          hospitalId: selectedHospitalId,
        });

        if (result.created) {
          syncedHospitalsRef.current.add(selectedHospitalId);
        } else {
          syncedHospitalsRef.current.add(selectedHospitalId);
        }
      } catch {
        // fallback: try direct add once in case list read is unavailable
        try {
          await addPatient({
            name: displayName,
            hospitalId: selectedHospitalId,
          });
          syncedHospitalsRef.current.add(selectedHospitalId);
        } catch {
          // keep silent; booking flow still retries patient sync
        }
      }
    };

    void syncPatient();
  }, [displayName, isAuthenticated, selectedHospitalId]);

  const handleBooking = async (event: FormEvent) => {
    event.preventDefault();
    setBookingMessage(null);

    if (
      !patientName ||
      !selectedDoctor ||
      !selectedDate ||
      !selectedHospitalId
    ) {
      setBookingMessage("Please fill all booking fields.");
      return;
    }

    try {
      const effectivePatientName = (patientName || displayName).trim();
      const result = await createAppointment({
        patientName: effectivePatientName,
        age: patientAge,
        disease: patientDisease,
        doctor: selectedDoctor,
        date: selectedDate,
        hospitalId: selectedHospitalId,
      });

      setBookingMessage(
        result.mode === "apps-script" || result.mode === "webhook"
          ? "Appointment added successfully. The entry is saved to Appointments and Patients sheets."
          : "Booking prepared with hospital_id. Add VITE_SHEETS_WRITE_URL to write into Google Sheets.",
      );

      setPatientName(effectivePatientName);
      setPatientAge("");
      setPatientDisease("");
      setSelectedDoctor("");
      setSelectedDate("");
    } catch {
      setBookingMessage(
        "Unable to create appointment. Please check write webhook configuration.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <User className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Welcome, {displayName || "Patient"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Find hospitals and book by hospital-specific slot
              </p>
            </div>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="ml-auto px-3 py-2 rounded-lg text-sm font-medium border border-border bg-card text-foreground hover:bg-accent transition-colors"
              >
                Logout
              </button>
            ) : null}
          </div>

          {error && <p className="text-sm text-emergency mb-4">{error}</p>}
          {loading && (
            <p className="text-sm text-muted-foreground mb-4">
              Loading healthcare network...
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

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <p className="text-sm text-muted-foreground mb-1">
                    Hospitals Connected
                  </p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {hospitals.length}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <p className="text-sm text-muted-foreground mb-1">
                    Doctors Listed
                  </p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {doctors.length}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <p className="text-sm text-muted-foreground mb-1">
                    Beds Reported
                  </p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {beds.length}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleBooking}
                className="bg-card rounded-xl p-5 border border-border shadow-card space-y-3"
              >
                <h3 className="font-display font-semibold text-foreground">
                  Book Appointment
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    placeholder="Patient name"
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={patientAge}
                    onChange={(event) => setPatientAge(event.target.value)}
                    placeholder="Age"
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={patientDisease}
                    onChange={(event) => setPatientDisease(event.target.value)}
                    placeholder="Disease"
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  />
                  <select
                    value={selectedHospitalId}
                    onChange={(event) =>
                      setSelectedHospitalId(event.target.value)
                    }
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  >
                    {hospitals.map((hospital) => (
                      <option
                        key={hospital.hospitalId}
                        value={hospital.hospitalId}
                      >
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDoctor}
                    onChange={(event) => setSelectedDoctor(event.target.value)}
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select doctor</option>
                    {doctorsByHospital.map((doctor) => (
                      <option
                        key={doctor.doctorId || doctor.name}
                        value={doctor.name}
                      >
                        {doctor.name} ({doctor.specialization})
                      </option>
                    ))}
                  </select>
                </div>
                <button className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                  Submit Booking
                </button>
                {bookingMessage && (
                  <p className="text-sm text-muted-foreground">
                    {bookingMessage}
                  </p>
                )}
              </form>
            </div>
          )}

          {activeTab === "hospitals" && (
            <div className="grid md:grid-cols-2 gap-3">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.hospitalId}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {hospital.name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{" "}
                      {hospital.address || "Address unavailable"}
                    </p>
                  </div>
                  {hospital.phone ? (
                    <a
                      href={`tel:${hospital.phone}`}
                      className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {activeTab === "doctors" && (
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((doctor) => {
                const hospital = hospitals.find(
                  (item) => item.hospitalId === doctor.hospitalId,
                );
                return (
                  <div
                    key={doctor.doctorId || doctor.name}
                    className="bg-card rounded-xl p-4 border border-border shadow-card"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {doctor.name}
                        </p>
                        <p className="text-sm text-primary">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {hospital?.name ?? doctor.hospitalId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.availableDays || "Schedule unavailable"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "labs" && (
            <div className="grid md:grid-cols-2 gap-4">
              {hospitals.map((hospital) => (
                <div
                  key={`lab-${hospital.hospitalId}`}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {hospital.name} Lab
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Integrated diagnostics center
                    </p>
                  </div>
                  {hospital.phone ? (
                    <a
                      href={`tel:${hospital.phone}`}
                      className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {activeTab === "emergency" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground mb-3">
                  Live Bed Availability
                </h2>
                <div className="space-y-3">
                  {emergencySummary.map((entry) => (
                    <div
                      key={`beds-${entry.hospital.hospitalId}`}
                      className="bg-card rounded-xl p-4 border border-border shadow-card"
                    >
                      <p className="font-medium text-foreground mb-2">
                        {entry.hospital.name}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p
                            className={`font-bold ${entry.icu < 3 ? "text-emergency" : "text-success"}`}
                          >
                            {entry.icu}
                          </p>
                          <p className="text-muted-foreground text-xs">ICU</p>
                        </div>
                        <div>
                          <p className="font-bold text-success">
                            {entry.oxygen}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Oxygen
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-success">
                            {entry.general}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            General
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground mb-3">
                  Blood Bank
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {blood.map((entry) => (
                    <div
                      key={`${entry.hospitalId}-${entry.bloodGroup}`}
                      className="bg-card rounded-lg p-3 border border-border text-center"
                    >
                      <p className="font-display font-bold text-foreground">
                        {entry.bloodGroup}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.units || "0"} units
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientPortal;
