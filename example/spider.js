import { kdTree } from './kdTreeWeb.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * window.devicePixelRatio; 
canvas.height = window.innerHeight * window.devicePixelRatio; 

const particles = []; 

for (let i = 0; i < 100000; i++) {
  const particle = {
    x: Math.random() * canvas.width, 
    y: Math.random() * canvas.height 
  };
  particles.push(particle);
}

const spiders = [];
const distance = function(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const tree = new kdTree(particles, distance, ["x", "y"]);

const spiderCount = 1;
const spidersStartingPosition = [
  { x: 0, y: 0 }, 
  { x: canvas.width, y: 0 },
  { x: 0, y: canvas.height },
  { x: canvas.width, y: canvas.height }
];
const spiderSpeed = 0.01; 

for (let i = 0; i < spiderCount; i++) {
  const spider = {
    x: spidersStartingPosition[i].x,
    y: spidersStartingPosition[i].y,
    vx: 0,
    vy: 0,
    legCount: 5000 
  };
  spiders.push(spider);
}

let cursor = { x: canvas.width / 2, y: canvas.height / 2 }; // Default cursor position

canvas.addEventListener('mousemove', function(e) { // Update cursor position on mousemove
  cursor = { x: e.clientX * window.devicePixelRatio, y: e.clientY * window.devicePixelRatio };
});

function render() {
  ctx.fillStyle = "black"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height); 

  spiders.forEach(spider => {
    spider.vx = (cursor.x - spider.x) * spiderSpeed; 
    spider.vy = (cursor.y - spider.y) * spiderSpeed;

    spider.x += spider.vx;
    spider.y += spider.vy;

    const nearest = tree.nearest(spider, spider.legCount);
    nearest.forEach(particle => {
      drawLine(spider, particle[0]);
    });
  });

  requestAnimationFrame(render);
}

function drawLine(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
}

render();
