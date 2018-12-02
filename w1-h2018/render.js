/* global noCursor min max random mouseX mouseY noLoop PI arc dist atan2 noFill stroke loadImage image abs noStroke atan2 triangle CENTER rotate scale translate width height textAlign textSize textFont imageMode rectMode resetMatrix push pop rect fill createCanvas textFont background ellipse frameCount cos radians sin windowWidth windowHeight key text keyCode*/


/**
 hp - hitpoint
 hb - hitbox
 sp - speed
 dmg- damage
 kb - knockback
 mv - muzzle velocity
 rof- rate of fire
 dur- duration
*/
const eS = {
    hp: [10, 250],
    sp: [4, 3],
    hb: [12, 30],
    rof: [70, 50],
};
const bS = {
    dmg: [1, 1, 10],
    pb: [2, 3, 2],
    hb: [8, 4, 8],
    mv: [3, 18, 7],
    dur: [200, 60, 400],
};
let cost = {
    orb: [10, 0],
    dmg: [10, 0],
    hp: [10, 0],
    laser: [1000, 0]
};
let keys = [], state = 1, mp;

let score = 0;
let scorev2 = 0;
let wave = 1;
let maxhp = 100;
let money = 10;
let enemies = [];
let bullets = [];
let shields = [];
let lasers = [];
let pullets = [];
//player
var px = 200;
var py = 200;
var pvx = 0;
var pvy = 0;
var hp = 100;
var hp2 = 100;
var hp3 = 0;
var a = 0.3;
var ns = 1;
var es = 600;

/*enemies.push(new Enemy(10000, 10000, 1, 20));
enemies.push(new Enemy(-10000, -10000, 1, 10));
enemies.push(new Enemy(10000, -10000, 1, 10));
enemies.push(new Enemy(10000, -10000, 1, 10));*/

enemies.push(new Enemy(Math.random()*180-90, Math.random()*180-90, 1, 3));
//for(let i = 0; i<4; i ++) enemies.push(new Enemy(Math.random()*18000-900, Math.random()*18000-900, 1, 0));


let img, orb;
let orbt;
let orbb;
let lasert, laserb;
let ene = [];
let bkgd;
let bullet = {};
let crossHair;
function preload(){
	img = loadImage('assets/2018-12-01.png');
	ene[0] = loadImage('assets/red.png');
	ene[1] = loadImage('assets/brendan.png');
	bullet.saber = loadImage('assets/rotatedLightsaber.png');
	bullet.fireball = loadImage('assets/greenfireball.png');
	crossHair = loadImage('assets/crosshair.png');
	bullet.saber_t = [];
	for(let i = 0; i < 7; i ++){
	    bullet.saber_t.push(loadImage('assets/saber'+i+'.png'));
	}
	orb = loadImage('assets/cannon.png');
	orbt = loadImage('assets/turret.png');
	orbb = loadImage('assets/base.png');
	lasert = loadImage('assets/lasert.png');
	laserb = loadImage('assets/laserb.png');
	bkgd = loadImage('assets/veil-4000.jpg');
}

function Bullet(x, y, a, ID, lvl){
    this.x = x;
    this.y = y;
    this.a = a;
    this.v = bS.mv[ID];
    this.ID = ID;
    this.mult = Math.pow(1.1, lvl || 1);
    this.mult2 = Math.pow(1.25, lvl || 1);
    this.dmg = bS.dmg[ID] * this.mult2;
    this.f = bS.dur[ID];
    this.hb = bS.hb[ID] * this.mult;
}
Bullet.prototype.draw = function(friendly){
    push();
    translate(this.x, this.y);
    rotate(this.a);
    scale(this.mult);
    switch(this.ID){
        case 0:
            if(abs(this.f - 160) < 10){
                this.a -= (this.a - atan2(py - this.y, px - this.x)) / 7;
                this.v = 0;
            }
            if(this.f === 150){
                this.a = atan2(py - this.y, px - this.x) + random(-0.3, 0.3);
                this.v = 15;
            }else{
                this.v /= 1.01;
            }
            image(bullet.fireball, 0, 0, 24, 12);
            break;
        case 1:
            image(bullet.saber_t[~~(6-this.f/10)], 0, 0, 20, 20);
            break;
        case 2:
            image(bullet.fireball, 0, 0, 30, 15);
            this.v = Math.min(this.v * 1.1, 24);
            //this.f -= this.v/this.mult;
            break;
    }
    if(friendly){
        for(let i = 0; i < enemies.length; i ++){
            let Enemy = enemies[i];
            if(dist(Enemy.x, Enemy.y, this.x, this.y) < (this.hb + Enemy.hb)){
                Enemy.hp -= this.dmg * max(1 - wave/100, 0.4);
                pop();
                return true;
            }
        }
    }else{
        if(dist(px, py, this.x, this.y) < ((this.hb + 30) / 2)){
            this.f = 999;
            hp -= this.dmg;
            hp3 = 0;
            pop();
            return true;
        }
    }
    //triangle(0, -2, 0, 2, 8, 0);
    -- this.f;
    this.x += cos(this.a) * this.v;
    this.y += sin(this.a) * this.v;
    
    pop();
    if(this.f < 0) return true;
};
function Enemy(x, y, ID, lvl){
    this.x = x;
    this.y = y;
    this.a = 0;
    this.v = eS.sp[ID];
    this.ID = ID;
    this.lvl = lvl;
    this.mult = Math.pow(1.1, lvl || 1);
    this.mult2 = Math.pow(1.5, lvl-4 || 1);
    this.hp = ~~(eS.hp[ID]*this.mult2);
    this.mhp = this.hp;
    this.hb = ~~(eS.hb[ID]*this.mult);
    this.cd = 0;
    this.mv = this.v;
}
Enemy.prototype.draw = function(){
    push();
    translate(this.x, this.y);
    fill(255, 0, 0, 100);
    noStroke();
    textSize(this.hb*2);
    text(this.hp > 900 ? (this.hp/1000).toFixed(1) + 'k': ~~this.hp, 0, -this.hb*3);
    rect(0, -this.hb*2, this.hb*2 * this.hp/this.mhp, 5);
    scale(this.mult);
    rotate(this.a);
    switch(this.ID){
        case 0:
            /*noStroke();
            fill(255, 0, 0);
            rect(0, 0, 20, 20);
            triangle(0, -10, 0, 10, 25, 0);*/
            image(ene[0], 0, 0, 20, 20);
            
            this.a = atan2(py - this.y, px - this.x);
            if(this.cd > 70){
                bullets.push(new Bullet(this.x, this.y, this.a+PI/2, 0, this.lvl));
                bullets.push(new Bullet(this.x, this.y, this.a-PI/2, 0, this.lvl));
                if(abs(this.x - px) < 150*this.mult && abs(this.y - py) < 150*this.mult)
                    bullets.push(new Bullet(this.x, this.y, this.a, 2, this.lvl));
                this.cd = 0;
            }
            if(abs(this.x - px) > 500 && abs(this.y - py) < 500){
                this.v = 30;
            }
            if(abs(this.x - px) < 150*this.mult && abs(this.y - py) < 150*this.mult){
                this.v /= 1.1;
            }else{
                this.v -= (this.v - this.mv) / 7;
            }
            break;
        case 1:
            image(ene[1], 0, 0);
            
            this.a = atan2(py - this.y, px - this.x);
            if(this.cd > 80){
                if(this.cd === 90) enemies.push(new Enemy(this.x, this.y, 0, this.lvl));
                if(this.cd % 10 === 0){
                    bullets.push(new Bullet(this.x, this.y, this.a+PI/2, 0, this.lvl+5));
                    bullets.push(new Bullet(this.x, this.y, this.a-PI/2, 0, this.lvl+5));
                }
            }
            if(this.cd > 120) this.cd = 0;
            if(abs(this.x - px) > 800 && abs(this.y - py) < 800){
                this.v = 30;
            }
            if(abs(this.x - px) < 200*this.mult && abs(this.y - py) < 200*this.mult){
                this.v /= 1.1;
            }else{
                this.v -= (this.v - this.mv) / 7;
            }
            break;
    }
    ++ this.cd;
    this.x += cos(this.a) * this.v;
    this.y += sin(this.a) * this.v;
    pop();
    return this.hp < 1;
};
function player(){
    //motion
    if(keys[65] && px > -2000){
        pvx -= a;
    }
    if(keys[68] && px < 2000){
        pvx += a;
    }
    if(keys[87] && py > -2000){
        pvy -= a;
    }
    if(keys[83] && py < 2000){
        pvy += a;
    }
    px += pvx;
    py += pvy;
    pvx /= 1.05;
    pvy /= 1.05;

    image(img, px, py, 45, 45);
}
function Shield(a, d){
    this.a = a;
    this.d = d;
    this.cd = 0;
    this.x = 0;
}
Shield.prototype.draw = function(){
    let x = px + cos(this.a)*this.d;
    let y = py + sin(this.a)*this.d;
    let a = atan2(mouseY - (height/2 + sin(this.a)*this.d), mouseX - (width/2 + cos(this.a)*this.d));
    push();
    translate(x, y);
    rotate(a);
    image(orbt, 10-this.x, 0, 16, 12);
    image(orbb, 0, 0, 15, 15);
    //rect(5, 0, 6, 3);
    //ellipse(0, 0, 12, 12);
    pop();
    this.a += radians(1.2);
    this.x /= 1.2;
    ++ this.cd;
    if(this.cd > 7 && keys[32]){
        this.x = 4;
        this.cd = 0;
        pullets.push(new Bullet(x, y, a, 1, 1));
    }
}
function Laser(a, d){
    this.a = a;
    this.d = d;
    this.cd = 0;
    this.x = 0;
}
Laser.prototype.draw = function(){
    let x = px + cos(this.a)*this.d;
    let y = py + sin(this.a)*this.d;
    let a = atan2(mouseY - (height/2 + sin(this.a)*this.d), mouseX - (width/2 + cos(this.a)*this.d));
    push();
    translate(x, y);
    rotate(a);
    noFill();
    stroke(255, max(10, this.cd-150));
    ellipse(0, 0, 300-this.cd + 30, 300-this.cd + 30);
    image(laserb, 0, 0, 30, 30);
    image(lasert, 15-this.x, 0, 30, 50);
    //rect(5, 0, 6, 3);
    //ellipse(0, 0, 12, 12);
    pop();
    this.a += radians(1.2);
    this.x /= 1.2;
    ++ this.cd;
    if(this.cd > 300){
        this.x = 18;
        
        if(this.cd > 330){
            this.cd = 0;
        }
        pullets.push(new Bullet(x-2, y-2, a+random(-0.05, 0.05), 1, 1));
        pullets.push(new Bullet(x-2, y+2, a+random(-0.05, 0.05), 1, 1));
        pullets.push(new Bullet(x+2, y-2, a+random(-0.05, 0.05), 1, 1));
        pullets.push(new Bullet(x+2, y+2, a+random(-0.05, 0.05), 1, 1));
    }
}


//lasers.push(new Laser(0, 0));
shields.push(new Shield(0, 0));

//for(let x = 0; x < 628; x +=16) shields.push(new Shield(x/100, 40));

function setup(){
    var c = createCanvas(windowWidth, windowHeight).canvas;
    c.addEventListener("contextmenu", e => e.preventDefault());
    
    textFont("Verdana");
    background(255);
    imageMode(CENTER);
    noCursor();
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
}
function mousePressed(){
    mp = true;
}
function keyPressed(){
    keys[keyCode] = true;
    
    if(keyCode === 49){
        if(money >= cost.orb[0]){
            shields.push(new Shield(3.14, random(50, 150)+min(shields.length*4), 50) );
            money -= cost.orb[0];
            cost.orb[0] += shields.length*2;
            cost.orb[0] *= 1.2;
            cost.orb[1] = 0;
        }else{
            cost.orb[1] = 0;
        }
    }
    if(keyCode === 50){
        if(money >= cost.dmg[0]){
            money -= cost.dmg[0];
            bS.dmg[1] ++;
            cost.dmg[0] *= 2;
            cost.dmg[1] = 0;
        }else{
            cost.dmg[1] = 0;
        }
    }
    if(keyCode === 51){
        if(money >= cost.hp[0]){
            money -= cost.hp[0];
            maxhp *= 1.5;
            hp3 = 1000;
            cost.hp[0] += maxhp/2;
            cost.hp[0] *= 1.05;
            cost.hp[1] = 0;
        }else{
            cost.hp[1] = 0;
        }
    }
    if(keyCode === 52){
        if(money >= cost.laser[0]){
            money -= cost.laser[0];
            lasers.push(new Laser(random(0, Math.PI*2), 200));
            cost.laser[0] *= 2.8;
            cost.laser[1] = 0;
        }else{
            cost.laser[1] = 0;
        }
    }
}
function keyReleased(){
    keys[keyCode] = false;
}
function draw(){
    background(0);
    switch(state){
        case 0: // menu
            
            break;
        case 1: // play
            image(bkgd, -px/3, -py/3, 8000, 4106);
            fill(0, 180);
            rect(-px/3, -py/3, 8000, 4106);
            
            translate(width/2, height/2);
            scale(1); //scalor
            noFill();
            stroke(255, 150);
            rect(0, 0, 4000, 4000);
            translate(-px, -py);
            player();
            noFill();
            stroke(255);
            for(let e of shields) e.draw();
            for(let e of lasers) e.draw();
            for(let i = 0; i < enemies.length; i ++){
                if(enemies[i].draw()){
                    score += (1+enemies[i].ID)*wave;
                    enemies.splice(i, 1);
                    money += ~~random(1, 5);
                }
            }
            for(let i = 0; i < bullets.length; i ++)
                if(bullets[i].draw(false))
                    bullets.splice(i, 1);
            for(let i = 0; i < pullets.length; i ++)
                if(pullets[i].draw(true))
                    pullets.splice(i, 1);
            resetMatrix();
            if(hp3++ > 400) hp += maxhp/100*min((hp3-400)/200, 1);
            if(hp > maxhp) hp = maxhp;
            
            
            noStroke();
            fill(255, ++cost.orb[1]*5, ++cost.orb[1]*5);
            text("[1] increase orbitals ($"+~~cost.orb[0]+")", width-100, height-100);
            fill(255, ++cost.dmg[1]*5, ++cost.dmg[1]*5);
            text("[2] increase damage ($"+~~cost.dmg[0]+")", width-100, height-80);
            fill(255, ++cost.hp[1]*5, ++cost.hp[1]*5);
            text("[3] increase health ($"+~~cost.hp[0]+")", width-100, height-60);
            fill(255, ++cost.laser[1]*5, ++cost.laser[1]*5);
            text("[4] orbital laser ($"+~~cost.laser[0]+")", width-100, height-40);
            fill(255);
            text("$" + ~~money, 50, height-100);
            text(Math.round(hp2) + "HP", 50, height-50);
            textSize(20);
            text("WAVE " + wave + "\n" + enemies.length + " enemies remaining", width/2, 100);
            textSize(24);
            text("SCORE\n" + ~~scorev2, width-100, 100);
            textSize(12);
            stroke(255, 100);
            noFill();
            arc(50, height-50, 45, 45, Math.PI/2-(Math.PI*hp2/100), Math.PI/2+(Math.PI*hp2/100));
            image(crossHair, mouseX, mouseY);
            image(crossHair, mouseX, mouseY);
            if(!enemies.length){
                hp3 = 500;
                wave ++;
                for(let i = 0; i < Math.pow(wave, 1.3); i ++)
                    enemies.push(new Enemy(Math.random()*4000-2000, Math.random()*4000-2000, 1, ~~(wave / 2)));
                for(let i = 0; i < wave*1.4; i ++)
                    enemies.push(new Enemy(Math.random()*4000-2000, Math.random()*4000-2000, 0, ~~(wave / 2)));
            }
            if(hp2 < 0){
                fill(255, 0, 0, 50);
                rect(0, 0, 99999, 99999);
                fill(255, 255, 255);
                textSize(width/20);
                text("You died!\n\nScore: " + score, width/2, height/2);
                noLoop();
            }
            fill(255, 0, 0, (hp2/maxhp < 0.5) ? (Math.cos(radians(frameCount*3))*10 + 80*(0.8-hp2/maxhp)) : 0);
            rect(0, 0, 99999, 99999);
            break;
    }
    resetMatrix();
    mp = false;
    hp2 -= (hp2 - hp) / 7;
    scorev2 -= (scorev2 - score) / 5;
}
