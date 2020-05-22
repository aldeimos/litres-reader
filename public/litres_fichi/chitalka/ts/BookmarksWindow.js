/// <reference path="BookmarksWindowHead.ts" />
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
var Bookmarks;
(function (Bookmarks_1) {
    // Minimum bookmark length for public sharing
    Bookmarks_1.SHARE_BOOKMARK_MIN_LEN = 30;
    var BookmarksWindow = /** @class */ (function () {
        function BookmarksWindow(Obj, Parent, UILangData) {
            this.Obj = Obj;
            this.Parent = Parent;
            this.UILangData = UILangData;
            this.ButtonClass = ['menu-bookmark'];
            this.CreateBookmarkState = false;
            this.ShowState = false;
            this.RegisteredWindows = [];
            this.CommentObj = new CommentWindow(this);
            this.ShareListObj = new ShareList(this);
            this.MakeHTML();
            this.SetObjectList();
            this.Parent.WindowsCarry.RegisterWindow(this);
        }
        BookmarksWindow.prototype.ButtonHandler = function () {
            if (!this.ShowState) {
                this.ShowWindow();
            }
            else {
                this.HideWindow();
            }
        };
        BookmarksWindow.prototype.SetObjectList = function () {
            this.ObjList = this.Obj.querySelector('#bookmarks-list ul');
        };
        BookmarksWindow.prototype.MakeHTML = function () {
            var content = this.Obj.querySelector('#bookmarks-list');
            content.outerHTML = this.ShareListObj.HTML + this.CommentObj.HTML + content.outerHTML;
        };
        BookmarksWindow.prototype.MakeContent = function () {
            this.PrepareData();
            this.ObjList.innerHTML = this.ParseWindowData();
            this.SetHandlers();
        };
        BookmarksWindow.prototype.ParseWindowData = function () {
            var html = '';
            var noBookmarksText = (this.UILangData && this.UILangData["no-bookmarks"]) || 'Нет заметок/закладок';
            if (!this.WindowData.length) {
                return "<li><div class=\"bookmark-top\">" + noBookmarksText + "</div></li>";
            }
            var title = '';
            for (var j = 0; j < this.WindowData.length; j++) {
                if (this.WindowData[j].TemporaryState == 1) {
                    continue;
                }
                var bookmark = this.WindowData[j];
                var text = bookmark.MakePreviewFromNote();
                html += '<li data-n="' + bookmark.N + '" ' +
                    'data-id="' + bookmark.ID + '" ' +
                    (bookmark.Group == 3 || bookmark.Group == 5 ? 'class="' + bookmark.Class + '" ' : '') +
                    '>';
                if (title != bookmark.Title) {
                    html += '<div class="bookmark-top">' + bookmark.Title + '</div>';
                }
                title = bookmark.Title;
                html += '<div class="bookmark-body">';
                html += '<div class="bookmark-text">' +
                    '<span class="icon-type icon-type-' + bookmark.Group + '"></span>' +
                    '<a href="javascript:void(0);" data-e="' + bookmark.Range.From + '">' + text + '</a></div>';
                if (bookmark.Group == 3 || bookmark.Group == 5) {
                    html += this.CommentObj.MakeComment(bookmark.Note[1]);
                }
                var deleteText = (this.UILangData && this.UILangData["delete"]) || "Удалить";
                html += '<div class="bookmark-buttons">' +
                    '<a class="drop-bookmark action-icon" title="' + deleteText + '" ' +
                    'data-id="' + bookmark.ID + '" href="javascript:void(0);">x</a>';
                if (bookmark.Group == 3) {
                    html += this.CommentObj.MakeButton(bookmark.N);
                }
                html += this.ShareListObj.MakeButton(bookmark.N);
                html += '</div>' +
                    '</div>' +
                    '</li>';
            }
            return html;
        };
        BookmarksWindow.prototype.ShowWindow = function () {
            this.ShowState = true;
            this.MakeContent();
            this.Parent.Mask.Show();
            this.ToggleWindow('block');
            if (!this.Parent.PDA.state) {
                this.Scroll = new scrollbar(this.Obj.querySelector('.scrollbar'), {});
            }
            else {
                addClass(this.Obj, 'scroll_enabled');
            }
        };
        BookmarksWindow.prototype.HideWindow = function () {
            this.Parent.Mask.Hide();
            this.ToggleWindow('none');
            // TODO: clear data
            this.WindowData = null;
            this.ShowState = false;
        };
        BookmarksWindow.prototype.ToggleWindow = function (state) {
            this.Obj.style.display = state;
        };
        BookmarksWindow.prototype.PrepareData = function () {
            this.WindowData = this.Parent.Bookmarks.Bookmarks.slice(0);
            this.WindowData.splice(0, 1);
            this.WindowData.sort(this.SortData);
        };
        BookmarksWindow.prototype.SortData = function (a, b) {
            var xps = FB3Reader.PosCompare(a.Range.From, b.Range.From);
            if (xps > 0)
                return 1;
            else if (xps < 0)
                return -1;
            return 0;
        };
        BookmarksWindow.prototype.GetObj = function (N) {
            return this.Obj.querySelector('#bookmarks-list li[data-n="' + N + '"]');
        };
        BookmarksWindow.prototype.RegisterWindow = function (obj) {
            this.RegisteredWindows.push(obj);
        };
        BookmarksWindow.prototype.HideRegisteredWindows = function () {
            for (var j = 0; j < this.RegisteredWindows.length; j++) {
                if (this.RegisteredWindows[j].CurrentObj) {
                    this.RegisteredWindows[j].HideWindow();
                }
            }
        };
        BookmarksWindow.prototype.SetHandlers = function () {
            var _this = this;
            // set button actions in list
            var buttons = this.Obj.querySelectorAll('.bookmark-text > a');
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].addEventListener('click', function (e) { return _this.Parent.GoToBookmark(e); }, false);
            }
            buttons = this.Obj.querySelectorAll('.drop-bookmark');
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].addEventListener('click', function (e) { return _this.DropBookmark(e); }, false);
            }
            this.CommentObj.SetHandlers();
            this.ShareListObj.SetHandlers();
        };
        BookmarksWindow.prototype.DropBookmark = function (event) {
            var _this = this;
            this.HideRegisteredWindows();
            if (!this.Parent.CheckDoubleClick()) {
                this.Parent.SetPreventDoubleCheck();
                var target = (event.target || event.srcElement);
                var BookmarkID = target.getAttribute('data-id');
                for (var j = 0; j < this.Parent.Bookmarks.Bookmarks.length; j++) {
                    if (this.Parent.Bookmarks.Bookmarks[j].ID == BookmarkID) {
                        this.Parent.Bookmarks.Bookmarks[j].Detach();
                        break;
                    }
                }
                this.Parent.Reader.Redraw(function () {
                    _this.Parent.Reader.Site.StoreBookmarksHandler(1000);
                });
                this.MakeContent();
            }
        };
        BookmarksWindow.prototype.GetBookmark = function (ID) {
            for (var j = 0; j < this.WindowData.length; j++) {
                if (this.WindowData[j].ID == ID) {
                    return this.WindowData[j];
                }
            }
            return null;
        };
        return BookmarksWindow;
    }());
    Bookmarks_1.BookmarksWindow = BookmarksWindow;
    var CommentWindow = /** @class */ (function () {
        function CommentWindow(Owner) {
            this.Owner = Owner;
            this.MinHeight = 165;
            this.Owner.RegisterWindow(this);
            this.UpdateCommentState = true;
            this.ShowCommentButton = true;
            this.ShowCommentBox = true;
            this.Placeholder = (this.Owner.UILangData && this.Owner.UILangData["your-comment"]) || "Ваш комментарий";
            this.MakeHTML();
        }
        CommentWindow.prototype.MakeHTML = function () {
            var saveText = (this.Owner.UILangData && this.Owner.UILangData["save"]) || "Сохранить";
            var cancelText = (this.Owner.UILangData && this.Owner.UILangData["cancel"]) || "Отмена";
            this.HTML = '<div class="comment-box">' +
                '<textarea>' + this.Placeholder + '</textarea>' +
                '<div class="comment-buttons">' +
                '<a class="comment-button comment-save">' + saveText + '</a>' +
                '<a class="comment-button comment-cancel">' + cancelText + '</a>' +
                '</div>' +
                '</div>';
        };
        CommentWindow.prototype.Init = function () {
            var _this = this;
            if (!this.Obj) {
                this.Obj = this.Owner.Obj.querySelector('.comment-box');
                this.TextObj = this.Obj.querySelector('textarea');
                var button = this.Obj.querySelector('.comment-cancel');
                if (button) {
                    button.addEventListener('click', function () { return _this.TextCancel(); }, false);
                }
                button = this.Obj.querySelector('.comment-save');
                if (button) {
                    button.addEventListener('click', function () { return _this.TextSave(); }, false);
                }
                var placeholder = new PlaceholderClass(this.TextObj, function (text) { return _this.SetText(text); }, this.Placeholder);
            }
            if (this.CurrentObj) {
                this.CancelButton = true;
                this.Owner.HideRegisteredWindows();
            }
        };
        CommentWindow.prototype.ReplaceHTML = function (bookmark) {
            var text = bookmark.Note[1].replace(/<\/?p>/ig, '');
            this.OriginalText = text;
            if (text != '') {
                this.TextObj.value = text;
            }
            else {
                this.TextObj.value = this.Placeholder;
            }
            if (this.BookmarkButtonsObj) {
                this.CurrentObj.querySelector('.bookmark-body').insertBefore(this.Obj, this.BookmarkButtonsObj);
            }
        };
        CommentWindow.prototype.TextCancel = function () {
            this.CancelButton = true;
            this.HideWindow();
        };
        CommentWindow.prototype.TextSave = function () {
            this.SaveButton = true;
            this.TextObj.blur();
            var BookmarkID = this.CurrentObj.getAttribute('data-id');
            for (var j = 0; j < this.Owner.Parent.Bookmarks.Bookmarks.length; j++) {
                if (this.Owner.Parent.Bookmarks.Bookmarks[j].ID == BookmarkID) {
                    this.SetBookmarkNote(this.Owner.Parent.Bookmarks.Bookmarks[j]);
                    break;
                }
            }
            this.Owner.Parent.Reader.Site.StoreBookmarksHandler(200);
            this.HideWindow();
        };
        CommentWindow.prototype.SetBookmarkNote = function (Bookmark) {
            if (this.TextObj.value == '' || this.TextObj.value == this.Placeholder) {
                // typed text was that bad...
            }
            else {
                Bookmark.Note[1] = '<p>' + this.TextObj.value + '</p>';
                Bookmark.DateTime = moment().unix();
            }
        };
        CommentWindow.prototype.ShowWindow = function () {
            this.ShowButton = true;
            this.ToggleWindow('block');
            this.Owner.ShareListObj.HideWindow();
            this.HideOwnerButtons();
        };
        CommentWindow.prototype.HideWindow = function () {
            if (!this.Obj) { // dont have init fire
                return;
            }
            this.ToggleWindow('none');
            if (this.BookmarkButtonsObj) { // we hidded buttons already
                this.ShowOwnerButtons();
            }
        };
        CommentWindow.prototype.ToggleWindow = function (state) {
            this.Obj.style.display = state;
            this.UpdateComment();
        };
        CommentWindow.prototype.ShowTextBox = function (event) {
            this.Init();
            if (event) {
                var target = (event.target || event.event.srcElement);
                this.CurrentObj = this.Owner.GetObj(target.getAttribute('data-n'));
                this.BookmarkButtonsObj = this.CurrentObj.querySelector('.bookmark-buttons');
                var commentHeight = this.CurrentObj.querySelector('.bookmark-comment').offsetHeight;
                if (this.MinHeight < commentHeight) {
                    this.TextObj.setAttribute('style', 'height:' + commentHeight + 'px');
                }
                else {
                    this.TextObj.removeAttribute('style');
                }
            }
            var BookmarkID = this.CurrentObj.getAttribute('data-id');
            this.ReplaceHTML(this.Owner.GetBookmark(BookmarkID));
            this.ShowWindow();
        };
        CommentWindow.prototype.SetHandlers = function () {
            var _this = this;
            var buttons = this.Owner.Obj.querySelectorAll('.comment-bookmark');
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].addEventListener('click', function (event) { return _this.ShowTextBox(event); }, false);
            }
        };
        CommentWindow.prototype.UpdateComment = function () {
            if (this.UpdateCommentState) {
                var commentBox = this.CurrentObj.querySelector('.bookmark-comment');
                var comment = this.TextObj.value;
                if (this.SaveButton && comment != '' && comment != this.Placeholder) {
                    // save, we have new comment, set owner comment in box
                    commentBox.innerHTML = comment.replace(/\n/ig, '<br />');
                }
                var commentNotEpmty = comment != '' && comment != this.Placeholder;
                if ((!this.ShowButton && !this.SaveButton && !this.CancelButton && commentNotEpmty) ||
                    (this.SaveButton && commentNotEpmty) ||
                    (this.CancelButton && (this.OriginalText != '' || commentNotEpmty))) {
                    // save|close we have, show comment owner box
                    this.ShowOwnerComment(commentBox);
                }
                else {
                    // any other actions, hide comment owner box
                    this.HideOwnerComment(commentBox);
                }
                this.SaveButton = false;
                this.CancelButton = false;
                this.ShowButton = false;
            }
        };
        CommentWindow.prototype.SetText = function (text) {
            this.TextObj.value = text;
        };
        CommentWindow.prototype.HideOwnerButtons = function () {
            if (this.BookmarkButtonsObj) {
                this.BookmarkButtonsObj.style.display = 'none';
            }
        };
        CommentWindow.prototype.ShowOwnerButtons = function () {
            if (this.BookmarkButtonsObj) {
                this.BookmarkButtonsObj.style.display = 'block';
            }
        };
        CommentWindow.prototype.HideOwnerComment = function (Obj) {
            Obj.style.display = 'none';
        };
        CommentWindow.prototype.ShowOwnerComment = function (Obj) {
            Obj.style.display = 'block';
        };
        CommentWindow.prototype.MakeButton = function (N) {
            if (!this.ShowCommentButton) {
                return '';
            }
            var commentText = (this.Owner.UILangData && this.Owner.UILangData["comment"]) || "Комментировать";
            return '<a class="comment-bookmark action-icon" title="' + commentText + '" data-n="' + N + '"' +
                'href="javascript:void(0);">&nbsp;</a>';
        };
        CommentWindow.prototype.MakeComment = function (text) {
            if (!this.ShowCommentBox) {
                return '';
            }
            return '<div class="bookmark-comment"' +
                (text.replace(/<\/?p>/ig, '') != '' ? ' style="display:block;"' : '') + '>' +
                text.replace(/\n/ig, '<br />') + '</div>';
        };
        return CommentWindow;
    }());
    var ShareList = /** @class */ (function () {
        function ShareList(Owner) {
            this.Owner = Owner;
            this.Owner.RegisterWindow(this);
            this.ShowShareButton = true;
            this.ShowState = false;
            this.ShareOptions = [];
            // добалять ВК только для русского языка
            var lang = (this.Owner.UILangData && this.Owner.UILangData["lang"]) || "ru";
            var shareText = (this.Owner.UILangData && this.Owner.UILangData["share"]) || "Поделиться";
            if (lang == "ru") {
                this.ShareOptions.push({
                    name: 'Вконтакте',
                    buttonClass: 'vk',
                    buttonName: 'Вконтакте',
                    shareButtonText: shareText,
                    state: true,
                    obj: VkontakteSharing
                });
            }
            // Facebook и Twitter - для всех
            this.ShareOptions.push({
                name: 'Facebook',
                buttonClass: 'fb',
                buttonName: 'Facebook',
                shareButtonText: '<span></span> ' + shareText,
                state: true,
                obj: FacebookSharing
            }, {
                name: 'Twitter',
                buttonClass: 'tw',
                buttonName: 'Twitter',
                shareButtonText: shareText,
                state: true,
                obj: TwitterSharing
            });
            this.MakeHTML();
        }
        ShareList.prototype.GetOption = function (val) {
            for (var j = 0; j < this.ShareOptions.length; j++) {
                if (this.ShareOptions[j].buttonClass == val) {
                    return this.ShareOptions[j];
                }
            }
        };
        ShareList.prototype.MakeHTML = function () {
            this.HTML = '<ul class="sharebookmark-list">';
            for (var j = 0; j < this.ShareOptions.length; j++) {
                if (this.ShareOptions[j].state) {
                    this.HTML += '<li class="' + this.ShareOptions[j].buttonClass + '">' +
                        this.ShareOptions[j].buttonName + '</li>';
                }
            }
            this.HTML += '</ul>';
        };
        ShareList.prototype.Init = function () {
            var _this = this;
            if (!this.Obj) {
                this.Obj = this.Owner.Obj.querySelector('.sharebookmark-list');
                var buttons = this.Obj.querySelectorAll('.sharebookmark-list li');
                for (var j = 0; j < buttons.length; j++) {
                    buttons[j].addEventListener('click', function (event) { return _this.ShareWindowInit(event); }, false);
                }
            }
            this.Owner.HideRegisteredWindows();
        };
        ShareList.prototype.ReplaceHTML = function () {
            this.CurrentObj.querySelector('.bookmark-buttons').appendChild(this.Obj);
        };
        ShareList.prototype.ShowWindow = function () {
            this.ShowState = true;
            removeClass(this.Obj, 'topList');
            this.ToggleWindow('block');
            var offsetTop = this.Obj.getBoundingClientRect().top;
            if (offsetTop + this.Obj.offsetHeight > window.innerHeight) {
                addClass(this.Obj, 'topList');
            }
        };
        ShareList.prototype.HideWindow = function () {
            if (!this.Obj || !this.ShowState) {
                return;
            }
            this.ShowState = false;
            this.ToggleWindow('none');
        };
        ShareList.prototype.ToggleWindow = function (state) {
            this.Obj.style.display = state;
        };
        ShareList.prototype.ShowListBox = function (event) {
            if (!this.ShowState) {
                this.Init();
                if (event) {
                    this.CurrentObj = this.Owner.GetObj(event.currentTarget.getAttribute('data-n'));
                    this.ReplaceHTML();
                }
                this.ShowWindow();
            }
            else {
                this.HideWindow();
            }
        };
        ShareList.prototype.ShareWindowInit = function (event) {
            if (this.Owner.CreateBookmarkState) {
                this.Owner.ToggleWindow('none');
            }
            this.Owner.ShareListObj.HideWindow();
            var target = (event.target || event.srcElement);
            this.ShareWindowObj = new ShareWindow(this.Owner, this.GetOption(target.className), this);
        };
        ShareList.prototype.MakeButton = function (N) {
            if (!this.ShowShareButton) {
                return '';
            }
            var shareText = (this.Owner.UILangData && this.Owner.UILangData["share"]) || "Поделиться";
            return '<a class="share-bookmark" data-n="' + N + '"' +
                'href="javascript:void(0);"><span class="action-icon"></span>' + shareText + '</a>';
        };
        ShareList.prototype.SetHandlers = function () {
            var _this = this;
            var buttons = this.Owner.Obj.querySelectorAll('.share-bookmark');
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].addEventListener('click', function (event) { return _this.ShowListBox(event); }, false);
            }
        };
        return ShareList;
    }());
    var ShareWindow = /** @class */ (function () {
        function ShareWindow(Owner, ShareObj, Parent) {
            var _this = this;
            this.Owner = Owner;
            this.ShareObj = ShareObj;
            this.Parent = Parent;
            this.ButtonClass = null;
            this.ShowState = false;
            this.Placeholder = 'Текст, который вы хотите пошарить';
            this.Text = '';
            this.Comment = '';
            this.Owner.RegisterWindow(this);
            this.Obj = document.querySelector('#facebook');
            this.TextObj = this.Obj.querySelector('textarea');
            var ShareButton = this.Obj.querySelector('.share-button');
            ShareButton.innerHTML = this.ShareObj.shareButtonText;
            addClass(ShareButton, 'share-action-' + this.ShareObj.buttonClass);
            this.ShowWindow();
            this.Obj.querySelector('.share-cancel-button').onclick = function () { return _this.ShareCancel(); };
            ShareButton.onclick = function () {
                var bookmark = _this.Owner.GetBookmark(_this.Parent.CurrentObj.getAttribute('data-id'));
                if (bookmark.Note[0] && bookmark.Note[0].length >= Bookmarks.SHARE_BOOKMARK_MIN_LEN) {
                    _this.BeforeShareInit();
                }
                else {
                    _this.ShareInit();
                }
            };
            var placeholder = new PlaceholderClass(this.TextObj, function (text) { return _this.TextAreaCallback(text); }, this.Placeholder);
            this.Owner.Parent.WindowsCarry.RegisterWindow(this);
        }
        ShareWindow.prototype.ShowWindow = function () {
            this.ToggleWindow('block');
            this.FillShareWindow();
            this.ShowState = true;
        };
        ShareWindow.prototype.HideWindow = function () {
            this.ShowState = false;
            if (!this.Obj) {
                return;
            }
            var ShareButton = this.Obj.querySelector('.share-button');
            removeClass(ShareButton, 'share-action-' + this.ShareObj.buttonClass);
            this.ToggleWindow('none');
            if (this.Owner.CreateBookmarkState) {
                this.Owner.CreateBookmarkState = false;
                this.Owner.Parent.Mask.Hide();
            }
        };
        ShareWindow.prototype.ToggleWindow = function (state) {
            this.Obj.style.display = state;
        };
        ShareWindow.prototype.FillShareWindow = function () {
            var _this = this;
            var bookmark = this.Owner.GetBookmark(this.Parent.CurrentObj.getAttribute('data-id'));
            var CurrentNote = bookmark.RoundClone(false);
            this.Text = this.ShareObj.obj.CookText(CurrentNote.RawText);
            this.Comment = this.ShareObj.obj.CookComment(bookmark.Note[1]);
            this.TextObj.value = this.Text + '\r\n' + this.Comment;
            this.Obj.querySelector('.facebook-title span:last-child').innerHTML = this.ShareObj.name;
            this.Obj.querySelector('.share-book-title').innerHTML = this.ShareObj.obj.Name;
            this.Obj.querySelector('.share-book-author').innerHTML = this.ShareObj.obj.Caption;
            var url = this.Obj.querySelector('.share-book-cover a');
            url.setAttribute('href', this.ShareObj.obj.URL);
            var shareImage = this.Obj.querySelector('.share-book-cover img');
            var image = new Image();
            image.onload = function () {
                var img = this;
                shareImage.setAttribute('src', img.src);
                shareImage.setAttribute('height', Math.round(parseInt(shareImage.getAttribute('width')) / (img.width / img.height)).toString());
            };
            image.src = this.ShareObj.obj.Image;
            this.TextObj.scrollTop = this.TextObj.scrollHeight;
            this.TextObj.onkeyup = this.TextObj.onkeydown = this.TextObj.onchange =
                this.TextObj.oninput = this.TextObj.onpropertychange = function (event) {
                    var target = (event.target || event.srcElement);
                    _this.setCurrentTextLen(target.value.length);
                };
            this.setCaretToPos(this.TextObj, this.Text.length);
            this.Obj.querySelector('.quote-comment .len-max').innerHTML =
                this.ShareObj.obj.TextLimit.toString();
            this.setCurrentTextLen(this.Text.length, this.ShareObj.obj.TextLimit);
            this.Owner.Parent.ZoomObj.ZoomAnything(this.Obj, this.Obj.offsetWidth, this.Obj.offsetHeight);
        };
        ShareWindow.prototype.ShareInit = function () {
            var bookmark = this.Owner.GetBookmark(this.Parent.CurrentObj.getAttribute('data-id'));
            this.Comment = this.TextObj.value;
            this.ShareObj.obj.FillData('', this.Comment);
            this.ShareObj.obj.ShareInit();
        };
        ShareWindow.prototype.BeforeShareInit = function () {
            var _this = this;
            var Bookmarks = this.Owner.Parent.Bookmarks;
            var bookmark = this.Owner.GetBookmark(this.Parent.CurrentObj.getAttribute('data-id'));
            var callback = function () {
                Bookmarks.MakeBookmarkPublic(bookmark, function () {
                    _this.ShareObj.obj.HideLoading();
                    _this.ShareObj.obj.URL = "http://www.litres.ru/pages/view_quote/?id=" + bookmark.ID;
                    _this.ShareInit();
                }, function (resultObject) {
                    try {
                        // По каким-то причинам нельзя выставить признак публичности для данной цитаты. Например, если она уже публичная
                        if (resultObject.error_code == 101155) {
                            _this.ShareObj.obj.HideLoading();
                            _this.ShareObj.obj.URL = "http://www.litres.ru/pages/view_quote/?id=" + bookmark.ID;
                            _this.ShareInit();
                        }
                        else {
                            _this.ShareObj.obj.HideLoading();
                        }
                    }
                    catch (e) {
                        _this.ShareObj.obj.HideLoading();
                    }
                });
            };
            var failureCallback = function () {
                _this.ShareObj.obj.HideLoading();
            };
            if (bookmark.TemporaryState) {
                this.ShareObj.obj.ShowLoading();
                bookmark = Bookmarks.CreateBookmarkFromTemporary(bookmark.Group.toString(), bookmark, this.Owner.Parent.GetTitleFromTOC(bookmark.Range).substr(0, 100), callback, failureCallback);
                return;
            }
            this.ShareObj.obj.ShowLoading();
            callback();
        };
        ShareWindow.prototype.ShareCancel = function () {
            this.HideWindow();
        };
        ShareWindow.prototype.TextAreaCallback = function (text) {
            this.Text = text;
        };
        ShareWindow.prototype.setCurrentTextLen = function (num, max) {
            var comment = this.Obj.querySelector('.quote-comment');
            var button = this.Obj.querySelector('.share-button');
            comment.querySelector('.len-current').innerHTML = num.toString();
            if (!max) {
                max = parseInt(comment.querySelector('.len-max').innerHTML);
            }
            if (num == 0 || num > max) {
                addClass(comment, 'red');
                button.setAttribute('disabled', 'disabled');
            }
            else {
                removeClass(comment, 'red');
                button.removeAttribute('disabled');
            }
        };
        ShareWindow.prototype.setSelectionRange = function (input, selectionStart, selectionEnd) {
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
            }
            else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        };
        ShareWindow.prototype.setCaretToPos = function (input, pos) {
            this.setSelectionRange(input, pos, pos);
        };
        return ShareWindow;
    }());
    var PlaceholderClass = /** @class */ (function () {
        function PlaceholderClass(Obj, Callback, Placeholder) {
            var _this = this;
            this.Obj = Obj;
            this.Callback = Callback;
            this.Placeholder = Placeholder;
            this.Obj.addEventListener('focus', function (event) { return _this.focusCommentTextarea(event); }, false);
            this.Obj.addEventListener('blur', function (event) { return _this.blurCommentTextarea(event); }, false);
        }
        PlaceholderClass.prototype.focusCommentTextarea = function (event) {
            var target = (event.target || event.srcElement);
            if (target.value == this.Placeholder)
                return this.toggleCommentPlaceholder('');
        };
        PlaceholderClass.prototype.blurCommentTextarea = function (event) {
            var target = (event.target || event.srcElement);
            if (target.value == '') {
                return this.toggleCommentPlaceholder(this.Placeholder);
            }
        };
        PlaceholderClass.prototype.toggleCommentPlaceholder = function (text) {
            this.Callback(text);
        };
        return PlaceholderClass;
    }());
    Bookmarks_1.PlaceholderClass = PlaceholderClass;
    var BookmarkCreateWindow = /** @class */ (function (_super) {
        __extends(BookmarkCreateWindow, _super);
        function BookmarkCreateWindow(Obj, Parent) {
            var _this = _super.call(this, Obj, Parent, UILangData) || this;
            _this.Colors = [
                { id: 1, rgb: '90a8a8', name: 'basic' },
                { id: 2, rgb: '8c9194', name: 'tiny' },
                { id: 3, rgb: '5fb142', name: 'interesting' },
                { id: 4, rgb: 'e1a400', name: 'important' },
                { id: 5, rgb: 'ff9d00', name: 'cool' },
                { id: 6, rgb: '0099df', name: 'hot' },
                { id: 7, rgb: 'd261c3', name: 'funny' },
                { id: 8, rgb: '1e3c50', name: 'awesome' }
            ];
            var yourCommentText = (UILangData && UILangData["your-comment"]) || "Ваш комментарий";
            _this.Placeholder = yourCommentText;
            _this.CommentObj.UpdateCommentState = false;
            return _this;
        }
        BookmarkCreateWindow.prototype.SetObjectList = function () {
            this.ButtonClass = null;
        };
        BookmarkCreateWindow.prototype.MakeHTML = function () {
            var shareText = (UILangData && UILangData["share"]) || "Поделиться";
            this.HTML = '<div class="comment-text"></div>' +
                '<ul class="color-pick"></ul>' +
                '<div class="comment-box">' +
                '<textarea>' + this.Placeholder + '</textarea>' +
                '</div>' +
                '<div class="share-box">' +
                '<div class="share-top">' + shareText + ':</div>' +
                '<ul class="sharebookmark-list">' + this.ShareListObj.HTML + '</ul>' +
                '</div>';
        };
        BookmarkCreateWindow.prototype.GetCurrentColor = function () {
            this.CurrentColor = 1;
            for (var j = 0; j < this.Colors.length; j++) {
                if (this.Colors[j].name == this.Owner.FoundedBookmark.Class) {
                    this.CurrentColor = this.Colors[j].id;
                    break;
                }
            }
        };
        BookmarkCreateWindow.prototype.SetCurrentColor = function () {
            for (var j = 0; j < this.ColorsButtons.length; j++) {
                removeClass(this.ColorsButtons[j], 'current');
            }
            addClass(this.ColorPickerObj.querySelector('li[data-id="' + this.CurrentColor + '"]'), 'current');
        };
        BookmarkCreateWindow.prototype.MakeColorPicker = function () {
            var output = '';
            for (var j = 0; j < this.Colors.length; j++) {
                output += '<li data-id="' + this.Colors[j].id + '"' +
                    (this.Colors[j].id == this.CurrentColor ? ' class="current"' : '') +
                    ' style="background:#' + this.Colors[j].rgb + '"></li>';
            }
            this.ColorPickerObj.innerHTML = output;
            this.SetColorHandlers();
        };
        BookmarkCreateWindow.prototype.SetColorHandlers = function () {
            var _this = this;
            this.ColorsButtons = this.ColorPickerObj.querySelectorAll('li');
            for (var j = 0; j < this.ColorsButtons.length; j++) {
                this.ColorsButtons[j].addEventListener('click', function (e) { return _this.ColorPickCallback(e); }, false);
            }
        };
        BookmarkCreateWindow.prototype.ColorPickCallback = function (event) {
            var _this = this;
            var target = (event.target || event.srcElement);
            for (var j = 0; j < this.Colors.length; j++) {
                if (this.Colors[j].id == target.getAttribute('data-id')) {
                    this.CurrentColor = this.Colors[j].id;
                    this.SetCurrentColor();
                    this.Owner.FoundedBookmark.Class = this.Colors[j].name;
                    this.Owner.FoundedBookmark.DateTime = moment().unix();
                    this.Parent.Reader.Redraw(function () {
                        _this.Parent.Reader.Site.StoreBookmarksHandler(200);
                    });
                    break;
                }
            }
        };
        BookmarkCreateWindow.prototype.Init = function () {
            var _this = this;
            if (!this.Obj) {
                this.Obj = document.querySelector('#createBookmark');
                this.Obj.querySelector('.overlay-wrap').innerHTML = this.HTML;
                this.ColorPickerObj = this.Obj.querySelector('.color-pick');
                this.MakeColorPicker();
                this.ShareListObj.CurrentObj = this.Obj;
                this.ShareListObj.ShowListBox(false);
                this.ShareListObj.SetHandlers();
                this.CommentObj.CurrentObj = this.Obj;
                this.Obj.querySelector('.create-bookmark-cancel').addEventListener('click', function () { return _this.BookmarkCancel(); }, false);
                this.Obj.querySelector('.create-bookmark-save').addEventListener('click', function () { return _this.BookmarkSave(); }, false);
            }
        };
        BookmarkCreateWindow.prototype.ShowWindow = function (Owner) {
            this.Owner = Owner;
            this.GetCurrentColor();
            this.CreateBookmarkState = true;
            this.Parent.Mask.Show();
            this.PrepareData();
            this.Init();
            this.SetCurrentColor();
            this.CommentObj.ShowTextBox(false);
            this.ShareListObj.ToggleWindow('block');
            this.ToggleWindow('block');
            this.Owner.RepositionMenu(this.Obj);
        };
        BookmarkCreateWindow.prototype.HideWindow = function () {
            this.CreateBookmarkState = false;
            if (!this.Obj) {
                return;
            }
            this.Parent.Mask.Hide();
            this.ToggleWindow('none');
        };
        BookmarkCreateWindow.prototype.BookmarkCancel = function () {
            this.Parent.WindowsCarry.HideAllWindows(true); // TODO: keep? no? yes?
        };
        BookmarkCreateWindow.prototype.BookmarkSave = function () {
            var FoundedBookmark = this.Owner.FoundedBookmark;
            this.CommentObj.SetBookmarkNote(FoundedBookmark);
            if (FoundedBookmark.TemporaryState) {
                this.Parent.Bookmarks.CreateBookmarkFromTemporary(FoundedBookmark.Group.toString(), FoundedBookmark, this.Parent.GetTitleFromTOC(FoundedBookmark.Range).substr(0, 100));
            }
            this.Parent.WindowsCarry.HideAllWindows();
        };
        return BookmarkCreateWindow;
    }(BookmarksWindow));
    Bookmarks_1.BookmarkCreateWindow = BookmarkCreateWindow;
})(Bookmarks || (Bookmarks = {}));
