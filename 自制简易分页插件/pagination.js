
function Pagination(options){
    let defaultValue = {
        totalSize: 100, // 数据一共有多少条
        pageSize: 6, // 每页展示数据
        totalPage: null, // 一共有多少页
        current: 1, // 现在页数
        container: document.getElementById('wrapper'), // 容器
        clickBack:function(){ // 点击回调
            console.log(this.current)
        }
    }

    this.options = Object.assign({}, defaultValue, options)
    this.show()
    this.pageClick()
}

// 假如要自己算
Pagination.prototype.getTotalPage = function(){
    return Math.ceil( this.options.totalSize / this.options.pageSize)
}

Pagination.prototype.show = function(){
    this.options.container.innerHTML = ''
    if(!this.options.totalPage){
        this.options.totalPage = this.getTotalPage()
    }
    // 上一页
    this.createElement('pagi_item prev', '上一页')
    // 首页
    this.createElement('pagi_item first', '首页')
    // 中间的数字页
    this.createNumElement()
    // 末页
    this.createElement('pagi_item last', '末页')
    // 下一页
    this.createElement('pagi_item next', '下一页')
}

Pagination.prototype.createNumElement = function(){
    var min = this.options.current - Math.ceil(this.options.pageSize / 2)
    if(min < 1){
        min = 1
    }
    max = min + this.options.pageSize - 1;
    if(max > this.options.totalPage){
        max = this.options.totalPage
    }
    for( var i= min;i<= max;i++){
        if(this.options.current === i){
            this.createElement('pagi_item active', i)
        }else{
            this.createElement('pagi_item', i)
        }
    }
}

Pagination.prototype.createElement = function(className, content){
    var oDiv = document.createElement('div')
    oDiv.className = className
    oDiv.innerText = content
    this.options.container.appendChild(oDiv)
}

Pagination.prototype.pageClick = function(){
    // 点击事件使用捕获，绑定在父元素上
    var _this = this;
    function handler(e){ // 冒泡必须检测类名，否则点到边框会报错
        if(e.target.classList.contains('first')){
            _this.toPage(1);
        }else if(e.target.classList.contains('prev')){
            _this.toPage(_this.options.current - 1)
        }else if(e.target.classList.contains('next')){
            console.log(_this.options.current)
            _this.toPage(_this.options.current + 1)
        }else if(e.target.classList.contains('last')){
            _this.toPage(_this.options.totalPage)
        }else if(e.target.classList.contains('pagi_item')){
            // + 号是使参数能成为数字传进去
            _this.toPage(+e.target.innerText)
        }

        _this.options.clickBack()
    }
    this.options.container.addEventListener('click', handler )
}

Pagination.prototype.toPage = function(page){
    if(page < 1){
        page = 1
    }
    if(page > this.options.totalPage){
        page = this.options.totalPage;
    }
    this.options.current = page
    this.show();
}
