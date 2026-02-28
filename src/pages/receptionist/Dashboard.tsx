import { useEffect, useState } from "react";
import { CalendarCheck, Droplets, Bed, Users, Stethoscope } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHospitalApi } from "@/services/hospitalApi";

type Stats = {
  patients: number;
  doctors: number;
  appointments: number;
  beds: number;
  bloodUnits: number;
};

const Dashboard = () => {
  const { hospital_name } = useAuth();
  const api = useHospitalApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    doctors: 0,
    appointments: 0,
    beds: 0,
    bloodUnits: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [patients, doctors, appointments, beds, blood] =
          await Promise.all([
            api.getPatients(),
            api.getDoctors(),
            api.getAppointments(),
            api.getBeds(),
            api.getBloodBank(),
          ]);

        if (cancelled) {
          return;
        }

        const bloodUnits = blood.reduce((sum, item) => {
          const units = Number(item.units || 0);
          return Number.isNaN(units) ? sum : sum + units;
        }, 0);

        setStats({
          patients: patients.length,
          doctors: doctors.length,
          appointments: appointments.length,
          beds: beds.length,
          bloodUnits,
        });
      } catch (apiError) {
        if (!cancelled) {
          setError(
            apiError instanceof Error
              ? apiError.message
              : "Failed to load dashboard",
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
  }, [api]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading receptionist dashboard...
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-emergency">{error}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-xl p-5 border border-border shadow-card">
        <h2 className="text-xl font-display font-semibold text-foreground">
          Welcome, {hospital_name ?? "Receptionist"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Hospital-scoped dashboard loaded from Google Apps Script API.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Patients</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {stats.patients}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <Stethoscope className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Doctors</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {stats.doctors}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <CalendarCheck className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Appointments</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {stats.appointments}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <Bed className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Beds</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {stats.beds}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <Droplets className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Blood Units</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {stats.bloodUnits}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
