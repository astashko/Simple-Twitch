enyo.kind({
	name    : 'enyo.Spotlight.ContainerSample',
	classes : 'sample',
	fit     : true,
	
	handlers: {
		onSpotlightFocus: 'onSpotlightFocus'
	},
	
	components: [
		{name: 'c1', spotlight: 'container', classes: 'container', components: [
			{name: 'c11', spotlight: 'container', classes: 'container', components: [
				{name: 'c111', spotlight: 'container', classes: 'container', components: [
					{name: 'button1', spotlight: true, kind: 'Button', content: 'Button1'},
					{name: 'button2', spotlight: true, kind: 'Button', content: 'Button2'}
				]}
			]},
			{name: 'c12' ,spotlight: 'container', classes: 'container', components: [
				{name: 'button3', spotlight: true, kind: 'Button', content: 'Button3'},
				{name: 'button4', spotlight: true, kind: 'Button', content: 'Button4'}
			]},
			{name: 'c13', spotlight: 'container', classes: 'container', components: [
				{name: 'c131', spotlight: 'container', classes: 'container', components: [
				]}
			]},
			{name: 'button5', spotlight: true, kind: 'Button', content: 'Button5'}
		]},
		{name: 'button6', spotlight: true, kind: 'Button', content: 'Button6'}
	],
	
	onSpotlightFocus: function(oSender, oEvent) {
		enyo.log('Focus ' + oEvent.originator.toString());
	},
	
	rendered: function() {
		this.inherited(arguments);
	}
});

enyo.Spotlight.verbose();
