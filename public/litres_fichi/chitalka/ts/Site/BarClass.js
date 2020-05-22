var doc = document;
var BarClassRe;
(function (BarClassRe) {
    var inputRange = false;
    var browser;
    function checkHTML5Support() {
        checkBrowser();
        if (browser != 'firefox' && browser != 'chrome' && browser != 'ie') {
            return;
        }
        if (!inputRange) {
            var tmpInput = doc.createElement('input');
            tmpInput.setAttribute('step', '200');
            if (tmpInput.step) {
                inputRange = true;
            }
        }
        return;
    }
    BarClassRe.checkHTML5Support = checkHTML5Support;
    function checkBrowser() {
        // TODO: make it better!
        var ua = navigator.userAgent;
        var tmp = ua.match(/Chrome\/[.0-9]*/i);
        if (tmp !== null) {
            browser = 'chrome';
            return;
        }
        tmp = ua.match(/Firefox/i);
        if (tmp !== null) {
            browser = 'firefox';
            return;
        }
        tmp = ua.match(/Edge/i);
        if (tmp !== null) {
            browser = 'edge';
            return;
        }
        tmp = ua.match(/MSIE/i);
        if (tmp !== null) {
            browser = 'ie';
            return;
        }
    }
    var BarClass = /** @class */ (function () {
        function BarClass(type, obj, pda_state, callback, spanInfo, data, dataCurrent, progressSticky, drawStickyPointState, invertData) {
            this.type = type;
            this.obj = obj;
            this.pda_state = pda_state;
            this.callback = callback;
            this.spanInfo = spanInfo;
            this.data = data;
            this.dataCurrent = dataCurrent;
            this.progressSticky = progressSticky;
            this.drawStickyPointState = drawStickyPointState;
            this.invertData = invertData;
            this.FB3Mode = false;
            this.eventType = null;
            this.barState = true;
            this.debug = false;
            this.mouseMoveState = true;
            this.progressCurrentLeft = 0;
            this.progressLeft = 0;
            this.swipeState = false;
            if (this.type == 'setting') {
                this.dataMax = this.data.length - 1;
            }
            if (aldebaran_or4) {
                inputRange = false;
            }
            if (!pda_state && inputRange && this.type == 'setting') {
                this.initHTML5range();
                this.initHTMLhandlers();
            }
            else {
                this.initObjects();
                if (this.type == 'setting') {
                    this.setValue();
                }
                this.setHandlers();
            }
        }
        BarClass.prototype.initFB3Mode = function (fragment, finishFunction) {
            if (this.type !== 'progress') {
                return;
            }
            var trackFull = this.obj.querySelector('.track-full');
            if (trackFull === null) {
                return;
            }
            this.trackFull = trackFull;
            if (typeof finishFunction === 'function') {
                this.finishFunction = finishFunction;
            }
            var track = this.obj.querySelector('.track');
            var computedStyle = getComputedStyle(track);
            var percent = fragment.fragment_length / fragment.full_length * 100;
            var trackWidth = parseFloat(computedStyle.width) * percent;
            track.style.width = percent + "%";
            this.FB3Mode = true;
        };
        BarClass.prototype.isFB3Mode = function () {
            return this.FB3Mode;
        };
        BarClass.prototype.initObjects = function () {
            this.obj = doc.querySelector(this.obj);
            if (this.type == 'setting' && this.drawStickyPointState) {
                this.drawStickyPoint();
            }
            this.progress = this.obj.querySelector('.progress');
            this.track = this.obj.querySelector('.track');
            this.dot = this.obj.querySelector('.dot');
        };
        BarClass.prototype.setHandlers = function () {
            var _this = this;
            this.obj.onclick = function (e) { return _this.barClickHandler(e); };
            if (this.pda_state) {
                this.dot.ontouchstart = function (e) { return _this.dotClickHandler(e); };
                this.dot.ontouchend = function (e) { return _this.swipeDone(e); };
            }
            else {
                this.dot.onmousedown = function (e) { return _this.dotClickHandler(e); };
                this.dot.onmouseup = function (e) { return _this.swipeDone(e); };
            }
            var left = this.obj.parentNode.querySelector('.minus');
            if (left) {
                left.onclick = function () { return _this.leftClick(); };
            }
            var right = this.obj.parentNode.querySelector('.plus');
            if (right) {
                right.onclick = function () { return _this.rightClick(); };
            }
        };
        BarClass.prototype.getPercent = function (val, min, max) {
            var p = 0;
            if (val <= min) {
                p = 0;
            }
            else if (val >= max) {
                p = 100;
            }
            else {
                p = val / (max / 100);
            }
            return p.toFixed(2);
        };
        BarClass.prototype.updateBar = function (val) {
            var x = parseFloat(this.getPercent(Math.abs(val), 0, this.track.offsetWidth));
            this.progressWidth = x;
            this.debugLog('updateBar ' + x);
            switch (this.type) {
                case "progress":
                    this.dataCurrent = x;
                    break;
                case "setting":
                    var prev = 0;
                    for (var j = 0; j <= this.dataMax; j++) {
                        var current = parseFloat(this.getPercent(j, 0, this.dataMax));
                        if (current >= x) {
                            this.dataCurrent = j;
                            if (x + (current - prev) / 2 < current) {
                                this.dataCurrent--;
                            }
                            if (this.invertData) {
                                this.invertDataCurrent();
                            }
                            break;
                        }
                        prev = current;
                    }
                    break;
            }
            this.setValue(this.progressWidth);
            this.callAction();
        };
        BarClass.prototype.setValueWithPercent = function (val) {
            this.progressWidth = val;
            this.debugLog('updateBar ' + val);
            switch (this.type) {
                case "progress":
                    this.dataCurrent = val;
                    break;
                case "setting":
                    var prev = 0;
                    for (var j = 0; j <= this.dataMax; j++) {
                        var current = parseFloat(this.getPercent(j, 0, this.dataMax));
                        if (current >= val) {
                            this.dataCurrent = j;
                            if (val + (current - prev) / 2 < current) {
                                this.dataCurrent--;
                            }
                            if (this.invertData) {
                                this.invertDataCurrent();
                            }
                            break;
                        }
                        prev = current;
                    }
                    break;
            }
            this.setValue(this.progressWidth);
            this.callAction();
        };
        BarClass.prototype.setValue = function (val) {
            switch (this.type) {
                case "progress":
                    this.updateBarWidth(val);
                    break;
                case "setting":
                    var per = "0";
                    // TODO: fix when last and first with this.progressSticky = true
                    if (!val || this.progressSticky) {
                        per = this.getPercent(this.dataCurrent, 0, this.dataMax);
                    }
                    else {
                        per = val.toString();
                    }
                    if (this.invertData && this.dataCurrent == this.dataMax && parseInt(per) == 100) {
                        per = "0";
                    }
                    if (this.spanInfo) {
                        this.obj.querySelector('span').textContent = this.data[this.dataCurrent];
                    }
                    this.updateBarWidth(per);
                    break;
            }
        };
        BarClass.prototype.toggleDisabled = function (state) {
            if (state === void 0) { state = false; }
            if (this.obj.getAttribute('disabled')) {
                this.obj.removeAttribute('disabled');
            }
            else if (!state) {
                this.obj.setAttribute('disabled', 'disabled');
            }
        };
        BarClass.prototype.getCurrentPercent = function () {
            return this.currentPercent;
        };
        BarClass.prototype.invertDataCurrent = function () {
            if (this.dataCurrent == 0) {
                this.dataCurrent = this.dataMax;
            }
            else {
                this.dataCurrent = this.dataMax - this.dataCurrent;
            }
        };
        BarClass.prototype.updateBarWidth = function (val) {
            this.currentPercent = val;
            this.progress.setAttribute('style', 'width:' + val + '%;');
            if (this.progressSticky) {
                this.updateStickyPointState();
            }
        };
        BarClass.prototype.getX = function (e) {
            if (this.pda_state) {
                return this.getXPDA(e);
            }
            else {
                return this.getXNormal(e);
            }
        };
        BarClass.prototype.getXNormal = function (e) {
            this.progressLeft = this.progress.getBoundingClientRect().left;
            this.progressCurrentLeft = e.clientX - this.progressLeft;
            this.progressCurrentLeft = this.progressCurrentLeft < 0 ? 0 : this.progressCurrentLeft;
            return this.progressCurrentLeft;
        };
        BarClass.prototype.getXPDA = function (e) {
            if (e.type == 'click') {
                return this.getXNormal(e);
            }
            var touches = e.changedTouches || e.touches;
            return this.getXNormal(touches[0]);
        };
        BarClass.prototype.barClickHandler = function (e) {
            e.stopPropagation();
            if (this.isTrackFull(e.target)) {
                this.finishFunction();
                return;
            }
            this.debugLog('barClickHandler');
            this.eventType = 'action_click';
            this.checkCurrentState();
            if (this.barState) {
                this.updateBar(this.getX(e));
            }
        };
        BarClass.prototype.isTrackFull = function (target) {
            return this.isFB3Mode() && (typeof this.finishFunction === 'function') && target === this.trackFull;
        };
        BarClass.prototype.dotClickHandler = function (e) {
            var _this = this;
            this.debugLog('dotClickHandler');
            this.eventType = 'action_start';
            this.checkCurrentState();
            if (this.barState) {
                this.dotMouseClick = true;
                if (this.mouseMoveState) {
                    if (this.pda_state) {
                        this.obj.ontouchmove = function (e) { return _this.swipeHandler(e); };
                    }
                    else {
                        this.obj.onmousemove = function (e) { return _this.swipeHandler(e); };
                    }
                }
                doc.onmouseup = function (e) { return _this.swipeDone(e, true); };
                doc.ontouchend = function (e) { return _this.swipeDone(e, true); };
            }
            e.stopPropagation();
            return false;
        };
        BarClass.prototype.swipeHandler = function (e) {
            this.debugLog('swipeHandler');
            this.eventType = 'action_move';
            this.checkCurrentState();
            if (this.barState) {
                this.swipeState = true;
                this.updateBar(this.getX(e));
            }
            e.stopPropagation();
            return false;
        };
        BarClass.prototype.swipeDone = function (e, docState) {
            this.debugLog('swipeDone');
            this.eventType = 'action_end';
            this.checkCurrentState();
            if (this.barState) {
                if (this.swipeState) {
                    this.swipeState = false;
                }
                if (this.dotMouseClick) {
                    this.dotMouseClick = false;
                    if (!docState) {
                        this.updateBar(this.getX(e));
                    }
                    else {
                        this.eventType = 'action_end_doc';
                        if (this.type == 'progress') {
                            this.callAction();
                        }
                    }
                }
                doc.onmouseup = function () { };
                doc.ontouchend = function () { };
                this.obj.ontouchmove = function () { };
                this.obj.onmousemove = function () { };
            }
            e.stopPropagation();
        };
        BarClass.prototype.leftClick = function () {
            this.checkCurrentState();
            if (!this.barState || this.dataCurrent == 0) {
                return;
            }
            this.dataCurrent--;
            this.setValue();
            this.callAction();
        };
        BarClass.prototype.rightClick = function () {
            this.checkCurrentState();
            if (!this.barState || this.dataCurrent == this.dataMax) {
                return;
            }
            this.dataCurrent++;
            this.setValue();
            this.callAction();
        };
        BarClass.prototype.callAction = function () {
            if (this.callback) {
                this.callback(this.dataCurrent, this.eventType);
            }
        };
        BarClass.prototype.drawStickyPoint = function (parent) {
            var track = parent || this.obj.querySelector('.track');
            for (var j = 0; j <= this.dataMax; j++) {
                track.innerHTML += '<span data-pos="' + j + '" style="left:' +
                    parseFloat(this.getPercent(j, 0, this.dataMax)) + '%;"></span>';
            }
            this.stickyObjs = track.querySelectorAll('span');
        };
        BarClass.prototype.updateStickyPointState = function () {
            for (var j = 0; j < this.stickyObjs.length; j++) {
                var span = this.stickyObjs[j];
                if (span.getAttribute('data-pos') <= this.dataCurrent) {
                    addClass(span, 'active');
                }
                else {
                    removeClass(span, 'active');
                }
            }
        };
        BarClass.prototype.checkCurrentState = function () {
            if (this.obj.getAttribute('disabled') == 'true') {
                this.barState = false;
            }
            else {
                this.barState = true;
            }
        };
        BarClass.prototype.debugLog = function (str) {
            if (this.debug) {
                console.log(str);
            }
        };
        BarClass.prototype.initHTML5range = function () {
            this.obj = doc.querySelector(this.obj);
            this.obj.innerHTML = this.makeHTML5input();
            this.obj = this.obj.querySelector('input');
            var box = this.obj.parentNode.parentNode;
            addClass(box, 'input-range-box');
            if (this.type == 'setting' && this.drawStickyPointState) {
                // addClass(box, 'input-range-hide-dot');
                // this.drawStickyPoint(box);
                // this.updateStickyPointState();
            }
            if (browser == 'chrome') {
                this.chromeWorkaround();
            }
        };
        BarClass.prototype.makeHTML5input = function () {
            var subclass = ' input-range-' + browser;
            return '<div class="input-range-wrap">' +
                '<input type="range" class="input-range' + subclass + '" min="0" ' +
                'max="' + (this.data.length - 1) + '" step="1" ' +
                'value="' + this.dataCurrent + '" />' +
                '</div>';
        };
        BarClass.prototype.initHTMLhandlers = function () {
            var _this = this;
            this.obj.oninput = function () { return _this.inputEventHandler(); };
            this.obj.onchange = function () { return _this.changeEventHandler(); };
            // if (this.type == 'setting' && this.drawStickyPointState) {
            // 	for (var j = 0; j < this.stickyObjs.length; j++) {
            // 		this.stickyObjs[j].onclick = (e) => this.clickStickyHandler(e);
            // 	}
            // }
        };
        BarClass.prototype.inputEventHandler = function () {
            this.debugLog('inputEventHandler');
            this.HTML5eventHandler();
        };
        BarClass.prototype.changeEventHandler = function () {
            this.debugLog('changeEventHandler');
            this.HTML5eventHandler();
        };
        BarClass.prototype.HTML5eventHandler = function () {
            this.checkHTML5currentState();
            if (!this.barState) {
                return;
            }
            if (browser == 'chrome') {
                this.chromeWorkaround();
            }
            this.dataCurrent = this.obj.value;
            if (this.type == 'setting' && this.drawStickyPointState) {
                // this.updateStickyPointState();
            }
            this.callAction();
        };
        BarClass.prototype.clickStickyHandler = function (e) {
            this.debugLog('clickStickyHandler');
            this.dataCurrent = e.target.getAttribute('data-pos');
            this.obj.value = this.dataCurrent;
            this.HTML5eventHandler();
        };
        BarClass.prototype.chromeWorkaround = function () {
            if (!inputRange || browser != 'chrome') {
                return;
            }
            var night_mod = doc.body.className.match(/night_theme/) !== null ? true : false;
            // TODO: aldebaran
            var left_color = night_mod ? '#757478' : '#ff501a';
            var right_color = night_mod ? '#fff' : '#cbcbcb';
            var val = (this.obj.value - this.obj.getAttribute('min')) /
                (this.obj.getAttribute('max') - this.obj.getAttribute('min'));
            var gradient = "background-image: -webkit-gradient(linear, left top, right top, ";
            gradient += "color-stop(" + val + ", " + left_color + "), ";
            gradient += "color-stop(" + val + ", " + right_color + ")";
            this.obj.setAttribute('style', gradient);
        };
        BarClass.prototype.checkHTML5currentState = function () {
            if (this.obj.getAttribute('disabled') == 'true') {
                this.barState = false;
            }
            else {
                this.barState = true;
            }
        };
        return BarClass;
    }());
    BarClassRe.BarClass = BarClass;
})(BarClassRe || (BarClassRe = {}));
