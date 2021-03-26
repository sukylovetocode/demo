(function(){
    function autoHeight(config){
        var defaultVal = {
            el: document.querySelectorAll('textarea')
        };
        this.config = Object.assign({}, defaultVal,config);
        this.init();
    }

    autoHeight.prototype = {
        init: function(){
            if(!this.config.el){
                return false;
            }
            for(let i=0;i<this.config.el.length;i++){
                var that = this;
                this.config.el[i].addEventListener('input',function(e){
                    that.config.el[i].style.height = 'auto';
                    that.config.el[i].style.height = that.config.el[i].scrollHeight + 'px'; 
                });
            }
        }
    }
    return new autoHeight();
})();