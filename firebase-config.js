// ---------------------------------------------------------------------------
// Paste your Firebase project's config here.
//
// Where to find it:
//   1. Go to https://console.firebase.google.com and open (or create) a project.
//   2. Project settings (gear icon) → General → "Your apps" → Web app.
//   3. Copy the firebaseConfig object it gives you and paste the values below.
//   4. Also enable Firestore Database (Build → Firestore Database → Create database).
//
// See README.md for full setup steps and the security rules to paste in.
// ---------------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: "AIzaSyAReTYcfsqaWdK530yIMXTwf1zGI1qHDgs",
  authDomain: "qrosh-531fc.firebaseapp.com",
  projectId: "qrosh-531fc",
  storageBucket: "qrosh-531fc.firebasestorage.app",
  messagingSenderId: "255847259191",
  appId: "1:255847259191:web:279192cf616c0b8f8df3b2"
};

// ---------------------------------------------------------------------------
// EmailJS config (for receiving automatic Gmail notifications on new ratings)
// Setup:
// 1. Create a free account at https://www.emailjs.com/
// 2. Add Service → Connect your Gmail account
// 3. Email Templates → Create template with {{name}}, {{email}}, {{stars}}
// 4. Copy your Service ID, Template ID, and Public Key below.
// ---------------------------------------------------------------------------
export const emailConfig = {
  serviceId: "service_ukguwrq",
  templateId: "template_ydf142b",
  publicKey: "nhWEAxUHpKMVjNrl2"
};