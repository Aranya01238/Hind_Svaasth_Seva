const SPREADSHEET_ID = "1U4MmRMxxKbvCxiOZKkAKOEE0rIlu28fbvmVg_xkH6QQ";
const API_KEY = "hindseva_secure_2026";

const SHEETS = {
  patients: "Patients",
  hospitals: "Hospitals",
  doctors: "Doctors",
  beds: "Beds",
  bloodBank: "BloodBank",
  equipment: "Equipment",
  appointments: "Appointments",
};

const DATASET_ALIASES = {
  patients: "patients",
  hospitals: "hospitals",
  doctors: "doctors",
  beds: "beds",
  bloodbank: "bloodBank",
  blood_bank: "bloodBank",
  bloodBank: "bloodBank",
  equipment: "equipment",
  appointments: "appointments",
};

function authorize_(e) {
  const key = (e.parameter.api_key || "").trim();
  if (key !== API_KEY) {
    throw new Error("Unauthorized access");
  }
}

function resolveDataset_(datasetRaw) {
  const normalized = String(datasetRaw || "").trim();
  const lowered = normalized.toLowerCase();
  return DATASET_ALIASES[normalized] || DATASET_ALIASES[lowered] || "";
}

function doGet(e) {
  try {
    authorize_(e);

    const dataset = resolveDataset_(e.parameter.dataset || "");
    const hospitalId = (e.parameter.hospital_id || "").toUpperCase();

    if (!dataset || !SHEETS[dataset]) {
      return json_({ error: "Invalid dataset" }, 400);
    }

    const rows = readSheet_(SHEETS[dataset]);

    const filtered = hospitalId
      ? rows.filter(
          (r) => String(r.hospital_id || "").toUpperCase() === hospitalId,
        )
      : rows;

    return json_({ rows: filtered }, 200);
  } catch (err) {
    return json_(
      { error: err && err.message ? err.message : String(err) },
      500,
    );
  }
}

function doPost(e) {
  try {
    authorize_(e);

    const body = JSON.parse((e.postData && e.postData.contents) || "{}");
    const action = body.action;
    const hospitalId = (body.hospital_id || "").toUpperCase();

    if (!hospitalId) {
      return json_({ error: "hospital_id required" }, 400);
    }

    if (action === "addPatient") {
      appendRowByHeaders_(SHEETS.patients, {
        patient_id: generateId_("PAT"),
        name: body.name,
        age: body.age,
        disease: body.disease,
        doctor: body.doctor,
        date: new Date(),
        hospital_id: hospitalId,
      });
      return json_({ ok: true }, 200);
    }

    if (action === "addDoctor") {
      appendRowByHeaders_(SHEETS.doctors, {
        doctor_id: generateId_("DOC"),
        name: body.name,
        specialization: body.specialization,
        available_days: body.available_days,
        hospital_id: hospitalId,
      });
      return json_({ ok: true }, 200);
    }

    if (action === "updateBed") {
      appendRowByHeaders_(SHEETS.beds, {
        bed_id: generateId_("BED"),
        type: body.type,
        status: body.status,
        hospital_id: hospitalId,
      });
      return json_({ ok: true }, 200);
    }

    if (action === "updateBlood") {
      appendRowByHeaders_(SHEETS.bloodBank, {
        blood_group: body.blood_group,
        units: body.units,
        hospital_id: hospitalId,
      });
      return json_({ ok: true }, 200);
    }

    if (action === "addEquipment") {
      appendRowByHeaders_(SHEETS.equipment, {
        equipment_name: body.equipment_name,
        quantity: body.quantity,
        status: body.status,
        hospital_id: hospitalId,
      });
      return json_({ ok: true }, 200);
    }

    if (action === "createAppointment") {
      appendRowByHeaders_(SHEETS.appointments, {
        appointment_id: body.appointment_id || generateId_("APT"),
        patient_name: body.patient_name,
        doctor: body.doctor,
        date: body.date,
        hospital_id: hospitalId,
      });
      return json_({ ok: true }, 200);
    }

    return json_({ error: "Invalid action" }, 400);
  } catch (err) {
    return json_(
      { error: err && err.message ? err.message : String(err) },
      500,
    );
  }
}

function readSheet_(sheetName) {
  const sheet =
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }

  const data = sheet.getDataRange().getValues();
  if (!data.length) {
    return [];
  }

  const headers = data[0].map((h) => normalizeHeader_(h));
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }

  return rows;
}

function appendRowByHeaders_(sheetName, rowObj) {
  const sheet =
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((h) => normalizeHeader_(h));

  const row = headers.map((h) => (rowObj[h] == null ? "" : rowObj[h]));
  sheet.appendRow(row);
}

function normalizeHeader_(h) {
  return String(h || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function generateId_(prefix) {
  return prefix + "_" + new Date().getTime();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
