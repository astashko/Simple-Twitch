/**
Loads the cordova.js file for the current platform.
*/
//* @protected
(function(){
	if (enyo.platform.webos || window.PalmSystem) {
		var webOSjsVersion = window.webOSjsVersion || "0.1.0";
		var fn = "$lib/enyo-webos/assets/webOSjs-" + webOSjsVersion + "/webOS.js";
		enyo.load(fn);
		enyo.ready(function() {
			if(!window.cordova) {
				// if Cordova not used, add signal generation for the "menubutton" event used
				// in webOS.js for legacy webOS and Open webOS for the appmenu
				document.addEventListener("menubutton", enyo.bind(enyo.Signals, "send", "onmenubutton"), false);
			}
		});
	} else {
		enyo.warn("webOS.js not loaded: Current platform not supported.");
	}
})();
