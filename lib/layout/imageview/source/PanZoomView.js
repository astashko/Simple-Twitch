/**
	_enyo.PanZoomView_ is a control that displays arbitrary content at a given
	scaling factor, with enhanced support for double-tap/double-click to zoom,
	panning, mousewheel zooming and pinch-zoom (on touchscreen devices that
	support it).

		{kind: "PanZoomView", scale: "auto", contentWidth: 500, contentHeight: 500,
			style: "width:500px; height:400px;",
			components: [{content: "Hello World"}]
		}

	An _onZoom_ event is triggered when the user changes the zoom level.

	If you wish, you may add <a href="#enyo.ScrollThumb">enyo.ScrollThumb</a>
	indicators, disable zoom animation, allow panning overscroll (with a
	bounce-back effect), and control the propagation of drag events, all via
	boolean properties.

	For the PanZoomView to work, you must either specify the width and height of
	the scaled content (via the _contentWidth_ and _contentHeight_ properties) or
	bubble an _onSetDimensions_ event from one of the underlying components.

	Note that it's best to specify a size for the PanZoomView in order to avoid
	complications.
*/

enyo.kind({
	name: "enyo.PanZoomView",
	kind: enyo.Scroller,
	/**
		If true, allows for overscrolling during panning, with a bounce-back
		effect. (Defaults to false.)
	*/
	touchOverscroll: false,
	/**
		If true, a ScrollThumb is used to indicate scroll position/bounds.
		(Defaults to false.)
	*/
	thumb: false,
	/**
		If true (the default), animates the zoom action triggered by a double-tap
		(or double-click)
	*/
	animate: true,
	/**
		If true (the default), allows propagation of vertical drag events when
		already at the top or bottom of the pannable area
	*/
	verticalDragPropagation: true,
	/**
		If true (the default), allows propagation of horizontal drag events when
		already at the left or right edge of the pannable area
	*/
	horizontalDragPropagation: true,
	published: {
		/**
			The scale at which the content should be displayed. This may be any
			positive numeric value or one of the following key words (which will
			be resolved to a value dynamically):

			* "auto": Fits the content to the size of the PanZoomView
			* "width": Fits the content the width of the PanZoomView
			* "height": Fits the content to the height of the PanZoomView
			* "fit": Fits the content to the height and width of the PanZoomView.
				Overflow of the larger dimension is cropped and the content is centered
				on this axis
		*/
		scale: "auto",
		//* If true, disables the zoom functionality
		disableZoom: false
	},
	events: {
		/**
			Fires whenever the user adjusts the zoom via double-tap/double-click,
			mousewheel, or pinch-zoom.

			_inEvent.scale_ contains the new scaling factor.
		*/
		onZoom:""
	},
	//* @protected
	touch: true,
	preventDragPropagation: false,
	handlers: {
		ondragstart: "dragPropagation",
		onSetDimensions: "setDimensions"
	},
	components:[
		{
			name: "animator",
			kind: "Animator",
			onStep: "zoomAnimationStep",
			onEnd: "zoomAnimationEnd"
		},
		{
			name:"viewport",
			style:"overflow:hidden;min-height:100%;min-width:100%;",
			classes:"enyo-fit",
			ongesturechange: "gestureTransform",
			ongestureend: "saveState",
			ontap: "singleTap",
			ondblclick:"doubleClick",
			onmousewheel:"mousewheel",
			components:[
				{name: "content"}
			]
		}
	],
	create: enyo.inherit(function(sup) {
		return function() {
			// remember scale keyword
			this.scaleKeyword = this.scale;

			// Cache instance components
			var instanceComponents = this.components;
			this.components = [];
			sup.apply(this, arguments);
			this.$.content.applyStyle("width", this.contentWidth + "px");
			this.$.content.applyStyle("height", this.contentHeight + "px");

			if(this.unscaledComponents){
				this.createComponents(this.unscaledComponents);
			}

			// Change controlParentName so PanZoomView instance components are created into viewport
			this.controlParentName = "content";
			this.discoverControlParent();
			this.createComponents(instanceComponents);

			this.canTransform = enyo.dom.canTransform();
			if(!this.canTransform) {
				this.$.content.applyStyle("position", "relative");
			}
			this.canAccelerate = enyo.dom.canAccelerate();

			//	For panzoomview, disable drags during gesture (to fix flicker: ENYO-1208)
			this.getStrategy().setDragDuringGesture(false);
		};
	}),
	rendered: enyo.inherit(function(sup) {
		return function(){
			sup.apply(this, arguments);
			this.getOriginalScale();
		};
	}),
	dragPropagation: function(inSender, inEvent) {
		// Propagate drag events at the edges of the content as desired by the
		// verticalDragPropagation and horizontalDragPropagation properties
		var bounds = this.getStrategy().getScrollBounds();
		var verticalEdge = ((bounds.top===0 && inEvent.dy>0) || (bounds.top>=bounds.maxTop-2 && inEvent.dy<0));
		var horizontalEdge = ((bounds.left===0 && inEvent.dx>0) || (bounds.left>=bounds.maxLeft-2 && inEvent.dx<0));
		return !((verticalEdge && this.verticalDragPropagation) || (horizontalEdge && this.horizontalDragPropagation));
	},
	mousewheel: function(inSender, inEvent) {
		inEvent.pageX |= (inEvent.clientX + inEvent.target.scrollLeft);
		inEvent.pageY |= (inEvent.clientY + inEvent.target.scrollTop);
		var zoomInc = (this.maxScale - this.minScale)/10;
		var oldScale = this.scale;
		if((inEvent.wheelDelta > 0) || (inEvent.detail < 0)) { //zoom in
			this.scale = this.limitScale(this.scale + zoomInc);
		} else if((inEvent.wheelDelta < 0) || (inEvent.detail > 0)) { //zoom out
			this.scale = this.limitScale(this.scale - zoomInc);
		}
		this.eventPt = this.calcEventLocation(inEvent);
		this.transform(this.scale);
		if(oldScale != this.scale) {
			this.doZoom({scale:this.scale});
		}
		this.ratioX = this.ratioY = null;
		// Prevent default scroll wheel action and prevent event from bubbling up to to touch scroller
		inEvent.preventDefault();
		return true;
	},
	resizeHandler: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.scaleChanged();
		};
	}),
	setDimensions: function(inSender, inEvent){
		this.$.content.applyStyle("width", inEvent.width + "px");
		this.$.content.applyStyle("height", inEvent.height + "px");
		this.originalWidth = inEvent.width;
		this.originalHeight = inEvent.height;
		this.scale = this.scaleKeyword;
		this.scaleChanged();
		return true;
	},
	getOriginalScale : function(){
		if(this.$.content.hasNode()){
			this.originalWidth  = this.$.content.node.clientWidth;
			this.originalHeight = this.$.content.node.clientHeight;
			this.scale = this.scaleKeyword;
			this.scaleChanged();
		}
	},
	scaleChanged: function() {
		var containerNode = this.hasNode();
		if(containerNode) {
			this.containerWidth = containerNode.clientWidth;
			this.containerHeight = containerNode.clientHeight;
			var widthScale = this.containerWidth / this.originalWidth;
			var heightScale = this.containerHeight / this.originalHeight;
			this.minScale = Math.min(widthScale, heightScale);
			this.maxScale = (this.minScale*3 < 1) ? 1 : this.minScale*3;
			//resolve any keyword scale values to solid numeric values
			if(this.scale == "auto") {
				this.scale = this.minScale;
			} else if(this.scale == "width") {
				this.scale = widthScale;
			} else if(this.scale == "height") {
				this.scale = heightScale;
			} else if(this.scale == "fit") {
				this.fitAlignment = "center";
				this.scale = Math.max(widthScale, heightScale);
			} else {
				this.maxScale = Math.max(this.maxScale, this.scale);
				this.scale = this.limitScale(this.scale);
			}
		}
		this.eventPt = this.calcEventLocation();
		this.transform(this.scale);
		// start scroller
		if(this.getStrategy().$.scrollMath) {
			this.getStrategy().$.scrollMath.start();
		}
		this.align();
	},
	align: function() {
		if (this.fitAlignment && this.fitAlignment === "center") {
			var sb = this.getScrollBounds();
			this.setScrollLeft(sb.maxLeft / 2);
			this.setScrollTop(sb.maxTop / 2);
		}
	},
	gestureTransform: function(inSender, inEvent) {
		this.eventPt = this.calcEventLocation(inEvent);
		this.transform(this.limitScale(this.scale * inEvent.scale));
	},
	calcEventLocation: function(inEvent) {
		//determine the target coordinates on the panzoomview from an event
		var eventPt = {x: 0, y:0};
		if(inEvent && this.hasNode()) {
			var rect = this.node.getBoundingClientRect();
			eventPt.x = Math.round((inEvent.pageX - rect.left) - this.bounds.x);
			eventPt.x = Math.max(0, Math.min(this.bounds.width, eventPt.x));
			eventPt.y = Math.round((inEvent.pageY - rect.top) - this.bounds.y);
			eventPt.y = Math.max(0, Math.min(this.bounds.height, eventPt.y));
		}
		return eventPt;
	},
	transform: function(scale) {
		this.tapped = false;

		var prevBounds = this.bounds || this.innerBounds(scale);
		this.bounds = this.innerBounds(scale);

		//style cursor if needed to indicate the content is movable
		if(this.scale>this.minScale) {
			this.$.viewport.applyStyle("cursor", "move");
		} else {
			this.$.viewport.applyStyle("cursor", null);
		}
		this.$.viewport.setBounds({width: this.bounds.width + "px", height: this.bounds.height + "px"});

		//determine the exact ratio where on the content was tapped
		this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / prevBounds.width;
		this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / prevBounds.height;
		var scrollLeft, scrollTop;
		if(this.$.animator.ratioLock) { //locked for smartzoom
			scrollLeft = (this.$.animator.ratioLock.x * this.bounds.width) - (this.containerWidth / 2);
			scrollTop = (this.$.animator.ratioLock.y * this.bounds.height) - (this.containerHeight / 2);
		} else {
			scrollLeft = (this.ratioX * this.bounds.width) - this.eventPt.x;
			scrollTop = (this.ratioY * this.bounds.height) - this.eventPt.y;
		}
		scrollLeft = Math.max(0, Math.min((this.bounds.width - this.containerWidth), scrollLeft));
		scrollTop = Math.max(0, Math.min((this.bounds.height - this.containerHeight), scrollTop));

		if(this.canTransform) {
			var params = {scale: scale};
			// translate needs to be first, or scale and rotation will not be in the correct spot
			if(this.canAccelerate) {
				//translate3d rounded values to avoid distortion; ref: http://martinkool.com/post/27618832225/beware-of-half-pixels-in-css
				params = enyo.mixin({translate3d: Math.round(this.bounds.left) + "px, " + Math.round(this.bounds.top) + "px, 0px"}, params);
			} else {
				params = enyo.mixin({translate: this.bounds.left + "px, " + this.bounds.top + "px"}, params);
			}
			enyo.dom.transform(this.$.content, params);
		} else if (enyo.platform.ie) {
			// IE8 does not support transforms, but filter should work
			// http://www.useragentman.com/IETransformsTranslator/
			var matrix = "\"progid:DXImageTransform.Microsoft.Matrix(M11="+scale+", M12=0, M21=0, M22="+scale+", SizingMethod='auto expand')\"";
			this.$.content.applyStyle("-ms-filter", matrix);
			this.$.content.setBounds({width: this.bounds.width*scale + "px", height: this.bounds.height*scale + "px",
					left:this.bounds.left + "px", top:this.bounds.top + "px"});
			this.$.content.applyStyle("width", scale*this.bounds.width);
			this.$.content.applyStyle("height", scale*this.bounds.height);
		} else {
			// ...no transforms and not IE... there's nothin' I can do.
		}

		//adjust scroller to new position that keeps ratio with the new content size
		this.setScrollLeft(scrollLeft);
		this.setScrollTop(scrollTop);

		this.positionClientControls(scale);

		//this.stabilize();
	},
	limitScale: function(scale) {
		if(this.disableZoom) {
			scale = this.scale;
		} else if(scale > this.maxScale) {
			scale = this.maxScale;
		} else if(scale < this.minScale) {
			scale = this.minScale;
		}
		return scale;
	},
	innerBounds: function(scale) {
		var width = this.originalWidth * scale;
		var height = this.originalHeight * scale;
		var offset = {x:0, y:0, transX:0, transY:0};
		if(width<this.containerWidth) {
			offset.x += (this.containerWidth - width)/2;
		}
		if(height<this.containerHeight) {
			offset.y += (this.containerHeight - height)/2;
		}
		if(this.canTransform) { //adjust for the css translate, which doesn't alter content offsetWidth and offsetHeight
			offset.transX -= (this.originalWidth - width)/2;
			offset.transY -= (this.originalHeight - height)/2;
		}
		return {left:offset.x + offset.transX, top:offset.y + offset.transY, width:width, height:height, x:offset.x, y:offset.y};
	},
	saveState: function(inSender, inEvent) {
		var oldScale = this.scale;
		this.scale *= inEvent.scale;
		this.scale = this.limitScale(this.scale);
		if(oldScale != this.scale) {
			this.doZoom({scale:this.scale});
		}
		this.ratioX = this.ratioY = null;
	},
	doubleClick: function(inSender, inEvent) {
		//IE 8 fix; dblclick fires rather than multiple successive click events
		if(enyo.platform.ie==8) {
			this.tapped = true;
			//normalize event
			inEvent.pageX = inEvent.clientX + inEvent.target.scrollLeft;
			inEvent.pageY = inEvent.clientY + inEvent.target.scrollTop;
			this.singleTap(inSender, inEvent);
			inEvent.preventDefault();
		}
	},
	singleTap: function(inSender, inEvent) {
		setTimeout(this.bindSafely(function() {
			this.tapped = false;
		}), 300);
		if(this.tapped) { //dbltap
			this.tapped = false;
			this.smartZoom(inSender, inEvent);
		} else {
			this.tapped = true;
		}
	},
	smartZoom: function(inSender, inEvent) {
		var containerNode = this.hasNode();
		var imgNode = this.$.content.hasNode();
		if(containerNode && imgNode && this.hasNode() && !this.disableZoom) {
			var prevScale = this.scale;
			if(this.scale!=this.minScale) { //zoom out
				this.scale = this.minScale;
			} else { //zoom in
				this.scale = this.maxScale;
			}
			this.eventPt = this.calcEventLocation(inEvent);
			if(this.animate) {
				//lock ratio position of event, and animate the scale change
				var ratioLock = {
					x: ((this.eventPt.x + this.getScrollLeft()) / this.bounds.width),
					y: ((this.eventPt.y + this.getScrollTop()) / this.bounds.height)
				};
				this.$.animator.play({
					duration:350,
					ratioLock: ratioLock,
					baseScale:prevScale,
					deltaScale:this.scale - prevScale
				});
			} else {
				this.transform(this.scale);
				this.doZoom({scale:this.scale});
			}
		}
	},
	zoomAnimationStep: function(inSender, inEvent) {
		var currScale = this.$.animator.baseScale + (this.$.animator.deltaScale * this.$.animator.value);
		this.transform(currScale);
		return true;
	},
	zoomAnimationEnd: function(inSender, inEvent) {
		this.stabilize();
		this.doZoom({scale:this.scale});
		this.$.animator.ratioLock = undefined;
		return true;
	},
	positionClientControls: function(scale) {
		this.waterfallDown("onPositionPin", {
			scale: scale,
			bounds: this.bounds
		});
	}
});