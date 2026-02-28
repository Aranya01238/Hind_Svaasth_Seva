import {
  ClipboardList,
  CalendarCheck,
  Users,
  Stethoscope,
  Calendar,
  LogOut,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const receptionistNav = [
  { path: "/receptionist", label: "Dashboard", icon: ClipboardList, end: true },
  { path: "/receptionist/patients", label: "Patients", icon: Users },
  {
    path: "/receptionist/appointments",
    label: "Appointments",
    icon: CalendarCheck,
  },
  { path: "/receptionist/doctors", label: "Doctors", icon: Stethoscope },
  { path: "/receptionist/schedule", label: "Schedule", icon: Calendar },
];

const ReceptionistPortal = () => {
  const { hospital_name, hospital_id, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Receptionist Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              {hospital_name ?? "Hospital not mapped"}{" "}
              {hospital_id ? `(${hospital_id})` : ""}
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-foreground">
              {user?.name ?? "Receptionist"}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm hover:bg-accent transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {receptionistNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent border border-border"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <Outlet />

        <div className="mt-8 text-xs text-muted-foreground">
          Restricted actions are hidden for receptionist role (equipment, staff,
          blood inventory management).
          <Link to="/admin" className="ml-1 underline hover:text-foreground">
            Admin only
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistPortal;
