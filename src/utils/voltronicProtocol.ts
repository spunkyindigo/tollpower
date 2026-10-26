// Voltronic / Voltacon Axpert & Conversol PI30 Protocol Parser & CRC Engine

export interface ParsedQPIGS {
  gridVoltage: number;
  gridFrequency: number;
  acOutputVoltage: number;
  acOutputFrequency: number;
  acOutputApparentPowerVA: number;
  acOutputActivePowerWatts: number;
  outputLoadPercent: number;
  busVoltage: number;
  batteryVoltage: number;
  batteryChargingCurrent: number;
  batteryCapacitySoc: number;
  inverterHeatSinkTempC: number;
  pvInputCurrent: number;
  pvInputVoltage: number;
  batteryVoltageSCC: number;
  batteryDischargeCurrent: number;
  deviceStatusBits: string;
  batteryOffsetForMppt?: number;
  eepromVersion?: number;
  pvChargingPowerWatts: number;
  deviceStatusBits2?: string;
}

export interface ParsedQPIRI {
  gridRatingVoltage: number;
  gridRatingCurrent: number;
  acOutputRatingVoltage: number;
  acOutputRatingFrequency: number;
  acOutputRatingCurrent: number;
  acOutputRatingApparentPower: number;
  acOutputRatingActivePower: number;
  batteryRatingVoltage: number;
  batteryRechargeVoltage: number;
  batteryUnderVoltage: number;
  batteryBulkVoltage: number;
  batteryFloatVoltage: number;
  batteryType: string; // AGM, Flooded, LiFePO4 / User
  maxAcChargingCurrent: number;
  maxChargingCurrent: number;
  inputVoltageRange: string;
  outputSourcePriority: 'UTI' | 'SOL' | 'SBU';
  chargerSourcePriority: 'CSO' | 'SNU' | 'OSO';
  machineType: string;
  topology: string;
  outputMode: string;
}

/**
 * Calculates 16-bit CRC-CCITT (XMODEM) for Voltronic PI30 commands.
 * Handles Voltronic protocol escaping for CR (0x0D), LF (0x0A), and '(' (0x28).
 */
export function calculateVoltronicCRC(cmd: string): {
  crc: number;
  crcHigh: number;
  crcLow: number;
  frameBuffer: Buffer;
  frameHex: string;
} {
  let crc = 0;
  for (let i = 0; i < cmd.length; i++) {
    const byte = cmd.charCodeAt(i);
    crc ^= (byte << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  let crcHigh = (crc >> 8) & 0xff;
  let crcLow = crc & 0xff;

  // Voltronic excludes special control characters from CRC bytes
  if (crcLow === 0x0A || crcLow === 0x0D || crcLow === 0x28) crcLow += 1;
  if (crcHigh === 0x0A || crcHigh === 0x0D || crcHigh === 0x28) crcHigh += 1;

  const cmdBytes = Buffer.from(cmd, 'ascii');
  const frameBuffer = Buffer.concat([
    cmdBytes,
    Buffer.from([crcHigh, crcLow, 0x0D]), // Command + 2 CRC bytes + <CR> (0x0D)
  ]);

  return {
    crc,
    crcHigh,
    crcLow,
    frameBuffer,
    frameHex: frameBuffer.toString('hex').toUpperCase(),
  };
}

/**
 * Validates CRC of response frame received from Voltacon inverter.
 */
export function verifyVoltronicCRC(raw: Buffer | string): {
  isValid: boolean;
  cleanPayload: string;
  receivedCrcHex: string;
  calculatedCrcHex: string;
} {
  const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw, 'binary');
  
  // Strip trailing carriage return or newline
  let endIdx = buf.length;
  while (endIdx > 0 && (buf[endIdx - 1] === 0x0D || buf[endIdx - 1] === 0x0A)) {
    endIdx--;
  }

  if (endIdx < 3) {
    return {
      isValid: false,
      cleanPayload: buf.toString('ascii'),
      receivedCrcHex: '',
      calculatedCrcHex: '',
    };
  }

  // Last 2 bytes before \r are CRC
  const payloadBuf = buf.subarray(0, endIdx - 2);
  const recvCrcHigh = buf[endIdx - 2];
  const recvCrcLow = buf[endIdx - 1];

  let crc = 0;
  for (let i = 0; i < payloadBuf.length; i++) {
    const byte = payloadBuf[i];
    crc ^= (byte << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  let calcCrcHigh = (crc >> 8) & 0xff;
  let calcCrcLow = crc & 0xff;
  if (calcCrcLow === 0x0A || calcCrcLow === 0x0D || calcCrcLow === 0x28) calcCrcLow += 1;
  if (calcCrcHigh === 0x0A || calcCrcHigh === 0x0D || calcCrcHigh === 0x28) calcCrcHigh += 1;

  const isValid = recvCrcHigh === calcCrcHigh && recvCrcLow === calcCrcLow;
  const cleanPayload = payloadBuf.toString('ascii').replace(/^\(/, '').trim();

  return {
    isValid,
    cleanPayload,
    receivedCrcHex: Buffer.from([recvCrcHigh, recvCrcLow]).toString('hex').toUpperCase(),
    calculatedCrcHex: Buffer.from([calcCrcHigh, calcCrcLow]).toString('hex').toUpperCase(),
  };
}

/**
 * Parse standard QPIGS response into telemetry values.
 * Format: (230.2 50.0 230.1 50.0 1350 1289 025 390 51.40 026 088 0038 011.2 104.5 51.40 00000 00010110 00 00 01170 010
 */
export function parseQPIGS(rawPayload: string): ParsedQPIGS | null {
  try {
    const clean = rawPayload.replace(/^\(/, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length < 16) return null;

    const gridVoltage = parseFloat(parts[0]) || 0;
    const gridFrequency = parseFloat(parts[1]) || 0;
    const acOutputVoltage = parseFloat(parts[2]) || 0;
    const acOutputFrequency = parseFloat(parts[3]) || 0;
    const acOutputApparentPowerVA = parseInt(parts[4], 10) || 0;
    const acOutputActivePowerWatts = parseInt(parts[5], 10) || 0;
    const outputLoadPercent = parseInt(parts[6], 10) || 0;
    const busVoltage = parseFloat(parts[7]) || 0;
    const batteryVoltage = parseFloat(parts[8]) || 0;
    const batteryChargingCurrent = parseFloat(parts[9]) || 0;
    const batteryCapacitySoc = parseInt(parts[10], 10) || 0;
    const inverterHeatSinkTempC = parseInt(parts[11], 10) || 0;
    const pvInputCurrent = parseFloat(parts[12]) || 0;
    const pvInputVoltage = parseFloat(parts[13]) || 0;
    const batteryVoltageSCC = parseFloat(parts[14]) || 0;
    const batteryDischargeCurrent = parseFloat(parts[15]) || 0;
    const deviceStatusBits = parts[16] || '00000000';
    const batteryOffsetForMppt = parts[17] ? parseInt(parts[17], 10) : undefined;
    const eepromVersion = parts[18] ? parseInt(parts[18], 10) : undefined;
    const pvChargingPowerWatts = parts[19] ? parseInt(parts[19], 10) : Math.round(pvInputVoltage * pvInputCurrent);
    const deviceStatusBits2 = parts[20];

    return {
      gridVoltage,
      gridFrequency,
      acOutputVoltage,
      acOutputFrequency,
      acOutputApparentPowerVA,
      acOutputActivePowerWatts,
      outputLoadPercent,
      busVoltage,
      batteryVoltage,
      batteryChargingCurrent,
      batteryCapacitySoc,
      inverterHeatSinkTempC,
      pvInputCurrent,
      pvInputVoltage,
      batteryVoltageSCC,
      batteryDischargeCurrent,
      deviceStatusBits,
      batteryOffsetForMppt,
      eepromVersion,
      pvChargingPowerWatts,
      deviceStatusBits2,
    };
  } catch (e) {
    console.error('Failed to parse QPIGS response:', e);
    return null;
  }
}

/**
 * Parse QPIRI (Device Rated Information).
 */
export function parseQPIRI(rawPayload: string): ParsedQPIRI | null {
  try {
    const clean = rawPayload.replace(/^\(/, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length < 18) return null;

    const battTypeNum = parts[12];
    let batteryType = '48V LiFePO4 (User Defined)';
    if (battTypeNum === '0') batteryType = 'AGM Sealed Lead Acid';
    else if (battTypeNum === '1') batteryType = 'Flooded Lead Acid';

    const outPrioNum = parts[15];
    let outputSourcePriority: 'UTI' | 'SOL' | 'SBU' = 'SBU';
    if (outPrioNum === '0') outputSourcePriority = 'UTI';
    else if (outPrioNum === '2') outputSourcePriority = 'SOL';

    const chgPrioNum = parts[16];
    let chargerSourcePriority: 'CSO' | 'SNU' | 'OSO' = 'CSO';
    if (chgPrioNum === '1') chargerSourcePriority = 'SNU';
    else if (chgPrioNum === '2') chargerSourcePriority = 'OSO';

    return {
      gridRatingVoltage: parseFloat(parts[0]) || 230,
      gridRatingCurrent: parseFloat(parts[1]) || 21.7,
      acOutputRatingVoltage: parseFloat(parts[2]) || 230,
      acOutputRatingFrequency: parseFloat(parts[3]) || 50,
      acOutputRatingCurrent: parseFloat(parts[4]) || 21.7,
      acOutputRatingApparentPower: parseInt(parts[5], 10) || 5000,
      acOutputRatingActivePower: parseInt(parts[6], 10) || 5000,
      batteryRatingVoltage: parseFloat(parts[7]) || 48.0,
      batteryRechargeVoltage: parseFloat(parts[8]) || 46.0,
      batteryUnderVoltage: parseFloat(parts[9]) || 42.0,
      batteryBulkVoltage: parseFloat(parts[10]) || 56.8,
      batteryFloatVoltage: parseFloat(parts[11]) || 54.0,
      batteryType,
      maxAcChargingCurrent: parseInt(parts[13], 10) || 60,
      maxChargingCurrent: parseInt(parts[14], 10) || 80,
      inputVoltageRange: parts[17] === '0' ? 'Appliance (90-280VAC)' : 'UPS (170-280VAC)',
      outputSourcePriority,
      chargerSourcePriority,
      machineType: 'Off-Grid Hybrid (Transformerless)',
      topology: 'Pure Sine Wave 230V 50Hz',
      outputMode: 'Single Machine Standalone',
    };
  } catch {
    return null;
  }
}

/**
 * Parse QMOD (Device Mode Inquiry).
 */
export function parseQMOD(rawPayload: string): { code: string; label: string; description: string } {
  const clean = rawPayload.replace(/^\(/, '').trim();
  const code = clean.charAt(0) || 'S';
  const modes: Record<string, { label: string; description: string }> = {
    P: { label: 'Power On Mode', description: 'Inverter initializing internal DSP and boot checks.' },
    S: { label: 'Standby Mode', description: 'Inverter in standby. AC output inactive, charger active if PV/Grid present.' },
    L: { label: 'Line Mode (Bypass)', description: 'Utility Grid connected directly to AC loads, charging battery.' },
    B: { label: 'Battery Mode', description: 'Voltacon DC-AC inverter active; powering 230V loads from 48V battery and solar.' },
    F: { label: 'Fault Mode', description: 'Inverter tripped due to internal safety fault or overload.' },
    H: { label: 'Power Saving Mode', description: 'Eco power search active (loads under 50W standby).' },
    D: { label: 'Shutdown Mode', description: 'Voltacon inverter turned off.' },
  };

  return {
    code,
    ...(modes[code] || { label: `Unknown Mode (${code})`, description: 'Custom Voltronic mode flag.' }),
  };
}

/**
 * Generates simulated Voltronic ASCII response for testing/demo when no hardware is attached.
 */
export function generateSimulatedResponse(command: string): string {
  const baseCmd = command.trim().toUpperCase();
  if (baseCmd.startsWith('QPIGS')) {
    const vGrid = (229.5 + Math.random() * 2).toFixed(1);
    const fGrid = '50.0';
    const vAc = (230.0 + (Math.random() - 0.5) * 1.5).toFixed(1);
    const fAc = '50.0';
    const watts = Math.round(1250 + Math.random() * 60);
    const va = Math.round(watts * 1.05);
    const loadPct = String(Math.round((watts / 5000) * 100)).padStart(3, '0');
    const busV = '392';
    const battV = (51.35 + Math.random() * 0.2).toFixed(2);
    const chgA = '026';
    const soc = '088';
    const temp = '0038';
    const pvA = (11.0 + Math.random() * 0.4).toFixed(1);
    const pvV = (104.2 + Math.random() * 0.8).toFixed(1);
    const battSccV = battV;
    const dischgA = '00000';
    const status = '00010110';
    const pvWatts = String(Math.round(parseFloat(pvV) * parseFloat(pvA))).padStart(5, '0');

    return `(${vGrid} ${fGrid} ${vAc} ${fAc} ${String(va).padStart(4, '0')} ${String(watts).padStart(4, '0')} ${loadPct} ${busV} ${battV} ${chgA} ${soc} ${temp} ${pvA} ${pvV} ${battSccV} ${dischgA} ${status} 00 00 ${pvWatts} 010`;
  }

  if (baseCmd.startsWith('QPIRI')) {
    return '(230.0 21.7 230.0 50.0 21.7 5000 5000 48.0 46.0 42.0 56.8 54.0 2 60 080 1 1 0 1 0 0 0 1 0';
  }

  if (baseCmd.startsWith('QMOD')) {
    return '(B'; // Battery mode
  }

  if (baseCmd.startsWith('QFLAG')) {
    return '(Eabdegj'; // Enabled flags: buzzer, bypass, backlight
  }

  if (baseCmd.startsWith('QPIWS')) {
    return '(00000000000000000000000000000000'; // All warnings clear
  }

  if (baseCmd.startsWith('QVFW')) {
    return '(VERFW:00072.70';
  }

  if (baseCmd.startsWith('QID')) {
    return '(92931705100001';
  }

  return '(ACK';
}
