/// <reference path="ContextMenuHead.ts" />
var ContextMenu;
(function (ContextMenu) {
    var ContextMenuClass = /** @class */ (function () {
        function ContextMenuClass(Owner, UILangData) {
            var _this = this;
            this.Owner = Owner;
            this.UILangData = UILangData;
            this.ButtonClass = null;
            this.DebugState = false;
            this.ShowState = false;
            this.CopyState = false;
            if (LitresURLParser.PartID != 458582) {
                this.Position = { X: 0, Y: 0 };
                var removeBookmarkText = (UILangData && UILangData["remove-bookmark"]) || "Удалить закладку";
                var shareText = (UILangData && UILangData["share"]) || "Поделиться";
                var editText = (UILangData && UILangData["edit"]) || "Редактировать";
                var removeSelectionText = (UILangData && UILangData["remove-selection"]) || "Удалить выделение";
                var copyText = (UILangData && UILangData["copy"]) || "Копировать";
                var addBookmarkText = (UILangData && UILangData["add-bookmark"]) || "Поставить закладку";
                var saveSelectionText = (UILangData && UILangData["save-selection"]) || "Сохранить выделение";
                this.ListOptions = {
                    1: [
                        { action: 'delete', title: removeBookmarkText },
                        { action: 'share', title: shareText }
                    ],
                    3: [
                        { action: 'edit', title: editText },
                        { action: 'delete', title: removeSelectionText },
                        { action: 'share', title: shareText },
                        { action: 'copy', title: copyText }
                    ],
                    0: [
                        { action: 'create', title: addBookmarkText, type: 1 },
                        { action: 'create', title: saveSelectionText, type: 3 },
                        { action: 'share', title: shareText },
                        { action: 'copy', title: copyText }
                    ]
                };
                this.ListOptions[5] = this.ListOptions[3];
                this.MenuListObj = document.querySelector('#bookmarkMenu');
                this.MenuListBody = this.MenuListObj.querySelector('ul');
                this.CreateWindowObj = new Bookmarks.BookmarkCreateWindow(null, this.Owner);
                this.AttachEvent();
                this.Owner.WindowsCarry.RegisterWindow(this);
            }
            else {
                // useless workaround
                document.oncontextmenu = function (e) {
                    return _this.Owner.StopPropagation(e);
                };
                this.Owner.GetCurrentBox().oncontextmenu = function (e) {
                    return _this.Owner.StopPropagation(e);
                };
            }
        }
        ContextMenuClass.prototype.AttachEvent = function () {
            var _this = this;
            document.oncontextmenu = function (e) {
                var e = _this.Owner.GetEvent(e);
                return _this.Owner.StopPropagation(e);
            };
            this.Owner.GetCurrentBox().oncontextmenu = function (e) {
                var e = _this.Owner.GetEvent(e);
                if (_this.Owner.PDA.state) {
                }
                else {
                    _this.ShowWindow(e);
                }
                return _this.Owner.StopPropagation(e);
            };
        };
        ContextMenuClass.prototype.OnMenu = function (e) {
            var X = e.clientX;
            var Y = e.clientY;
            if (!isRelativeToViewport()) { // hack for touch-based devices
                X += window.pageXOffset;
                Y += window.pageYOffset;
            }
            this.Position.X = X;
            this.Position.Y = Y;
            this.GetBookmarkByXY();
            this.ShowMenu();
        };
        ContextMenuClass.prototype.GetBookmarkByXY = function () {
            this.FoundedBookmark = undefined;
            var Pos = this.Owner.Reader.ElementAtXY(this.Position.X, this.Position.Y);
            if (Pos && Pos.length) {
                this.GetBookmarkByPosition(Pos);
            }
        };
        ContextMenuClass.prototype.GetBookmarkByPosition = function (Pos) {
            for (var J = 0; J < this.Owner.Bookmarks.Bookmarks.length; J++) {
                if (this.Owner.Bookmarks.Bookmarks[J].Group == 0) {
                    continue;
                }
                var BStart2PStart = FB3Reader.PosCompare(this.Owner.Bookmarks.Bookmarks[J].Range.From, Pos);
                var BEnd2PEnd = FB3Reader.PosCompare(this.Owner.Bookmarks.Bookmarks[J].Range.To, Pos);
                if (BStart2PStart <= 0 && (BEnd2PEnd >= 0 || BEnd2PEnd == -1)) { // TODO: i think we need better code here
                    if (this.CheckCurrentSelection(this.Owner.Bookmarks.Bookmarks[J])) {
                        this.FoundedBookmark = this.Owner.Bookmarks.Bookmarks[J];
                    }
                }
            }
        };
        ContextMenuClass.prototype.CheckCurrentSelection = function (Bookmark) {
            // check, if we have second group 1 and group 3 and group 3 row is temporary
            // more priority for group 3
            if (this.FoundedBookmark && this.FoundedBookmark.Group == 3 && this.FoundedBookmark.TemporaryState) {
                return false;
            }
            return true;
        };
        ContextMenuClass.prototype.MakeList = function () {
            var CurrentList;
            if (this.FoundedBookmark && !this.FoundedBookmark.TemporaryState) {
                CurrentList = this.ListOptions[this.FoundedBookmark.Group];
            }
            else if (!this.FoundedBookmark && hasClass(addBookmark, 'clicked')) {
                CurrentList = this.ListOptions[1];
            }
            else {
                CurrentList = this.ListOptions[0];
            }
            if (this.FoundedBookmark) {
                document.querySelector('#createBookmark')
                    .setAttribute('data-id', this.FoundedBookmark.ID);
            }
            var output = '';
            for (var J = 0; J < CurrentList.length; J++) {
                if ((!this.CopyState && CurrentList[J].action == 'copy') ||
                    (!this.FoundedBookmark &&
                        ((CurrentList[J].action == 'create' && CurrentList[J].type == 3) || CurrentList[J].action == 'share'))) {
                    continue;
                }
                output += '<li><button data-action="' + CurrentList[J].action + '"' +
                    (CurrentList[J].type ? ' data-group="' + CurrentList[J].type + '"' : '') + '>' +
                    CurrentList[J].title + '</button></li>';
            }
            // TODO: fix when we have top flag group 1 and clicked again "set group 1"
            this.MenuListBody.innerHTML = output;
        };
        ContextMenuClass.prototype.ShowMenu = function () {
            this.Owner.WindowsCarry.HideAllWindows(true);
            this.Owner.Mask.Show('0');
            this.MakeList();
            this.ToggleMenu('block');
            this.ShowState = true;
            this.RepositionMenu();
            this.AttachMenuEvents();
        };
        ContextMenuClass.prototype.HideMenu = function () {
            this.Owner.Mask.Hide();
            this.ToggleMenu('none');
            this.ShowState = false;
        };
        ContextMenuClass.prototype.ToggleMenu = function (state) {
            this.MenuListObj.style.display = state;
        };
        ContextMenuClass.prototype.ShowWindow = function (e) {
            this.OnMenu(e);
        };
        ContextMenuClass.prototype.HideWindow = function () {
            this.HideMenu();
        };
        ContextMenuClass.prototype.RepositionMenu = function (Obj) {
            var Object = Obj || this.MenuListObj;
            var RandomConst = 15; // random constant for window position
            removeClass(Object, 'bottom');
            var objectOffsets = Object.getBoundingClientRect();
            var normalLeft = this.Position.X - Math.floor(Object.offsetWidth / 2);
            if (normalLeft < 0) {
                normalLeft = RandomConst;
            }
            else if (this.Position.X + Object.offsetWidth / 2 > window.innerWidth) {
                normalLeft = window.innerWidth - Object.offsetWidth - RandomConst;
            }
            Object.style.left = normalLeft + 'px';
            var normalTop = this.Position.Y - document.querySelector('.top-box').offsetHeight + RandomConst;
            if (this.Position.Y + Object.offsetHeight + RandomConst > window.innerHeight) {
                addClass(Object, 'bottom');
                normalTop -= Object.offsetHeight + RandomConst * 2;
            }
            Object.style.top = normalTop + 'px';
        };
        ContextMenuClass.prototype.AttachMenuEvents = function () {
            var _this = this;
            var buttons = this.MenuListBody.querySelectorAll('li');
            var clickEvent = 'click';
            if (this.Owner.PDA.state) {
                if ('ontouchstart' in document.documentElement) {
                    // win tablet chrome, opera, safari fix
                    clickEvent = "touchend";
                }
                else {
                    if (window.navigator.pointerEnabled) {
                        clickEvent = "pointerup";
                    }
                    else if (window.navigator.msPointerEnabled) {
                        clickEvent = "MSPointerUp";
                    }
                    else {
                        clickEvent = "mouseup";
                    }
                }
            }
            for (var J = 0; J < buttons.length; J++) {
                buttons[J].addEventListener(clickEvent, function (e) { return _this.OnMenuSelect(e); }, false);
            }
        };
        ContextMenuClass.prototype.OnMenuSelect = function (event) {
            this.Owner.WindowsCarry.HideAllWindows(true);
            var e = this.Owner.GetEvent(event);
            var target = (e.target || e.srcElement);
            switch (target.getAttribute('data-action')) {
                case "delete":
                    this.DeleteBookmark();
                    break;
                case "copy":
                    break;
                case "share":
                    this.CreateWindowObj.ShowWindow(this);
                    addClass(this.CreateWindowObj.Obj, 'onlyShare');
                    this.CreateWindowObj.Obj.querySelector('.comment-text').innerHTML =
                        this.CreateWindowObj.CommentObj.MakeComment(this.FoundedBookmark.Note[1]);
                    break;
                case "edit":
                case "create":
                    var Group = target.getAttribute('data-group');
                    if (!this.FoundedBookmark && Group == "1") {
                        InitBookmark(addBookmark);
                    }
                    else {
                        if (Group == "1") {
                            this.Owner.Bookmarks.CreateBookmarkFromTemporary(Group, this.FoundedBookmark, this.Owner.GetTitleFromTOC(this.FoundedBookmark.Range).substr(0, 100));
                        }
                        else {
                            this.CreateWindowObj.ShowWindow(this);
                            removeClass(this.CreateWindowObj.Obj, 'onlyShare');
                        }
                    }
                    break;
            }
        };
        ContextMenuClass.prototype.DeleteBookmark = function () {
            if (this.FoundedBookmark) {
                this.FoundedBookmark.Detach();
                this.FoundedBookmark = undefined;
            }
            else {
                InitBookmark(addBookmark);
            }
            this.Owner.Reader.Redraw();
        };
        ContextMenuClass.prototype.Debug = function (str) {
            if (this.DebugState) {
                console.log('[ContextMenu] ' + str);
            }
        };
        return ContextMenuClass;
    }());
    ContextMenu.ContextMenuClass = ContextMenuClass;
})(ContextMenu || (ContextMenu = {}));
