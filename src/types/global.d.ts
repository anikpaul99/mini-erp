/* ============================================================
 * Types — Global Declarations
 * ============================================================ */

// Extend ProcessEnv so env vars are typed
declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;

    // API
    NEXT_PUBLIC_BASE_URL: string;

    // Auth
    AUTH_SECRET: string;

    // Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: string;

    // Socket
    NEXT_PUBLIC_SOCKET_URL: string;
  }
}

// SVG imports
declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}
