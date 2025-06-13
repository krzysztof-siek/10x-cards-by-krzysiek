// Typy dla środowisk
export type EnvName = "local" | "integration" | "prod";

// Klucze dla feature flags
export type FeatureKey = "auth.register" | "auth.login" | "practice.view" | "generate.view" | "flashcards.view";

// Typ dla konfiguracji flag per środowisko
type FeatureFlagsConfig = Record<FeatureKey, boolean>;

// Konfiguracja domyślna per środowisko
export const featureFlags: Record<EnvName, FeatureFlagsConfig> = {
  local: {
    "auth.register": true,
    "auth.login": true,
    "practice.view": true,
    "generate.view": true,
    "flashcards.view": true,
  },
  integration: {
    "auth.login": false,
    "auth.register": true,
    "practice.view": true,
    "generate.view": true,
    "flashcards.view": true,
  },
  prod: {
    "auth.login": true,
    "auth.register": true,
    "practice.view": true,
    "generate.view": false,
    "flashcards.view": true,
  },
};

// Funkcja pomocnicza do pobierania nazwy środowiska
const getEnv = (): EnvName => {
  const raw =
    typeof process !== "undefined" && process.env.ENV_NAME
      ? process.env.ENV_NAME
      : typeof import.meta !== "undefined" && (import.meta.env as any).ENV_NAME
        ? (import.meta.env as any).ENV_NAME
        : "local";

  if (!["local", "integration", "prod"].includes(raw)) {
    throw new Error(`Nieznane ENV_NAME: ${raw}. Dozwolone: local, integration, prod`);
  }
  return raw as EnvName;
};

// Aktywne środowisko
const ENV: EnvName = getEnv();

// Funkcje pomocnicze do obsługi zmiennych środowiskowych
function getEnvVarName(key: FeatureKey): string {
  return `FEATURE_${key.toUpperCase().replace(/\./g, "_")}`;
}

function getRawEnvVar(key: FeatureKey): string | undefined {
  const name = getEnvVarName(key);
  if (typeof process !== "undefined" && process.env[name] !== undefined) return process.env[name];
  if (typeof import.meta !== "undefined" && (import.meta.env as any)[name] !== undefined)
    return (import.meta.env as any)[name];
  return undefined;
}

function parseBoolean(raw: string): boolean {
  return ["1", "true", "yes"].includes(raw.toLowerCase());
}

// Główne funkcje eksportowane do sprawdzania flag
export function isFeatureEnabled<K extends FeatureKey>(key: K): boolean {
  const raw = getRawEnvVar(key);
  if (raw !== undefined) return parseBoolean(raw);

  const flags = featureFlags[ENV];
  if (!(key in flags)) throw new Error(`Nieznana flaga: ${key}`);
  return flags[key];
}

export function tryIsFeatureEnabled<K extends FeatureKey>(key: K): boolean {
  const raw = getRawEnvVar(key);
  if (raw !== undefined) return parseBoolean(raw);
  return !!featureFlags[ENV]?.[key];
}
