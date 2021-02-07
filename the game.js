let bgColor;
let bodyColor;
let tutorialGame;

class Square {
    constructor(num) {
        this.num = num;
        this.filled = false;
    }

    display(x, y, l) {
        rectMode(CENTER);
        if(this.filled) {
            fill(0, 255, 0);
            rect(x, y, l*0.9, l*0.9, l*0.1);
            fill(0);
        text(this.num, x, y);
        } else {
            fill(255);
            rect(x, y, l*0.9, l*0.9, l*0.1);
        }
    }

    click() {
        this.filled = true;
    }
}
class Game {
    constructor(w, h) {
        this.w = w; //number of squares in the x direction
        this.h = h; //number of squares in the y direction

        this.squares = [];
        var numbersTemp = [];
        for(var i = 0; i < w; i++) {
            this.squares[i] = [];
            for(var j = 0; j < h; j++) {
                var num = i + j*w + 1; //the number of the square
                this.squares[i][j] = new Square(num);
                numbersTemp.push(num);
            }
        }

        //randomize array
        this.numbers = [];
        for(var i = numbersTemp.length-1; i >= 0; i--) {
            var index = floor(random(numbersTemp.length));
            this.numbers.push(numbersTemp[index]);
            numbersTemp.splice(index, 1);
        }
    }
    
    calcDimensions(w, h) {
        //determine whether to put the number on the top or the side
        var lTop = min(w/this.w, h/(this.h+1)); //what the square length would be if the number were on the top
        var lSid = min(w/(this.w+1), h/this.h); //what the square length would be if the number were on the side
        this.numberOnTop = lTop > lSid;
        
        this.sl = max(lTop, lSid); //side length of square
        
        //new dimensions taking into account the number on the top or side
        this.newW = this.w + !this.numberOnTop; //new resolution width, +1 if there is number on side
        this.newH = this.h + this.numberOnTop; //new resolution height, +1 if there is number on top
        
        this.gw = this.sl * (this.newW); //width of game board
        this.gh = this.sl * (this.newH); //height of game board
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    
    display() {
        fill(255);
        rectMode(CENTER);

        //draw squares
        textSize(this.sl*0.3);
        textAlign(CENTER, CENTER);
        for(var i = 0; i < this.w; i++) {
            for(var j = 0; j < this.h; j++) {
                var newI = i + !this.numberOnTop; //+1 if there is number on side
                var newJ = j + this.numberOnTop; //+1 if there is number on top
                var sx = this.gw * (newI/this.newW - 0.5) + 0.5*this.sl + this.x; //x pos of square
                var sy = this.gh * (newJ/this.newH - 0.5) + 0.5*this.sl + this.y; //y pos of square
                this.squares[i][j].display(sx, sy, this.sl);
            }
        }
        
        //display number
        fill(0, 255, 0);
        if(this.numberOnTop) {
            var x = this.x;
            var y = this.y - 0.5*this.gh + 0.5*this.sl;
            rect(x, y, this.sl, this.sl, this.sl*0.1);
            fill(0);
            text(this.numbers[0], x, y);
        } else {
            x = this.x - 0.5*this.gw + 0.5*this.sl;
            y = this.y;
            rect(x, y, this.sl, this.sl, this.sl*0.1);
            fill(0);
            text(this.numbers[0], 0.5*this.sl, this.y);
        }
    }
    
    click(x, y) {
        var l = this.x-0.5*this.gw; //x pos of left side of the game board
        var t = this.y-0.5*this.gh; //y pos of top of the game board
        var sx = floor(this.newW * (x-l) / this.gw) - !this.numberOnTop; //x index of the square (-1 if there is number on side)
        var sy = floor(this.newH * (y-t) / this.gh) - this.numberOnTop; //y index of the square (-1 if there is number on top)

        //click the square if there is one
        if(this.squares[sx]) {
            if(this.squares[sx][sy]) {
                if(this.squares[sx][sy].num === this.numbers[0]) {
                    this.squares[sx][sy].click();
                    this.numbers.splice(0, 1);
                }
            }
        }
    }
}

function update() {
    background(bgColor);
    tutorialGame.display();
}

function setup() {
    bgColor = color(51);
    
    bodyStyle = document.body.style;
    
    createCanvas(windowWidth, windowHeight);
    
    background(bgColor);
    bodyStyle.backgroundColor = bgColor;
    
    tutorialGame = new Game(10, 10);
    tutorialGame.calcDimensions(width, height);
    tutorialGame.setPos(width*0.5, height*0.5);
    noStroke();
}

function draw() {
    update();
}

function mouseReleased() {
    tutorialGame.click(mouseX, mouseY);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    tutorialGame.calcDimensions(width, height);
    tutorialGame.setPos(width*0.5, height*0.5);
    update();
}
