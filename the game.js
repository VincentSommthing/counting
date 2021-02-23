let bgColor;
let bodyColor;
let tutorialGame;


function ease(t) {
    return 1 - exp(-t);
}

function interpolate(start, end, x) {
    return start + (end-start)*x;
}

class Property {
    constructor(startValue) {
        this.initial = startValue;
        this.current = startValue;
        this.target = startValue;
    }

    apply() {
        this.initial = this.target;
    }

    setTarget(x) {
        this.target = x;
    }

    calcInterpolation(x) {
        this.current = interpolate(this.initial, this.target, x);
    }
}

class Square {
    constructor(num) {
        this.num = num; //square number
        this.filled = false; //if it is filled

        this.mouseWasOver = false; //if the mouse was hovering over in the last frame
        this.mouseOver = false; //if the mouse is hovering over
        this.inActiveGroup = false; //if the square is in the array
        this.approachingRest = true;

        this.mouseWasPressing = false; //if the mouse was pressing in the last frame
        this.mousePressing = false; //if the mouse is pressing

        this.animationStart = millis(); //the time when the animation started

        this.size = new Property(0.8); //size multiplier for box size
        this.strokeC = new Property(150); //stroke color
        this.fillC = new Property(120); // fill color

    }

    display(x, y, l) {
        rectMode(CENTER);
        //this.fillC.current = 255*this.inActiveGroup;
        if(this.filled) {
            fill(255, 150, 150);
            stroke(255,90, 90);
            strokeWeight(l*0.1);
            rect(x, y, l*0.8, l*0.8, l*0.1);

            fill(255, 170, 170);
            stroke(170, 10, 10);
            strokeWeight(l*0.04);
            text(this.num, x, y);
        } else {
            fill(this.fillC.current);

            stroke(this.strokeC.current);
            strokeWeight(l*0.1);
            rect(x, y, l*this.size.current, l*this.size.current, l*0.1);

            fill(this.strokeC.current);
            noStroke();
            text(this.num, x, y);
        }
    }

    click() {
        this.filled = true;
    }

    resetAnimationStart() {
            //set animation start to whatever the animation ended with
            this.size.apply();
            this.strokeC.apply();
            this.fillC.apply();
    }

    startHover() {
        if(!this.mouseWasOver) { //reset animation if the mouse wasn't over last frame
            this.animationStart = millis();
            this.resetAnimationStart();

            //set animation properties end target
            this.size.setTarget(0.9);
            this.strokeC.setTarget(255);
            this.fillC.setTarget(200);
        }
        this.mouseOver = true;
        this.inActiveGroup = true;
        this.approachingRest = false;
    }

    startPress() {
        if(!this.mouseWasPressing) {
            this.animationStart = millis();
            this.resetAnimationStart();

            //set animation properties end target
            this.size.setTarget(1);
            this.strokeC.setTarget(255);
            this.fillC.setTarget(255);
        }
        this.mousePressing = true;
        this.inActiveGroup = true;
        this.approachingRest = false;
    }

    update() {
        var t = millis() - this.animationStart;

        //calculate animation properties
        var f;
        if(this.mouseOver || this.mousePressing) { //mouse is over or clicking
            var f = ease(t*0.03);
        } else {
            var f = ease(t*0.01);
        }
        this.size.calcInterpolation(f);
        this.strokeC.calcInterpolation(f);
        this.fillC.calcInterpolation(f);
        
        //if the mouse was over or clicking the last frame but is not over anymore, reset animation
        if((this.mouseWasOver && !this.mouseOver && !this.mousePressing) || (this.mouseWasPressing && !this.mousePressing && !this.mouseOver)) {
            this.animationStart = millis();
            this.resetAnimationStart();
            this.approachingRest = true;

            this.size.setTarget(0.8);
            this.strokeC.setTarget(150);
            this.fillC.setTarget(120);
        }
        this.mouseWasOver = this.mouseOver;
        this.mouseOver = false;

        this.mouseWasPressing = this.mousePressing;
        this.mousePressing = false;
    }

    checkActivity() {
        //its still active if the mouse is over or pressing, or its still moving
        var mouseHovering = this.mouseWasOver || this.mouseWasPressing;
        var moving = this.approachingRest && (abs(this.fillC.target - this.fillC.current) > 1); //it is still moving if the current color is not its target yet 
        this.inActiveGroup = mouseHovering || moving;
        return this.inActiveGroup;
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

        this.activeSquares = []; //squares that are animating and require an update every frame
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
        fill(255, 150, 150);
        stroke(255,90, 90);
        strokeWeight(this.sl*0.1);
        if(this.numberOnTop) {
            var x = this.x;
            var y = this.y - 0.5*this.gh + 0.5*this.sl;
            rect(x, y, this.sl*0.9, this.sl*0.9, this.sl*0.1);

            fill(155, 0, 0);
            stroke(255, 120, 120);
            strokeWeight(this.sl*0.05);
            text(this.numbers[0], x, y);
        } else {
            x = this.x - 0.5*this.gw + 0.5*this.sl;
            y = this.y;
            rect(x, y, this.sl*0.9, this.sl*0.9, this.sl*0.1);

            fill(155, 0, 0);
            stroke(255, 120, 120);
            strokeWeight(this.sl*0.05);
            text(this.numbers[0], x, y);
        }
    }
    
    checkWhichSquare(x, y) {
        var l = this.x-0.5*this.gw; //x pos of left side of the game board
        var t = this.y-0.5*this.gh; //y pos of top of the game board
        var sx = floor(this.newW * (x-l) / this.gw) - !this.numberOnTop; //x index of the square (-1 if there is number on side)
        var sy = floor(this.newH * (y-t) / this.gh) - this.numberOnTop; //y index of the square (-1 if there is number on top)

        if(this.squares[sx]) {
            if(this.squares[sx][sy]) {
                return {x: sx, y: sy};
            }
        }
        
        return false;
    }

    click(x, y) {
        var s = this.checkWhichSquare(x, y); //object that stores the position of the square
        //click the square if there is one
        if(s) {
            if(this.squares[s.x][s.y].num === this.numbers[0]) {
                this.squares[s.x][s.y].click();
                this.numbers.splice(0, 1);
            }
        }
    }

    mouseHover(x, y) {
        var s = this.checkWhichSquare(x, y);
        if(s) {
            var target = this.squares[s.x][s.y];
            //add to list of active squares if it is not already
            if(!target.inActiveGroup) {
                this.activeSquares.push(target);
            }
            target.startHover();
        }
    }

    mousePressing(x, y) {
        var s = this.checkWhichSquare(x, y);
        if(s) {
            var target = this.squares[s.x][s.y];
            //add to list of active squares if it is not already
            if(!target.inActiveGroup) {
                this.activeSquares.push(target);
            }
            target.startPress();
        }
    }

    update(x, y) {
        if(mouseIsPressed) {
            this.mousePressing(x, y); //press target if mouse is pressing
        } else {
            this.mouseHover(x, y); //only hover over target if mouse isn't presing
        }
        //update all active squares
        for(var i = this.activeSquares.length-1; i >= 0; i--) {
            this.activeSquares[i].update();
            if(!this.activeSquares[i].checkActivity()) {
                this.activeSquares.splice(i, 1);
                continue;
            }
        }
    }
}

function update() {
    background(bgColor);
    tutorialGame.update(mouseX, mouseY);
    tutorialGame.display();
}

function setup() {
    bgColor = color(120);
    
    bodyStyle = document.body.style;
    
    createCanvas(windowWidth, windowHeight);
    
    background(bgColor);
    bodyStyle.backgroundColor = bgColor;
    
    tutorialGame = new Game(10,10);
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
