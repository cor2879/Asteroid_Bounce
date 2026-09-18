<template>
  <div class="asteroid-bounce-app">
    <div
      ref="viewport"
      class="asteroid-bounce-app__viewport"
      role="application"
      aria-label="Asteroid Bounce"
    ></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import pongGame from './game/pong.js';
import Utilities from './game/Utilities.js';

const viewport = ref(null);
let game = null;

onMounted(() => {
  window.Utilities = Utilities;
  game = new pongGame(viewport.value);
  window.PongGame = game;
});

onBeforeUnmount(() => {
  if (game && typeof game.destroy === 'function') {
    game.destroy();
  }

  if (window.PongGame === game) {
    delete window.PongGame;
  }
});
</script>
