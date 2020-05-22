/// <reference path="BookmarksWindowHead.ts" />

module Bookmarks {
	// Minimum bookmark length for public sharing
	export const SHARE_BOOKMARK_MIN_LEN = 30;

	export class BookmarksWindow implements IBookmarksWindow {
		public CommentObj: ICommentWindow;
		public ShareListObj: IShareList;
		public CreateBookmarkState: boolean;
		private Scroll;
		private ShowState: boolean;
		private ObjList: HTMLElement;
		public WindowData;
		private RegisteredWindows;
		public ButtonClass: string[] = ['menu-bookmark'];
		constructor (public Obj: HTMLElement, public Parent: EventsModule.IEventActions, public UILangData: Object) {
			this.CreateBookmarkState = false;
			this.ShowState = false;
			this.RegisteredWindows = [];
			this.CommentObj = new CommentWindow(this);
			this.ShareListObj = new ShareList(this);
			this.MakeHTML();
			this.SetObjectList();
			this.Parent.WindowsCarry.RegisterWindow(this);
		}
		public ButtonHandler(): void {
			if (!this.ShowState) {
				this.ShowWindow();
			} else {
				this.HideWindow();
			}
		}
		public SetObjectList() {
			this.ObjList = <HTMLElement> this.Obj.querySelector('#bookmarks-list ul');
		}
		public MakeHTML() {
			var content = <HTMLElement> this.Obj.querySelector('#bookmarks-list');
			content.outerHTML = this.ShareListObj.HTML + this.CommentObj.HTML + content.outerHTML;
		}
		private MakeContent() {
			this.PrepareData();
			this.ObjList.innerHTML = this.ParseWindowData();
			this.SetHandlers();
		}
		private ParseWindowData() {
			var html = '';
			var noBookmarksText = (this.UILangData && this.UILangData["no-bookmarks"]) || 'Нет заметок/закладок';
			if (!this.WindowData.length) {
				return `<li><div class="bookmark-top">${noBookmarksText}</div></li>`;
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
		}
		public ShowWindow(): void {
			this.ShowState = true;
			this.MakeContent();
			this.Parent.Mask.Show();
			this.ToggleWindow('block');
			if (!this.Parent.PDA.state) {
				this.Scroll = new scrollbar(this.Obj.querySelector('.scrollbar'), {});
			} else {
				addClass(this.Obj, 'scroll_enabled');
			}
		}
		public HideWindow(): void {
			this.Parent.Mask.Hide();
			this.ToggleWindow('none');
			// TODO: clear data
			this.WindowData = null;
			this.ShowState = false;
		}
		public ToggleWindow(state: string) {
			this.Obj.style.display = state;
		}
		public PrepareData() {
			this.WindowData = this.Parent.Bookmarks.Bookmarks.slice(0);
			this.WindowData.splice(0, 1);
			this.WindowData.sort(this.SortData);
		}
		private SortData(a, b) {
			var xps = FB3Reader.PosCompare(a.Range.From, b.Range.From);
			if (xps > 0) return 1;
			else if (xps < 0) return -1;
			return 0;
		}
		public GetObj(N: string) {
			return <HTMLElement> this.Obj.querySelector('#bookmarks-list li[data-n="' + N + '"]');
		}
		public RegisterWindow(obj) {
			this.RegisteredWindows.push(obj);
		}
		public HideRegisteredWindows(): void {
			for (var j = 0; j < this.RegisteredWindows.length; j++) {
				if (this.RegisteredWindows[j].CurrentObj) {
					this.RegisteredWindows[j].HideWindow();
				}
			}
		}
		private SetHandlers() {
			// set button actions in list
			var buttons = this.Obj.querySelectorAll('.bookmark-text > a');
			for (var j = 0; j < buttons.length; j++) {
				buttons[j].addEventListener('click', (e) => this.Parent.GoToBookmark(e), false);
			}
			buttons = this.Obj.querySelectorAll('.drop-bookmark');
			for (var j = 0; j < buttons.length; j++) {
				buttons[j].addEventListener('click', (e) => this.DropBookmark(e), false);
			}
			this.CommentObj.SetHandlers();
			this.ShareListObj.SetHandlers();
		}
		private DropBookmark(event) {
			this.HideRegisteredWindows();
			if (!this.Parent.CheckDoubleClick()) {
				this.Parent.SetPreventDoubleCheck();
				var target = <HTMLElement> (event.target || event.srcElement);
				var BookmarkID = target.getAttribute('data-id');
				for (var j = 0; j < this.Parent.Bookmarks.Bookmarks.length; j++) {
					if (this.Parent.Bookmarks.Bookmarks[j].ID == BookmarkID) {
						this.Parent.Bookmarks.Bookmarks[j].Detach();
						break;
					}
				}
				this.Parent.Reader.Redraw(() => {
					this.Parent.Reader.Site.StoreBookmarksHandler(1000);
				});
				this.MakeContent();
			}
		}
		public GetBookmark(ID: string) {
			for (var j = 0; j < this.WindowData.length; j++) {
				if (this.WindowData[j].ID == ID) {
					return this.WindowData[j];
				}
			}
			return null;
		}
	}

	class CommentWindow implements ICommentWindow {
		private Obj: HTMLElement;
		private TextObj: HTMLTextAreaElement;
		private ShowCommentButton: boolean;
		private ShowCommentBox: boolean;
		private Placeholder: string;
		private BookmarkButtonsObj: Node;
		private OriginalText: string;
		private ShowButton: boolean;
		private SaveButton: boolean;
		private CancelButton: boolean;
		private MinHeight: number = 165;
		public CurrentObj: HTMLElement;
		public HTML: string;
		public UpdateCommentState: boolean;
		constructor (private Owner: IBookmarksWindow) {
			this.Owner.RegisterWindow(this);
			this.UpdateCommentState = true;
			this.ShowCommentButton = true;
			this.ShowCommentBox = true;
			this.Placeholder = (this.Owner.UILangData && this.Owner.UILangData["your-comment"]) || "Ваш комментарий";
			this.MakeHTML();
		}
		private MakeHTML() {
			var saveText = (this.Owner.UILangData && this.Owner.UILangData["save"]) || "Сохранить";
			var cancelText = (this.Owner.UILangData && this.Owner.UILangData["cancel"]) || "Отмена";
			this.HTML = '<div class="comment-box">' +
					'<textarea>' + this.Placeholder + '</textarea>' +
					'<div class="comment-buttons">' +
						'<a class="comment-button comment-save">' + saveText + '</a>' +
						'<a class="comment-button comment-cancel">' + cancelText + '</a>' +
					'</div>' +
				'</div>';
		}
		private Init() {
			if (!this.Obj) {
				this.Obj = <HTMLElement> this.Owner.Obj.querySelector('.comment-box');
				this.TextObj = <HTMLTextAreaElement> this.Obj.querySelector('textarea');
				var button = this.Obj.querySelector('.comment-cancel');
				if (button) {
					button.addEventListener('click', () => this.TextCancel(), false);
				}
				button = this.Obj.querySelector('.comment-save');
				if (button) {
					button.addEventListener('click', () => this.TextSave(), false);
				}
				var placeholder = new PlaceholderClass(this.TextObj,
					(text) => this.SetText(text), this.Placeholder);
			}
			if (this.CurrentObj) {
				this.CancelButton = true;
				this.Owner.HideRegisteredWindows();
			}
		}
		private ReplaceHTML(bookmark): void {
			var text = bookmark.Note[1].replace(/<\/?p>/ig, '');
			this.OriginalText = text;
			if (text != '') {
				this.TextObj.value = text;
			} else {
				this.TextObj.value = this.Placeholder;
			}
			if (this.BookmarkButtonsObj) {
				this.CurrentObj.querySelector('.bookmark-body').insertBefore(this.Obj, this.BookmarkButtonsObj);
			}
		}
		private TextCancel() {
			this.CancelButton = true;
			this.HideWindow();
		}
		public TextSave() {
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
		}
		public SetBookmarkNote(Bookmark: FB3Bookmarks.IBookmark) {
			if (this.TextObj.value == '' || this.TextObj.value == this.Placeholder) {
				// typed text was that bad...
			} else {
				Bookmark.Note[1] = '<p>' + this.TextObj.value + '</p>';
				Bookmark.DateTime = moment().unix();
			}
		}
		private ShowWindow(): void {
			this.ShowButton = true;
			this.ToggleWindow('block');
			this.Owner.ShareListObj.HideWindow();
			this.HideOwnerButtons();
		}
		public HideWindow(): void {
			if (!this.Obj) { // dont have init fire
				return;
			}
			this.ToggleWindow('none');
			if (this.BookmarkButtonsObj) { // we hidded buttons already
					this.ShowOwnerButtons();
			}
		}
		private ToggleWindow(state: string) {
			this.Obj.style.display = state;
			this.UpdateComment();
		}
		public ShowTextBox(event) {
			this.Init();
			if (event) {
				var target = <HTMLElement> (event.target || event.event.srcElement);
				this.CurrentObj = this.Owner.GetObj(target.getAttribute('data-n'));
				this.BookmarkButtonsObj = this.CurrentObj.querySelector('.bookmark-buttons');
				var commentHeight = (<HTMLElement> this.CurrentObj.querySelector('.bookmark-comment')).offsetHeight;
				if (this.MinHeight < commentHeight) {
					this.TextObj.setAttribute('style', 'height:' + commentHeight + 'px');
				} else {
					this.TextObj.removeAttribute('style');
				}
			}
			var BookmarkID = this.CurrentObj.getAttribute('data-id');
			this.ReplaceHTML(this.Owner.GetBookmark(BookmarkID));
			this.ShowWindow();
		}
		public SetHandlers(): void {
			var buttons = this.Owner.Obj.querySelectorAll('.comment-bookmark');
			for (var j = 0; j < buttons.length; j++) {
				buttons[j].addEventListener('click', (event) => this.ShowTextBox(event), false);
			}
		}
		private UpdateComment(): void {
			if (this.UpdateCommentState) {
				var commentBox = <HTMLElement> this.CurrentObj.querySelector('.bookmark-comment');
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
				} else {
					// any other actions, hide comment owner box
					this.HideOwnerComment(commentBox);
				}
				this.SaveButton = false;
				this.CancelButton = false;
				this.ShowButton = false;
			}
		}
		private SetText(text: string): void {
			this.TextObj.value = text;
		}
		private HideOwnerButtons(): void {
			if (this.BookmarkButtonsObj) {
				(<HTMLElement> this.BookmarkButtonsObj).style.display = 'none';
			}
		}
		private ShowOwnerButtons(): void {
			if (this.BookmarkButtonsObj) {
				(<HTMLElement> this.BookmarkButtonsObj).style.display = 'block';
			}
		}
		private HideOwnerComment(Obj: HTMLElement): void {
			Obj.style.display = 'none';
		}
		private ShowOwnerComment(Obj: HTMLElement): void {
			Obj.style.display = 'block';
		}
		public MakeButton(N: string): string {
			if (!this.ShowCommentButton) {
				return '';
			}
			var commentText = (this.Owner.UILangData && this.Owner.UILangData["comment"]) || "Комментировать";
			return '<a class="comment-bookmark action-icon" title="' + commentText + '" data-n="' + N + '"' +
				'href="javascript:void(0);">&nbsp;</a>';
		}
		public MakeComment(text: string): string {
			if (!this.ShowCommentBox) {
				return '';
			}
			return '<div class="bookmark-comment"' +
				(text.replace(/<\/?p>/ig, '') != '' ? ' style="display:block;"' : '') + '>' +
					text.replace(/\n/ig, '<br />') + '</div>';
		}
	}

	class ShareList implements IShareList {
		private Obj: HTMLElement;
		public ShareWindowObj: IShareWindow;
		private ShowShareButton: boolean;
		private ShareOptions: IShareType[];
		private BookmarkButtonsObj: Node;
		private ShowState: boolean;
		public CurrentObj: HTMLElement;
		public HTML: string;
		constructor (private Owner: IBookmarksWindow) {
			this.Owner.RegisterWindow(this);
			this.ShowShareButton = true;
			this.ShowState = false;
			this.ShareOptions = [];
			// добалять ВК только для русского языка
            var lang = (this.Owner.UILangData && this.Owner.UILangData["lang"]) || "ru";
            var shareText = (this.Owner.UILangData && this.Owner.UILangData["share"]) || "Поделиться";
			if (lang == "ru") {
				this.ShareOptions.push(
                    {
                        name: 'Вконтакте',
                        buttonClass: 'vk',
                        buttonName: 'Вконтакте',
                        shareButtonText: shareText,
                        state: true,
                        obj: <any> VkontakteSharing
                    });
			}
			// Facebook и Twitter - для всех
			this.ShareOptions.push(
                {
                    name: 'Facebook',
                    buttonClass: 'fb',
                    buttonName: 'Facebook',
                    shareButtonText: '<span></span> ' + shareText,
                    state: true,
                    obj: <any> FacebookSharing
                },
                {
                    name: 'Twitter',
                    buttonClass: 'tw',
                    buttonName: 'Twitter',
                    shareButtonText: shareText,
                    state: true,
                    obj: <any> TwitterSharing
                }
			);
			this.MakeHTML();
		}
		private GetOption(val: string): IShareType {
			for (var j = 0; j < this.ShareOptions.length; j++) {
				if (this.ShareOptions[j].buttonClass == val) {
					return this.ShareOptions[j];
				}
			}
		}
		private MakeHTML() {
			this.HTML = '<ul class="sharebookmark-list">';
			for (var j = 0; j < this.ShareOptions.length; j++) {
				if (this.ShareOptions[j].state) {
					this.HTML += '<li class="' + this.ShareOptions[j].buttonClass + '">' +
						this.ShareOptions[j].buttonName + '</li>';
				}
			}
			this.HTML += '</ul>';
		}
		private Init() {
			if (!this.Obj) {
				this.Obj = <HTMLElement> this.Owner.Obj.querySelector('.sharebookmark-list');
				var buttons = this.Obj.querySelectorAll('.sharebookmark-list li');
				for (var j = 0; j < buttons.length; j++) {
					buttons[j].addEventListener('click', (event) => this.ShareWindowInit(event), false);
				}
			}
			this.Owner.HideRegisteredWindows();
		}
		private ReplaceHTML(): void {
			this.CurrentObj.querySelector('.bookmark-buttons').appendChild(this.Obj);
		}
		private ShowWindow(): void {
			this.ShowState = true;
			removeClass(<HTMLElement> this.Obj, 'topList');
			this.ToggleWindow('block');
			var offsetTop = this.Obj.getBoundingClientRect().top;
			if (offsetTop + this.Obj.offsetHeight > window.innerHeight) {
				addClass(<HTMLElement> this.Obj, 'topList');
			}
		}
		public HideWindow(): void {
			if (!this.Obj || !this.ShowState) {
				return;
			}
			this.ShowState = false;
			this.ToggleWindow('none');
		}
		public ToggleWindow(state: string) {
			this.Obj.style.display = state;
		}
		public ShowListBox(event) {
			if (!this.ShowState) {
				this.Init();
				if (event) {
					this.CurrentObj = this.Owner.GetObj(event.currentTarget.getAttribute('data-n'));
					this.ReplaceHTML();
				}
				this.ShowWindow();
			} else {
				this.HideWindow();
			}
		}
		private ShareWindowInit(event): void {
			if (this.Owner.CreateBookmarkState) {
				this.Owner.ToggleWindow('none');
			}
			this.Owner.ShareListObj.HideWindow();
			var target = <HTMLElement> (event.target || event.srcElement);
			this.ShareWindowObj = new ShareWindow(this.Owner, this.GetOption(target.className), this);
		}
		public MakeButton(N: string): string {
			if (!this.ShowShareButton) {
				return '';
			}
			var shareText = (this.Owner.UILangData && this.Owner.UILangData["share"]) || "Поделиться";
			return '<a class="share-bookmark" data-n="' + N + '"' +
				'href="javascript:void(0);"><span class="action-icon"></span>' + shareText +'</a>';
		}
		public SetHandlers(): void {
			var buttons = this.Owner.Obj.querySelectorAll('.share-bookmark');
			for (var j = 0; j < buttons.length; j++) {
				buttons[j].addEventListener('click', (event) => this.ShowListBox(event), false);
			}
		}
	}

	class ShareWindow implements IShareWindow {
		private Obj: HTMLElement;
		private TextObj: HTMLTextAreaElement;
		private Text: string;
		private Comment: string;
		private Placeholder: string;
		public CurrentObj: HTMLElement;
		public ButtonClass: string[] = null;
		public ShowState: boolean;
		constructor (private Owner: IBookmarksWindow, private ShareObj: IShareType, private Parent: IShareList) {
			this.ShowState = false;
			this.Placeholder = 'Текст, который вы хотите пошарить';
			this.Text = '';
			this.Comment = '';
			this.Owner.RegisterWindow(this);
			this.Obj = <HTMLElement> document.querySelector('#facebook');
			this.TextObj = <HTMLTextAreaElement> this.Obj.querySelector('textarea');
			var ShareButton = <HTMLElement> this.Obj.querySelector('.share-button');
			ShareButton.innerHTML = this.ShareObj.shareButtonText;
			addClass(ShareButton, 'share-action-' + this.ShareObj.buttonClass);
			this.ShowWindow();
			(<HTMLElement> this.Obj.querySelector('.share-cancel-button')).onclick = () => this.ShareCancel();
			ShareButton.onclick = () => {
				var bookmark = this.Owner.GetBookmark(this.Parent.CurrentObj.getAttribute('data-id'));
				if (bookmark.Note[0] && bookmark.Note[0].length >= Bookmarks.SHARE_BOOKMARK_MIN_LEN) {
					this.BeforeShareInit();
				} else {
					this.ShareInit();
				}
			}
			var placeholder = new PlaceholderClass(this.TextObj, (text) => this.TextAreaCallback(text), this.Placeholder);
			this.Owner.Parent.WindowsCarry.RegisterWindow(this);
		}
		public ShowWindow(): void {
			this.ToggleWindow('block');
			this.FillShareWindow();
			this.ShowState = true;
		}
		public HideWindow(): void {
			this.ShowState = false;
			if (!this.Obj) {
				return;
			}
			var ShareButton = <HTMLElement> this.Obj.querySelector('.share-button');
			removeClass(ShareButton, 'share-action-' + this.ShareObj.buttonClass);
			this.ToggleWindow('none');
			if (this.Owner.CreateBookmarkState) {
				this.Owner.CreateBookmarkState = false;
				this.Owner.Parent.Mask.Hide();
			}
		}
		private ToggleWindow(state: string) {
			this.Obj.style.display = state;
		}
		private FillShareWindow() {
			var bookmark = this.Owner.GetBookmark(this.Parent.CurrentObj.getAttribute('data-id'));
			var CurrentNote = bookmark.RoundClone(false);
			this.Text = this.ShareObj.obj.CookText(<string> CurrentNote.RawText);
			this.Comment = this.ShareObj.obj.CookComment(<string> bookmark.Note[1]);
			this.TextObj.value = this.Text + '\r\n' + this.Comment;
			(<HTMLElement> this.Obj.querySelector('.facebook-title span:last-child')).innerHTML = this.ShareObj.name;
			(<HTMLElement> this.Obj.querySelector('.share-book-title')).innerHTML = this.ShareObj.obj.Name;
			(<HTMLElement> this.Obj.querySelector('.share-book-author')).innerHTML = this.ShareObj.obj.Caption;
			var url = (<HTMLElement> this.Obj.querySelector('.share-book-cover a'));
			url.setAttribute('href', this.ShareObj.obj.URL);
			var shareImage = (<HTMLElement> this.Obj.querySelector('.share-book-cover img'));
			var image = new Image();
			image.onload = function () {
				var img:HTMLImageElement = <HTMLImageElement>this;
				shareImage.setAttribute('src', img.src);
				shareImage.setAttribute('height',
					Math.round(parseInt(shareImage.getAttribute('width')) / (img.width / img.height)).toString());
			};
			image.src = this.ShareObj.obj.Image;
			this.TextObj.scrollTop = this.TextObj.scrollHeight;
			this.TextObj.onkeyup = this.TextObj.onkeydown = this.TextObj.onchange =
				this.TextObj.oninput = (<any> this.TextObj).onpropertychange = (event: any) => {
					var target = <HTMLTextAreaElement> (event.target || event.srcElement);
					this.setCurrentTextLen(target.value.length);
				};
			this.setCaretToPos(this.TextObj, this.Text.length);
			(<HTMLElement> this.Obj.querySelector('.quote-comment .len-max')).innerHTML =
				this.ShareObj.obj.TextLimit.toString();
			this.setCurrentTextLen(this.Text.length, this.ShareObj.obj.TextLimit);
			this.Owner.Parent.ZoomObj.ZoomAnything(this.Obj, this.Obj.offsetWidth, this.Obj.offsetHeight);
		}
		private ShareInit() {
			var bookmark = this.Owner.GetBookmark(this.Parent.CurrentObj.getAttribute('data-id'));

			this.Comment = this.TextObj.value;
			this.ShareObj.obj.FillData('', this.Comment);
			
			this.ShareObj.obj.ShareInit();
		}
		private BeforeShareInit() {
			var Bookmarks = this.Owner.Parent.Bookmarks; 
			var bookmark = this.Owner.GetBookmark(this.Parent.CurrentObj.getAttribute('data-id'));

			var callback = () => {
				Bookmarks.MakeBookmarkPublic(bookmark, () => {
					this.ShareObj.obj.HideLoading();
					this.ShareObj.obj.URL = `http://www.litres.ru/pages/view_quote/?id=${bookmark.ID}`;
					this.ShareInit();
				}, (resultObject) => {
					try {
						// По каким-то причинам нельзя выставить признак публичности для данной цитаты. Например, если она уже публичная
						if (resultObject.error_code == 101155) {
                            this.ShareObj.obj.HideLoading();
                            this.ShareObj.obj.URL = `http://www.litres.ru/pages/view_quote/?id=${bookmark.ID}`;
                            this.ShareInit();
						} else {
                            this.ShareObj.obj.HideLoading();
						}
					} catch (e) {
                        this.ShareObj.obj.HideLoading();
					}
				});
			};

			var failureCallback = () => {
                this.ShareObj.obj.HideLoading();
			};

			if (bookmark.TemporaryState) {
				this.ShareObj.obj.ShowLoading();
				bookmark = Bookmarks.CreateBookmarkFromTemporary(
					bookmark.Group.toString(),
					bookmark,
					this.Owner.Parent.GetTitleFromTOC(bookmark.Range).substr(0, 100),
					callback,
                    failureCallback
				);
				return;
			}

			this.ShareObj.obj.ShowLoading();
			callback();
		}
		private ShareCancel() {
			this.HideWindow();
		}
		private TextAreaCallback(text) {
			this.Text = text;
		}
		private setCurrentTextLen(num: number, max?: number) {
			var comment = <HTMLElement> this.Obj.querySelector('.quote-comment');
			var button = <HTMLElement> this.Obj.querySelector('.share-button');
			(<HTMLElement> comment.querySelector('.len-current')).innerHTML = num.toString();
			if (!max) {
				max = parseInt((<HTMLElement> comment.querySelector('.len-max')).innerHTML);
			}
			if (num == 0 || num > max) {
				addClass(comment, 'red');
				button.setAttribute('disabled', 'disabled');
			} else {
				removeClass(comment, 'red');
				button.removeAttribute('disabled');
			}
		}
		private setSelectionRange(input, selectionStart, selectionEnd) {
			if (input.setSelectionRange) {
				input.focus();
				input.setSelectionRange(selectionStart, selectionEnd);
			} else if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			}
		}
		private setCaretToPos(input, pos) {
			this.setSelectionRange(input, pos, pos);
		}
	}

	export class PlaceholderClass {
		constructor (private Obj: HTMLTextAreaElement, private Callback, private Placeholder) {
			this.Obj.addEventListener('focus', (event) => this.focusCommentTextarea(event), false);
			this.Obj.addEventListener('blur', (event) => this.blurCommentTextarea(event), false);
		}
		private focusCommentTextarea(event) {
			var target = <HTMLTextAreaElement> (event.target || event.srcElement);
			if (target.value == this.Placeholder)
				return this.toggleCommentPlaceholder('');
		}
		private blurCommentTextarea(event) {
			var target = <HTMLTextAreaElement> (event.target || event.srcElement);
			if (target.value == '') {
				return this.toggleCommentPlaceholder(this.Placeholder);
			}
		}
		private toggleCommentPlaceholder(text) {
			this.Callback(text);
		}
	}

	export class BookmarkCreateWindow extends BookmarksWindow {
		public Obj: HTMLElement;
		public HTML: string;
		public CreateBookmarkState: boolean;
		private Colors;
		private CurrentColor: number;
		private Placeholder: string;
		private ColorPickerObj: HTMLElement;
		private ColorsButtons;
		private Owner: ContextMenu.IContextMenuClass; // we need this stupidity
		constructor (Obj: HTMLElement, Parent: EventsModule.IEventActions) {
      super(Obj, Parent, UILangData);
			this.Colors = [
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
			this.Placeholder = yourCommentText;
			this.CommentObj.UpdateCommentState = false;
		}
		public SetObjectList() {
			this.ButtonClass = null;
		}
		public MakeHTML() {
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
		}
		private GetCurrentColor() {
			this.CurrentColor = 1;
			for (var j = 0; j < this.Colors.length; j++) {
				if (this.Colors[j].name == this.Owner.FoundedBookmark.Class) {
					this.CurrentColor = this.Colors[j].id;
					break;
				}
			}
		}
		private SetCurrentColor() {
			for (var j = 0; j < this.ColorsButtons.length; j++) {
				removeClass(<HTMLElement> this.ColorsButtons[j], 'current');
			}
			addClass(<HTMLElement> this.ColorPickerObj.querySelector('li[data-id="' + this.CurrentColor + '"]'),
				'current');
		}
		private MakeColorPicker() {
			var output = '';
			for (var j = 0; j < this.Colors.length; j++) {
				output += '<li data-id="' + this.Colors[j].id + '"' +
					(this.Colors[j].id == this.CurrentColor ? ' class="current"' : '') +
					' style="background:#' + this.Colors[j].rgb + '"></li>';
			}
			this.ColorPickerObj.innerHTML = output;
			this.SetColorHandlers();
		}
		private SetColorHandlers() {
			this.ColorsButtons = this.ColorPickerObj.querySelectorAll('li');
			for (var j = 0; j < this.ColorsButtons.length; j++) {
				this.ColorsButtons[j].addEventListener('click', (e) => this.ColorPickCallback(e), false);
			}
		}
		private ColorPickCallback(event) {
			var target = <HTMLElement> (event.target || event.srcElement);
			for (var j = 0; j < this.Colors.length; j++) {
				if (this.Colors[j].id == target.getAttribute('data-id')) {
					this.CurrentColor = this.Colors[j].id;
					this.SetCurrentColor();
					this.Owner.FoundedBookmark.Class = this.Colors[j].name;
					this.Owner.FoundedBookmark.DateTime = moment().unix();
					this.Parent.Reader.Redraw(() => {
						this.Parent.Reader.Site.StoreBookmarksHandler(200);
					});
					break;
				}
			}
		}
		private Init() {
			if (!this.Obj) {
				this.Obj = <HTMLElement> document.querySelector('#createBookmark');
				(<HTMLElement> this.Obj.querySelector('.overlay-wrap')).innerHTML = this.HTML;
				this.ColorPickerObj = <HTMLElement> this.Obj.querySelector('.color-pick');
				this.MakeColorPicker();
				this.ShareListObj.CurrentObj = this.Obj;
				this.ShareListObj.ShowListBox(false);
				this.ShareListObj.SetHandlers();
				this.CommentObj.CurrentObj = this.Obj;
				this.Obj.querySelector('.create-bookmark-cancel').addEventListener('click', () => this.BookmarkCancel(), false);
				this.Obj.querySelector('.create-bookmark-save').addEventListener('click', () => this.BookmarkSave(), false);
			}
		}
		public ShowWindow(Owner?: ContextMenu.IContextMenuClass): void {
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
		}
		public HideWindow(): void {
			this.CreateBookmarkState = false;
			if (!this.Obj) {
				return;
			}
			this.Parent.Mask.Hide();
			this.ToggleWindow('none');
		}
		private BookmarkCancel() {
			this.Parent.WindowsCarry.HideAllWindows(true); // TODO: keep? no? yes?
		}
		private BookmarkSave() {
			var FoundedBookmark = this.Owner.FoundedBookmark;
			this.CommentObj.SetBookmarkNote(FoundedBookmark);
			if (FoundedBookmark.TemporaryState) {
				this.Parent.Bookmarks.CreateBookmarkFromTemporary(
					FoundedBookmark.Group.toString(), 
					FoundedBookmark, 
					this.Parent.GetTitleFromTOC(FoundedBookmark.Range).substr(0, 100)
				);
			}
			this.Parent.WindowsCarry.HideAllWindows();
		}
	}
}