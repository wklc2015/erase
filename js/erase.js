/*
 * Erase plugin
 *
 * */
+ (function($) {
	'use strict';
	
	var Erase = function(elements, options) {
		this.$elements = $(elements);
		this.options = options;
		this.timer = null;
		this.init();
	}
	Erase.VERSION = '1.0.0';

	Erase.DEFAULTS = {
		size: 50,
		cursor: 'default',
		cls: 'canvasText',
		opacity: 1,
		background: {
			type: 'text',
			path: 'Erase'
		},
		mask: {
			type: 'color',
			path: '#999'
		},
		eraseMove: function(a) {
			if (a > 50) {
				this.clear();
			}
		}
	}

	Erase.prototype.init = function() {
		//test for HTML5 canvas
		var test = document.createElement('canvas');
		if (!test.getContext) {
			this.elements.html("Browser does not support HTML5 canvas, please upgrade to a more modern browser.");
			return false;
		}
		this.$elements.html('<div><p></p><canvas></canvas>');
		this.sp = this.$elements.find('div');
		this.sp.css({
			position: 'relative',
			cursor: this.options.cursor
		});
		this.$canvas = this.$elements.find('canvas');
		this.$canvas.css({
			cursor: this.options.cursor,
			top: 0,
			left: 0,
			position: 'absolute',
			zIndex: 2
		});
		this.canvas = this.$canvas[0];
		this.ctx = this.canvas.getContext('2d');
		this.$text = this.$elements.find('p');
		this.$text.addClass(this.options.cls).css({
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			position: 'absolute',
			zIndex: 1
		});
		this.offset = this.$canvas.offset();
		this.initSize();
		this.initNodes();
		this.reset();
		this.initEvents();
	}
	Erase.prototype.initNodes = function() {
		var _width = this._width;
		var _height = this._height;
		this.sp.css({
			width: _width,
			height: _height
		});
		this.canvas.width = _width;
		this.canvas.height = _height;
		this.pixels = _width * _height;
	}
	Erase.prototype.initActive = function(imagePath) {
		var bg = this.options.background;
		var mask = this.options.mask;
		this.ctx.globalAlpha = this.options.opacity;
		if (mask.type == 'image') {
			this.drawImage(mask.path);
			if (bg.type == 'image') {
				this.setBgImage(bg.path);
				this.$text.css('display', 'none');
			} else {
				this.$text.css('display', 'block').html(bg.path);
			}
		} else if (mask.type == 'color') {
			if (bg.type == 'image') {
				this.setBgImage(bg.path);
				this.$text.css('display', 'none');
			} else {
				this.$text.css('display', 'block').html(bg.path);
			}
			this.ctx.fillStyle = mask.path;
			this.ctx.beginPath();
			this.ctx.rect(0, 0, this._width, this._height);
			this.ctx.fill();
		}
	}
	Erase.prototype.initSize = function() {
		this._width = this.$elements.width();
		this._height = this.$elements.height();
	}
	Erase.prototype.setBgImage = function(imagePath) {
		this.sp.css({
			backgroundImage: 'url(' + imagePath + ')',
			backgroundRepeat: 'no-repeat',
			backgroundSize: '100% 100%'
		});
	}
	Erase.prototype.drawImage = function(imagePath) {
		var that = this;
		var w = this.canvas.width,
			h = this.canvas.height;
		var img = new Image();
		img.src = imagePath;
		img.onload = function() {
			var _w = img.width;
			var _h = img.height;
			that.ctx.drawImage(img, 0, 0, _w, _h, 0, 0, w, h);
		}
	}
	Erase.prototype.initEvents = function() {
		this.$canvas.on('touchstart mousedown', $.proxy(this._preDraw, this));
		this.$canvas.on('touchmove mousemove', $.proxy(this._draw, this));
		this.$canvas.on('touchend mouseup', $.proxy(this._check, this));
		$(window).on('resize', $.proxy(this._resize, this));
	}
	Erase.prototype.destroy = function() {
		this.$canvas.off($.fn.mobileEvent.start);
		this.$canvas.off($.fn.mobileEvent.move);
		this.$canvas.off($.fn.mobileEvent.end);
	}
	Erase.prototype.reset = function() {
		this.enabled = true;
		this.scratch = false;
		this.lines = [, , ];
		this.ctx.globalCompositeOperation = 'source-over';
		this.initActive();
	}
	Erase.prototype.clear = function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	Erase.prototype._resize = function() {
		clearTimeout(this.timer);
		this.timer = setTimeout($.proxy(function(){
			this.initSize();
			this.initNodes();
			this.initActive();
		}, this), 800);
	}
	Erase.prototype._preDraw = function(event) {
		if (!this.enabled) return;
		var that = this,
			offset = this.offset;
		if ($.fn.isMobile) {
			$.each(event.originalEvent['targetTouches'], function(i, touch) {
				var id = touch.identifier;
				that.lines[id] = {
					x: this.pageX - offset.left,
					y: this.pageY - offset.top
				};
			});
		} else {
			that.lines[0] = {
				x: event.pageX - offset.left,
				y: event.pageY - offset.top
			};
		}
		this.scratch = true;
		event.preventDefault();
	}
	Erase.prototype._draw = function(event) {
		if (!this.scratch) return;
		var that = this,
			offset = this.offset;
		if ($.fn.isMobile) {
			$.each(event.originalEvent['targetTouches'], function(i, touch) {
				var id = touch.identifier,
					moveX = this.pageX - offset.left - that.lines[id].x,
					moveY = this.pageY - offset.top - that.lines[id].y;
				var ret = that._move(id, moveX, moveY);
				that.lines[id].x = ret.x;
				that.lines[id].y = ret.y;
			});
		} else {
			var moveX = event.pageX - offset.left - that.lines[0].x,
				moveY = event.pageY - offset.top - that.lines[0].y;
			var ret = that._move(0, moveX, moveY);
			that.lines[0].x = ret.x;
			that.lines[0].y = ret.y;
		}
		event.preventDefault();
	}
	Erase.prototype._check = function() {
		this.scratch = false;
		if (this.options['eraseMove']) {
			this.options['eraseMove'].apply(this, [this.scratchPercentage()]);
		}
	}
	Erase.prototype._move = function(i, changeX, changeY) {
		this.ctx.globalCompositeOperation = 'destination-out';
		this.ctx.globalAlpha = 1;
		this.ctx.lineJoin = "round";
		this.ctx.lineCap = "round";
		this.ctx.lineWidth = this.options.size;
		this.ctx.strokeStyle = this.options.color;
		this.ctx.beginPath();
		this.ctx.moveTo(this.lines[i].x, this.lines[i].y);
		this.ctx.lineTo(this.lines[i].x + changeX, this.lines[i].y + changeY);
		this.ctx.stroke();
		this.ctx.closePath();
		return {
			x: this.lines[i].x + changeX,
			y: this.lines[i].y + changeY
		};
	}
	Erase.prototype.scratchPercentage = function() {
		var hits = 0;
		var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		for (var i = 0, ii = imageData.data.length; i < ii; i = i + 4) {
			if (imageData.data[i] == 0 && imageData.data[i + 1] == 0 && imageData.data[i + 2] == 0 && imageData.data[i + 3] == 0) {
				hits++;
			}
		}
		return (hits / this.pixels) * 100;
	}

	function Plugin(option) {
		return this.each(function() {
			var $this = $(this)
			var data = $this.data('wui.erase');
			var options = $.extend({}, Erase.DEFAULTS, option);
			if (!data) $this.data('wui.erase', (data = new Erase(this, options)));
		})
	}

	var old = $.fn.erase;

	$.fn.erase = Plugin;
	$.fn.erase.Constructor = Erase;

	$.fn.erase.noConflict = function() {
		$.fn.erase = old;
		return this;
	}

}(jQuery))