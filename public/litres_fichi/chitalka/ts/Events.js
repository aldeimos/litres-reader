/// <reference path="EventsHead.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var EventsModule;
(function (EventsModule) {
    var EventActions = /** @class */ (function () {
        function EventActions(ReaderBox, FooterBox, WrapperBox) {
            this.ReaderBox = ReaderBox;
            this.FooterBox = FooterBox;
            this.WrapperBox = WrapperBox;
            this.IsMouseDown = false;
            // TODO: add globas
            // something
            this.NavArrowsInited = false;
            this.PreventDoubleClick = false;
            this.PreventTimerVlaue = 500;
            this.Mask = new MaskClass(this);
            this.WindowsCarry = new WindowsCarry(this);
            this.ZoomObj = new ZoomClass(this);
            this.ChapterObj = new ChapterClass(this);
        }
        EventActions.prototype.GetEvent = function (e) {
            return e || window.event;
        };
        EventActions.prototype.checkIEOrFFBrowser = function () {
            // TODO: make it better!
            var ua = navigator.userAgent;
            var tmp = [];
            if (ua.match(/iPhone|Android|iPad/i) != null) {
                return false;
            }
            tmp = ua.match(/Firefox/i);
            if (tmp !== null) {
                return true;
            }
            tmp = ua.match(/Edge/i);
            if (tmp !== null) {
                return true;
            }
            tmp = ua.match(/MSIE/i);
            if (tmp !== null) {
                return true;
            }
            return false;
        };
        EventActions.prototype.CopyToClipboard = function (text) {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand("copy");
            }
            catch (error) {
                console.error("Unable to copy", error);
            }
            document.body.removeChild(textArea);
        };
        //подпись на событие и диспатч в подписанные методы
        EventActions.prototype.AddTouchEvent = function (element) {
            var downEvent, upEvent, moveEvent;
            var that = this;
            var el = element;
            var downEvents = ["touchstart", "mousedown"];
            var upEvents = ["touchend", "mouseup"];
            var moveEvents = ["touchmove", "mousemove"];
            if (window.navigator.pointerEnabled) {
                downEvents.push("pointerdown");
                upEvents.push("pointerup");
                moveEvents.push("pointermove");
            }
            else if (window.navigator.msPointerEnabled) {
                downEvents.push("mspointerdown");
                upEvents.push("mspointerup");
                moveEvents.push("mspointermove");
            }
            for (var i = 0; i < downEvents.length; i++) {
                if (element["on" + downEvents[i]]) {
                    return;
                }
                element["on" + downEvents[i]] = function (e) {
                    e.preventDefault();
                    callback("customTouchStart", e);
                };
                element["on" + upEvents[i]] = function (e) {
                    e.preventDefault();
                    callback("customTouchEnd", e);
                };
                element["on" + moveEvents[i]] = function (e) {
                    e.preventDefault();
                    callback("customTouchMove", e);
                };
            }
            function callback(name, e) {
                var functionName = "";
                switch (name) {
                    case "customTouchMove":
                        functionName = "boundMove";
                        break;
                    case "customTouchStart":
                        functionName = "boundDown";
                        break;
                    case "customTouchEnd":
                        functionName = "boundUp";
                        break;
                }
                var i = that.ListListeners.length;
                while (i--) {
                    if (that.ListListeners[i]) {
                        if (that.ListListeners[i][functionName]) {
                            that.ListListeners[i][functionName](e);
                        }
                    }
                }
            }
        };
        //добавление методов для определенного события
        EventActions.prototype.AddEvents = function (TouchStartFunction, TouchEndFunction, TouchMoveFunction, element, context, priority) {
            var boundDown = TouchStartFunction ? TouchStartFunction.bind(context) : null, boundUp = TouchEndFunction ? TouchEndFunction.bind(context) : null, boundMove = TouchMoveFunction ? TouchMoveFunction.bind(context) : null;
            this.AddTouchEvent(element);
            if (!this.ListListeners) {
                this.ListListeners = [];
                if (navigator.userAgent.match(/Firefox/i) != null || navigator.userAgent.match(/MSIE/i) != null || navigator.userAgent.match(/iPhone|iPad/i) != null) {
                    var head = document.getElementsByTagName('head')[0];
                    var link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    link.href = 'css/touch_ff_ie.css';
                    head.appendChild(link);
                }
            }
            var downEvent, upEvent, moveEvent;
            if (priority) {
                this.ListListeners.splice(0, 0, { element: element, context: context, boundDown: boundDown, boundUp: boundUp, boundMove: boundMove });
            }
            else {
                this.ListListeners.push({ element: element, context: context, boundDown: boundDown, boundUp: boundUp, boundMove: boundMove });
            }
        };
        //удаление методов для определенного события
        EventActions.prototype.RemoveEvents = function (element, context, down, up, move) {
            var boundUp, boundDown, boundMove;
            var currentPosition = null;
            for (var i in this.ListListeners) {
                if (this.ListListeners[i].element && this.ListListeners[i].element == element &&
                    this.ListListeners[i].context && this.ListListeners[i].context == context) {
                    if (down && !this.ListListeners[i].boundDown)
                        continue;
                    if (up && !this.ListListeners[i].boundUp)
                        continue;
                    if (move && !this.ListListeners[i].boundMove)
                        continue;
                    boundUp = this.ListListeners[i].boundUp;
                    boundDown = this.ListListeners[i].boundDown;
                    boundMove = this.ListListeners[i].boundMove;
                    this.ListListeners.splice(parseInt(i), 1);
                    break;
                }
            }
        };
        EventActions.prototype.GetCoordinates = function (e, Coords) {
            var e = this.GetEvent(e);
            var X = 0;
            var Y = 0;
            var Button = e.which || e.button || null;
            var touches = e.changedTouches || e.touches;
            if (touches && touches.length) {
                X = touches[0].clientX;
                Y = touches[0].clientY;
            }
            else {
                X = e.clientX;
                Y = e.clientY;
            }
            if (Coords && Coords.X) {
                X = Coords.X;
            }
            if (Coords && Coords.Y) {
                Y = Coords.Y;
            }
            return {
                X: X,
                Y: Y,
                Button: Button
            };
        };
        EventActions.prototype.PageForward = function () {
            var Site = this.Reader.Site, AuthorizeIFrame = Site.AuthorizeIFrame;
            var Percent = this.Reader.CurPosPercent();
            if (Site.IsAuthorizeMode() && Site.IsAlreadyClicked()) {
                if (AuthorizeIFrame.Hidden) {
                    AuthorizeIFrame.SetPercent(Percent);
                    AuthorizeIFrame.Show();
                }
            }
            else {
                this.Reader.PageForward();
            }
        };
        EventActions.prototype.PageBackward = function () {
            var Site = this.Reader.Site, AuthorizeIFrame = Site.AuthorizeIFrame;
            if (Site.AuthorizeIFrame.Hidden) {
                var Percent = this.Reader.CurPosPercent();
                this.Reader.PageBackward();
            }
        };
        EventActions.prototype.CheckFirefoxTouchEvent = function (e) {
            if (e.mozInputSource && e.mozInputSource === e.MOZ_SOURCE_TOUCH) {
                return true;
            }
            else {
                return false;
            }
        };
        EventActions.prototype.CheckIETouchEvent = function (e) {
            if (e.pointerType && e.pointerType == 'touch') {
                return true;
            }
            else {
                return false;
            }
        };
        EventActions.prototype.GoToBookmark = function (e) {
            var e = this.GetEvent(e);
            var target = (e.target || e.srcElement);
            LitresHistory.push(this.Bookmarks.Bookmarks[0].Range.From.slice(0));
            if (this.PDA.state) {
                this.WindowsCarry.HideAllWindows();
            }
            this.Reader.GoTO([parseInt(target.getAttribute('data-e'))]);
        };
        EventActions.prototype.RemoveSelection = function () {
            if (this.SelectionObj) {
                return this.SelectionObj.Remove();
            }
            return true;
        };
        EventActions.prototype.SetPreventDoubleCheck = function () {
            var _this = this;
            this.PreventDoubleClick = true;
            this.PreventDoubleClickTimer = setTimeout(function () { _this.PreventDoubleClick = false; }, this.PreventTimerVlaue);
        };
        EventActions.prototype.CheckDoubleClick = function () {
            return this.PreventDoubleClick;
        };
        EventActions.prototype.SkipOnElement = function (e) {
            var e = this.GetEvent(e);
            var target = (e.target || e.srcElement);
            if (target.className.match(/zoom_block/i) || target.tagName.match(/^a$/i)
                || target.parentElement.tagName.match(/^a$/i))
                return true;
            return false;
        };
        EventActions.prototype.Resize = function () {
            calcHeight();
            this.AddNavArrows();
        };
        EventActions.prototype.Refresh = function () {
            this.Reader.RedrawVisible();
        };
        EventActions.prototype.CheckProgressBar = function () {
            return progressBar.swipeState;
        };
        EventActions.prototype.GetTitleFromTOC = function (Range, TOC) {
            var TOC = TOC || this.Reader.TOC();
            for (var j = 0; j < TOC.length; j++) {
                var row = TOC[j];
                var xps = FB3Reader.PosCompare(Range.From, [row.s]);
                var xpe = FB3Reader.PosCompare(Range.To, [row.e]);
                if (xps >= 0 && xpe <= 1) {
                    var title = row.t;
                    if (row.c) {
                        var childTitle = this.GetTitleFromTOC(Range, row.c);
                        if (childTitle) {
                            title = childTitle;
                        }
                    }
                    if (title === undefined) {
                        return undefined;
                    }
                    return this.PrepareTitle(title);
                }
            }
        };
        EventActions.prototype.PrepareTitle = function (str) {
            return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;')
                .replace(/\[\d+\]|\{\d+\}/g, '');
        };
        EventActions.prototype.StopPropagation = function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.cancelBubble = true;
            return false;
        };
        EventActions.prototype.GetCurrentBox = function () {
            return this.WrapperBox;
        };
        EventActions.prototype.GetElement = function (Obj, Looking) {
            // TODO: add counter, return current when X
            if (Obj.tagName.toLowerCase() != Looking) {
                return this.GetElement(Obj.parentNode, Looking);
            }
            return Obj;
        };
        EventActions.prototype.AddNavArrows = function () {
            var arrowsBox = doc.querySelector('.bottom-arrows');
            if ((!this.PDA.state && !LitresFullScreen.fullScreen) ||
                aldebaran_or4 ||
                (this.PDA.state && this.PDA.form == 'tablet' && !LitresFullScreen.fullScreen)) {
                if (!this.NavArrowsInited && aldebaran_or4) {
                    setSetting(1, 'enableClick');
                }
                var forward = doc.querySelector('.bottom-right');
                arrowsBox.style.display = 'block';
                arrowsBox.style.top = Math.floor(this.GetCurrentBox().offsetHeight / 2 - forward.offsetHeight / 2) + 'px';
                forward.style.left = (this.GetCurrentBox().offsetWidth - forward.offsetWidth) + 'px';
                if (!this.NavArrowsInited) {
                    forward.addEventListener("click", this.PageForward.bind(this), false);
                    doc.querySelector('.bottom-left')
                        .addEventListener("click", this.PageBackward.bind(this), false);
                }
                this.NavArrowsInited = true;
            }
            else {
                arrowsBox.style.display = 'none';
            }
        };
        return EventActions;
    }());
    EventsModule.EventActions = EventActions;
    var KeydownClass = /** @class */ (function () {
        function KeydownClass(Owner) {
            var _this = this;
            this.Owner = Owner;
            this.KeysRules = {
                PageForward: {
                    keys: {
                        32: 'space',
                        39: 'arrow ->',
                        40: 'arrow down',
                        34: 'PgDn'
                    },
                    action: function () { return _this.Owner.PageForward(); }
                },
                PageBackward: {
                    keys: {
                        37: 'arrow <-',
                        38: 'arrow up',
                        33: 'PgUp'
                    },
                    action: function () { return _this.Owner.PageBackward(); }
                },
                CopyToClipboard: {
                    keys: {
                        67: 'C',
                        88: 'X'
                    },
                    action: function (e) {
                        if (e.ctrlKey) {
                            _this.Owner.CopyToClipboard(_this.Owner.SelectionObj.GetSelectedText());
                        }
                    }
                }
            };
            document.addEventListener('keydown', function (e) { return _this.OnKeydown(e); }, false);
        }
        KeydownClass.prototype.OnKeydown = function (e) {
            var e = this.Owner.GetEvent(e);
            var target = (e.target || e.srcElement);
            if (target.localName.toLowerCase() == 'textarea') {
                // skip any rules for textarea
                return;
            }
            if (!e.ctrlKey) {
                this.Owner.WindowsCarry.HideAllWindows();
            }
            for (var index in this.KeysRules) {
                if (this.KeysRules[index].keys[e.keyCode]) {
                    this.KeysRules[index].action(e);
                    break;
                }
            }
        };
        return KeydownClass;
    }());
    EventsModule.KeydownClass = KeydownClass;
    var MouseClickEvents = /** @class */ (function () {
        function MouseClickEvents(Owner) {
            this.MousePosStartX = 0;
            this.MousePosEndX = 0;
            this.MousePosStartY = 0;
            this.MousePosEndY = 0;
            this.OneTouch = false;
            this.GestureTID = 0;
            this.Swipe = true;
            this.SwipeTimerValue = 300;
            this.Debug = false;
            this.DateStart = Date.now();
            this.Owner = Owner;
            this.AddHandlers();
        }
        MouseClickEvents.prototype.AddHandlers = function () {
            var _this = this;
            this.Owner.AddEvents(this.OnTouchStart, this.OnTouchEnd, null, this.Owner.GetCurrentBox(), this);
            this.Owner.AddEvents(function () {
                _this.Owner.IsMouseDown = true;
            }, function () {
                _this.Owner.IsMouseDown = false;
            }, null, this.Owner.GetCurrentBox(), this);
            if ('ontouchstart' in document.documentElement) {
                this.Owner.GetCurrentBox().addEventListener('gestureend', function (e) { return _this.onGuesture(e); }, false);
                this.Owner.GetCurrentBox().addEventListener('gesturestart', function (e) { return _this.onGuestureStart(e); }, false);
                this.Owner.GetCurrentBox().addEventListener('gesturechange', function (e) { return _this.onGuestureChange(e); }, false);
            }
        };
        MouseClickEvents.prototype.MouseTouchStart = function (Event) {
            this.TouchStart(Event.clientX, Event.clientY);
        };
        MouseClickEvents.prototype.MouseTouchEnd = function (Event) {
            if (Date.now() - this.DateStart > this.SwipeTimerValue)
                return;
            this.MousePosEndX = Event.clientX;
            this.MousePosEndY = Event.clientY;
            this.AltClick(Event);
        };
        MouseClickEvents.prototype.TouchStart = function (x, y) {
            this.DebugLog("TouchStart");
            this.DateStart = Date.now();
            this.MousePosStartX = x;
            this.MousePosStartY = y;
        };
        MouseClickEvents.prototype.RemoveHandlers = function () {
            /*this.Owner.GetCurrentBox().onclick = function () {};
            (<any> this.Owner.GetCurrentBox()).ontouchend = function () {};
            (<any> this.Owner.GetCurrentBox()).ontouchstart = function () {};
            (<any> this.Owner.GetCurrentBox()).onmousedown = function () {};
            (<any> this.Owner.GetCurrentBox()).onmouseup = function () {};			*/
            this.Owner.RemoveEvents(this.Owner.WrapperBox, this);
        };
        MouseClickEvents.prototype.AltClick = function (e) {
            if (!ContextObj.ShowState && (this.Owner.CheckFirefoxTouchEvent(e) || this.Owner.CheckIETouchEvent(e))) {
                this.OnClickHandler(e, 'touch');
            }
        };
        MouseClickEvents.prototype.OnTouchEnd = function (e) {
            this.DebugLog("Touchend");
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches && this.Owner.PDA.state)
                return;
            if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar())
                return;
            if (this.DateStart != 0 && Date.now() - this.DateStart > this.SwipeTimerValue)
                return;
            this.DateStart = 0;
            if (!ContextObj.ShowState && this.OneTouch) {
                var coord = this.Owner.GetCoordinates(e);
                this.MousePosEndX = coord.X;
                this.MousePosEndY = coord.Y;
                if (e.touches) {
                    this.OnTouchHandler(e, 'touch');
                }
                else {
                    this.OnClickHandler(e, 'click');
                }
            }
        };
        MouseClickEvents.prototype.OnTouchStart = function (e) {
            this.DebugLog("Touchstart");
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches && this.Owner.PDA.state)
                return;
            if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar() || e.button === 2)
                return;
            var coord = this.Owner.GetCoordinates(e);
            this.TouchStart(coord.X, coord.Y);
            this.OneTouch = true;
        };
        MouseClickEvents.prototype.onHideElements = function (e, type) {
            if (type === void 0) { type = 'click'; }
            throw "error: empty method";
        };
        MouseClickEvents.prototype.OnClickHandler = function (e, type) {
            if (type === void 0) { type = 'click'; }
            throw "error: empty method";
        };
        MouseClickEvents.prototype.OnTouchHandler = function (e, type) {
            if (type === void 0) { type = 'click'; }
            throw "error: empty method";
        };
        MouseClickEvents.prototype.onGuestureStart = function (event) {
            //event.preventDefault();
        };
        MouseClickEvents.prototype.onGuestureChange = function (event) {
            //event.preventDefault();
            this.onGestureDo(this.getScale(event.scale));
        };
        MouseClickEvents.prototype.getScale = function (scaleMobile) {
            var scale = 0;
            if (scaleMobile > 1) {
                scale = 10 / scaleMobile;
            }
            else {
                scale = scaleMobile;
            }
            return scale;
        };
        MouseClickEvents.prototype.onGuesture = function (event) {
            if (this.GestureTID) {
                return;
            }
            this.GestureTID = setTimeout(this.onGestureDo.bind(this, this.getScale(event.scale)), 250);
            //event.preventDefault();
        };
        MouseClickEvents.prototype.onGestureDo = function (scale) {
            this.GestureTID = 0;
        };
        MouseClickEvents.prototype.DebugLog = function (msg) {
            if (this.Debug) {
                //console.log('[MouseClick] ' + msg);
            }
        };
        return MouseClickEvents;
    }());
    EventsModule.MouseClickEvents = MouseClickEvents;
    var MouseClickClass = /** @class */ (function (_super) {
        __extends(MouseClickClass, _super);
        function MouseClickClass(Owner) {
            var _this = _super.call(this, Owner) || this;
            _this.Owner = Owner;
            _this.Debugs = false;
            return _this;
        }
        MouseClickClass.prototype.AddHandlers = function () {
            _super.prototype.AddHandlers.call(this);
        };
        MouseClickClass.prototype.onHideElements = function (e, type) {
            if (type === void 0) { type = 'click'; }
            if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar())
                return;
            if (!this.Owner.CheckDoubleClick() && this.Owner.RemoveSelection()) {
                if (!this.Owner.PDA.state && type == 'click' && !getSetting('enableClick')) {
                    return;
                }
                this.Owner.WindowsCarry.HideAllWindows();
            }
        };
        MouseClickClass.prototype.OnClickHandler = function (e, type) {
            if (type === void 0) { type = 'click'; }
            //We are scrolling the page using tap
            if (Math.abs(this.MousePosStartX - this.MousePosEndX) > 10 ||
                Math.abs(this.MousePosStartX - this.MousePosEndX) < Math.abs(this.MousePosStartY - this.MousePosEndY)) {
                return;
            }
            if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar())
                return;
            if (!this.Owner.CheckDoubleClick() && this.Owner.RemoveSelection()) {
                this.Owner.SetPreventDoubleCheck();
                var Coords = this.Owner.GetCoordinates(e);
                if (getSetting('enableClick')) {
                    var area_width = Math.floor(this.Owner.GetCurrentBox().offsetWidth / 3);
                    if (Coords.X > area_width * 2) {
                        this.Owner.PageForward();
                    }
                    else if (Coords.X < area_width) {
                        this.Owner.PageBackward();
                    }
                }
                this.Owner.WindowsCarry.HideAllWindows();
            }
        };
        MouseClickClass.prototype.OnTouchHandler = function (e, type) {
            if (type === void 0) { type = 'click'; }
            // Если это не свайп, а просто тап, то показываем/скрываем меню или же листаем (в зависимости от зоны нажатия)
            if (Math.abs(this.MousePosStartX - this.MousePosEndX) < 10 ||
                Math.abs(this.MousePosStartX - this.MousePosEndX) < Math.abs(this.MousePosStartY - this.MousePosEndY)) {
                var area_width = Math.floor(this.Owner.GetCurrentBox().offsetWidth / 3);
                var Coords = this.Owner.GetCoordinates(e);
                // если тап был по середине экрана или же при тапе была открыта менюшка - убираем менюшку
                if ((LitresFullScreen.fullScreen === false) || ((Coords.X >= area_width) && (Coords.X <= area_width * 2))) {
                    LitresFullScreen.showHiddenElements();
                }
                else if (Coords.X > area_width * 2) {
                    this.Owner.PageForward();
                }
                else if (Coords.X < area_width) {
                    this.Owner.PageBackward();
                }
                return;
            }
            if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar())
                return;
            var delta = this.MousePosEndX - this.MousePosStartX;
            this.DebugLogs("delta:" + delta);
            if (LitresFullScreen.fullScreen === false) {
                LitresFullScreen.showHiddenElements();
            }
            if (delta < 0) {
                this.DebugLogs("pageforward");
                this.Owner.PageForward();
            }
            else {
                this.DebugLogs("pagebackward");
                this.Owner.PageBackward();
            }
        };
        MouseClickClass.prototype.DebugLogs = function (msg) {
            if (this.Debugs) {
                console.log('[TouchClass] ' + msg);
            }
        };
        return MouseClickClass;
    }(MouseClickEvents));
    EventsModule.MouseClickClass = MouseClickClass;
    var TouchClass = /** @class */ (function (_super) {
        __extends(TouchClass, _super);
        function TouchClass(Owner, fontsizeBar) {
            var _this = _super.call(this, Owner) || this;
            _this.Owner = Owner;
            _this.fontsizeBar = fontsizeBar;
            _this.Debugs = false;
            return _this;
        }
        TouchClass.prototype.onGestureDo = function (scale) {
            if (this.fontsizeBar) {
                this.fontsizeBar.setValueWithPercent(scale * this.fontsizeBar.getCurrentPercent());
            }
            _super.prototype.onGestureDo.call(this, scale);
        };
        TouchClass.prototype.DebugLogs = function (msg) {
            if (this.Debugs) {
                console.log('[TouchClass] ' + msg);
            }
        };
        return TouchClass;
    }(MouseClickEvents));
    EventsModule.TouchClass = TouchClass;
    var MouseWheelClass = /** @class */ (function () {
        function MouseWheelClass(Owner) {
            var _this = this;
            this.Owner = Owner;
            this.Debug = false;
            this.Owner.GetCurrentBox().addEventListener("mousewheel", function (e) { return _this.MouseWheel(e); }, false);
            this.Owner.GetCurrentBox().addEventListener("wheel", function (e) { return _this.MouseWheel(e); }, false);
        }
        MouseWheelClass.prototype.MouseWheel = function (e) {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            var e = this.Owner.GetEvent(e);
            this.CheckNotesState(e);
            if (this.NotesState) {
                this.NotesState = false;
                this.DebugLog('notes scroll');
            }
            else {
                this.DebugLog('canvas scroll ' + this.Owner.CheckDoubleClick());
                if (!this.Owner.CheckDoubleClick()) {
                    // TODO: fix touchpad imac problem
                    this.Owner.SetPreventDoubleCheck();
                    var delta = -e.deltaY || e.detail || e.wheelDelta;
                    if (isNaN(delta)) {
                        delta = e.detail;
                    }
                    this.DebugLog('delta ' + delta);
                    if (delta < 0) {
                        this.Owner.PageForward();
                    }
                    else {
                        this.Owner.PageBackward();
                    }
                }
            }
            this.Owner.WindowsCarry.HideAllWindows();
            return false;
        };
        MouseWheelClass.prototype.CheckNotesState = function (e) {
            var target = (e.target || e.srcElement);
            target = this.Owner.GetElement(target, 'div');
            if (hasClass(target, 'footnote') && target.scrollHeight != target.offsetHeight) {
                this.NotesState = true;
            }
            this.DebugLog(target.scrollHeight + ' ' + target.offsetHeight);
        };
        MouseWheelClass.prototype.DebugLog = function (str) {
            if (this.Debug) {
                console.log('[MouseWheelClass] ' + str);
            }
        };
        return MouseWheelClass;
    }());
    EventsModule.MouseWheelClass = MouseWheelClass;
    var ResizeClass = /** @class */ (function () {
        function ResizeClass(Owner) {
            var _this = this;
            this.Owner = Owner;
            this.ResizeTimerValue = 200;
            window.addEventListener('resize', function (e) { return _this.Resize(e); }, false);
        }
        ResizeClass.prototype.Resize = function (e) {
            var _this = this;
            this.ClearTimer();
            this.ResizeTimer = setTimeout(function () {
                if (!_this.CheckShareWindow() && !_this.CheckZoomInState()) {
                    _this.Owner.WindowsCarry.HideAllWindows();
                }
                _this.Owner.Resize();
            }, this.ResizeTimerValue);
        };
        ResizeClass.prototype.ClearTimer = function () {
            clearTimeout(this.ResizeTimer);
            this.ResizeTimer = 0;
        };
        ResizeClass.prototype.CheckShareWindow = function () {
            var BookmarkWindow = this.Owner.WindowsCarry.GetWindow('menu-bookmark');
            var ShareObj = BookmarkWindow.obj.ShareListObj;
            if (ShareObj && ShareObj.ShareWindowObj && ShareObj.ShareWindowObj.ShowState) { // stupid fix
                return true;
            }
            return false;
        };
        ResizeClass.prototype.CheckZoomInState = function () {
            if (this.Owner.ZoomObj.ShowState && this.Owner.ZoomObj.ResizeState) {
                return true;
            }
            return false;
        };
        return ResizeClass;
    }());
    EventsModule.ResizeClass = ResizeClass;
    var ContextMenuTouch = /** @class */ (function () {
        function ContextMenuTouch(Owner) {
            this.Owner = Owner;
            this.ContextMenuTime = 0;
            this.AddHandlers();
        }
        ContextMenuTouch.prototype.AddHandlers = function () {
            this.Owner.AddEvents(this.OnTouchStart, this.OnTouchEnd, null, this.Owner.WrapperBox, this);
            this.Owner.AddEvents(this.OnTouchStart, this.OnTouchEnd, null, this.Owner.ReaderBox, this);
        };
        ContextMenuTouch.prototype.OnTouchStart = function (e) {
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches)
                return;
            this.ContextMenuTime = Date.now();
            this.CoordStart = this.Owner.GetCoordinates(e);
        };
        ContextMenuTouch.prototype.OnTouchEnd = function (e) {
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches)
                return;
            var CoordEnd = this.Owner.GetCoordinates(e);
            if (Math.abs(CoordEnd.X - this.CoordStart.X) > 5 || Math.abs(CoordEnd.Y - this.CoordStart.Y) > 5) {
                this.ContextMenuTime = 0;
                return;
            }
            if (this.Owner.SelectionObj.GetSelectionState()) {
                this.ContextMenuTime = 0;
                return;
            }
            if (this.ContextMenuTime != 0 && Date.now() - this.ContextMenuTime >= 1500) {
                this.Owner.GetCurrentBox().style.display = "block";
                e.clientX = CoordEnd.X;
                e.clientY = CoordEnd.Y;
                ContextObj.ShowWindow(e);
            }
            this.ContextMenuTime = 0;
        };
        return ContextMenuTouch;
    }());
    EventsModule.ContextMenuTouch = ContextMenuTouch;
    var MaskClass = /** @class */ (function () {
        function MaskClass(Owner) {
            this.Owner = Owner;
            this.MaskObj = document.querySelector('#mask');
            this.AddHandlers();
        }
        MaskClass.prototype.AddHandlers = function () {
            var _this = this;
            this.MaskObj.addEventListener('click', function (e) { return _this.MaskClick(e); }, false);
            this.MaskObj.addEventListener('contextmenu', function (e) { return _this.MaskOnMenu(e); }, false);
        };
        MaskClass.prototype.MaskClick = function (e) {
            var e = this.Owner.GetEvent(e);
            this.Owner.WindowsCarry.HideAllWindows(true);
            return this.Owner.StopPropagation(e);
        };
        MaskClass.prototype.MaskOnMenu = function (e) {
            var e = this.Owner.GetEvent(e);
            if (ContextObj.ShowState) {
                this.MaskClick(e);
                ContextObj.ShowWindow(e);
            }
            return this.Owner.StopPropagation(e);
        };
        MaskClass.prototype.Show = function (Opacity, Color) {
            var Opacity = Opacity || '0.3';
            var Color = Color || '0, 0, 0';
            this.MaskObj.setAttribute('style', 'background:rgba(' + Color + ', ' + Opacity + ');');
            this.Toggle('block');
        };
        MaskClass.prototype.Hide = function (Callback) {
            this.MaskObj.removeAttribute('style');
            this.Toggle('none');
            if (Callback) {
                Callback();
            }
        };
        MaskClass.prototype.Toggle = function (state) {
            this.MaskObj.style.display = state;
        };
        return MaskClass;
    }());
    EventsModule.MaskClass = MaskClass;
    var WindowsCarry = /** @class */ (function () {
        function WindowsCarry(Owner) {
            this.Owner = Owner;
            this.WindowsStack = [];
        }
        WindowsCarry.prototype.RegisterWindow = function (WindowObj) {
            this.WindowsStack.push({
                obj: WindowObj,
                button: WindowObj.ButtonClass
            });
        };
        WindowsCarry.prototype.ShowWindow = function (obj) {
            obj.ShowWindow();
        };
        WindowsCarry.prototype.HideWindow = function (obj) {
            if (obj.HideWindow) { // TODO: fix for functions that dont have any windows
                obj.HideWindow();
            }
        };
        WindowsCarry.prototype.FireHandler = function (obj, e) {
            obj.ButtonHandler(e);
        };
        WindowsCarry.prototype.GetWindow = function (_class) {
            for (var j = 0; j < this.WindowsStack.length; j++) {
                for (var i = 0; i < this.WindowsStack[j].button.length; i++) {
                    if (this.WindowsStack[j].button[i] == _class) {
                        return this.WindowsStack[j];
                    }
                }
            }
            return null;
        };
        WindowsCarry.prototype.HideAllWindows = function (KeepSelection, Callback) {
            for (var j = 0; j < this.WindowsStack.length; j++) {
                this.HideWindow(this.WindowsStack[j].obj);
            }
            if (Callback) {
                Callback();
            }
            // TODO: fix this, hate globals, make private|public
            // this.Owner.Mask.Hide(); // if anyone forgot to hide Mask, dont think i need this
            if (!KeepSelection) {
                this.Owner.RemoveSelection();
            }
            TopMenuObj.RemoveActive();
            this.Owner.ZoomObj.ZoomOut(true);
            hideFontChangeList();
        };
        return WindowsCarry;
    }());
    EventsModule.WindowsCarry = WindowsCarry;
    var ZoomClass = /** @class */ (function () {
        function ZoomClass(Owner) {
            var _this = this;
            this.Owner = Owner;
            this.ResizeState = true;
            this.Obj = document.querySelector('#zoomedImg');
            this.ZoomWrap = this.Obj.querySelector('.readerStyles');
            this.ZoomOutHTML = '<a href="javascript:void(0);" class="zoom_block clicked"></a>';
            if (this.ResizeState) {
                window.addEventListener('resize', function () { return _this.ZoomResize(); }, false);
            }
        }
        ZoomClass.prototype.AddHandlers = function () {
            var _this = this;
            this.Obj.querySelector('.zoom_block').addEventListener('click', function () {
                _this.ZoomOut();
            }, false);
        };
        ZoomClass.prototype.GetDocumentSize = function () {
            // was thinking about to create new class attribute, but dont want to handle other events
            // thats why its function with obj return
            var Width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var Height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            Height -= document.querySelector('.top-box').offsetHeight;
            return {
                w: Width,
                h: Height
            };
        };
        ZoomClass.prototype.Image2Center = function () {
            this.ZoomObj.w = this.ZoomObj.w ? this.ZoomObj.w : this.ZoomObj.obj.offsetWidth;
            this.ZoomObj.h = this.ZoomObj.h ? this.ZoomObj.h : this.ZoomObj.obj.offsetHeight;
            var DocSize = this.GetDocumentSize();
            this.ZoomObj.obj.style.left = Math.floor(DocSize.w / 2 - this.ZoomObj.w / 2) + 'px';
            this.ZoomObj.obj.style.top = Math.floor(DocSize.h / 2 - this.ZoomObj.h / 2) + 'px';
        };
        ZoomClass.prototype.ZoomResize = function () {
            if (this.ShowState) {
                this.ZoomOut();
            }
        };
        ZoomClass.prototype.SetZoomObj = function (obj, w, h) {
            this.ZoomObj = { obj: obj, w: w, h: h };
        };
        ZoomClass.prototype.ZoomOut = function (state) {
            if (!this.ShowState) {
                return;
            }
            if (!state) { // already called from this.Owner.WindowsCarry.HideAllWindows
                this.Owner.WindowsCarry.HideAllWindows();
            }
            this.Obj.style.display = 'none';
            this.CleanObj();
            this.ShowState = false;
        };
        ZoomClass.prototype.CleanObj = function () {
            this.ZoomObj.obj.removeAttribute('style');
        };
        ZoomClass.prototype.ZoomIn = function (ZoomForeignObj) {
            if (!ZoomForeignObj) {
                this.PatchZoomObj();
            }
            else {
                this.AddBorders();
            }
            this.ShowState = true;
            if (!ZoomForeignObj) {
                this.AddHandlers();
            }
        };
        ZoomClass.prototype.ZoomMask = function () {
            this.Owner.Mask.Show('0.8');
            this.Obj.style.display = 'block';
        };
        ZoomClass.prototype.ZoomAnything = function (Obj, w, h) {
            this.ZoomObj = { obj: Obj };
            if (w) {
                this.ZoomObj.w = w;
            }
            if (h) {
                this.ZoomObj.h = h;
            }
            this.ZoomIn(true);
        };
        ZoomClass.prototype.ZoomIMG = function (Path, W, H) {
            this.ZoomUpdateBox('<img src="' + Path + '" width="' + W + '" height="' + H + '" />');
            this.ZoomMask();
            this.SetZoomObj(this.Obj, W, H);
            this.ZoomIn();
        };
        ZoomClass.prototype.ZoomHTML = function (HTML) {
            this.ZoomUpdateBox(HTML);
            this.ZoomMask();
            this.SetZoomObj(this.Obj, this.Obj.clientWidth, this.Obj.clientHeight);
            this.ZoomIn();
        };
        ZoomClass.prototype.ZoomUpdateBox = function (Data) {
            this.ZoomWrap.innerHTML = this.ZoomOutHTML + Data;
        };
        ZoomClass.prototype.AddBorders = function () {
            var DocSize = this.GetDocumentSize();
            this.Obj.style.maxWidth = this.Owner.Reader.ColumnWidth() + 'px';
            this.Obj.style.maxHeight = DocSize.h + 'px';
        };
        ZoomClass.prototype.PatchZoomObj = function () {
            var DocSize = this.GetDocumentSize();
            if (!this.ZoomObj.w || DocSize.w <= this.ZoomObj.w) {
                this.Obj.style.width = DocSize.w + 'px';
                this.ZoomObj.w = 0;
            }
            else {
                this.Obj.style.width = 'auto';
            }
            if (!this.ZoomObj.h || DocSize.h <= this.ZoomObj.h) {
                this.Obj.style.height = DocSize.h + 'px';
                this.ZoomObj.h = 0;
            }
            else {
                this.Obj.style.height = 'auto';
            }
        };
        return ZoomClass;
    }());
    EventsModule.ZoomClass = ZoomClass;
    var ChapterClass = /** @class */ (function () {
        function ChapterClass(Owner) {
            this.Owner = Owner;
            this.WindowWidth = 340;
            this.HideTimeout = 0;
            this.HideTimeoutTimer = 1000;
            this.ChapterObj = document.querySelector('#footer .chapter-box');
            this.ChapterText = this.ChapterObj.querySelector('p');
        }
        ChapterClass.prototype.ShowWindow = function (Range) {
            var windowText = this.Owner.GetTitleFromTOC(Range);
            if (!windowText) {
                return;
            }
            this.SetChapterText(windowText);
            this.RepositionWindow();
            this.ToggleWindow('block');
        };
        ChapterClass.prototype.ClearWindow = function () {
            clearTimeout(this.HideTimeout);
            this.SetChapterText('&nbsp;');
        };
        ChapterClass.prototype.SetChapterText = function (text) {
            this.RepositionWindow();
            this.ChapterText.innerHTML = text;
            if (text == '&nbsp;') {
                this.ChapterText.removeAttribute('title');
                return;
            }
            this.ChapterText.setAttribute('title', text);
        };
        ChapterClass.prototype.HideWindowTimer = function () {
            var _this = this;
            clearTimeout(this.HideTimeout);
            this.HideTimeout = setTimeout(function () { return _this.HideWindow(); }, this.HideTimeoutTimer);
        };
        ChapterClass.prototype.HideWindow = function () {
            this.ToggleWindow('none');
        };
        ChapterClass.prototype.ToggleWindow = function (state) {
            this.ChapterObj.style.display = state;
        };
        ChapterClass.prototype.RepositionWindow = function () {
            var half = this.WindowWidth / 2;
            var left = progressBar.dot.offsetLeft - half;
            if (left < 0) {
                left = 0;
            }
            else {
                left += progressBar.dot.offsetWidth / 2;
            }
            if (left + this.WindowWidth > progressBar.obj.offsetWidth) {
                left = progressBar.obj.offsetWidth - this.WindowWidth;
            }
            this.ChapterObj.style.left = left + 'px';
        };
        return ChapterClass;
    }());
    EventsModule.ChapterClass = ChapterClass;
})(EventsModule || (EventsModule = {}));
