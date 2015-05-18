/**
Loads the cordova.js file for the current platform.
*/
//* @protected
(function(ctx){
	if(!ctx.cordova && !ctx.PhoneGap) {
		var cordovaVersion = ctx.useCordovaVersion || "2.7.0";
		var cordovaSupport = [
			{platform: "android"},
			{platform: "ios"},
			{platform: "webos"},
			{platform: "windowsPhone", version: 8, cordovaFilename: "wp8"},
			{platform: "windowsPhone", version: 7, cordovaFilename: "wp7"},
			{platform: "blackberry", version: 10, cordovaFilename: "blackberry10"},
			{platform: "blackberry"},
			{platform: "firefoxOS"},
			// TODO: Figure out how to detect desktop webapps vs in-browser
			//{platform: "ie", version: 10, cordovaFilename: "windows8"},
			//{platform: "safari", cordovaFilename: "osx"},
			{platform: "tizen"}
		];
		var platform;
		if (window.PalmSystem) {
			platform = "webos";
		} else {
			for (var i=0; i<cordovaSupport.length; i++) {
				var c = cordovaSupport[i];
				var p = enyo.platform[c.platform];
				if (p) {
					if (!c.version || p >= c.version) {
						platform = (c.cordovaFilename || c.platform);
						break;
					}
				}
			}
		}
		if (platform) {
			var fn = "$lib/enyo-cordova/assets/cordova-js-" + cordovaVersion + "/cordova." + platform + ".js";
			enyo.load(fn);
		} else {
			enyo.warn("Cordova not loaded: Current platform not supported.");
		}
	} else {
		enyo.warn("External cordova.js build in use, skipping script injection");
	}
})(window);
