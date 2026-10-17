from schemas import HarvestRequest, HarvestResponse


class HarvestPredictor:
    def __init__(self):
        # Target GDD (Base temp = 10.0 C)
        self.CROP_PROFILES = {
            "pakcoy": {
                "base_temp": 10.0,
                "target_gdd": 380.0,
                "nominal_harvest_days": 28,
                "max_biomass_grams": 180.0,
            },
            "kangkung": {
                "base_temp": 12.0,
                "target_gdd": 320.0,
                "nominal_harvest_days": 23,
                "max_biomass_grams": 150.0,
            }
        }

    def predict(self, req: HarvestRequest) -> HarvestResponse:
        crop = req.crop_type.lower()
        if crop not in self.CROP_PROFILES:
            crop = "pakcoy"

        profile = self.CROP_PROFILES[crop]
        base_t = profile["base_temp"]
        target_gdd = profile["target_gdd"]

        # Daily thermal accumulation
        effective_temp = max(0.0, req.current_water_temp_c - base_t)
        accumulated_gdd = effective_temp * req.days_since_planting

        # Remaining GDD
        remaining_gdd = max(0.0, target_gdd - accumulated_gdd)
        daily_rate = max(1.0, effective_temp)
        est_days_left = int(remaining_gdd / daily_rate)

        # Growth percentage & biomass projection
        progress_pct = min(1.0, accumulated_gdd / target_gdd)
        projected_biomass = round(profile["max_biomass_grams"] * (progress_pct ** 1.8), 1)

        if progress_pct < 0.25:
            stage = "Fase Semai / Bibit Awal"
        elif progress_pct < 0.65:
            stage = "Fase Pertumbuhan Vegetatif Cepat"
        elif progress_pct < 0.95:
            stage = "Fase Pematangan & Pembesaran Daun"
        else:
            stage = "Siap Panen Optimal"

        return HarvestResponse(
            crop_type=crop,
            accumulated_gdd=round(accumulated_gdd, 1),
            target_gdd=target_gdd,
            estimated_days_to_harvest=est_days_left,
            projected_biomass_grams=projected_biomass,
            growth_stage=stage
        )


predictor = HarvestPredictor()
