# Feature Flags Plan

## Overview

Wprowadzamy uniwersalny moduł TypeScript dla feature flags, dostępny zarówno na frontendzie, jak i backendzie. Domyślna konfiguracja statyczna (w `src/features/featureFlags.ts`) może być nadpisana przez zmienne środowiskowe.

---

## 1. Typy środowisk i odczyt ENV_NAME

```ts
export type EnvName = 'local' | 'integration' | 'prod'

const getEnv = (): EnvName => {
  const raw =
    typeof process !== 'undefined' && process.env.ENV_NAME
      ? process.env.ENV_NAME
      : typeof import.meta !== 'undefined' && (import.meta.env as any).ENV_NAME
      ? (import.meta.env as any).ENV_NAME
      : 'local'

  if (!['local', 'integration', 'prod'].includes(raw)) {
    throw new Error(`Nieznane ENV_NAME: ${raw}. Dozwolone: local, integration, prod`)
  }
  return raw as EnvName
}

const ENV: EnvName = getEnv()
```

---

## 2. Nadpisywanie przez zmienne środowiskowe

**Idea**: Każdą flagę można zdefiniować w `.env` jako `FEATURE_<FEATURE_KEY>`. Klucze są uppercase i z kropkami zamienionymi na `_`.

```ts
function getEnvVarName(key: FeatureKey): string {
  return `FEATURE_${key.toUpperCase().replace(/\./g, '_')}`
}

function getRawEnvVar(key: FeatureKey): string | undefined {
  const name = getEnvVarName(key)
  if (typeof process !== 'undefined' && process.env[name] !== undefined) return process.env[name]
  if (typeof import.meta !== 'undefined' && (import.meta.env as any)[name] !== undefined)
    return (import.meta.env as any)[name]
  return undefined
}

function parseBoolean(raw: string): boolean {
  return ['1', 'true', 'yes'].includes(raw.toLowerCase())
}
```

---

## 3. Modyfikacja funkcji isFeatureEnabled i tryIsFeatureEnabled

```ts
export function isFeatureEnabled<K extends FeatureKey>(key: K): boolean {
  const raw = getRawEnvVar(key)
  if (raw !== undefined) return parseBoolean(raw)

  const flags = featureFlags[ENV]
  if (!(key in flags)) throw new Error(`Unknown feature flag: ${key}`)
  return flags[key]
}

export function tryIsFeatureEnabled<K extends FeatureKey>(key: K): boolean {
  const raw = getRawEnvVar(key)
  if (raw !== undefined) return parseBoolean(raw)
  return !!featureFlags[ENV]?.[key]
}
```

---

## 4. Przykładowe zmienne w plikach `.env`

```env
# .env.local
ENV_NAME=local
# wszystko włączone domyślnie

# .env.integration
ENV_NAME=integration
FEATURE_AUTH_LOGIN=false
FEATURE_PRACTICE_VIEW=true
# .env.production
ENV_NAME=prod
FEATURE_GENERATE_VIEW=false
```

---

Dzięki temu planowi mamy pełną kontrolę nad feature flags na każdym etapie: build-time i runtime, z możliwością szybkiego włączania/wyłączania funkcjonalności przez zmienne środowiskowe. 