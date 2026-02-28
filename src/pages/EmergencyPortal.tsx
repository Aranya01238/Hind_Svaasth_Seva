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

const isAvailableBed = (status: string) =>
  /avail|free|vacant|open/i.test(status);

const EmergencyPortal = () => {
  const [activeTab, setActiveTab] = useState<"contacts" | "sos">("contacts");
  const [sosTriggered, setSosTriggered] = useState(false);
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

  const nearestHospital = hospitals[0] ?? null;

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
    setSosTriggered(true);
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
            <div className="grid md:grid-cols-2 gap-4">
              {hospitals.map((hospital) => (
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />{" "}
                      {hospital.address || "Address unavailable"}
                    </div>
                    {hospital.phone ? (
                      <a
                        href={`tel:${hospital.phone}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Phone className="w-4 h-4" /> {hospital.phone}
                      </a>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      Hospital ID: {hospital.hospitalId}
                    </p>
                  </div>
                </motion.div>
              ))}
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
                  </div>
                  <button
                    onClick={() => setSosTriggered(false)}
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
