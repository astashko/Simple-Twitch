enyo.kind({
	name: "enyo.cordova.sample.Events",
	classes: "onyx cordova-sample",
	kind:"enyo.Scroller",
	components: [
		{kind:"enyo.Signals", ondeviceready:"deviceready", onpause:"pause", onresume:"resume", ononline:"online", onoffline:"offline", onbackbutton:"backbutton", onbatterycritical:"batterycritical", onbatterylow:"batterylow", onbatterystatus:"batterystatus", onmenubutton:"menubutton", onsearchbutton:"searchbutton", onstartcallbutton:"startcallbutton", onendcallbutton:"endcallbutton", onvolumedownbutton:"volumedownbutton", onvolumeupbutton:"volumeupbutton", onlocalechange:"localechange"},
		{classes: "cordova-sample-divider", content: "Events API"},
		{kind: "onyx.Groupbox", classes:"cordova-sample-result-box", components: [
			{kind: "onyx.GroupboxHeader", content: "Events Supported by enyo.Signals"},
			{classes:"cordova-sample-result", components:[
				{name:"supported",  content:"deviceready, pause, resume, online, offline, backbutton, batterycritical, batterylow, batterystatus, menubutton, searchbutton, startcallbutton, endcallbutton, volumedownbutton, volumeupbutton"},
				{name:"disclaimer", content:"Note: battery, search, call, and volume events not supported current in webOS Cordova.", style:"font-size:0.65em;", showing:false}
			]} 
		]},
		{tag:"br"},
		{kind: "onyx.Groupbox", classes:"cordova-sample-result-box", components: [
			{kind: "onyx.GroupboxHeader", content: "Event Monitor"},
			{name:"result", classes:"cordova-sample-result", allowHtml:true, content:"Events API not supported on this platform."}
		]}
	],
	deviceready: function(inSender, inEvent) {
		if(enyo.platform.webos) {
			this.$.disclaimer.show();
			if(enyo.platform.webos>3) {
				this.$.supported.addContent(", localechange");
				this.$.disclaimer.setContent("Note: battery, menu, search, call, and volume events not supported current in webOS Cordova.");
			}
		}
		this.$.result.setContent("<i>deviceready</i> event occurred<br>");
	},
	pause: function(inSender, inEvent) {
		this.$.result.addContent("<i>pause</i> event occurred<br>");
	},
	resume: function(inSender, inEvent) {
		this.$.result.addContent("<i>resume</i> event occurred<br>");
	},
	online: function(inSender, inEvent) {
		this.$.result.addContent("<i>online</i> event occurred<br>");
	},
	offline: function(inSender, inEvent) {
		this.$.result.addContent("<i>offline</i> event occurred<br>");
	},
	backbutton: function(inSender, inEvent) {
		this.$.result.addContent("<i>backbutton</i> event occurred<br>");
	},
	batterycritical: function(inSender, inEvent) {
		this.$.result.addContent("<i>batterycritical</i> event occurred<br>");
	},
	batterylow: function(inSender, inEvent) {
		this.$.result.addContent("<i>batterylow</i> event occurred<br>");
	},
	menubutton: function(inSender, inEvent) {
		this.$.result.addContent("<i>menubutton</i> event occurred<br>");
	},
	searchbutton: function(inSender, inEvent) {
		this.$.result.addContent("<i>searchbutton</i> event occurred<br>");
	},
	startcallbutton: function(inSender, inEvent) {
		this.$.result.addContent("<i>startcallbutton</i> event occurred<br>");
	},
	endcallbutton: function(inSender, inEvent) {
		this.$.result.addContent("<i>endcallbutton</i> event occurred<br>");
	},
	volumedownbutton: function(inSender, inEvent) {
		this.$.result.addContent("<i>volumedownbutton</i> event occurred<br>");
	},
	volumeupbutton: function(inSender, inEvent) {
		this.$.result.addContent("<i>volumeupbutton</i> event occurred<br>");
	},
	localechange: function(inSender, inEvent) {
		this.$.result.addContent("<i>localechange</i> event occurred<br>");
	}
});