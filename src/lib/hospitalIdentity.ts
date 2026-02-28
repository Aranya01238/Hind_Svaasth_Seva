export type HospitalIdentity = {
  hospitalId: string;
  hospitalName: string;
};

type HospitalMapEntry = HospitalIdentity & {
  email: string;
};

const HOSPITAL_EMAIL_MAP: HospitalMapEntry[] = [
  {
    email: "admin.apollo@hindseva.in",
    hospitalId: "HOSP001",
    hospitalName: "Apollo Care Kolkata",
  },
  {
    email: "admin.medica@hindseva.in",
    hospitalId: "HOSP002",
    hospitalName: "Medica Superspeciality",
  },
  {
    email: "admin.amri@hindseva.in",
    hospitalId: "HOSP003",
    hospitalName: "AMRI Hospital",
  },
  {
    email: "admin.ruby@hindseva.in",
    hospitalId: "HOSP004",
    hospitalName: "Ruby General",
  },
  {
    email: "admin.peerless@hindseva.in",
    hospitalId: "HOSP005",
    hospitalName: "Peerless Hospital",
  },
  {
    email: "admin.ils@hindseva.in",
    hospitalId: "HOSP006",
    hospitalName: "ILS Hospital",
  },
];

const normalizeEmail = (email?: string | null) => (email ?? "").trim().toLowerCase();

export const getHospitalByEmail = (email?: string | null): HospitalIdentity | null => {
  const parsedEmail = normalizeEmail(email);
  if (!parsedEmail) {
    return null;
  }

  const match = HOSPITAL_EMAIL_MAP.find((entry) => entry.email === parsedEmail);
  if (!match) {
    return null;
  }

  return {
    hospitalId: match.hospitalId,
    hospitalName: match.hospitalName,
  };
};

export const getHospitalById = (hospitalId?: string | null): HospitalIdentity | null => {
  const parsedHospitalId = (hospitalId ?? "").trim().toUpperCase();
  if (!parsedHospitalId) {
    return null;
  }

  const match = HOSPITAL_EMAIL_MAP.find((entry) => entry.hospitalId === parsedHospitalId);
  if (!match) {
    return null;
  }

  return {
    hospitalId: match.hospitalId,
    hospitalName: match.hospitalName,
  };
};

export const allHospitalAccounts = HOSPITAL_EMAIL_MAP.map((entry) => ({
  hospitalId: entry.hospitalId,
  hospitalName: entry.hospitalName,
  email: entry.email,
}));
