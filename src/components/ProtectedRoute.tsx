import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { auth0Config, isAuth0Configured } from "@/lib/auth0";
import {
  AuthRole,
  getDefaultRouteForRole,
  useAuth,
} from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: AuthRole | AuthRole[];
};

const Auth0MissingConfig = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-card border border-border rounded-xl p-6 text-center shadow-card">
        <h2 className="text-xl font-display font-semibold text-foreground mb-2">
          Auth0 not configured
        </h2>
        <p className="text-sm text-muted-foreground">
          Set <strong>VITE_AUTH0_DOMAIN</strong> and{" "}
          <strong>VITE_AUTH0_CLIENT_ID</strong> in your environment to enable
          authentication.
        </p>
      </div>
    </div>
  );
};

const hasRequiredRole = (
  role: AuthRole,
  requiredRole?: AuthRole | AuthRole[],
) => {
  if (!requiredRole) {
    return true;
  }

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role);
  }

  return role === requiredRole;
};

const AuthenticatedGuard = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { loginWithRedirect } = useAuth0();
  const { isAuthenticated, isLoading, role } = useAuth();
  const loginStartedRef = useRef(false);
  const [redirectToRoot, setRedirectToRoot] = useState(false);

  const loginAttemptKey = `auth-login-attempt:${location.pathname}${location.search}`;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !loginStartedRef.current) {
      const hasAttemptedLogin = sessionStorage.getItem(loginAttemptKey) === "1";

      if (hasAttemptedLogin) {
        setRedirectToRoot(true);
        return;
      }

      loginStartedRef.current = true;
      sessionStorage.setItem(loginAttemptKey, "1");
      loginWithRedirect({
        appState: {
          returnTo: location.pathname + location.search,
        },
        authorizationParams: {
          redirect_uri: auth0Config.redirectUri || "http://127.0.0.1:8080",
          prompt: "login",
          max_age: 0,
          screen_hint: "login",
          ...(auth0Config.connection
            ? { connection: auth0Config.connection }
            : {}),
        },
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    loginAttemptKey,
    location.pathname,
    location.search,
    loginWithRedirect,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      loginStartedRef.current = false;
      setRedirectToRoot(false);
      sessionStorage.removeItem(loginAttemptKey);
    }
  }, [isAuthenticated, loginAttemptKey]);

  if (redirectToRoot) {
    return <Navigate to="/" replace />;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to secure login...
      </div>
    );
  }

  if (!hasRequiredRole(role, requiredRole)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  if (!isAuth0Configured) {
    return <Auth0MissingConfig />;
  }

  return (
    <AuthenticatedGuard requiredRole={requiredRole}>
      {children}
    </AuthenticatedGuard>
  );
};

export default ProtectedRoute;
