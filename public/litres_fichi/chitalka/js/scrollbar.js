/* [37228] Стилизованный кроссбраузерный скроллбар */
var scrollbar = function(node, settings){
	var self = this;
	self.node = node;
	self.config = {
		width: false, // width scrollbar
		wrapper: 'scrollwrapper',
		scroller: 'scroller',
		scrollarea: 'scrollarea',
		scrollareaY: 'scrollareaY',
		scrollareaX: 'scrollareaX',
		content: 'scrollbar',
		show: false,
		scrollbar_parent: 'scrollbar_parent',
		scrollPage: false,
		navBar: false // navigation left right
	}
	self.extend = function(a,b) {
		for(var key in b)
		if (b.hasOwnProperty(key))
			a[key] = b[key];
		return a;
	}
	self.classList = (function () {
		 if ("classList" in document.createElement("div")) {
			return {
				add: function (el, el_class) {
					el.classList.add(el_class);
				},
				remove: function (el, el_class) {
					el.classList.remove(el_class);
				}
			}
		} else {
			return {
				add: function (el, el_class) {
					el.className += ' ' + el_class;
				},
				remove: function (el, el_class) {
					el.className = (' ' + el.className + ' ').replace(' ' + el_class + ' ', ' ');
				}
			};
		}
	})();
	self.addEvent = function(el, e, f){
		if (el.attachEvent) {
			return el.attachEvent('on'+e, f);
		} else {
			return el.addEventListener(e, f, false);
		}
	}
	self.config = self.extend(self.config,settings);
	self.init();

}

scrollbar.prototype = {
	wrapper: false, // обертка для скролла
	scrollareaY: false, // область вертикального скролла
	scrollareaX: false, // область горизонтального скролла
	scrollerY: false, // бегунок вертикального скролла
	scrollerX: false, // бегунок горизонтального скролла
	init: function(){
		var self = this;
		self.render();
		self.refresh();

		/* init events */
		self.canDrag = false,
		self.scrollshow = false,
		self.scrollHover = false;

		self.node.onmouseover = function(event){self.refresh()};
		self.addEvent(self.scrollerY, 'mousedown', function(event){self.dragY(event)});
		self.addEvent(self.scrollerX, 'mousedown', function(event){self.dragX(event)});
		self.addEvent(window, 'mousemove', function(event){self.moveY(event)});
		self.addEvent(window, 'mousemove', function(event){self.moveX(event)});
		self.addEvent(window, 'mouseup', function(event){self.drop(event)});
		self.addEvent(self.node, 'touchmove', function(event){self.touchmove(event)});
		self.addEvent(self.node, 'touchstart', function(event){self.touchstart(event)});

		/* mouse wheel */
		if (!self.config.scrollPage) {
			if (self.contentWrapper.addEventListener) // ff
				self.contentWrapper.addEventListener('DOMMouseScroll', function(event){self.wheel(event)}, false);
			// other
			self.contentWrapper.onmousewheel = function(event){self.wheel(event)};
		}

		self.addEvent(self.scrollareaY, 'mousedown', function(event){self.areaclickY(event)});
		self.addEvent(self.scrollareaX, 'mousedown', function(event){self.areaclickX(event)});

		// fadein fadeout
		if (!self.config.show) {
			self.addEvent(self.scrollareaY, 'mouseover', function(event){self.fadeIn(true)});
			self.addEvent(self.scrollareaX, 'mouseover', function(event){self.fadeIn(true)});
			self.addEvent(self.scrollerY, 'mouseover', function() {self.fadeIn(true)});
			self.addEvent(self.scrollerX, 'mouseover', function() {self.fadeIn(true)});
			self.addEvent(self.scrollareaY, 'mouseout', function(){self.ScrollFade(true)});
			self.addEvent(self.scrollareaX, 'mouseout', function(){self.ScrollFade(true)});
			self.addEvent(self.scrollerY, 'mouseout', function(){self.ScrollFade(true)});
			self.addEvent(self.scrollerX, 'mouseout', function(){self.ScrollFade(true)});
			self.addEvent(window, 'mouseout', function(){self.ScrollFade(true)});
		}


		if (self.config.navBar) {
			self.addEvent(self.navBar.left, 'mousedown', function(event){self.navBarClick('left')});
			self.addEvent(self.navBar.right, 'mousedown', function(event){self.navBarClick('right')});
		}

	},
	getNode: function(){
		var self = this;
		return self.node;
	},
	render: function(){
		var self = this,
			wrapper, scrollerY, scrollareaY, scrollerX, scrollareaX, contentWrapper;
		if (!(self.node.parentNode.parentNode.className.split(' ').indexOf(self.config.wrapper) != -1)) {
			wrapper = document.createElement('div');
			scrollerY = document.createElement('div');
			scrollerX = document.createElement('div');
			scrollareaY = document.createElement('div');
			scrollareaX = document.createElement('div');
			contentWrapper = document.createElement('div');
			contentWrapper.className = self.config.content + '-contentwrapper';
			self.classList.add(self.node, self.config.content);
			wrapper.className = self.config.wrapper;
			self.node.parentNode.insertBefore(wrapper, self.node.nextSibling);
			scrollareaY.className = self.config.scrollarea + (self.config.scrollareaY ? ' ' + self.config.scrollareaY : '');
			scrollareaX.className = self.config.scrollarea + (self.config.scrollareaX ? ' ' + self.config.scrollareaX : '');
			scrollerY.className = self.config.scroller;
			scrollerX.className = self.config.scroller;
			contentWrapper.appendChild(self.node);
			contentWrapper.appendChild(scrollareaY).appendChild(scrollerY);
			contentWrapper.appendChild(scrollareaX).appendChild(scrollerX);
			wrapper.appendChild(contentWrapper);
			contentWrapper.style.width = self.config.width ? self.config.width : self.node.offsetWidth + 'px';
			contentWrapper.style.height = (self.node.className.split(' ').indexOf(self.config.scrollbar_parent) != -1) ? '100%' :  self.node.offsetHeight+ 'px' ;

			self.node.style.width = self.node.style.height = 'auto';
			if (self.config.navBar) {
				var navBar = {
					left: document.createElement('div'),
					right: document.createElement('div')
				}
				navBar.left.className = self.config.content + '-navBar ' + self.config.content + '-navBar__left';
				navBar.right.className = self.config.content + '-navBar ' + self.config.content + '-navBar__right';
				wrapper.appendChild(navBar.left);
				wrapper.appendChild(navBar.right);
			}
		} else {

			contentWrapper = self.node.parentNode;
			// [94252] Ошибки в консоле в вебчиталке+ Неработает настройка шрифтов
			wrapper = self.contentWrapper ? self.contentWrapper.parentNode : contentWrapper;
			scrollareaY = wrapper.querySelector('.' + self.config.scrollarea + (self.config.scrollareaY ? '.' + self.config.scrollareaY : ''));
			scrollareaX = wrapper.querySelector('.' + self.config.scrollarea + (self.config.scrollareaX ? '.' + self.config.scrollareaX : ''));
			scrollerY = scrollareaY.querySelector('.' + self.config.scroller);
			scrollerX = scrollareaX.querySelector('.' + self.config.scroller);
			if (self.config.navBar) {
				var navBar = {
					left: self.navBar.left,
					right: self.navBar.right
				}
			}
		}
		if (!self.config.show) self.scrollOpacity = scrollareaY.style.opacity = scrollareaX.style.opacity = 0;
		self.wrapper = wrapper;
		self.scrollerY = scrollerY;
		self.scrollerX = scrollerX;
		self.scrollareaY = scrollareaY;
		self.scrollareaX = scrollareaX;
		self.contentWrapper = contentWrapper;
		self.fadeInterval = null;
		if (self.config.navBar) {
			self.navBar = {
				left: navBar.left,
				right: navBar.right
			};
		}
	},
	refresh: function(){
		var self = this;

		self.deltaY =  self.contentWrapper.offsetHeight / self.node.offsetHeight;
		self.deltaX = self.contentWrapper.offsetWidth / self.node.offsetWidth;

		/* vertical */
		self.scrollerY.style.height = (self.deltaY > 1 ) ? self.scrollareaY.offsetHeight : Math.round( self.deltaY * self.scrollareaY.offsetHeight ) + 'px';


		if (self.contentWrapper.offsetHeight >= self.node.offsetHeight) {
			self.scrollareaY.style.display = 'none';
			self.node.style.top = 0;
		} else {
			self.scrollareaY.style.display = 'block';
		}

		/* horizontal */
		self.scrollerX.style.width = (self.deltaX > 1) ? self.scrollareaX.offsetWidth : Math.round( self.deltaX * self.scrollareaX.offsetWidth ) + 'px';
		//debugger;
		if (self.deltaX >= 1) {
			self.scrollareaX.style.display = 'none';
			self.node.style.left = 0;
			if (self.config.navBar) {
				self.classList.remove(self.navBar.left, self.config.content + '-navBar_active');
				self.classList.remove(self.navBar.right, self.config.content + '-navBar_active');
			}
		} else {
			self.scrollareaX.style.display = 'block';
			if (self.config.navBar) {
				if (self.node.offsetLeft < 0) {
					self.classList.add(self.navBar.left, self.config.content + '-navBar_active');
				} else {
					self.classList.remove(self.navBar.left, self.config.content + '-navBar_active');
				}
				if (self.node.offsetWidth + self.node.offsetLeft > self.contentWrapper.offsetWidth) {
					self.classList.add(self.navBar.right, self.config.content + '-navBar_active');
				} else {
					self.classList.remove(self.navBar.right, self.config.content + '-navBar_active');
				}
			}
		}

	},
	drop: function(event){
		var self = this;
		event = event || window.event;
		self.canDrag = false;
		if (!self.config.show) self.ScrollFade(false);
		self.scrollareaX.classList.remove(self.config.scrollareaX + '_active');
	},
	moveY: function(event){
		var self = this;
		event = event || window.event;
		self.refresh();
		if (self.canDrag) {
			self.setPosition({y: (self.shift_y - event.clientY) / self.deltaY});
			self.blockEvent(event);
			self.scrollshow = true;
		}
		return false;
	},
	moveX: function(event){
		var self = this;
		event = event || window.event;
		self.refresh();
		if (self.canDrag) {
			self.setPosition({x: (self.shift_x - event.clientX) / self.deltaX});
			self.blockEvent(event);
			self.scrollshow = true;
		}
		return false;
	},
	/*
	 * @object newPosition {x, y}
	*/
	setPosition: function(newPosition) {
		var self = this;

		if (newPosition.hasOwnProperty('y')) {
			//debugger;
			if ( (newPosition.y >= self.contentWrapper.offsetHeight - self.node.offsetHeight) && (newPosition.y <= 0) ) {
				self.node.style.top = newPosition.y + "px";
			} else if (newPosition.y < self.contentWrapper.offsetHeight - self.node.offsetHeight) {
				self.node.style.top = self.contentWrapper.offsetHeight - self.node.offsetHeight + "px";
			} else {
				self.node.style.top = 0 + "px";
			}
			self.scrollerY.style.top = Math.round( parseInt(self.node.style.top)  * self.scrollareaY.offsetHeight / self.node.offsetHeight * (-1) ) + "px";
			//self.scrollerY.style.top =  + "px";

		}

		if (newPosition.hasOwnProperty('x')) {
			var newPosX = 0;
			if ( (newPosition.x >= self.contentWrapper.offsetWidth - self.node.offsetWidth) && (newPosition.x <= 0) ) {
				newPosX = newPosition.x;
			} else if (newPosition.x < self.contentWrapper.offsetWidth - self.node.offsetWidth) {
				newPosX = self.contentWrapper.offsetWidth - self.node.offsetWidth;
			} else {
				newPosX = 0;
			}
			self.node.style.left = newPosX + "px";
			self.scrollerX.style.left = Math.round( parseInt(self.node.style.left)  * self.scrollareaX.offsetWidth /  self.node.offsetWidth * (-1) ) + "px";
		}

		return false;
	},
	setPositionForce: function (state) {
		var self = this;
		var top = 0;
		switch (state) {
			case "top":
				top = 0;
				break;
			case "bottom":
				top = 0;
				break;
		}
		self.scrollerY.style.top = top + "px";
		self.node.style.top = top + "px";
		return false;
	},
	blockEvent: function(event) {
		var self = this;
		event = event || window.event;
		if(event.stopPropagation) event.stopPropagation();
		else event.cancelBubble = true;
		if(event.preventDefault) event.preventDefault();
		else event.returnValue = false;
	},
	dragY: function(event) {
		var self = this;
		event = event || window.event;
		self.canDrag = true;

		self.shift_y = event.clientY + parseInt(self.node.offsetTop) * self.deltaY;

		if (!self.config.show) self.fadeIn(false);
		self.blockEvent(event);
		return false;
	},
	dragX: function(event) {
		var self = this;
		event = event || window.event;
		self.canDrag = true;

		self.shift_x = event.clientX + parseInt(self.node.offsetLeft) * self.deltaX;

		if (!self.config.show) self.fadeIn(false);
		self.blockEvent(event);
		self.scrollareaX.classList.add(self.config.scrollareaX + '_active');
		return false;
	},
	touchmove: function(event) {
		var self = this;
		self.refresh();
		event = event || window.event;
		var touch = {
				y: event.touches[0].pageY,
				x: event.touches[0].pageX
			},
			newPosition = {
				y: self.ts + (self.ts_y - touch.y)/self.deltaY,
				x: self.ts + (self.ts_x - touch.x)/self.deltaX,
			};
		self.setPosition(newPosition);
		if (!self.config.show) self.fadeIn(false);
		self.blockEvent(event);
		return false;
	},
	touchstart: function(event) {
		var self = this;
		event = event || window.event;
		self.ts = parseInt(self.node.offsetTop);
		self.ts_y = event.touches[0].pageY;
		self.ts_x = event.touches[0].pageX;
		if (event.type == "touchstart") {
		   return true;
		} else {
			event.preventDefault();
		}
	},
	wheel: function(event) {
		var self = this;
		//debugger;
		self.refresh();
		event = event || window.event;
		var wheelDelta = 0;
		var step = 15;
		var newPosition = {};
		if (event.wheelDelta) {
			wheelDelta = event.wheelDelta/120;
		} else if (event.detail) {
			wheelDelta = -event.detail/3;
		}

		if (wheelDelta) {
			//debugger;
			var currentPositionY = self.node.offsetTop;
			newPosition.y = currentPositionY + wheelDelta*step;

			if ((wheelDelta > 0 && self.node.offsetLeft < 0) || (wheelDelta < 0 && self.node.offsetLeft > self.contentWrapper.offsetWidth - self.node.offsetWidth)) {

				// horizontal scroll
				// пока не нужен
				//var currentPositionX = parseInt(self.node.offsetLeft);
				//newPosition.x = currentPositionX + wheelDelta*step;
			}
		}
		if (!self.config.show) {
			self.fadeIn(false);
		}

		self.setPosition(newPosition);

		self.refresh();

		//if (!((self.node.offsetTop == 0 || self.node.offsetLeft == 0 || self.node.offsetTop  == self.contentWrapper.offsetHeight - self.node.offsetHeight || self.node.offsetLeft  == self.contentWrapper.offsetWidth - self.node.offsetWidth) && self.config.scrollPage)) {


		if (!(((self.node.offsetTop == 0 && wheelDelta > 0) || (self.node.offsetTop  == self.contentWrapper.offsetHeight - self.node.offsetHeight && wheelDelta < 0)) && self.config.scrollPage)) {

			if (event.preventDefault) {
				event.preventDefault();
			}
			event.returnValue = false;
			self.blockEvent(event);

		}
	},
	areaclickY: function(event) {
		var self = this;
		event = event || window.event;

		var clickScrollY = event.clientY - self.scrollareaY.getBoundingClientRect().top - self.scrollerY.offsetHeight/2;

		self.shift_y = clickScrollY / self.deltaY * (-1);
		self.setPosition({y: self.shift_y});
		if (!self.config.show) self.ScrollFade(false);
		self.blockEvent(event);
		return false;
	},
	areaclickX: function(event) {
		var self = this;
		event = event || window.event;

		var clickScrollX = event.clientX - self.scrollareaX.getBoundingClientRect().left - self.scrollerX.offsetWidth/2;

		self.shift_x = clickScrollX / self.deltaX * (-1);
		self.setPosition({x: self.shift_x});
		if (!self.config.show) self.ScrollFade(false);
		self.blockEvent(event);
		return false;
	},
	fadeIn: function(scrollhover) {
		var self = this;
		self.scrollshow = true;
		if (scrollhover) self.scrollHover = true;
		self.scrollOpacity += 0.1;
		self.scrollareaY.style.opacity = self.scrollOpacity;
		if(self.scrollOpacity > 0.9) {
			self.scrollareaY.style.opacity = 1;
			if (!self.scrollHover) setTimeout(function(){self.ScrollFade(false)},500);
		} else {
			setTimeout(function(){self.fadeIn(false)}, 50);
		}
	},
	fadeOut: function() {
		var self = this;
		if (!self.scrollshow) {
			self.scrollOpacity -= 0.1;
			self.scrollareaY.style.opacity = self.scrollOpacity;
			if(self.scrollOpacity < 0.2) {
				self.scrollareaY.style.opacity = 0.0;
			} else {
				setTimeout(function(){self.fadeOut()}, 100);
			}
		}
	},
	ScrollFade: function(scrollhover) {
		var self = this;
		self.scrollshow = false;
		if (scrollhover) self.scrollHover = false;
		if (!self.scrollHover) {
			clearInterval(self.fadeInterval);
			self.fadeInterval = setTimeout(function(){self.fadeOut()}, 3000);
		}
	},
	Destroy: function(self) {
		self = self || this;
		if ((self.node.className.split(' ').indexOf(self.config.scrollbar_parent) != -1) && (self.node.parentNode.className.split(' ').indexOf(self.config.wrapper) != -1)) {
			self.classList.remove(self.node, self.config.content);
			self.contentWrapper.parentNode.removeChild(self.contentWrapper.parentNode.querySelector('.'+self.config.scrollarea));
			var fragment = document.createDocumentFragment();
			var cont = self.contentWrapper.parentNode.parentNode;
			fragment.appendChild(self.node);
			cont.replaceChild(fragment, self.contentWrapper);
		}
	},
	/*
	 *@param boolean - отработала ли перемотка слайдера
	*/
	isBarClicked: false,
	/*
	 * @param type [left|right] влево или вправо сдвиг
	 * @param {number} (optional) step шаг в пикселях
	 */
	navBarClick: function(type, step) {
		var self = this;

		if (self.isBarClicked) {
			self.blockEvent(event);
			return;
		}

		self.isBarClicked = true;

		//debugger;
		self.refresh();

		step = step || (self.contentWrapper.offsetWidth - (self.navBar.left.offsetWidth + self.navBar.right.offsetWidth)); // по дефолту сдвиг на весь экран
		if (type === 'right') {
			step = step * -1;
		}

		var to = self.node.offsetLeft + step;

		self.setPositionSmooth(to, 200);

		return false;

	},
	setPositionSmooth: function(to, duration) {
		var self = this;
		if (duration <= 0) {
			self.isBarClicked = false;
			return;
		}
		var difference = to - self.node.offsetLeft;
		var perTick = difference / duration * 10;
		setTimeout(function() {
			self.setPosition({
				x: self.node.offsetLeft + perTick
			});
			self.refresh();
			if (self.node.offsetLeft == to) {
				self.isBarClicked = false;
				return;
			}
			self.setPositionSmooth(to, duration - 10);
		}, 10);
	}
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this && this[from] === elt)
                return from;
        }
        return -1;
    };
}
