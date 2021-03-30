/* 工具函数 */
function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}
/* 屏幕刷新 */
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

/*  */

/* 全局变量 */
const Canvas = document.getElementById('pickPeach');
const ctx = Canvas.getContext('2d');
let Frames = 0; // 帧数
let isPlay = true;
let time = 31;
const BG = new Image();
BG.src = '/custom/img/act/act210120/pickPeachBg.jpg';
const Monkey = new Image();
Monkey.src = '/custom/img/act/act210120/people.png';
const SOUND_BG = new Audio();
SOUND_BG.src =  '';
SOUND_BG.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
const SOUND_PEACH = new Audio();
SOUND_PEACH.src = "";
const musicBtn = new Image();
musicBtn.src = '/custom/img/act/act210120/music.png';
const musicStopBtn = new Image();
musicStopBtn.src = '/custom/img/act/act210120/music_stop.png';
const timer = new Image();
timer.src = '/custom/img/act/act210120/timer.png';
const PeachPic = new Image();
PeachPic.src = '/custom/img/act/act210120/peach.png';



/* 猴子 */
const Charac = {
    x:50,
    y:600,
    w:164,
    h:238,
    draw: function(){
        ctx.drawImage(Monkey,0,0,this.w,this.h,this.x,this.y,this.w,this.h);
    },
    move: function(pos){
        this.x =  pos;
        if(this.x < 5){
            this.x = 5;
        }
        if(this.x > 550){
            this.x = 550;
        }
    }
};

/* 桃子 */
const Peach = {
    x:0,
    y:0,
    w:62,
    h:54,
    position:[],
    dy:4,
    log:[],
    animate: 0,
    draw:function () {
        for(let i=0;i<this.log.length;i++) {
            ctx.fillStyle = '#000';
            ctx.font = '30px Arial';
            ctx.fillText('+ 1',this.log[i].x,this.log[i].y);
        }
        for(let i=0;i<this.position.length;i++) {
            if(this.position[i].isLive){
                ctx.save();
                ctx.translate(this.position[i].x,this.position[i].y);
                ctx.rotate(this.position[i].rotate);
                ctx.drawImage(PeachPic,0,0,62,54,-31,-27,62,54);
                ctx.restore();
                // ctx.drawImage(PeachPic,0,0,62,54,this.position[i].x,this.position[i].y,62,54);
            }
        }
    },
    update: function () {
      if(Frames % 50 === 0){
          this.position.push({
              x: Random(100,450),
              y: 0,
              isLive: true,
              rotate: Random(-20,20) * (Math.PI / 180)
          })
      }
      for(let i=0;i<this.position.length;i++){
          this.position[i].y += this.dy;
         if(this.position[i].isLive){
             // 碰撞检测
             if(this.position[i].x < Charac.w + Charac.x && this.position[i].x + this.w > Charac.x && this.position[i].y < Charac.y + Charac.h && this.position[i].y + this.h > Charac.y){
                 this.position[i].isLive = false;
                 Score.value += 1;
                 if(isPlay){
                     SOUND_PEACH.play();
                 }
                 this.animate = 30;
                 this.log.push({
                     x: Random(100,500),
                     y: Random(600,750),
                     animate: 20
                 })
             }
             // 超出范围也删除
             if(this.position[i].y > 1250){
                 this.position.shift();
             }
         }
      }
        for(let i=0;i<this.log.length;i++) {
            if(this.log[i].animate > 0){
                this.log[i].animate --;
            }else{
                this.log.shift();
            }
        }
    },
    reset:function () {
        this.position = []
    }
};


/* 分数 */
const Score = {
    value: 0,
    draw: function(){
        ctx.fillStyle = '#62737b';
        ctx.font = '50px Arial';
        ctx.fillText(this.value, 370,170);
    },
    reset: function () {
        this.value = 0;
    }
};

/* 全局点击事件 */
Canvas.addEventListener('touchstart',function (e) {
    let x = e.touches[0].pageX;
    let y = e.touches[0].pageY;
    if(x < 90 && x >10 && y> 110 && y<190){
       isPlay = !isPlay;
       if(isPlay){
           SOUND_BG.play();
       }else{
           SOUND_BG.pause();
       }
    }

    function move(e){
        // 一根 手指 执行 目标元素移动 操作
        if (e.touches.length == 1) {
            //移动目标的 X Y 坐标
            var touchMoveX = e.targetTouches[0].pageX;
            Charac.move(touchMoveX);
        };
    }

    function out(e){
        Canvas.removeEventListener('touchmove',move,false);
        Canvas.removeEventListener('touchend',out,false);
    }

    Canvas.addEventListener('touchmove',move,false);

    Canvas.addEventListener("touchend", out,false);
},false);

/* 游戏逻辑 */
function draw(){
    /* 背景 */
    ctx.drawImage(BG,0,0,Canvas.width,Canvas.height,0,0,Canvas.width,Canvas.height);

    /* 音乐按钮 */
    if(isPlay){
        ctx.drawImage(musicBtn,0,0,61,60,20,200,61,60);
    }else{
        ctx.drawImage(musicStopBtn,0,0,61,60,20,200,61,60);
    }

    /* 倒计时 */
    ctx.drawImage(timer,0,0,98,89,20,100,98,89);
    if(Frames % 60 === 0){
        time -= 1;
    }
    ctx.fillStyle = '#fff';
    ctx.font = '60px Arial';
    if(time >=10){
        ctx.fillText(time,30,165);
    }else{
        ctx.fillText(time, 45,165);
    }

    Charac.draw();
    Peach.draw();
    Score.draw();
}

/* 游戏更新 */
function update(){
    Peach.update();
}

/* 循环 */
function loop(){
   if(time > 0){
       update();
       draw();
       Frames ++;


       window.requestAnimationFrame(loop);
   }else{
       /* 计算分数 */
       let score = Score.value;
       /* 还有几次机会 */
       let opportunity = commonData.play_opportunity;
       /* 大于20 得到20个桃子 */
       if(score > 20){
           successGame();
       }else {
           if(opportunity > 0){
               moreTime();
           }else{
               noTime();
           }
       }
       Score.reset();
       Peach.reset();
       time = 30;
   }
}
