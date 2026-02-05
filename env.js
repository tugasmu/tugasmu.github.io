// Tugasmu config (edit sekali)
// - Untuk GitHub Pages: biasanya aman.
// - Jangan taruh SERVICE_ROLE key di client.
// - Anon key aman untuk client SELAMA RLS benar.

window.__ENV__ = {
  APP_NAME: "Tugasmu",
  // Optional: kalau kamu deploy di subfolder (project pages), isi BASE_PATH, contoh: "/tugasmu"
  BASE_PATH: "",
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
  STORAGE_BUCKET: "submissions",
};
