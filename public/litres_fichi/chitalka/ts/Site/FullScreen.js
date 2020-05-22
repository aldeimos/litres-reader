/// <reference path="FullScreenHead.ts" />
var FullScreenSupport;
(function (FullScreenSupport) {
    var FullScreenClass = /** @class */ (function () {
        function FullScreenClass(fullScreenCallback, footer, Parent) {
            this.fullScreenCallback = fullScreenCallback;
            this.footer = footer;
            this.Parent = Parent;
            this.ButtonClass = ['menu-fullscreen', 'menu-normalscreen'];
            this.debug = false;
            this.fullScreen = false;
            this.buttonClicked = false;
            this.hotkeyClicked = false;
            this.UIElements = [];
            this.doc = document;
            this.wrap = this.doc.querySelector('.wrapper'); // TODO: fix in future
            this.fullscreenButton = this.doc.querySelector('.menu-fullscreen').parentNode;
            this.normalscreenButton = this.doc.querySelector('.menu-normalscreen').parentNode;
            this.setUIElements();
            this.setHandlers();
            this.Parent.WindowsCarry.RegisterWindow(this);
        }
        FullScreenClass.prototype.setHandlers = function () {
            var _this = this;
            this.wrap.addEventListener("fullscreenchange", function () { return _this.fullScreenChange(); }, false);
            this.wrap.addEventListener("msfullscreenchange", function () { return _this.fullScreenChange(); }, false);
            this.wrap.addEventListener("mozfullscreenchange", function () { return _this.fullScreenChange(); }, false);
            this.wrap.addEventListener("webkitfullscreenchange", function () { return _this.fullScreenChange(); }, false);
            window.addEventListener('keyup', function (t) { return _this.fullScreenHotkey(t); }, false);
            if (this.wrap.mozRequestFullScreen)
                window.addEventListener('resize', function (t) { return _this.mozEscapeFullscreen(t); }, false);
            var buyButton = document.querySelector('#buy-book');
            buyButton.addEventListener('click', function () {
                if (_this.fullScreen) {
                    _this.ButtonHandler();
                }
            }, false);
        };
        FullScreenClass.prototype.setFullscreenOn = function () {
            if (this.wrap.requestFullscreen) {
                this.wrap.requestFullscreen();
            }
            else if (this.wrap.msRequestFullscreen) {
                this.wrap.msRequestFullscreen();
            }
            else if (this.wrap.mozRequestFullScreen) {
                this.wrap.mozRequestFullScreen();
            }
            else if (this.wrap.webkitRequestFullscreen) {
                this.wrap.webkitRequestFullscreen();
            }
            else if (this.wrap.webkitRequestFullScreen) {
                this.wrap.webkitRequestFullScreen();
            }
        };
        FullScreenClass.prototype.mozEscapeFullscreen = function (e) {
            // ugly firefox! hate firefox!
            this.debugLog('mozEscapeFullscreen');
            var mozDoc = document;
            if (window.navigator.standalone ||
                (mozDoc.fullScreenElement && mozDoc.fullScreenElement != null) ||
                (mozDoc.mozFullScreen || mozDoc.webkitIsFullScreen) || (!window.screenTop && !window.screenY)) {
            }
            else if (this.fullScreen) {
                this.hotkeyClicked = true;
                this.toggleFullScreen();
            }
            e.cancelBubble = true;
            e.stopPropagation();
            return false;
        };
        FullScreenClass.prototype.setFullscreenOff = function () {
            if (this.doc.exitFullscreen) {
                this.doc.exitFullscreen();
            }
            else if (this.doc.msExitFullscreen) {
                this.doc.msExitFullscreen();
            }
            else if (this.doc.mozCancelFullScreen) {
                this.doc.mozCancelFullScreen();
            }
            else if (this.doc.webkitExitFullscreen) {
                this.doc.webkitExitFullscreen();
            }
            else if (this.doc.webkitCancelFullScreen) {
                this.doc.webkitCancelFullScreen();
            }
        };
        FullScreenClass.prototype.fullScreenButton = function () {
            this.debugLog('fullScreenButton');
            this.buttonClicked = true;
            this.toggleFullScreen();
        };
        FullScreenClass.prototype.fullScreenChange = function () {
            if (this.buttonClicked) {
                this.debugLog('fullScreenChange ' + this.buttonClicked);
                this.buttonClicked = false;
            }
            else {
                this.debugLog('fullScreenChange');
                this.toggleFullScreen();
            }
        };
        FullScreenClass.prototype.fullScreenHotkey = function (e) {
            this.debugLog('fullScreenHotkey');
            var keyCode = e.keyCode || e.which;
            if (keyCode == 122) { // F11 to skip fullscreen on|off
                this.hotkeyClicked = true;
                this.toggleFullScreen();
            }
            e.cancelBubble = true;
            e.stopPropagation();
            return false;
        };
        FullScreenClass.prototype.toggleFullScreen = function () {
            this.debugLog('toggleFullScreen ' + this.fullScreen);
            if (this.hotkeyClicked) { // allready fullscreen fired by browser
                this.hotkeyClicked = false;
            }
            else {
                if (this.fullScreen) {
                    this.setFullscreenOff();
                }
                else {
                    this.setFullscreenOn();
                }
            }
            if (this.fullScreen) {
                this.fullscreenButton.style.display = 'inline-block';
                this.normalscreenButton.style.display = 'none';
                this.showUIElements();
                this.fullScreenCallback();
                this.fullScreen = false;
            }
            else {
                this.fullscreenButton.style.display = 'none';
                this.normalscreenButton.style.display = 'inline-block';
                this.hideUIElements();
                this.fullScreen = true;
            }
        };
        FullScreenClass.prototype.setUIElements = function () {
            this.debugLog('setUIElements');
        };
        FullScreenClass.prototype.hideUIElements = function () {
            this.debugLog('hideUIElements');
            this.updateUIElements('none');
        };
        FullScreenClass.prototype.showUIElements = function () {
            this.debugLog('showUIElements');
            this.updateUIElements('block');
        };
        FullScreenClass.prototype.updateUIElements = function (state) {
            for (var j in this.UIElements) {
                this.UIElements[j].style.display = state;
            }
        };
        FullScreenClass.prototype.debugLog = function (str) {
            if (this.debug) {
                console.log(str);
            }
        };
        FullScreenClass.prototype.ButtonHandler = function () {
            return this.fullScreenButton();
        };
        FullScreenClass.prototype.showHiddenElements = function () { };
        return FullScreenClass;
    }());
    FullScreenSupport.FullScreenClass = FullScreenClass;
    var PDAFullScreenClass = /** @class */ (function () {
        function PDAFullScreenClass(fullScreenCallback, toggleCallback, Parent) {
            this.fullScreenCallback = fullScreenCallback;
            this.toggleCallback = toggleCallback;
            this.Parent = Parent;
            this.ButtonClass = ['menu-fullscreen', 'menu-normalscreen'];
            this.animating = false;
            this.fullScreen = true;
            this.UIElementsState = true;
            this.UIElements = [];
            this.doc = document;
            this.fullscreenButton = this.doc.querySelector('.menu-fullscreen').parentNode;
            this.normalscreenButton = this.doc.querySelector('.menu-normalscreen').parentNode;
            this.setUIElements();
            this.Parent.WindowsCarry.RegisterWindow(this);
            setSetting(true, 'pda_fullscreen');
        }
        PDAFullScreenClass.prototype.setUIElements = function () {
            this.UIElements.push(this.doc.querySelector('.header'));
        };
        PDAFullScreenClass.prototype.hideUIElements = function () {
            this.updateUIElements('none');
        };
        PDAFullScreenClass.prototype.showUIElements = function () {
            this.updateUIElements('block');
        };
        PDAFullScreenClass.prototype.updateUIElements = function (state) {
            for (var j in this.UIElements) {
                this.UIElements[j].style.display = state;
                // TODO: replace to animation, someday
            }
        };
        PDAFullScreenClass.prototype.showTopbar = function (obj) {
            this.scrollToNative(obj, 1, 40, function () {
                // removeClass(<HTMLElement> obj, 'hidden');
            });
        };
        PDAFullScreenClass.prototype.hideTopbar = function (obj) {
            this.scrollToNative(obj, -1, 40, function () {
                // addClass(<HTMLElement> obj, 'hidden');
            });
        };
        PDAFullScreenClass.prototype.scrollToNative = function (obj, dir, height, callback) {
            if (this.animating) {
                return;
            }
            this.animating = true;
            this.animation(obj, dir, height, callback);
        };
        PDAFullScreenClass.prototype.animation = function (el, dir, h, callback) {
            var _this = this;
            var top = parseFloat(el.style.top) || 0;
            if (Math.round(top) == (dir > 0 ? 0 : h * dir)) {
                callback();
                this.animating = false;
                return;
            }
            setTimeout(function () {
                var height = top + (dir > 0 ? h : h * dir) / 60;
                el.style.top = height.toFixed(2) + 'px';
                _this.animation(el, dir, h, callback);
            }, 5);
        };
        PDAFullScreenClass.prototype.fullScreenButton = function () {
            this.toggleUIElements(this.fullScreen);
            if (!this.fullScreen) {
                this.fullScreen = true;
                //this.fullscreenButton.style.display = 'none';
                //this.normalscreenButton.style.display = 'inline-block';
            }
            else {
                this.fullScreen = false;
                //this.fullscreenButton.style.display = 'inline-block';
                //this.normalscreenButton.style.display = 'none';
            }
            this.fullScreenCallback(this.fullScreen);
        };
        PDAFullScreenClass.prototype.toggleUIElements = function (state) {
            /*if (!state) {
                this.hideUIElements();
                this.UIElementsState = false;
            } else {
                this.showUIElements();
                this.UIElementsState = true;
            }
            this.toggleCallback(this.UIElementsState);*/
            if (state) {
                footerTopPda = 0;
                this.UIElementsState = true;
            }
            else {
                footerTopPda = 40;
                this.UIElementsState = false;
            }
            this.fullScreen = this.UIElementsState;
            if (!aldebaran_or4) {
                var titleBlock = doc.querySelector('.title-text-block');
                var trialsGap = 0;
                if (LitresURLParser.Trial) {
                    trialsGap = 40;
                }
                if (!LitresURLParser.Trial) {
                    doc.querySelector('.top-box').style.top = state ? "0px" : "0px";
                }
                else {
                    titleBlock.style.marginLeft = state ? "0" : "-100%";
                }
                changeCSS('#footer', 'margin-top', (-35) + 'px;');
            }
        };
        PDAFullScreenClass.prototype.showHiddenElements = function () {
            this.toggleUIElements(!this.UIElementsState);
        };
        PDAFullScreenClass.prototype.ButtonHandler = function () {
            return this.fullScreenButton();
        };
        return PDAFullScreenClass;
    }());
    FullScreenSupport.PDAFullScreenClass = PDAFullScreenClass;
})(FullScreenSupport || (FullScreenSupport = {}));
// LitresFullScreen = new FullScreenSupport.FullScreenClass(topButtonsRemoveActive);
