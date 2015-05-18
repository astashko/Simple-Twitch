/* global Connection: true */
enyo.kind({
	name: "enyo.cordova.sample.Connection",
	classes: "onyx cordova-sample",
	components: [
		{kind:"enyo.Signals", ondeviceready:"deviceready"},
		{classes: "cordova-sample-divider", content: "Connection API"},
		{kind: "onyx.Groupbox", classes:"cordova-sample-result-box", components: [
			{kind: "onyx.GroupboxHeader", content: "navigator.connection.type"},
			{name:"result", classes:"cordova-sample-result", allowHtml:true, content:"Connection API not supported on this platform."}
		]},
		{tag:"br"},
		{classes: "cordova-sample-divider", content: "Possible Values"},
		{classes: "cordova-sample-tools", components: [
			{tag:"ul", style:"font-size:0.8em", components:[
				{tag:"li", content:"Connection.UNKNOWN - Unknown connection"},
				{tag:"li", content:"Connection.ETHERNET - Ethernet connection"},
				{tag:"li", content:"Connection.WIFI - WiFi connection"},
				{tag:"li", content:"Connection.CELL_2G - Cell 2G connection"},
				{tag:"li", content:"Connection.CELL_3G - Cell 3G connection"},
				{tag:"li", content:"Connection.CELL_4G - Cell 4G connection"},
				{tag:"li", content:"Connection.CELL - Cell generic connection"},
				{tag:"li", content:"Connection.NONE - No network connection"}
			]}
		]}
	],
	deviceready: function(inSender, inEvent) {
		if(navigator.connection.type) {
			var type = navigator.connection.type;
			var states = {};
			states[Connection.UNKNOWN]  = "Connection.UNKNOWN";
			states[Connection.ETHERNET] = "Connection.ETHERNET";
			states[Connection.WIFI]     = "Connection.WIFI";
			states[Connection.CELL_2G]  = "Connection.CELL_2G";
			states[Connection.CELL_3G]  = "Connection.CELL_3G";
			states[Connection.CELL_4G]  = "Connection.CELL_4G";
			states[Connection.CELL]     = "Connection.CELL";
			states[Connection.NONE]     = "Connection.NONE";
			this.$.result.setContent(states[type]);
		}
	}
});