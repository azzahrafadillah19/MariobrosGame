const canvas = document.getElementById("gameCanvas");
const startBtn = document.getElementById("startBtn");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

let keys = {};
let player = {
  x: 40,
  y: 200 - 50,
  w: 20,
  h: 50,
  dx: 0,
  dy: 0,
  onGround: true,
};
const gravity = 0.6;

// rintangan
let obstacles = [];
let frameCount = 0;
let gameOver = false;
let jumpCount = 0;
const maxJump = 2;
let score = 0;

function resetGame() {
  player.x = 40;
  player.y = 180;
  player.dx = 0;
  player.dy = 0;
  player.onGround = true;
  obstacles = [];
  frameCount = 0;
  score = 0;
  gameOver = false;
  jumpCount = 0;
  status.textContent = "Mainkan game!";
  status.className = "alert alert-success";
}

function getLevel(score) {
  if (score < 10) return 1;
  if (score < 20) return 2;
  if (score < 30) return 3;
  return 4;
}

function spawnObstacle(level) {
  let obs;
  if (level === 1) {
    obs = { x: canvas.width, y: 170, w: 20, h: 30, speed: 3 };
  } else if (level === 2) {
    obs = { x: canvas.width, y: 170, w: 30, h: 40, speed: 4 };
  } else if (level === 3) {
    obs = { x: canvas.width, y: 150, w: 40, h: 50, speed: 5 };
  } else {
    obs = {
      x: canvas.width,
      y: Math.random() > 0.5 ? 170 : 150,
      w: 30 + Math.random() * 20,
      h: 30 + Math.random() * 20,
      speed: 4 + Math.floor(Math.random() * level),
    };
  }
  obstacles.push(obs);
}

function getBgColor(level) {
  switch (level) {
    case 1: return "#6cbd63"; // hijau
    case 2: return "#ffc107"; // kuning
    case 3: return "#fd7e14"; // oranye
    case 4: return "#dc3545"; // merah
    default: return "#6cbd63";
  }
}

function update() {
  if (gameOver) return;

  // kontrol arah
  if (keys["ArrowLeft"]) player.dx = -3;
  else if (keys["ArrowRight"]) player.dx = 3;
  else player.dx = 0;

  // physics
  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  // ground
  if (player.y + player.h > 200) {
    player.y = 200 - player.h;
    player.dy = 0;
    player.onGround = true;
    jumpCount = 0;
  }

  // spawn obstacle tiap 2 detik
  frameCount++;
  if (frameCount % 120 === 0) {
    const level = getLevel(score);
    spawnObstacle(level);
  }

  // update skor tiap detik
  if (!gameOver && frameCount % 60 === 0) {
    score++;
    status.textContent = `⏱ Waktu bertahan: ${score} detik`;
    status.className = "alert alert-info";
  }

  // update obstacle
  obstacles.forEach((o) => (o.x -= o.speed));
  obstacles = obstacles.filter((o) => o.x + o.w > 0);

  // hitbox stickman
  const hitbox = { x: player.x, y: player.y, w: player.w, h: player.h };

  // cek tabrakan
  obstacles.forEach((o) => {
    if (
      hitbox.x < o.x + o.w &&
      hitbox.x + hitbox.w > o.x &&
      hitbox.y < o.y + o.h &&
      hitbox.y + hitbox.h > o.y
    ) {
      gameOver = true;
      status.textContent = `❌ Game Over! Skor kamu: ${score}. Klik Mulai untuk ulang.`;
      status.className = "alert alert-danger";
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = getBgColor(getLevel(score));
  ctx.fillRect(0, 200, canvas.width, 40);

  // stickman
  drawStickman(ctx, player.x, player.y);

  // obstacles
  ctx.fillStyle = "#007bff";
  obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.w, o.h));

  // game over screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`❌ GAME OVER! Skor: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText("Klik MULAI untuk restart / Klik Enter", canvas.width / 2, canvas.height / 2 + 40);
  }
}

function drawStickman(ctx, x, y) {
  ctx.fillStyle = "black";
  // kepala
  ctx.beginPath();
  ctx.arc(x + 10, y + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  // badan
  ctx.fillRect(x + 8, y + 20, 4, 20);
  // kaki
  ctx.fillRect(x + 8, y + 40, 2, 10);
  ctx.fillRect(x + 10, y + 40, 2, 10);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// event listener
const KEYS_TO_PREVENT = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"];

function shouldPreventDefault(e) {
  const active = document.activeElement;
  const tag = active ? active.tagName : null;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active.isContentEditable) {
    return false;
  }
  return KEYS_TO_PREVENT.includes(e.code);
}

window.addEventListener("keydown", (e) => {
  if (shouldPreventDefault(e)) e.preventDefault();
  keys[e.code] = true;

  if (e.code === "Space" && jumpCount < maxJump) {
    player.dy = -12;
    player.onGround = false;
    jumpCount++;
  }
}, { passive: false });

window.addEventListener("keyup", (e) => {
  if (shouldPreventDefault(e)) e.preventDefault();
  keys[e.code] = false;

  if (e.code === "Space" && player.dy < -4) {
    player.dy = -4;
  }
}, { passive: false });

// ENTER untuk mulai
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && gameOver) {
    resetGame();
  }
});

// tombol mulai
startBtn.addEventListener("click", () => {
  resetGame();
  canvas.focus({ preventScroll: true });
});
