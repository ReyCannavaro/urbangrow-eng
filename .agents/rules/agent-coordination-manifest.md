# 🤝 UrbanGrow Multi-Agent Coordination & Conflict Resolution Manifest

> **Tujuan**: Mengatur Prioritas Eksekusi dan Resolusi Konflik Antar Agen AI Otonom  
> **Status**: Approved Protocol Standard

---

## ⚖️ 1. Matriks Hierarki & Prioritas Keputusan

Jika terjadi kontradiksi keputusan antar modul/agen, prioritaskan urutan keamanan berikut:

```
[Level 1: TERTINGGI]  Keamanan Fisik Ikan & Tanaman (Interlock Hardware & DO Booster)
       ▲
[Level 2]             Stabilitas Jaringan & Ingestion Data (Elysia API & TimescaleDB)
       ▲
[Level 3]             Prediksi AI & Penjadwalan Nutrisi (XGBoost / Isolation Forest)
       ▲
[Level 4: TERENDAH]   Presentasi Visual & Kosmetik Antarmuka (Web / Mobile Rendering)
```

### Aturan Resolusi:
- Jika model AI menyarankan mematikan aerator untuk menghemat daya, namun sensor mendeteksi DO < 5.0 mg/L di Level 3 (Kolam Nila), aturan keamanan perangkat keras **wajib mengabaikan saran AI** dan menyalakan aerator.

---

## 📢 2. Protokol Notifikasi Inter-Agent

- Setiap agen yang melakukan refactor skema database wajib memicu notifikasi update tipe ke backend dan frontend sebelum task dinyatakan `DONE`.
