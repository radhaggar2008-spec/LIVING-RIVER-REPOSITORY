export type StatusLevel = 'Green' | 'Yellow' | 'Red';

export interface SensorReading {
  id: string;
  time: string;
  station: string;
  waterTemp: number; // °C
  flow: number; // m3/s
  dissolvedOxygen: number; // mg/L
  radiation: number; // µSv/h
}

export interface AlertStatus {
  isAlert: boolean;
  level: StatusLevel;
  bannerText: string;
  reason: string;
  temperature: number;
  threshold: number;
}

export const sensorData: SensorReading[] = [
  {
    id: 'YMN-01',
    time: '00:00',
    station: 'Faridabad North Intake',
    waterTemp: 28.4,
    flow: 114,
    dissolvedOxygen: 7.1,
    radiation: 0.06,
  },
  {
    id: 'YMN-02',
    time: '03:00',
    station: 'Faridabad North Intake',
    waterTemp: 28.1,
    flow: 116,
    dissolvedOxygen: 7.2,
    radiation: 0.06,
  },
  {
    id: 'YMN-03',
    time: '06:00',
    station: 'Sector 15 Weir',
    waterTemp: 28.9,
    flow: 118,
    dissolvedOxygen: 7.0,
    radiation: 0.07,
  },
  {
    id: 'YMN-04',
    time: '09:00',
    station: 'Sector 15 Weir',
    waterTemp: 29.8,
    flow: 121,
    dissolvedOxygen: 6.8,
    radiation: 0.07,
  },
  {
    id: 'YMN-05',
    time: '12:00',
    station: 'Thermal Outfall Upstream',
    waterTemp: 31.2,
    flow: 124,
    dissolvedOxygen: 6.5,
    radiation: 0.08,
  },
  {
    id: 'YMN-06',
    time: '15:00',
    station: 'Thermal Outfall Mixing Zone',
    waterTemp: 33.1,
    flow: 122,
    dissolvedOxygen: 6.0,
    radiation: 0.09,
  },
  {
    id: 'YMN-07',
    time: '18:00',
    station: 'Estuary Buffer East',
    waterTemp: 32.9,
    flow: 119,
    dissolvedOxygen: 6.1,
    radiation: 0.08,
  },
  {
    id: 'YMN-08',
    time: '21:00',
    station: 'Mangrove Sanctuary Edge',
    waterTemp: 32.2,
    flow: 120,
    dissolvedOxygen: 6.3,
    radiation: 0.08,
  },
  {
    id: 'YMN-09',
    time: '24:00',
    station: 'Yamuna Faridabad Primary',
    waterTemp: 32.5,
    flow: 120,
    dissolvedOxygen: 6.2,
    radiation: 0.08,
  },
];

export const CPCB_RULE_TEXT =
  'Existing Plants: Max +10°C rise | New Coastal: Max +7°C rise';

export function checkAlerts(temp: number): AlertStatus {
  const threshold = 35;
  if (temp > threshold) {
    return {
      isAlert: true,
      level: 'Red',
      bannerText: 'PREDICT -> ALERT -> DIVERT / INVESTIGATE',
      reason: `Water temperature reached ${temp.toFixed(1)}°C, exceeding the ${threshold.toFixed(1)}°C ecological thermal threshold.`,
      temperature: temp,
      threshold,
    };
  }

  return {
    isAlert: false,
    level: 'Green',
    bannerText: 'NOMINAL THERMAL TELEMETRY',
    reason: `Current temperature (${temp.toFixed(1)}°C) remains below the ${threshold.toFixed(1)}°C alert threshold.`,
    temperature: temp,
    threshold,
  };
}

export interface MapZonePin {
  id: string;
  label: string;
  zoneName: string;
  status: StatusLevel;
  coordinates: string;
  description: string;
  topPercent: string;
  leftPercent: string;
  reading: string;
}

export const mapZonePins: MapZonePin[] = [
  {
    id: 'pin-thermal',
    label: 'Thermal Plant - ALERT',
    zoneName: 'Faridabad Thermal Cooling Outfall',
    status: 'Red',
    coordinates: '28.4214° N, 77.3382° E',
    description:
      'Active industrial cooling water discharge channel requiring continuous CPCB delta-T verification.',
    topPercent: '27%',
    leftPercent: '34%',
    reading: 'Outfall plume monitored · Max +10°C cap',
  },
  {
    id: 'pin-estuary',
    label: 'Estuary - NO-GO ZONE',
    zoneName: 'Yamuna Confluence & Spawning Reach',
    status: 'Red',
    coordinates: '28.4052° N, 77.3548° E',
    description:
      'Zero industrial discharge and zero vessel anchoring permitted to protect juvenile fish migration.',
    topPercent: '52%',
    leftPercent: '54%',
    reading: 'Strict Exclusion Perimeter · 500m Buffer',
  },
  {
    id: 'pin-mangrove',
    label: 'Mangrove - SENSITIVE',
    zoneName: 'Riparian Wetland & Floodplain Buffer',
    status: 'Yellow',
    coordinates: '28.3895° N, 77.3712° E',
    description:
      'Ecologically fragile shoreline bio-filter highly vulnerable to thermal plumes and dissolved oxygen drops.',
    topPercent: '72%',
    leftPercent: '71%',
    reading: 'Target DO >= 6.0 mg/L · Bio-Sensitive',
  },
];

export interface ControlStep {
  number: string;
  title: string;
  summary: string;
  protocol: string;
}

export const controlArchitectureSteps: ControlStep[] = [
  {
    number: '01',
    title: 'Prevent',
    summary: 'Closed-loop cooling towers and pre-discharge heat recovery.',
    protocol:
      'Enforce intake-to-outfall thermal limits before effluent enters the river channel.',
  },
  {
    number: '02',
    title: 'Contain',
    summary: 'Baffle retention basins and emergency diversion sluices.',
    protocol:
      'Isolate off-spec thermal or radiological plumes inside secondary holding lagoons.',
  },
  {
    number: '03',
    title: 'Detect',
    summary: 'Continuous multiparameter telemetry buoys and gamma probes.',
    protocol:
      'Track water temperature, flow velocity, dissolved oxygen, and µSv/h radiation every 60s.',
  },
  {
    number: '04',
    title: 'Respond',
    summary: 'Automated threshold escalation via PREDICT -> ALERT -> DIVERT.',
    protocol:
      'Dispatch field inspection teams and trigger cooling intake throttling when temp > 35°C.',
  },
  {
    number: '05',
    title: 'Assure',
    summary: 'CPCB compliance auditing and open citizen incident logs.',
    protocol:
      'Verify biological recovery, maintain audit trails, and publish zone compliance records.',
  },
];

export interface NoGoZoneItem {
  name: string;
  classification: string;
  rule: string;
  buffer: string;
}

export const noGoZonesList: NoGoZoneItem[] = [
  {
    name: 'Estuary & Fish Spawning Corridor',
    classification: 'Absolute No-Go Zone',
    rule: 'Zero thermal outfall, dredging, or chemical effluent release permitted year-round.',
    buffer: '500 m upstream & downstream',
  },
  {
    name: 'Mangrove & Riparian Bio-Wetland',
    classification: 'Sensitive Ecological Sanctuary',
    rule: 'Strict thermal delta cap (+2°C max) and mandatory dissolved oxygen protection (>= 6.0 mg/L).',
    buffer: '350 m shoreline perimeter',
  },
  {
    name: 'Municipal Drinking Water Intake Reach',
    classification: 'Critical Utility Zone',
    rule: 'Zero industrial discharge allowed; continuous radiation (< 0.15 µSv/h) and turbidity lock.',
    buffer: '1,000 m upstream radius',
  },
  {
    name: 'Thermal Mixing Exclusion Perimeter',
    classification: 'Restricted Industrial Zone',
    rule: 'Public access restricted; cooling outfall must achieve full CPCB dissipation within mixing zone.',
    buffer: '150 m diffuser corridor',
  },
];
