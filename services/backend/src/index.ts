import { Elysia } from "elysia";

export interface SensorReading {
  ph: number;
  tds: number;
  waterTemperature: number;
  airTemperature: number;
  humidity: number;
  lightIntensity: number;
}

// Function to generate realistic mock sensor readings for smart aquaponics
export function generateSensorData() {
  const round = (val: number, decimals: number = 2) =>
    Number(val.toFixed(decimals));

  const ph = round(6.5 + Math.random() * 1.0, 2);
  const tds = Math.round(400 + Math.random() * 400);
  const waterTemperature = round(22.0 + Math.random() * 6.0, 1);
  const airTemperature = round(24.0 + Math.random() * 8.0, 1);
  const humidity = round(60.0 + Math.random() * 25.0, 1);
  const lightIntensity = Math.round(300 + Math.random() * 1200);

  return {
    timestamp: new Date().toISOString(),
    data: {
      ph,
      tds,
      waterTemperature,
      airTemperature,
      humidity,
      lightIntensity,
    },
    units: {
      ph: "pH",
      tds: "ppm",
      waterTemperature: "°C",
      airTemperature: "°C",
      humidity: "%",
      lightIntensity: "lux",
    },
    system: {
      status: "online",
      mode: "mock",
      source: "ESP32 Simulated Feed",
    },
  };
}

const app = new Elysia()
  .get("/", () => ({
    name: "UrbanGrow Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      sensorsCurrent: "/api/sensors/current",
    },
  }))
  .get("/api/sensors/current", () => generateSensorData())
  .listen(3000);

console.log(
  `🌱 UrbanGrow Backend (Elysia) is running at http://${app.server?.hostname}:${app.server?.port}`
);
