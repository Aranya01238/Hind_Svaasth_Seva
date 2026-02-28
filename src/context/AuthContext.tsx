import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User, useAuth0 } from "@auth0/auth0-react";
import { isAuth0Configured } from "@/lib/auth0";
import { getHospitalByEmail, getHospitalById } from "@/lib/hospitalIdentity";

export type AuthRole = "super_admin" | "receptionist" | "patient" | "guest";

type AuthContextValue = {
  user: User | null;
  role: AuthRole;
  hospital_id: string | null;
  hospital_name: string | null;
  access_token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
};

const defaultAuthContext: AuthContextValue = {
  user: null,
  role: "guest",
  hospital_id: null,
  hospital_name: null,
  access_token: null,
  isAuthenticated: false,
  isLoading: false,
  logout: () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

const parseMetadata = (user: User | undefined) => {
  const userRecord = (user ?? {}) as Record<string, unknown>;
  const metadata = (userRecord.user_metadata ?? {}) as Record<string, unknown>;

  const role =
    (metadata.role as string | undefined) ??
    (userRecord.role as string | undefined) ??
    (userRecord["https://hindseva.app/role"] as string | undefined) ??
    "";

  const hospitalId =
    (metadata.hospital_id as string | undefined) ??
    (metadata.hospitalId as string | undefined) ??
    (userRecord.hospital_id as string | undefined) ??
    (userRecord["https://hindseva.app/hospital_id"] as string | undefined) ??
    "";

  const hospitalName =
    (metadata.hospital_name as string | undefined) ??
    (metadata.hospitalName as string | undefined) ??
    (userRecord.hospital_name as string | undefined) ??
    (userRecord["https://hindseva.app/hospital_name"] as string | undefined) ??
    "";

  return {
    role: role.trim().toLowerCase(),
    hospitalId: hospitalId.trim().toUpperCase(),
    hospitalName: hospitalName.trim(),
  };
};

const inferHospitalFromEmail = (email?: string | null) => {
  const parsed = (email ?? "").trim().toLowerCase();
  if (!parsed) {
    return null;
  }

  if (parsed.includes("apollo")) {
    return { hospital_id: "HOSP001", hospital_name: "Apollo Care Kolkata" };
  }
  if (parsed.includes("medica")) {
    return { hospital_id: "HOSP002", hospital_name: "Medica Superspeciality" };
  }
  if (parsed.includes("amri")) {
    return { hospital_id: "HOSP003", hospital_name: "AMRI Hospital" };
  }
  if (parsed.includes("ruby")) {
    return { hospital_id: "HOSP004", hospital_name: "Ruby General" };
  }
  if (parsed.includes("peerless")) {
    return { hospital_id: "HOSP005", hospital_name: "Peerless Hospital" };
  }
  if (parsed.includes("ils")) {
    return { hospital_id: "HOSP006", hospital_name: "ILS Hospital" };
  }

  return null;
};

const isReceptionistEmail = (email?: string | null) => {
  const localPart = (email ?? "").split("@")[0]?.toLowerCase() ?? "";
  return (
    localPart.startsWith("recep") ||
    localPart.startsWith("reception") ||
    localPart.includes("receptionist")
  );
};

const toAuthRole = (
  role: string,
  hospitalId: string,
  email?: string | null,
): AuthRole => {
  const normalizedRole = role.trim().toLowerCase();

  if (
    normalizedRole === "super_admin" ||
    normalizedRole === "superadmin" ||
    normalizedRole === "admin" ||
    normalizedRole === "hospital_admin"
  ) {
    return "super_admin";
  }

  if (
    normalizedRole === "receptionist" ||
    normalizedRole === "reception" ||
    normalizedRole === "frontdesk"
  ) {
    return "receptionist";
  }

  if (normalizedRole === "patient") {
    return "patient";
  }

  if (hospitalId && isReceptionistEmail(email)) {
    return "receptionist";
  }

  if (hospitalId) {
    return "super_admin";
  }

  return "patient";
};

export const getDefaultRouteForRole = (role: AuthRole) => {
  if (role === "super_admin") {
    return "/admin";
  }

  if (role === "receptionist") {
    return "/receptionist";
  }

  return "/";
};

const Auth0BackedProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, isLoading, logout, getAccessTokenSilently } =
    useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadToken = async () => {
      if (!isAuthenticated) {
        setAccessToken(null);
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        if (!cancelled) {
          setAccessToken(token);
        }
      } catch {
        if (!cancelled) {
          setAccessToken(null);
        }
      }
    };

    void loadToken();

    return () => {
      cancelled = true;
    };
  }, [getAccessTokenSilently, isAuthenticated]);

  const metadata = parseMetadata(user);
  const mappedById = getHospitalById(metadata.hospitalId);
  const mappedByEmail = getHospitalByEmail(user?.email);
  const inferredByEmail = inferHospitalFromEmail(user?.email);

  const hospital_id =
    metadata.hospitalId ||
    mappedById?.hospitalId ||
    mappedByEmail?.hospitalId ||
    inferredByEmail?.hospital_id ||
    null;
  const hospital_name =
    metadata.hospitalName ||
    mappedById?.hospitalName ||
    mappedByEmail?.hospitalName ||
    inferredByEmail?.hospital_name ||
    null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      role: toAuthRole(metadata.role, hospital_id ?? "", user?.email),
      hospital_id,
      hospital_name,
      access_token: accessToken,
      isAuthenticated,
      isLoading,
      logout: () =>
        logout({ logoutParams: { returnTo: window.location.origin } }),
    }),
    [
      accessToken,
      hospital_id,
      hospital_name,
      isAuthenticated,
      isLoading,
      logout,
      metadata.role,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const AuthFallbackProvider = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={defaultAuthContext}>
    {children}
  </AuthContext.Provider>
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  if (!isAuth0Configured) {
    return <AuthFallbackProvider>{children}</AuthFallbackProvider>;
  }

  return <Auth0BackedProvider>{children}</Auth0BackedProvider>;
};

export const useAuth = () => useContext(AuthContext);
