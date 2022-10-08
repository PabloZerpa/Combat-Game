
// ========== VARIABLES ==========

// CONSTANTS
const canvas:HTMLCanvasElement = document.querySelector('canvas') as HTMLCanvasElement;
const ctx:CanvasRenderingContext2D = canvas.getContext('2d')!;
const WIDTH:number = 1280;
const HEIGHT:number = 720;
const FLOOR:number = 450;
const SPEEDX:number = 10, SPEEDY:number = 10;
const ACE:number = 10;
const GRAVITY:number = 1;

let hp1 = document.querySelector('#hp1') as HTMLCanvasElement;
let hp2 = document.querySelector('#hp2') as HTMLCanvasElement;


// ASSETS
let background = new Image();
let warrior1 = new Image();
let warrior2 = new Image();
let winner:boolean = false;
let pause:boolean = false;
let restart:boolean = false;


let player1, player2;
let key=[];
let timer:number = 121;
let timerId:number;

let timerContainer = document.querySelector('#timer') as HTMLCanvasElement;
let result = document.querySelector('#result') as HTMLCanvasElement;

// ========== KEYDOWN ==========
document.addEventListener('keydown', function (e) {
    key[e.key]=true;

}, false);

// ========== KEYUP ==========
document.addEventListener('keyup', function (e) {
    key[e.key]=false;

}, false);

// ========== PLAYER ==========
function Player(name:string, img:HTMLImageElement, x:number, y:number, width:number, height:number, hpBar:string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedx = 0;
    this.speedy = 0;
    this.hp = 100;
    this.hpBar = hpBar;
    this.name = name;

    this.fill = function (ctx:CanvasRenderingContext2D) {
        if (ctx == null) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        }
    };

    this.intersects = function (enemy) {
        if (enemy == null) {
            window.console.warn('Missing parameters on function intersects');
        } 
        else {
            return (this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y);
        }
    };

    this.move = function (enemy,right:string,left:string,jump:string,attack:string){

        if(!pause)
        {
            // Set gravity
            this.speedy += 5;
            if (this.speedy > 10) {
                this.speedy = 20;
            }
    
            // Move
            if ((this.y !== FLOOR) && key[jump]) {
                //player1.y -= SPEEDY;
                this.speedy = -30;
            }
            // Move player in y
            this.y += this.speedy;
    
            if (key[right]) {
                //player1.x += SPEEDX;
                this.speedx+=ACE;
            }
            if (key[left]) {
                //player1.x -= SPEEDX;
                this.speedx-=ACE;
            }
            if (key[attack]) {
                if (this.intersects(enemy)) {
                    enemy.hp -= 20;
                    document.querySelector(enemy.hpBar).style.width = enemy.hp + '%';
                    if(enemy.hp <= 0)
                        determineWinner(this, enemy, timerId);
                }
            }
            this.speedx*=0.75;
            this.x += this.speedx;
    
            // Out Screen
            if (this.x >= (canvas.width - this.width)) {
                this.x = (WIDTH - this.width);
            }
            if (this.y >= (canvas.height - this.height)) {
                this.y = (HEIGHT - this.height);
            }
            if (this.x <= 0) {
                this.x = 0;
            }
            if (this.y <= 0) {
                this.y =0;
            }
        }


    }
}

// ========== PAINT ON CANVAS ==========
function paint(ctx:CanvasRenderingContext2D):void {

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    background.src = './assets/background.jpg';
    ctx.drawImage(background,0,0);

    player1.fill(ctx);
    player2.fill(ctx);

}

// ========== MOVE FUNCTION ==========
function move():void {

        if(!winner)
        {
            player1.move(player2,'d','a','w','s');
            player2.move(player1,'ArrowRight','ArrowLeft','ArrowUp','ArrowDown');
        }
}

// ========== Determine Winner ==========
function determineWinner(player1,player2,timerId)
{
    clearTimeout(timerId)
    result.style.display = 'flex';
    winner = true;
    if(player1.hp === player2.hp){
        result.innerHTML = 'Tie';
    }
    else if(player1.hp > player2.hp){
        result.innerHTML = player1.name + ' Wins';
    }
    else if(player1.hp < player2.hp){
        result.innerHTML = player2.name + ' Wins';
    }
}

// ========== Timer ==========

function decreaseTimer()
{
    if(timer>0){
        timerId = setTimeout(decreaseTimer, 1000)
        timer--;
        timerContainer.innerHTML = String(timer);
    }

    if(timer === 0){
        determineWinner(player1, player2, timerId);
    }
}
decreaseTimer();


// ========== REPAINT FUNCTION ==========
function update():void {
    window.requestAnimationFrame(update);
    paint(ctx);
}

function reset(){
    player1.x=140;
    player1.hp=100;
    player2.x=940;
    player2.hp=100;
    hp1.style.width = '100%';
    hp2.style.width = '100%';

    result.style.display = 'none';
    result.innerHTML = '';

    timer = 121;
    clearTimeout(timerId);
    decreaseTimer();
    
    pause = false;
    winner = false;
    restart= false;
}

// ========== RUN FUNCTION ==========
function run():void {
    
    setTimeout(run, 50);
    move();

    // PAUSE
    if (key['p']) {
        pause = !pause;

        if(pause){
            result.style.display = 'flex';
            result.innerHTML = 'Pause';
            clearTimeout(timerId);
        }
        else{
            result.style.display = 'none';
            result.innerHTML = '';
            decreaseTimer();
        }
    }

    // Restart
    if (key['r']) {
        restart = !restart
        if(restart){
            reset();
        }
    }
    
}

// ========== INIT FUNCTION ==========
function init():void {

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // ASSETS
    warrior1.src = './assets/warrior1.png';
    warrior2.src = './assets/warrior2.png';

    // PLAYER
    player1 = new Player('Player 1',warrior1, 140, FLOOR, 150, 250, '#hp1');
    player2 = new Player('Player 2',warrior2, 940, FLOOR, 150, 250,'#hp2');

    // Start game
    run();
    update();
}


window.addEventListener('load', init, false);