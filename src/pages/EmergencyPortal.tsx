import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Ambulance,
  Hospital,
  Navigation,
} from "lucide-react";
import {
  getBeds,
  getHospitals,
  type BedRow,
  type HospitalRow,
} from "../api/googleSheets";

type HospitalDirectoryInfo = {
  emergencyDesk: string;
  ambulanceLine: string;
  tollFree: string;
  email: string;
  website: string;
  city: string;
  state: string;
  landmark: string;
  specialties: string[];
};

const hospitalDirectoryById: Record<string, HospitalDirectoryInfo> = {
  HOSP001: {
    emergencyDesk: "+91 33 2320 2122",
    ambulanceLine: "+91 33 2320 3040",
    tollFree: "1800 3000 2122",
    email: "emergency.apollo@hindseva.in",
    website: "www.apollohospitals.com",
    city: "Kolkata",
    state: "West Bengal",
    landmark: "Canal Circular Road",
    specialties: ["Trauma", "Cardiac", "ICU", "Stroke"],
  },
  HOSP002: {
    emergencyDesk: "+91 33 6652 0000",
    ambulanceLine: "+91 33 6652 0108",
    tollFree: "1800 345 6652",
    email: "emergency.medica@hindseva.in",
    website: "www.medicahospitals.in",
    city: "Kolkata",
    state: "West Bengal",
    landmark: "Mukundpur",
    specialties: ["Emergency Medicine", "Neuro", "Cardiac", "Critical Care"],
  },
  HOSP003: {
    emergencyDesk: "+91 33 6606 3800",
    ambulanceLine: "+91 33 6606 3108",
    tollFree: "1800 120 6606",
    email: "er.amri@hindseva.in",
    website: "www.amrihospitals.in",
    city: "Kolkata",
    state: "West Bengal",
    landmark: "Mukundapur",
    specialties: ["Emergency", "Pediatrics", "Trauma", "Orthopedics"],
  },
  HOSP004: {
    emergencyDesk: "+91 33 6687 1800",
    ambulanceLine: "+91 33 6687 1900",
    tollFree: "1800 258 6687",
    email: "care.ruby@hindseva.in",
    website: "www.rubyhospital.com",
    city: "Kolkata",
    state: "West Bengal",
    landmark: "Kasba Golpark",
    specialties: ["24x7 ER", "Cardiac", "Neurology", "General Surgery"],
  },
  HOSP005: {
    emergencyDesk: "+91 33 4011 1222",
    ambulanceLine: "+91 33 4011 1108",
    tollFree: "1800 212 4011",
    email: "emergency.peerless@hindseva.in",
    website: "www.peerlesshospital.com",
    city: "Kolkata",
    state: "West Bengal",
    landmark: "Panchasayar",
    specialties: ["Emergency", "Cardiology", "ICU", "Dialysis"],
  },
  HOSP006: {
    emergencyDesk: "+91 33 4020 6500",
    ambulanceLine: "+91 33 4020 6108",
    tollFree: "1800 891 4020",
    email: "er.ils@hindseva.in",
    website: "www.ilshospitals.com",
    city: "Kolkata",
    state: "West Bengal",
    landmark: "Salt Lake Sector 1",
    specialties: ["Emergency", "ICU", "Pulmonology", "Internal Medicine"],
  },
};

const defaultHospitalDirectoryInfo: HospitalDirectoryInfo = {
  emergencyDesk: "N/A",
  ambulanceLine: "N/A",
  tollFree: "N/A",
  email: "N/A",
  website: "N/A",
  city: "Kolkata",
  state: "West Bengal",
  landmark: "Hospital Campus",
  specialties: ["Emergency", "Critical Care"],
};

const indiaEmergencyHelplines = [
  {
    label: "National Emergency Response",
    number: "112",
    note: "Pan-India (Police, Fire, Ambulance)",
  },
  {
    label: "National Ambulance",
    number: "108",
    note: "Emergency ambulance service",
  },
  {
    label: "Health Helpline",
    number: "1075",
    note: "National public health helpline",
  },
  { label: "Women Helpline", number: "181", note: "Women in distress" },
  { label: "Child Helpline", number: "1098", note: "Child emergency support" },
];

const globalEmergencyHelplines = [
  {
    label: "International GSM Emergency",
    number: "112",
    note: "Works on most GSM networks worldwide",
  },
  {
    label: "USA/Canada Emergency",
    number: "911",
    note: "Police, Fire, Ambulance",
  },
  { label: "UK Emergency", number: "999", note: "Police, Fire, Ambulance" },
  {
    label: "Australia Emergency",
    number: "000",
    note: "Police, Fire, Ambulance",
  },
  {
    label: "European Union Emergency",
    number: "112",
    note: "All EU countries",
  },
];

const isAvailableBed = (status: string) =>
  /avail|free|vacant|open/i.test(status);

const getHospitalDirectoryInfo = (hospital: HospitalRow) => {
  const directMatch = hospitalDirectoryById[hospital.hospitalId];
  if (directMatch) {
    return directMatch;
  }

  const normalizedName = hospital.name.trim().toLowerCase();
  const fallbackMatch = Object.entries(hospitalDirectoryById).find(([, info]) =>
    normalizedName.includes(info.landmark.toLowerCase().split(" ")[0]),
  );

  return fallbackMatch?.[1] ?? defaultHospitalDirectoryInfo;
};

const EmergencyPortal = () => {
  const [activeTab, setActiveTab] = useState<"contacts" | "sos">("contacts");
  const [sosTriggered, setSosTriggered] = useState(false);
  const [selectedHospitalIndex, setSelectedHospitalIndex] = useState(0);
  const [sosReference, setSosReference] = useState<string | null>(null);
  const [sosActionMessage, setSosActionMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [beds, setBeds] = useState<BedRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        const [hospitalRows, bedRows] = await Promise.all([
          getHospitals(),
          getBeds(),
        ]);
        if (cancelled) {
          return;
        }
        setHospitals(hospitalRows);
        setBeds(bedRows);
      } catch (apiError) {
        if (!cancelled) {
          setError(
            apiError instanceof Error
              ? apiError.message
              : "Failed to load emergency data",
          );
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const nearestHospital =
    hospitals[selectedHospitalIndex] ?? hospitals[0] ?? null;

  const bedSummaryByHospital = useMemo(() => {
    return hospitals.reduce<
      Record<string, { icu: number; oxygen: number; general: number }>
    >((summary, hospital) => {
      const hospitalBeds = beds.filter(
        (bed) => bed.hospitalId === hospital.hospitalId,
      );

      summary[hospital.hospitalId] = {
        icu: hospitalBeds.filter(
          (bed) => /icu/i.test(bed.type) && isAvailableBed(bed.status),
        ).length,
        oxygen: hospitalBeds.filter(
          (bed) => /oxygen/i.test(bed.type) && isAvailableBed(bed.status),
        ).length,
        general: hospitalBeds.filter(
          (bed) => /general/i.test(bed.type) && isAvailableBed(bed.status),
        ).length,
      };

      return summary;
    }, {});
  }, [beds, hospitals]);

  const nearestBedSummary = useMemo(() => {
    if (!nearestHospital) {
      return { icu: 0, oxygen: 0, general: 0 };
    }

    const hospitalBeds = beds.filter(
      (bed) => bed.hospitalId === nearestHospital.hospitalId,
    );
    return {
      icu: hospitalBeds.filter(
        (bed) => /icu/i.test(bed.type) && isAvailableBed(bed.status),
      ).length,
      oxygen: hospitalBeds.filter(
        (bed) => /oxygen/i.test(bed.type) && isAvailableBed(bed.status),
      ).length,
      general: hospitalBeds.filter(
        (bed) => /general/i.test(bed.type) && isAvailableBed(bed.status),
      ).length,
    };
  }, [beds, nearestHospital]);

  const triggerSOS = () => {
    setSelectedHospitalIndex(0);
    setSosReference(`SOS-${Date.now().toString().slice(-8)}`);
    setSosActionMessage("Emergency request registered and dispatch initiated.");
    setSosTriggered(true);
  };

  const sanitizePhoneNumber = (phone: string) =>
    phone.replace(/[^\d+]/g, "").trim();

  const callNumber = (phone: string, label: string) => {
    const sanitized = sanitizePhoneNumber(phone);
    if (!sanitized || sanitized === "N/A") {
      setSosActionMessage(`${label} number is currently unavailable.`);
      return;
    }
    window.location.href = `tel:${sanitized}`;
  };

  const rerouteToNextHospital = () => {
    if (hospitals.length <= 1) {
      setSosActionMessage("No alternate hospital available for rerouting.");
      return;
    }

    setSelectedHospitalIndex((currentIndex) => {
      const nextIndex = (currentIndex + 1) % hospitals.length;
      const nextHospital = hospitals[nextIndex];
      setSosActionMessage(
        `Rerouted emergency to ${nextHospital?.name ?? "next hospital"}.`,
      );
      return nextIndex;
    });
  };

  const shareCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setSosActionMessage("Geolocation is not available on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setUserLocation({ latitude, longitude });

        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

        try {
          await navigator.clipboard.writeText(mapsUrl);
          setSosActionMessage(
            "Live location copied. Share it with ambulance or emergency desk.",
          );
        } catch {
          setSosActionMessage(`Location link: ${mapsUrl}`);
        }
      },
      () => {
        setSosActionMessage(
          "Unable to fetch live location. Please enable location permission.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const copySosReference = async () => {
    if (!sosReference) {
      setSosActionMessage("SOS reference is not available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(sosReference);
      setSosActionMessage("SOS reference copied.");
    } catch {
      setSosActionMessage(`SOS reference: ${sosReference}`);
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
            <div className="w-10 h-10 rounded-xl bg-emergency flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-emergency-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Emergency Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                No login required • Public access
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-emergency mb-4">{error}</p>}

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "contacts"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent border border-border"
              }`}
            >
              <Hospital className="w-4 h-4" /> Hospital Contacts
            </button>
            <button
              onClick={() => setActiveTab("sos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "sos"
                  ? "bg-emergency text-emergency-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent border border-border"
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> SOS System
            </button>
          </div>

          {activeTab === "contacts" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {hospitals.map((hospital) => {
                  const details = getHospitalDirectoryInfo(hospital);
                  const bedSummary = bedSummaryByHospital[
                    hospital.hospitalId
                  ] ?? {
                    icu: 0,
                    oxygen: 0,
                    general: 0,
                  };

                  return (
                    <motion.div
                      key={hospital.hospitalId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-xl p-5 border border-border shadow-card"
                    >
                      <h3 className="font-display font-semibold text-foreground mb-3">
                        {hospital.name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-xs text-muted-foreground">
                          Hospital ID: {hospital.hospitalId}
                        </p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {hospital.address || "Address unavailable"},{" "}
                          {details.landmark}, {details.city}, {details.state}
                        </div>
                        <a
                          href={`tel:${hospital.phone || details.emergencyDesk}`}
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <Phone className="w-4 h-4" /> Main Contact:{" "}
                          {hospital.phone || details.emergencyDesk}
                        </a>
                        <a
                          href={`tel:${details.emergencyDesk}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Emergency Desk: {details.emergencyDesk}
                        </a>
                        <a
                          href={`tel:${details.ambulanceLine}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Ambulance Line: {details.ambulanceLine}
                        </a>
                        <a
                          href={`tel:${details.tollFree}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Toll Free: {details.tollFree}
                        </a>
                        <p className="text-muted-foreground">
                          Email: {details.email}
                        </p>
                        <p className="text-muted-foreground">
                          Website: {details.website}
                        </p>
                        <p className="text-muted-foreground">
                          Specialties: {details.specialties.join(", ")}
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-center">
                          <div className="bg-background border border-border rounded-md px-2 py-1">
                            ICU: {bedSummary.icu}
                          </div>
                          <div className="bg-background border border-border rounded-md px-2 py-1">
                            Oxygen: {bedSummary.oxygen}
                          </div>
                          <div className="bg-background border border-border rounded-md px-2 py-1">
                            General: {bedSummary.general}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <h3 className="font-display font-semibold text-foreground mb-3">
                    India Emergency & Toll Free
                  </h3>
                  <div className="space-y-3">
                    {indiaEmergencyHelplines.map((line) => (
                      <a
                        key={line.label}
                        href={`tel:${line.number}`}
                        className="block rounded-lg border border-border bg-background px-3 py-2 hover:bg-accent transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {line.label}
                        </p>
                        <p className="text-primary text-sm">{line.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.note}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <h3 className="font-display font-semibold text-foreground mb-3">
                    Worldwide Emergency Numbers
                  </h3>
                  <div className="space-y-3">
                    {globalEmergencyHelplines.map((line) => (
                      <a
                        key={line.label}
                        href={`tel:${line.number}`}
                        className="block rounded-lg border border-border bg-background px-3 py-2 hover:bg-accent transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {line.label}
                        </p>
                        <p className="text-primary text-sm">{line.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.note}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sos" && (
            <div className="flex flex-col items-center py-12">
              {!sosTriggered ? (
                <>
                  <p className="text-muted-foreground mb-8 text-center max-w-md">
                    Press SOS to auto-select nearest hospital and route your
                    request with hospital_id.
                  </p>
                  <motion.button
                    onClick={triggerSOS}
                    className="w-40 h-40 rounded-full bg-emergency text-emergency-foreground flex flex-col items-center justify-center gap-2 animate-sos-pulse"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AlertTriangle className="w-12 h-12" />
                    <span className="text-xl font-display font-bold">SOS</span>
                  </motion.button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 max-w-md"
                >
                  <div className="w-20 h-20 rounded-full bg-emergency/10 flex items-center justify-center mx-auto animate-pulse-glow">
                    <Ambulance className="w-10 h-10 text-emergency" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Help is on the way!
                  </h2>
                  <p className="text-muted-foreground">
                    Emergency routed to{" "}
                    <span className="text-foreground font-medium">
                      {nearestHospital?.name ?? "Nearest hospital"}
                    </span>
                    .
                  </p>
                  {sosReference ? (
                    <p className="text-xs text-muted-foreground">
                      Reference ID: {sosReference}
                    </p>
                  ) : null}
                  <div className="bg-card rounded-xl p-4 border border-border shadow-card text-left">
                    <p className="text-xs text-muted-foreground mb-2">
                      Hospital ID
                    </p>
                    <p className="text-sm text-foreground mb-3">
                      {nearestHospital?.hospitalId ?? "N/A"}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p
                          className={`font-bold ${nearestBedSummary.icu < 3 ? "text-emergency" : "text-success"}`}
                        >
                          {nearestBedSummary.icu}
                        </p>
                        <p className="text-muted-foreground text-xs">ICU</p>
                      </div>
                      <div>
                        <p className="font-bold text-success">
                          {nearestBedSummary.oxygen}
                        </p>
                        <p className="text-muted-foreground text-xs">Oxygen</p>
                      </div>
                      <div>
                        <p className="font-bold text-success">
                          {nearestBedSummary.general}
                        </p>
                        <p className="text-muted-foreground text-xs">General</p>
                      </div>
                    </div>
                    <div className="h-24 bg-muted rounded-lg flex items-center justify-center mt-4">
                      <Navigation className="w-6 h-6 text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Live tracking placeholder
                      </span>
                    </div>
                    {userLocation ? (
                      <p className="text-xs text-muted-foreground mt-3">
                        Current location: {userLocation.latitude.toFixed(5)},{" "}
                        {userLocation.longitude.toFixed(5)}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    <button
                      onClick={() => callNumber("112", "National emergency")}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      Call 112 Emergency
                    </button>
                    <button
                      onClick={() =>
                        callNumber(
                          nearestHospital?.phone ||
                            getHospitalDirectoryInfo(
                              nearestHospital ?? {
                                hospitalId: "",
                                name: "",
                                address: "",
                                phone: "",
                              },
                            ).emergencyDesk,
                          "Nearest hospital",
                        )
                      }
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      Call Nearest Hospital
                    </button>
                    <button
                      onClick={shareCurrentLocation}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      Share Live Location
                    </button>
                    <button
                      onClick={rerouteToNextHospital}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      Reroute to Next Hospital
                    </button>
                    <button
                      onClick={copySosReference}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors sm:col-span-2"
                    >
                      Copy SOS Reference
                    </button>
                  </div>

                  {sosActionMessage ? (
                    <p className="text-xs text-muted-foreground">
                      {sosActionMessage}
                    </p>
                  ) : null}
                  <button
                    onClick={() => {
                      setSosTriggered(false);
                      setSosActionMessage(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Cancel Emergency
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyPortal;
