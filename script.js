import { firebaseConfig, emailConfig } from "./firebase-config.js";

/* =========================================================================
   UI HELPERS — Toast & Feedback
   ========================================================================= */
const toastContainer = document.getElementById("toast-container");

function showToast(message, type = "success") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success"
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `${icon}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.25s ease";
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

/* =========================================================================
   TABS
   ========================================================================= */
const tabButtons = document.querySelectorAll(".tab-btn");
const tabSwitch = document.querySelector(".tab-switch");
const panels = {
    generate: document.getElementById("panel-generate"),
    scan: document.getElementById("panel-scan"),
};

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        tabButtons.forEach((b) => {
            b.classList.toggle("is-active", b === btn);
            b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        Object.entries(panels).forEach(([key, el]) => {
            el.hidden = key !== target;
        });
        tabSwitch.dataset.active = target;

        if (target !== "scan" && scannerRunning) {
            stopScanner();
        }
    });
});

/* =========================================================================
   GENERATE QR CODE
   ========================================================================= */
const qrTextInput = document.getElementById("qr-text");
const qrSizeSelect = document.getElementById("qr-size");
const qrColorInput = document.getElementById("qr-color");
const colorValLabel = document.getElementById("color-val-label");
const generateBtn = document.getElementById("generate-btn");
const qrOutput = document.getElementById("qr-output");
const downloadBtn = document.getElementById("download-btn");

let currentQrCanvas = null;

if (qrColorInput && colorValLabel) {
    qrColorInput.addEventListener("input", (e) => {
        colorValLabel.textContent = e.target.value;
    });
}

generateBtn.addEventListener("click", () => {
    const text = qrTextInput.value.trim();
    if (!text) {
        qrTextInput.focus();
        showToast("Please enter text or a link first", "error");
        return;
    }

    qrOutput.innerHTML = "";
    const size = parseInt(qrSizeSelect.value, 10);

    // eslint-disable-next-line no-undef
    new QRCode(qrOutput, {
        text,
        width: size,
        height: size,
        colorDark: qrColorInput.value,
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
    });

    requestAnimationFrame(() => {
        currentQrCanvas = qrOutput.querySelector("canvas");
        downloadBtn.hidden = false;
        showToast("QR code generated successfully!");
    });
});

downloadBtn.addEventListener("click", () => {
    if (!currentQrCanvas) return;
    const link = document.createElement("a");
    link.download = "qrlens-code.png";
    link.href = currentQrCanvas.toDataURL("image/png");
    link.click();
    showToast("Downloaded QR Code image 📸");
});

/* =========================================================================
   SCAN QR CODE
   ========================================================================= */
const startScanBtn = document.getElementById("start-scan-btn");
const stopScanBtn = document.getElementById("stop-scan-btn");
const scanFileInput = document.getElementById("scan-file-input");
const scanLine = document.getElementById("scan-line");
const scanPlaceholder = document.getElementById("scan-placeholder");
const scanResultBox = document.getElementById("scan-result");
const resultActions = document.getElementById("result-actions");
const copyResultBtn = document.getElementById("copy-result-btn");
const openResultLink = document.getElementById("open-result-link");
const scanStatusBadge = document.getElementById("scan-status-badge");

// eslint-disable-next-line no-undef
const html5QrCode = new Html5Qrcode("scan-reader");
let scannerRunning = false;

function looksLikeUrl(str) {
    return /^https?:\/\//i.test(str.trim());
}

function showScanResult(decodedText) {
    scanResultBox.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = decodedText;
    p.style.margin = "0";
    scanResultBox.appendChild(p);

    resultActions.hidden = false;
    if (scanStatusBadge) {
        scanStatusBadge.textContent = "Decoded!";
        scanStatusBadge.classList.add("is-success");
    }

    copyResultBtn.onclick = () => {
        navigator.clipboard.writeText(decodedText);
        showToast("Copied content to clipboard! 📋");
    };

    if (looksLikeUrl(decodedText)) {
        openResultLink.href = decodedText;
        openResultLink.hidden = false;
    } else {
        openResultLink.hidden = true;
    }
}

function onScanSuccess(decodedText) {
    showScanResult(decodedText);
    stopScanner();
    showToast("QR Code scanned successfully! ✨");
}

startScanBtn.addEventListener("click", async () => {
    if (scanPlaceholder) scanPlaceholder.hidden = true;
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            onScanSuccess,
            () => { } // ignore per-frame scan failures
        );
        scannerRunning = true;
        scanLine.hidden = false;
        startScanBtn.hidden = true;
        stopScanBtn.hidden = false;
        if (scanStatusBadge) {
            scanStatusBadge.textContent = "Camera active";
            scanStatusBadge.classList.add("is-success");
        }
    } catch (err) {
        if (scanPlaceholder) scanPlaceholder.hidden = false;
        showToast("Couldn't access camera. Check permissions or upload image.", "error");
        console.error(err);
    }
});

async function stopScanner() {
    if (!scannerRunning) return;
    try {
        await html5QrCode.stop();
        html5QrCode.clear();
    } catch (err) {
        // scanner may already be stopped
    }
    scannerRunning = false;
    scanLine.hidden = true;
    startScanBtn.hidden = false;
    stopScanBtn.hidden = true;
    if (scanPlaceholder) scanPlaceholder.hidden = false;
    if (scanStatusBadge) {
        scanStatusBadge.textContent = "Awaiting scan";
        scanStatusBadge.classList.remove("is-success");
    }
}

stopScanBtn.addEventListener("click", stopScanner);

scanFileInput.addEventListener("change", async () => {
    const file = scanFileInput.files[0];
    if (!file) return;
    if (scanPlaceholder) scanPlaceholder.hidden = true;
    try {
        const decodedText = await html5QrCode.scanFile(file, true);
        showScanResult(decodedText);
        showToast("Image QR Code decoded! ✨");
    } catch (err) {
        scanResultBox.innerHTML = '<p class="placeholder-text">Couldn\'t find a QR code in that image — try another image.</p>';
        showToast("No QR Code detected in uploaded file", "error");
    } finally {
        scanFileInput.value = "";
    }
});

/* =========================================================================
   RATINGS & FIREBASE
   ========================================================================= */
const firebaseWarning = document.getElementById("firebase-warning");
const ratingForm = document.getElementById("rating-form");
const nameInput = document.getElementById("rate-name");
const emailInput = document.getElementById("rate-email");
const starButtons = document.querySelectorAll(".star");
const starHintBadge = document.getElementById("star-hint-badge");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-rating-btn");
const ratingsListEl = document.getElementById("ratings-list");
const averageNumberEl = document.getElementById("average-number");
const averageStarsEl = document.getElementById("average-stars");
const ratingCountEl = document.getElementById("rating-count");

let selectedStars = 0;
const starLabels = ["Poor", "Fair", "Good", "Great!", "Excellent! 🎉"];

starButtons.forEach((star) => {
    star.addEventListener("click", () => {
        selectedStars = parseInt(star.dataset.value, 10);
        paintStars(selectedStars);
        if (starHintBadge) {
            starHintBadge.textContent = `${selectedStars} / 5 Stars — ${starLabels[selectedStars - 1]}`;
        }
    });
    star.addEventListener("mouseenter", () => {
        const val = parseInt(star.dataset.value, 10);
        paintStars(val);
        if (starHintBadge && selectedStars === 0) {
            starHintBadge.textContent = `${val} / 5 Stars — ${starLabels[val - 1]}`;
        }
    });
    star.addEventListener("mouseleave", () => {
        paintStars(selectedStars);
        if (starHintBadge) {
            starHintBadge.textContent = selectedStars > 0
                ? `${selectedStars} / 5 Stars — ${starLabels[selectedStars - 1]}`
                : "Select a rating";
        }
    });
});

function paintStars(count) {
    starButtons.forEach((s) => {
        s.classList.toggle("is-filled", parseInt(s.dataset.value, 10) <= count);
    });
}

function starString(n) {
    const full = Math.round(n);
    return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
}

function isConfigured(config) {
    return config.apiKey && !config.apiKey.startsWith("YOUR_");
}

async function initFirebase() {
    if (!isConfigured(firebaseConfig)) {
        if (firebaseWarning) firebaseWarning.hidden = false;
        ratingForm.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
        return;
    }

    if (firebaseWarning) firebaseWarning.hidden = true;

    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
        const {
            getFirestore,
            collection,
            addDoc,
            onSnapshot,
            query,
            orderBy,
            serverTimestamp,
        } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js");

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const ratingsCol = collection(db, "ratings");

        ratingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            formError.hidden = true;

            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();

            if (!name) {
                return showError("Please enter your name.");
            }
            if (!/^[^\s@]+@gmail\.com$/.test(email)) {
                return showError("Please use a valid @gmail.com address.");
            }
            if (selectedStars < 1) {
                return showError("Please pick a star rating.");
            }

            submitBtn.disabled = true;
            submitBtn.querySelector("span").textContent = "Submitting…";

            try {
                await addDoc(ratingsCol, {
                    name,
                    email,
                    stars: selectedStars,
                    createdAt: serverTimestamp(),
                });

                showToast("Thank you! Your rating has been saved 🎉");

                // Send automatic Gmail notification via EmailJS if configured
                if (
                    typeof window.emailjs !== "undefined" &&
                    emailConfig?.publicKey &&
                    !emailConfig.publicKey.startsWith("YOUR_")
                ) {
                    window.emailjs
                        .send(
                            emailConfig.serviceId,
                            emailConfig.templateId,
                            {
                                rater_name: name,
                                rater_email: email,
                                stars: selectedStars,
                                rating_stars: starString(selectedStars),
                                submitted_at: new Date().toLocaleString(undefined, {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                }),
                            },
                            emailConfig.publicKey
                        )
                        .then(() => console.log("Automatic EmailJS Gmail notification sent!"))
                        .catch((e) => console.error("EmailJS notification error:", e));
                }

                ratingForm.reset();
                selectedStars = 0;
                paintStars(0);
                if (starHintBadge) starHintBadge.textContent = "Select a rating";
            } catch (err) {
                console.error("Firestore save error:", err);
                let msg = "Something went wrong saving your rating. Please try again.";
                if (err.code === "permission-denied") {
                    msg = "Permission denied: Check your Firestore Security Rules in Firebase Console (allow read, write on 'ratings').";
                } else if (err.code === "unavailable") {
                    msg = "Firestore is currently unavailable. Please check your network connection.";
                } else if (err.message) {
                    msg = `Failed to save rating: ${err.message}`;
                }
                showError(msg);
                showToast("Failed to save rating", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector("span").textContent = "Submit Rating";
            }
        });

        const q = query(ratingsCol, orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            if (firebaseWarning) firebaseWarning.hidden = true;
            const ratings = snapshot.docs.map((doc) => doc.data());
            renderRatings(ratings);
        }, (err) => {
            console.error("Firestore snapshot error:", err);
            if (err.code === "permission-denied" && firebaseWarning) {
                firebaseWarning.hidden = false;
                firebaseWarning.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>Firestore permission denied — enable read/write rules for "ratings" collection in Firebase Console.</span>';
            }
        });
    } catch (err) {
        if (firebaseWarning) {
            firebaseWarning.hidden = false;
            firebaseWarning.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>Couldn\'t connect to Firebase — check your config in firebase-config.js.</span>';
        }
        console.error(err);
    }
}

function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
}

function renderRatings(ratings) {
    if (ratings.length === 0) {
        ratingsListEl.innerHTML = '<p class="placeholder-text">No ratings yet — be the first to rate!</p>';
        averageNumberEl.textContent = "–";
        averageStarsEl.textContent = "★★★★★";
        ratingCountEl.textContent = "No ratings yet";
        return;
    }

    const avg = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
    averageNumberEl.textContent = avg.toFixed(1);
    averageStarsEl.textContent = starString(avg);
    ratingCountEl.textContent = `${ratings.length} rating${ratings.length === 1 ? "" : "s"}`;

    ratingsListEl.innerHTML = "";
    ratings.forEach((r) => {
        const card = document.createElement("div");
        card.className = "rating-card";

        const header = document.createElement("div");
        header.className = "rating-card-header";

        const avatar = document.createElement("div");
        avatar.className = "avatar-badge";
        avatar.textContent = (r.name || "A").charAt(0).toUpperCase();

        const info = document.createElement("div");
        info.className = "rating-card-info";

        const name = document.createElement("span");
        name.className = "rating-name";
        name.textContent = r.name;

        const stars = document.createElement("span");
        stars.className = "rating-stars";
        stars.textContent = starString(r.stars);

        info.appendChild(name);
        info.appendChild(stars);

        const date = document.createElement("span");
        date.className = "rating-date";
        date.textContent = r.createdAt?.toDate
            ? r.createdAt.toDate().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
            : "Just now";

        header.appendChild(avatar);
        header.appendChild(info);
        header.appendChild(date);

        card.appendChild(header);
        ratingsListEl.appendChild(card);
    });
}

initFirebase();