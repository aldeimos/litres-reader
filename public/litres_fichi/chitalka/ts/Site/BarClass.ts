interface IBarClass {
	type: string;
	obj: any;
	progress: any;
	dot: any;
	data?: Array<number>;
	dataCurrent?: number;
	swipeState: boolean;
	setValue(val?: number): void;
	toggleDisabled(state?: boolean): void;
	chromeWorkaround(): void;	
	getCurrentPercent(): number;
	setValueWithPercent(val:number):void;
	initFB3Mode(fragment:object, finishFunction?:Function):void
}
	
var doc = document;

module BarClassRe {
	var inputRange: boolean = false;
	var browser: string;

	export function checkHTML5Support(): void {
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
	function checkBrowser(): void {
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

	export class BarClass implements IBarClass {
		public progress: any;
		public dot: any;
		public swipeState: boolean;
		private mouseMoveState: boolean;
		private dotMouseClick: boolean;
		private progressCurrentLeft: number;
		private progressLeft: number;
		private progressWidth: number;
		private dataMax: number;
		private barState: boolean;
		private debug: boolean;
		private stickyObjs;
		private currentPercent: number;
		private eventType: string; // just literal for callback actions
		private finishFunction: Function;
		private track: HTMLElement;
		private trackFull: HTMLElement;
		private FB3Mode: boolean = false;
		constructor(public type,
			public obj,
			private pda_state: boolean,
			private callback?,
			private spanInfo?,
			public data?,
			public dataCurrent?,
			private progressSticky?,
			private drawStickyPointState?,
			private invertData?) {
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
				} else {
					this.initObjects();
					if (this.type == 'setting') {
						this.setValue();
					}
					this.setHandlers();
				}
		}
		public initFB3Mode(fragment, finishFunction?: () => {}) {
			if (this.type !== 'progress') {
				return;
			}

			const trackFull = this.obj.querySelector('.track-full');
			if (trackFull === null) {
				return;
			}
			this.trackFull = trackFull;

			if (typeof finishFunction === 'function') {
				this.finishFunction = finishFunction;
			}

			const track = this.obj.querySelector('.track');
			const computedStyle = getComputedStyle(track);

			const percent =  fragment.fragment_length / fragment.full_length * 100;
			const trackWidth = parseFloat(computedStyle.width) * percent;

			track.style.width = `${percent}%`;

			this.FB3Mode = true;
		}
		public isFB3Mode() {
			return this.FB3Mode;
		}
		private initObjects() {
			this.obj = doc.querySelector(this.obj);
			if (this.type == 'setting' && this.drawStickyPointState) {
				this.drawStickyPoint();
			}
			this.progress = this.obj.querySelector('.progress');
			this.track = this.obj.querySelector('.track');
			this.dot = this.obj.querySelector('.dot');
		}
		private setHandlers() {
			this.obj.onclick = (e) => this.barClickHandler(e);
			if (this.pda_state) {
				this.dot.ontouchstart = (e) => this.dotClickHandler(e);
				this.dot.ontouchend = (e) => this.swipeDone(e);
			} else {
				this.dot.onmousedown = (e) => this.dotClickHandler(e);
				this.dot.onmouseup = (e) => this.swipeDone(e);
			}
			var left = this.obj.parentNode.querySelector('.minus');
			if (left) {
				left.onclick = () => this.leftClick();
			}
			var right = this.obj.parentNode.querySelector('.plus');
			if (right) {
				right.onclick = () => this.rightClick();
			}
		}
		private getPercent(val, min, max): string {
			var p = 0;
			if (val <= min) {
				p = 0;
			} else if (val >= max) {
				p = 100;
			} else {
				p = val / (max / 100);
			}
			return p.toFixed(2);
		}
		private updateBar(val) {
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
							if (x + (current - prev) / 2 < current){
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
		}
		public setValueWithPercent(val:number) {
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
							if (val + (current - prev) / 2 < current){
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
		}
		public setValue(val?: number) {
			switch (this.type) {
				case "progress":
					this.updateBarWidth(val);
					break;
				case "setting":
					var per: string = "0";
					// TODO: fix when last and first with this.progressSticky = true
					if (!val || this.progressSticky) {
						per = this.getPercent(this.dataCurrent, 0, this.dataMax);
					} else {
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
		}
		public toggleDisabled(state: boolean = false): void {
			if (this.obj.getAttribute('disabled')) {
				this.obj.removeAttribute('disabled');
			} else if (!state) {
				this.obj.setAttribute('disabled', 'disabled');
			}
		}
		public getCurrentPercent():number {
			return this.currentPercent;
		}

		private invertDataCurrent() { // ugly workaround
			if (this.dataCurrent == 0) {
				this.dataCurrent = this.dataMax;
			} else {
				this.dataCurrent = this.dataMax - this.dataCurrent;
			}
		}
		private updateBarWidth(val) {
			this.currentPercent = val;
			this.progress.setAttribute('style', 'width:' + val + '%;');
			if (this.progressSticky) {
				this.updateStickyPointState();
			}
		}
		private getX(e): number {
			if (this.pda_state) {
				return this.getXPDA(e);
			} else {
				return this.getXNormal(e);
			}
		}
		private getXNormal(e): number {
			this.progressLeft = this.progress.getBoundingClientRect().left;
			this.progressCurrentLeft = e.clientX - this.progressLeft;
			this.progressCurrentLeft = this.progressCurrentLeft < 0 ? 0 : this.progressCurrentLeft;
			return this.progressCurrentLeft;
		}
		private getXPDA(e): number {
			if (e.type == 'click') {
				return this.getXNormal(e);
			}
			var touches = e.changedTouches || e.touches;
			return this.getXNormal(touches[0]);
		}
		private barClickHandler(e) {
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
		}
		private isTrackFull(target) {
			return this.isFB3Mode() && (typeof this.finishFunction === 'function') && target === this.trackFull;
		}
		private dotClickHandler(e) {
			this.debugLog('dotClickHandler');
			this.eventType = 'action_start';
			this.checkCurrentState();
			if (this.barState) {
				this.dotMouseClick = true;
				if (this.mouseMoveState) {
					if (this.pda_state) {
						this.obj.ontouchmove = (e) => this.swipeHandler(e);
					} else {
						this.obj.onmousemove = (e) => this.swipeHandler(e);
					}
				}
				doc.onmouseup = (e) => this.swipeDone(e, true);
				(<any> doc).ontouchend = (e) => this.swipeDone(e, true);
			}
			e.stopPropagation();
			return false;
		}
		private swipeHandler(e) {
			this.debugLog('swipeHandler');
			this.eventType = 'action_move';
			this.checkCurrentState();
			if (this.barState) {
				this.swipeState = true;
				this.updateBar(this.getX(e));
			}
			e.stopPropagation();
			return false;
		}
		private swipeDone(e, docState?) {
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
					} else {
						this.eventType = 'action_end_doc';
						if (this.type == 'progress') {
							this.callAction();
						}
					}
				}
				doc.onmouseup = () => {};
				(<any> doc).ontouchend = () => {};
				this.obj.ontouchmove = () => {};
				this.obj.onmousemove = () => {};
			}
			e.stopPropagation();
		}
		private leftClick() {
			this.checkCurrentState();
			if (!this.barState || this.dataCurrent == 0) {
				return;
			}
			this.dataCurrent--;
			this.setValue();
			this.callAction();
		}
		private rightClick() {
			this.checkCurrentState();
			if (!this.barState || this.dataCurrent == this.dataMax) {
				return;
			}
			this.dataCurrent++;
			this.setValue();
			this.callAction();
		}
		private callAction() {
			if (this.callback) {
				this.callback(this.dataCurrent, this.eventType);
			}
		}
		private drawStickyPoint(parent?: HTMLElement) {
			var track: HTMLElement = parent || this.obj.querySelector('.track');
			for (var j = 0; j <= this.dataMax; j++) {
				track.innerHTML += '<span data-pos="' + j + '" style="left:' +
					parseFloat(this.getPercent(j, 0, this.dataMax)) + '%;"></span>';
			}
			this.stickyObjs = track.querySelectorAll('span');
		}
		private updateStickyPointState() {
			for (var j = 0; j < this.stickyObjs.length; j++) {
				var span = this.stickyObjs[j];
				if (span.getAttribute('data-pos') <= this.dataCurrent) {
					addClass(span, 'active');
				} else {
					removeClass(span, 'active');
				}
			}
		}
		private checkCurrentState() {
			if (this.obj.getAttribute('disabled') == 'true') {
				this.barState = false;
			} else {
				this.barState = true;
			}
		}
		private debugLog(str: string) {
			if (this.debug) {
				console.log(str);
			}
		}

		private initHTML5range(): void {
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
		}
		private makeHTML5input(): string {
			var subclass = ' input-range-' + browser;
			return '<div class="input-range-wrap">' +
					'<input type="range" class="input-range' + subclass + '" min="0" ' +
					'max="' + (this.data.length - 1) +'" step="1" ' +
					'value="' + this.dataCurrent + '" />' +
				'</div>';
		}
		private initHTMLhandlers(): void {
			this.obj.oninput = () => this.inputEventHandler();
			this.obj.onchange = () => this.changeEventHandler();
			// if (this.type == 'setting' && this.drawStickyPointState) {
			// 	for (var j = 0; j < this.stickyObjs.length; j++) {
			// 		this.stickyObjs[j].onclick = (e) => this.clickStickyHandler(e);
			// 	}
			// }
		}
		private inputEventHandler(): void {
			this.debugLog('inputEventHandler');
			this.HTML5eventHandler();
		}
		private changeEventHandler(): void {
			this.debugLog('changeEventHandler');
			this.HTML5eventHandler();
		}
		private HTML5eventHandler(): void  {
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
		}
		private clickStickyHandler(e): void {
			this.debugLog('clickStickyHandler');
			this.dataCurrent = e.target.getAttribute('data-pos');
			this.obj.value = this.dataCurrent;
			this.HTML5eventHandler();
		}
		public chromeWorkaround(): void {
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
		}
		private checkHTML5currentState(): void {
			if (this.obj.getAttribute('disabled') == 'true') {
				this.barState = false;
			} else {
				this.barState = true;
			}
		}
	}
}