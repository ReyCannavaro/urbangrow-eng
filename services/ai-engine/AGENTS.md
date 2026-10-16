# 🧠 UrbanGrow AI & Predictive Analytics Agent Specification (`services/ai-engine`)

> **Layanan**: Machine Learning & Predictive Analytics Microservice  
> **Teknologi**: Python 3.11, FastAPI, Scikit-Learn, XGBoost, ONNX Runtime, Pydantic v2  
> **Port Default**: `8000` (dijalankan via `uvicorn main:app --reload --port 8000`)

---

## 🎯 1. Mandat & Empat Pipeline Utama AI

Agen AI Engine bertanggung jawab mengubah telemetri mentah menjadi wawasan prediktif adaptif iklim:

1. **Multi-Variate Anomaly Detection (Isolation Forest)**:
   - Mendeteksi anomali korelasi silang (contoh: suhu air naik di atas 30°C bersamaan dengan penurunan laju DO di bawah 4.5 mg/L).
   - Menghasilkan nilai `anomaly_score` (-1.0 hingga 1.0) dan flag `is_anomaly`.
2. **Harvest & Biomass Forecasting (XGBoost Regressor)**:
   - Menghitung akumulasi termal *Growing Degree Days* (GDD):
     $$GDD = \sum \max(0, T_{\text{mean}} - T_{\text{base}})$$
     dengan $T_{\text{base}} = 10^\circ\text{C}$ untuk sayuran tropis.
   - Mengestimasi *Estimated Days to Harvest (EDH)* dan bobot biomassa harian.
3. **Climate Adaptation Score (Composite Index 0–100)**:
   - Menghitung indeks ketahanan iklim berdasarkan 4 pilar terbobot:
     - Kestabilan Suhu Air (Bobot 30%)
     - Kestabilan pH & TDS (Bobot 30%)
     - Kecukupan DO (Bobot 25%)
     - Konsistensi Fotoperiode LED (Bobot 15%)
4. **Adaptive Nutrient & Water Advisory Engine**:
   - Menghasilkan rekomendasi tindakan: penambahan air bersih saat TDS > 800 ppm, aktivasi aerator booster, atau penambahan buffer alami.

---

## 📡 2. Kontrak Endpoint FastAPI

```python
from pydantic import BaseModel, Field

class TelemetryInput(BaseModel):
    ph: float = Field(..., ge=0, le=14, example=6.8)
    tds_ppm: float = Field(..., ge=0, le=3000, example=650.0)
    water_temp_c: float = Field(..., ge=0, le=50, example=25.2)
    air_temp_c: float = Field(..., ge=0, le=60, example=29.0)
    humidity_pct: float = Field(..., ge=0, le=100, example=70.0)
    lux: float = Field(..., ge=0, le=100000, example=20000.0)
    dissolved_oxygen: float = Field(..., ge=0, le=20, example=5.6)

class AnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    risk_level: str  # "LOW", "MODERATE", "CRITICAL"
    recommended_action: str
```

---

## 💾 3. Standar Serialisasi Model

- Model wajib dilatih dan disimpan ke direktori `services/ai-engine/models/` dalam format `.joblib` atau `.onnx`.
- Setiap model wajib menyertakan metadata versi dan tanggal training pada nama file (`isolation_forest_v1_202610.joblib`).

---

## 🌦️ 4. Sintesis Data Iklim Mikro Tropis Sidoarjo

Untuk pelatihan awal sebelum sensor fisik mengumpulkan data 90 hari, AI Engine menggunakan generator data sintetis berbasis profil iklim Kabupaten Sidoarjo / Jawa Timur:
- Suhu Siang Hari: `31°C – 36°C` dengan kelembapan `60% – 75%`.
- Suhu Malam Hari: `24°C – 27°C` dengan kelembapan `80% – 95%`.
- Simulasi Fenomena *Urban Heat Island*: Lonjakan suhu air kolam hingga `32.5°C` pada pukul 12:00–14:30 WIB yang menguji efektivitas sirkulasi aerasi.

---

## 📈 5. Deteksi Concept Drift & Retraining Otomatis

- Lakukan uji statistik **Kolmogorov-Smirnov (KS-test)** pada jendela geser data aktual 7 hari terhadap distribusi baseline training.
- Jika $p\text{-value} < 0.05$ terdeteksi pada metrik pH atau TDS selama 3 hari berturut-turut, trigger sinyal retrain otomatis untuk memperbarui bobot model XGBoost.

---

## ⚡ 6. Inferensi Ringan Edge ONNX Runtime

- Model Scikit-Learn dan XGBoost diekspor ke format ONNX (`model.onnx`).
- Inferensi dijalankan via `onnxruntime` CPU yang menghasilkan latensi inferensi di bawah **5 milidetik** dengan batas alokasi memori maksimal **150 MB RAM** agar dapat berjalan mulus pada Raspberry Pi 4/5.

---

## 🎯 7. Pembobotan Fitur (Feature Importance) & Hyperparameter Grid

Untuk model regresi XGBoost estimasi hari menuju panen (EDH):
1. **Fitur Paling Berpengaruh**:
   - `cumulative_gdd` (38% importance)
   - `daily_avg_water_temp` (24% importance)
   - `avg_lux_exposure_hours` (18% importance)
   - `tds_stability_index` (12% importance)
   - `ph_variance` (8% importance)
2. **Hyperparameter Optimal**:
   ```python
   xgb_params = {
       "n_estimators": 120,
       "max_depth": 5,
       "learning_rate": 0.05,
       "subsample": 0.85,
       "colsample_bytree": 0.8,
       "objective": "reg:squarederror"
   }
   ```

