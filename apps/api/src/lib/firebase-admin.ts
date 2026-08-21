import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function createFirebaseCredential() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();

  if (serviceAccount) {
    try {
      return cert(JSON.parse(serviceAccount) as ServiceAccount);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT must be valid JSON.");
    }
  }

  return applicationDefault();
}

const firebaseApp =
  getApps()[0] ??
  initializeApp({
    credential: createFirebaseCredential(),
  });

export const firebaseAuth = getAuth(firebaseApp);
