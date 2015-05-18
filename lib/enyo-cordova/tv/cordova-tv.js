/**
	Loads the external Cordova TV modules for webOS TV platform.
*/
//* @protected
(function(){
	if(window.PalmSystem && (!enyo.platform.webos || enyo.platform.webos>3)) {
		enyo.load("$lib/enyo-cordova/tv/tv-module-loader.js");
	} else {
		enyo.warn("Platform does not support Cordova TV modules, skipping");
	}
})();
