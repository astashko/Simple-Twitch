/**
    _enyo.ContextualLayout_ provides the base positioning logic for a contextual
    layout strategy. This layout strategy is intended for use with a popup in a
    decorator/activator scenario, where the popup will be positioned relative to
    the activator. For example, [onyx.ContextualPopup](#onyx.ContextualPopup),
    would be used like so:

        {kind: "onyx.ContextualPopupDecorator", components: [
            {content: "Show Popup"},
            {kind: "onyx.ContextualPopup",
                title: "Sample Popup",
                actionButtons: [
                    {content: "Button 1", classes: "onyx-button-warning"},
                    {content: "Button 2"}
                ],
                components: [
                    {content: "Sample component in popup"}
                ]
            }
        ]}

    The decorator contains the popup and activator, with the activator being the
    first child component (i.e., the "Show Popup" button). The contextual layout
    strategy is applied because, in the definition of _onyx.ContextualPopup_,
    its _layoutKind_ property is set to _enyo.ContextualLayout_.

    Note that a popup using ContextualLayout as its _layoutKind_ is expected to
    declare several specific properties:

    * _vertFlushMargin_: The vertical flush layout margin, i.e., how close the
        popup's edge may come to the vertical screen edge (in pixels) before
        being laid out "flush" style

    * _horizFlushMargin_: The horizontal flush layout margin, i.e., how close
        the popup's edge may come to the horizontal screen edge (in pixels)
        before being laid out "flush" style

    * _widePopup_: A popup wider than this value (in pixels) is considered wide
        (for layout calculation purposes)

    * _longPopup_: A popup longer than this value (in pixels) is considered long
        (for layout calculation purposes)

    * _horizBuffer_: Horizontal flush popups are not allowed within this buffer
        area (in pixels) on the left or right screen edge

    * _activatorOffset_: The popup activator's offset on the page (in pixels);
        this should be calculated whenever the popup is to be shown
*/
enyo.kind({
	name: "enyo.ContextualLayout",
	kind: "Layout",
	//* Adjusts the popup position, as well as the nub location and direction.
	adjustPosition: function() {
		if (this.container.showing && this.container.hasNode()) {
			/****ContextualPopup positioning rules:
				1. Activator Location:
					a. If activator is located in a corner then position using a flush style.
						i.  Attempt vertical first.
						ii. Horizontal if vertical doesn't fit.
					b. If not in a corner then check if the activator is located in one of the 4 "edges" of the view & position the
						following way if so:
						i.   Activator is in top edge, position popup below it.
						ii.  Activator is in bottom edge, position popup above it.
						iii. Activator is in left edge, position popup to the right of it.
						iv.  Activator is in right edge, position popup to the left of it.

				2. Screen Size - the pop-up should generally extend in the direction where there’s room for it.
					Note: no specific logic below for this rule since it is built into the positioning functions, ie we attempt to never
					position a popup where there isn't enough room for it.

				3. Popup Size:
					i.  If popup content is wide, use top or bottom positioning.
					ii. If popup content is long, use horizontal positioning.

				4. Favor top or bottom:
					If all the above rules have been followed and location can still vary then favor top or bottom positioning.

				5. If top or bottom will work, favor bottom.
					Note: no specific logic below for this rule since it is built into the vertical position functions, ie we attempt to
					use a bottom position for the popup as much possible. Additionally within the vetical position function we center the
					popup if the activator is at the vertical center of the view.
			****/
			this.resetPositioning();
			var innerWidth = this.getViewWidth();
			var innerHeight = this.getViewHeight();

			//These are the view "flush boundaries"
			var topFlushPt = this.container.vertFlushMargin;
			var bottomFlushPt = innerHeight - this.container.vertFlushMargin;
			var leftFlushPt = this.container.horizFlushMargin;
			var rightFlushPt = innerWidth - this.container.horizFlushMargin;

			//Rule 1 - Activator Location based positioning
			//if the activator is in the top or bottom edges of the view, check if the popup needs flush positioning
			if ((this.offset.top + this.offset.height) < topFlushPt || this.offset.top > bottomFlushPt) {
				//check/try vertical flush positioning	(rule 1.a.i)
				if (this.applyVerticalFlushPositioning(leftFlushPt, rightFlushPt)) {
					return;
				}

				//if vertical doesn't fit then check/try horizontal flush (rule 1.a.ii)
				if (this.applyHorizontalFlushPositioning(leftFlushPt, rightFlushPt)) {
					return;
				}

				//if flush positioning didn't work then try just positioning vertically (rule 1.b.i & rule 1.b.ii)
				if (this.applyVerticalPositioning()){
					return;
				}
			//otherwise check if the activator is in the left or right edges of the view & if so try horizontal positioning
			} else if ((this.offset.left + this.offset.width) < leftFlushPt || this.offset.left > rightFlushPt) {
				//if flush positioning didn't work then try just positioning horizontally (rule 1.b.iii & rule 1.b.iv)
				if (this.applyHorizontalPositioning()){
					return;
				}
			}

			//Rule 2 - no specific logic below for this rule since it is inheritent to the positioning functions, ie we attempt to never
			//position a popup where there isn't enough room for it.

			//Rule 3 - Popup Size based positioning
			var clientRect = this.getBoundingRect(this.container.node);

			//if the popup is wide then use vertical positioning
			if (clientRect.width > this.container.widePopup) {
				if (this.applyVerticalPositioning()){
					return;
				}
			}
			//if the popup is long then use horizontal positioning
			else if (clientRect.height > this.container.longPopup) {
				if (this.applyHorizontalPositioning()){
					return;
				}
			}

			//Rule 4 - Favor top or bottom positioning
			if (this.applyVerticalPositioning()) {
				return;
			}
			//but if thats not possible try horizontal
			else if (this.applyHorizontalPositioning()){
				return;
			}

			//Rule 5 - no specific logic below for this rule since it is built into the vertical position functions, ie we attempt to
			//         use a bottom position for the popup as much possible.
		}
	},
	//move the popup below or above the activator & verify that it fits on screen
	initVerticalPositioning: function() {
		this.resetPositioning();
		this.container.addClass("vertical");

		var clientRect = this.getBoundingRect(this.container.node);
		var innerHeight = this.getViewHeight();

		if (this.container.floating){
			if (this.offset.top < (innerHeight / 2)) {
				this.applyPosition({top: this.offset.top + this.offset.height, bottom: "auto"});
				this.container.addClass("below");
			} else {
				this.applyPosition({top: this.offset.top - clientRect.height, bottom: "auto"});
				this.container.addClass("above");
			}
		} else {
			//if the popup's bottom goes off the screen then put it on the top of the invoking control
			if ((clientRect.top + clientRect.height > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))){
				this.container.addClass("above");
			} else {
				this.container.addClass("below");
			}
		}

		//if moving the popup above or below the activator puts it past the edge of the screen then vertical doesn't work
		clientRect = this.getBoundingRect(this.container.node);
		if ((clientRect.top + clientRect.height) > innerHeight || clientRect.top < 0){
			return false;
		}

		return true;
	},
	applyVerticalPositioning: function() {
		//if we can't fit the popup above or below the activator then forget vertical positioning
		if (!this.initVerticalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.container.node);
		var innerWidth = this.getViewWidth();

		if (this.container.floating){
			//Get the left edge delta to horizontally center the popup
			var centeredLeft = this.offset.left + this.offset.width/2 - clientRect.width/2;
			if (centeredLeft + clientRect.width > innerWidth) {//popup goes off right edge of the screen if centered
				this.applyPosition({left: this.offset.left + this.offset.width - clientRect.width});
				this.container.addClass("left");
			} else if (centeredLeft < 0) {//popup goes off left edge of the screen if centered
				this.applyPosition({left:this.offset.left});
				this.container.addClass("right");
			} else {//center the popup
				this.applyPosition({left: centeredLeft});
			}

		} else {
			//Get the left edge delta to horizontally center the popup
			var centeredLeftDelta = this.offset.left + this.offset.width/2 - clientRect.left - clientRect.width/2;
			if (clientRect.right + centeredLeftDelta > innerWidth) {//popup goes off right edge of the screen if centered
				this.applyPosition({left: this.offset.left + this.offset.width - clientRect.right});
				this.container.addRemoveClass("left", true);
			} else if (clientRect.left + centeredLeftDelta < 0) {//popup goes off left edge of the screen if centered
				this.container.addRemoveClass("right", true);
			} else {//center the popup
				this.applyPosition({left: centeredLeftDelta});
			}
		}

		return true;
	},
	applyVerticalFlushPositioning: function(leftFlushPt, rightFlushPt) {
		//if we can't fit the popup above or below the activator then forget vertical positioning
		if (!this.initVerticalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.container.node);
		var innerWidth = this.getViewWidth();

		//If the activator's right side is within our left side cut off use flush positioning
		if ((this.offset.left + this.offset.width/2) < leftFlushPt){
			//if the activator's left edge is too close or past the screen left edge
			if (this.offset.left + this.offset.width/2 < this.container.horizBuffer){
				this.applyPosition({left:this.container.horizBuffer + (this.container.floating ? 0 : -clientRect.left)});
			} else {
				this.applyPosition({left:this.offset.width/2  + (this.container.floating ? this.offset.left : 0)});
			}

			this.container.addClass("right");
			this.container.addClass("corner");
			return true;
		}
		//If the activator's left side is within our right side cut off use flush positioning
		else if (this.offset.left + this.offset.width/2 > rightFlushPt) {
			if ((this.offset.left+this.offset.width/2) > (innerWidth-this.container.horizBuffer)){
				this.applyPosition({left:innerWidth - this.container.horizBuffer - clientRect.right});
			} else {
				this.applyPosition({left: (this.offset.left + this.offset.width/2) - clientRect.right});
			}
			this.container.addClass("left");
			this.container.addClass("corner");
			return true;
		}

		return false;
	},
	//move the popup left or right of the activator & verify that it fits on screen
	initHorizontalPositioning: function() {
		this.resetPositioning();

		var clientRect = this.getBoundingRect(this.container.node);
		var innerWidth = this.getViewWidth();

		//adjust horizontal positioning of the popup & nub vertical positioning
		if (this.container.floating){
			if ((this.offset.left + this.offset.width) < innerWidth/2) {
				this.applyPosition({left: this.offset.left + this.offset.width});
				this.container.addRemoveClass("left", true);
			} else {
				this.applyPosition({left: this.offset.left - clientRect.width});
				this.container.addRemoveClass("right", true);
			}
		} else {
			if (this.offset.left - clientRect.width > 0) {
				this.applyPosition({left: this.offset.left - clientRect.left - clientRect.width});
				this.container.addRemoveClass("right", true);
			} else {
				this.applyPosition({left: this.offset.width});
				this.container.addRemoveClass("left", true);
			}
		}
		this.container.addRemoveClass("horizontal", true);

		//if moving the popup left or right of the activator puts it past the edge of the screen then horizontal won't work
		clientRect = this.getBoundingRect(this.container.node);
		if (clientRect.left < 0 || (clientRect.left + clientRect.width) > innerWidth){
			return false;
		}
		return true;

	},
	applyHorizontalPositioning: function() {
		//if we can't fit the popup left or right of the activator then forget horizontal positioning
		if (!this.initHorizontalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.container.node);
		var innerHeight = this.getViewHeight();
		var activatorCenter = this.offset.top + this.offset.height/2;

		if (this.container.floating){
			//if the activator's center is within 10% of the center of the view, vertically center the popup
			if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
				this.applyPosition({top: this.offset.top + this.offset.height/2 - clientRect.height/2, bottom: "auto"});
			} else if (this.offset.top + this.offset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
				this.applyPosition({top: this.offset.top, bottom: "auto"});
				this.container.addRemoveClass("high", true);
			} else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
				this.applyPosition({top: this.offset.top - clientRect.height + this.offset.height*2, bottom: "auto"});
				this.container.addRemoveClass("low", true);
			}
		} else {
			//if the activator's center is within 10% of the center of the view, vertically center the popup
			if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
				this.applyPosition({top: (this.offset.height - clientRect.height)/2});
			} else if (this.offset.top + this.offset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
				this.applyPosition({top: -this.offset.height});
				this.container.addRemoveClass("high", true);
			} else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
				this.applyPosition({top: clientRect.top - clientRect.height - this.offset.top + this.offset.height});
				this.container.addRemoveClass("low", true);
			}
		}
		return true;
	},
	applyHorizontalFlushPositioning: function(leftFlushPt, rightFlushPt) {
		//if we can't fit the popup left or right of the activator then forget vertical positioning
		if (!this.initHorizontalPositioning()) {
			return false;
		}

		var clientRect = this.getBoundingRect(this.container.node);
		var innerHeight = this.getViewHeight();

		//adjust vertical positioning (high or low nub & popup position)
		if (this.container.floating){
			if (this.offset.top < (innerHeight/2)){
				this.applyPosition({top: this.offset.top + this.offset.height/2});
				this.container.addRemoveClass("high", true);
			} else {
				this.applyPosition({top:this.offset.top + this.offset.height/2 - clientRect.height});
				this.container.addRemoveClass("low", true);
			}
		} else {
			if (((clientRect.top + clientRect.height) > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))) {
				this.applyPosition({top: clientRect.top - clientRect.height - this.offset.top - this.offset.height/2});
				this.container.addRemoveClass("low", true);
			} else {
				this.applyPosition({top: this.offset.height/2});
				this.container.addRemoveClass("high", true);
			}
		}

		//If the activator's right side is within our left side cut off use flush positioning
		if ((this.offset.left + this.offset.width) < leftFlushPt){
			this.container.addClass("left");
			this.container.addClass("corner");
			return true;
		}
		//If the activator's left side is within our right side cut off use flush positioning
		else if (this.offset.left > rightFlushPt) {
			this.container.addClass("right");
			this.container.addClass("corner");
			return true;
		}

		return false;
	},
	getBoundingRect:  function(inNode){
		// getBoundingClientRect returns top/left values which are relative to the viewport and not absolute
		var o = inNode.getBoundingClientRect();
		if (!o.width || !o.height) {
			return {
				left: o.left,
				right: o.right,
				top: o.top,
				bottom: o.bottom,
				width: o.right - o.left,
				height: o.bottom - o.top
			};
		}
		return o;
	},
	getViewHeight: function() {
		return (window.innerHeight === undefined) ? document.documentElement.clientHeight : window.innerHeight;
	},
	getViewWidth: function() {
		return (window.innerWidth === undefined) ? document.documentElement.clientWidth : window.innerWidth;
	},
	applyPosition: function(inRect) {
		var s = "";
		for (var n in inRect) {
			s += (n + ":" + inRect[n] + (isNaN(inRect[n]) ? "; " : "px; "));
		}
		this.container.addStyles(s);
	},
	resetPositioning: function() {
		this.container.removeClass("right");
		this.container.removeClass("left");
		this.container.removeClass("high");
		this.container.removeClass("low");
		this.container.removeClass("corner");
		this.container.removeClass("below");
		this.container.removeClass("above");
		this.container.removeClass("vertical");
		this.container.removeClass("horizontal");

		this.applyPosition({left: "auto"});
		this.applyPosition({top: "auto"});
	},
	reflow: function() {
		this.offset = this.container.activatorOffset;
		this.adjustPosition();
	}
});