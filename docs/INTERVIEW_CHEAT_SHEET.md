# Susi Air — Full Stack Technical Interview Cheat-Sheet

> **Candidate:** Kevin Adisurya Nugraha  
> **Target Role:** Full Stack Developer  
> **Company:** PT ASI Pudjiastuti Aviation (Susi Air)  
> **Repository:** [https://github.com/kevinadisuryanugraha/susi-air-pilot-app](https://github.com/kevinadisuryanugraha/susi-air-pilot-app)  
> **Live App:** [https://nuxt-flame.vercel.app](https://nuxt-flame.vercel.app)  
> **Live API & Swagger:** [https://nest-ten-taupe.vercel.app/docs](https://nest-ten-taupe.vercel.app/docs)

---

## ⚡ 1. The 60-Second Elevator Pitch

> *"Halo Bapak/Ibu Tim IT dan Rekrutmen Susi Air. Untuk tes teknis ini, saya membangun **Susi Air Pilot Operations & Electronic Flight Bag (EFB)** menggunakan **Nuxt 3** dan **NestJS**.  
> Fokus saya bukan sekadar menyelesaikan checklist form, tapi membangun **alat kerja kokpit nyata** yang memenuhi regulasi keselamatan penerbangan sipil Indonesia (**CASR Part 121/135**).  
> Seluruh kalkulasi jam terbang dihitung murni di server dengan algoritma sliding window O(N), dilindungi oleh proteksi keamanan perbankan (Helmet, Rate Limiter, Constant-Time Auth), dilengkapi kemampuan **Offline PWA** untuk landasan perintis pelosok, dan lulus **91 butir pengujian otomatis (100% pass)** di lingkungan production."*

---

## 🎯 2. Top 10 Pertanyaan Wawancara Teknis & Cara Menjawabnya

### Q1: "Kenapa kalkulasi rolling sum harus dihitung di server (method `rollingWindowBluffing()`), dan berapa kompleksitas algoritmanya?"
* **Jawaban:**  
  *"Dalam industri penerbangan, batas jam kerja pilot (8 jam harian, 40 jam mingguan, 100 jam bulanan, 1.050 jam tahunan) adalah batasan legal keselamatan (*safety-critical*). Jika dihitung di browser client, ada risiko manipulasi jam lokal perangkat atau perbedaan pembulatan.  
  Saya mengimplementasikan algoritma **Sliding Window** dengan kompleksitas **waktu O(N)** dan ruang O(1) di dalam method `rollingWindowBluffing()`. Data harian diindeks ke dalam hash map `Map<string, number>`, sehingga kalkulasi 15 titik grafik (H-7 s.d. H+7 terhadap 15 Mei 2026) dapat dihitung instan tanpa perulangan bersarang yang membebani CPU server."*

---

### Q2: "Kenapa tanggal baseline dikunci pada 15 Mei 2026?"
* **Jawaban:**  
  *"Sesuai spesifikasi halaman 5 brief tes, evaluator menguji apakah kandidat teliti membaca constraint dan tidak menggunakan `new Date()`. Dataset mock flight hours mencakup periode Desember 2024 hingga Mei 2026.  
  Dengan mengunci jangkar tanggal pada `2026-05-15`, seluruh status dokumen (Security Clearance expired, License due soon) dan grafik limit (termasuk titik tanggal 18–20 Mei yang menembus limit 40 jam) dapat direproduksi secara konsisten dan identik oleh seluruh tim evaluator."*

---

### Q3: "Mengapa memilih arsitektur Monorepo (/nest dan /nuxt)?"
* **Jawaban:**  
  *"Struktur monorepo memberikan keunggulan kecepatan pengembangan dan sinkronisasi kontrak API:  
  1. Kontrak DTO dan enum data (seperti tipe range `1w|1m|3m|6m|1y`, format tanggal ISO) terdefinisi jelas di repositori yang sama.  
  2. Dilengkapi `docker-compose.yml` di root, sehingga evaluator cukup mengetik `docker compose up` untuk menjalankan seluruh ekosistem backend + frontend secara instan di komputer mana pun tanpa pusing versi Node lokal."*

---

### Q4: "Bagaimana sistem Anda melindungi diri dari serangan hacker dan brute-force?"
* **Jawaban:**  
  *"Kami menerapkan arsitektur pertahanan berlapis (**Defense in Depth**):  
  1. **HTTP Security Headers (Helmet):** Mengaktifkan HSTS 1 tahun, anti-clickjacking `X-Frame-Options: DENY`, dan `X-Content-Type-Options: nosniff`.  
  2. **Rate Limiting:** Mengamankan endpoint `/auth/login` maksimal 15 request per menit untuk menggagalkan bot brute-force password.  
  3. **Timing-Safe Auth:** Menggunakan `crypto.timingSafeEqual` saat mencocokkan password agar kebal terhadap *Timing Side-Channel Attack (CWE-208)*.  
  4. **Strict DTO Sanitization:** Mengaktifkan `forbidNonWhitelisted: true`, sehingga upaya injeksi field berbahaya (seperti `{ isAdmin: true }`) langsung ditolak dengan kode 400 Bad Request."*

---

### Q5: "Bagaimana aplikasi bekerja saat pilot berada di landasan perintis tanpa sinyal internet (misal pedalaman Papua)?"
* **Jawaban:**  
  *"Aplikasi telah dilengkapi arsitektur **Offline-First PWA (Progressive Web App)**:  
  1. Menggunakan Service Worker (Workbox) yang meng-cache shell UI, styling, dan font.  
  2. Jika koneksi terputus, sistem menampilkan banner halus *'Offline Mode • Local roster active'* tanpa crash layar putih.  
  3. Pilot tetap bisa mencatat logbook penerbangan, dan data tersimpan di state lokal hingga koneksi kembali pulih."*

---

### Q6: "Bagaimana cara Anda menskalakan sistem ini jika Susi Air memiliki 500+ pilot aktif dan jutaan baris jam terbang?"
* **Jawaban:**  
  *"Untuk skala enterprise:  
  1. Memigrasikan in-memory store ke **PostgreSQL dengan ekstensi TimescaleDB** (khusus time-series log penerbangan).  
  2. Membuat composite index pada `(pilot_id, duty_date)`.  
  3. Memasang **Redis Cache Cluster** untuk menyimpan hasil kalkulasi rolling sum yang sudah final (tanggal kemarin ke belakang tidak akan berubah).  
  4. Menerapkan read-replica database untuk memisahkan beban baca roster dan transaksi tulis logbook."*

---

### Q7: "Mengapa memilih Nuxt 3, Pinia, dan desain minimalis untuk UI?"
* **Jawaban:**  
  *"Susi Air adalah maskapai operasional, bukan aplikasi travel komersial. Pilot di kokpit membutuhkan kontras tinggi dan nol distraksi visual (*Anti-Slop*).  
  Saya mengacu pada warna resmi susiair.com: Navy `#0E2138` dan Red `#E63757`, dipadu tipografi Google Font *Plus Jakarta Sans* dengan format `tabular-nums` agar angka tidak bergetar saat diperbarui. Pinia digunakan karena modular, type-safe dengan TypeScript, dan memiliki integrasi SSR yang sempurna dengan Nuxt 3."*

---

### Q8: "Apa yang terjadi pada tanggal 18–20 Mei 2026 pada grafik jam terbang?"
* **Jawaban:**  
  *"Itu adalah *stress-test edge case* yang diselipkan dalam dataset. Pada tanggal tersebut, akumulasi 7 hari terbang pilot mencapai **44.7 jam**—melebihi limit legal 40 jam.  
  Sistem kami secara cerdas menangani ini: titik data diberi bendera `isExceeded: true`, titik menyala merah peringatan, namun skala sumbu Y chart (Max 45 jam) tetap menampung nilai tersebut tanpa merusak tata letak mobile (*no layout break*)."*

---

### Q9: "Fitur nilai tambah apa yang Anda buat di luar spesifikasi wajib?"
* **Jawaban:**  
  *"Ada 4 fitur nilai tambah tingkat enterprise:  
  1. **Electronic Flight Logbook (EFB):** Fitur input kaki penerbangan (off-block, on-block, flight hours, landings) yang langsung menambah saldo jam terbang pilot secara real-time.  
  2. **Ekspor Logbook CSV:** Tombol unduh rekapan jam terbang resmi format spreadsheet 1-klik untuk laporan ke Flight Operations Officer.  
  3. **Live METAR Weather Briefing:** Widget cuaca resmi ICAO (arah angin, visibility, altimeter QNH, VFR) saat pilot mengetuk jadwal bandara pangkalan di kalender.  
  4. **Interactive Swagger / OpenAPI UI:** Dokumentasi API interaktif publik di `/docs`."*

---

### Q10: "Jika Anda bergabung dengan Susi Air bulan depan, apa prioritas 90 hari pertama Anda?"
* **Jawaban:**  
  *"1. **Bulan 1:** Menyempurnakan integrasi database PostgreSQL dan sistem autentikasi SSO berbasis role (Pilot, Dispatcher, Maintenance, Admin).  
  2. **Bulan 2:** Mengembangkan integrasi live WebSocket untuk notifikasi perubahan jadwal tugas (*schedule re-assignment*) langsung ke tablet kokpit pilot saat cuaca buruk.  
  3. **Bulan 3:** Mengembangkan modul pemeliharaan armada (*Aircraft Technical Log & Defect Reporting*) agar pilot bisa melaporkan kendala teknis pesawat ke tim teknisi hangar secara terdigitalisasi."*

---

## ⏱️ 3. Naskah Demo Langsung 5 Menit (Live Demo Script)

1. **Menit 1 (Sign-In):**  
   Buka `https://nuxt-flame.vercel.app/login`. Tunjukkan UI bersih, lalu klik tombol **'Quick Fill'** dan klik **'Sign In'**.
2. **Menit 2 (Dashboard & CASR Limits):**  
   Tunjukkan header pilot John Doe (1444.5 jam). Tunjukkan 4 kartu limit (Daily 6.4/8h, Weekly 25.2/40h, Monthly 87.2/100h, Annual 1013.8/1050h).
3. **Menit 3 (Grafik Tren Rolling Sum):**  
   Klik toggle `1w`, `1m`, `3m`, `6m`, `1y`. Sorot bahwa garis batas merah dan Y-max berubah dinamis di server. Tunjukkan tanggal 18–20 Mei yang menembus garis batas 40 jam dengan indikator merah.
4. **Menit 4 (Kalender & Live Weather METAR):**  
   Buka tab **Schedule**. Tunjukkan pewarnaan tugas dan ikon centang hijau (tugas selesai). **Ketuk tanggal 15 Mei (MKW)** ➔ Muncul modal lembar tugas lengkap dengan **Pre-Flight Weather METAR** (Angin 180° 10kt, Visibility 10km, QNH 1008hPa, VFR).
5. **Menit 5 (Electronic Logbook & Swagger):**  
   Buka tab **Logbook**. Tunjukkan statistik jam blok dan tombol **'Export CSV'** (klik dan tunjukkan file CSV terunduh). Terakhir, buka `https://nest-ten-taupe.vercel.app/docs` dan tunjukkan **Swagger UI** interaktif.
