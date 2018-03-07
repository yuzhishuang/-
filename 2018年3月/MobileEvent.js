/**
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
    var htmEle = document.documentElement;  //  会返回文档对象（document）的根元素的只读属性（如HTML文档的 <html> 元素）。
    //var htmEle = document.body;
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

    is_mobileEvent_openPreventDefault=true; //定义一个全局变量
    function dealTMove(e) {
        var touches = e.changedTouches[0];
        touchEndX = touches.clientX;
        touchEndY = touches.clientY;
        //alert(is_mobileEvent_openPreventDefault);
        if(is_mobileEvent_openPreventDefault){
            //水平移动时禁止浏览器默认翻页事件
            var hDis = Math.abs(touchEndX - touchStartX);
            var vDis = Math.abs(touchEndY - touchStartY);
            if (hDis - vDis > 0) {
                // e.preventDefault();
                // 判断默认行为是否可以被禁用
                if (event.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!event.defaultPrevented) {
                        event.preventDefault();
                    }
                }
                // console.log("preventDefault");
            }
        }

        //tab different width longTab;
    }

    //获取事件类型并调用事件处理函数
    function dealTouchAction(e) {
        TAction = "";
        var changedX = touchStartX - touchEndX;
        var changedY = touchStartY - touchEndY;
        var duration = touchEndTime - touchStartTime;

        if (Math.abs(changedX) < 6 && Math.abs(changedY) < 6) {//not swipe
            if (duration < 300) {//not long tab
                if (touchEndTime - lastTouchEndTime > 500) {//not  doubleTab
                    TAction = "tab";
                }
            }
            else if (duration >= 300 &&
                touchEndTime - lastTouchEndTime > 500) {
                TAction = "longTab";
            }
        }
        else {   //>6
            if (duration < 400) {  //时间限制600之内
                if (Math.abs(changedX) > Math.abs(changedY)) {
                    if ((changedX) > 0) {
                        TAction = "swipeLeft";
                    }
                    else {
                        TAction = "swipeRight";
                    }
                }
                else {
                    if ((changedY) > 0) {
                        TAction = "swipeTop";
                    }
                    else {
                        TAction = "swipeDown";
                    }
                }
            }
        }
        if (Math.abs(changedX) < 45 && Math.abs(changedY) < 45) { //not swipe
            if (duration < 300) {//not long tab
                if (touchEndTime - lastTouchEndTime < 500) {//时间间隔
                    TAction = "doubletab";
                }
            }
        }

        //没有符合的事件则返回
        if (!TAction) {
            return;
        }
        // document.getElementById("div1").innerHTML = TAction;
        ///执行事件处理函数
        var target = e.target;
        var targetId = target.id;
        var EventObj = {
            event: e,
            targetId: targetId,
            type: TAction,
            duration: duration,
            xDis: changedX,
            yDis: changedY
        };
        processEvent(EventObj);
    }

    //事件处理
    function processEvent(eventObj) {
        //判断元素是否执行该事件；//action由属性绑定
        var target = eventObj.event.target;
        var targetId = target.id;
        EventHouse.fire(eventObj);//
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
        //constructor: EventTarget,  //   EventTarget 是一个由可以接收事件的对象实现的接口，并且可以为它们创建侦听器。
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
                if (!handlers) {//如果不存在相应的事件类型则返回不做处理
                    return;
                }
                for (var i = 0; i < handlers.length; i++) {
                    //console.log('i:'+i);
                    handlers[i].call(event.event.target, event.event, event); //确保处理函数内部可以引用this变量 和原生event事件对象 和 记录手机事件的tab对象
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