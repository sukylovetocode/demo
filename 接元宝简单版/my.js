
    /* 工具函数 */
    function Random(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }

    /* 设立缓存canvas */
    function cache(){
        if (!this.cacheCanvas) {
            this.cacheCanvas = document.createElement("canvas");
            this.cacheCanvas.width = PickPeach.canvas.width;
            this.cacheCanvas.height = PickPeach.canvas.height;
        }
        return this.cacheCanvas;
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

    /* 全局变量 */
    const defaultValue = {
        /* 全局变量 */
        charac: Object.create(null),
        score: Object.create(null),
        /* 画布初始化 */
        canvas: Object.create(null),
        ctx: Object.create(null),
        cacheCanvas: Object.create(null),
        cacheCtx: Object.create(null),
        addTime: 0,
        gameObj: [],/* 存放游戏物体 Array */
        time: 30,/* 倒计时 */
        imgs: [], /* 游戏需要得图片 */
        music:Object.create(null),
    };
    let PickPeach = JSON.parse(JSON.stringify(defaultValue));

    /* 物品类 */
    /* 基类:GameObject */
    function GameObject(x, y, speed){
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.isLive = true;
        this.needToClear = false;
    }

    /* 小人 继承自 GameObject */
    function People(){
        this.gameObject = GameObject;
        this.gameObject(Random(20,450),650,2);
        /* 自动绑定拖动事件 */
        this.isTouch = false;
    }
    People.prototype.move = function(num){
        this.x =  num;
        if(this.x < 5){
            this.x = 5;
        }
        if(this.x > 480){
            this.x = 480;
        }
    };
    People.prototype.addTouchEvent = function(){
        PickPeach.canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();
            e.stopPropagation();
            //表示手指已按下
            this.isTouch = true;
        }, false);

        //监听 touchmove 事件 手指 移动时 做的事情
        PickPeach.canvas.addEventListener("touchmove", function (e) {
            e.preventDefault();
            e.stopPropagation();
            // 一根 手指 执行 目标元素移动 操作
            if (e.touches.length == 1 && this.isTouch) {
                //移动目标的 X Y 坐标
                var touchMoveX = e.targetTouches[0].pageX;
                PickPeach.charac.move(touchMoveX);
            };
        }, false);

        //监听 手指离开屏幕时
        PickPeach.canvas.addEventListener("touchend", function (e) {
            e.preventDefault();
            e.stopPropagation();
            //将 isTouch 修改为false  表示 手指已经离开屏幕
            if (this.isTouch) {this.isTouch = false;}
        }, false);
    };

    /*  分数 */
    function Score(){
        this.score = 0;
    }

    Score.prototype.add = function(num){
        this.score += num;
    };

    Score.prototype.getValue = function(num){
        return this.score;
    };


    /* 桃子 继承自 GameObject */
    function Peach(){
        this.gameObject = GameObject;
        this.gameObject(Random(20,450),0,2);
        this.animate = 30;
    }

    Peach.prototype.update = function(){
        /* y超过屏幕，准备清理 */
        if(this.y > 1300) {
            this.needToClear = true;
        }
        /* 被碰撞 改变生命状态 */
        if(this.isCatch() && this.isLive){
            PickPeach.music.play();
            this.isLive = false;
            PickPeach.score.add(1);
        }
        /* 根据生命状态进行绘制 */
        if(this.isLive){
            this.y += 2;
            PickPeach.cacheCtx.drawImage(PickPeach.imgs.peach,this.x,this.y,PickPeach.imgs.peach.wid,PickPeach.imgs.peach.hei);
        }else{
            if(this.animate > 0){
                PickPeach.cacheCtx.fillStyle = '#000';
                PickPeach.cacheCtx.font = '30px Arial';
                PickPeach.cacheCtx.fillText('+ 1',450,750);
            }else{
                this.needToClear = true;
            }
            this.animate --;
        }
    };

    Peach.prototype.isCatch = function(){
        return (this.x < PickPeach.imgs.people.wid + PickPeach.charac.x && this.x + PickPeach.imgs.peach.wid > PickPeach.charac.x && this.y < PickPeach.charac.y + PickPeach.imgs.people.hei && this.y + PickPeach.imgs.peach.hei > PickPeach.charac.y)
    };

    Peach.prototype.canRemove = function(){
        return this.needToClear;
    };

    /* 加载游戏资源 */
    function initResources() {
        /* 背景 */
        var resources = [{
            'name': 'bg',
            'src':  '/custom/img/act/act210120/pickPeachBg.jpg',
            'wid': 640,
            'hei': 1250
        }, {
            'name': 'peach',
            'src': '/custom/img/act/act210120/peach.png',
            'wid' : 62,
            'hei': 54
        }, {
            'name': 'people',
            'src': '/custom/img/act/act210120/people.png',
            'wid': 165,
            'hei': 243
        },{
            'name':'timer',
            'src': '/custom/img/act/act210120/timer.png',
            'wid': 98,
            'hei': 89
        }];
        var flag = 0;
        var imgTotal = resources.length;
        for(var i = 0; i< imgTotal ;i++){
            let img = new Image();
            PickPeach.imgs[resources[i].name] = img;
            img.src = resources[i].src;
            img.wid = resources[i].wid;
            img.hei = resources[i].hei;
            img.onload = function(){
                flag ++;
                if(flag === imgTotal){
                    init();
                }
            };
        }
    }

    function init(){
        /* 获取音效 */
        PickPeach.music = document.getElementById('get_music');

        /* 设置画布 */
        PickPeach.canvas = document.getElementById('pickPeach');
        PickPeach.canvas.style.width = '6.4rem';
        PickPeach.canvas.style.height = '12.5rem';
        PickPeach.ctx = PickPeach.canvas.getContext('2d');
        let wid = document.documentElement.offsetWidth;
        PickPeach.canvas.width = PickPeach.imgs.bg.wid;
        PickPeach.canvas.height = PickPeach.imgs.bg.hei;
        PickPeach.ctx.drawImage(PickPeach.imgs.bg,0,0,PickPeach.canvas.width,PickPeach.canvas.height);

        /* 复制画布 */
        PickPeach.cacheCanvas = cache();
        PickPeach.cacheCtx = PickPeach.cacheCanvas.getContext("2d");
        PickPeach.cacheCtx.drawImage(PickPeach.imgs.bg,0,0, PickPeach.canvas.width, PickPeach.canvas.height);

        /* 初始化 */
        PickPeach.charac = new People();
        PickPeach.score = new Score();
        /* 计时器 */
        PickPeach.ctx.drawImage(PickPeach.imgs.timer,10,100,PickPeach.imgs.timer.wid,PickPeach.imgs.timer.hei);
        PickPeach.ctx.fillStyle = '#fff';
        PickPeach.ctx.font = '60px Arial';
        PickPeach.ctx.fillText(PickPeach.time, 25,165);
        /* 绘制人物 */
        PickPeach.ctx.drawImage(PickPeach.imgs.people,PickPeach.charac.x,PickPeach.charac.y, PickPeach.imgs.people.wid,PickPeach.imgs.people.hei);
        /* 统计分数 */
        PickPeach.ctx.fillStyle = '#62737b';
        PickPeach.ctx.font = '50px Arial';
        PickPeach.ctx.fillText(PickPeach.score.getValue(),370,170);


        /* 添加人物点击事件*/
        PickPeach.charac.addTouchEvent();

        // 进入游戏逻辑
        //game();
    }


    /* 游戏逻辑 */
    function game(){
        if(PickPeach.time >= 0){
            PickPeach.ctx.clearRect(0,0,PickPeach.canvas.width,PickPeach.canvas.height);
            PickPeach.ctx.drawImage(PickPeach.cacheCanvas,0,0,PickPeach.canvas.width,PickPeach.canvas.height);

            PickPeach.cacheCtx.drawImage(PickPeach.imgs.bg,0,0,PickPeach.canvas.width,PickPeach.canvas.height);

            /* 生成接住的物品 */
            if(PickPeach.addTime > 60){
                /* 定时清除无用的对象*/
                PickPeach.gameObj.map((item,index) => {
                    if(item.canRemove()){
                        PickPeach.gameObj.splice(index,1);
                    }
                });
                /* 物品打开定时器，随机生成 */
                PickPeach.gameObj.push(new Peach());
                PickPeach.addTime = 0;
                PickPeach.time --;
            }
            PickPeach.addTime += 1;

            /* 计时器 */
            PickPeach.cacheCtx.drawImage(PickPeach.imgs.timer,10,100,PickPeach.imgs.timer.wid,PickPeach.imgs.timer.hei);
            PickPeach.cacheCtx.fillStyle = '#fff';
            PickPeach.cacheCtx.font = '60px Arial';
            if(PickPeach.time >= 10){
                PickPeach.cacheCtx.fillText(PickPeach.time, 25,165);
            }else{
                PickPeach.cacheCtx.fillText(PickPeach.time, 40,165);
            }

            /* 绘制人物 */
            PickPeach.cacheCtx.drawImage(PickPeach.imgs.people,PickPeach.charac.x,PickPeach.charac.y, PickPeach.imgs.people.wid,PickPeach.imgs.people.hei);

            /* 物品更新 */
            PickPeach.gameObj.map((item,index) => {
                item.update();
            });

            /* 统计分数 */
            PickPeach.cacheCtx.fillStyle = '#62737b';
            PickPeach.cacheCtx.font = '50px Arial';
            PickPeach.cacheCtx.fillText(PickPeach.score.getValue(),370,170);

            /* 更新我们的canvas */
            window.requestAnimFrame(game);
        }else{
            /* 计算分数 */
            let score = PickPeach.score.getValue();
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
            restartGame();
        }
    }

    function restartGame() {
        PickPeach = defaultValue;
        initResources();
    }


