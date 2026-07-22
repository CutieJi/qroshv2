# QRLens

**Professional QR Code Generator & Scanner** — Generate crisp, customizable QR codes or scan instantly from your camera and images.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

---

## Features

### QR Code Generator
- Generate QR codes from URLs, text, WiFi details, or any content
- Customizable resolution (200px, 300px, 420px)
- Foreground color picker
- One-click PNG download
- 100% client-side — your data never leaves the browser

### QR Code Scanner
- Real-time camera scanning with live viewfinder
- Image file upload scanning
- Auto-detection of URLs with direct "Open Link" action
- Copy decoded content to clipboard

### Community Ratings
- Star rating system (1–5 stars) with live averages
- Real-time updates via Firebase Firestore
- Gmail-only validation for submissions
- Automatic email notifications via EmailJS
- Rating cards with avatar badges and timestamps

---

## Tech Stack

| Layer         | Technology                                                       |
| ------------- | ---------------------------------------------------------------- |
| Frontend      | HTML5, CSS3, Vanilla JavaScript (ES Modules)                     |
| QR Generation | [qrcode.js](https://github.com/davidshimjs/qrcodejs)            |
| QR Scanning   | [html5-qrcode](https://github.com/mebjas/html5-qrcode)          |
| Database      | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| Notifications | [EmailJS](https://www.emailjs.com/)                              |
| Fonts         | Plus Jakarta Sans, Inter, JetBrains Mono (Google Fonts)          |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/CutieJi/qroshv2.git
cd qroshv2
```

### 2. Configure Firebase

Open `firebase-config.js` and replace the config values with your own Firebase project credentials:

```js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Where to find your config:**
1. Go to [Firebase Console](https://console.firebase.google.com) and open (or create) a project
2. Project settings (gear icon) → General → "Your apps" → Web app
3. Copy the `firebaseConfig` object values
4. Enable Firestore Database (Build → Firestore Database → Create database)

### 3. Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ratings/{rating} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'stars', 'createdAt'])
                    && request.resource.data.name is string
                    && request.resource.data.email is string
                    && request.resource.data.stars is int
                    && request.resource.data.stars >= 1
                    && request.resource.data.stars <= 5;
    }
  }
}
```

### 4. Configure EmailJS (Optional)

For automatic Gmail notifications when a new rating is submitted:

1. Create a free account at [emailjs.com](https://www.emailjs.com/)
2. Add Service → Connect your Gmail account
3. Email Templates → Create template using the HTML from `email-template.html`
4. Use subject: `⚡ New Rating Received from {{rater_name}} ({{stars}}/5 Stars)`
5. Update the `emailConfig` in `firebase-config.js`:

```js
export const emailConfig = {
  serviceId: "YOUR_SERVICE_ID",
  templateId: "YOUR_TEMPLATE_ID",
  publicKey: "YOUR_PUBLIC_KEY"
};
```

Template variables: `{{rater_name}}`, `{{rater_email}}`, `{{stars}}`, `{{rating_stars}}`, `{{submitted_at}}`

### 5. Run locally

Open `index.html` in your browser, or serve with any static file server:

```bash
npx serve .
```

---

## File Structure

```
qroshv2/
├── index.html            # Main application page
├── style.css             # Complete stylesheet (dark theme)
├── script.js             # Application logic (ES Module)
├── firebase-config.js    # Firebase & EmailJS credentials
├── email-template.html   # EmailJS notification template
├── EMAIL_TEMPLATE.md     # EmailJS setup guide
└── README.md             # This file
```

---

## Design

- **Dark slate theme** with teal/blue accent gradients
- Glassmorphism panels with backdrop blur
- Animated background glow blobs
- Micro-animations on buttons, cards, and stars
- Fully responsive (mobile-first breakpoints at 768px)
- Accessible with ARIA roles, labels, and keyboard navigation

---

## License

This project is open source. Feel free to use and modify.
