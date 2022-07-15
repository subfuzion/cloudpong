const screenWidth = 600;
const screenHeight = 370;
const player1 = {x: 30, y: 250, height: 100, width: 20};
const player2 = {x: screenWidth - 50, y: 250, height: 100, width: 20};
const ball = {x: 250, y: 100, vx: 2, vy: 2};

function setup() {
  createCanvas(screenWidth, screenHeight);
  frameRate(60);
}

function draw() {
  fill("black");
  rect(0, 0, screenWidth, screenHeight);

  // player paddles
  fill("white");
  rect(player1.x, player1.y, player1.width, player1.height);
  rect(player2.x, player2.y, player2.width, player2.height);

  // pong ball
  fill("red");
  ellipse(ball.x, ball.y, 10, 10);
  if (ball.y > screenHeight - 10 || ball.y < 10) {
    ball.vy *= -1;
  }

  // when bouncing off paddles reverse direction, increase
  // x velocity by a constant and y value by a random value
  const xFactor = -1.1;
  const yFactor = random(6) - 3;
  let reverse = false;
  // if ball bounces off player 1 paddle
  if (
    ball.x < player1.x + player1.width + 10 &&
    ball.y > player1.y &&
    ball.y < player1.y + player1.height
  ) {
    reverse = true;
  }

  // if ball bounces off player 2 paddle
  if (
    ball.x > player2.x - 10 &&
    ball.y > player2.y &&
    ball.y < player2.y + player2.height
  ) {
    reverse = true;
  }

  if (reverse) {
    ball.vx *= xFactor;
    ball.vy = yFactor;
  }

  // player 1 paddle movement
  const yPaddle = 4;
  // 'a' key
  if (keyIsDown(65) && player1.y > 5) {
    player1.y -= yPaddle;
  }
  // 'z' key
  if (keyIsDown(90) && player1.y < screenHeight - player1.height) {
    player1.y += yPaddle;
  }

  // player 2 paddle movement
  if (keyIsDown(UP_ARROW) && player2.y > 5) {
    player2.y -= yPaddle;
  }
  if (keyIsDown(DOWN_ARROW) && player2.y < screenHeight - player1.height) {
    player2.y += yPaddle;
  }

  // Move the ball
  ball.x += ball.vx;
  ball.y += ball.vy;
}

console.log("hello");