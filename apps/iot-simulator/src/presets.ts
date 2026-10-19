export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  sensors: {
    ph: number;
    tds: number;
    waterTemperature: number;
    airTemperature: number;
    humidity: number;
    lightIntensity: number;
    dissolvedOxygen: number;
    waterLevel: number;
  };
  actuators: {
    pump: boolean;
    aerator: boolean;
    feeder: boolean;
    light: boolean;
  };
}

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    id: "optimal_balcony",
    name: "Optimal Balcony (ECAD Normal)",
    description: "Kondisi ideal siang hari tropis untuk Nila dan Pakcoy.",
    sensors: {
      ph: 6.95,
      tds: 620,
      waterTemperature: 25.0,
      airTemperature: 28.5,
      humidity: 70,
      lightIntensity: 22000,
      dissolvedOxygen: 6.2,
      waterLevel: 95,
    },
    actuators: { pump: true, aerator: true, feeder: false, light: true },
  },
  {
    id: "urban_heatwave",
    name: "Urban Heatwave (Gelombang Panas)",
    description: "Suhu udara melonjak ke 36°C, memicu penurunan oksigen terlarut.",
    sensors: {
      ph: 7.2,
      tds: 740,
      waterTemperature: 31.8,
      airTemperature: 36.5,
      humidity: 55,
      lightIntensity: 35000,
      dissolvedOxygen: 3.8,
      waterLevel: 82,
    },
    actuators: { pump: true, aerator: true, feeder: false, light: false },
  },
  {
    id: "ph_crash",
    name: "Biofilter pH Crash (Fermentasi Asam)",
    description: "Akumulasi kotoran ikan menyebabkan penurunan drastis pH air.",
    sensors: {
      ph: 5.25,
      tds: 890,
      waterTemperature: 26.1,
      airTemperature: 29.0,
      humidity: 75,
      lightIntensity: 18000,
      dissolvedOxygen: 5.1,
      waterLevel: 90,
    },
    actuators: { pump: true, aerator: true, feeder: false, light: true },
  },
  {
    id: "water_depleted",
    name: "Tandon Kering (Dry-Run Test)",
    description: "Tandon air surut drastis untuk menguji interlock pengaman pompa.",
    sensors: {
      ph: 6.8,
      tds: 650,
      waterTemperature: 25.5,
      airTemperature: 28.0,
      humidity: 70,
      lightIntensity: 15000,
      dissolvedOxygen: 5.5,
      waterLevel: 8,
    },
    actuators: { pump: false, aerator: true, feeder: false, light: true },
  },
];
