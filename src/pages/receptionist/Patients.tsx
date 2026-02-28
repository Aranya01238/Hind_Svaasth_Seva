import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useHospitalApi } from "@/services/hospitalApi";

type PatientRow = {
  patient_id?: string;
  name?: string;
  age?: string | number;
  disease?: string;
  doctor?: string;
  date?: string;
};

const Patients = () => {
  const api = useHospitalApi();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    disease: "",
    doctor: "",
  });

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await api.getPatients();
      setPatients(rows);
    } catch (apiError) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Failed to load patients",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.age || !form.disease || !form.doctor) {
      toast.error("Please fill all patient details");
      return;
    }

    try {
      await api.addPatient({
        name: form.name,
        age: form.age,
        disease: form.disease,
        doctor: form.doctor,
      });
      toast.success("Patient added successfully");
      setForm({ name: "", age: "", disease: "", doctor: "" });
      setShowForm(false);
      await loadPatients();
    } catch (apiError) {
      toast.error(
        apiError instanceof Error ? apiError.message : "Failed to add patient",
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground">
          Patients
        </h2>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="bg-card rounded-xl p-4 border border-border shadow-card grid md:grid-cols-2 gap-3"
        >
          <input
            value={form.name}
            onChange={(event) =>
              setForm((state) => ({ ...state, name: event.target.value }))
            }
            placeholder="Name"
            className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none"
          />
          <input
            value={form.age}
            onChange={(event) =>
              setForm((state) => ({ ...state, age: event.target.value }))
            }
            placeholder="Age"
            className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border outline-none"
          />
          <input
            value={form.disease}
            onChange={(event) =>
              setForm((state) => ({ ...state, disease: event.target.value }))
            }
            placeholder="Disease"
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
          <button className="md:col-span-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
            Save Patient
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading patients...</p>
      ) : null}
      {error ? <p className="text-sm text-emergency">{error}</p> : null}
      {!loading && !error && patients.length === 0 ? (
        <p className="text-sm text-muted-foreground">No patients yet</p>
      ) : null}

      {!loading && patients.length > 0 ? (
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
                  Doctor
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr
                  key={patient.patient_id || `${patient.name}-${index}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-foreground font-medium">
                    {patient.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.age || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.disease || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.doctor || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {patient.date || "-"}
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

export default Patients;
