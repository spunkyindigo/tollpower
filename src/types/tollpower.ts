export interface InverterState {
  model: string;
  powerState: 'ON' | 'STANDBY' | 'OFF';
  outputPriority: 'SBU' | 'SOL' | 'UTI';
  chargerPriority: 'CSO' | 'OSO' | 'SNU';
  mode?: 'inverter' | 'eco' | 'ups' | 'charger';
  acOutput: {
    voltage: number;
    frequency: number;
    current: number;
    watts: number;
    apparentPowerVA: number;
    peakWatts: number;
    waveform: string;
  };
  dcInput: {
    voltage: number;
    current: number;
    watts: number;
    stateOfCharge: number;
    batteryType: string;
    temperatureC: number;
    bulkVoltage?: number;
    floatVoltage?: number;
    lowCutoffVoltage?: number;
  };
  solar: {
    connected: boolean;
    voltage: number;
    current: number;
    watts: number;
    dailyYieldKWh: number;
  };
  grid: {
    connected: boolean;
    voltage: number;
    frequency: number;
    status: 'Bypass Active' | 'Bypass Ready' | 'Disconnected';
  };
  thermal: {
    inverterTempC: number;
    transformerTempC: number;
    fanSpeedPct: number; // Internal inverter fan speed %
    auxFanPwmPct: number; // Pi-controlled auxiliary silent fan speed %
    fanMode: 'quiet' | 'balanced' | 'performance' | 'manual';
    targetMaxTempC: number; // Thermal trigger setpoint (e.g. 42°C)
    estimatedNoiseDba: number; // Current acoustic output in dBA
    nightQuietEnabled: boolean; // Auto-throttle charging amperage overnight
    fanRpm: number; // Approximate internal fan RPM
    auxFanRpm: number; // Approximate auxiliary fan RPM
  };
  relays: {
    mainAc: boolean;
    auxLoad: boolean;
    usbPorts: boolean;
    coolingFan: boolean;
  };
  alarms: Array<{
    id: string;
    level: 'warning' | 'critical' | 'info';
    message: string;
    timestamp: string;
  }>;
  history: Array<{
    time: string;
    acWatts: number;
    solarWatts: number;
    batterySoc: number;
  }>;
  lastUpdated: string;
  connectionType: 'usb-direct' | 'serial' | 'gpio' | 'simulated';
  usbPort: string;
  isSimulationMode?: boolean;
  hardwareStatus?: 'connected' | 'disconnected' | 'probing' | 'error';
  hardwareError?: string;
  linkLatencyMs?: number;
}

export interface LinkDiagnosticsLog {
  id: string;
  timestamp: string;
  type: 'TX' | 'RX' | 'INFO' | 'ERROR';
  command?: string;
  rawHex?: string;
  rawAscii?: string;
  latencyMs?: number;
  note?: string;
}

export interface HardwareLinkConfig {
  simulationMode: boolean;
  port: string;
  baudRate: number;
  protocol: 'PI30' | 'PI18' | 'PI16';
  hidMode: '8byte' | 'stream';
  timeoutMs: number;
  pollingIntervalMs: number;
  autoReconnect: boolean;
}

export interface LinkDiagnosticsStatus {
  simulationMode: boolean;
  devicePort: string;
  baudRate: number;
  protocol: string;
  hardwareStatus: 'connected' | 'disconnected' | 'probing' | 'error';
  lastProbeTimestamp: string;
  lastValidResponseTimestamp: string | null;
  latencyMs: number;
  counters: {
    queriesSent: number;
    responsesReceived: number;
    crcErrors: number;
    timeouts: number;
  };
  availablePorts: string[];
  detectedUsbDevices: string[];
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    error?: string;
  };
  recentLogs: LinkDiagnosticsLog[];
  lastParsedQPIGS?: Record<string, any>;
  lastCommandResponse?: {
    command: string;
    rawHex: string;
    rawAscii: string;
    latencyMs: number;
    validCrc: boolean;
    parsedFields?: Record<string, any>;
  };
}

export interface InverterTimerRule {
  id: string;
  name: string;
  enabled: boolean;
  time: string; // "HH:MM" e.g. "08:30"
  days: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  action: 'outputPriority' | 'chargerPriority' | 'powerState' | 'mode' | 'relay';
  value: string; // 'SBU' | 'SOL' | 'UTI' | 'CSO' | 'OSO' | 'SNU' | 'ON' | 'STANDBY' | 'OFF' | 'inverter' | 'eco' | 'ups' | 'charger'
  relayName?: 'mainAc' | 'auxLoad' | 'usbPorts' | 'coolingFan';
  relayValue?: boolean;
}

export interface DailySummary {
  date: string;
  solarTotalKWh: number;
  inverterTotalKWh: number;
  gridTotalKWh: number;
  avgBatterySoc: number;
  peakLoadWatts: number;
  avgTempC: number;
  costSavedGbp: number;
}

export interface AnalyticsData {
  range: string;
  kpis: {
    totalSolarKWh: number;
    totalInverterKWh: number;
    totalGridKWh: number;
    avgEfficiencyPct: number;
    estCostSavedGbp: number;
    selfReliancePct: number;
    totalDataPoints: number;
  };
  dailySummary: DailySummary[];
  recentHourly: Array<{
    timestamp: string;
    date: string;
    hour: number;
    solarGeneratedKWh: number;
    inverterDeliveredKWh: number;
    gridImportedKWh: number;
    batteryAvgSoc: number;
    peakLoadWatts: number;
    avgTempC: number;
    costSavedGbp?: number;
  }>;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  model: string;
  cpuTemp: number;
  memory: {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    percent: number;
  };
  loadAvg: number[];
  uptimeSeconds: number;
  uptimeFormatted: string;
  localIps: string[];
  primaryIp: string;
  port: number;
  lanUrl: string;
  nodeVersion: string;
}

export interface GitStatus {
  commitHash: string;
  commitMessage: string;
  commitDate: string;
  branch: string;
  remoteUrl: string;
  isClean: boolean;
  version: string;
}
