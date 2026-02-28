/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_AUTH0_DOMAIN?: string;
	readonly VITE_AUTH0_CLIENT_ID?: string;
	readonly VITE_AUTH0_AUDIENCE?: string;
	readonly VITE_AUTH0_CONNECTION?: string;
	readonly VITE_SHEETS_WRITE_URL?: string;
	readonly VITE_APPS_SCRIPT_URL?: string;
	readonly VITE_APPS_SCRIPT_API_KEY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
