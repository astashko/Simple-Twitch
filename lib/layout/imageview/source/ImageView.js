/**
	_enyo.ImageView_ is a control that displays an image at a given scaling
	factor, with enhanced support for double-tap/double-click to zoom, panning,
	mousewheel zooming and pinch-zoom (on touchscreen devices that support it).

		{kind: "ImageView", src: "assets/globe.jpg", scale: "auto",
			style: "width:500px; height:400px;"}

	The _onload_ and _onerror_ events bubble up from the underlying image
	element	and an _onZoom_ event is triggered when the user changes the zoom
	level of the image.

	If you wish, you may add <a href="#enyo.ScrollThumb">enyo.ScrollThumb</a>
	indicators, disable zoom animation, allow panning overscroll (with a
	bounce-back effect), and control the propagation of drag events, all via
	boolean properties.

	Note that it's best to specify a size for the ImageView in order to avoid
	complications.
*/
enyo.kind({
	name: "enyo.ImageView",
	kind: "enyo.PanZoomView",
	subKindComponents: [
		{kind:"Image", ondown: "down", style: "vertical-align: text-top;"}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			// move components (most likely imageViewPins) to unscaledComponents
			this.unscaledComponents = this.components;
			this.components = [];

			//amend kindComponents
			this.kindComponents[1].components[0].components = this.subKindComponents;

			sup.apply(this, arguments);

			// set content as inline-block to mimic behaviour of an image
			this.$.content.applyStyle("display", "inline-block");

			//offscreen buffer image to get initial image dimensions
			//before displaying a scaled down image that can fit in the container
			this.bufferImage = new Image();
			this.bufferImage.onload = enyo.bind(this, "imageLoaded");
			this.bufferImage.onerror = enyo.bind(this, "imageError");
			this.srcChanged();
			//	Needed to kickoff pin redrawing (otherwise they wont' redraw on intitial scroll)
			if(this.getStrategy().$.scrollMath) {
				this.getStrategy().$.scrollMath.start();
			}
		};
	}),
	destroy: enyo.inherit(function(sup) {
		return function() {
			if (this.bufferImage) {
				this.bufferImage.onerror = undefined;
				this.bufferImage.onerror = undefined;
				delete this.bufferImage;
			}
			sup.apply(this, arguments);
		};
	}),
	down: function(inSender, inEvent) {
		// Fix to prevent image drag in Firefox
		inEvent.preventDefault();
	},
	srcChanged: function() {
		if(this.src && this.src.length>0 && this.bufferImage && this.src!=this.bufferImage.src) {
			this.bufferImage.src = this.src;
		}
	},
	imageLoaded: function(inEvent) {
		this.scale = this.scaleKeyword;
		this.originalWidth = this.contentWidth = this.bufferImage.width;
		this.originalHeight = this.contentHeight = this.bufferImage.height;

		//scale to fit before setting src, so unscaled image isn't visible
		this.scaleChanged();
		this.$.image.setSrc(this.bufferImage.src);

		//Needed to ensure scroller contents height/width is calculated correctly when contents use enyo-fit
		enyo.dom.transformValue(this.getStrategy().$.client, "translate3d", "0px, 0px, 0");

		this.positionClientControls(this.scale);
		this.align();
	},
	imageError: function(inEvent) {
		enyo.error("Error loading image: " + this.src);
		//bubble up the error event
		this.bubble("onerror", inEvent);
	}
});
