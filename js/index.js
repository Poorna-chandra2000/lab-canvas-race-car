let canvas, ctx, roadImg, carImg, carX;
const obstacles = [];
const roadStartX = 50;
const roadEndX = 450;
let maxObstacleWidth;
let roadY1 = 0;
let roadY2;
let score = 0;
let obstacleSpeed = 1.5;
const carWidth = 50;
const carHeight = 100;
let gameOver = false; //game over flag
let gameInterval; // To keep track of the game update interval


function startGame() {
  if (gameInterval) {
    resetGame();
  }
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  maxObstacleWidth = canvas.width * 0.4; //Maximum width of obstacle is 40% of the road
  roadImg = new Image();
  roadImg.src = "./images/road.png";
  carImg = new Image();
  carImg.src = './images/car.png';
  carX = (canvas.width - carWidth) / 2 //Centering car horizontally
  roadY2 = -canvas.height //Initializing the second road image position

  roadImg.onload = () => {
    carImg.onload = () => {
      setInterval(createObstacle, 2000);
      gameInterval = requestAnimationFrame(updateGame);
    };
  };

  // Adding event listener to left and right buttons
  document.addEventListener('keydown', moveCar);

  //Increse the speed of obstacles in 20s
  setInterval(() => {
    obstacleSpeed *= 1.20;
  }, 20000);

  // increase score by 1 point every second
  setInterval(() => {
    if (!gameOver) {
      score += 1;
    }
  }, 1000);
}

function resetGame() {
  if (gameInterval) {
    cancelAnimationFrame(gameInterval);
    gameInterval = null;
  }

  //  clear all obstacles
  obstacles.length = 0;

  // reset game variables
  carX = (canvas.width - carWidth) / 2;
  roadY1 = 0;
  roadY2 = -canvas.height;
  score = 0;
  gameOver = false;
  obstacleSpeed = 1.5;

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // restart the game
  startGame();
}

function createObstacle() {
  const minObstacleWidth = 300;
  const obstacleWidth = Math.random() * (maxObstacleWidth - minObstacleWidth) + minObstacleWidth;
  let obstacleX;
  // choose random position for the obstacle
  const positionType = Math.floor(Math.random() * 3);
  if (positionType === 0) {
    obstacleX = roadStartX;
  } else if (positionType === 1) {
    obstacleX = roadEndX - obstacleWidth;
  } else {
    obstacleX = (canvas.width - obstacleWidth) / 2;
  }

  const lastObstacleY = obstacles.length > 0 ? obstacles[obstacles.length - 1].y : 0;
  const obstacleY = lastObstacleY - 300; // Spacing obstacles 300 pixels apart
  obstacles.push({ x: obstacleX, y: obstacleY, width: obstacleWidth, height: 20 });
}

function moveCar(event) {
  if (event.key === 'ArrowLeft' && carX > roadStartX) {
    carX -= 10;
  }
  else if (event.key === 'ArrowRight' && carX < roadEndX - carWidth) {
    carX += 10;
  }
}

function updateGame() {
  if (gameOver) {
    return;
  }
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //move the road upwards
  roadY1 += obstacleSpeed;
  roadY2 += obstacleSpeed;

  // Draw the road images
  ctx.drawImage(roadImg, 0, roadY1, canvas.width, canvas.height);
  ctx.drawImage(roadImg, 0, roadY2, canvas.width, canvas.height);

  //Reset the road images when they move off the canvas
  if (roadY1 >= canvas.height)
    roadY1 = roadY2 - canvas.height;
  if (roadY2 >= canvas.height)
    roadY2 = roadY1 - canvas.height;

  //Draw the car
  ctx.drawImage(carImg, carX, canvas.height - carHeight - 10, carWidth, carHeight);

  // update and draw the obstacles
  obstacles.forEach((obstacle, index) => {
    obstacle.y += obstacleSpeed;

    ctx.fillStyle = 'brown';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Check for collision with car
    if (checkCollision(carX, canvas.height - carHeight - 10, carWidth, carHeight, obstacle)) {
      gameOver = true;
      displayGameOver();
    }

    // Remove the obstacle if it goes off the screen
    if (obstacle.y > canvas.height) {
      obstacles.splice(index, 1);
      score += 10;
    }
  });

  // Draw the score
  ctx.font = '35px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 65, 40); // Position the score 40 pixels from the top and 65 pixels from the left


  gameInterval = requestAnimationFrame(updateGame);
}

function checkCollision(carX, carY, carWidth, carHeight, obstacle) {
  return (
    carX < obstacle.x + obstacle.width &&
    carX + carWidth > obstacle.x &&
    carY < obstacle.y + obstacle.height &&
    carY + carHeight > obstacle.y
  );
}
function displayGameOver() {
  // Clear all obstacles
  obstacles.length = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '40px Arial';
  ctx.fillStyle = 'red';
  ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 30);

  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Your final score: ${score}`, canvas.width / 2 - 150, canvas.height / 2 + 30);
}


window.addEventListener('load', () => {
  let startBtn = document.querySelector('#start-button')

  startBtn.addEventListener('click', () => {
    startGame();
  })
})
