from schemas import ClimateScoreRequest, ClimateScoreResponse


class ClimateScorer:
    def calculate(self, req: ClimateScoreRequest) -> ClimateScoreResponse:
        t = req.telemetry
        insights = []

        # 1. Temperature Stability Score (Weight: 30%)
        # Ideal water temp: 24 - 26 C
        if 23.0 <= t.water_temp_c <= 27.0:
            temp_score = 100.0
        elif 21.0 <= t.water_temp_c < 23.0 or 27.0 < t.water_temp_c <= 29.5:
            temp_score = 80.0
            insights.append("Suhu air sedikit berfluktuasi namun masih dalam batas toleransi.")
        else:
            temp_score = max(20.0, 100.0 - (abs(t.water_temp_c - 25.0) * 12.0))
            insights.append("Stres termal terdeteksi: Suhu air kolam membutuhkan naungan atau pendinginan evaporatif.")

        # 2. Water Quality Score: pH & TDS (Weight: 30%)
        # Ideal pH: 6.8 - 7.2, TDS: 550 - 750 ppm
        ph_dev = abs(t.ph - 7.0)
        ph_score = max(0.0, 100.0 - (ph_dev * 50.0))

        if 500.0 <= t.tds_ppm <= 750.0:
            tds_score = 100.0
        else:
            tds_dev = abs(t.tds_ppm - 625.0)
            tds_score = max(30.0, 100.0 - (tds_dev * 0.15))

        quality_score = (ph_score * 0.5) + (tds_score * 0.5)
        if ph_score < 70.0:
            insights.append("pH air menyimpang dari titik netral nitrifikasi bakteri.")

        # 3. Dissolved Oxygen Adequacy (Weight: 25%)
        # Target DO > 5.5 mg/L
        if t.dissolved_oxygen >= 5.8:
            do_score = 100.0
        elif t.dissolved_oxygen >= 4.5:
            do_score = 75.0
            insights.append("DO mencukupi untuk Lele namun berada di batas minimum kenyamanan Nila.")
        else:
            do_score = max(10.0, (t.dissolved_oxygen / 5.5) * 60.0)
            insights.append("PERINGATAN DO RENDAH: Tingkatkan aerasi oksigen terlarut segera.")

        # 4. Photoperiod Consistency (Weight: 15%)
        # Target 12 hours/day for Pakcoy & Kangkung
        if 10.0 <= req.photoperiod_hours <= 14.0 and t.lux >= 12000.0:
            photo_score = 100.0
        else:
            photo_score = 70.0
            insights.append("Fotoperiode LED atau intensitas Lux belum optimal untuk laju fotosintesis puncak.")

        # Weighted Composite Score
        composite_score = round(
            (temp_score * 0.30) +
            (quality_score * 0.30) +
            (do_score * 0.25) +
            (photo_score * 0.15),
            1
        )

        if composite_score >= 88.0:
            grade = "EXCELLENT"
        elif composite_score >= 75.0:
            grade = "OPTIMAL"
        elif composite_score >= 55.0:
            grade = "STRESSED"
        else:
            grade = "CRITICAL"

        if not insights:
            insights.append("Seluruh parameter ekosistem akuaponik beroperasi pada performa iklim adaptif terbaik.")

        return ClimateScoreResponse(
            climate_adaptation_score=composite_score,
            resilience_grade=grade,
            sub_scores={
                "temperature_stability": round(temp_score, 1),
                "water_quality": round(quality_score, 1),
                "dissolved_oxygen": round(do_score, 1),
                "photoperiod_consistency": round(photo_score, 1),
            },
            insights=insights
        )


scorer = ClimateScorer()
