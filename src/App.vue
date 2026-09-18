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

const viewport = ref(null);
let game = null;

onMounted(() => {
  game = new pongGame(viewport.value);
});

onBeforeUnmount(() => {
  if (game && typeof game.destroy === 'function') {
    game.destroy();
  }

  game = null;
});
</script>
