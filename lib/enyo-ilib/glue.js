/*
 * glue.js - glue code to fit ilib into enyo
 * 
 * Copyright © 2013-2014 LG Electronics, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
	var enyoLoader = function() {
		this.base = enyo.path.rewrite("$lib/enyo-ilib/ilib/");
		if (enyo.platform.platformName === "webos") {
			this.webos = true;
		}
	};

	enyoLoader.prototype = new ilib.Loader();
	enyoLoader.prototype.constructor = enyoLoader;

	enyoLoader.prototype._createZoneFile = function (path) {
		var zone = path.substring(path.indexOf("zoneinfo"));
		
		// remove the .json suffix to get the name of the zone
		zone = zone.substring(0, zone.length-5);
		
		try {
			var zif = new ZoneInfoFile("/usr/share/" + zone);
			
			// only get the info for this year. Later we can get the info
			// for any historical or future year too
			return zif.getIlibZoneInfo(new Date().getFullYear());
		} catch (e) {
			// no file, so just return nothing
			return undefined;
		}
	};
	
	enyoLoader.prototype._pathjoin = function (root, subpath) {
		if (!root || !root.length) {
			return subpath;
		}
		if (!subpath || !subpath.length) {
			return root;
		}
		return root + (root.charAt(root.length-1) !== '/' ? '/' : "") + subpath;
	};
	
	/**
	 * Load the list of files asynchronously. This uses recursion in
	 * order to create a queue of files that will be loaded serially.
	 * Each layer, starting at the bottom, loads a file and then loads
	 * the layer on top of it. The very top file on the stack will have
	 * zero files to load, so instead it will be the one to call the
	 * callback to notify the caller that all the content is loaded.
	 *
	 * @param {Object} context function to call this method in the context of
	 * @param {Array.<string>} paths array of strings containing relative paths for required locale data files
	 * @param {Array} results empty array in which to place the resulting json when it is loaded from a file
	 * @param {Object} params An object full of parameters that the caller is passing to this function to help load the files
	 * @param {function(Array.<Object>)} callback callback to call when this function is finished attempting
	 * to load all the files that exist and can be loaded
	 */
	enyoLoader.prototype._loadFilesAsync = function (context, paths, results, params, callback) {
		var root = "resources";
		if (params && typeof(params.root) !== "undefined") {
			root = params.root;
		}
		if (paths.length > 0) {
			var path = paths.shift(),
				url = undefined;
			
			if (this.webos && path.indexOf("zoneinfo") !== -1) {
				results.push(this._createZoneFile(path));
			} else {
				if (this.isAvailable(root, path)) {
					url = this._pathjoin(root, path);
				} else if (this.isAvailable(this.base + "locale", path)) {
					url = this._pathjoin(this._pathjoin(this.base, "locale"), path)
				}

				var resultFunc = function(inSender, json) {
	                // console.log("enyo-ilib/glue: " + (!inSender.failed && json ? "success" : "failed"));
					results.push(!inSender.failed && (typeof(json) === 'object') ? json : undefined);
					if (paths.length > 0) {
						this._loadFilesAsync(context, paths, results, params, callback);
					} else {
						// only the bottom item on the stack will call
						// the callback
						callback.call(context, results);
					}
				};
				
				if (url) {
					var ajax = new enyo.Ajax({
						url: url, 
						cacheBust: false
					});
					// console.log("enyo-ilib/glue: browser/async: attempting to load " + url);
					ajax.response(this, resultFunc);
					ajax.error(this, resultFunc);
					ajax.go();
				} else {
					// nothing to load, so go to the next file
					resultFunc({}, undefined);
				}
			}
		}
	};

	enyoLoader.prototype.loadFiles = function(paths, sync, params, callback) {
		if (sync) {
			var ret = [];
			var root = "resources";
			var locdata = this._pathjoin(this.base, "locale");
			if (params && typeof(params.root) !== "undefined") {
				root = params.root;
			}
			// synchronous
			enyo.forEach(paths, function (path) {
				if (this.webos && path.indexOf("zoneinfo") !== -1) {
					ret.push(this._createZoneFile(path));
				} else {
					var found = false;
					
					var handler = function(inSender, json) {
	                    // console.log((!inSender.failed && json ? "success" : "failed"));
						if (!inSender.failed && typeof(json) === 'object') {
							ret.push(json);
							found = true;
						}
					};
					
					// console.log("browser/sync: attempting to load lib/enyo-ilib/ilib/locale/" + path);
					if (this.isAvailable(root, path)) {
						var ajax = new enyo.Ajax({
							url: this._pathjoin(root, path),
							sync: true, 
							cacheBust: false
						});
		
						ajax.response(this, handler);
						ajax.error(this, handler);
						ajax.go();
					}
					
					if (!found && this.isAvailable(locdata, path)) {
						var ajax = new enyo.Ajax({
							url: this._pathjoin(locdata, path),
							sync: true, 
							cacheBust: false
						});
		
						ajax.response(this, handler);
						ajax.error(this, handler);
						ajax.go();
					} 
					
					if (!found) {
						// not there, so fill in a blank entry in the array
						ret.push(undefined);
					}
				}
			}, this);

			if (typeof(callback) === 'function') {
				callback.call(this, ret);
			}
			return ret;
		}

		// asynchronous
		var results = [];
		this._loadFilesAsync(this, paths, results, params, callback);
	};

	enyoLoader.prototype._loadManifest = function (root, subpath) {
		if (!this.manifest) {
			this.manifest = {};
		}
		
		var dirpath = this._pathjoin(root, subpath);
		var filepath = this._pathjoin(dirpath, "ilibmanifest.json");

		// util.print("enyo loader: loading manifest " + filepath + "\n");
		var ajax = new enyo.Ajax({
			url: filepath,
			sync: true, 
			cacheBust: false,
			handleAs: "json"
		});

		var handler = function(inSender, json) {
            // console.log((!inSender.failed && json ? "success" : "failed"));
			// star indicates there was no ilibmanifest.json, so always try to load files from that dir
			this.manifest[dirpath] = (!inSender.failed && typeof(json) === 'object') ? json.files : "*";
		};
		
		ajax.response(this, handler);
		ajax.error(this, handler);
		ajax.go();
	},
	
	enyoLoader.prototype._loadStandardManifests = function() {
		// util.print("enyo loader: load manifests\n");
		if (!this.manifest) {
			this._loadManifest(this.base, "locale"); // standard ilib locale data
			this._loadManifest("", "resources");     // the app's resources dir
		}
	};
	enyoLoader.prototype.listAvailableFiles = function() {
		// util.print("enyo loader: list available files called\n");
		this._loadStandardManifests();
		return this.manifest;
	};
	enyoLoader.prototype.isAvailable = function(root, path) {
		this._loadStandardManifests();
		
		if (!this.manifest[root]) {
			// maybe it's a custom root? If so, try to load
			// the manifest file first in case it is there
			this._loadManifest(root, "");
		} 
		
		// util.print("enyo loader: isAvailable " + path + "? ");
		// star means attempt to load everything because there was no manifest in that dir
		if (this.manifest[root] === "*" || ilib.indexOf(this.manifest[root], path) !== -1) {
			// util.print("true\n");
			return true;
		}
		
		// util.print("false\n");
		return false;
	};

	ilib.setLoaderCallback(new enyoLoader());
	
	if (typeof(window.UILocale) !== 'undefined') {
		// this is a hack until GF-1581 is fixed
		ilib.setLocale(window.UILocale);
	}

	/*
	 * Tell whether or not the given locale is considered a non-Latin locale for webOS purposes. This controls
	 * which fonts are used in various places to show the various languages. An undefined spec parameter means
	 * to test the current locale. 
	 * 
	 * @param {ilib.Locale|string|undefined} spec locale specifier or locale object of the locale to test, or undefined
	 * to test the current locale
	 */
	enyo.isNonLatinLocale = function(spec) {
		var li = new ilib.LocaleInfo(spec),
			locale = li.getLocale();

        // We use the non-latin fonts for these languages (even though their scripts are technically considered latin)
        var nonLatinLanguageOverrides = ["bs", "cs", "hr", "hu", "lv", "lt", "pl", "ro", "sr", "sl", "tr", "vi"];
        // We use the latin fonts (with non-Latin fallback) for these languages (even though their scripts are non-latin)
        var latinLanguageOverrides = ["ko"];
		return ((li.getScript() !== "Latn" || enyo.indexOf(locale.getLanguage(), nonLatinLanguageOverrides) !== -1) &&
			(enyo.indexOf(locale.getLanguage(), latinLanguageOverrides) < 0));
	};
	
	// enyo.updateI18NClasses should be called after every setLocale, but there isn't such a callback in current version
    enyo.updateI18NClasses = function updateBodyClasses() {
        var li = new ilib.LocaleInfo(); // for the current locale
        var locale = li.getLocale();
		var base = "enyo-locale-";

        // Remove old style definitions (hack style becouse enyo.dom doesn't have methods like enyo.dom.getBodyClasses, enyo.dom.removeBodyClass)
        if (document && document.body && document.body.className && document.body.className) {
            document.body.className = document.body.className.replace(new RegExp('(^|\\s)'+ base +'[^\\s]*', 'g'), '');
        }

		if (enyo.isNonLatinLocale(locale)) {
			// allow enyo to define other fonts for non-Latin languages, or for certain
			// Latin-based languages where the characters with some accents don't appear in the
			// regular fonts, creating a strange "ransom note" look with a mix of fonts in the
			// same word. So, treat it like a non-Latin language in order to get all the characters
			// to display with the same font.
			enyo.dom.addBodyClass(base + "non-latin");
		}
		
		var scriptName = li.getScript();
		if (scriptName !== 'Latn' && scriptName !== 'Cyrl' && scriptName !== 'Grek') {
			// GF-45884: allow enyo to avoid setting italic fonts for those scripts that do not 
			// commonly use italics
			enyo.dom.addBodyClass(base + "non-italic");
		}

		// allow enyo to apply right-to-left styles to the app and widgets if necessary
		var script = new ilib.ScriptInfo(scriptName);
		if (script.getScriptDirection() === "rtl") {
			enyo.dom.addBodyClass(base + "right-to-left");
			if (enyo.Control) {
				enyo.Control.prototype.rtl = true;
			}
		}

		// allow enyo or the apps to give CSS classes that are specific to the language, country, or script
		if (locale.getLanguage()) {
			enyo.dom.addBodyClass(base + locale.getLanguage());
			if (locale.getScript()) {
				enyo.dom.addBodyClass(base + locale.getLanguage() + "-" + locale.getScript());
				if (locale.getRegion()) {
					enyo.dom.addBodyClass(base + locale.getLanguage() + "-" + locale.getScript() + "-" + locale.getRegion());
				}
			} else if (locale.getRegion()) {
				enyo.dom.addBodyClass(base + locale.getLanguage() + "-" + locale.getRegion());
			}
		}
		if (locale.getScript()) {
			enyo.dom.addBodyClass(base + locale.getScript());
		}
		if (locale.getRegion()) {
			enyo.dom.addBodyClass(base + locale.getRegion());
		}
		// Recreate the case mappers to use the just-recently-set locale
	 	enyo.setCaseMappers();
   };
})();

/*
 * Reset the $L function to use ilib instead of the dummy function that enyo
 * comes with by default.
 */
$L = function (string) {
	var str;
	if (!$L.rb) {
		$L.setLocale();
	}
	if (typeof(string) === 'string') {
		if (!$L.rb) {
			return string;
		}
		str = $L.rb.getString(string);
	} else if (typeof(string) === 'object') {
		if (typeof(string.key) !== 'undefined' && typeof(string.value) !== 'undefined') {
			if (!$L.rb) {
				return string.value;
			}
			str = $L.rb.getString(string.value, string.key);
		} else {
			str = "";
		}
	} else {
		str = string;
	}
	return str.toString();
};

/**
 * Set the locale for the strings that $L loads. This may reload the
 * string resources if necessary.
 * @param {string} spec the locale specifier
 */
$L.setLocale = function (spec) {
	var locale = new ilib.Locale(spec);
	if (!$L.rb || spec !== $L.rb.getLocale().getSpec()) {
		$L.rb = new ilib.ResBundle({
			locale: locale,
			type: "html",
			name: "strings",
			sync: true,
			lengthen: true		// if pseudo-localizing, this tells it to lengthen strings
		});
	}
};

/**
 * Set CaseMapper object references to ilib's current locale (its most recently set, by default)
 */
enyo.setCaseMappers = function() {
	enyo.toLowerCase.mapper = new ilib.CaseMapper({direction: "tolower"});
	enyo.toUpperCase.mapper = new ilib.CaseMapper({direction: "toupper"});
};

/**
 * Override Enyo's toLowerCase and toUpperCase methods with these fancy ones
 * that call iLib's locale-safe case mapper.
 */
enyo.toLowerCase = function(inString) {
	if ((inString === undefined) || (inString === null)) {
		return inString;
	}
	return enyo.toLowerCase.mapper.map(inString.toString());
};
enyo.toUpperCase = function(inString) {
	if ((inString === undefined) || (inString === null)) {
		return inString;
	}
	return enyo.toUpperCase.mapper.map(inString.toString());
};

/**
 * This Enyo hook lets us know that the system locale has changed and gives
 * us a chance to update the iLib locale before Enyo broadcasts its
 * `onlocalechange` signal.
 * Provide an inLocale string, like "en-US" or "ja-JP", to conveniently set
 * that locale immediately. Provide nothing, and reset the locale back to the
 * browser's default language.
 */
(function(originalUpdateLocale) {
	enyo.updateLocale = function(inLocale) {
		// blow away the cache to force it to reload the manifest files for the new app
		if (ilib._load) ilib._load.manifest = undefined; 
		ilib.setLocale(inLocale || navigator.language);
		$L.setLocale(inLocale || navigator.language);
		enyo.updateI18NClasses();
		originalUpdateLocale();
	};
})(enyo.updateLocale);

// we go ahead and run this once during loading of iLib settings are valid
// during the loads of later libraries.
enyo.updateLocale();
