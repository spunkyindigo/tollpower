import { AppSettings, DEFAULT_APP_SETTINGS, HardwareProfile } from '../types/settings';
import { sfx } from './sfx';

const SETTINGS_KEY = 'tollpower_app_settings_v1';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_APP_SETTINGS,
        ...parsed,
        features: {
          ...DEFAULT_APP_SETTINGS.features,
          ...(parsed.features || {}),
        },
      };
    }
  } catch {}
  return DEFAULT_APP_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('tollpower_settings_changed', { detail: settings }));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function applyProfile(profile: HardwareProfile, current: AppSettings): AppSettings {
  if (profile === 'pi-voltacon-minimal') {
    return {
      ...current,
      hardwareProfile: 'pi-voltacon-minimal',
      features: {
        ...current.features,
        fanNoiseAcoustics: false, // Extra hardware: aux PWM fan/sound sensor disabled
        externalRelays: false,    // Extra hardware: GPIO relays disabled
        ambientSensors: false,    // Extra hardware: DS18B20 1-Wire sensors disabled
      },
    };
  }

  if (profile === 'full-hardware') {
    return {
      ...current,
      hardwareProfile: 'full-hardware',
      features: {
        ...current.features,
        fanNoiseAcoustics: true,
        externalRelays: true,
        ambientSensors: true,
      },
    };
  }

  return {
    ...current,
    hardwareProfile: 'custom',
  };
}
