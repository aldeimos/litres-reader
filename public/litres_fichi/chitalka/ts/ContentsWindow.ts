/// <reference path="ContentsWindowHead.ts" />

module Contents {
	export class ContentsWindow implements IContentsWindow {
		private Scroll;
		private ShowState: boolean;
		private ObjList: HTMLElement;
		public WindowData;
		private ButtonClass: string[] = ['menu-toc'];
		constructor (public Obj: HTMLElement, public Parent: EventsModule.IEventActions, public FinishFunction: Function = () => {}) {
			this.ShowState = false;
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
			this.ObjList = <HTMLElement> this.Obj.querySelector('#toc-wrap ul');
		}
		private MakeContent() {
			this.PrepareData();
			this.ObjList.innerHTML = this.ParseWindowData();
			this.SetHandlers();
		}
		private MakeTOCTree(TOC: FB3DOM.ITOC[], deep: number = 1): string {
			var out = '';
			for (var j = 0; j < TOC.length; j++) {
				var row = TOC[j],
					current = '',
					el = 'a',
					href = '',
					icons = '',
					bookmarkCount = 0;

				if (row.bookmarks) {
					if (row.bookmarks.g0) {
						current = ' current';
						el = 'a class="current"';
					}
					icons += '<span class="toc-icons">';
					if (row.bookmarks.g3) {
						bookmarkCount += row.bookmarks.g3 * 1;
					}
					if (row.bookmarks.g5) {
						bookmarkCount += row.bookmarks.g5 * 1;
					}
					if (bookmarkCount) {
						icons += '<span class="icon-type icon-type-3"></span>' +
							'<span class="icon-text">' + bookmarkCount + '</span>';
					}
					if (row.bookmarks.g1) {
						icons += '<span class="icon-type icon-type-1"></span>' +
							'<span class="icon-text">' + row.bookmarks.g1 + '</span>';
					}
					icons += '</span>';
				}
				var title, innerLi, hasTcl;
				if (row.t) {
					hasTcl = row.tcl || this.hasAllTcl(row);
					title = this.Parent.PrepareTitle(row.t);					
					innerLi = hasTcl ?  title : `<${el}${href}>${title}${icons}</${el}>`;
					
					out += `<li class="deep${deep}${current}" data-e="${row.s}" ${hasTcl ? 'data-tcl="true"' : ''}>${innerLi}</li>\r\n`;
				}
				if (row.c) {
					for (var i = 0; i < row.c.length; i++) {
						out += this.MakeTOCTree([row.c[i]], deep + 1);
					}
				}
			}
			return out;
		}
		private hasAllTcl(row): boolean {
			var childs = row.c;

			if (!childs) {
				return false;
			}

			var i = 0, len = childs.length;
			while (i < len) {
				if (!childs[i].tcl) {
					return false;
				}
				i++;
			}

			return true;
		}
		private ParseWindowData() {
			var html = this.MakeTOCTree(this.WindowData);
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
			this.ShowState = false;
		}
		private ToggleWindow(state: string) {
			this.Obj.style.display = state;
		}
		public PrepareData() {
			this.WindowData = this.Parent.Reader.TOC();
		}
		private SetHandlers() {
			var buttons = this.Obj.querySelectorAll('li'),
				button;
			for (var j = 0; j < buttons.length; j++) {
				button = buttons[j];
				if (!button.hasAttribute('data-tcl')) {
					button.addEventListener('click', (e) => this.GoToTOCEntry(e), false);
					continue;
				} 
				button.addEventListener('click', (e) => this.FinishFunction(e), false);
			}
		}
		private GoToTOCEntry(e) {
			var e = this.Parent.GetEvent(e);
			var target = <HTMLElement> (e.target || e.srcElement);
			target = this.Parent.GetElement(target, 'li');
			var Reader = this.Parent.Reader,
				AuthorizeIFrame = Reader.Site.AuthorizeIFrame,
				TOC = Reader.FB3DOM.TOC,
				Percent = Number(target.getAttribute('data-e')) / TOC[TOC.length - 1].e * 100;
			this.Parent.WindowsCarry.HideAllWindows();
			if (this.Parent.Reader.Site.IsAuthorizeMode()) {
				if (AuthorizeIFrame.Hidden) {
					AuthorizeIFrame.SetPercent(Percent);
					AuthorizeIFrame.Show();
				}
			} else {
				LitresHistory.push(this.Parent.Bookmarks.Bookmarks[0].Range.From.slice(0));
				this.Parent.Reader.GoTO([ parseInt(target.getAttribute('data-e')) ]);
			}
		}
	}
}