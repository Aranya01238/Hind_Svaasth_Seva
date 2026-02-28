import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useHospitalApi } from "@/services/hospitalApi";

type AppointmentRow = {
  appointment_id?: string;
  patient_name?: string;
  doctor?: string;
  date?: string;
};

const Appointments = () => {
  const api = useHospitalApi();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ patient_name: "", doctor: "", date: "" });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await api.getAppointments();
      setAppointments(rows);
    } catch (apiError) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.patient_name || !form.doctor || !form.date) {
      toast.error("Please fill all appointment details");
      return;
    }

    try {
      await api.createAppointment(form);
      toast.success("Appointment created successfully");
      setForm({ patient_name: "", doctor: "", date: "" });
      await loadAppointments();
    } catch (apiError) {
      toast.error(
        apiError instanceof Error
          ? apiError.message
          : "Failed to create appointment",
      );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-foreground">
        Appointments
      </h2>

      <form
        onSubmit={onSubmit}
        className="bg-card rounded-xl p-4 border border-border shadow-card grid md:grid-cols-3 gap-3"
      >
        <input
          value={form.patient_name}
          onChange={(event) =>
            setForm((state) => ({ ...state, patient_name: event.target.value }))
          }
          placeholder="Patient name"
          className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none"
        />
        <input
          value={form.doctor}
          onChange={(event) =>
            setForm((state) => ({ ...state, doctor: event.target.value }))
          }
          placeholder="Doctor"
          className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none"
        />
        <input
          type="date"
          value={form.date}
          onChange={(event) =>
            setForm((state) => ({ ...state, date: event.target.value }))
          }
          className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none"
        />
        <button className="md:col-span-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Create Appointment
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading appointments...</p>
      ) : null}
      {error ? <p className="text-sm text-emergency">{error}</p> : null}
      {!loading && !error && appointments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No appointments yet</p>
      ) : null}

      {!loading && appointments.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
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
              {appointments.map((appointment, index) => (
                <tr
                  key={
                    appointment.appointment_id ||
                    `${appointment.patient_name}-${index}`
                  }
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-foreground font-medium">
                    {appointment.patient_name || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {appointment.doctor || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {appointment.date || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default Appointments;
