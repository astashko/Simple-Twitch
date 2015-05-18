/**
	_enyo.FittableLayout_ provides the base positioning and boundary logic for
	the fittable layout strategy. The fittable layout strategy is based on
	laying out items in either a set of rows or a set of columns, with most of
	the items having natural size, but one item expanding to fill the remaining
	space. The item that expands is labeled with the attribute _fit: true_.

	The subkinds [enyo.FittableColumnsLayout](#enyo.FittableColumnsLayout) and
	[enyo.FittableRowsLayout](#enyo.FittableRowsLayout) (or _their_ subkinds)
	are used for layout rather than _enyo.FittableLayout_ because they specify
	properties that the framework expects to be available when laying items out.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/

enyo.kind({
	name: 'enyo.FittableLayout',
	kind: 'Layout',

	//* @protected
	constructor: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			
			// Add the force-ltr class if we're in RTL mode, but this control is set explicitly to NOT be in RTL mode.
			this.container.addRemoveClass("force-left-to-right", (enyo.Control.prototype.rtl && !this.container.get("rtl")) );
		};
	}),
	calcFitIndex: function() {
		var aChildren = this.container.children,
			oChild,
			n;

		for (n=0; n<aChildren.length; n++) {
			oChild = aChildren[n];
			if (oChild.fit && oChild.showing) {
				return n;
			}
		}
	},

	getFitControl: function() {
		var aChildren = this.container.children,
			oFitChild = aChildren[this.fitIndex];

		if (!(oFitChild && oFitChild.fit && oFitChild.showing)) {
			this.fitIndex = this.calcFitIndex();
			oFitChild = aChildren[this.fitIndex];
		}
		return oFitChild;
	},

	shouldReverse: function() {
		return this.container.rtl && this.orient === "h";
	},

	getFirstChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[aChildren.length - 1];
		} else {
			return aChildren[0];
		}
	},

	getLastChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[0];
		} else {
			return aChildren[aChildren.length - 1];
		}
	},

	getShowingChildren: function() {
		var a = [],
			n = 0,
			aChildren = this.container.children,
			nLength   = aChildren.length;

		for (;n<nLength; n++) {
			if (aChildren[n].showing) {
				a.push(aChildren[n]);
			}
		}

		return a;
	},

	_reflow: function(sMeasureName, sClienMeasure, sAttrBefore, sAttrAfter) {
		this.container.addRemoveClass('enyo-stretch', !this.container.noStretch);

		var oFitChild       = this.getFitControl(),
			oContainerNode  = this.container.hasNode(),  // Container node
			nTotalSize     = 0,                          // Total container width or height without padding
			nBeforeOffset   = 0,                         // Offset before fit child
			nAfterOffset    = 0,                         // Offset after fit child
			oPadding,                                    // Object containing t,b,r,l paddings
			oBounds,                                     // Bounds object of fit control
			oLastChild,
			oFirstChild,
			nFitSize;

		if (!oFitChild || !oContainerNode) { return; }

		oPadding   = enyo.dom.calcPaddingExtents(oContainerNode);
		oBounds    = oFitChild.getBounds();
		nTotalSize = oContainerNode[sClienMeasure] - (oPadding[sAttrBefore] + oPadding[sAttrAfter]);

		if (this.shouldReverse()) {
			oFirstChild  = this.getFirstChild();
			nAfterOffset = nTotalSize - (oBounds[sAttrBefore] + oBounds[sMeasureName]);

			var nMarginBeforeFirstChild = enyo.dom.getComputedBoxValue(oFirstChild.hasNode(), 'margin', sAttrBefore) || 0;

			if (oFirstChild == oFitChild) {
				nBeforeOffset = nMarginBeforeFirstChild;
			} else {
				var oFirstChildBounds      = oFirstChild.getBounds(),
					nSpaceBeforeFirstChild = oFirstChildBounds[sAttrBefore];

				nBeforeOffset = oBounds[sAttrBefore] + nMarginBeforeFirstChild - nSpaceBeforeFirstChild;
			}
		} else {
			oLastChild    = this.getLastChild();
			nBeforeOffset = oBounds[sAttrBefore] - (oPadding[sAttrBefore] || 0);

			var nMarginAfterLastChild = enyo.dom.getComputedBoxValue(oLastChild.hasNode(), 'margin', sAttrAfter) || 0;

			if (oLastChild == oFitChild) {
				nAfterOffset = nMarginAfterLastChild;
			} else {
				var oLastChildBounds = oLastChild.getBounds(),
					nFitChildEnd     = oBounds[sAttrBefore] + oBounds[sMeasureName],
					nLastChildEnd    = oLastChildBounds[sAttrBefore] + oLastChildBounds[sMeasureName] +  nMarginAfterLastChild;

				nAfterOffset = nLastChildEnd - nFitChildEnd;
			}
		}

		nFitSize = nTotalSize - (nBeforeOffset + nAfterOffset);
		oFitChild.applyStyle(sMeasureName, nFitSize + 'px');
	},

	//* @public
	/**
		Updates the layout to reflect any changes to contained components or the
		layout container.
	*/
	reflow: function() {
		if (this.orient == 'h') {
			this._reflow('width', 'clientWidth', 'left', 'right');
		} else {
			this._reflow('height', 'clientHeight', 'top', 'bottom');
		}
	}
});

/**
	_enyo.FittableColumnsLayout_ provides a container in which items are laid
	out in a set of vertical columns, with most of the items having natural
	size, but one expanding to fill the remaining space. The one that expands is
	labeled with the attribute _fit: true_.

	_enyo.FittableColumnsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name        : 'enyo.FittableColumnsLayout',
	kind        : 'FittableLayout',
	orient      : 'h',
	layoutClass : 'enyo-fittable-columns-layout'
});


/**
	_enyo.FittableRowsLayout_ provides a container in which items are laid out
	in a set of horizontal rows, with most of the items having natural size, but
	one expanding to fill the remaining space. The one that expands is labeled
	with the attribute _fit: true_.

	_enyo.FittableRowsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.

	For more information, see the documentation on
	[Fittables](building-apps/layout/fittables.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name        : 'enyo.FittableRowsLayout',
	kind        : 'FittableLayout',
	layoutClass : 'enyo-fittable-rows-layout',
	orient      : 'v'
});
