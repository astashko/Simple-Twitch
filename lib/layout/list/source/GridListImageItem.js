/**
	_enyo.GridList.ImageItem_ is a convenience component that may be used inside
	an <a href="#enyo.GridList">enyo.GridList</a> or <a href="#enyo.DataGridList">enyo.DataGridList</a>
	to display an image grid with an optional caption and sub-caption.
*/

enyo.kind({
	name: "enyo.GridListImageItem",
	classes: "enyo-gridlist-imageitem",
	components: [
		{name: 'image', kind: 'enyo.Image'},
		{name: "caption", classes: "caption"},
		{name: "subCaption", classes: "sub-caption"}
	],
	published: {
		//* The absolute URL path to the image
		source: "",
		//* The primary caption to be displayed with the image
		caption: "",
		//* The second caption line to be displayed with the image
		subCaption: "",
		/**
            Set to true to add the _selected_ class to the image tile; set to
            false to remove the _selected_ class
        */
		selected: false
	},
	bindings: [
		{from: ".source", to: ".$.image.src"},
		{from: ".caption", to: ".$.caption.content"},
		{from: ".caption", to: ".$.caption.showing", kind: "enyo.EmptyBinding"},
		{from: ".subCaption", to: ".$.subCaption.content"},
		{from: ".subCaption", to: ".$.subCaption.showing", kind: "enyo.EmptyBinding"}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.selectedChanged();
		};
	}),
	selectedChanged: function() {
		this.addRemoveClass("selected", this.selected);
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
	}
});