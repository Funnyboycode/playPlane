window.onload = function () {
  let main = function () {
    const MW = document.documentElement.clientWidth, //获取移动设备的宽度
      MH = document.documentElement.clientHeight; //获取高度
    let planeW = 50, //飞机的宽度
      planeH = 50, //飞机的高度
      smallEnemyW = 50, //小敌机的宽度
      smallEnemyH = 50, //小敌机的高度
      bigEnemyW = 80, //大敌机的宽度
      bigEnemyH = 80, //大敌机的高度
      bulletW = 30, //子弹的宽度
      bulletH = 30, //子弹的高度
      rewardW = 50, //奖励的宽度
      rewardH = 50, //奖励的高度
      bulletSpeed = 2, //子弹移动的速度
      enemySpeed = 2; //敌军移动的速度
    let menu = document.querySelector('#menu'), //获取游戏目录页面
      main = document.querySelector('#main'), //获取游戏主页面内容
      gameOver = document.querySelector('#game_over'), //获取游戏结束页面
      bgImgs = document.querySelectorAll('#bg img'), //获取背景图片
      level = document.querySelector('.level'), //获取游戏难度选项
      back = document.querySelector('#back'), //返回主菜单
      again = document.querySelector('#again'), //再来一次
      overScore = document.querySelector('.getCount span'), //结束时显示的分数
      scoreEle = document.querySelector('#score'); //游戏分数

    let bullets = [], //子弹数组
      enemies = [], //敌军数组
      rewards = []; //奖励数组

    let {
      min,
      max,
      random
    } = Math;
    let timer1, timer2, timer3;
    let bulletTime = 600, //子弹发射定时器时间间隔
      enemyTime = 800, //敌军生成定时器时间
      rewardTime = 5000, //奖励消失间隔
      boomTime = 200; //爆炸效果消失的定时器时间

    let plane = null; //定义飞机实例，方便全局使用
    let score = 0; //定义或得分数
    let smallScore = 100, //击毁小飞机的分数
      bigScore = 300; //击毁大飞机的分数
    let gameType; //选择的游戏类型
    let planeMove = true; //英雄机是否可以移动（游戏结束时改为false）
    let destroyNum = 0; //摧毁敌机数
    let num1 = 10; //摧毁num1个敌机出现一个奖励
    let num2 = 40; //摧毁num2个敌机后敌机加速生成
    let rewardSrc = './images/quick.png'; //..奖励的图片位置
    //存放旧值
    function keepOld() {
      // body
      bulletTimeOld = bulletTime, //子弹发射定时器时间间隔
        enemyTimeOld = enemyTime, //敌军生成定时器时间
        rewardTimeOld = rewardTime, //奖励消失间隔
        boomTimeOld = boomTime, //爆炸效果消失的定时器时间
        bulletSpeedOld = bulletSpeed, //子弹移动的速度
        enemySpeedOld = enemySpeed; //敌军移动的速度
    }
    keepOld();
    //换成旧值
    function changeOld() {
      // body
      bulletTime = bulletTimeOld, //子弹发射定时器时间间隔
        enemyTime = enemyTimeOld, //敌军生成定时器时间
        rewardTime = rewardTimeOld, //奖励消失间隔
        boomTime = boomTimeOld, //爆炸效果消失的定时器时间
        bulletSpeed = bulletSpeedOld, //子弹移动的速度
        enemySpeed = enemySpeedOld; //敌军移动的速度
    }

    //创建飞机构造函数
    //属性：飞机元素，图片位置，x和y坐标，速度，存活状态
    /**
     *
     * @param {*} imgSrc  图片地址
     * @param {*} x 飞机位置x
     * @param {*} y 飞机位置y
     * @param {*} speed 飞机移动速度
     */
    class Plane {
      // body
      constructor(imgSrc, x, y, speed) {
        this.plane = document.createElement('div'); //创建飞机节点元素
        this.imgSrc = imgSrc; //图片存储位置
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
        //发射子弹方法
        this.launch = () => {
          let currentX = this.plane.offsetLeft, //飞机当前位置距离左边
            currentY = this.plane.offsetTop; //飞机当前位置距离顶部
          // console.log(currentX,currentY);
          //创建子弹实例
          let bullet = new Bullet('./images/fire.png', currentX + (planeW - bulletW) / 2, currentY, bulletSpeed);
          bullets.push(bullet);
          bullet.bulletInit();
          bullet.move();
        }
      }
      //为飞机节点初始化
      init() {
        // body
        // this.plane.src = this.imgSrc;
        this.plane.setAttribute('class', 'img');
        this.plane.style.cssText = `position:absolute;width:${planeW}px;height:${planeH}px;top:${this.y}px; left: ${this.x}px;background:url(${this.imgSrc});background-size:100% 100%;display:flex;justify-content:center;`;
        main.appendChild(this.plane); //创建的飞机添加到游戏主页面
      }
      createBullet() {
        //调用发射子弹的方法
        clearInterval(timer1);
        timer1 = setInterval(() => {
          this.launch();
        }, bulletTime);
      }
    }

    //创建敌机构造函数
    //属性：图片位置，敌军元素节点，x和y轴，速度，存活状态，血量
    /**
     *
     * @param {*} imgSrc 图片位置
     * @param {*} x x方向距离
     * @param {*} y y方向距离
     * @param {*} speed 移动速度
     * @param {*} blood 血量
     *
     */
    class Enemy extends Plane {
      constructor(imgSrc, x, y, speed, blood, width, height, type) {
        super(imgSrc, x, y, speed);
        this.enemy = document.createElement('div');
        this.bloodEle = document.createElement('div');
        this.blood = blood;
        this.startBlood = blood;
        this.width = width;
        this.height = height;
        this.type = type;
        this.alive = true;
        this.stop = false; //判断英雄记和敌机碰撞时的敌机暂停状态
        this.move = () => {
          if (this.stop) {
            return
          }
          if (!this.alive) {
            //计算得分、添加爆炸效果和奖励
            let enemyTop = this.enemy.offsetTop,
              enemyLeft = this.enemy.offsetLeft;
            this.enemy.remove(); //删除节点自身
            destroyNum++;
            if (destroyNum % num1 === 0) {
              let reward = new Reward();
              reward.init();
              rewards.push(reward);
            }
            if (destroyNum % num2 === 0) {
              enemyTime = max(700, enemyTime - 5);
              createEnemy(gameType);
            }
            let boom = document.createElement('img');
            if (this.type === 'small') {
              score += smallScore;
              boom.src = './images/boom_small.png';
              boom.style.cssText = `position:absolute;width:${smallEnemyW}px;height:${smallEnemyH}px;top:${enemyTop}px; left: ${enemyLeft}px`;
            } else if (this.type === 'big') {
              score += bigScore;
              boom.src = './images/boom_big.png';
              boom.style.cssText = `position:absolute;width:${bigEnemyW}px;height:${bigEnemyH}px;top:${enemyTop}px; left: ${enemyLeft}px`;
            }
            main.appendChild(boom); //创建的爆炸效果添加到游戏主页面
            //爆炸效果消失
            setTimeout(() => {
              boom.remove();
            }, boomTime);
            scoreEle.innerText = score;
            //移除敌军数组中的爆炸敌军对象
            enemies = enemies.filter((item) => {
              return item.alive
            })
            return
          }
          this.y += this.speed;
          this.enemy.style.top = this.y + 'px';
          //检测敌机是否与英雄机碰撞
          if (crash(plane.plane, this.enemy)) {
            planeMove = false;
            plane.plane.alive = false;
            this.alive = false;
            // 暂停所有的敌机和子弹的运动和产生
            clearInterval(timer1);
            clearInterval(timer2);
            bullets.forEach(item => {
              item.stop = true;
            })
            enemies.forEach(item => {
              item.stop = true;
            })
            //显示游戏结束画面
            showGameOver();
          }
          //检测敌机是否与子弹碰撞
          bullets.forEach(ele => {
            // console.log(ele);
            if (crash(ele.bullet, this.enemy)) {
              ele.alive = false;
              //血量
              this.blood--;
              this.bloodEle.innerHTML = `<div style="position:absolute;top:0;left:0;background:red;width:${this.blood/this.startBlood*100}%;height:100%;"></div>`
              if (this.blood === 0) {
                this.alive = false;
              }
            }
          });
          if (this.y > MH) this.alive = false;
          window.requestAnimationFrame(this.move)
        }
      }
      enemyInit() {
        // this.enemy.src = this.imgSrc;
        this.enemy.setAttribute('class', 'img');
        this.enemy.style.cssText = `position:absolute;width:${this.width}px;height:${this.height}px;top:${this.y}px; left: ${this.x}px;background:url(${this.imgSrc});background-size:100% 100%;display:flex;justify-content:center;`;
        main.appendChild(this.enemy); //创建的飞机添加到游戏主页面
        //创建血条
        this.bloodEle.style.cssText = `position:absolute;top:-5px;border: 1px solid red;width:${this.width}px;
            height:2px;border-radius: 5px;`;
        this.bloodEle.innerHTML = `<div style="top:0;left:0;background:red;width:100%;height:100%;"></div>`;
        this.enemy.appendChild(this.bloodEle);
      }
    }


    //创建子弹构造函数
    // 属性 子弹节点 x和y 速度  运动方法
    /**
     *@imgSrc
     *@x
     *@y
     *@speed
     */
    class Bullet extends Plane {
      constructor(imgSrc, x, y, speed) {
        super(imgSrc, x, y, speed);
        this.bullet = document.createElement('div');
        this.alive = true;
        this.stop = false;
        // 子弹移动
        this.move = () => {
          if (this.stop) {
            return
          }
          if (!this.alive) {
            this.bullet.remove(); //删除节点自身
            bullets = bullets.filter((item) => {
              return item.alive
            })
            // console.log(bullets.length);
            return
          }
          this.y -= this.speed;
          this.bullet.style.top = this.y + 'px';
          if (this.y < 0) {
            this.alive = false;
          }
          window.requestAnimationFrame(this.move);
        }
      }
      //子弹初始化
      bulletInit() {
        // this.bullet.src = this.imgSrc;
        this.bullet.setAttribute('class', 'img');
        this.bullet.style.cssText = `position:absolute;top:${this.y}px;left:${this.x}px;width:30px;height:30px;background:url(${this.imgSrc});background-size:100% 100%;display:flex;justify-content:center;`;
        main.appendChild(this.bullet);
      }
    }


    //创建奖励的构造函数
    class Reward {
      constructor() {
        this.reward = document.createElement('div');
        this.alive = true;
      }
      init() {
        this.reward.setAttribute('class', 'img');
        this.reward.style.cssText = `position:absolute;width:${rewardW}px;height:${rewardH}px;top:${random()*(MH-rewardH)}px; left: ${random()*(MW-rewardW)}px;background:url(${rewardSrc});background-size:100% 100%;display:flex;justify-content:center;`;
        main.appendChild(this.reward);
        setTimeout(() => {
          if (this.reward) {
            this.alive = false;
            this.reward.remove();
          }
        }, rewardTime);
      }
    }

    //监听点击游戏选项
    level.addEventListener('click', function (e = window.event) {
      // console.log(e.target.id);
      gameType = e.target.id;
      menu.style.display = 'none';
      main.style.display = 'block';
      changeBgImage(gameType); //切换背景图片
      gameStart(gameType);
    })

    //切换背景图片
    function changeBgImage(level) {
      bgImgs.forEach((ele, index, arr) => {
        // console.log(ele);
        ele.setAttribute('src', `./images/${level}.jpg`)
      })
    }

    //开始游戏
    function gameStart(level) {
      // body

      //创建敌机实例
      createEnemy(level);

      //创建飞机实例
      plane = new Plane('./images/plane_0.png', (MW - planeW) / 2, MH - planeH);
      plane.init();
      plane.createBullet();

      //监听飞机移动
      plane.plane.addEventListener('touchstart', function (e = window.event) {
        // console.log(e);
        let topH = this.offsetTop //当前英雄战机到定位父级顶部的距离
        let leftW = this.offsetLeft //当前英雄战机到定位腹肌左边的距离
        let clientX = e.targetTouches[0].clientX //当前鼠标点击时的位置
        let clientY = e.targetTouches[0].clientY
        this.addEventListener('touchmove', function add(e = window.event) {
          // body
          // e.preventDefault();
          //碰撞的奖励后加速
          rewards.filter(item => {
            return item.alive
          }).forEach(ele => {
            if (crash(ele.reward, this)) {
              ele.alive = false;
              ele.reward.remove();
              // console.log(bulletSpeed,bulletTime);
              bulletSpeed += 0.1;
              bulletTime = max(500, bulletTime - 5);
              plane.createBullet();
              // console.log(bulletSpeed,bulletTime);
            }
          })
          //英雄机不允许移动后取消监听
          if (!planeMove) {
            this.removeEventListener('touchmove', add)
          }
          let changeX = e.targetTouches[0].clientX - clientX;
          let changeY = e.targetTouches[0].clientY - clientY;
          let moveX = leftW + changeX;
          let moveY = topH + changeY;
          moveX = min(MW - planeW, moveX);
          moveX = max(0, moveX);
          moveY = min(MH - planeH, moveY);
          moveY = max(0, moveY);
          this.style.top = moveY + "px";
          this.style.left = moveX + "px";
        })
      })
    }

    //创建敌机实例
    function createEnemy(level) {
      // body
      //创建敌军实例
      clearInterval(timer2);
      switch (level) {
        case 'easy':
          timer2 = setInterval(() => {
            let enemy;
            if (random() <= 0.1) {
              enemy = new Enemy('./images/enemy_big.png', random() * (MW - bigEnemyW), -bigEnemyH, enemySpeed, 3, bigEnemyW, bigEnemyH, 'big');
            } else {
              enemy = new Enemy('./images/enemy_small.png', random() * (MW - smallEnemyW), -smallEnemyH, enemySpeed, 1, smallEnemyW, smallEnemyH, 'small');
            }
            enemies.push(enemy);
            enemy.enemyInit();
            enemy.move();
          }, enemyTime);
          break;

        case 'medium':
          timer2 = setInterval(() => {
            let enemy;
            if (random() <= 0.2) {
              enemy = new Enemy('./images/enemy_big.png', random() * (MW - bigEnemyW), -bigEnemyH, enemySpeed, 3, bigEnemyW, bigEnemyH, 'big');
            } else {
              enemy = new Enemy('./images/enemy_small.png', random() * (MW - smallEnemyW), -smallEnemyH, enemySpeed, 1, smallEnemyW, smallEnemyH, 'small');
            }
            enemies.push(enemy);
            enemy.enemyInit();
            enemy.move();
          }, enemyTime);
          break;

        case 'hard':
          timer2 = setInterval(() => {
            let enemy;
            if (random() <= 0.35) {
              enemy = new Enemy('./images/enemy_big.png', random() * (MW - bigEnemyW), -bigEnemyH, enemySpeed, 3, bigEnemyW, bigEnemyH, 'big');
            } else {
              enemy = new Enemy('./images/enemy_small.png', random() * (MW - smallEnemyW), -smallEnemyH, enemySpeed, 2, smallEnemyW, smallEnemyH, 'small');
            }
            enemies.push(enemy);
            enemy.enemyInit();
            enemy.move();
          }, enemyTime);
          break;

        case 'bt':
          timer2 = setInterval(() => {
            let enemy;
            if (random() <= 0.5) {
              enemy = new Enemy('./images/enemy_big.png', random() * (MW - bigEnemyW), -bigEnemyH, enemySpeed, 5, bigEnemyW, bigEnemyH, 'big');
            } else {
              enemy = new Enemy('./images/enemy_small.png', random() * (MW - smallEnemyW), -smallEnemyH, enemySpeed, 2, smallEnemyW, smallEnemyH, 'small');
            }
            enemies.push(enemy);
            enemy.enemyInit();
            enemy.move();
          }, enemyTime);
          break;

        default:
          break;
      }
    }

    //判断俩个元素是否碰撞
    function crash(ele1, ele2) {
      let ele1Top = ele1.offsetTop; //元素1到定位父级的top值
      let ele1Left = ele1.offsetLeft; //元素1到定位父级的left值
      let ele2Top = ele2.offsetTop; //元素2到定位父级的top值
      let ele2Left = ele2.offsetLeft; //元素2到定位父级的left值
      let ele1W = parseFloat(getStyle(ele1).width);   //宽度
      let ele1H = parseFloat(getStyle(ele1).height);    //高度
      let ele2W = parseFloat(getStyle(ele2).width);   //宽度
      let ele2H = parseFloat(getStyle(ele2).height);    //高度
      // if (ele2Top >= (ele1Top - ele2H) && ele2Top <= (ele1Top + ele1H) && ele2Left >= (ele1Left - ele2W) &&
      //   ele2Left <= (ele1Left + ele1W)) {
      //   return true //碰撞
      // } else {
      //   return false //没有碰撞
      // }
      return  ele2Top >= (ele1Top - ele2H) && ele2Top <= (ele1Top + ele1H) && ele2Left >= (ele1Left - ele2W) &&ele2Left <= (ele1Left + ele1W)
    }

    //显示游戏结束画面
    function showGameOver() {
      gameOver.style.display = 'flex';
      overScore.innerText = score;
      back.onclick = function () {
        clear();
        main.style.display = 'none';
        menu.style.display = 'block';
      }
      again.onclick = function () {
        clear();
        gameStart(gameType);
      }
    }

    //画面元素清空,子弹和敌军数组清空
    function clear() {
      // body
      changeOld();
      planeMove = true;
      // 子弹和敌军、奖励数组清空
      bullets = [];
      enemies = [];
      rewards = [];
      //画面元素清空
      aImg = document.querySelectorAll('#main .img');
      aImg.forEach(ele => {
        ele.remove();
      })
      scoreEle.innerText = '00';
      gameOver.style.display = 'none';
    }

    //兼容获取样式方法(得到的后面有px)
    function getStyle(ele) {
      return ele.currentStyle || getComputedStyle(ele);
    }

    //阻止页面滑动
    (function stop() {
      document.body.style.overflow = 'hidden';
      document.addEventListener("touchmove", function (e) {
        e.preventDefault();
      }, {
        passive: false
      }); //禁止页面滑动
    })()
  }

  main();
}