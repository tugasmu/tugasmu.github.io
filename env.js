// Tugasmu config (edit sekali)
// - Untuk GitHub Pages: biasanya aman.
// - Jangan taruh SERVICE_ROLE key di client.
// - Anon key aman untuk client SELAMA RLS benar.

window.__ENV__ = {
  APP_NAME: "Tugasmu",
  // Optional: kalau kamu deploy di subfolder (project pages), isi BASE_PATH, contoh: "/tugasmu"
  BASE_PATH: "",
  SUPABASE_URL: "https://ojgomkmnqnbyqjyniofi.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZ29ta21ucW5ieXFqeW5pb2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjUwNDUsImV4cCI6MjA4NTg0MTA0NX0.NBS9bxAcO8Ys1TzADoamo0OiHayRJ1RFZJrZg8DPm7M",
  STORAGE_BUCKET: "submissions",
};
