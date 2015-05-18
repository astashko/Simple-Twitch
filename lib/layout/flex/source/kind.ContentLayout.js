/**
 * Content Layout
 * Provides a container with fixed widht and/or height that resizes to reveal it's content
 * Supports Webkit, Mozilla, IE8
 * @author Lex Podgorny <lex.podgorny@lge.com>
 */

enyo.kind({
	name        : 'enyo.ContentLayout',
	layoutClass : 'enyo-content-layout',
	kind        : 'Layout',

	minWidth    : 0,
	minHeigh    : 0,
	maxWidth    : 0,
	maxHeight   : 0,

	/************** PRIVATE **************/

	_width      : 0,
	_height     : 0,

	_updateBoundValues: function() {
		if (this._isFlexChild()) {
			if (this._isFlexColumn()) {
				// console.log(this.container.name, 'updating max/min width');
				this.minWidth  = this.container.minWidth;
				this.maxWidth  = this.container.maxWidth;
			} else {
				// console.log(this.container.name, 'updating max/min height');
				this.minHeight = this.container.minHeight;
				this.maxHeight = this.container.maxHeight;
			}
		} else {
			this.minWidth  = this.container.minWidth;
			this.minHeight = this.container.minHeight;
			this.maxWidth  = this.container.maxWidth;
			this.maxHeight = this.container.maxHeight;
		}
	},

	_isFlexChild: function() {
		return this.container.parent.layoutKind == 'enyo.FlexLayout';
	},

	_isFlexColumn: function() {
		return this.container.parent.layout._isColumn(this.container);
	},

	_setSize: function(nWidth, nHeight, oStyles) {
		var bReflow = this._width != nWidth || this._height != nHeight;

		this._width  = nWidth;
		this._height = nHeight;

		if (this._isFlexChild()) {
			if (this._isFlexColumn()) {	oStyles.setContentWidth(nWidth);   }
			else                      { oStyles.setContentHeight(nHeight); }
		} else {
			oStyles.setContentWidth(nWidth);
			oStyles.setContentHeight(nHeight);
		}

		oStyles.set('overflow', 'auto');
		oStyles.commit();

		if (bReflow) {
			if (this._isFlexChild()) {
				this.reflow();
				this.container.parent.layout.reflow();
			}
		}
	},

	_updateSize: function() {
		this._updateBoundValues();

		var oStyles = new enyo.Styles(this.container);

		// If empty container, return min sizes
		/************************************************************************/
		if (this.container.children.length === 0 && this.container.content.length === 0) {
			this._setSize(this.minWidth, this.minHeight, oStyles);
			return;
		}

		// If at max size, simply return max sizes
		/************************************************************************/
		if (oStyles.content.width >= this.maxWidth && oStyles.content.height >= this.maxHeight) {
			this._setSize(this.maxWidth, this.maxHeight, oStyles);
			return;
		}

		// Otherwise
		/************************************************************************/

		var oElement = document.createElement(this.container.node.nodeName),
			nWidth,
			nHeight = this.minHeight;

		// Get width
		/************************************************************************/

		this.container.node.parentNode.appendChild(oElement);

		oElement.innerHTML     = this.container.node.innerHTML;
		oElement.className     = this.container.node.className;
		oElement.id            = this.container.node.id;
		oElement.style.display = 'inline';
		nWidth                 = oElement.offsetWidth - oStyles.h.padding;

		// Constrain to maxWidth

		if (nWidth < this.minWidth)   { nWidth = this.minWidth; }
		if (nWidth > this.maxWidth)   { nWidth = this.maxWidth; }

		// Get height
		/************************************************************************/

		oElement.height       = 'auto';
		oElement.style.width  = nWidth > 0 ? nWidth + 'px' : 'auto';
		nHeight               = oElement.offsetHeight - oStyles.v.padding;

		this.container.node.parentNode.removeChild(oElement);

		// Constrain to maxHeight

		if (nHeight < this.minHeight) { nHeight = this.minHeight; }
		if (nHeight > this.maxHeight) { nHeight = this.maxHeight; }

		/************************************************************************/
		this._setSize(nWidth, nHeight, oStyles);
	},

	/************** PUBLIC **************/

	flow: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
		};
	}),

	reflow : enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this._updateSize();
		};
	})
});
