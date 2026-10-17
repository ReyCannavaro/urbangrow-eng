import math
import random
from typing import List, Dict


def generate_sidoarjo_microclimate_samples(num_hours: int = 72) -> List[Dict]:
    """
    Generates synthetic realistic diurnal time-series samples based on
    Sidoarjo, East Java tropical urban microclimate.
    """
    samples = []
    base_time = 0

    for h in range(num_hours):
        hour_of_day = h % 24

        # Solar elevation curve (Peak at 12:00 - 13:00 WIB)
        solar_angle = math.sin((hour_of_day - 6) * math.pi / 12) if 6 <= hour_of_day <= 18 else 0.0

        # Ambient air temp (24C night to 34.5C midday)
        air_temp = 25.0 + (9.5 * max(0.0, solar_angle)) + random.uniform(-0.4, 0.4)

        # Relative humidity (Inverse to temp: 88% dawn, 58% midday)
        humidity = 88.0 - (30.0 * max(0.0, solar_angle)) + random.uniform(-1.5, 1.5)

        # Water temp with thermal inertia (Lagging 2 hours behind air)
        water_lag_angle = math.sin((hour_of_day - 8) * math.pi / 12) if 8 <= hour_of_day <= 20 else 0.0
        water_temp = 24.2 + (3.2 * max(0.0, water_lag_angle)) + random.uniform(-0.15, 0.15)

        # Dissolved Oxygen (Drops slightly when water heats up)
        do = 6.4 - (0.12 * (water_temp - 24.0)) + (0.4 * solar_angle) + random.uniform(-0.1, 0.1)

        # pH (Algae & Pakcoy photosynthesis increases pH slightly during the day)
        ph = 6.85 + (0.25 * solar_angle) + random.uniform(-0.04, 0.04)

        # TDS Nutrients (Slowly concentrates due to daytime evapotranspiration)
        tds = 620.0 + (15.0 * solar_angle) + random.uniform(-5.0, 5.0)

        # Lux
        lux = int(32000.0 * solar_angle) if solar_angle > 0 else 0

        samples.append({
            "hour_index": h,
            "hour_of_day": hour_of_day,
            "air_temp_c": round(air_temp, 2),
            "humidity_pct": round(humidity, 1),
            "water_temp_c": round(water_temp, 2),
            "dissolved_oxygen": round(max(2.0, do), 2),
            "ph": round(ph, 2),
            "tds_ppm": round(tds, 1),
            "lux": lux
        })

    return samples


if __name__ == "__main__":
    dataset = generate_sidoarjo_microclimate_samples(24)
    print(f"Generated {len(dataset)} hourly samples for Sidoarjo microclimate.")
    print("Sample 12:00 WIB:", dataset[12])
