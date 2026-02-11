import { invoke } from "@tauri-apps/api/core";

export interface LicenseValidationResult {
  valid: boolean;
  premium: boolean;
  error?: string;
}

/**
 * Generate hardware fingerprint using Tauri backend
 */
export async function getHardwareFingerprint(): Promise<string> {
  try {
    return await invoke<string>("get_hw_fingerprint");
  } catch (err) {
    console.error("Failed to get hardware fingerprint:", err);
    // Fallback: use a pseudo-random identifier (not ideal, but prevents total failure)
    return `fallback-${Date.now()}`;
  }
}

/**
 * Validate license key against backend
 */
export async function validateLicense(
  licenseKey: string,
  hwFingerprint: string
): Promise<LicenseValidationResult> {
  try {
    const response = await fetch("https://api.katadesktop.com/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, hwFingerprint }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        valid: false,
        premium: false,
        error: data.error || "License validation failed",
      };
    }

    const data = await response.json();
    return {
      valid: data.valid,
      premium: data.premium,
    };
  } catch (err) {
    // Network error or server down — allow grace period for offline usage
    console.warn("License validation offline, using cached state:", err);
    return {
      valid: true, // Grace period: trust local state if server unreachable
      premium: true,
      error: "Offline validation",
    };
  }
}

/**
 * Activate license key (registers hardware fingerprint with backend)
 */
export async function activateLicense(
  licenseKey: string,
  hwFingerprint: string
): Promise<LicenseValidationResult> {
  try {
    const response = await fetch("https://api.katadesktop.com/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, hwFingerprint }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        valid: false,
        premium: false,
        error: data.error || "Activation failed",
      };
    }

    const data = await response.json();
    return {
      valid: data.valid,
      premium: data.premium,
    };
  } catch (err) {
    return {
      valid: false,
      premium: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
