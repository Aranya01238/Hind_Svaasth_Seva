import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.tsx";
import { auth0Config, isAuth0Configured } from "./lib/auth0";
import "./index.css";

const app = <App />;

createRoot(document.getElementById("root")!).render(
  isAuth0Configured ? (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(auth0Config.audience ? { audience: auth0Config.audience } : {}),
      }}
    >
      {app}
    </Auth0Provider>
  ) : (
    app
  ),
);
