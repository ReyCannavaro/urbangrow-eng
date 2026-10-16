# 🧠 UrbanGrow AI & Predictive Analytics Agent Rulebook

> **Scope**: `services/ai-engine` (Python 3.11, FastAPI, XGBoost, Scikit-Learn, ONNX Runtime)  
> **Status**: Production Standard Rulebook

---

## ⚡ 1. Target Latensi & Service Level Agreement (SLA)

1. **Sub-10ms Inference Guarantee**:
   - Inferensi deteksi anomali (Isolation Forest) dan kalkulasi Climate Adaptation Score wajib selesai di bawah **10 milidetik** per request.
   - Gunakan format ONNX Runtime untuk eksekusi berbasis CPU tanpa overhead interpreter Python.
2. **In-Memory Model Caching**:
   - Model wajib dimuat ke dalam memori saat inisialisasi aplikasi (`@asynccontextmanager` FastAPI lifespan) dan dilarang membaca file `.joblib` / `.onnx` dari disk di dalam request handler.

---

## 🛡️ 2. Input Validation & Outlier Boundaries

1. **Sensor Sanity Checks**:
   - Jika nilai pH di luar rentang `0.0 – 14.0`, atau suhu air di luar `0.0 – 50.0°C`, endpoint wajib mengembalikan HTTP 422 Unprocessable Entity dengan deskripsi sensor error, bukan melakukan prediksi pada input rusak.
2. **Graceful Fallback**:
   - Jika model ML mengalami kegagalan kalkulasi, sistem wajib mengembalikan nilai heuristic rule-based sebagai fallback agar backend tidak crash.
