/**
 * 滚屏函数
 * @param data Array 函数内部显示的数据
 * @param options containerClass 包裹元素的类名
 *                itemClass 内部滚动元素的类名
 *                inner 内部滚动元素渲染函数
 *                scrollNum 每次滚动的条数
 *                scrollGap 滚动的间距
 * @return null
 */
let data = ["sssss", "fhisfoshfoas", "sgdsfg"];
let data1 = [
  {
    now: "ss",
  },
  {
    now: "dd",
  },
];
function noticeScroll(data, options) {
  // 闭包，避免别人获取我们的值
  return (function (data, options) {
    let defaultValue = {
      containerClass: "scrollOuter",
      itemClass: "scrollItem",
      inner: function (data) {
        return data;
      },
      scrollNum: 1,
      scrollGap: 1500,
    };

    var _scroll = function () {
      this.options = Object.assign({}, defaultValue, options);
      this.data = data;

      // 边界条件
      // 1 传入了空数组
      if (this.data.length === 0) {
        return;
      }
      // 2 传入的值小于我们设定的滚动条数
      if (this.data.length < this.options.scrollNum) {
        console.log("导入数据未达到每次滚动的条数");
        return;
      }

      // 处理逻辑
      this.init().addData().scrollStyle().move();

      // 监听页面宽度是否变化
      var that = this;
      window.addEventListener("resize", function () {
        that.scrollStyle();
      });
    };

    _scroll.prototype = {
      constructor: _scroll,
      init: function () {
        /* 获取元素 */
        this.scrollOuter = document.querySelector(
          "." + this.options.containerClass
        );
        // Error 找不到最外层元素
        if (!this.scrollOuter) {
          console.log("未在页面写入最外层元素");
          return;
        }
        this.scrollInner = document.createElement("div");
        this.scrollOuter.appendChild(this.scrollInner);

        return this;
      },
      maxWid: function () {
        let maxWid = 0;
        for (let i = 0; i < this.data.length; i++) {
          if (maxWid < this.scrollInner.children[i].offsetWidth) {
            maxWid = this.scrollInner.children[i].offsetWidth;
          }
        }
        return maxWid;
      },
      addData: function () {
        for (let i = 0; i < this.data.length; i++) {
          let oDiv = document.createElement("div");
          oDiv.classList.add(this.options.itemClass);
          // Error 4 数据过长 自动过滤
          oDiv.style.overflow = "hidden";
          oDiv.style.textOverflow = "ellipsis";
          oDiv.style.whiteSpace = "nowrap";
          oDiv.innerHTML = this.options.inner(this.data[i]);
          this.scrollInner.appendChild(oDiv);
        }

        return this;
      },
      scrollStyle: function () {
        // 如果是移动端转换各个传入值
        this.options.height = this.scrollInner.children[0].offsetHeight;
        /* 公告栏样式 */
        this.scrollOuter.style.height =
          this.options.height * this.options.scrollNum + "px";
        this.scrollOuter.style.width = this.maxWid() + "px";
        this.scrollOuter.style.overflow = "hidden";
        this.scrollOuter.style.display = "inline-block";
        return this;
      },
      move: function () {
        var that = this;
        function moveItem() {
          /* 动起来 */
          that.scrollInner.style.transition = "all 1s";
          that.scrollInner.style.marginTop = "-" + that.options.height + "px";

          /* 移动元素 */
          setTimeout(function () {
            that.scrollInner.style.transition = "none";
            that.scrollInner.style.marginTop = 0;
            that.scrollInner.appendChild(that.scrollInner.children[0]);
            setTimeout(moveItem, that.options.scrollGap);
          }, that.options.scrollGap);
        }
        moveItem();
      },
    };

    return new _scroll();
  })(data, options);
}

window.onload = function () {
  new noticeScroll(data1, {
    inner: function (data) {
      return "<div>" + data.now + "</div>";
    },
  });
};
