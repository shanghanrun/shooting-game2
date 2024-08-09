let noWeapon = false; // 총알 있는 지 여부

class Spaceship{
	constructor(life){
		this.x=0;
		this.y=0;
		this.life = life;
		this.weaponCount= 1000;
		this.nukeBombCount= 10;
		this.weapon:{
			{bullet: {demage:1}}, //총알
			{laser: {demage:2}}, //레이저
			{strongLaser:{demage: 3}}, //강력레이저
			{nukeBomb: {demage:100}} //핵폭탄 
		};
		this.arm = this.weapon.bullet;
		init(){
			this.x = spaceshipX+ spaceshipWidth/2 - bulletWidth/2
			this.y = spaceshipY
		}
		shoot(){
			if(this.arm === this.weapon.nukeBomb){
				if (this.nukeBombCount >0) {
					this.nukeBombCount--
				} else{
					noWeapon = true
				}
			} else{
				if (this.weaponCount >0){
					this.weaponCount--
				} else{
					noWeapon = true
				}
			}
		}
		reload(){
			this.weaponCount =1000
		}
	}
}

// setupKeyboardListener에서 'space bar'를 눌렀을 경우 createBullet()의 경우
// if(!noWeapon) {createBullet(); spaceship.shoot();}한다.

//게임시작할 때
let spaceship
function createSpaceship(){
	spaceship = new Spaceship()
	spaceship.init()
}

createSpaceship()

