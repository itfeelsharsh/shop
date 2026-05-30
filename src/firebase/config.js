import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Initialize Firestore with experimentalForceLongPolling to fix WebChannel connection issues
// This helps prevent 400 Bad Request errors that occur when writing to Firestore
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false
});

// Initialize Messaging
export const messaging = getMessaging(app);

// Initialize App Check
if (typeof window !== "undefined") {
    // Enable App Check debug token in local development environments
    if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        process.env.NODE_ENV === "development"
    ) {
        window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(
            process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LdQtjcrAAAAAB-gw9QaVLt8zIUTcvWAjCmlVwDs"
        ),
        isTokenAutoRefreshEnabled: true,
    });
}

