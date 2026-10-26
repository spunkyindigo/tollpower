export type HardwareProfile = 'pi-voltacon-minimal' | 'full-hardware' | 'custom';

export interface FeatureFlags {
  // Swathes of hardware-dependent features
  fanNoiseAcoustics: boolean; // Requires GPIO PWM header, auxiliary fan, or acoustic sensor
  externalRelays: boolean;    // Requires Pi GPIO relay expansion board / contactor
  ambientSensors: boolean;    // Requires DS18B20 1-Wire external temp probes
  
  // Software modules
  timersAndModes: boolean;    // Inverter SBU/CSO scheduling
  longTermAnalytics: boolean; // 30-day analytics and cost-saving metrics
  setupGuide: boolean;        // Pi hardware setup and wiring documentation
  soundEffects: boolean;      // 8-bit retro audio feedback
}

export interface AppSettings {
  hardwareProfile: HardwareProfile;
  features: FeatureFlags;
  inverterPort: string;
  pollingIntervalMs: number;
  temperatureUnit: 'C' | 'F';
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  hardwareProfile: 'pi-voltacon-minimal',
  features: {
    fanNoiseAcoustics: false,  // Disabled by default on baseline Pi + Voltacon setup
    externalRelays: false,     // Disabled by default (only pure inverter direct controls)
    ambientSensors: false,     // Disabled by default
    timersAndModes: true,
    longTermAnalytics: true,
    setupGuide: true,
    soundEffects: true,
  },
  inverterPort: '/dev/hidraw0',
  pollingIntervalMs: 2500,
  temperatureUnit: 'C',
};
