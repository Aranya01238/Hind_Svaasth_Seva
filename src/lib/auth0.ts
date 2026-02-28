const normalizeEnvValue = (value?: string) => (value ?? "").trim();

const normalizeAudience = (value?: string) => {
  const parsed = normalizeEnvValue(value);
  if (!parsed) {
    return "";
  }

  if (parsed.toLowerCase().includes("your_api_identifier_optional")) {
    return "";
  }

  return parsed;
};

export const auth0Config = {
  domain: normalizeEnvValue(import.meta.env.VITE_AUTH0_DOMAIN),
  clientId: normalizeEnvValue(import.meta.env.VITE_AUTH0_CLIENT_ID),
  audience: normalizeAudience(import.meta.env.VITE_AUTH0_AUDIENCE),
  connection: normalizeEnvValue(import.meta.env.VITE_AUTH0_CONNECTION),
  redirectUri: normalizeEnvValue(import.meta.env.VITE_AUTH0_REDIRECT_URI),
};

export const isAuth0Configured = Boolean(auth0Config.domain && auth0Config.clientId);
