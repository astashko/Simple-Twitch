enyo.kind({
	name    : 'enyo.Spotlight.DisappearSample',
	classes : 'sample',
	fit     : true,
	
	handlers: {
		onSpotlightFocus: 'onSpotlightFocus'
	},
	
	components: [
		{name: 'c1', spotlight: 'container', classes: 'container', components: [
			{name: 'button01', spotlight: true, kind: 'Button', content: 'I am first spottable of the app'},
			{name: 'button02', spotlight: true, kind: 'Button', content: 'I am defaultSpotlightDisappear for "Destroy My Ansestor"'},
			{name: 'button03', spotlight: true, kind: 'Button', content: 'Restore disappeared buttons', ontap: 'restore'},
			{name: 'c11', spotlight: 'container', classes: 'container', components: [
				{name: 'c111', spotlight: 'container', classes: 'container', components: [
					{components: [
						{name: 'button1', spotlight: true, kind: 'Button', content: 'Disable Me', ontap: 'disableButton1'},
						{name: 'button2', spotlight: true, kind: 'Button', content: 'Destroy Me', ontap: 'destroyButton2'},
						{name: 'button3', spotlight: true, kind: 'Button', content: 'Hide Me',    ontap: 'hideButton3'   }
					]},
					{components: [
						{name: 'button4', spotlight: true, kind: 'Button', content: 'Destroy My Ansestor', ontap: 'destroyAnsestor', defaultSpotlightDisappear: 'button02'},
						{name: 'button5', spotlight: true, kind: 'Button', content: 'Hide My Ansestor',    ontap: 'hideAnsestor'   }
					]}
				]}
			]}
		]}
	],
	
	restore         : function() { location.reload(); },
	disableButton1  : function() { this.$.button1.setDisabled(true); },
	destroyButton2  : function() { this.$.button2.destroy(); },
	hideButton3     : function() { this.$.button3.hide(); },
	disableAnsestor : function() { this.$.c11.setDisabled(true); },
	destroyAnsestor : function() { this.$.c11.destroy(); },
	hideAnsestor    : function() { this.$.c11.hide(); },
	
	rendered: function() {
		this.inherited(arguments);
	}
});

// enyo.Spotlight.verbose();
