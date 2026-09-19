<template>
  <div ref="appRoot" class="asteroid-bounce-app">
    <button
      v-if="showFullscreenControl"
      class="asteroid-bounce-app__fullscreen"
      type="button"
      :aria-pressed="isFullscreen"
      @click="toggleFullscreen"
    >
      {{ isFullscreen ? 'Exit fullscreen' : 'Play fullscreen' }}
    </button>
    <div
      ref="viewport"
      class="asteroid-bounce-app__viewport"
      role="application"
      aria-label="Asteroid Bounce"
    ></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import pongGame from './game/pong.js';

const appRoot = ref(null);
const viewport = ref(null);
const isFullscreen = ref(false);
const isMobileViewport = ref(false);
const fullscreenSupported = ref(false);
const showFullscreenControl = computed(
  () => isMobileViewport.value && fullscreenSupported.value,
);

let game = null;
let mobileQuery = null;
let fitFrame = null;
let mountFrame = null;
let viewportObserver = null;

const getFullscreenElement = () => (
  document.fullscreenElement || document.webkitFullscreenElement || null
);

const fitGameToViewport = () => {
  if (fitFrame) {
    window.cancelAnimationFrame(fitFrame);
  }

  fitFrame = window.requestAnimationFrame(() => {
    fitFrame = null;

    const board = viewport.value?.querySelector('.asteroid-bounce-board');

    if (!board) {
      return;
    }

    const scale = Math.min(
      viewport.value.clientWidth / board.offsetWidth,
      viewport.value.clientHeight / board.offsetHeight,
    );

    board.style.transform = Math.abs(scale - 1) < 0.001 ? '' : `scale(${scale})`;
  });
};

const initializeGame = () => {
  if (
    game ||
    !viewport.value ||
    viewport.value.clientWidth === 0
  ) {
    return;
  }

  game = new pongGame(viewport.value);
  fitGameToViewport();
};

const unlockOrientation = () => {
  if (typeof window.screen?.orientation?.unlock === 'function') {
    window.screen.orientation.unlock();
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = getFullscreenElement() === appRoot.value;

  if (!isFullscreen.value) {
    unlockOrientation();
  }

  fitGameToViewport();
};

const updateMobileViewport = (event) => {
  isMobileViewport.value = event.matches;
};

const toggleFullscreen = async () => {
  if (isFullscreen.value) {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;

    if (exitFullscreen) {
      await Promise.resolve(exitFullscreen.call(document));
    }

    return;
  }

  const requestFullscreen = (
    appRoot.value?.requestFullscreen || appRoot.value?.webkitRequestFullscreen
  );

  if (!requestFullscreen) {
    return;
  }

  try {
    await Promise.resolve(requestFullscreen.call(appRoot.value));

    if (typeof window.screen?.orientation?.lock === 'function') {
      try {
        await window.screen.orientation.lock('landscape');
      } catch {
        // Fullscreen still works when a browser doesn't permit orientation lock.
      }
    }

    fitGameToViewport();
  } catch {
    // Browsers can deny fullscreen; leave the regular responsive game in place.
  }
};

onMounted(() => {
  fullscreenSupported.value = Boolean(
    appRoot.value?.requestFullscreen || appRoot.value?.webkitRequestFullscreen,
  );
  mobileQuery = window.matchMedia('(max-width: 900px), (pointer: coarse)');
  isMobileViewport.value = mobileQuery.matches;

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', updateMobileViewport);
  } else {
    mobileQuery.addListener(updateMobileViewport);
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  window.addEventListener('resize', fitGameToViewport);
  window.screen?.orientation?.addEventListener?.('change', fitGameToViewport);

  if (typeof ResizeObserver === 'function') {
    viewportObserver = new ResizeObserver(() => {
      initializeGame();
      fitGameToViewport();
    });
    viewportObserver.observe(viewport.value);
  }
  mountFrame = window.requestAnimationFrame(initializeGame);
});

onBeforeUnmount(() => {
  if (mobileQuery) {
    if (typeof mobileQuery.removeEventListener === 'function') {
      mobileQuery.removeEventListener('change', updateMobileViewport);
    } else {
      mobileQuery.removeListener(updateMobileViewport);
    }
  }

  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  window.removeEventListener('resize', fitGameToViewport);
  window.screen?.orientation?.removeEventListener?.('change', fitGameToViewport);

  viewportObserver?.disconnect();
  viewportObserver = null;

  if (mountFrame) {
    window.cancelAnimationFrame(mountFrame);
    mountFrame = null;
  }

  if (fitFrame) {
    window.cancelAnimationFrame(fitFrame);
    fitFrame = null;
  }

  if (getFullscreenElement() === appRoot.value) {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
    exitFullscreen?.call(document);
  }

  if (game && typeof game.destroy === 'function') {
    game.destroy();
  }

  game = null;
});
</script>
