// Edit file ini sekali aja. Semua halaman akan otomatis pakai config yang sama.
// Catatan: jangan publish anon key ke repo private? Anon key aman untuk client,
// yang penting RLS kamu bener. Jangan pernah taruh service_role key di client.

window.__ENV__ = {
  APP_NAME: "Tugasmu",
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
  STORAGE_BUCKET: "submissions",
};
