
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
const laserWidth= 40
const strongLaserWidth=60

let selectedWeapon = 'bullet'


const ufo1 = 'image/ufo.png'
const ufo2 = 'image/ufo2.png'
const ufo1W = enemyWidth
const ufo2W = enemy2Width


let gameOver = false
let ufo1Speed =1
let ufo2Speed =1.5
let baseballSpeed=1.5
let generateSpeed=1000
let spaceshipSpeed =5
let bulletSpeed =7
let baseballCreateInterval =3000
let score =0
let isLaser = false
let bomb;
let bombCount = 5 // 준비된 폭탄 갯수
let bombActive = false
let explosion = false
let explosionTime = null;
let chance = 0.3

let restartButton

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
		   4(핵폭탄) 한번에 적을 쓸어 버린다!!. 5발 있음
		<br>
		* 레이저는 연사가능, 레이저는 관통하며 소멸안됨
		<br>
		<br>
		* 수정: 잔해가 떨어지지 않게 함
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
indicate.style.top = '35%';
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
difficultySelect.style.top = '43%';
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

// 게임 초기화 함수
function resetGame() {
    // gameOver = false;
    // speed = parseInt(difficultySelect.value);
    // score = 0;
    // isLaser = false;
    // bombActive = false;
    // explosion = false;
    // bulletList = [];
    // enemyList = [];
    // baseballList = [];
    // spaceshipX = canvas.width / 2 - spaceshipWidth / 2;
    // // restartButton.style.display = 'none'; // 재시작 버튼 숨기기
    // // 적군 생성 타이머를 다시 설정
    // createEnemy();
    // createEnemy2();
    // createBaseball();

    // startGame(); // 게임 다시 시작
	location.reload();
}

// 게임 오버 시 나타나는 재시작 버튼 생성
let restartButtonImage = new Image()
restartButtonImage.src = 'image/restart.png'


// 버튼의 위치와 크기를 저장하는 변수
let restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight;

// 게임 오버 시 재시작 버튼을 생성
function setRestartButtonPosition() {
    restartButtonWidth = 144;
    restartButtonHeight = 144;
    restartButtonX = canvas.width / 2 - restartButtonWidth / 2;
    restartButtonY = canvas.height / 2 + 100;
}

function handleGameOver() {
	setRestartButtonPosition(); //버튼 위치 크기 설정
    ctx.drawImage(gameOverImage, 50, 200, 300, 150);
    ctx.drawImage(restartButtonImage, restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight);
    
    canvas.addEventListener('click', handleRestartButtonClick);

	// 게임 오버 시 모든 적군과 기타 오브젝트를 초기화
    // bulletList = [];
    // enemyList = [];
    // baseballList = [];
}

function handleRestartButtonClick(event) {
    let x = event.offsetX;
    let y = event.offsetY;

    if (x >= restartButtonX && x <= restartButtonX + restartButtonWidth &&
        y >= restartButtonY && y <= restartButtonY + restartButtonHeight) {
        canvas.removeEventListener('click', handleRestartButtonClick); // 이벤트 리스너 제거
        resetGame(); // 게임 리셋
    }
}
    
 
// 최초 우주선 좌표 
let spaceshipX = canvas.width/2 -spaceshipWidth/2
let spaceshipX2 = spaceshipX + spaceshipWidth
let spaceshipY = canvas.height - spaceshipWidth


class Bomb{
	constructor(){
		this.x=0;
		this.y=0;
		this.count=0
		this.alive=true
	}
	init(){
		this.x = spaceshipX+ spaceshipWidth/2 - bulletWidth/2
		this.y = spaceshipY
	}
	run(){
		this.y -=4
		this.count ++
	}
	checkAndExplode(){
		if(this.count >= 40 ){
			// 폭발 발생 시 화면에 있는 적 모두 제거
			for (let i = 0; i < enemyList.length; i++) {
				enemyList[i].setOnFire();
			}
			// enemyList =[]; //추가
			explosion = true
			bombActive = false; // 폭탄 터진후 bombActive false로 리셋
		}
	}
}
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
		this.y -= bulletSpeed  // 총알 속도
	}
	checkHit(){
		for(let i=0; i<enemyList.length; i++){
			// const bulletCenterX = this.x + bulletWidth/2
			let weaponWidth
			if(selectedWeapon ==='bullet'){
				weaponWidth = bulletWidth
			} else if(selectedWeapon ==='laser'){
				weaponWidth = laserWidth
			} else if(selectedWeapon ==='strongLaser'){
				weaponWidth = strongLaserWidth
			}
			const bulletX = this.x;
			const bulletX2 = this.x + weaponWidth;
			const currentEnemy = enemyList[i];
			const enemyX2 = currentEnemy.x + currentEnemy.width;
			const bulletY2 = this.y + bulletWidth; // 총알의 하단 Y 좌표

			if(this.y <=0){  //화면을 넘어가도 사라지게
				this.alive = false;
			}
			// 충돌 검사 조건: 총알이 적군의 영역 내에 들어왔는지 확인
			if (bulletY2 >= currentEnemy.y && this.y <= currentEnemy.y + currentEnemy.width &&
				bulletX2 >= currentEnemy.x && bulletX <= enemyX2) {
				score++;
				if (!isLaser) {
					this.alive = false;
				}
				currentEnemy.reduceLife();
				if (currentEnemy.life === 0) {
					currentEnemy.setOnFire();
				}
				break; // 적군을 맞췄으니 총알 루프 중단
			}
		}
	}
}

let enemyList=[]
let baseballList=[]
let enemyInterval1, enemyInterval2, baseballInterval;
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
		if(this.image ==='ufo1'){
			this.y += ufo1Speed
		} else if(this.image === 'ufo2'){
			this.y += ufo2Speed // 적군속도
		}
	}
	setOnFire(){
		this.fire =true;
		this.fireTime =Date.now();
	}
	isOnFire(){
		return this.fire && Date.now() - this.fireTime <20;
	}
	reduceLife(){
		if(this.life>=1) this.life--
	}
}

function createEnemy(){   // 1초마다 적군생성
	clearInterval(enemyInterval1)
	enemyInterval = setInterval(()=>{
		const enemy = new Enemy('ufo1',ufo1W,1)
		enemy.init()
	},generateSpeed)
}
function createEnemy2(){
	clearInterval(enemyInterval2)
	enemyInterval2 = setInterval(()=>{
		const enemy = new Enemy('ufo2',ufo2W,2)
		enemy.init()
	},2000)
}
function createBaseball(){
	clearInterval(baseballInterval)
	baseballInterval = setInterval(()=>{
		const baseball = new Baseball()
		baseball.init()
	},baseballCreateInterval)

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
	bombImage = new Image()
	bombImage.src = 'image/bomb.png'

	fireImage = new Image()
	fireImage.src = 'image/explosion.png'

	gameOverImage = new Image()
	gameOverImage.src ='image/gameover.png'
}


let keysHit ={}
function setupKeyboardListener(){
	document.addEventListener('keydown', (e)=>{
		console.log('눌린 키', e.code) 
		//ArrowLeft .... Space
		keysHit[e.code] = true
		if(e.code ==='Digit2'){
			bulletImage.src ='image/laser.png'
			isLaser = true
			selectedWeapon = 'laser'
		}else if(e.code ==='Digit1'){
			bulletImage.src ='image/bullet.png'
			isLaser = false
			selectedWeapon = 'bullet'
		}else if(e.code ==='Digit3'){
			bulletImage.src ='image/laser2.png'
			isLaser = true
			selectedWeapon = 'strongLaser'
		}else if(e.code ==='Digit4'){
			if(!bombActive){ // bombActive가 false일때만 폭탄생성
				bombActive = true
				createBomb()
			}
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
function createBomb(){
	if(bombCount >0){
		console.log('폭탄생성')
		bomb = new Bomb()
		bomb.init()
		bombCount --
	}
}
function deleteBomb(){
	bomb = null
	bombActive = false; // 폭탄삭제후 false로
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
		spaceshipX -= spaceshipSpeed;  // 좌우 이동속도
	} else if('ArrowRight' in keysHit){
		spaceshipX += spaceshipSpeed;
	}
	if (spaceshipX <=0){  // 좌우끝 이동 제한
		spaceshipX =0
	} else if (spaceshipX >= canvas.width-spaceshipWidth){
		spaceshipX = canvas.width-spaceshipWidth
	}

	//! 우주선의 X좌표가 변화면 X2좌표도 업데이트 시켜줘야 됨
	spaceshipX2 = spaceshipX + spaceshipWidth;

	//폭탄 업데이트
	bomb?.run()
	bomb?.checkAndExplode()
	if(explosion){
		// enemyList =[]
		// bulletList=[]
		deleteBomb()
		explosion = false; //폭탄 폭발후 explosion 리셋
	}
	

	//화면 업데이트 할때마다, 총알의 y좌표 감소하는 run 함수 호출
	for(let i=0; i<bulletList.length; i++){
		bulletList[i].run()
		bulletList[i].checkHit()
	}
	for(let i=0; i<enemyList.length; i++){
		const currentEnemy = enemyList[i]
		if (!currentEnemy.fire){ // 잔해는 바닥으로 떨어지지 않게 함
			currentEnemy.move()
			if (currentEnemy.y >= canvas.height -enemyWidth){
				gameOver = true;
			}
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
		if(spawnChance < chance){ // 20% 확률로 적군 생성
			const enemy = new Enemy('ufo1', ufo1W, 1);
			enemy.init();
		}
	}
	if(score > 1000){
		chance =0.6
		spaceshipSpeed = 7
		bulletSpeed =10
		ufo2Speed =2
	} else if(score > 5000){
		chance = 0.7
		generateSpeed = 700
		ufo1Speed =1.5
	} else if(score >10000){
		chance = 0.8
		generateSpeed = 500
		spaceshipSpeed = 8
		bulletSpeed =12
		baseballSpeed =2
		baseballCreateInterval = 2000
	} else if(score >15000){
		chance =0.9
		speed = 1.5
		baseballSpeed =3
		ufo2Speed = 2.5
	}
	if(score > 10000 && score %7 === 0){
		const spawnChance = Math.random(); // 0에서 1 사이의 난수
		if(spawnChance < 0.7){ // 40% 확률로 적군 생성
			const enemy = new Enemy('ufo2', ufo2W, 3);
			enemy.init();
		}
	}


}

function render(){
	ctx.drawImage(backgroundImage,0,0,canvas.width,canvas.height)
	ctx.drawImage(spaceshipImage, spaceshipX, spaceshipY )
	ctx.fillStyle='white'
	ctx.font = 'bold 24px Arial';
	ctx.fillText(`Score: ${score}`, 20,40)
	ctx.fillStyle='pink'
	ctx.font = '20px Arial';
	ctx.fillText(`Nuke Bomb : ${bombCount}`, 20, 60)
	

	
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
	

	if(bombActive){
		ctx.drawImage(bombImage, bomb?.x, bomb?.y)
	}
	if(gameOver){
		// ctx.drawImage(gameOverImage, 50, 200, 300, 150)
		handleGameOver()
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
