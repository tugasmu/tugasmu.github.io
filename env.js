// Edit file ini sekali aja. Semua halaman akan otomatis pakai config yang sama.
// Catatan: jangan publish anon key ke repo private? Anon key aman untuk client,
// yang penting RLS kamu bener. Jangan pernah taruh service_role key di client.

window.__ENV__ = {
  APP_NAME: "Tugasmu",
  SUPABASE_URL: "https://stvasgalfivxlwullqgs.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dmFzZ2FsZml2eGx3dWxscWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzg3NDMsImV4cCI6MjA4NTgxNDc0M30.B13VAQ50PEUAHmPzHavMZr5nOhosI6CpLsr_4nrnBDw",
  STORAGE_BUCKET: "submissions",
};
