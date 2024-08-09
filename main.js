
let canvas;
let ctx;
canvas = document.createElement("canvas")
ctx = canvas.getContext("2d")
canvas.width = 400;
canvas.height =700;
document.body.appendChild(canvas)

const spaceshipWidth =48
const enemyWidth =48  //ufo
const enemy2Width = 64 //ufo2
const bulletWidth=24
const laserWidth=24

const ufo1 = 'image/ufo.png'
const ufo2 = 'image/ufo2.png'
const ufo1W = enemyWidth
const ufo2W = enemy2Width


let gameOver = false
let speed =1
let baseballSpeed=1.5
let generateSpeed=1000
let score =0

// help 텍스트
const help = document.createElement('div')
help.innerHTML =`
	<div>
		방향키:좌우, 슈팅:space
		<br>
		대장우주선은 2방을 맞아야 파괴됨!
	</div>
	<div> =================================== </div>
	<div>
		총알 선택: 1(총알), 2(레이저), 3(고급레이저)
		<br>
		* 레이저는 연사가능
		<br>
		<br>
		* 파괴된 잔해가 떨어져도 사망
	</div>`
help.style.position = 'absolute';
help.style.top = '20%';
help.style.left = '50%';
help.style.transform = 'translate(-50%, -50%)';
help.style.border ='2px solid black';
help.style.padding ='5px'
document.body.appendChild(help);
// 난이도 설정 텍스트
const indicate = document.createElement('h3')
indicate.innerText ='게임 난이도 선택'
indicate.style.position = 'absolute';
indicate.style.top = '32%';
indicate.style.left = '50%';
indicate.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(indicate);

// 난이도 설정 드롭다운 생성
const difficultySelect = document.createElement('select');
difficultySelect.innerHTML = `
    <option value="1">하</option>
    <option value="4">중</option>
    <option value="7">상</option>
`;
difficultySelect.style.position = 'absolute';
difficultySelect.style.top = '40%';
difficultySelect.style.left = '50%';
difficultySelect.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(difficultySelect);

difficultySelect.addEventListener('change', () => {
    speed = parseInt(difficultySelect.value);
});

//게임시작 버튼
const startButton = document.createElement('button')
startButton.innerText = "Start Game"
startButton.style.position = 'absolute';
startButton.style.top ="50%"
startButton.style.left ="50%"
startButton.style.transform ="translate(-50%,-50%)"
document.body.appendChild(startButton)




startButton.addEventListener('click', startGame)

function startGame(){
	//버튼 숨기기
	startButton.style.display ='none';
	difficultySelect.style.display ='none';
	indicate.style.display ='none';
	help.style.display ='none';

	//게임초기화
	loadImage()
	setupKeyboardListener()
	createEnemy()
	createEnemy2()
	createBaseball()
	main()
}

// 최초 우주선 좌표 
let spaceshipX = canvas.width/2 -spaceshipWidth/2
let spaceshipX2 = spaceshipX + spaceshipWidth
let spaceshipY = canvas.height - spaceshipWidth


class Bullet{
	constructor(){
		this.x=0;
		this.y=0;
	}
	init(){
		this.x = spaceshipX+ spaceshipWidth/2 - bulletWidth/2
		this.y = spaceshipY
		this.alive = true;
		bulletList.push(this)
	}
	run(){
		this.y -=8  // 총알 속도
	}
	checkHit(){
		for(let i=0; i<enemyList.length; i++){
			const bulletCenterX = this.x + bulletWidth/2
			const currentEnemy = enemyList[i];

			if(this.y <=0){  //화면을 넘어가도 사라지게
				this.alive = false;
			}
			if(this.y <= currentEnemy.y && 
				bulletCenterX>= currentEnemy.x && 
				bulletCenterX <= currentEnemy.x +enemyWidth){
				score ++;
				this.alive = false // 죽은 총알
				currentEnemy.reduceLife()
				if(currentEnemy.life === 0){
					currentEnemy.setOnFire();
				}
				break; //적군을 맞췄으니 총알 루프 중단
			}
		}
	}
}

let enemyList=[]
let baseballList=[]
class Baseball{
	constructor(){
		this.x=0;
		this.y=0;
		this.width=48;
		this.alive=true;
	}
	init(){
		this.x = generateRandomValue(0, canvas.width-this.width);
		this.y =0;
		baseballList.push(this)
	}
	move(){
		this.y += baseballSpeed 
	}
	checkHit(){
		if(this.y > spaceshipY  && this.y < canvas.height &&
			this.x >= spaceshipX && this.x<= spaceshipX2
		 ){
			console.log('우주선 좌표 x x2', spaceshipX, spaceshipX2)
			console.log('공 좌표', this.x, this.x+48)
			gameOver = true;
		 }
	}
}
class Enemy{
	constructor(image, width, life){
		this.x=0;
		this.y=0;
		this.image=image;
		this.width= width;
		this.life=life;
		this.fire = false;
		this.fireTime =0;
	}
	init(){
		this.x = generateRandomValue(0, canvas.width-this.width);
		this.y =0;
		enemyList.push(this)
	}
	move(){
		this.y += speed // 적군속도
	}
	setOnFire(){
		this.fire =true;
		this.fireTime =Date.now();
	}
	isOnFire(){
		return this.fire && Date.now() - this.fireTime <100;
	}
	reduceLife(){
		if(this.life>=1) this.life--
	}
}

function createEnemy(){   // 1초마다 적군생성
	const interval = setInterval(()=>{
		const enemy = new Enemy('ufo1',ufo1W,1)
		enemy.init()
	},generateSpeed)
}
function createEnemy2(){
	const interval = setInterval(()=>{
		const enemy = new Enemy('ufo2',ufo2W,2)
		enemy.init()
	},2000)
}
function createBaseball(){
	const interval = setInterval(()=>{
		const baseball = new Baseball()
		baseball.init()
	},3000)

}

function generateRandomValue(min,max){
	return Math.floor(Math.random()*(max-min+1) + min)
}
let bulletList =[]


let backgroundImage, spaceshipImage, bulletImage,enemyImage,gameOverImage;
function loadImage(){
	backgroundImage = new Image()
	backgroundImage.src = 'image/spacebg.jpg'

	spaceshipImage = new Image()
	spaceshipImage.src ='image/spaceship.png'

	bulletImage = new Image()
	bulletImage.src = 'image/bullet.png'

	// laserImage = new Image()
	// laserImage.src = 'image/laser.png'

	enemy1Image = new Image()
	enemy1Image.src = ufo1
	enemy2Image = new Image()
	enemy2Image.src = ufo2

	baseballImage = new Image()
	baseballImage.src = 'image/baseball.png'

	fireImage = new Image()
	fireImage.src = 'image/explosion.png'

	gameOverImage = new Image()
	gameOverImage.src ='image/gameover.png'
}

let isLaser = false
let keysHit ={}
function setupKeyboardListener(){
	document.addEventListener('keydown', (e)=>{
		console.log('눌린 키', e.code) 
		//ArrowLeft .... Space
		keysHit[e.code] = true
		if(e.code ==='Digit2'){
			bulletImage.src ='image/laser.png'
			isLaser = true
		}else if(e.code ==='Digit1'){
			bulletImage.src ='image/bullet.png'
			isLaser = false
		}else if(e.code ==='Digit3'){
			bulletImage.src ='image/laser2.png'
			isLaser = true
		}
		if(e.code ==='Space' && isLaser ){
			createBullet()
		} 
		if(e.code ==='Escape') gameOver =true      
	})  
	document.addEventListener('keyup',(e)=>{
		// keysHit[e.code] = false
		delete keysHit[e.code]
		if(e.code ==='Space'){  // 혹은 (e.key === '')
			createBullet() // 총알생성
		}
	})
}

function createBullet(){
	console.log('총알생성')
	let b = new Bullet()
	b.init()
}

//총알 만들기
//1. 스페이스바를 누르면 (총알생성) 총알 발사
//2. 총알이 발사되면 총알의 y좌표 --, 
// 총알 x좌표 = 스페이스를 누른 순간의 우주선x좌표+ 우주선너비/2 - 총알너비/2
//3. 발사된 총알들은 총알배열에 저장한다.
//4. 총알들은 x,y좌표값이 있어야 된다.
//5. 총알배열을 가지고 render한다.

function update(){
	if( 'ArrowLeft' in keysHit ){  //객체안에 해당 프로퍼티 있나?
		spaceshipX -= 5;  // 좌우 이동속도
	} else if('ArrowRight' in keysHit){
		spaceshipX += 5;
	}
	if (spaceshipX <=0){  // 좌우끝 이동 제한
		spaceshipX =0
	} else if (spaceshipX >= canvas.width-spaceshipWidth){
		spaceshipX = canvas.width-spaceshipWidth
	}

	//! 우주선의 X좌표가 변화면 X2좌표도 업데이트 시켜줘야 됨
	spaceshipX2 = spaceshipX + spaceshipWidth;

	//화면 업데이트 할때마다, 총알의 y좌표 감소하는 run 함수 호출
	for(let i=0; i<bulletList.length; i++){
		bulletList[i].run()
		bulletList[i].checkHit()
	}
	for(let i=0; i<enemyList.length; i++){
		enemyList[i].move()
		if (enemyList[i].y >= canvas.height -enemyWidth){
			gameOver = true;
		}
	}
	for(let i=0; i<baseballList.length; i++){
		baseballList[i].move()
		baseballList[i].checkHit()
		if (baseballList[i].y > canvas.height){
			baseballList[i].alive = false
		}
	}
	// 죽은 총알과 불난 적군 제거
    bulletList = bulletList.filter(bullet => bullet.alive);
    baseballList = baseballList.filter(baseball => baseball.alive);
	enemyList = enemyList.filter(enemy => !enemy.fire || enemy.isOnFire())
	console.log('bulletList.length', bulletList.length)
	console.log('enemyList.length', enemyList.length)
	console.log('baseballList.length', baseballList.length)

	if(score > 100 && score %7 === 0){
		const spawnChance = Math.random(); // 0에서 1 사이의 난수
		if(spawnChance < 0.2){ // 50% 확률로 적군 생성
			const enemy = new Enemy('ufo1', ufo1W, 1);
			enemy.init();
		}
	}

}

function render(){
	ctx.drawImage(backgroundImage,0,0,canvas.width,canvas.height)
	ctx.drawImage(spaceshipImage, spaceshipX, spaceshipY )
	ctx.fillText(`Score: ${score}`, 20,40)
	ctx.fillStyle='white'
	ctx.font = 'bold 24px Arial';

	for(let i=0; i<bulletList.length; i++){
		if(bulletList[i].alive){
			ctx.drawImage(bulletImage, bulletList[i].x, bulletList[i].y)
		}
	}
	for(let i=0; i<enemyList.length; i++){
		if(enemyList[i].isOnFire()){
			ctx.drawImage(fireImage, enemyList[i].x+12, enemyList[i].y)
		} else {
			// enemyImage.src = enemyList[i].image;
			if (enemyList[i].image === 'ufo1'){
				ctx.drawImage(enemy1Image, enemyList[i].x, enemyList[i].y)
			} else if(enemyList[i].image === 'ufo2'){
				ctx.drawImage(enemy2Image, enemyList[i].x, enemyList[i].y)
			}
		}
	}
	for(let i=0; i<baseballList.length; i++){
		if(baseballList[i].alive){
			ctx.drawImage(baseballImage,baseballList[i].x, baseballList[i].y)
		}
	}
}

function main(){
	if(gameOver){
		ctx.drawImage(gameOverImage, 50, 200, 300, 150)
	}else{
		update()
		render()
		requestAnimationFrame(main)
	}
}

// loadImage()
// setupKeyboardListener()
// createEnemy()
// main()
