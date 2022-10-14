
// ========== VARIABLES ==========

// CONSTANTS
const canvas:HTMLCanvasElement = document.querySelector('canvas') as HTMLCanvasElement;
const ctx:CanvasRenderingContext2D = canvas.getContext('2d')!;
const WIDTH:number = 1280;
const HEIGHT:number = 720;
const FLOOR:number = 680;
const RANGE:number = 30;
const ACE:number = 10;
const GRAVITY:number = 5;

// HTML ELEMENTS
let hp1 = document.querySelector('#hp1') as HTMLCanvasElement;
let hp2 = document.querySelector('#hp2') as HTMLCanvasElement;
let timerContainer = document.querySelector('#timer') as HTMLCanvasElement;
let result = document.querySelector('#result') as HTMLCanvasElement;
let pauseBtn = document.querySelector('#pauseBtn') as HTMLCanvasElement;
let restartBtn = document.querySelector('#restartBtn') as HTMLCanvasElement;

// ASSETS
let background = new Image();
let sky = new Image();
let mount = new Image();
let street = new Image();
let shop = new Image();
let castle = new Image();
let warrior1 = new Image();
let warrior2 = new Image();

// STATES
let winner:boolean = false;
let pause:boolean = false;
let restart:boolean = false;

let player1, player2;
let key=[];
let timer:number = 121;
let timerId:number;

// ========== KEYDOWN ==========
document.addEventListener('keydown', function (e) {
    key[e.key]=true;

}, false);

// ========== KEYUP ==========
document.addEventListener('keyup', function (e) {
    key[e.key]=false;
}, false);


pauseBtn.addEventListener('click', pauseGame);

restartBtn.addEventListener('click', reset);

// ========== PLAYER ==========
function Player(name:string, img:HTMLImageElement, source:string, x:number, y:number, 
                width:number, height:number, hpBar:string, lastKey:string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedx = 0;
    this.speedy = 0;
    this.hp = 100;
    this.hpBar = hpBar;
    this.name = name;
    this.lastKey = lastKey;
    this.img = img;
    this.imgSrc = 'assets/' + this.name;
    this.img.src = this.imgSrc + source;
    

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
            return (this.x < enemy.x + (enemy.width + RANGE) &&
                this.x + (this.width + RANGE) > enemy.x &&
                this.y < enemy.y + (enemy.height + RANGE) &&
                this.y + (this.height + RANGE) > enemy.y);
        }
    };

    this.move = function (enemy,right:string,left:string,jump:string,attack:string){

        if(!pause)
        {
            let direction:string = this.lastKey;

            // Set gravity
            this.speedy += GRAVITY;
            if (this.speedy > 10) {
                this.speedy = 20;
            }
    
            // Move
            if ((this.y !== FLOOR) && key[jump]) {
                this.speedy = -30;
                this.img.src = this.imgSrc + `/jump_${direction}.png`;
            }
            // Move player in y
            this.y += this.speedy;
    
            if (key[right]) {
                this.speedx+=ACE;
                this.img.src = this.imgSrc + '/run_right.png';
                this.lastKey = 'right';
            }
            if (key[left]) {
                this.speedx-=ACE;
                this.img.src = this.imgSrc + '/run_left.png';
                this.lastKey = 'left';
            }
            if (key[attack]) {
                this.img.src = this.imgSrc + `/attack_${direction}.png`;

                if (this.intersects(enemy)) {
                    enemy.hp -= 20;
                    enemy.img.src = enemy.imgSrc + `/dmg_${direction}.png`;
                    document.querySelector(enemy.hpBar).style.width = enemy.hp + '%';
                    if(enemy.hp <= 0)
                        determineWinner(this, enemy, timerId);
                }
            }
            this.speedx*=0.75;
            this.x += this.speedx;

            if(!key[attack] && !key[left] && !key[right] && !key[jump])
            {   
                if(this.y != 575)
                    this.img.src = this.imgSrc + `/fall_${direction}.png`;
                else
                    this.img.src = this.imgSrc + `/idle_${direction}.png`;  
            }
    
            // Limit
            if (this.x >= (WIDTH - this.width)) {
                this.x = (WIDTH - this.width);
            }
            if (this.y >= (FLOOR - this.height)) {
                this.y = (FLOOR - this.height);
            }
            if (this.x <= 0) {
                this.x = 0;
            }
            if (this.y <= 100) {
                this.y = 100;
            }

        }
    }
}

// ========== PAINT ON CANVAS ==========
function paint(ctx:CanvasRenderingContext2D):void {

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    sky.src = './assets/sky.png';
    ctx.drawImage(sky,0,-150, 1280, 640);

    castle.src = './assets/castle.png';
    ctx.drawImage(castle,0,300,200,250);

    mount.src = './assets/mount.png';
    ctx.drawImage(mount,690,240,600,360);

    shop.src = './assets/shop.png';
    ctx.drawImage(shop,950,400,190,150);

    background.src = './assets/background.png';
    ctx.drawImage(background,0,310,WIDTH,HEIGHT/2);
    
    street.src = './assets/street.png';
    ctx.drawImage(street,0,FLOOR-20,WIDTH,60);


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
        result.innerHTML = player1.name + ` Wins <i class="fa-solid fa-crown"></i>`;
        player1.img.src = player1.imgSrc + `/win.png`; 
        player2.img.src = player2.imgSrc + `/lose.png`;  
    }
    else if(player1.hp < player2.hp){
        result.innerHTML = player2.name + ` Wins <i class="fa-solid fa-crown"></i>`;
        player1.img.src = player1.imgSrc + `/lose.png`; 
        player2.img.src = player2.imgSrc + `/win.png`;  
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


// ========== UPDATE FUNCTION ==========
function update():void {
    window.requestAnimationFrame(update);
    paint(ctx);
}

// ========== RESET GAME FUNCTION ==========
function reset(){
    player1.x=200;
    player2.x=1000;
    player1.hp=100;
    player2.hp=100;
    hp1.style.width = '100%';
    hp2.style.width = '100%';
    player1.img.src = player1.imgSrc + '/idle_right.png';
    player2.img.src = player2.imgSrc + '/idle_left.png';

    result.style.display = 'none';
    result.innerHTML = '';

    timer = 121;
    clearTimeout(timerId);
    decreaseTimer();
    
    pause = false;
    winner = false;
    restart= false;
}

function pauseGame(){
    pause = !pause;

    pause ? pauseBtn.innerHTML = `<i class="fa-solid fa-play"></i>` 
    : pauseBtn.innerHTML = `<i class="fa-solid fa-stop"></i>`

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

// ========== RUN FUNCTION ==========
function run():void {
    
    setTimeout(run, 50);
    move();

    // PAUSE
    if (key['p']) {
        pauseGame();
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

    // PLAYERS
    player1 = new Player('Player 1',warrior1,'/idle_right.png', 200, FLOOR, 75, 125, '#hp1', 'right');
    player2 = new Player('Player 2',warrior2,'/idle_left.png', 1000, FLOOR, 75, 125,'#hp2', 'left');

    // Start game
    run();
    update();
}


window.addEventListener('load', init, false);