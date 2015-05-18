/**
	A control that presents an alphabetic panel that you can select from, in
	order to perform actions based on the item selected.

		{kind: "AlphaJumpList", onSetupItem: "setupItem",
			onAlphaJump: "alphaJump",
			components: [
				{name: "divider"},
				{kind: "onyx.Item"}
			]
		}

*/
enyo.kind({
	name: "enyo.AlphaJumpList",
	kind: "List",
	//* @protected
	scrollTools: [
		{name: "jumper", kind: "AlphaJumper"}
	],
	initComponents: enyo.inherit(function(sup) {
		return function() {
			this.createChrome(this.scrollTools);
			sup.apply(this, arguments);
		};
	}),
	rendered: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.centerJumper();
		};
	}),
	resizeHandler: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.centerJumper();
		};
	}),
	centerJumper: function() {
		var b = this.getBounds(), sb = this.$.jumper.getBounds();
		this.$.jumper.applyStyle("top", ((b.height - sb.height) / 2) + "px");
	}
});