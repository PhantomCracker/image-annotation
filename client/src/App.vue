<template>
  <div id="app">
    <h1>Free Drawing on Image</h1>
    <DrawingCanvas />
  </div>
</template>

<script>
import DrawingCanvas from './components/DrawingCanvas.vue';

export default {
  components: {
    DrawingCanvas,
  },
};
</script>

<style>
#app {
  text-align: center;
  margin-top: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}
</style>
