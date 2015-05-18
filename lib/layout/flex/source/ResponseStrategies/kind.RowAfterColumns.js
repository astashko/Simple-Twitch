/**
 * enyo.FlexLayout.ResponseStrategy.RowAfterColumns kind definition
 * @author: Lex Podgorny
 */

enyo.FlexLayout.ResponseStrategy.RowAfterColumns = enyo.singleton({
	kind: 'enyo.FlexLayout.ResponseStrategy',
	_getPositionAfterColumns: function(oControl) {
		var n         = 0,
			bFound    = false,
			aChildren = oControl.parent.children,
			nChildren = aChildren.length;

		for (;n<nChildren; n++) {
			if (aChildren[n] == oControl) {
				bFound = true;
				continue;
			}
			if (bFound && aChildren[n].flexOrient != 'column') {
				return n - 1;
			}
		}
		return -1;
	},
	respond: enyo.inherit(function(sup) {
		return function(oControl, bIncreasing) {
			sup.apply(this, arguments);
			if (bIncreasing) {
				this.reverseProperty(oControl, 'flexOrder');
				this.reverseProperty(oControl, 'flexOrient');
			} else {
				this.setProperty(oControl, 'flexOrder', this._getPositionAfterColumns(oControl));
				this.setProperty(oControl, 'flexOrient', 'row');
			}
		};
	})
});