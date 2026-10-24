"use strict";
// Navigation : vidéo → accueil → questionnaire Eval&Go.
// Les questions, scores et résultats sont exclusivement gérés par Eval&Go.
const screens = Array.from(document.querySelectorAll('main.shell > section.screen'));
const video = document.getElementById('openingVideo');
const music = new Audio('./Sinister - Anno Domini Beats.mp3');
music.loop = true;
music.volume = 0.5;
music.preload = 'auto';
let musicStarted = false;

function showScreen(id) {
  screens.forEach(screen => {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle('hidden', !active);
    screen.classList.toggle('is-active', active);
  });
  document.body.dataset.activeScreen = id;
  window.scrollTo(0, 0);
}

let switchingFromIntro = false;
async function leaveVideoIntro() {
  if (switchingFromIntro) return;
  switchingFromIntro = true;
  video.pause();
  // Afficher immédiatement l'accueil, même si le navigateur refuse de sortir du plein écran.
  showScreen('intro');
  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (_) {}
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
}

// Tentative automatique : sur mobile, les navigateurs peuvent refuser
// le plein écran ou le verrouillage paysage sans interaction utilisateur.
// L'introduction reste alors lisible en portrait, sans être recadrée.
async function tryAutomaticLandscape() {
  if (!window.matchMedia('(max-width: 760px) and (orientation: portrait)').matches) return;
  const intro = document.getElementById('videoIntro');
  try {
    if (intro.requestFullscreen && !document.fullscreenElement) {
      await intro.requestFullscreen();
    }
    if (document.fullscreenElement === intro && screen.orientation?.lock) {
      try { await screen.orientation.lock('landscape'); } catch (_) {}
    }
  } catch (_) {
    // Refus normal sur Chrome mobile : aucune action requise.
  }
}
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    try { screen.orientation?.unlock?.(); } catch (_) {}
  }
});

function startMusic() {
  if (!music.paused) return;
  music.play().then(() => {
    musicStarted = true;
  }).catch(() => {
    // Lecture avec son souvent interdite avant une interaction sur mobile.
  });
}

// Essayer dès l'ouverture, puis débloquer au premier geste utilisateur
// sans arrêter la vidéo ni changer d'écran.
document.addEventListener('pointerdown', startMusic, { passive: true });
document.addEventListener('keydown', startMusic);


document.getElementById('skipVideoBtn').addEventListener('click', leaveVideoIntro);
video.addEventListener('ended', leaveVideoIntro);
video.addEventListener('error', leaveVideoIntro);
document.getElementById('startBtn').addEventListener('click', () => {
  startMusic();
  showScreen('survey');
});
document.getElementById('backToResultBtn').addEventListener('click', () => showScreen('intro'));
document.querySelector('.brand').addEventListener('click', event => {
  event.preventDefault();
  if (!video.paused) video.pause();
  showScreen('intro');
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && musicStarted && music.paused) startMusic();
});
showScreen('videoIntro');
startMusic();
void tryAutomaticLandscape();
video.play().catch(() => {
  // Le bouton « Passer l’introduction » reste accessible.
});

// Un site web ne peut pas fermer un onglet ouvert par l’utilisateur.
// Quitter affiche donc une page vierge sans toucher à l’historique précédent.
document.getElementById("quitSiteBtn").addEventListener("click", () => {
  video.pause();
  music.pause();
  window.location.replace("about:blank");
});
