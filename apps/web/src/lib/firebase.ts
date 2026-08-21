import { initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  inMemoryPersistence,
  initializeAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (
  import.meta.env.PROD &&
  Object.values(firebaseConfig).some((value) => !String(value ?? "").trim())
) {
  throw new Error(
    "Firebase web configuration is required for production builds. Set the VITE_FIREBASE_* variables on the Railway Web service before building.",
  );
}

const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: inMemoryPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});
