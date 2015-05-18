/**
 * Style Utility
 * Provides cross-platform styling options
 * Supports Webkit, Mozilla, IE8
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.Styles = function(oControl) {
	var _oThis   = this,
		_oStyles = {};

	function _getComputedStyleValue(oControl, sStyleName) {
		if (enyo.platform.ie && enyo.platform.ie < 9) {
			sStyleName = sStyleName.replace(/([\-][a-z]+)/gi, function($1) {
				return $1.charAt(1).toUpperCase() + $1.substr(2);
			});
		}
		return oControl.getComputedStyleValue(sStyleName);
	}

	function _initialize() {
		// if (oControl.id == "app_tooltipDecorator") debugger;
		var oBounds = oControl.getBounds(),
			nWidth  = parseInt(oBounds.width,  10),
			nHeight = parseInt(oBounds.height, 10),
			nLeft   = parseInt(oBounds.left,   10),
			nTop    = parseInt(oBounds.top,    10);

		_oThis.display   = _getComputedStyleValue(oControl, 'display');
		_oThis.boxSizing = _getComputedStyleValue(oControl, 'box-sizing');

		_oThis.l = {
			margin  : parseInt(_getComputedStyleValue(oControl, 'margin-left'),         10),
			border  : parseInt(_getComputedStyleValue(oControl, 'border-left-width'),   10),
			padding : parseInt(_getComputedStyleValue(oControl, 'padding-left'),        10)
		};

		_oThis.r = {
			margin  : parseInt(_getComputedStyleValue(oControl, 'margin-right'),        10),
			border  : parseInt(_getComputedStyleValue(oControl, 'border-right-width'),  10),
			padding : parseInt(_getComputedStyleValue(oControl, 'padding-right'),       10)
		};

		_oThis.t = {
			margin  : parseInt(_getComputedStyleValue(oControl, 'margin-top'),          10),
			border  : parseInt(_getComputedStyleValue(oControl, 'border-top-width'),    10),
			padding : parseInt(_getComputedStyleValue(oControl, 'padding-top'),         10)
		};

		_oThis.b = {
			margin  : parseInt(_getComputedStyleValue(oControl, 'margin-bottom'),       10),
			border  : parseInt(_getComputedStyleValue(oControl, 'border-bottom-width'), 10),
			padding : parseInt(_getComputedStyleValue(oControl, 'padding-bottom'),      10)
		};

		_oThis.v = { // Vertical margin, border, padding
			margin  : _oThis.t.margin  + _oThis.b.margin,
			border  : _oThis.t.border  + _oThis.b.border,
			padding : _oThis.t.padding + _oThis.b.padding
		};

		_oThis.h = { // Horizontal margin, border, padding
			margin  : _oThis.l.margin  + _oThis.r.margin,
			border  : _oThis.l.border  + _oThis.r.border,
			padding : _oThis.l.padding + _oThis.r.padding
		};

		// Deal with offsets

		_oThis.h.offset = _oThis.h.margin + _oThis.h.border + _oThis.h.padding;
		_oThis.v.offset = _oThis.v.margin + _oThis.v.border + _oThis.v.padding;

		_oThis.h.outerOffset = _oThis.h.margin;
		_oThis.v.outerOffset = _oThis.v.margin;
		_oThis.h.innerOffset = _oThis.h.border + _oThis.h.padding;
		_oThis.v.innerOffset = _oThis.v.border + _oThis.v.padding;

		// Deal with width and height
		if (this.boxSizing == 'border-box') {
			_oThis.content = {
				width  : nWidth  - _oThis.h.innerOffset,
				height : nHeight - _oThis.v.innerOffset
			};

			_oThis.box = {
				width  : nWidth  + _oThis.h.outerOffset,
				height : nHeight + _oThis.v.outerOffset,
				left   : nLeft,
				top    : nTop
			};
		} else {
			_oThis.content = {
				width  : nWidth  - _oThis.h.innerOffset,
				height : nHeight - _oThis.v.innerOffset
			};

			_oThis.box = {
				width  : nWidth  + _oThis.h.outerOffset,
				height : nHeight + _oThis.v.outerOffset,
				left   : nLeft,
				top    : nTop
			};
		}
	}

	this.commit = function() {
		enyo.mixin(oControl.domStyles, _oStyles);
		oControl.domStylesChanged();
	};

	this.set = function(sProperty, mValue) {
		_oStyles[sProperty] = mValue;
	};

	this.setBoxLeft       = function(nLeft, oContainerStyles) { _oStyles.left   = nLeft + oContainerStyles.l.padding  + 'px'; };
	this.setBoxTop        = function(nTop,  oContainerStyles) {
		_oStyles.top   = nTop + oContainerStyles.t.padding   + 'px';
	};

	this.setBoxWidth      = function(nWidth) {
		if (this.boxSizing == 'border-box') {
			_oStyles.width  = nWidth  - this.h.margin + 'px';
		} else {
			_oStyles.width  = nWidth  - this.h.offset + 'px';
		}
	};

	this.setBoxHeight     = function(nHeight) {
		if (this.boxSizing == 'border-box') {
			_oStyles.height = nHeight - this.v.margin + 'px';
		} else {
			_oStyles.height = nHeight - this.v.offset + 'px';
		}
	};


	this.setContentWidth  = function(nWidth) {
		if (this.boxSizing == 'border-box') {
			_oStyles.width  = nWidth + this.h.padding + this.h.border + 'px';
		} else {
			_oStyles.width  = nWidth  + 'px';
		}
	};
	this.setContentHeight = function(nHeight) {
		if (this.boxSizing == 'border-box') {
			_oStyles.height  = nHeight + this.v.padding + this.v.border + 'px';
		} else {
			_oStyles.height  = nHeight  + 'px';
		}
	};

	this.setPosition      = function(sPosition) { _oStyles.position = sPosition; };
	this.control          = oControl;
	_initialize();
};

enyo.Styles.setStyles = function(oControl, oStyles) {
	enyo.mixin(oControl.domStyles, oStyles);
	oControl.domStylesChanged();
};