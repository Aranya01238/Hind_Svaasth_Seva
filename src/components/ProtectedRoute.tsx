import { ReactNode, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { auth0Config, isAuth0Configured } from "@/lib/auth0";

type ProtectedRouteProps = {
  children: ReactNode;
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
          Super Admin authentication.
        </p>
      </div>
    </div>
  );
};

const AuthenticatedGuard = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        authorizationParams: {
          prompt: "login",
          screen_hint: "login",
          ...(auth0Config.connection
            ? { connection: auth0Config.connection }
            : {}),
        },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to secure login...
      </div>
    );
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuth0Configured) {
    return <Auth0MissingConfig />;
  }

  return <AuthenticatedGuard>{children}</AuthenticatedGuard>;
};

export default ProtectedRoute;
