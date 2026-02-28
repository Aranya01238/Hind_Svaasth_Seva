import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import { useHospitalApi } from "@/services/hospitalApi";

type DoctorRow = {
  doctor_id?: string;
  name?: string;
  specialization?: string;
  available_days?: string;
};

const Doctors = () => {
  const api = useHospitalApi();
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await api.getDoctors();
        if (!cancelled) {
          setDoctors(rows);
        }
      } catch (apiError) {
        if (!cancelled) {
          setError(
            apiError instanceof Error
              ? apiError.message
              : "Failed to load doctors",
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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading doctors...</p>;
  }

  if (error) {
    return <p className="text-sm text-emergency">{error}</p>;
  }

  if (doctors.length === 0) {
    return <p className="text-sm text-muted-foreground">No doctors yet</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {doctors.map((doctor, index) => (
        <div
          key={doctor.doctor_id || `${doctor.name}-${index}`}
          className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {doctor.name || "Unknown Doctor"}
            </p>
            <p className="text-sm text-primary">
              {doctor.specialization || "General"}
            </p>
            <p className="text-xs text-muted-foreground">
              {doctor.available_days || "Schedule not set"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Doctors;
