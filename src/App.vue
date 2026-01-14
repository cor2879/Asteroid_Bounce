<template>
  <div id="app">
    <h1>Asteroid Bounce (Vue Port)</h1>

    <!-- Vue owns this container -->
    <div id="pong-viewport">
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import pongGame from './game/pong.js';
import Utilities from './game/Utilities.js';

const gameHost = ref(null);

onMounted(() => {
  // IMPORTANT: expose Utilties & PongGame to window
  window.Utilities = Utilities;

  const gameHost = ref(null)

  var pong = new pongGame(document.getElementById('pong-viewport'));
  window.PongGame = pong;
})
</script>

<style scoped>
#app {
  text-align: center;
}
canvas {
  border: 1px solid #444;
}
</style>
