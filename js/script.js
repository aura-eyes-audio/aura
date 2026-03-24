// Récupération des éléments
const videoElement = document.getElementById("camera");
const audio = document.getElementById("audio");

// ---------- AUDIO ----------
let currentVolume = 0.0;
let targetVolume = 0.0;
const fadeSpeed = 0.03;

// ---------- START (PC auto / mobile tap) ----------
function startAudioAndFullscreen() {
    // PC : autoplay
    audio.play().catch(() => {
        // Mobile : attend le tap
        console.log("Interaction requise sur mobile pour lancer l'audio");
    });

    // Plein écran sur mobile
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
}

// Sur mobile, attendre le premier tap
document.body.addEventListener("click", startAudioAndFullscreen, { once: true });

// ---------- CAMERA ----------
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
        videoElement.srcObject = stream;
    });

// ---------- MEDIAPIPE ----------
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true
});

// ---------- VARIABLES ----------
let earHistory = [];
let closedFrames = 0;

// ---------- UTILS ----------
function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function eyeAspectRatio(landmarks, eye) {
    const p1 = landmarks[eye[1]];
    const p2 = landmarks[eye[5]];
    const p3 = landmarks[eye[2]];
    const p4 = landmarks[eye[4]];
    const p5 = landmarks[eye[0]];
    const p6 = landmarks[eye[3]];

    const vertical = distance(p1, p2) + distance(p3, p4);
    const horizontal = distance(p5, p6);

    return vertical / (2.0 * horizontal);
}

// ---------- INDICES YEUX ----------
const LEFT_EYE = [33,160,158,133,153,144];
const RIGHT_EYE = [362,385,387,263,373,380];

// ---------- DETECTION ----------
faceMesh.onResults(results => {
    let eyesClosed = false;

    if (results.multiFaceLandmarks) {
        const landmarks = results.multiFaceLandmarks[0];

        const leftEAR = eyeAspectRatio(landmarks, LEFT_EYE);
        const rightEAR = eyeAspectRatio(landmarks, RIGHT_EYE);
        const ear = (leftEAR + rightEAR) / 2;

        // Lissage
        earHistory.push(ear);
        if (earHistory.length > 5) earHistory.shift();

        const avgEAR = earHistory.reduce((a,b) => a+b) / earHistory.length;

        if (avgEAR < 0.23) closedFrames++;
        else closedFrames = 0;

        eyesClosed = closedFrames >= 5;
    }

    targetVolume = eyesClosed ? 1.0 : 0.0;
});

// ---------- VOLUME SMOOTH ----------
setInterval(() => {
    if (currentVolume < targetVolume) currentVolume = Math.min(currentVolume + fadeSpeed, targetVolume);
    else if (currentVolume > targetVolume) currentVolume = Math.max(currentVolume - fadeSpeed, targetVolume);

    audio.volume = currentVolume * currentVolume;
}, 30);

// ---------- CAMERA LOOP ----------
const camera = new Camera(videoElement, {
    onFrame: async () => { await faceMesh.send({ image: videoElement }); },
    width: 640,
    height: 480
});
camera.start();

// ---------- Lancer audio automatiquement sur PC ----------
startAudioAndFullscreen();
