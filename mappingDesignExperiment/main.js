// create the konva stage
const stage = new Konva.Stage({
  container: "konva-stage",
  width: 500,
  height: 500,
});

const firstLayer = new Konva.Layer();
stage.add(firstLayer);

// added this to grab the toolbar controls for the trail experiment
const colourInput = document.getElementById("trail-colour");
const dotSizeInput = document.getElementById("dot-size");
const fadeSpeedInput = document.getElementById("fade-speed");

// added this to keep track of the cursor position and timing
let lastX = null;
let lastY = null;
let lastTime = 0;

// added this to stop too many dots from spawning when the mouse barely moves
const minDistance = 4;

// added this to make new dots with the chosen settings
function createDot(x, y, opacityScale = 1) {
  const dot = new Konva.Circle({
    x: x,
    y: y,
    radius: Number(dotSizeInput.value),
    fill: colourInput.value,
    opacity: opacityScale,
  });

  firstLayer.add(dot);
  firstLayer.draw();

  fadeDot(dot);
}

// added this so each dot slowly fades out over time
function fadeDot(dot) {
  const fadeAmount = Number(fadeSpeedInput.value) / 1000;

  const fadeAnimation = new Konva.Animation(() => {
    const newOpacity = dot.opacity() - fadeAmount;

    if (newOpacity <= 0) {
      dot.destroy();
      fadeAnimation.stop();
      firstLayer.draw();
      return;
    }

    dot.opacity(newOpacity);
  }, firstLayer);

  fadeAnimation.start();
}

// added this to calculate spacing based on cursor speed
function handlePointerMove() {
  const pointer = stage.getPointerPosition();

  if (!pointer) return;

  const currentX = pointer.x;
  const currentY = pointer.y;
  const currentTime = Date.now();

  if (lastX === null || lastY === null) {
    createDot(currentX, currentY, 1);
    lastX = currentX;
    lastY = currentY;
    lastTime = currentTime;
    return;
  }

  const dx = currentX - lastX;
  const dy = currentY - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const timeDiff = Math.max(currentTime - lastTime, 1);
  const speed = distance / timeDiff;

  if (distance < minDistance) return;

  // added this so slow movement makes denser trails and fast movement makes wider spacing
  const step = Math.max(6, Math.min(22, speed * 60));

  const steps = Math.max(1, Math.floor(distance / step));

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = lastX + dx * t;
    const y = lastY + dy * t;

    createDot(x, y, 1);
  }

  lastX = currentX;
  lastY = currentY;
  lastTime = currentTime;
}

stage.on("mousemove touchmove", handlePointerMove);

// added this to reset tracking when the cursor leaves so the trail feels cleaner
stage.on("mouseleave touchend", () => {
  lastX = null;
  lastY = null;
  lastTime = 0;
});
