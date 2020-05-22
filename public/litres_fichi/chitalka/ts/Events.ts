/// <reference path="EventsHead.ts" />

module EventsModule {
	export class EventActions implements IEventActions {
		private PreventDoubleClick: boolean;
		private PreventDoubleClickTimer: number;
		private PreventTimerVlaue: number;
		public IsMouseDown: boolean = false;
		public WindowsCarry: IWindowsCarry;
		public Mask: IMask;
		public SelectionObj: SelectionModule.ISelectionClass;
		public Reader: FB3Reader.IFBReader;
		public Bookmarks: FB3Bookmarks.IBookmarks;
		public PDA: IPDAstate;
		public ZoomObj: IZoomClass;
		public ChapterObj: IChapterClass;
		private NavArrowsInited: boolean;
		private ListListeners:{ element: HTMLElement, context: any, boundUp:any, boundDown:any,boundMove:any }[];
		constructor (public ReaderBox: HTMLElement,	
								 public FooterBox: HTMLElement, public WrapperBox: HTMLElement) {
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
		public GetEvent(e?) {
			return e || window.event;
		}
		public 	checkIEOrFFBrowser(): boolean {
		// TODO: make it better!
		var ua = navigator.userAgent;
		var tmp = []
		if(ua.match(/iPhone|Android|iPad/i) != null) {
			return false
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
	}
	public CopyToClipboard(text: string): void {
		var textArea = document.createElement("textarea");

		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
	  
		try {
		  document.execCommand("copy");
		} catch (error) {
		  console.error("Unable to copy", error);
		}
	  
		document.body.removeChild(textArea);
	}
	//подпись на событие и диспатч в подписанные методы
	private AddTouchEvent(element):void {
		var downEvent,upEvent,moveEvent;
		var that = this;
		var el = element;
		var downEvents = ["touchstart","mousedown"];
		var upEvents = ["touchend","mouseup"];
		var moveEvents = ["touchmove","mousemove"]
		if(window.navigator.pointerEnabled) {			
			downEvents.push("pointerdown")
			upEvents.push("pointerup")
			moveEvents.push("pointermove")
		} else if(window.navigator.msPointerEnabled) {
			downEvents.push("mspointerdown")
			upEvents.push("mspointerup")
			moveEvents.push("mspointermove")
		}
		for(var i = 0; i < downEvents.length; i++) {
			if(element["on" + downEvents[i]]) {
				return;
			}
			element["on" + downEvents[i]] = (e) => {
				e.preventDefault()
				callback("customTouchStart", e);								
			}
			element["on" + upEvents[i]] = (e) => {
				e.preventDefault()			
				callback("customTouchEnd", e);				
			}		
			element["on" + moveEvents[i]] = (e) => {
				e.preventDefault()
				callback("customTouchMove", e);
			}				
		}

		function callback(name:string,e) {
			var functionName = ""
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
			while(i--) {
				if(that.ListListeners[i]) {
					if(that.ListListeners[i][functionName]) {
						that.ListListeners[i][functionName](e)
					}	
				}
			}			

		}	
	}
		//добавление методов для определенного события
		public AddEvents(TouchStartFunction: Function,TouchEndFunction: Function,TouchMoveFunction: Function,element:HTMLElement, context:any, priority?:boolean):void {

			var boundDown = TouchStartFunction ? TouchStartFunction.bind(context) : null,
				boundUp = TouchEndFunction ? TouchEndFunction.bind(context) : null,
				boundMove = TouchMoveFunction ? TouchMoveFunction.bind(context) : null;
			this.AddTouchEvent(element);			
			if(!this.ListListeners) {
				this.ListListeners = [];	

				if (navigator.userAgent.match(/Firefox/i) != null || navigator.userAgent.match(/MSIE/i) != null || navigator.userAgent.match(/iPhone|iPad/i) != null) {
				    var head  = document.getElementsByTagName('head')[0];
				    var link  = document.createElement('link');
				    link.rel  = 'stylesheet';
				    link.type = 'text/css';
				    link.href = 'css/touch_ff_ie.css';
				    head.appendChild(link);
				}					
			}
			var downEvent,upEvent,moveEvent;
			if(priority) {
				this.ListListeners.splice(0,0,{element:element, context:context, boundDown:boundDown,boundUp:boundUp,boundMove:boundMove})	
			} else {
				this.ListListeners.push({element:element, context:context, boundDown:boundDown,boundUp:boundUp,boundMove:boundMove})				
			}

		}
		//удаление методов для определенного события
		public RemoveEvents(element:HTMLElement, context:any,down?:boolean,up?:boolean,move?:boolean):void {
			var boundUp,boundDown,boundMove;
			var currentPosition = null;

			for(var i in this.ListListeners) {
				if(this.ListListeners[i].element && this.ListListeners[i].element == element &&
					this.ListListeners[i].context && this.ListListeners[i].context == context) {
					if(down && !this.ListListeners[i].boundDown) continue
					if(up && !this.ListListeners[i].boundUp) continue
					if(move && !this.ListListeners[i].boundMove) continue
					boundUp = this.ListListeners[i].boundUp;
					boundDown = this.ListListeners[i].boundDown;
					boundMove = this.ListListeners[i].boundMove;
					this.ListListeners.splice(parseInt(i),1);
					break;
				}
			}
		}

		public GetCoordinates(e, Coords?: SelectionModule.IMoveCoordinates): SelectionModule.IMoveCoordinates {
			var e = this.GetEvent(e);
			var X = 0;
			var Y = 0;
			var Button = e.which || e.button || null;
			var touches = e.changedTouches || e.touches;
			if (touches && touches.length) {
				X = touches[0].clientX;
				Y = touches[0].clientY;
			} else {
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
		}
		public PageForward() {
			var Site = this.Reader.Site,
				AuthorizeIFrame = Site.AuthorizeIFrame;

			var Percent = this.Reader.CurPosPercent();
			if (Site.IsAuthorizeMode() && Site.IsAlreadyClicked()) {
				if (AuthorizeIFrame.Hidden) {
					AuthorizeIFrame.SetPercent(Percent);
					AuthorizeIFrame.Show();
				}
			} else {
				this.Reader.PageForward();
			}
		}
		public PageBackward() {
			var Site = this.Reader.Site,
				AuthorizeIFrame = Site.AuthorizeIFrame;

			if (Site.AuthorizeIFrame.Hidden) {
				var Percent = this.Reader.CurPosPercent();
				this.Reader.PageBackward();
			}
		}
		public CheckFirefoxTouchEvent(e): boolean {
			if (e.mozInputSource && e.mozInputSource === e.MOZ_SOURCE_TOUCH) {
				return true;
			} else {
				return false;
			}
		}
		public CheckIETouchEvent(e): boolean {
			if (e.pointerType && e.pointerType == 'touch') {
				return true;
			} else {
				return false;
			}
		}		
		public GoToBookmark(e): void {
			var e = this.GetEvent(e);
			var target = <HTMLElement> (e.target || e.srcElement);
			LitresHistory.push(this.Bookmarks.Bookmarks[0].Range.From.slice(0));
			if (this.PDA.state) {
				this.WindowsCarry.HideAllWindows();
			}
			this.Reader.GoTO([ parseInt(target.getAttribute('data-e')) ]);
		}
		public RemoveSelection(): boolean {
			if (this.SelectionObj) {
				return this.SelectionObj.Remove();
			}
			return true;
		}
		public SetPreventDoubleCheck() {
			this.PreventDoubleClick = true;
			this.PreventDoubleClickTimer = setTimeout(() => { this.PreventDoubleClick = false; }, this.PreventTimerVlaue);
		}
		public CheckDoubleClick(): boolean {
			return this.PreventDoubleClick;
		}
		public SkipOnElement(e): boolean {
			var e = this.GetEvent(e);
			var target = <HTMLElement> (e.target || e.srcElement);
			if (target.className.match(/zoom_block/i) || target.tagName.match(/^a$/i)
				|| target.parentElement.tagName.match(/^a$/i)) return true;
			return false;
		}
		public Resize() {
			calcHeight();
			this.AddNavArrows();
		}
		public Refresh() {
			this.Reader.RedrawVisible();
		}
		public CheckProgressBar() {
			return progressBar.swipeState;
		}
		public GetTitleFromTOC(Range: FB3DOM.IRange, TOC?: FB3DOM.ITOC[]): string {
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
		}
		public PrepareTitle(str: string): string {
			return str.replace(/&/g, '&amp;')
							.replace(/</g, '&lt;')
							.replace(/>/g, '&gt;')
							.replace(/"/g, '&quot;')
							.replace(/'/g, '&apos;')
							.replace(/\[\d+\]|\{\d+\}/g, '');
		}
		public StopPropagation(e): boolean {
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.cancelBubble = true;
			return false;
		}
		
		public GetCurrentBox(): HTMLElement {
			return this.WrapperBox;
		}

		public GetElement(Obj: HTMLElement, Looking: string): HTMLElement {
			// TODO: add counter, return current when X
			if (Obj.tagName.toLowerCase() != Looking) {
				return this.GetElement(<HTMLElement> Obj.parentNode, Looking);
			}
			return Obj;
		}
		public AddNavArrows(): void {
			var arrowsBox = (<HTMLElement> doc.querySelector('.bottom-arrows'));
			if ((!this.PDA.state && !LitresFullScreen.fullScreen) ||
				aldebaran_or4 ||
				(this.PDA.state && this.PDA.form == 'tablet' && !LitresFullScreen.fullScreen)) {
					if (!this.NavArrowsInited && aldebaran_or4) {
						setSetting(1, 'enableClick');
					}
					var forward = (<HTMLElement> doc.querySelector('.bottom-right'));
					arrowsBox.style.display = 'block';
					arrowsBox.style.top = Math.floor(this.GetCurrentBox().offsetHeight / 2 - forward.offsetHeight / 2) + 'px';
					forward.style.left = (this.GetCurrentBox().offsetWidth - forward.offsetWidth) + 'px';
					if (!this.NavArrowsInited) {
						forward.addEventListener("click", this.PageForward.bind(this), false);
						(<HTMLElement> doc.querySelector('.bottom-left'))
							.addEventListener("click", this.PageBackward.bind(this), false);
					}
					this.NavArrowsInited = true;
			} else {
				arrowsBox.style.display = 'none';
			}
		}
	}

	export class KeydownClass {
		private KeysRules: any; // TODO: make interface
		constructor (private Owner: IEventActions) {
			this.KeysRules = {
				PageForward: {
					keys: {
						32: 'space',
						39: 'arrow ->',
						40: 'arrow down',
						34: 'PgDn'
					},
					action: () => this.Owner.PageForward()
				},
				PageBackward: {
					keys: {
						37: 'arrow <-',
						38: 'arrow up',
						33: 'PgUp'
					},
					action: () => this.Owner.PageBackward()
				},
				CopyToClipboard: {
					keys: {
						67: 'C',
						88: 'X'
					},
					action: (e) => {
						if (e.ctrlKey) {
							this.Owner.CopyToClipboard(this.Owner.SelectionObj.GetSelectedText());
						}
					}
				}
			};
			document.addEventListener('keydown', (e) => this.OnKeydown(e), false);
		}
		private OnKeydown(e) {
			var e = this.Owner.GetEvent(e);
			var target = <HTMLElement> (e.target || e.srcElement);
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
		}
	}

	export class MouseClickEvents implements IMouseClickClass {
		public MousePosStartX:number = 0;
		public MousePosEndX:number = 0;
		public MousePosStartY:number = 0;
		public MousePosEndY:number = 0;		
		private OneTouch:boolean = false;
		private GestureTID:number = 0;
		private Swipe: boolean = true;
		private SwipeTimerValue:number = 300;		
		private Debug:boolean = false;
		private DateStart: number = Date.now()
		public Owner:IEventActions;
		constructor (Owner: IEventActions) {
			this.Owner = Owner;
			this.AddHandlers();

		}
		public AddHandlers() {
	        this.Owner.AddEvents(this.OnTouchStart, this.OnTouchEnd,null,this.Owner.GetCurrentBox(),this);
			this.Owner.AddEvents(() => {
				this.Owner.IsMouseDown = true;
			}, () => {
				this.Owner.IsMouseDown = false;
			},null,this.Owner.GetCurrentBox(),this);
			if('ontouchstart' in document.documentElement) {
				this.Owner.GetCurrentBox().addEventListener('gestureend', (e) => this.onGuesture(e), false);
				this.Owner.GetCurrentBox().addEventListener('gesturestart', (e) => this.onGuestureStart(e), false);
				this.Owner.GetCurrentBox().addEventListener('gesturechange', (e) => this.onGuestureChange(e), false);					
			}
		}	
		private MouseTouchStart(Event) {
			this.TouchStart(Event.clientX,Event.clientY)
		}

		private MouseTouchEnd(Event) {	
			if(Date.now() - this.DateStart > this.SwipeTimerValue) return
			this.MousePosEndX = Event.clientX;
			this.MousePosEndY = Event.clientY;

			this.AltClick(Event)

		}		

		private TouchStart(x: number, y: number) {
			this.DebugLog("TouchStart")
			this.DateStart = Date.now();
			this.MousePosStartX=x;
			this.MousePosStartY = y;
		}
		public RemoveHandlers() {
			/*this.Owner.GetCurrentBox().onclick = function () {};
			(<any> this.Owner.GetCurrentBox()).ontouchend = function () {};
			(<any> this.Owner.GetCurrentBox()).ontouchstart = function () {};
			(<any> this.Owner.GetCurrentBox()).onmousedown = function () {};
			(<any> this.Owner.GetCurrentBox()).onmouseup = function () {};			*/
			this.Owner.RemoveEvents(this.Owner.WrapperBox,this)			
		}
		private AltClick(e: any) {
			if (!ContextObj.ShowState && (this.Owner.CheckFirefoxTouchEvent(e) || this.Owner.CheckIETouchEvent(e))) {
				this.OnClickHandler(e, 'touch');
			}
		}

		private OnTouchEnd(e) {
			this.DebugLog("Touchend")
			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches && this.Owner.PDA.state) return;
			if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar()) return;
			if(this.DateStart != 0 && Date.now() - this.DateStart > this.SwipeTimerValue) return			
			this.DateStart = 0;
			if (!ContextObj.ShowState && this.OneTouch) {
				var coord = this.Owner.GetCoordinates(e)
				this.MousePosEndX=coord.X;
				this.MousePosEndY=coord.Y;

				if (e.touches) {
                    this.OnTouchHandler(e, 'touch');
				} else {
                    this.OnClickHandler(e, 'click');
				}

			}
		}
		private OnTouchStart(e) {
			this.DebugLog("Touchstart")
			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches && this.Owner.PDA.state) return;
			if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar() || e.button === 2) return;
			var coord = this.Owner.GetCoordinates(e)
			this.TouchStart(coord.X, coord.Y)
			this.OneTouch = true;
		}		
		public onHideElements(e: any, type: string = 'click') {
			throw "error: empty method";
		}
		public OnClickHandler(e: any, type: string = 'click') {
			throw "error: empty method";
		}
        public OnTouchHandler(e: any, type: string = 'click') {
            throw "error: empty method";
        }
		private onGuestureStart(event) {
			//event.preventDefault();
		}
		
		private onGuestureChange(event) {
			//event.preventDefault();
			this.onGestureDo(this.getScale(event.scale));
		}

		public getScale(scaleMobile:number):number {
			var scale:number = 0
			if(scaleMobile > 1) {
				scale = 10 / scaleMobile
			} else {
				scale = scaleMobile;
			}
			return scale
		}

		private onGuesture(event) {
			
			if (this.GestureTID) {
				return;
			}
			this.GestureTID = setTimeout(this.onGestureDo.bind(this, this.getScale(event.scale)), 250);
			//event.preventDefault();
		}

		public onGestureDo(scale) {
			this.GestureTID = 0;
		}			
		private DebugLog(msg) {
			if (this.Debug) {
				//console.log('[MouseClick] ' + msg);
			}			
		}
	}

	export class MouseClickClass extends MouseClickEvents {
        private Debugs:boolean = false;
		constructor (public Owner: IEventActions) {
			super(Owner);
		}
		public AddHandlers() {
			super.AddHandlers()
		}

		public onHideElements(e: any, type: string = 'click') {
			if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar()) return;
			if (!this.Owner.CheckDoubleClick() && this.Owner.RemoveSelection()) {
				if (!this.Owner.PDA.state && type == 'click' && !getSetting('enableClick')) {
					return;
				}
				this.Owner.WindowsCarry.HideAllWindows();
			}
		}

			
		public OnClickHandler(e: any, type: string = 'click') {
			//We are scrolling the page using tap
			if(Math.abs(this.MousePosStartX - this.MousePosEndX) > 10 ||
				Math.abs(this.MousePosStartX - this.MousePosEndX) < Math.abs(this.MousePosStartY - this.MousePosEndY)) {
				return;
			}
			if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar()) return;
			if (!this.Owner.CheckDoubleClick() && this.Owner.RemoveSelection()) {
				this.Owner.SetPreventDoubleCheck();
				var Coords: SelectionModule.IMoveCoordinates = this.Owner.GetCoordinates(e);
				if (getSetting('enableClick')) {
					var area_width = Math.floor(this.Owner.GetCurrentBox().offsetWidth / 3);
					if (Coords.X > area_width * 2) {
						this.Owner.PageForward();
					} else if (Coords.X < area_width) {
						this.Owner.PageBackward();
					}
				}

				this.Owner.WindowsCarry.HideAllWindows();
			}
		}

        public OnTouchHandler(e: any, type: string = 'click') {
            // Если это не свайп, а просто тап, то показываем/скрываем меню или же листаем (в зависимости от зоны нажатия)
            if(Math.abs(this.MousePosStartX - this.MousePosEndX) < 10 ||
                Math.abs(this.MousePosStartX - this.MousePosEndX) < Math.abs(this.MousePosStartY - this.MousePosEndY)) {
                var area_width = Math.floor(this.Owner.GetCurrentBox().offsetWidth / 3);
                var Coords: SelectionModule.IMoveCoordinates = this.Owner.GetCoordinates(e);
                // если тап был по середине экрана или же при тапе была открыта менюшка - убираем менюшку
                if ((LitresFullScreen.fullScreen === false) || ((Coords.X >= area_width) && (Coords.X <= area_width * 2))) {
                    LitresFullScreen.showHiddenElements();
				} else if (Coords.X > area_width * 2) {
                    this.Owner.PageForward();
                } else if (Coords.X < area_width) {
                    this.Owner.PageBackward();
                }
                return;
            }
            if (this.Owner.SkipOnElement(e) || this.Owner.CheckProgressBar()) return;
            var delta:number = this.MousePosEndX - this.MousePosStartX;
            this.DebugLogs("delta:" + delta);

            if (LitresFullScreen.fullScreen === false) {
                LitresFullScreen.showHiddenElements();
            }
            if (delta < 0) {
                this.DebugLogs("pageforward");
                this.Owner.PageForward();
            } else {
                this.DebugLogs("pagebackward");
                this.Owner.PageBackward();
            }
        }

        private DebugLogs(msg) {
            if (this.Debugs) {
                console.log('[TouchClass] ' + msg);
            }
        }
	}	

	export class TouchClass extends MouseClickEvents {
		private Debugs:boolean = false;
		constructor (public Owner: IEventActions, private fontsizeBar: IBarClass) {
			super(Owner);	
		}

		public onGestureDo(scale) {

			if(this.fontsizeBar) {
				this.fontsizeBar.setValueWithPercent(scale * this.fontsizeBar.getCurrentPercent() );
			}
			super.onGestureDo(scale)
		}

		private DebugLogs(msg) {
			if (this.Debugs) {
				console.log('[TouchClass] ' + msg);
			}			
		}
	}	

	export class MouseWheelClass {
		private NotesState: boolean;
		private Debug: boolean;
		constructor (private Owner: IEventActions) {
			this.Debug = false;
			this.Owner.GetCurrentBox().addEventListener("mousewheel", (e) => this.MouseWheel(e), false);
			this.Owner.GetCurrentBox().addEventListener("wheel", (e) => this.MouseWheel(e), false);
		}
		private MouseWheel(e) {
			e.preventDefault ? e.preventDefault() : (e.returnValue = false);

			var e = this.Owner.GetEvent(e);
			this.CheckNotesState(e);
			if (this.NotesState) {
				this.NotesState = false;
				this.DebugLog('notes scroll');
			} else {
				this.DebugLog('canvas scroll ' + this.Owner.CheckDoubleClick());
				if (!this.Owner.CheckDoubleClick()) {
					// TODO: fix touchpad imac problem
					this.Owner.SetPreventDoubleCheck();
					var delta = -e.deltaY || e.detail || e.wheelDelta;
					if(isNaN(delta)) {
						delta = e.detail;
					}
					this.DebugLog('delta ' + delta);
					if (delta < 0) {
						this.Owner.PageForward();
					} else {
						this.Owner.PageBackward();
					}
				}
			}
			this.Owner.WindowsCarry.HideAllWindows();
			return false;
		}
		private CheckNotesState(e) {
			var target = <HTMLElement> (e.target || e.srcElement);
			target = this.Owner.GetElement(target, 'div');
			if (hasClass(target, 'footnote') && target.scrollHeight != target.offsetHeight) {
				this.NotesState = true;
			}
			this.DebugLog(target.scrollHeight + ' ' + target.offsetHeight);
		}
		private DebugLog(str: string) {
			if (this.Debug) {
				console.log('[MouseWheelClass] ' + str);
			}
		}
	}

	export class ResizeClass {
		private ResizeTimer: number;
		private ResizeTimerValue: number; // time to prevent resize when you scale window
		constructor (private Owner: IEventActions) {
			this.ResizeTimerValue = 200;
			window.addEventListener('resize', (e) => this.Resize(e), false);
		}
		private Resize(e): void {
			this.ClearTimer();
			this.ResizeTimer = setTimeout(() => {
				if (!this.CheckShareWindow() && !this.CheckZoomInState()) {
					this.Owner.WindowsCarry.HideAllWindows();
				}
				this.Owner.Resize();
			}, this.ResizeTimerValue);
		}
		private ClearTimer() {
			clearTimeout(this.ResizeTimer);
			this.ResizeTimer = 0;
		}
		private CheckShareWindow(): boolean {
			var BookmarkWindow = this.Owner.WindowsCarry.GetWindow('menu-bookmark');
			var ShareObj = BookmarkWindow.obj.ShareListObj;
			if (ShareObj && ShareObj.ShareWindowObj && ShareObj.ShareWindowObj.ShowState) { // stupid fix
				return true;
			}
			return false;
		}
		private CheckZoomInState(): boolean {
			if (this.Owner.ZoomObj.ShowState && this.Owner.ZoomObj.ResizeState) {
				return true;
			}
			return false;
		}
	}

	export class ContextMenuTouch {
		private ContextMenuTime = 0;
		private CoordStart:any;
		constructor (private Owner: IEventActions) {
			this.AddHandlers()
		}
		private AddHandlers() {
			this.Owner.AddEvents(this.OnTouchStart,this.OnTouchEnd,null,this.Owner.WrapperBox,this)
			this.Owner.AddEvents(this.OnTouchStart,this.OnTouchEnd,null,this.Owner.ReaderBox,this)

		}

		private OnTouchStart(e) {
			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) return;		
			this.ContextMenuTime = Date.now();
			this.CoordStart = this.Owner.GetCoordinates(e)
		}		

		private OnTouchEnd(e) {
			
			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) return;
			var CoordEnd = this.Owner.GetCoordinates(e);
			if(Math.abs(CoordEnd.X - this.CoordStart.X) > 5 || Math.abs(CoordEnd.Y - this.CoordStart.Y) > 5) {
				this.ContextMenuTime = 0;
				return
			}
			if(this.Owner.SelectionObj.GetSelectionState()) {
				this.ContextMenuTime = 0;
				return;
			}
			if(this.ContextMenuTime != 0 && Date.now() - this.ContextMenuTime >= 1500) {
				this.Owner.GetCurrentBox().style.display = "block"		
				e.clientX = CoordEnd.X;
				e.clientY = CoordEnd.Y;
				ContextObj.ShowWindow(e);					

			}
			this.ContextMenuTime = 0;
		}
	}

	export class MaskClass implements IMask {
		private MaskObj: HTMLElement;
		constructor (private Owner: IEventActions) {
			this.MaskObj = <HTMLElement> document.querySelector('#mask');			
			this.AddHandlers();

		}
		private AddHandlers() {

			this.MaskObj.addEventListener('click', (e) => this.MaskClick(e), false);
			this.MaskObj.addEventListener('contextmenu', (e) => this.MaskOnMenu(e), false);

		}
		private MaskClick(e) {
			var e = this.Owner.GetEvent(e);
			this.Owner.WindowsCarry.HideAllWindows(true);
			return this.Owner.StopPropagation(e);
		}
		private MaskOnMenu(e): boolean {
			var e = this.Owner.GetEvent(e);
			if (ContextObj.ShowState) {
				this.MaskClick(e);
				ContextObj.ShowWindow(e);
			}
			return this.Owner.StopPropagation(e);
		}
		public Show(Opacity?: string, Color?: string) {
			var Opacity: string = Opacity || '0.3';
			var Color = Color || '0, 0, 0';
			this.MaskObj.setAttribute('style', 'background:rgba(' + Color + ', ' + Opacity + ');');
			this.Toggle('block');
		}
		public Hide(Callback?) {
			this.MaskObj.removeAttribute('style');
			this.Toggle('none');
			if (Callback) {
				Callback();
			}
		}
		private Toggle(state: string) {
			this.MaskObj.style.display = state;
		}
	}

	export class WindowsCarry implements IWindowsCarry {
		public WindowsStack;
		constructor (private Owner: IEventActions) {
			this.WindowsStack = [];
		}
		public RegisterWindow(WindowObj) {
			this.WindowsStack.push({
				obj: WindowObj,
				button: WindowObj.ButtonClass
			});
		}
		public ShowWindow(obj) {
			obj.ShowWindow();
		}
		public HideWindow(obj) {
			if (obj.HideWindow) { // TODO: fix for functions that dont have any windows
				obj.HideWindow();
			}
		}
		public FireHandler(obj, e) {
			obj.ButtonHandler(e);
		}
		public GetWindow(_class: string) {
			for (var j = 0; j < this.WindowsStack.length; j++) {
				for (var i = 0; i < this.WindowsStack[j].button.length; i++) {
					if (this.WindowsStack[j].button[i] == _class) {
						return this.WindowsStack[j];
					}
				}
			}
			return null;
		}
		public HideAllWindows(KeepSelection?: boolean, Callback?) {
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
		}
	}

	export class ZoomClass implements IZoomClass {
		public ZoomObj: IZoomObj;
		public ShowState: boolean;
		public ResizeState: boolean;
		private Obj: HTMLElement;
		private ZoomWrap: HTMLElement;
		private ZoomOutHTML: string;
		constructor (public Owner: IEventActions) {
			this.ResizeState = true;
			this.Obj = <HTMLElement> document.querySelector('#zoomedImg');
			this.ZoomWrap = <HTMLElement> this.Obj.querySelector('.readerStyles');
			this.ZoomOutHTML = '<a href="javascript:void(0);" class="zoom_block clicked"></a>';
			if (this.ResizeState) {
				window.addEventListener('resize', () => this.ZoomResize(), false);
			}
		}
		private AddHandlers(): void {
			this.Obj.querySelector('.zoom_block').addEventListener('click', () => {
				this.ZoomOut();
			}, false);
		}
		private GetDocumentSize(): IDocumentSize {
			// was thinking about to create new class attribute, but dont want to handle other events
			// thats why its function with obj return
			var Width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			var Height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			Height -= (<HTMLElement> document.querySelector('.top-box')).offsetHeight;
			return {
				w: Width,
				h: Height
			};
		}
		private Image2Center(): void {
			this.ZoomObj.w = this.ZoomObj.w ? this.ZoomObj.w : this.ZoomObj.obj.offsetWidth;
			this.ZoomObj.h = this.ZoomObj.h ? this.ZoomObj.h : this.ZoomObj.obj.offsetHeight;
			var DocSize: IDocumentSize = this.GetDocumentSize();
			this.ZoomObj.obj.style.left = Math.floor(DocSize.w / 2 - this.ZoomObj.w / 2) + 'px';
			this.ZoomObj.obj.style.top = Math.floor(DocSize.h / 2 - this.ZoomObj.h / 2) + 'px';
		}
		private ZoomResize(): void {
			if (this.ShowState) {
				this.ZoomOut();
			}
		}
		private SetZoomObj(obj, w, h): void {
			this.ZoomObj = { obj: obj, w: w, h: h };
		}
		public ZoomOut(state?: boolean): void {
			if (!this.ShowState) {
				return;
			}
			if (!state) { // already called from this.Owner.WindowsCarry.HideAllWindows
				this.Owner.WindowsCarry.HideAllWindows();
			}
			this.Obj.style.display = 'none';
			this.CleanObj();
			this.ShowState = false;
		}
		private CleanObj(): void {
			this.ZoomObj.obj.removeAttribute('style');
		}
		private ZoomIn(ZoomForeignObj?): void {
			if (!ZoomForeignObj) {
				this.PatchZoomObj();
			} else {
				this.AddBorders();
			}
			this.ShowState = true;
			if (!ZoomForeignObj) {
				this.AddHandlers();
			}
		}
		private ZoomMask(): void {
			this.Owner.Mask.Show('0.8');
			this.Obj.style.display = 'block';
		}
		public ZoomAnything(Obj: HTMLElement, w?: number, h?: number): void {
			this.ZoomObj = { obj: Obj };
			if (w) {
				this.ZoomObj.w = w;
			}
			if (h) {
				this.ZoomObj.h = h;
			}
			this.ZoomIn(true);
		}
		public ZoomIMG(Path: string, W: number, H: number): void {
			this.ZoomUpdateBox('<img src="' + Path + '" width="' + W + '" height="' + H + '" />');
			this.ZoomMask();
			this.SetZoomObj(this.Obj, W, H);
			this.ZoomIn();
		}
		public ZoomHTML(HTML: FB3DOM.InnerHTML): void {
			this.ZoomUpdateBox(<string> HTML);
			this.ZoomMask();
			this.SetZoomObj(this.Obj, this.Obj.clientWidth, this.Obj.clientHeight);
			this.ZoomIn();
		}
		private ZoomUpdateBox(Data: string) {
			this.ZoomWrap.innerHTML = this.ZoomOutHTML + Data;
		}
		private AddBorders(): void {
			var DocSize: IDocumentSize = this.GetDocumentSize();
			this.Obj.style.maxWidth = this.Owner.Reader.ColumnWidth() + 'px';
			this.Obj.style.maxHeight = DocSize.h + 'px';
		}
		private PatchZoomObj(): void {
			var DocSize: IDocumentSize = this.GetDocumentSize();
			if (!this.ZoomObj.w || DocSize.w <= this.ZoomObj.w) {
				this.Obj.style.width = DocSize.w + 'px';
				this.ZoomObj.w = 0;
			} else {
				this.Obj.style.width = 'auto';
			}
			if (!this.ZoomObj.h || DocSize.h <= this.ZoomObj.h) {
				this.Obj.style.height = DocSize.h + 'px';
				this.ZoomObj.h = 0;
			} else {
				this.Obj.style.height = 'auto';
			}

		}
	}

	export class ChapterClass implements IChapterClass {
		public ChapterObj: HTMLElement;
		private ChapterText: HTMLElement;
		private HideTimeout: number;
		private HideTimeoutTimer: number;
		private WindowWidth: number;
		constructor (public Owner: IEventActions) {
			this.WindowWidth = 340;
			this.HideTimeout = 0;
			this.HideTimeoutTimer = 1000;
			this.ChapterObj = <HTMLElement> document.querySelector('#footer .chapter-box');
			this.ChapterText = <HTMLElement> this.ChapterObj.querySelector('p');
		}
		public ShowWindow(Range: FB3DOM.IRange): void {
			var windowText = this.Owner.GetTitleFromTOC(Range);
			if (!windowText) {
				return;
			}

			this.SetChapterText(windowText);
			this.RepositionWindow();
			this.ToggleWindow('block');
		}
		public ClearWindow(): void {
			clearTimeout(this.HideTimeout);
			this.SetChapterText('&nbsp;');
		}
		private SetChapterText(text): void {
			this.RepositionWindow();
			this.ChapterText.innerHTML = text;
			if (text == '&nbsp;') {
				this.ChapterText.removeAttribute('title');
				return;
			}
			this.ChapterText.setAttribute('title', text);
		}
		public HideWindowTimer(): void {
			clearTimeout(this.HideTimeout);
			this.HideTimeout = setTimeout(() => this.HideWindow(), this.HideTimeoutTimer);
		}
		public HideWindow(): void {
			this.ToggleWindow('none');
		}
		private ToggleWindow(state: string): void {
			this.ChapterObj.style.display = state;
		}
		private RepositionWindow(): void {
			var half = this.WindowWidth / 2;
			var left = progressBar.dot.offsetLeft - half;
			if (left < 0) {
				left = 0;
			} else {
				left += progressBar.dot.offsetWidth / 2;
			}
			if (left + this.WindowWidth > progressBar.obj.offsetWidth) {
				left = progressBar.obj.offsetWidth - this.WindowWidth;
			}
			this.ChapterObj.style.left = left + 'px';
		}
	}
}