import { type ReactNode } from "react";
import { type FeatureKey, isFeatureEnabled } from "../features/featureFlags";

interface FeatureGuardProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGuard({ feature, children, fallback = null }: FeatureGuardProps) {
  const isEnabled = isFeatureEnabled(feature);

  if (!isEnabled) {
    return fallback;
  }

  return children;
}
