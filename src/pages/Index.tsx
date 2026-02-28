import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Code,
  Heart,
  ArrowRight,
  Activity,
  Hospital,
  Droplets,
  Bed,
  Navigation,
} from "lucide-react";

// Topography URL for the globe
const geoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

const portals = [
  {
    title: "Super Admin",
    description: "Enterprise-level management of hospitals and staff.",
    icon: Shield,
    path: "/admin",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  {
    title: "Receptionist",
    description: "Streamlined dashboard for patient intake and scheduling.",
    icon: ClipboardList,
    path: "/receptionist",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  },
  {
    title: "Patient Portal",
    description: "Secure access to medical records and digital health ID.",
    icon: User,
    path: "/patient",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  },
  {
    title: "Emergency",
    description: "Immediate SOS dispatch and real-time ambulance tracking.",
    icon: AlertTriangle,
    path: "/emergency",
    color: "bg-red-500/10 text-red-600 border-red-200",
  },
  {
    title: "Developer",
    description: "API monitoring, service health, and system analytics.",
    icon: Code,
    path: "/developer",
    color: "bg-slate-500/10 text-slate-600 border-slate-200",
  },
];

const Index = () => {
  // Center on India [longitude, latitude]
  const [rotation, setRotation] = useState([-78, -20, 0]);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setRotation((prev) => [prev[0] + 0.2, prev[1], prev[2]]);
    }, 50);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const handleFlyTo = (coords: [number, number]) => {
    setIsAutoRotating(false);
    setRotation([-coords[0], -coords[1], 0]);
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-12 lg:pt-24 pb-20 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Live Health Grid India
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Hind Svaasth <span className="text-blue-500 italic">Seva</span>
            </h1>

            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-md">
              A unified, interactive intelligence layer for the Indian
              healthcare ecosystem. Drag the globe to explore our national
              network.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={() => handleFlyTo([77.209, 28.6139])}
                className="px-4 py-2 rounded-lg bg-[#1c1f26] border border-slate-800 text-[10px] font-bold hover:border-blue-500 transition-all"
              >
                FLY TO DELHI
              </button>
              <button
                onClick={() => handleFlyTo([72.8777, 19.076])}
                className="px-4 py-2 rounded-lg bg-[#1c1f26] border border-slate-800 text-[10px] font-bold hover:border-blue-500 transition-all"
              >
                FLY TO MUMBAI
              </button>
            </div>

            <Link
              to="/emergency"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-xl shadow-red-900/20"
            >
              <AlertTriangle className="w-5 h-5" />
              ACTIVATE EMERGENCY SOS
            </Link>
          </motion.div>

          {/* Interactive Globe Side */}
          <motion.div
            className="lg:col-span-7 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className="w-full max-w-[600px] aspect-square relative cursor-grab active:cursor-grabbing mx-auto"
              onMouseDown={() => setIsAutoRotating(false)}
            >
              {/* Reference UI Buttons */}
              <div className="absolute top-4 left-4 z-10 bg-[#121212] border border-white/10 px-3 py-1 rounded text-[10px] font-bold tracking-widest text-white">
                FLY TO
              </div>
              <div className="absolute top-4 right-4 z-10 p-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <Navigation className="w-4 h-4 rotate-45" />
              </div>

              <ComposableMap
                projection="geoOrthographic"
                projectionConfig={{
                  scale: 240,
                  rotate: rotation as [number, number, number],
                }}
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    setRotation([
                      rotation[0] + e.movementX * 0.5,
                      rotation[1] - e.movementY * 0.5,
                      0,
                    ]);
                  }
                }}
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
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#3b82f6", outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* Active Hub Markers */}
                <Marker coordinates={[77.209, 28.6139]}>
                  <circle r={5} fill="#3b82f6" />
                  <circle
                    r={10}
                    fill="#3b82f6"
                    opacity={0.3}
                    className="animate-pulse"
                  />
                </Marker>
              </ComposableMap>

              {/* Attribution Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-1 flex items-center gap-1 shadow-2xl">
                <span className="text-[10px] text-black font-semibold">
                  © CARTO, © OpenStreetMap contributors
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Partner Hospitals", val: "6", icon: Hospital },
            { label: "Beds Available", val: "342", icon: Bed },
            { label: "Blood Units", val: "1,280", icon: Droplets },
            { label: "Active Traffic", val: "5,640", icon: Activity },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#15181e] border border-slate-800 p-6 rounded-2xl group hover:border-blue-500/50 transition-colors"
            >
              <s.icon className="w-5 h-5 text-blue-500 mb-4" />
              <div className="text-3xl font-bold mb-1">{s.val}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portals Grid */}
      <section className="container mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Operational Gateways
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {portals.map((p) => (
            <Link
              key={p.title}
              to={p.path}
              className="group p-8 rounded-[2rem] bg-[#15181e] border border-slate-800 hover:bg-[#1c1f26] hover:border-blue-500/30 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-slate-700/50 ${p.color}`}
              >
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                {p.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {p.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">
                Enter Secure Portal{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-slate-800 py-16 bg-[#0c0e12]">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-xl font-bold">Hind Svaasth Seva</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md text-center">
            Official Digital Healthcare Coordination Network of India. Encrypted
            end-to-end and HIPAA compliant.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
