/**
 * 生成二维码
 * @param DOM 替换的DOM ID值 无#号
 * @param logoSrc 中间Logo的链接
 * @param url  我们要生成二维码的链接
 * @param callback 回调函数
 */
function makeErCode(DOM, logoSrc, url,callback){
    let wid = Math.floor(document.documentElement.clientWidth / 4.8 ); // 安卓bug  无法正常进行缩放 按照视口比例进行二维码缩放
    new QRCode(DOM, {
        text:url ,
        width: wid,
        height: wid,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    // 添加Logo
    let logo = document.createElement('img')
    logo.src = logoSrc;
    logo.style.display = 'block';
    logo.style.position = 'absolute';
    logo.style.left = '41%';
    logo.style.top = '41%';
    logo.style.width = '18%';
    let outer = document.getElementById(DOM);
    outer.appendChild(logo);
    outer.childNodes[1].style.width = '100%';
    outer.style.display = 'inline-block';
    if(callback){
        setTimeout(function(){
            callback();
        },0);
    }
}

window.onload = function(){
    makeErCode('erCode','./good.png', 'https://www.cnblogs.com/1wen/p/5421212.html',function(){
        saveImg('.bg','hhh') 
    })
}


function supportCanvas(){
    return !!document.createElement('canvas').getContext;
}

// 检测图片是否已经生成
function noCanvas(dom){
    var canScreenshot = true;
    dom.childNodes.forEach(node => {
        if(node.classList && node.classList.contains('screenshot')){
            canScreenshot = false;
            return;
        }
    });
    return canScreenshot;
}

/**
 * 保存我们的截图
 * @param DOM 想要截图的范围 有#号
 * @param fileName 截图保存的名字
 */
function saveImg(DOM, fileName){
    // 想要保存的图片节点
    const dom = document.querySelector(DOM);

    if(!noCanvas(dom)){
        return;
    }else{
        if(supportCanvas()){
            // 创建一个新的canvas
            const Canvas = document.createElement('canvas');
            const scale = window.devicePixelRatio ;  // 设备的devicePixelRatio
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
                backgroundColor:null
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
                img.style.opacity = 0;
                img.style.width = $(DOM).width() + 'px';
                img.style.zIndex = 10000;
                img.classList.add('screenshot');
                $(DOM).append(img);
                $(DOM).longPress(()=>{
                    Canvas2Image.saveAsPNG(canvas, canvas.width , canvas.height ,fileName);
                });

            });
        }else{
            $(DOM).longPress(()=>{
                alert('你的浏览器暂时不支持长按保存截图');
            })
        }
    }
}

// 长按保存
$.fn.longPress = function (fn) {
    let timeout = 0;
    const $this = this;
    for (let i = 0; i < $this.length; i++) {
        $this[i].addEventListener('touchstart', () => {
            timeout = setTimeout(fn, 1500);
        }, false);
        $this[i].addEventListener('touchend', () => {
            clearTimeout(timeout);
        }, false);
    }
};