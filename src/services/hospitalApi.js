import { useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

const APPS_SCRIPT_URL = (import.meta.env.VITE_APPS_SCRIPT_URL || "").trim();
const APPS_SCRIPT_API_KEY = (import.meta.env.VITE_APPS_SCRIPT_API_KEY || "").trim();

const ensureConfig = () => {
  if (!APPS_SCRIPT_URL) {
    throw new Error("VITE_APPS_SCRIPT_URL is not configured.");
  }
};

const toErrorMessage = (error, fallback) =>
  error instanceof Error ? error.message : fallback;

export const useHospitalApi = () => {
  const { hospital_id } = useAuth();

  const baseUrl = useMemo(() => {
    ensureConfig();
    const url = new URL(APPS_SCRIPT_URL);
    if (APPS_SCRIPT_API_KEY) {
      url.searchParams.set("api_key", APPS_SCRIPT_API_KEY);
    }
    return url;
  }, []);

  const get = useCallback(
    async (dataset) => {
      if (!hospital_id) {
        throw new Error("hospital_id not found for this account.");
      }

      const url = new URL(baseUrl.toString());
      url.searchParams.set("dataset", dataset);
      url.searchParams.set("hospital_id", hospital_id);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const json = await response.json();
      if (json.error) {
        throw new Error(json.error);
      }

      return Array.isArray(json.rows) ? json.rows : [];
    },
    [baseUrl, hospital_id],
  );

  const post = useCallback(
    async (action, data = {}) => {
      if (!hospital_id) {
        throw new Error("hospital_id not found for this account.");
      }

      const url = new URL(baseUrl.toString());
      const body = {
        action,
        hospital_id,
        ...data,
      };

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API write failed: ${response.status}`);
      }

      const json = await response.json();
      if (json.error) {
        throw new Error(json.error);
      }

      return json;
    },
    [baseUrl, hospital_id],
  );

  return useMemo(
    () => ({
      getPatients: async () => {
        try {
          return await get("patients");
        } catch (error) {
          throw new Error(toErrorMessage(error, "Failed to fetch patients"));
        }
      },
      getDoctors: async () => {
        try {
          return await get("doctors");
        } catch (error) {
          throw new Error(toErrorMessage(error, "Failed to fetch doctors"));
        }
      },
      getAppointments: async () => {
        try {
          return await get("appointments");
        } catch (error) {
          throw new Error(toErrorMessage(error, "Failed to fetch appointments"));
        }
      },
      getBeds: async () => {
        try {
          return await get("beds");
        } catch (error) {
          throw new Error(toErrorMessage(error, "Failed to fetch beds"));
        }
      },
      getBloodBank: async () => {
        try {
          return await get("bloodBank");
        } catch (error) {
          throw new Error(toErrorMessage(error, "Failed to fetch blood bank"));
        }
      },
      createAppointment: async (data) => {
        try {
          const appointmentResult = await post("createAppointment", data);

          const patientName = String(data?.patient_name || "").trim();
          const doctorName = String(data?.doctor || "").trim();

          if (patientName) {
            const existingPatients = await get("patients");
            const alreadyExists = existingPatients.some(
              (patient) =>
                String(patient.name || "")
                  .trim()
                  .toLowerCase() === patientName.toLowerCase(),
            );

            if (!alreadyExists) {
              await post("addPatient", {
                name: patientName,
                age: "",
                disease: "",
                doctor: doctorName,
              });
            }
          }

          return appointmentResult;
        } catch (error) {
          throw new Error(toErrorMessage(error, "Failed to create appointment"));
        }
      },
      addPatient: async (data) => {
        try {
          return await post("addPatient", data);
        } catch (error) {
          throw new Error(toErrorMessage(error, "Failed to add patient"));
        }
      },
    }),
    [get, post],
  );
};
