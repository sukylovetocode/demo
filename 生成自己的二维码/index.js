// 检测是否为IOS系统
function isIOS(){
    var u = window.navigator.userAgent; // 浏览器信息对象
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    return isiOS;
}

// 检测是否为微信浏览器
function isWeiXin(){
    var ua = window.navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
        return true;
    }else{
        return false;
    }
}

// 检测浏览器是否支持canvas
function supportCanvas(){
    return !!document.createElement('canvas').getContext;
}

function saveImg(DOM, fileName){
    // 想要保存的图片节点
    const dom = document.querySelector(DOM);

    if(supportCanvas()){
        // 创建一个新的canvas
        const Canvas = document.createElement('canvas');
        const scale = window.devicePixelRatio * 2;  // 设备的devicePixelRatio
        const width = $(DOM).width();
        const height = $(DOM).height();


        // 将Canvas画布放大scale倍，然后放在小的屏幕里，解决模糊问题
        Canvas.width = width * scale ;
        Canvas.height = height * scale ;
        Canvas.getContext('2d').scale(scale, scale);

        html2canvas(dom, {
            canvas: Canvas,
            scale,
            useCORS: true,
            logging: true,
            scrollY: 0,
            scrollX: 0,
            backgroundColor: '#983daf'
        }).then((canvas) => {
            const context = canvas.getContext('2d');
            // 关闭抗锯齿形
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
            
       
            // 替换图片
            const img = Canvas2Image.convertToPNG(canvas, canvas.width, canvas.height);
            img.style.position = 'absolute';
            img.style.left = 0;
            img.style.top = 0;
            img.style.width = $(DOM).width() + 'px';
            img.style.zIndex = 10000;
            $(DOM).append(img);
     

        });
    }else{
        $(DOM).longPress(()=>{
            alert('你的浏览器暂时不支持长按保存截图');
        })
    }  
}

window.onload = function(){
    $('.btn').click(function(){
        saveImg('.invitation');
    });
}


// 长按保存
$.fn.longPress = function (fn) {
    let timeout = 0;
    const $this = this;
    for (let i = 0; i < $this.length; i++) {
        $this[i].addEventListener('touchstart', () => {
            timeout = setTimeout(fn, 800); // 长按时间超过800ms，则执行传入的方法
        }, false);
        $this[i].addEventListener('touchend', () => {
            clearTimeout(timeout); // 长按时间少于800ms，不会执行传入的方法
        }, false);
    }
}