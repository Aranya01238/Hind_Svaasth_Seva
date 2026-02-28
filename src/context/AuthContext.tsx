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

type AuthRole = "super_admin" | "receptionist" | "patient" | "guest";

type AuthContextValue = {
  user: User | null;
  role: AuthRole;
  hospitalId: string | null;
  hospitalName: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
};

const defaultAuthContext: AuthContextValue = {
  user: null,
  role: "guest",
  hospitalId: null,
  hospitalName: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  logout: () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

const extractHospitalId = (user: User | undefined): string | null => {
  if (!user) {
    return null;
  }

  const metadataHospitalId =
    (user as Record<string, unknown>).hospital_id ??
    (user as Record<string, unknown>).hospitalId ??
    (user as Record<string, unknown>)["https://hindseva.app/hospital_id"];

  if (typeof metadataHospitalId === "string" && metadataHospitalId.trim()) {
    return metadataHospitalId.trim().toUpperCase();
  }

  return null;
};

const resolveRole = (
  user: User | null,
  hospitalId: string | null,
): AuthRole => {
  if (!user) {
    return "guest";
  }

  const explicitRole =
    (user as Record<string, unknown>).role ??
    (user as Record<string, unknown>)["https://hindseva.app/role"];

  if (
    explicitRole === "super_admin" ||
    explicitRole === "receptionist" ||
    explicitRole === "patient"
  ) {
    return explicitRole;
  }

  if (hospitalId) {
    return "super_admin";
  }

  return "patient";
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

  const parsedHospitalId = extractHospitalId(user);
  const hospitalFromId = getHospitalById(parsedHospitalId);
  const hospitalFromEmail = getHospitalByEmail(user?.email);

  const hospitalId =
    hospitalFromId?.hospitalId ??
    hospitalFromEmail?.hospitalId ??
    parsedHospitalId;
  const hospitalName =
    hospitalFromId?.hospitalName ?? hospitalFromEmail?.hospitalName ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      role: resolveRole(user ?? null, hospitalId ?? null),
      hospitalId: hospitalId ?? null,
      hospitalName,
      accessToken,
      isAuthenticated,
      isLoading,
      logout: () =>
        logout({ logoutParams: { returnTo: window.location.origin } }),
    }),
    [
      accessToken,
      hospitalId,
      hospitalName,
      isAuthenticated,
      isLoading,
      logout,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const AuthFallbackProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider value={defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  if (!isAuth0Configured) {
    return <AuthFallbackProvider>{children}</AuthFallbackProvider>;
  }

  return <Auth0BackedProvider>{children}</Auth0BackedProvider>;
};

export const useAuth = () => useContext(AuthContext);
