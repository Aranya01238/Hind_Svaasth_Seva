const SHEET_ID = "1U4MmRMxxKbvCxiOZKkAKOEE0rIlu28fbvmVg_xkH6QQ";

const SHEET_GIDS = {
  patients: "402205425",
  hospitals: "1302077403",
  doctors: "1276984231",
  beds: "239389154",
  bloodBank: "841229088",
  equipment: "2018027396",
  appointments: "2022773412",
} as const;

type DatasetName =
  | "patients"
  | "hospitals"
  | "doctors"
  | "beds"
  | "bloodBank"
  | "equipment"
  | "appointments";

type JsonRow = Record<string, string>;

export type PatientRow = {
  patientId: string;
  name: string;
  age: string;
  disease: string;
  doctor: string;
  hospitalId: string;
  date: string;
};

export type HospitalRow = {
  hospitalId: string;
  name: string;
  phone: string;
  address: string;
};

export type DoctorRow = {
  doctorId: string;
  name: string;
  specialization: string;
  availableDays: string;
  hospitalId: string;
};

export type BedRow = {
  bedId: string;
  type: string;
  status: string;
  hospitalId: string;
};

export type BloodBankRow = {
  bloodGroup: string;
  units: string;
  hospitalId: string;
};

export type EquipmentRow = {
  equipmentName: string;
  quantity: string;
  status: string;
  hospitalId: string;
};

export type AppointmentRow = {
  appointmentId: string;
  patientName: string;
  doctor: string;
  date: string;
  hospitalId: string;
};

type AppointmentCreateInput = {
  patientName: string;
  age?: string;
  disease?: string;
  doctor: string;
  date: string;
  hospitalId: string;
};

type AddPatientInput = {
  name: string;
  age?: string;
  disease?: string;
  doctor?: string;
  hospitalId: string;
};

type SheetCell = {
  v?: string | number | boolean | null;
};

type GvizResponse = {
  table?: {
    cols?: Array<{ label?: string }>;
    rows?: Array<{ c?: SheetCell[] }>;
  };
};

const normalizeHeader = (header?: string) =>
  (header ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const normalizeRow = (row: Record<string, unknown>): JsonRow => {
  const normalized: JsonRow = {};

  Object.entries(row).forEach(([key, value]) => {
    normalized[normalizeHeader(key)] = value == null ? "" : String(value).trim();
  });

  return normalized;
};

const sheetUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${gid}&tqx=out:json`;

const parseGviz = (raw: string): GvizResponse => {
  const prefix = "google.visualization.Query.setResponse(";
  const start = raw.indexOf(prefix);
  if (start === -1) {
    throw new Error("Unable to parse Google Sheets response");
  }

  const jsonStart = start + prefix.length;
  const jsonEnd = raw.lastIndexOf(");");
  const jsonPayload = raw.slice(jsonStart, jsonEnd).trim();
  return JSON.parse(jsonPayload) as GvizResponse;
};

const appScriptBaseUrl = (import.meta.env.VITE_APPS_SCRIPT_URL ?? "").trim();
const appScriptApiKey = (import.meta.env.VITE_APPS_SCRIPT_API_KEY ?? "").trim();

const fetchRowsViaAppsScript = async (dataset: DatasetName, hospitalId?: string): Promise<JsonRow[]> => {
  const url = new URL(appScriptBaseUrl);
  url.searchParams.set("dataset", dataset);
  if (hospitalId) {
    url.searchParams.set("hospital_id", hospitalId);
  }
  if (appScriptApiKey) {
    url.searchParams.set("api_key", appScriptApiKey);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Apps Script fetch failed: ${response.status}`);
  }

  const json = (await response.json()) as { rows?: Array<Record<string, unknown>>; error?: string };

  if (json.error) {
    throw new Error(`Apps Script error: ${json.error}`);
  }

  const rows = Array.isArray(json.rows) ? json.rows : [];
  return rows.map(normalizeRow);
};

const fetchRowsDirect = async (gid: string): Promise<JsonRow[]> => {
  let response: Response;
  try {
    response = await fetch(sheetUrl(gid));
  } catch {
    throw new Error("Unable to reach Google Sheets. Configure VITE_APPS_SCRIPT_URL for private-sheet access.");
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Google Sheet is private. Configure Apps Script proxy and set VITE_APPS_SCRIPT_URL.");
    }

    throw new Error(`Sheet fetch failed: ${response.status}`);
  }

  const text = await response.text();
  const parsed = parseGviz(text);
  const cols = parsed.table?.cols ?? [];
  const rows = parsed.table?.rows ?? [];
  const headers = cols.map((col, index) => normalizeHeader(col.label || `column_${index + 1}`));

  return rows.map((row) => {
    const record: JsonRow = {};
    headers.forEach((header, index) => {
      const cellValue = row.c?.[index]?.v;
      record[header] = cellValue == null ? "" : String(cellValue).trim();
    });
    return record;
  });
};

const fetchRows = async (dataset: DatasetName, gid: string, hospitalId?: string): Promise<JsonRow[]> => {
  if (appScriptBaseUrl) {
    return fetchRowsViaAppsScript(dataset, hospitalId);
  }

  return fetchRowsDirect(gid);
};

const pick = (row: JsonRow, options: string[]) => {
  for (const option of options) {
    if (row[option]) {
      return row[option];
    }
  }
  return "";
};

const toHospitalId = (row: JsonRow) => pick(row, ["hospital_id", "hospitalid", "hospital"]);

const scoped = <T extends { hospitalId: string }>(rows: T[], hospitalId: string) =>
  rows.filter((row) => row.hospitalId === hospitalId);

const postToAppsScript = async (payload: Record<string, string>) => {
  if (!appScriptBaseUrl) {
    return {
      ok: true,
      mode: "local-only",
      payload,
    } as const;
  }

  const url = new URL(appScriptBaseUrl);
  if (appScriptApiKey) {
    url.searchParams.set("api_key", appScriptApiKey);
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Apps Script write failed: ${response.status}`);
  }

  return {
    ok: true,
    mode: "apps-script",
    payload,
  } as const;
};

export const getHospitals = async (): Promise<HospitalRow[]> => {
  const rows = await fetchRows("hospitals", SHEET_GIDS.hospitals);
  return rows
    .map((row) => ({
      hospitalId: toHospitalId(row),
      name: pick(row, ["name", "hospital_name", "hospital"]),
      phone: pick(row, ["phone", "contact", "contact_number"]),
      address: pick(row, ["address", "location"]),
    }))
    .filter((row) => row.hospitalId && row.name);
};

export const getPatients = async (hospitalId?: string): Promise<PatientRow[]> => {
  const rows = await fetchRows("patients", SHEET_GIDS.patients, hospitalId);
  const parsed = rows.map((row) => ({
    patientId: pick(row, ["patient_id", "patientid", "id"]),
    name: pick(row, ["name", "patient_name"]),
    age: pick(row, ["age"]),
    disease: pick(row, ["disease", "diagnosis"]),
    doctor: pick(row, ["doctor", "doctor_name"]),
    hospitalId: toHospitalId(row),
    date: pick(row, ["date", "visit_date"]),
  }));

  return hospitalId ? scoped(parsed, hospitalId) : parsed;
};

export const getDoctors = async (hospitalId?: string): Promise<DoctorRow[]> => {
  const rows = await fetchRows("doctors", SHEET_GIDS.doctors, hospitalId);
  const parsed = rows.map((row) => ({
    doctorId: pick(row, ["doctor_id", "doctorid", "id"]),
    name: pick(row, ["name", "doctor_name"]),
    specialization: pick(row, ["specialization", "speciality", "department"]),
    availableDays: pick(row, ["available_days", "availabledays", "schedule"]),
    hospitalId: toHospitalId(row),
  }));

  return hospitalId ? scoped(parsed, hospitalId) : parsed;
};

export const getBeds = async (hospitalId?: string): Promise<BedRow[]> => {
  const rows = await fetchRows("beds", SHEET_GIDS.beds, hospitalId);
  const parsed = rows.map((row) => ({
    bedId: pick(row, ["bed_id", "bedid", "id"]),
    type: pick(row, ["type", "bed_type"]),
    status: pick(row, ["status"]),
    hospitalId: toHospitalId(row),
  }));

  return hospitalId ? scoped(parsed, hospitalId) : parsed;
};

export const getBloodBank = async (hospitalId?: string): Promise<BloodBankRow[]> => {
  const rows = await fetchRows("bloodBank", SHEET_GIDS.bloodBank, hospitalId);
  const parsed = rows.map((row) => ({
    bloodGroup: pick(row, ["blood_group", "bloodgroup", "group"]),
    units: pick(row, ["units", "unit"]),
    hospitalId: toHospitalId(row),
  }));

  return hospitalId ? scoped(parsed, hospitalId) : parsed;
};

export const getEquipment = async (hospitalId?: string): Promise<EquipmentRow[]> => {
  const rows = await fetchRows("equipment", SHEET_GIDS.equipment, hospitalId);
  const parsed = rows.map((row) => ({
    equipmentName: pick(row, ["equipment_name", "equipment", "name"]),
    quantity: pick(row, ["quantity", "qty"]),
    status: pick(row, ["status"]),
    hospitalId: toHospitalId(row),
  }));

  return hospitalId ? scoped(parsed, hospitalId) : parsed;
};

export const getAppointments = async (hospitalId?: string): Promise<AppointmentRow[]> => {
  const rows = await fetchRows("appointments", SHEET_GIDS.appointments, hospitalId);
  const parsed = rows.map((row) => ({
    appointmentId: pick(row, ["appointment_id", "appointmentid", "id"]),
    patientName: pick(row, ["patient_name", "name"]),
    doctor: pick(row, ["doctor", "doctor_name"]),
    date: pick(row, ["date", "appointment_date"]),
    hospitalId: toHospitalId(row),
  }));

  return hospitalId ? scoped(parsed, hospitalId) : parsed;
};

export const addPatient = async (input: AddPatientInput) => {
  const payload = {
    action: "addPatient",
    name: input.name,
    age: input.age ?? "",
    disease: input.disease ?? "",
    doctor: input.doctor ?? "",
    hospital_id: input.hospitalId,
  };

  return postToAppsScript(payload);
};

export const ensurePatientExists = async (input: AddPatientInput) => {
  const patientName = input.name.trim().toLowerCase();
  if (!patientName) {
    return { created: false } as const;
  }

  const patients = await getPatients(input.hospitalId);
  const exists = patients.some(
    (patient) => patient.name.trim().toLowerCase() === patientName,
  );

  if (exists) {
    return { created: false } as const;
  }

  await addPatient(input);
  return { created: true } as const;
};

export const createAppointment = async (input: AppointmentCreateInput) => {
  const payload = {
    action: "createAppointment",
    appointment_id: `APT-${Date.now()}`,
    patient_name: input.patientName,
    doctor: input.doctor,
    date: input.date,
    hospital_id: input.hospitalId,
  };

  if (!appScriptBaseUrl) {
    const writeUrl = (import.meta.env.VITE_SHEETS_WRITE_URL ?? "").trim();
    if (!writeUrl) {
      return {
        ok: true,
        mode: "local-only",
        payload,
      } as const;
    }

    const response = await fetch(writeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to write appointment to sheet webhook");
    }

    return {
      ok: true,
      mode: "webhook",
      payload,
    } as const;
  }

  const appointmentResult = await postToAppsScript(payload);

  await ensurePatientExists({
    name: input.patientName,
    age: input.age ?? "",
    disease: input.disease ?? "",
    doctor: input.doctor,
    hospitalId: input.hospitalId,
  });

  return {
    ...appointmentResult,
  } as const;
};
