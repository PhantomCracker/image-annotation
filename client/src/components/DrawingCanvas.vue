<template>
  <div>
    <input type="file" @change="handleFileChange" accept="image/*" />
    <div>
      <label for="colorPicker">Select Color:</label>
      <input type="color" id="colorPicker" v-model="selectedColor" />
    </div>
    <div>
      <label for="lineWidthRange">Line Width:</label>
      <input type="range" id="lineWidthRange" min="1" max="10" v-model="lineWidth" />
    </div>
    <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @click="drawCircle"
    ></canvas>

    <button @click="generateNewId">Ok</button>
    <div v-if="generatedId">Generated ID: {{ generatedId }}</div>

    <button @click="finishAnnotate">Finish Annotate</button>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
export default {
  data() {
    return {
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      imageSrc: null,
      selectedColor: '#000000', // Default color is black
      lineWidth: 2, // Default line width
      drawingActions: [], // Array to store drawing actions
      generatedId: null
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageSrc = e.target.result;
          this.drawImage();
        };
        reader.readAsDataURL(file);
      }
    },
    drawImage() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Replay drawing actions to redraw all lines
        ctx.strokeStyle = this.selectedColor;
        ctx.lineWidth = this.lineWidth;
        for (const action of this.drawingActions) {
          ctx.beginPath();
          ctx.moveTo(action[0].x, action[0].y);
          for (const point of action) {
            ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        }
      };
      img.src = this.imageSrc;
    },
    drawCircle(event) {
      if (!this.isDrawing) return;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      const { offsetX, offsetY } = event;

      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = this.lineWidth;
      ctx.fillStyle = this.selectedColor;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Draw a circle at the clicked point
      ctx.beginPath();
      ctx.arc(offsetX, offsetY, this.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();

      this.drawingActions.push([{ x: offsetX, y: offsetY }]);
    },
    startDrawing(event) {
      this.isDrawing = true;
      const { offsetX, offsetY } = event;
      this.lastX = offsetX;
      this.lastY = offsetY;
      this.drawingActions.push([{ x: offsetX, y: offsetY }]);
    },
    draw(event) {
      if (!this.isDrawing) return;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      const { offsetX, offsetY } = event;

      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = this.lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Draw a line from the last recorded point to the current point
      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();

      this.drawingActions[this.drawingActions.length - 1].push({ x: offsetX, y: offsetY });

      this.lastX = offsetX;
      this.lastY = offsetY;
    },
    stopDrawing() {
      this.isDrawing = false;
    },
    finishAnnotate() {
      // Disable drawing functionality permanently
      this.isDrawing = false;

      // Remove the drawing event listeners from the canvas
      this.$refs.canvas.removeEventListener('mousedown', this.startDrawing);
      this.$refs.canvas.removeEventListener('mousemove', this.draw);
      this.$refs.canvas.removeEventListener('mouseup', this.stopDrawing);
    },
    async generateNewId() {
      const id = uuidv4()
      this.generatedId = id.slice(0, 4);
    },
  },
};
</script>

<style>
canvas {
  border: 1px solid #ccc;
  cursor: crosshair;
}

div {
  margin: 5px 0;
}
</style>
