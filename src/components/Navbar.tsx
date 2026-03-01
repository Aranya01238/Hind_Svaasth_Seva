import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Menu,
  X,
  Shield,
  ClipboardList,
  User,
  AlertTriangle,
  Code,
  Activity,
  Globe2,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/admin", label: "ADMIN", icon: Shield },
  { path: "/receptionist", label: "RECEPTION", icon: ClipboardList },
  { path: "/patient", label: "PATIENT", icon: User },
  {
    path: "/emergency",
    label: "EMERGENCY",
    icon: AlertTriangle,
    color: "text-red-500",
  },
  { path: "/intel", label: "INTEL", icon: Globe2 },
  { path: "/developer", label: "DEV", icon: Code },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#090b0e]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Heart className="w-6 h-6 text-white fill-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-white uppercase leading-none">
              HIND SVAASTH
            </span>
            <span className="text-[10px] font-bold text-blue-500 tracking-[0.3em] leading-none mt-1">
              SEVA GRID
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative group px-4 py-2"
              >
                <div
                  className={`flex items-center gap-2 text-[11px] font-bold tracking-widest transition-all duration-300 ${
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 ${active ? item.color || "text-blue-500" : "text-slate-500"}`}
                  />
                  {item.label}
                </div>

                {/* Active Indicator Line */}
                {active && (
                  <motion.div
                    layoutId="navActive"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="h-8 w-[1px] bg-white/10 mx-4" />

          {/* Network Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase">
              GRID: OPTIMAL
            </span>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-3 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0d1117] border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-4">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      active
                        ? "bg-blue-600/10 border-blue-500/50 text-white"
                        : "bg-white/5 border-white/5 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon
                        className={`w-5 h-5 ${active ? "text-blue-400" : ""}`}
                      />
                      <span className="font-bold tracking-[0.2em] text-sm uppercase">
                        {item.label}
                      </span>
                    </div>
                    <Activity
                      className={`w-4 h-4 opacity-50 ${active ? "animate-pulse text-blue-400" : "hidden"}`}
                    />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
