import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import IccitSplashLoader from "@/components/IccitSplashLoader";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Sphere,
  Graticule,
} from "react-simple-maps";
import {
  Shield,
  ClipboardList,
  User,
  AlertTriangle,
  ArrowRight,
  Heart,
  MapPin,
  X,
  Phone,
  Truck,
  Hospital,
  Navigation,
  Siren,
  LayoutDashboard,
  Clock,
  ChevronDown,
} from "lucide-react";

const geoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

type Coordinates = [number, number];

type HospitalUnit = {
  id: number;
  name: string;
  coordinates: Coordinates;
  phone: string;
  address: string;
  status: string;
};

type AmbulanceUnit = {
  id: string;
  name: string;
  coordinates: Coordinates;
  contact: string;
};

type NearbyHospitalUnit = {
  id: string | number;
  name: string;
  coordinates: Coordinates;
  address: string;
  phone: string;
  status: string;
  source: "listed" | "discovered";
};

type GeofenceStatus = {
  inZone: boolean;
  label: string;
};

// Verified West Bengal Hospital Hubs
const hospitalData: HospitalUnit[] = [
  {
    id: 1,
    name: "Apollo Multispeciality Kolkata",
    coordinates: [88.4019, 22.5684] as Coordinates,
    phone: "033 2320 2122",
    address: "58, Canal Circular Rd",
    status: "Active",
  },
  {
    id: 2,
    name: "Medica Superspecialty",
    coordinates: [88.3934, 22.4862] as Coordinates,
    phone: "033 6652 0000",
    address: "127 Mukundpur",
    status: "Optimal",
  },
  {
    id: 3,
    name: "AMRI Hospital Mukundapur",
    coordinates: [88.4016, 22.4852] as Coordinates,
    phone: "033 6606 3800",
    address: "230, Pano Rd",
    status: "Active",
  },
  {
    id: 4,
    name: "Ruby General Hospital",
    coordinates: [88.4035, 22.513] as Coordinates,
    phone: "033 6687 1800",
    address: "Kasba Golpark",
    status: "Optimal",
  },
  {
    id: 5,
    name: "Peerless Hospital",
    coordinates: [88.3965, 22.4815] as Coordinates,
    phone: "033 4011 1222",
    address: "360, Panchasayar Rd",
    status: "Active",
  },
  {
    id: 6,
    name: "ILS Hospital Salt Lake",
    coordinates: [88.4057, 22.5835] as Coordinates,
    phone: "033 4020 6500",
    address: "DD 6, Sector 1",
    status: "Active",
  },
];

const initialAmbulances: AmbulanceUnit[] = [
  {
    id: "WB-01-AMB-102",
    name: "Unit Alpha",
    coordinates: [88.3639, 22.5726] as Coordinates,
    contact: "+91 98300 12345",
  },
  {
    id: "WB-01-AMB-405",
    name: "Unit Bravo",
    coordinates: [88.432, 22.61] as Coordinates,
    contact: "+91 98300 54321",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<"network" | "ambulance">(
    "network",
  );
  const [heroRotation, setHeroRotation] = useState<[number, number, number]>([
    -88, -22, 0,
  ]);
  const [rotation, setRotation] = useState<[number, number, number]>([
    -88, -22, 0,
  ]);
  const [zoom, setZoom] = useState(240);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [ambulances, setAmbulances] = useState(initialAmbulances);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [discoveredHospitals, setDiscoveredHospitals] = useState<
    NearbyHospitalUnit[]
  >([]);
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus | null>(
    null,
  );

  const fallbackReferencePoint: Coordinates = [88.3639, 22.5726];
  const geofenceBounds = {
    minLongitude: 88.25,
    maxLongitude: 88.55,
    minLatitude: 22.45,
    maxLatitude: 22.7,
  };

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const getDistanceInKm = (from: Coordinates, to: Coordinates) => {
    const earthRadiusKm = 6371;
    const latitudeDelta = toRadians(to[1] - from[1]);
    const longitudeDelta = toRadians(to[0] - from[0]);

    const fromLatitude = toRadians(from[1]);
    const toLatitude = toRadians(to[1]);

    const haversineValue =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(fromLatitude) *
        Math.cos(toLatitude) *
        Math.sin(longitudeDelta / 2) ** 2;

    const centralAngle =
      2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));
    return earthRadiusKm * centralAngle;
  };

  const referencePoint: Coordinates =
    selectedUnit?.coordinates || userLocation || fallbackReferencePoint;

  const listedHospitalUnits: NearbyHospitalUnit[] = hospitalData.map(
    (hospital) => ({
      ...hospital,
      source: "listed",
    }),
  );

  const mergedHospitals = [
    ...listedHospitalUnits,
    ...discoveredHospitals,
  ].reduce<NearbyHospitalUnit[]>((accumulator, hospital) => {
    const normalizedName = hospital.name.trim().toLowerCase();
    const duplicate = accumulator.find((existingHospital) => {
      const sameName =
        existingHospital.name.trim().toLowerCase() === normalizedName;
      const closeByDistance =
        getDistanceInKm(existingHospital.coordinates, hospital.coordinates) <
        0.2;
      return sameName || closeByDistance;
    });

    if (!duplicate) {
      accumulator.push(hospital);
    }

    return accumulator;
  }, []);

  const filteredHospitals = mergedHospitals
    .map((hospital) => ({
      ...hospital,
      distanceKm: getDistanceInKm(referencePoint, hospital.coordinates),
    }))
    .filter((hospital) => {
      if (!searchQuery.trim()) {
        return hospital.distanceKm <= 5;
      }

      return hospital.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
    })
    .sort((first, second) => first.distanceKm - second.distanceKm);

  const hiddenHospitalsCount =
    mergedHospitals.length - filteredHospitals.length;

  // Live Tracking Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((amb) => ({
          ...amb,
          coordinates: [
            amb.coordinates[0] + (Math.random() - 0.5) * 0.005,
            amb.coordinates[1] + (Math.random() - 0.5) * 0.005,
          ] as Coordinates,
        })),
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.longitude, position.coords.latitude]);
      },
      () => {
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      },
    );
  }, []);

  useEffect(() => {
    const [longitude, latitude] = userLocation || referencePoint;

    const inZone =
      longitude >= geofenceBounds.minLongitude &&
      longitude <= geofenceBounds.maxLongitude &&
      latitude >= geofenceBounds.minLatitude &&
      latitude <= geofenceBounds.maxLatitude;

    setGeofenceStatus({
      inZone,
      label: inZone ? "Inside Kolkata geofence" : "Outside Kolkata geofence",
    });
  }, [referencePoint, userLocation]);

  useEffect(() => {
    const controller = new AbortController();
    const [longitude, latitude] = referencePoint;

    const fetchNearbyHospitals = async () => {
      try {
        const overpassQuery = `[out:json][timeout:20];(node["amenity"="hospital"](around:5000,${latitude},${longitude});way["amenity"="hospital"](around:5000,${latitude},${longitude});relation["amenity"="hospital"](around:5000,${latitude},${longitude}););out center tags;`;

        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            body: overpassQuery,
            signal: controller.signal,
            headers: {
              "Content-Type": "text/plain;charset=UTF-8",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to fetch nearby hospitals");
        }

        const data = await response.json();

        const mappedHospitals: NearbyHospitalUnit[] = (data.elements || [])
          .map((element: any) => {
            const elementLatitude = element.lat ?? element.center?.lat;
            const elementLongitude = element.lon ?? element.center?.lon;

            if (
              typeof elementLatitude !== "number" ||
              typeof elementLongitude !== "number"
            ) {
              return null;
            }

            return {
              id: `osm-${element.type}-${element.id}`,
              name: element.tags?.name || "Unnamed Hospital",
              coordinates: [elementLongitude, elementLatitude] as Coordinates,
              phone: element.tags?.phone || "N/A",
              address:
                element.tags?.["addr:full"] ||
                [
                  element.tags?.["addr:housenumber"],
                  element.tags?.["addr:street"],
                  element.tags?.["addr:city"],
                ]
                  .filter(Boolean)
                  .join(", ") ||
                "Address unavailable",
              status: "Discovered Nearby",
              source: "discovered",
            };
          })
          .filter(Boolean)
          .slice(0, 30);

        setDiscoveredHospitals(mappedHospitals);
      } catch {
        if (!controller.signal.aborted) {
          setDiscoveredHospitals([]);
        }
      }
    };

    fetchNearbyHospitals();

    return () => {
      controller.abort();
    };
  }, [referencePoint]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroRotation(([longitude, latitude]) => [
        longitude - 0.16,
        latitude,
        0,
      ]);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <IccitSplashLoader>
      <div className="min-h-screen bg-[#06080a] text-white overflow-x-hidden selection:bg-blue-500/30">
        {/* SECTION 1: FULL SCREEN WELCOME WITH BACKGROUND MAP */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          {/* Transparent Movable Background Map */}
          <div className="absolute inset-0 z-0 opacity-40 cursor-grab active:cursor-grabbing">
            <ComposableMap
              projection="geoOrthographic"
              projectionConfig={{ scale: 380, rotate: heroRotation }}
              className="w-full h-full"
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  setHeroRotation(([longitude, latitude]) => [
                    longitude + e.movementX * 0.2,
                    latitude - e.movementY * 0.2,
                    0,
                  ]);
                }
              }}
            >
              <Sphere
                id="sphere"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth={0.5}
              />
              <Graticule stroke="#1e293b" strokeWidth={0.3} />
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#111827"
                      stroke="#1e293b"
                      strokeWidth={0.5}
                    />
                  ))
                }
              </Geographies>
              {/* Hospital Markers on the background map */}
              {hospitalData.map((h) => (
                <Marker key={h.id} coordinates={h.coordinates}>
                  <circle r={3} fill="#3b82f6" opacity={0.6} />
                </Marker>
              ))}
            </ComposableMap>
          </div>

          {/* Hero Content Overlay */}
          <div className="container mx-auto px-6 relative z-10 text-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 text-blue-400 backdrop-blur-md">
                <Heart size={16} className="fill-blue-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  National Digital Health Mission
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
                Welcome to <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 italic">
                  Hind Svaasth Seva
                </span>
              </h1>

              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                Experience the unified command of India's healthcare grid. Spin
                the globe behind you to explore, or scroll down to enter the
                command center.
              </p>

              <div className="flex flex-wrap justify-center gap-5 pointer-events-auto">
                <Link
                  to="/emergency"
                  className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-red-600 hover:bg-red-500 font-bold transition-all shadow-2xl shadow-red-900/40"
                >
                  <AlertTriangle size={22} /> EMERGENCY SOS
                </Link>
                <button
                  onClick={() =>
                    document
                      .getElementById("grid-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all backdrop-blur-md"
                >
                  COMMAND CENTER <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500"
          >
            <ChevronDown size={32} />
          </motion.div>
        </section>

        {/* SECTION 2: COMMAND CENTER (REDUCED EARTH SIZE) */}
        <section
          id="grid-section"
          className="grid lg:grid-cols-12 h-[calc(100vh-120px)] border-t border-white/5 bg-[#06080a] relative z-20"
        >
          {/* Left Panel: Unit Selection */}
          <div className="lg:col-span-4 p-8 bg-[#090b0e] border-r border-white/5 overflow-y-auto">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-8">
              <button
                onClick={() => {
                  setActiveTab("network");
                  setSelectedUnit(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold transition-all ${activeTab === "network" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <LayoutDashboard size={14} /> NETWORK HUB
              </button>
              <button
                onClick={() => {
                  setActiveTab("ambulance");
                  setSelectedUnit(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold transition-all ${activeTab === "ambulance" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <Siren size={14} /> LIVE DISPATCH
              </button>
            </div>

            {activeTab === "network" && (
              <div className="mb-4 space-y-3">
                <div
                  className={`rounded-xl border px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${geofenceStatus?.inZone ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"}`}
                >
                  {geofenceStatus?.label || "Checking geofence"}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search hospital by name"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                />
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {searchQuery.trim()
                    ? `Showing search results (${filteredHospitals.length})`
                    : `Showing hospitals within 5 km (${filteredHospitals.length})`}
                  {hiddenHospitalsCount > 0 && !searchQuery.trim()
                    ? ` • ${hiddenHospitalsCount} hidden, use search`
                    : ""}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(activeTab === "network" ? filteredHospitals : ambulances).map(
                (item: any) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedUnit(item);
                      setRotation([
                        -item.coordinates[0],
                        -item.coordinates[1],
                        0,
                      ]);
                      setZoom(1200);
                    }}
                    className={`w-full p-5 rounded-2xl border text-left transition-all ${selectedUnit?.id === item.id ? (activeTab === "network" ? "bg-blue-600 border-blue-400" : "bg-red-600 border-red-400") : "bg-white/5 border-white/5 hover:border-slate-700"}`}
                  >
                    <div className="font-bold text-sm mb-1">
                      {item.name || item.id}
                    </div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest italic">
                      {item.status || "Live Unit"}
                    </div>
                    {activeTab === "network" &&
                      item.source === "discovered" && (
                        <div className="text-[10px] text-emerald-300/90 font-semibold mt-2 uppercase tracking-widest">
                          External nearby source
                        </div>
                      )}
                    {activeTab === "network" &&
                      item.distanceKm !== undefined && (
                        <div className="text-[10px] text-blue-300/90 font-semibold mt-2">
                          {item.distanceKm.toFixed(1)} km away
                        </div>
                      )}
                  </button>
                ),
              )}

              {activeTab === "network" && filteredHospitals.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-xs text-slate-400">
                  No hospitals found. Try a different search term.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Focused Intelligence Globe */}
          <div className="lg:col-span-8 relative flex items-center justify-center bg-[#06080a] p-12 overflow-hidden">
            <AnimatePresence>
              {selectedUnit && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute top-10 right-10 z-40 w-72 p-7 rounded-[2.5rem] bg-[#0d1016]/95 border border-blue-500/20 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-white uppercase">
                      {selectedUnit.name || selectedUnit.id}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedUnit(null);
                        setZoom(240);
                      }}
                      className="p-1 hover:bg-white/5 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <Phone size={14} className="text-blue-500" />{" "}
                      {selectedUnit.phone || selectedUnit.contact}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <Clock size={14} className="text-emerald-500" /> 24/7
                      Availability
                    </div>
                  </div>
                  <button className="w-full py-4 rounded-2xl bg-blue-600 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40">
                    Open Communication
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Focused Globe Container */}
            <div className="w-full max-w-[480px] aspect-square relative transition-transform">
              <ComposableMap
                projection="geoOrthographic"
                projectionConfig={{ scale: zoom, rotate: rotation }}
              >
                <Sphere
                  id="sphere-2"
                  fill="#0c0e12"
                  stroke="#1e293b"
                  strokeWidth={0.5}
                />
                <Graticule stroke="#1e293b" strokeWidth={0.3} />
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#151921"
                        stroke="#1e293b"
                        strokeWidth={0.5}
                      />
                    ))
                  }
                </Geographies>

                {mergedHospitals.map((h) => (
                  <Marker key={h.id} coordinates={h.coordinates}>
                    <circle
                      r={selectedUnit?.id === h.id ? 8 : 4}
                      fill={h.source === "discovered" ? "#10b981" : "#3b82f6"}
                    />
                    <circle
                      r={12}
                      fill={h.source === "discovered" ? "#10b981" : "#3b82f6"}
                      opacity={0.15}
                      className="animate-pulse"
                    />
                  </Marker>
                ))}

                {activeTab === "ambulance" &&
                  ambulances.map((amb) => (
                    <Marker key={amb.id} coordinates={amb.coordinates}>
                      <circle r={6} fill="#ef4444" className="animate-pulse" />
                      <circle
                        r={14}
                        fill="#ef4444"
                        opacity={0.2}
                        className="animate-ping"
                      />
                    </Marker>
                  ))}
              </ComposableMap>
              <div className="absolute inset-0 border border-blue-500/10 rounded-full pointer-events-none scale-110 opacity-30" />
            </div>

            <div className="absolute bottom-8 right-8 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">
              Tactical Grid 4.0.2 // WB Sector
            </div>
          </div>
        </section>

        {/* FOOTER GATEWAYS */}
        <section className="py-32 container mx-auto px-6 border-t border-white/5 bg-[#06080a]">
          <h2 className="text-3xl font-black mb-20 text-center tracking-tight uppercase">
            Operational Portals
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <PortalCard title="Super Admin" icon={Shield} color="blue" />
            <PortalCard
              title="Receptionist"
              icon={ClipboardList}
              color="indigo"
            />
            <PortalCard title="Patient Portal" icon={User} color="emerald" />
          </div>
        </section>
      </div>
    </IccitSplashLoader>
  );
};

const PortalCard = ({ title, icon: Icon, color }: any) => (
  <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}
    >
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-bold mb-5 tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
      Verified enterprise access for authorized medical infrastructure and
      national health IDs.
    </p>
    <div className="flex items-center gap-3 text-xs font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">
      Enter Portal{" "}
      <ArrowRight
        size={16}
        className="group-hover:translate-x-2 transition-transform"
      />
    </div>
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
  </div>
);

export default Index;
