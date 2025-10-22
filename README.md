# Tugasmu - Sistem Pengumpulan Tugas

Sistem pengumpulan tugas online modern untuk sekolah dengan antarmuka yang intuitif.

## 🚀 Demo
[Live Demo](https://tugasmu.github.io/)

## 📁 Struktur Project
Tugasmu-Project/
├── Index.html # File utama (entry point)
├── Assets/
│ ├── Css/
│ │ ├── Main.css # Global styles
│ │ ├── Components.css # Styling untuk komponen
│ │ └── Animations.css # Custom animations
│ ├── Js/
│ │ ├── Main.js # Initialization & app setup
│ │ ├── Auth.js # Login, logout, user management
│ │ ├── Ui.js # UI updates, modal handlers
│ │ ├── Assignment.js # Assignment management
│ │ ├── Admin.js # Admin panel functions
│ │ ├── Supabase.js # Supabase configuration
│ │ └── Utils.js # Helper functions
│ └── Icons/ # Custom icons (jika diperlukan)
├── Components/
│ ├── Header.html # Navigation & header
│ ├── Footer.html # Footer
│ ├── Modals/
│ │ ├── AuthModal.html # Login modal
│ │ ├── AddUserModal.html # Add user modal
│ │ └── AssignmentModal.html # Assignment modals
│ └── Pages/
│ ├── HomePage.html # Home page content
│ ├── AssignmentsPage.html # Assignments management
│ └── AdminPage.html # Admin panel
├── Config/
│ └── Config.js # Environment & constants
└── README.md # Documentation


## ✨ Fitur

### 👨‍💻 Untuk Developer/Admin
- Manajemen pengguna (tambah, edit, hapus)
- Import data siswa dari CSV
- Monitoring statistik sistem
- Manajemen mata pelajaran

### 👨‍🏫 Untuk Guru
- Buat dan kelola tugas
- Berbagai tipe tugas (essay, pilihan ganda, file upload)
- Pantau pengumpulan tugas
- Beri nilai dan feedback

### 👨‍🎓 Untuk Siswa
- Lihat daftar tugas
- Kumpulkan tugas dengan mudah
- Lihat nilai dan feedback

## 🛠️ Teknologi

- **Frontend**: HTML5, Tailwind CSS, JavaScript ES6+
- **Icons**: Lucide Icons
- **Backend**: Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL (via Supabase)

## 🚀 Quick Start

### Option 1: Local Development
1. Clone atau download project ini
2. Buka `Index.html` di browser web
3. Untuk development, gunakan live server untuk menghindari CORS issues

### Option 2: GitHub Pages Deployment
1. Upload semua file ke repository GitHub
2. Buka repository Settings → Pages
3. Pilih "Deploy from a branch" → Pilih branch main
4. Set custom domain jika diperlukan (opsional)
5. Akses aplikasi di: `https://your-username.github.io/repository-name/`

## ⚙️ Konfigurasi

Edit file `Config/Config.js` untuk mengubah:
- URL dan API Key Supabase
- Konstanta aplikasi
- Daftar mata pelajaran

## 🔐 Credentials Testing

**Admin:**
- User ID: `admin`
- Password: `admin123`

**Guru:**
- User ID: `guru001` atau `guru002`
- Password: `guru123`

## 📊 API Endpoints (Supabase)

Sistem menggunakan tabel berikut di Supabase:

- `users` - Data pengguna (admin, guru, siswa)
- `assignments` - Data tugas
- `assignment_questions` - Soal untuk tugas pilihan ganda
- `submissions` - Data pengumpulan tugas

## 💻 Development Notes

- Semua file JavaScript menggunakan ES6 modules
- State management menggunakan global appState object
- Error handling terpusat di service functions
- UI updates dilakukan melalui service functions
- Komponen HTML dimuat secara dinamis menggunakan fetch()

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 Catatan GitHub Pages

Karena menggunakan `Index.html` (huruf kapital), pastikan:

1. Repository settings di GitHub Pages menggunakan branch yang benar
2. File `Index.html` berada di root directory
3. Semua path relatif sudah benar

## 🔧 Troubleshooting

**Issue**: Halaman tidak bisa diakses di GitHub Pages
**Solution**: 
- Pastikan nama file `Index.html` (huruf I kapital)
- Cek console browser untuk error CORS
- Gunakan live server untuk development

**Issue**: Modals tidak muncul
**Solution**:
- Pastikan semua file HTML components terload dengan baik
- Cek network tab di developer tools

## 📄 License

MIT License - bebas digunakan untuk project edukasi dan komersial