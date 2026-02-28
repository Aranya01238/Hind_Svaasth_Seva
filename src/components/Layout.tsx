import { ReactNode, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import NurseMaya from "./NurseMaya";
import { getDefaultRouteForRole, useAuth } from "@/context/AuthContext";

const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, role } = useAuth();
  const logoutTriggeredRef = useRef(false);

  useEffect(() => {
    const insideAdmin = location.pathname.startsWith("/admin");
    const atRoot = location.pathname === "/";

    if (isAuthenticated && atRoot) {
      navigate(getDefaultRouteForRole(role), { replace: true });
      return;
    }

    if (
      isAuthenticated &&
      role === "super_admin" &&
      !insideAdmin &&
      !logoutTriggeredRef.current
    ) {
      logoutTriggeredRef.current = true;
      logout();
      return;
    }

    if (insideAdmin) {
      logoutTriggeredRef.current = false;
    }
  }, [isAuthenticated, location.pathname, logout, navigate, role]);

  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <NurseMaya />
    </>
  );
};

export default Layout;
