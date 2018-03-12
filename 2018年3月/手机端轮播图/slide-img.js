/**
 *  图片轮播 电脑端手机端可共用 js自动设置图片宽度(和轮播显示区域宽度相同)
 */

function ImgFlow() {
    this.flowCount = 0;//轮播图片的数量
    this.animateTime = 1000;
    this.animateTimeGap = 3000;
    // this.slideContainerId = "";
    this.tipContainerId = "";
    this.animateDis = 0;
    //位置示意的tip的class
    this.tipClass = "";
    this.currentCount = 1;
    this.auto = false;
    this.slideInterval = 0;
}
ImgFlow.prototype = {
    constructor: ImgFlow,
    //初始化
    init: function (obj) {
        this.flowCount = obj.flowCount || 1;
        this.animateTime = obj.animateTime || 1000;
        this.slideContainerId = obj.slideContainerId || "";
        this.slideBlockSelector = obj.slideBlockSelector || "";     // 滑动的单元模块 如一个img
        this.tipContainerId = obj.tipContainerId || "";
        this.tipClass = obj.tipClass || "";
        this.tipHighLightClass = obj.tipHighLightClass || "";
        this.auto = obj.auto || false;                              // 是否开启自动轮播
        this.animateTimeGap = obj.animateTimeGap || 3000;          // 自动轮播间隔时间
        this.slideContainer = $("#" + this.slideContainerId);
        this.tipContainer = $("#" + this.tipContainerId);
        this.animateDis = this.slideContainer.parent().width() + 10; //10是微调

        this.setDots(); //初始化位置指示标志
        this.setSlidWidth();//初始化轮播元素尺寸
        this.autoSlide(); //设置自动轮播
        this.hoverStop();//设置悬停事件
        this.dots = this.tipContainer.find("span");
    },
    setDots: function () {
        for (var i = 0; i < this.flowCount; i++) {
            var spanStr = "<span class='" + this.tipClass + "'></span>";
            this.tipContainer.html(this.tipContainer.html() + spanStr);
        }
        this.tipContainer.children().eq(0).addClass(this.tipHighLightClass);
    },
    setSlidWidth: function () {
        //设置图片盛放容器宽度
        this.slideContainer.width(this.animateDis * this.flowCount);
        this.slideContainer.height(this.slideContainer.parent().height());
        //设置内部图片宽度
        $("#" + this.slideContainerId + " " + this.slideBlockSelector).width(this.animateDis);
    },
    //设置当前高亮的小红点php
    setCurrentDotLight: function (index) {

        this.dots.removeClass(this.tipHighLightClass);
        this.dots.eq(index).addClass(this.tipHighLightClass);
    },
    slideAnimateLeft: function () {
        if (this.currentCount < this.flowCount) {
            this.currentCount++;
            this.slideContainer.animate({left: "-=" + this.animateDis}, this.animateTime);
        } else {//已经是第一张滑动到第一张
            this.currentCount = 1;
            this.slideContainer.animate({left: "0"}, this.animateTime);
        }
        // console.log("index:", this.currentCount - 1);
        this.setCurrentDotLight(this.currentCount - 1);
    },
    slideAnimateRight: function () {/**
     *  移动端事件 tab longTab swipeLeft swipeRight swipeTop swipeDown
     *   //以下使用示例
     *   function swipeLeft() {
 *    $("#div3").animate({left: "-=200px"}, 2000);
 *   }
     *   MobileEvent.addHandler(".flow-img-cont img", "swipeLeft", swipeLeft);//加入名值对
     */
    var MobileEvent = (function () {
            var TAction = "",
                touchEndTime = 0,
                lastTouchEndTime = 0,
                touchStartX = 0,
                touchStartY = 0,
                touchEndX = 0,
                touchEndY = 0,
                timeout = null,
                EventHouse = null;
            /*判断事件*/
            //tab longtab 可以通过接触时间区别
            //tab doubletab 可以通过两次touchend 事件的时差区别；
            //tab 和 swipe 可以通过起点终点位置的差别大小判断;
            var htmEle = document.documentElement;
            htmEle.addEventListener("touchstart", dealTStart, false);
            htmEle.addEventListener("touchmove", dealTMove, false);
            htmEle.addEventListener("touchend", dealTEnd, false);

            //判断是什么事件
            function dealTStart(e) {
                var touches = e.touches[0];
                touchStartX = touches.clientX;
                touchStartY = touches.clientY;
                touchStartTime = Date.now();
            }

            function dealTEnd(e) {
                var touches = e.changedTouches[0];
                touchEndX = touches.clientX;
                touchEndY = touches.clientY;
                if (touchEndTime != 0) {
                    lastTouchEndTime = touchEndTime;
                }
                touchEndTime = Date.now();

                //间隔一段时间执行保证doubleTab事件可以执行，然后判断；
                clearTimeout(timeout);
                timeout = setTimeout(dealTouchAction.call(this, e), 500);
            }

            function dealTMove(e) {
                var touches = e.changedTouches[0];
                touchEndX = touches.clientX;
                touchEndY = touches.clientY;
                //tab different width longTab;
            }

            //获取事件类型并调用事件处理函数
            function dealTouchAction(e) {

                if (Math.abs(touchStartX - touchEndX) < 6 && Math.abs(touchStartY - touchEndY) < 6) {//not swip
                    if (touchEndTime - touchStartTime < 300) {//not long tab
                        if (touchEndTime - lastTouchEndTime > 500) {//not  doubleTab
                            TAction = "tab";
                        }
                    }
                    else if (touchEndTime - touchStartTime >= 300 &&
                        touchEndTime - lastTouchEndTime > 500) {
                        TAction = "longTab";
                    }
                }
                else {   //>6
                    if (Math.abs(touchStartX - touchEndX) > Math.abs(touchStartY - touchEndY)) {
                        if ((touchStartX - touchEndX) > 0) {
                            TAction = "swipeLeft";
                        }
                        else {
                            TAction = "swipeRight";
                        }
                    }
                    else {
                        if ((touchStartY - touchEndY) > 0) {
                            TAction = "swipeTop";
                        }
                        else {
                            TAction = "swipeDown";
                        }
                    }
                }
                if (Math.abs(touchStartX - touchEndX) < 45 && Math.abs(touchStartY - touchEndY) < 45) { //not swip
                    if (touchEndTime - touchStartTime < 300) {//not long tab
                        if (touchEndTime - lastTouchEndTime < 500) {//时间间隔
                            TAction = "doubletab";
                        }
                    }
                }
                // document.getElementById("div1").innerHTML = TAction;
                ///执行事件处理函数
                processEvent(e);
            }

            //事件处理
            function processEvent(e) {
                //判断元素是否执行该事件；//action由属性绑定
                var target = e.target;
                var targetId = target.id;
                EventHouse.fire({
                    event:e,
                    targetId: targetId,//处理函数
                    type: TAction//事件类型
                });
            }

            ////声明对象存储事件 以便低耦合调用；
            /*
             * {
             *   id:{ //指定事件的元素的id
             *   eventType:[] //该元素指定得事件类型处理函数
             *   }
             * }
             *
             * */
            function EventFire() {
                this.handlers = {};
                this.idSettorCount = 0;
            }

            EventFire.prototype = {
                constructor: EventTarget,
                /**
                 * @selector 支持querySelector选择符
                 * @eventType   移动端事件之一 tab longTab swipeLeft swipeRight swipeTop swipeDown
                 * @handler  事件处理函数
                 */

                addHandler: function (selector, eventType, handler) {
                    var elements = this.getElements(selector);
                    this.addHandlerToElements(elements, eventType, handler);
                },

                //只是通过id绑定事件的方法
                addHandlerOld: function (id, eventType, handler) {

                    if (typeof this.handlers[id] == "undefined") {
                        this.handlers[id] = {};
                        this.handlers[id][eventType] = [];
                    } else if (!this.handlers[id][eventType]) {
                        this.handlers[id][eventType] = [];
                    }
                    this.handlers[id][eventType].push(handler);
                },
                fire: function (event) {// event ->{target(new EventTarget)  targetId(元素id)  type(事件类型) }
                    if (!event.target) {
                        event.target = this;
                    }
                    if (typeof this.handlers[event.targetId] == "object") {
                        //console.log(event.targetId);
                        //console.log(event.type);
                        var handlers = this.handlers[event.targetId][event.type];
                        for (var i = 0; i < handlers.length; i++) {
                            //console.log('i:'+i);
                            handlers[i](event);
                        }
                    }
                },
                removeHandler: function (id, type, handler) {
                    if (typeof this.handlers[id] == "object") {
                        var handlers = this.handlers[type];
                        for (var i = 0; i < handlers.length; i++) {
                            if (handlers[i] === handler) {
                                break;
                            }
                        }
                        this.handlers.splice(i, 1);
                    }
                },
                getElements: function (selector) {
                    return document.querySelectorAll(selector);
                },
                addHandlerToElements: function (elements, eventType, handler) {
                    elements = elements || [];
                    for (var i = 0, len = elements.length; i < len; i++) {
                        this.idSettorCount++;
                        //如果元素没有id根据时间和基数构建按一个独一的id
                        var timeStr = String(Date.now());
                        var newId = "idSet".concat(timeStr.substr(timeStr.length - 4), this.idSettorCount);
                        var curElement = elements[i];
                        var id = elements[i].id;
                        if (!id) {
                            id = curElement.id = newId;
                        }

                        if (typeof this.handlers[id] == "undefined") {
                            this.handlers[id] = {};
                            this.handlers[id][eventType] = [];
                        } else if (!this.handlers[id][eventType]) {
                            this.handlers[id][eventType] = [];
                        }
                        this.handlers[id][eventType].push(handler);
                    }
                }
            };
            return EventHouse = new EventFire();
            // console.log(typeof new EventTarget());
        }());
        if (this.currentCount > 1) {
            this.currentCount--;
            this.slideContainer.animate({left: "+=" + this.animateDis}, this.animateTime);
        } else { //已经是第一张滑动到最后一张
            this.currentCount = this.flowCount;
            this.slideContainer.animate({left: -this.animateDis * (this.flowCount - 1)}, this.animateTime);
        }
        this.setCurrentDotLight(this.currentCount - 1);
    },

    //启用图片自动滑动
    autoSlide: function () {
        var _self = this;
        if (!this.auto) {
            return;
        }
        this.slideInterval = setInterval(function () {
            _self.slideAnimateLeft();
        }, this.animateTimeGap);
    },
    //手指touch时停止图片自动滑动，离开后如果没有离开页面则启用自动滑动
    hoverStop: function () {
        var _self = this;
        if (!this.auto) {
            return;
        }
        this.slideContainer[0].addEventListener("touchstart", function () {
            clearInterval(_self.slideInterval);
        });
        this.slideContainer[0].addEventListener("touchend", function () {
            _self.autoSlide();
        })
    }
};
