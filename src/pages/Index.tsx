import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
  Search,
} from "lucide-react";

const geoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

const hospitalData = [
  {
    id: 1,
    name: "Apollo Multispeciality Kolkata",
    coordinates: [88.4019, 22.5684],
    details: "58, Canal Circular Rd, Kadapara. 750+ Beds.",
    status: "Active",
  },
  {
    id: 2,
    name: "Medica Superspecialty",
    coordinates: [88.3934, 22.4862],
    details: "127 Mukundpur, EM Bypass. 400+ Beds.",
    status: "Optimal",
  },
  {
    id: 3,
    name: "AMRI Hospital Mukundapur",
    coordinates: [88.4016, 22.4852],
    details: "230, Pano Rd, Mukundapur. 180+ Beds.",
    status: "Active",
  },
  {
    id: 4,
    name: "Ruby General Hospital",
    coordinates: [88.4035, 22.513],
    details: "Kasba Golpark, EM Bypass. 316 Beds.",
    status: "Optimal",
  },
  {
    id: 5,
    name: "Peerless Hospital",
    coordinates: [88.3965, 22.4815],
    details: "360, Panchasayar Rd. 500+ Beds.",
    status: "Active",
  },
  {
    id: 6,
    name: "ILS Hospital Salt Lake",
    coordinates: [88.4057, 22.5835],
    details: "DD 6, Salt Lake Bypass, Sector 1.",
    status: "Active",
  },
];

const Index = () => {
  const [rotation, setRotation] = useState<[number, number, number]>([
    -88, -22, 0,
  ]);
  const [zoom, setZoom] = useState(240);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const filteredHospitals = hospitalData.filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (!isAutoRotating || selectedLoc) return;
    const interval = setInterval(() => {
      setRotation((prev) => [prev[0] + 0.3, prev[1], prev[2]]);
    }, 50);
    return () => clearInterval(interval);
  }, [isAutoRotating, selectedLoc]);

  const handleFlyTo = (loc) => {
    setIsAutoRotating(false);
    setSelectedLoc(loc);
    setRotation([-loc.coordinates[0], -loc.coordinates[1], 0]);
    setZoom(1200);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white">
      <nav className="container mx-auto px-6 py-6 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="text-blue-500 fill-blue-500 w-6 h-6" />
          <span className="text-xl font-bold uppercase tracking-tight">
            Hind Svaasth Seva
          </span>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-12 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <br />
            <span className="text-blue-500 italic">Hind Svaasth Seva</span>
          </h1>

          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search West Bengal hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#15181e] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 w-full mt-2 bg-[#1a1d24] border border-slate-800 rounded-2xl z-50 overflow-hidden shadow-2xl"
                >
                  {filteredHospitals.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => handleFlyTo(h)}
                      className="w-full text-left px-5 py-3 text-sm hover:bg-blue-600/10 hover:text-blue-400 border-b border-white/5 last:border-0 transition-colors"
                    >
                      {h.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/emergency"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 font-bold hover:bg-red-500 transition-all"
          >
            <AlertTriangle className="w-5 h-5" /> ACTIVATE EMERGENCY SOS
          </Link>
        </div>

        <div className="lg:col-span-7 relative">
          <div className="w-full max-w-[600px] aspect-square relative mx-auto">
            <AnimatePresence>
              {selectedLoc && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-8 left-8 z-40 w-72 bg-[#15181e]/90 border border-blue-500/30 p-6 rounded-3xl shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-blue-400 font-bold text-xs uppercase tracking-widest">
                      <MapPin size={14} className="inline mr-2" />
                      {selectedLoc.name}
                    </div>
                    <button
                      onClick={() => setSelectedLoc(null)}
                      className="text-slate-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {selectedLoc.details}
                  </p>
                  <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded uppercase">
                    {selectedLoc.status}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <ComposableMap
              projection="geoOrthographic"
              projectionConfig={{ scale: zoom, rotate: rotation }}
            >
              <Sphere
                id="sphere"
                fill="#0f1116"
                stroke="#2d333d"
                strokeWidth={0.5}
              />
              <Graticule stroke="#2d333d" strokeWidth={0.3} />
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1e2329"
                      stroke="#2d333d"
                      strokeWidth={0.5}
                    />
                  ))
                }
              </Geographies>
              {hospitalData.map((h) => (
                <Marker
                  key={h.id}
                  coordinates={h.coordinates as [number, number]}
                  onClick={() => handleFlyTo(h)}
                >
                  <circle
                    r={selectedLoc?.id === h.id ? 8 : 4}
                    fill="#3b82f6"
                    className="cursor-pointer"
                  />
                  <circle
                    r={12}
                    fill="#3b82f6"
                    opacity={0.2}
                    className="animate-pulse pointer-events-none"
                  />
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
