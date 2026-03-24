// script.js

// Récupération des éléments
const video = document.getElementById('video-bg');
const audio = document.getElementById('audio-bg');

// Volume initial à 0 pour éviter blocage autoplay
audio.volume = 0;

// Flag pour savoir si audio/vidéo ont été activés
let started = false;

// Listener pour le premier tap
document.addEventListener('click', async () => {
    if (!started) {
        started = true;

        // Lancer la vidéo (déjà autoplay mais on force fullscreen)
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) { // Safari
            video.webkitRequestFullscreen();
        }

        // Lancer l'audio (nécessaire sur mobile pour contourner blocage)
        try {
            await audio.play();
        } catch (err) {
            console.warn('Impossible de lancer l’audio automatiquement:', err);
        }
    }
});

// --- Détection des yeux (exemple simplifié) ---
// Ici tu remplaces par ton code MediaPipe pour détecter yeux fermés
function checkEyes(eyesClosed) {
    // Ajuste le volume au lieu de play/pause
    // Volume = 1 si yeux fermés, sinon 0
    audio.volume = eyesClosed ? 1 : 0;
}

// --- Boucle de détection simulée pour test ---
// Remplace par ton code MediaPipe/FaceMesh
setInterval(() => {
    // Simule yeux ouverts/fermés aléatoire (pour test)
    const eyesClosed = Math.random() > 0.5;
    checkEyes(eyesClosed);
}, 200);
