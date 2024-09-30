// Paul Cusimano, HW 4
let player1, player2;
let keys = {};
let gameOver = false;
let winner = "";

function setup() {
  createCanvas(800, 400);
  player1 = new Player(100, height - 60, "red", "right");
  player2 = new Player(width - 200, height - 60, "blue", "left");
}

function draw() {
  background(200);

  if (!gameOver) {
    player1.update();
    player2.update();

    player1.render();
    player2.render();

    drawHealthBars();
  } else {
    winScreen();
  }
}

function keyPressed() {
  if (gameOver) return;

  keys[key.toLowerCase()] = true;
  keys[keyCode] = true;

  if (key === " ") player1.attack(player2, "punch");
  if (key === "x") player1.attack(player2, "kick");
  if (keyCode === ENTER) player2.attack(player1, "punch");
  if (keyCode === SHIFT) player2.attack(player1, "kick");
}

function keyReleased() {
  if (gameOver) return;

  keys[key.toLowerCase()] = false;
  keys[keyCode] = false;
}

class DrawCharacter {
  static draw(x, y, color, facing, isAttacking, attackType, isStunned) {
    push();
    translate(x, y);

    if (isStunned) {
      fill(255, 255, 0);
    } else {
      fill(color);
    }
    triangle(0, 0, 30, 0, 15, 50);

    fill(255);
    ellipse(15, -10, 30, 30);
    fill(0);
    if (facing === "right") {
      ellipse(20, -15, 5, 5);
      ellipse(25, -15, 5, 5);
      line(18, -20, 22, -18);
      line(23, -20, 27, -18);
    } else {
      ellipse(10, -15, 5, 5);
      ellipse(5, -15, 5, 5);
      line(8, -20, 12, -18);
      line(3, -20, 7, -18);
    }

    stroke(0);
    strokeWeight(4);
    if (isAttacking) {
      if (attackType === "punch") {
        if (facing === "right") {
          line(30, 10, 40, 10);
        } else if (facing === "left") {
          line(0, 10, -10, 10);
        }
      } else if (attackType === "kick") {
        if (facing === "right") {
          line(30, 10, 40, 20);
        } else if (facing === "left") {
          line(0, 10, -10, 20);
        }
      }
    } else {
      line(0, 10, -10, 20);
      line(30, 10, 40, 20);
    }

    if (isAttacking && attackType === "kick") {
      if (facing === "right") {
        line(20, 50, 40, 40);
      } else if (facing === "left") {
        line(10, 50, -10, 40);
      }
    } else {
      line(10, 40, 10, 60);
      line(20, 40, 20, 60);
    }

    pop();
  }
}

class Player {
  constructor(x, y, color, facing) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.color = color;
    this.facing = facing;
    this.health = 100;
    this.isAttacking = false;
    this.attackType = "";
    this.stunTimer = 0;
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.9);

    if (this.pos.y < height - 60) {
      this.vel.y += 0.5;
    } else {
      this.pos.y = height - 60;
      this.vel.y = 0;
    }

    this.pos.x = constrain(this.pos.x, 0, width - 30);
    this.pos.y = constrain(this.pos.y, 0, height - 60);

    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime / 1000;
      return;
    }

    if (this.stunTimer <= 0) {
      if (keys["a"]) player1.move(-1);
      if (keys["d"]) player1.move(1);
      if (keys["w"]) player1.jump();
      if (keys[LEFT_ARROW]) player2.move(-1);
      if (keys[RIGHT_ARROW]) player2.move(1);
      if (keys[UP_ARROW]) player2.jump();
    }
  }

  render() {
    DrawCharacter.draw(
      this.pos.x,
      this.pos.y,
      this.color,
      this.facing,
      this.isAttacking,
      this.attackType,
      this.stunTimer > 0
    );
  }

  move(dir) {
    if (this.stunTimer > 0) return;

    this.vel.x = dir * 3.5;
    this.facing = dir > 0 ? "right" : "left";
  }

  jump() {
    if (this.pos.y >= height - 60) {
      this.vel.y = -15;
    }
  }

  attack(opponent, type) {
    this.isAttacking = true;
    this.attackType = type;
    setTimeout(() => {
      this.isAttacking = false;
      this.attackType = "";
    }, 200);

    let attackRange = type === "punch" ? 40 : 60;
    let damage = type === "punch" ? 10 : 15;

    if (this.facing === "right") {
      if (
        this.pos.x + attackRange > opponent.pos.x &&
        this.pos.x + 30 < opponent.pos.x + 30 &&
        this.pos.y === opponent.pos.y
      ) {
        opponent.takeDamage(createVector(10, -5), damage);
        console.log(`${opponent.color} player took damage`);
      }
    } else if (this.facing === "left") {
      if (
        this.pos.x - attackRange < opponent.pos.x + 30 &&
        this.pos.x > opponent.pos.x &&
        this.pos.y === opponent.pos.y
      ) {
        opponent.takeDamage(createVector(-10, -5), damage);
        console.log(`${opponent.color} player took damage`);
      }
    }
  }

  takeDamage(knockback, damage) {
    this.health -= damage;
    this.vel.set(0, 0);
    this.vel.add(knockback);
    this.stunTimer = 0.3;
    if (this.health <= 0) {
      winner = this.color === "red" ? "Blue" : "Red";
      gameOver = true;
      console.log(`${this.color} player loses!`);
      noLoop();
    }
  }
}

function drawHealthBars() {
  fill("red");
  rect(20, 20, player1.health * 2, 20);
  noFill();
  stroke(0);
  rect(20, 20, 200, 20);

  fill("blue");
  rect(width - 220, 20, player2.health * 2, 20);
  noFill();
  stroke(0);
  rect(width - 220, 20, 200, 20);
}

function winScreen() {
  textSize(32);
  fill(0);
  textAlign(CENTER, CENTER);
  text(`${winner} Player Wins!`, width / 2, height / 2);
}