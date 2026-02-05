// Tugasmu config (edit sekali)
// - Untuk GitHub Pages: biasanya aman.
// - Jangan taruh SERVICE_ROLE key di client.
// - Anon key aman untuk client SELAMA RLS benar.

window.__ENV__ = {
  APP_NAME: "Tugasmu",
  // Optional: kalau kamu deploy di subfolder (project pages), isi BASE_PATH, contoh: "/tugasmu"
  BASE_PATH: "",
  SUPABASE_URL: "https://stvasgalfivxlwullqgs.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dmFzZ2FsZml2eGx3dWxscWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzg3NDMsImV4cCI6MjA4NTgxNDc0M30.B13VAQ50PEUAHmPzHavMZr5nOhosI6CpLsr_4nrnBDw",
  STORAGE_BUCKET: "submissions",
};
