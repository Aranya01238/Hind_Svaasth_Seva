import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { useHospitalApi } from "@/services/hospitalApi";

type AppointmentRow = {
  appointment_id?: string;
  patient_name?: string;
  doctor?: string;
  date?: string;
};

const normalizeDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const Schedule = () => {
  const api = useHospitalApi();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await api.getAppointments();
        if (!cancelled) {
          setAppointments(rows);
        }
      } catch (apiError) {
        if (!cancelled) {
          setError(
            apiError instanceof Error
              ? apiError.message
              : "Failed to load schedule",
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

  const upcomingDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 5 }, (_, index) => {
      const date = addDays(today, index);
      const key = format(date, "yyyy-MM-dd");
      const dayAppointments = appointments.filter((appointment) => {
        const parsed = normalizeDate(appointment.date);
        return parsed ? format(parsed, "yyyy-MM-dd") === key : false;
      });

      return {
        key,
        label: format(date, "EEE, dd MMM"),
        appointments: dayAppointments,
      };
    });
  }, [appointments]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading 5-day schedule...</p>
    );
  }

  if (error) {
    return <p className="text-sm text-emergency">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-display font-semibold text-foreground mb-4">
        Upcoming 5-Day Schedule
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
        {upcomingDays.map((day) => (
          <div
            key={day.key}
            className="bg-card rounded-xl p-4 border border-border shadow-card"
          >
            <p className="font-display font-semibold text-foreground text-sm mb-2">
              {day.label}
            </p>
            {day.appointments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No appointments</p>
            ) : (
              <div className="space-y-2">
                {day.appointments.map((appointment, index) => (
                  <div
                    key={
                      appointment.appointment_id ||
                      `${appointment.patient_name}-${index}`
                    }
                    className="text-xs"
                  >
                    <p className="text-foreground font-medium">
                      {appointment.doctor || "Doctor"}
                    </p>
                    <p className="text-muted-foreground">
                      {appointment.patient_name || "Patient"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
