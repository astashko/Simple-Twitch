enyo.kind({
	name: 'moon.sample.SpotlightSandboxSample',
	classes: 'moon',
	fit: false,
	components:[
		{components: [
			{kind: 'enyo.Button', content: 'Add Control', ontap: 'addBarracuda'}
		]},
		{name: 'container', style: 'position:relative;'}
	],
	rendered: function() {
		this.inherited(arguments);
		enyo.Spotlight.TestMode.enable();
		for (var y=0; y<2; y++) {
			for (var x=0; x<4; x++) {
				var b = this.$.container.createComponent({kind: 'Barracuda'}).render();
				b.applyStyle('top', (100*(y+1)) + 'px');
				b.applyStyle('left', (100 + x * 100) + 'px');
			}
		}
	},
	addBarracuda: function() {
		var b = this.$.container.createComponent({kind: 'Barracuda'}).render();
		b.applyStyle('z-index:'+this.$.container.getClientControls().length+';');
	}
});

enyo.kind({
	name     : 'Barracuda',
	kind     : 'moon.Item',
	classes  : 'barracuda',
	
	handlers: {
		ondown : 'mousedown',
		onup   : 'mouseup',
		ondrag : 'drag'
	},
	
	components: [
		{name: 'corner', classes: 'barracuda-corner'}
	],
	
	index       : null,
	resizing    : false,
	cornerWidth : 20,
	initY       : null,
	initX       : null,
	initHeight  : null,
	initWidth   : null,
	
	rendered: function() {
		this.inherited(arguments);
		this.$.corner.addStyles('height:'+this.cornerWidth+'px;width:'+this.cornerWidth+'px;');
		this.index = this.parent.children.length;
	},
	
	mousedown: function(inSender, inEvent) {
		enyo.Spotlight.TestMode.disable();
		// check if resizing
		this.resizing = this.isResizing(inEvent);

		// save initial values
		var bounds = this.getBounds();
		this.initY = bounds.top;
		this.initX = bounds.left;
		this.initWidth = bounds.width;
		this.initHeight = bounds.height;
	},
	
	mouseup: function(oSender, oEvent) {
		enyo.Spotlight.TestMode.enable();
	},
	
	drag: function(inSender, inEvent) {
		if(this.resizing) {
			this.doResize(inEvent);
		} else {
			this.doDrag(inEvent);
		}
	},
	
	isResizing: function(inEvent) {
		var bounds = this.getAbsoluteBounds(),
			relativeTop = inEvent.clientY - bounds.top,
			relativeLeft = inEvent.clientX - bounds.left,
			relativeBottom = bounds.height - relativeTop,
			relativeRight = bounds.width - relativeLeft;

		this.resizingX = (relativeLeft < this.cornerWidth)
			? -1 
			: (relativeRight < this.cornerWidth) 
				? 1
				: 0;

		this.resizingY = (relativeTop < this.cornerWidth)
			? -1
			: (relativeBottom < this.cornerWidth)
				? 1
				: 0;

		//	TODO - only pay attention to bottom right for resizing for now
		return (relativeRight < this.cornerWidth && relativeBottom < this.cornerWidth);
		// return this.resizingX !== 0 && this.resizingY !== 0;
	},
	
	doResize: function(inEvent) {
		this.addStyles('width:'+(inEvent.dx + this.initWidth)+'px;height:'+(inEvent.dy + this.initHeight)+'px;');
	},
	
	doDrag: function(inEvent) {
		this.addStyles('left:'+(inEvent.dx + this.initX)+'px;top:'+(inEvent.dy + this.initY)+'px;');
	}
});

