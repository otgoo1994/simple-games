/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_BUCKET_URL: string;
  readonly VITE_SUPABASE_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
