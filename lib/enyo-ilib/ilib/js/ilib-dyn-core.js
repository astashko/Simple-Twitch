/*
 * ilibglobal.js - define the ilib name space
 * 
 * Copyright © 2012-2014, JEDLSoft
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

/**
 * @namespace The global namespace that contains all ilib functions and classes.
 */
var ilib = ilib || {};

/**
 * Return the current version of ilib.
 * 
 * @static
 * @return {string} a version string for this instance of ilib
 */
ilib.getVersion = function () {
    // increment this for each release
    return "6.1"
    ;
};

/**
 * Place where resources and such are eventually assigned.
 * @dict
 */
ilib.data = {
    norm: {
        nfc: {},
        nfd: {},
        nfkd: {},
        ccc: {}
    },
    zoneinfo: {
        "Etc/UTC":{"o":"0:0","f":"UTC"},
        "local":{"f":"local"}
    }
};

if (typeof(window) !== 'undefined') {
    window["ilib"] = ilib;
}

// export ilib for use as a module in nodejs
if (typeof(exports) !== 'undefined') {
    exports.ilib = ilib;
}

/**
 * Return the name of the platform
 * @private
 * @static
 * @return {string} string naming the platform
 */
ilib._getPlatform = function () {
    if (!ilib._platform) {
        if (typeof(environment) !== 'undefined') {
            ilib._platform = "rhino";
        } else if (typeof(process) !== 'undefined' || typeof(require) !== 'undefined') {
            ilib._platform = "nodejs";
        } else if (typeof(window) !== 'undefined') {
            ilib._platform = (typeof(PalmSystem) !== 'undefined') ? "webos" : "browser";
        } else {
            ilib._platform = "unknown";
        }
    }    
    return ilib._platform;
};

/**
 * Return true if the global variable is defined on this platform.
 * @private
 * @static
 * @return {boolean} true if the global variable is defined on this platform, false otherwise
 */
ilib._isGlobal = function(name) {
    switch (ilib._getPlatform()) {
        case "rhino":
            var top = (function() {
              return (typeof global === 'object') ? global : this;
            })();
            return typeof(top[name]) !== undefined;
        case "nodejs":
            var root = typeof(global) !== 'undefined' ? global : this;
            return root && typeof(root[name]) !== undefined;
            
        default:
            return typeof(window[name]) !== undefined;
    }
};

/**
 * Sets the default locale for all of ilib. This locale will be used
 * when no explicit locale is passed to any ilib class. If the default
 * locale is not set, ilib will attempt to use the locale of the
 * environment it is running in, if it can find that. If not, it will
 * default to the locale "en-US".<p>
 * 
 * Depends directive: !depends ilibglobal.js
 * 
 * @static
 * @param {string} spec the locale specifier for the default locale
 */
ilib.setLocale = function (spec) {
    if (typeof(spec) === 'string') {
        ilib.locale = spec;
    }
    // else ignore other data types, as we don't have the dependencies
    // to look into them to find a locale
};

/**
 * Return the default locale for all of ilib if one has been set. This 
 * locale will be used when no explicit locale is passed to any ilib 
 * class. If the default
 * locale is not set, ilib will attempt to use the locale of the
 * environment it is running in, if it can find that. If not, it will
 * default to the locale "en-US".<p>
 * 
 * Depends directive: !depends ilibglobal.js 
 * 
 * @static
 * @return {string} the locale specifier for the default locale
 */
ilib.getLocale = function () {
    if (typeof(ilib.locale) !== 'string') {
        if (typeof(navigator) !== 'undefined' && typeof(navigator.language) !== 'undefined') {
            // running in a browser
            ilib.locale = navigator.language;  // FF/Opera/Chrome/Webkit
            if (!ilib.locale) {
                // IE on Windows
                var lang = typeof(navigator.browserLanguage) !== 'undefined' ? 
                    navigator.browserLanguage : 
                    (typeof(navigator.userLanguage) !== 'undefined' ? 
                        navigator.userLanguage : 
                        (typeof(navigator.systemLanguage) !== 'undefined' ?
                            navigator.systemLanguage :
                            undefined));
                if (typeof(lang) !== 'undefined' && lang) {
                    // for some reason, MS uses lower case region tags
                    ilib.locale = lang.substring(0,3) + lang.substring(3,5).toUpperCase();
                }
            }
        } else if (typeof(PalmSystem) !== 'undefined' && typeof(PalmSystem.locales) !== 'undefined') {
            // webOS
            if (typeof(PalmSystem.locales.UI) != 'undefined' && PalmSystem.locales.UI.length > 0) {
                ilib.locale = PalmSystem.locales.UI;
            }
        } else if (typeof(environment) !== 'undefined' && typeof(environment.user) !== 'undefined') {
            // running under rhino
            if (typeof(environment.user.language) === 'string' && environment.user.language.length > 0) {
                ilib.locale = environment.user.language;
                if (typeof(environment.user.country) === 'string' && environment.user.country.length > 0) {
                    ilib.locale += '-' + environment.user.country;
                }
            }
        } else if (typeof(process) !== 'undefined' && typeof(process.env) !== 'undefined') {
            // running under nodejs
            var lang = process.env.LANG || process.env.LC_ALL;
            // the LANG variable on unix is in the form "lang_REGION.CHARSET"
            // where language and region are the correct ISO codes separated by
            // an underscore. This translate it back to the BCP-47 form.
            if (lang && lang !== 'undefined') {
                ilib.locale = lang.substring(0,2).toLowerCase() + '-' + lang.substring(3,5).toUpperCase();
            }
        }
             
        ilib.locale = typeof(ilib.locale) === 'string' ? ilib.locale : 'en-US';
    }
    return ilib.locale;
};

/**
 * Sets the default time zone for all of ilib. This time zone will be used when
 * no explicit time zone is passed to any ilib class. If the default time zone
 * is not set, ilib will attempt to use the time zone of the
 * environment it is running in, if it can find that. If not, it will
 * default to the the UTC zone "Etc/UTC".<p>
 * 
 * Depends directive: !depends ilibglobal.js
 * 
 * @static
 * @param {string} tz the name of the time zone to set as the default time zone
 */
ilib.setTimeZone = function (tz) {
    ilib.tz = tz || ilib.tz;
};

/**
 * Return the default time zone for all of ilib if one has been set. This 
 * time zone will be used when no explicit time zone is passed to any ilib 
 * class. If the default time zone
 * is not set, ilib will attempt to use the locale of the
 * environment it is running in, if it can find that. If not, it will
 * default to the the zone "local".<p>
 * 
 * Depends directive: !depends ilibglobal.js
 * 
 * @static
 * @return {string} the default time zone for ilib
 */
ilib.getTimeZone = function() {
    if (typeof(ilib.tz) === 'undefined') {
        if (typeof(navigator) !== 'undefined' && typeof(navigator.timezone) !== 'undefined') {
            // running in a browser
            if (navigator.timezone.length > 0) {
                ilib.tz = navigator.timezone;
            }
        } else if (typeof(PalmSystem) !== 'undefined' && typeof(PalmSystem.timezone) !== 'undefined') {
            // running in webkit on webOS
            if (PalmSystem.timezone.length > 0) {
                ilib.tz = PalmSystem.timezone;
            }
        } else if (typeof(environment) !== 'undefined' && typeof(environment.user) !== 'undefined') {
            // running under rhino
            if (typeof(environment.user.timezone) !== 'undefined' && environment.user.timezone.length > 0) {
                ilib.tz = environment.user.timezone;
            }
        } else if (typeof(process) !== 'undefined' && typeof(process.env) !== 'undefined') {
            // running in nodejs
            if (process.env.TZ && process.env.TZ !== "undefined") {
                ilib.tz = process.env.TZ;
            }
        }
        
        ilib.tz = ilib.tz || "local"; 
    }

    return ilib.tz;
};

/**
 * Defines the interface for the loader class for ilib. The main method of the
 * loader object is loadFiles(), which loads a set of requested locale data files
 * from where-ever it is stored.
 * @interface
 */
ilib.Loader = function() {};

/**
 * Load a set of files from where-ever it is stored.<p>
 * 
 * This is the main function define a callback function for loading missing locale 
 * data or resources.
 * If this copy of ilib is assembled without including the required locale data
 * or resources, then that data can be lazy loaded dynamically when it is 
 * needed by calling this method. Each ilib class will first
 * check for the existence of data under ilib.data, and if it is not there, 
 * it will attempt to load it by calling this method of the laoder, and then place
 * it there.<p>
 * 
 * Suggested implementations of this method might load files 
 * directly from disk under nodejs or rhino, or within web pages, to load 
 * files from the server with XHR calls.<p>
 * 
 * The first parameter to this method, paths, is an array of relative paths within 
 * the ilib dir structure for the 
 * requested data. These paths will already have the locale spec integrated 
 * into them, so no further tweaking needs to happen to load the data. Simply
 * load the named files. The second
 * parameter tells the loader whether to load the files synchronously or asynchronously.
 * If the sync parameters is false, then the onLoad function must also be specified.
 * The third parameter gives extra parameters to the loader passed from the calling
 * code. This may contain any property/value pairs.  The last parameter, callback,
 * is a callback function to call when all of the data is finishing loading. Make
 * sure to call the callback with the context of "this" so that the caller has their 
 * context back again.<p>
 * 
 * The loader function must be able to operate either synchronously or asychronously. 
 * If the loader function is called with an undefined callback function, it is
 * expected to load the data synchronously, convert it to javascript
 * objects, and return the array of json objects as the return value of the 
 * function. If the loader 
 * function is called with a callback function, it may load the data 
 * synchronously or asynchronously (doesn't matter which) as long as it calls
 * the callback function with the data converted to a javascript objects
 * when it becomes available. If a particular file could not be loaded, the 
 * loader function should put undefined into the corresponding entry in the
 * results array. 
 * Note that it is important that all the data is loaded before the callback
 * is called.<p>
 * 
 * An example implementation for nodejs might be:
 * 
 * <pre>
 * var fs = require("fs");
 * 
 * var myLoader = function() {};
 * myLoader.prototype = new ilib.Loader();
 * myLoader.prototype.constructor = myLoader;
 * myLoader.prototype.loadFiles = function(paths, sync, params, callback) {
 *    if (sync) {
 *        var ret = [];
 *        // synchronous load -- just return the result
 *        paths.forEach(function (path) {
 *            var json = fs.readFileSync(path, "utf-8");
 *            ret.push(json ? JSON.parse(json) : undefined);
 *        });
 *        
 *        return ret;
 *    }
 *    this.callback = callback;
 *
 *    // asynchronous
 *    this.results = [];
 *    this._loadFilesAsync(paths);
 * }
 * myLoader.prototype._loadFilesAsync = function (paths) {
 *    if (paths.length > 0) {
 *        var file = paths.shift();
 *        fs.readFile(file, "utf-8", function(err, json) {
 *            this.results.push(err ? undefined : JSON.parse(json));
 *            // call self recursively so that the callback is only called at the end
 *            // when all the files are loaded sequentially
 *            if (paths.length > 0) {
 *                this._loadFilesAsync(paths);
 *            } else {
 *                this.callback(this.results);
 *            }
 *        });
 *     }
 * }
 * 
 * // bind to "this" so that "this" is relative to your own instance
 * ilib.setLoaderCallback(new myLoader());
 * </pre>

 * @param {Array.<string>} paths An array of paths to load from wherever the files are stored 
 * @param {Boolean} sync if true, load the files synchronously, and false means asynchronously
 * @param {Object} params an object with any extra parameters for the loader. These can be 
 * anything. The caller of the ilib class passes these parameters in. Presumably, the code that
 * calls ilib and the code that provides the loader are together and can have a private 
 * agreement between them about what the parameters should contain.
 * @param {function(Object)} callback function to call when the files are all loaded. The 
 * parameter of the callback function is the contents of the files.
 */
ilib.Loader.prototype.loadFiles = function (paths, sync, params, callback) {};

/**
 * Return all files available for loading using this loader instance.
 * This method returns an object where the properties are the paths to
 * directories where files are loaded from and the values are an array
 * of strings containing the relative paths under the directory of each
 * file that can be loaded.<p>
 * 
 * Example:
 *  <pre>
 *  {
 *      "/usr/share/javascript/ilib/locale": [
 *          "dateformats.json",
 *          "aa/dateformats.json",
 *            "af/dateformats.json",
 *            "agq/dateformats.json",
 *            "ak/dateformats.json",
 *            ...
 *          "zxx/dateformats.json"
 *      ]
 *  }
 *  </pre>
 * @returns {Object} a hash containing directory names and
 * paths to file that can be loaded by this loader 
 */
ilib.Loader.prototype.listAvailableFiles = function() {};

/**
 * Return true if the file in the named path is available for loading using
 * this loader. The path may be given as an absolute path, in which case
 * only that file is checked, or as a relative path, in which case, the
 * relative path may appear underneath any of the directories that the loader
 * knows about.
 * @returns {boolean} true if the file in the named path is available for loading, and
 * false otherwise
 */
ilib.Loader.prototype.isAvailable = function(path) {};

/**
 * Set the custom loader used to load ilib's locale data in your environment. 
 * The instance passed in must implement the ilib.Loader interface. See the
 * ilib.Loader class documentation for more information about loaders. 
 * 
 * @static
 * @param {ilib.Loader} loader class to call to access the requested data.
 * @return {boolean} true if the loader was installed correctly, or false
 * if not
 */
ilib.setLoaderCallback = function(loader) {
    // only a basic check
    if ((typeof(loader) === 'object' && loader instanceof ilib.Loader) || 
            typeof(loader) === 'function' || typeof(loader) === 'undefined') {
        // console.log("setting callback loader to " + (loader ? loader.name : "undefined"));
        ilib._load = loader;
        return true;
    }
    return false;
};

/*
 * util/utils.js - Core utility routines
 * 
 * Copyright © 2012-2014, JEDLSoft
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

// !depends ilibglobal.js

/**
 * If Function.prototype.bind does not exist in this JS engine, this
 * function reimplements it in terms of older JS functions.
 * bind() doesn't exist in many older browsers.
 * 
 * @param {Object} scope object that the method should operate on
 * @param {function(...)} method method to call
 * @return {function(...)|undefined} function that calls the given method 
 * in the given scope with all of its arguments properly attached, or
 * undefined if there was a problem with the arguments
 */
ilib.bind = function(scope, method/*, bound arguments*/){
	if (!scope || !method) {
		return undefined;
	}
	
	/** @protected 
	 * @param {Arguments} inArrayLike
	 * @param {number=} inOffset
	 */
	function cloneArray(inArrayLike, inOffset) {
		var arr = [];
		for(var i = inOffset || 0, l = inArrayLike.length; i<l; i++){
			arr.push(inArrayLike[i]);
		}
		return arr;
	}

	if (typeof(method) === 'function') {
		var func, args = cloneArray(arguments, 2);
		if (typeof(method.bind) === 'function') {
			func = method.bind.apply(method, [scope].concat(args));
		} else {
			func = function() {
				var nargs = cloneArray(arguments);
				// invoke with collected args
				return method.apply(scope, args.concat(nargs));
			};
		}
		return func;
	}
	return undefined;
};

/**
 * Do a proper modulo function. The Javascript % operator will give the truncated
 * division algorithm, but for calendrical calculations, we need the Euclidean
 * division algorithm where the remainder of any division, whether the dividend
 * is negative or not, is always a positive number between 0 and the modulus.<p>
 * 
 * Depends directive: !depends utils.js
 * 
 * @param {number} dividend the number being divided
 * @param {number} modulus the number dividing the dividend. This should always be a positive number.
 * @return the remainder of dividing the dividend by the modulus.  
 */
ilib.mod = function (dividend, modulus) {
	if (modulus == 0) {
		return 0;
	}
	var x = dividend % modulus;
	return (x < 0) ? x + modulus : x;
};

/**
 * Merge the properties of object2 into object1 in a deep manner and return a merged
 * object. If the property exists in both objects, the value in object2 will overwrite 
 * the value in object1. If a property exists in object1, but not in object2, its value
 * will not be touched. If a property exists in object2, but not in object1, it will be 
 * added to the merged result.<p>
 * 
 * Name1 and name2 are for creating debug output only. They are not necessary.<p>
 * 
 * Depends directive: !depends utils.js
 * 
 * @param {*} object1 the object to merge into
 * @param {*} object2 the object to merge
 * @param {string=} name1 name of the object being merged into
 * @param {string=} name2 name of the object being merged in
 * @return {Object} the merged object
 */
ilib.merge = function (object1, object2, name1, name2) {
	var prop = undefined,
		newObj = {};
	for (prop in object1) {
		if (prop && typeof(object1[prop]) !== 'undefined') {
			newObj[prop] = object1[prop];
		}
	}
	for (prop in object2) {
		if (prop && typeof(object2[prop]) !== 'undefined') {
			if (object1[prop] instanceof Array && object2[prop] instanceof Array) {
				newObj[prop] = new Array();
				newObj[prop] = newObj[prop].concat(object1[prop]);
				newObj[prop] = newObj[prop].concat(object2[prop]);
			} else if (typeof(object1[prop]) === 'object' && typeof(object2[prop]) === 'object') {
				newObj[prop] = ilib.merge(object1[prop], object2[prop]);
			} else {
				// for debugging. Used to determine whether or not json files are overriding their parents unnecessarily
				if (name1 && name2 && newObj[prop] == object2[prop]) {
					console.log("Property " + prop + " in " + name1 + " is being overridden by the same value in " + name2);
				}
				newObj[prop] = object2[prop];
			}
		}
	}
	return newObj;
};

/**
 * Find and merge all the locale data for a particular prefix in the given locale
 * and return it as a single javascript object. This merges the data in the 
 * correct order:
 * 
 * <ol>
 * <li>shared data (usually English)
 * <li>data for language
 * <li>data for language + region
 * <li>data for language + region + script
 * <li>data for language + region + script + variant
 * </ol>
 * 
 * It is okay for any of the above to be missing. This function will just skip the 
 * missing data. However, if everything except the shared data is missing, this 
 * function returns undefined, allowing the caller to go and dynamically load the
 * data instead.
 *  
 * @param {string} prefix prefix under ilib.data of the data to merge
 * @param {ilib.Locale} locale locale of the data being sought
 * @return {Object?} the merged locale data
 */
ilib.mergeLocData = function (prefix, locale) {
	var data = undefined;
	var loc = locale || new ilib.Locale();
	var foundLocaleData = false;
	var property = prefix;
	data = ilib.data[prefix] || {};
	
	if (loc.getLanguage()) {
		property = prefix + '_' + loc.getLanguage();
		if (ilib.data[property]) {
			foundLocaleData = true;
			data = ilib.merge(data, ilib.data[property]);
		}
	}
	
	if (loc.getRegion()) {
		property = prefix + '_' + loc.getRegion();
		if (ilib.data[property]) {
			foundLocaleData = true;
			data = ilib.merge(data, ilib.data[property]);
		}
	}
	
	if (loc.getLanguage()) {
		property = prefix + '_' + loc.getLanguage();
		
		if (loc.getScript()) {
			property = prefix + '_' + loc.getLanguage() + '_' + loc.getScript();
			if (ilib.data[property]) {
				foundLocaleData = true;
				data = ilib.merge(data, ilib.data[property]);
			}
		}
		
		if (loc.getRegion()) {
			property = prefix + '_' + loc.getLanguage() + '_' + loc.getRegion();
			if (ilib.data[property]) {
				foundLocaleData = true;
				data = ilib.merge(data, ilib.data[property]);
			}
		}
		
	}
	
	if (loc.getRegion() && loc.getVariant()) {
		property = prefix + '_' + loc.getLanguage() + '_' + loc.getVariant();
		if (ilib.data[property]) {
			foundLocaleData = true;
			data = ilib.merge(data, ilib.data[property]);
		}
	}

	if (loc.getLanguage() && loc.getScript() && loc.getRegion()) {
		property = prefix + '_' + loc.getLanguage() + '_' + loc.getScript() + '_' + loc.getRegion();
		if (ilib.data[property]) {
			foundLocaleData = true;
			data = ilib.merge(data, ilib.data[property]);
		}
	}

	if (loc.getLanguage() && loc.getRegion() && loc.getVariant()) {
		property = prefix + '_' + loc.getLanguage() + '_' + loc.getRegion() + '_' + loc.getVariant();
		if (ilib.data[property]) {
			foundLocaleData = true;
			data = ilib.merge(data, ilib.data[property]);
		}
	}

	if (loc.getLanguage() && loc.getScript() && loc.getRegion() && loc.getVariant()) {
		property = prefix + '_' + loc.getLanguage() + '_' + loc.getScript() + '_' + loc.getRegion() + '_' + loc.getVariant();
		if (ilib.data[property]) {
			foundLocaleData = true;
			data = ilib.merge(data, ilib.data[property]);
		}
	}

	return foundLocaleData ? data : undefined;
};

/**
 * Return an array of relative path names for the
 * files that represent the data for the given locale.<p>
 * 
 * Note that to prevent the situation where a directory for
 * a language exists next to the directory for a region where
 * the language code and region code differ only by case, the 
 * plain region directories are located under the special 
 * "undefined" language directory which has the ISO code "und".
 * The reason is that some platforms have case-insensitive 
 * file systems, and you cannot have 2 directories with the 
 * same name which only differ by case. For example, "es" is
 * the ISO 639 code for the language "Spanish" and "ES" is
 * the ISO 3166 code for the region "Spain", so both the
 * directories cannot exist underneath "locale". The region
 * therefore will be loaded from "und/ES" instead.<p>  
 * 
 * <h4>Variations</h4>
 * 
 * With only language and region specified, the following
 * sequence of paths will be generated:<p>
 * 
 * <pre>
 * language
 * und/region
 * language/region
 * </pre>
 * 
 * With only language and script specified:<p>
 * 
 * <pre>
 * language
 * language/script
 * </pre>
 * 
 * With only script and region specified:<p>
 * 
 * <pre>
 * und/region  
 * </pre>
 * 
 * With only region and variant specified:<p>
 * 
 * <pre>
 * und/region
 * region/variant
 * </pre>
 * 
 * With only language, script, and region specified:<p>
 * 
 * <pre>
 * language
 * und/region
 * language/script
 * language/region
 * language/script/region
 * </pre>
 * 
 * With only language, region, and variant specified:<p>
 * 
 * <pre>
 * language
 * und/region
 * language/region
 * region/variant
 * language/region/variant
 * </pre>
 * 
 * With all parts specified:<p>
 * 
 * <pre>
 * language
 * und/region
 * language/script
 * language/region
 * region/variant
 * language/script/region
 * language/region/variant
 * language/script/region/variant
 * </pre>
 * 
 * @param {ilib.Locale} locale load the files for this locale
 * @param {string?} name the file name of each file to load without
 * any path
 * @return {Array.<string>} An array of relative path names
 * for the files that contain the locale data
 */
ilib.getLocFiles = function(locale, name) {
	var dir = "";
	var files = [];
	var filename = name || "resources.json";
	var loc = locale || new ilib.Locale();
	
	var language = loc.getLanguage();
	var region = loc.getRegion();
	var script = loc.getScript();
	var variant = loc.getVariant();
	
	files.push(filename); // generic shared file
	
	if (language) {
		dir = language + "/";
		files.push(dir + filename);
	}
	
	if (region) {
		dir = "und/" + region + "/";
		files.push(dir + filename);
	}
	
	if (language) {
		if (script) {
			dir = language + "/" + script + "/";
			files.push(dir + filename);
		}
		if (region) {
			dir = language + "/" + region + "/";
			files.push(dir + filename);
		}
	}
	
	if (region && variant) {
		dir = "und/" + region + "/" + variant + "/";
		files.push(dir + filename);
	}

	if (language && script && region) {
		dir = language + "/" + script + "/" + region + "/";
		files.push(dir + filename);
	}

	if (language && region && variant) {
		dir = language + "/" + region + "/" + variant + "/";
		files.push(dir + filename);
	}

	if (language && script && region && variant) {
		dir = language + "/" + script + "/" + region + "/" + variant + "/";
		files.push(dir + filename);
	}
	
	return files;
};

/**
 * Return true if the given object has no properties.<p>
 * 
 * Depends directive: !depends utils.js
 * 
 * @param {Object} obj the object to check
 * @return {boolean} true if the given object has no properties, false otherwise
 */
ilib.isEmpty = function (obj) {
	var prop = undefined;
	
	if (!obj) {
		return true;
	}
	
	for (prop in obj) {
		if (prop && typeof(obj[prop]) !== 'undefined') {
			return false;
		}
	}
	return true;
};


/**
 * @private
 */
ilib.hashCode = function(obj) {
	var hash = 0;
	
	function addHash(hash, newValue) {
		// co-prime numbers creates a nicely distributed hash
		hash *= 65543;
		hash += newValue;
		hash %= 2147483647; 
		return hash;
	}
	
	function stringHash(str) {
		var hash = 0;
		for (var i = 0; i < str.length; i++) {
			hash = addHash(hash, str.charCodeAt(i));
		}
		return hash;
	}
	
	switch (typeof(obj)) {
		case 'undefined':
			hash = 0;
			break;
		case 'string':
			hash = stringHash(obj);
			break;
		case 'function':
		case 'number':
		case 'xml':
			hash = stringHash(String(obj));
			break;
		case 'boolean':
			hash = obj ? 1 : 0;
			break;
		case 'object':
			var props = [];
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					props.push(p);
				}
			}
			// make sure the order of the properties doesn't matter
			props.sort();
			for (var i = 0; i < props.length; i++) {
				hash = addHash(hash, stringHash(props[i]));
				hash = addHash(hash, ilib.hashCode(obj[props[i]]));
			}
			break;
	}
	
	return hash;
};


/**
 * Load data using the new loader object or via the old function callback.
 * @private
 */
ilib._callLoadData = function (files, sync, params, callback) {
	// console.log("ilib._callLoadData called");
	if (typeof(ilib._load) === 'function') {
		// console.log("ilib._callLoadData: calling as a regular function");
		return ilib._load(files, sync, params, callback);
	} else if (typeof(ilib._load) === 'object' && ilib._load instanceof ilib.Loader) {
		// console.log("ilib._callLoadData: calling as an object");
		return ilib._load.loadFiles(files, sync, params, callback);
	}
	
	// console.log("ilib._callLoadData: not calling. Type is " + typeof(ilib._load) + " and instanceof says " + (ilib._load instanceof ilib.Loader));
	return undefined;
};

/**
 * Find locale data or load it in. If the data with the given name is preassembled, it will
 * find the data in ilib.data. If the data is not preassembled but there is a loader function,
 * this function will call it to load the data. Otherwise, the callback will be called with
 * undefined as the data. This function will create a cache under the given class object.
 * If data was successfully loaded, it will be set into the cache so that future access to 
 * the same data for the same locale is much quicker.<p>
 * 
 * The parameters can specify any of the following properties:<p>
 * 
 * <ul>
 * <li><i>name</i> - String. The name of the file being loaded. Default: resources.json
 * <li><i>object</i> - Object. The class attempting to load data. The cache is stored inside of here.
 * <li><i>locale</i> - ilib.Locale. The locale for which data is loaded. Default is the current locale.
 * <li><i>nonlocale</i> - boolean. If true, the data being loaded is not locale-specific.
 * <li><i>type</i> - String. Type of file to load. This can be "json" or "other" type. Default: "json" 
 * <li><i>loadParams</i> - Object. An object with parameters to pass to the loader function
 * <li><i>sync</i> - boolean. Whether or not to load the data synchronously
 * <li><i>callback</i> - function(?)=. callback Call back function to call when the data is available.
 * Data is not returned from this method, so a callback function is mandatory.
 * </ul>
 * 
 * @param {Object} params Parameters configuring how to load the files (see above)
 */
ilib.loadData = function(params) {
	var name = "resources.json",
		object = undefined, 
		locale = new ilib.Locale(ilib.getLocale()), 
		sync = false, 
		type = undefined,
		loadParams = {},
		callback = undefined,
		nonlocale = false;
	
	if (!params || typeof(params.callback) !== 'function') {
		return;
	}

	if (params.name) {
		name = params.name;
	}
	if (params.object) {
		object = params.object;
	}
	if (params.locale) {
		locale = (typeof(params.locale) === 'string') ? new ilib.Locale(params.locale) : params.locale;
	}			
	if (params.type) {
		type = params.type;
	}
	if (params.loadParams) {
		loadParams = params.loadParams;
	}
	if (params.sync) {
		sync = params.sync;
	}
	if (params.nonlocale) {
		nonlocale = !!params.nonlocale;
	}
	
	callback = params.callback;
	
	if (object && !object.cache) {
		object.cache = {};
	}
	
	if (!type) {
		var dot = name.lastIndexOf(".");
		type = (dot !== -1) ? name.substring(dot+1) : "text";
	}

	var spec = ((!nonlocale && locale.getSpec().replace(/-/g, '_')) || "root") + "," + name + "," + String(ilib.hashCode(loadParams));
	if (!object || typeof(object.cache[spec]) === 'undefined') {
		var data;
		
		if (type === "json") {
			// console.log("type is json");
			var basename = name.substring(0, name.lastIndexOf("."));
			if (nonlocale) {
				basename = name.replace(/\//g, '.').replace(/[\\\+\-]/g, "_");
				data = ilib.data[basename];
			} else {
				data = ilib.mergeLocData(basename, locale);
			}
			if (data) {
				// console.log("found assembled data");
				if (object) {
					object.cache[spec] = data;
				}
				callback(data);
				return;
			}
		}
		
		// console.log("ilib._load is " + typeof(ilib._load));
		if (typeof(ilib._load) !== 'undefined') {
			// the data is not preassembled, so attempt to load it dynamically
			var files = nonlocale ? [ name || "resources.json" ] : ilib.getLocFiles(locale, name);
			if (type !== "json") {
				loadParams.returnOne = true;
			}
			
			ilib._callLoadData(files, sync, loadParams, ilib.bind(this, function(arr) {
				if (type === "json") {
					data = ilib.data[basename] || {};
					for (var i = 0; i < arr.length; i++) {
						if (typeof(arr[i]) !== 'undefined') {
							data = ilib.merge(data, arr[i]);
						}
					}
					
					if (object) {
						object.cache[spec] = data;
					}
					callback(data);
				} else {
					var i = arr.length-1; 
					while (i > -1 && !arr[i]) {
						i--;
					}
					if (i > -1) {
						if (object) {
							object.cache[spec] = arr[i];
						}
						callback(arr[i]);
					} else {
						callback(undefined);
					}
				}
			}));
		} else {
			// no data other than the generic shared data
			if (object && data) {
				object.cache[spec] = data;
			}
			callback(data);
		}
	} else {
		callback(object.cache[spec]);
	}
};

/*
 * locale.js - Locale specifier definition
 * 
 * Copyright © 2012-2014, JEDLSoft
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

// !depends ilibglobal.js

/**
 * Create a new locale instance. Locales are specified either with a specifier string 
 * that follows the BCP-47 convention (roughly: "language-region-script-variant") or 
 * with 4 parameters that specify the language, region, variant, and script individually.<p>
 * 
 * The language is given as an ISO 639-1 two-letter, lower-case language code. You
 * can find a full list of these codes at 
 * <a href="http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes">http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes</a><p>
 * 
 * The region is given as an ISO 3166-1 two-letter, upper-case region code. You can
 * find a full list of these codes at 
 * <a href="http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2">http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2</a>.<p>
 * 
 * The variant is any string that does not contain a dash which further differentiates
 * locales from each other.<p>
 * 
 * The script is given as the ISO 15924 four-letter script code. In some locales,
 * text may be validly written in more than one script. For example, Serbian is often
 * written in both Latin and Cyrillic, though not usually mixed together. You can find a
 * full list of these codes at 
 * <a href="http://en.wikipedia.org/wiki/ISO_15924#List_of_codes">http://en.wikipedia.org/wiki/ISO_15924#List_of_codes</a>.<p>
 * 
 * As an example in ilib, the script can be used in the date formatter. Dates formatted 
 * in Serbian could have day-of-week names or month names written in the Latin
 * or Cyrillic script. Often one script is default such that sr-SR-Latn is the same
 * as sr-SR so the script code "Latn" can be left off of the locale spec.<p> 
 * 
 * Each part is optional, and an empty string in the specifier before or after a 
 * dash or as a parameter to the constructor denotes an unspecified value. In this
 * case, many of the ilib functions will treat the locale as generic. For example
 * the locale "en-" is equivalent to "en" and to "en--" and denotes a locale
 * of "English" with an unspecified region and variant, which typically matches
 * any region or variant.<p>
 * 
 * Without any arguments to the constructor, this function returns the locale of
 * the host Javascript engine.<p>
 * 
 * Depends directive: !depends locale.js
 * 
 * @class
 * @constructor
 * @param {?string|ilib.Locale=} language the ISO 639 2-letter code for the language, or a full 
 * locale spec in BCP-47 format, or another ilib.Locale instance to copy from
 * @param {string=} region the ISO 3166 2-letter code for the region
 * @param {string=} variant the name of the variant of this locale, if any
 * @param {string=} script the ISO 15924 code of the script for this locale, if any
 */
ilib.Locale = function(language, region, variant, script) {
	if (typeof(region) === 'undefined') {
		var spec = language || ilib.getLocale();
		if (typeof(spec) === 'string') {
			var parts = spec.split('-');
	        for ( var i = 0; i < parts.length; i++ ) {
	        	if (ilib.Locale._isLanguageCode(parts[i])) {
	    			/** 
	    			 * @private
	    			 * @type {string|undefined}
	    			 */
	        		this.language = parts[i];
	        	} else if (ilib.Locale._isRegionCode(parts[i])) {
	    			/** 
	    			 * @private
	    			 * @type {string|undefined}
	    			 */
	        		this.region = parts[i];
	        	} else if (ilib.Locale._isScriptCode(parts[i])) {
	    			/** 
	    			 * @private
	    			 * @type {string|undefined}
	    			 */
	        		this.script = parts[i];
	        	} else {
	    			/** 
	    			 * @private
	    			 * @type {string|undefined}
	    			 */
	        		this.variant = parts[i];
	        	}
	        }
	        this.language = this.language || undefined;
	        this.region = this.region || undefined;
	        this.script = this.script || undefined;
	        this.variant = this.variant || undefined;
		} else if (typeof(spec) === 'object') {
	        this.language = spec.language || undefined;
	        this.region = spec.region || undefined;
	        this.script = spec.script || undefined;
	        this.variant = spec.variant || undefined;
		}
	} else {
		if (language) {
			language = language.trim();
			this.language = language.length > 0 ? language.toLowerCase() : undefined;
		} else {
			this.language = undefined;
		}
		if (region) {
			region = region.trim();
			this.region = region.length > 0 ? region.toUpperCase() : undefined;
		} else {
			this.region = undefined;
		}
		if (variant) {
			variant = variant.trim();
			this.variant = variant.length > 0 ? variant : undefined;
		} else {
			this.variant = undefined;
		}
		if (script) {
			script = script.trim();
			this.script = script.length > 0 ? script : undefined;
		} else {
			this.script = undefined;
		}
	}
	this.spec = this.language || "";
	
	if (this.script) {
		if (this.spec.length > 0) {
			this.spec += "-";
		}
		this.spec += this.script;
	}
	
	if (this.region) {
		if (this.spec.length > 0) {
			this.spec += "-";
		}
		this.spec += this.region;
	}
	
	if (this.variant) {
		if (this.spec.length > 0) {
			this.spec += "-";
		}
		this.spec += this.variant;
	}
};

// from http://en.wikipedia.org/wiki/ISO_3166-1
ilib.Locale.a2toa3regmap = {
	"AF": "AFG",
	"AX": "ALA",
	"AL": "ALB",
	"DZ": "DZA",
	"AS": "ASM",
	"AD": "AND",
	"AO": "AGO",
	"AI": "AIA",
	"AQ": "ATA",
	"AG": "ATG",
	"AR": "ARG",
	"AM": "ARM",
	"AW": "ABW",
	"AU": "AUS",
	"AT": "AUT",
	"AZ": "AZE",
	"BS": "BHS",
	"BH": "BHR",
	"BD": "BGD",
	"BB": "BRB",
	"BY": "BLR",
	"BE": "BEL",
	"BZ": "BLZ",
	"BJ": "BEN",
	"BM": "BMU",
	"BT": "BTN",
	"BO": "BOL",
	"BQ": "BES",
	"BA": "BIH",
	"BW": "BWA",
	"BV": "BVT",
	"BR": "BRA",
	"IO": "IOT",
	"BN": "BRN",
	"BG": "BGR",
	"BF": "BFA",
	"BI": "BDI",
	"KH": "KHM",
	"CM": "CMR",
	"CA": "CAN",
	"CV": "CPV",
	"KY": "CYM",
	"CF": "CAF",
	"TD": "TCD",
	"CL": "CHL",
	"CN": "CHN",
	"CX": "CXR",
	"CC": "CCK",
	"CO": "COL",
	"KM": "COM",
	"CG": "COG",
	"CD": "COD",
	"CK": "COK",
	"CR": "CRI",
	"CI": "CIV",
	"HR": "HRV",
	"CU": "CUB",
	"CW": "CUW",
	"CY": "CYP",
	"CZ": "CZE",
	"DK": "DNK",
	"DJ": "DJI",
	"DM": "DMA",
	"DO": "DOM",
	"EC": "ECU",
	"EG": "EGY",
	"SV": "SLV",
	"GQ": "GNQ",
	"ER": "ERI",
	"EE": "EST",
	"ET": "ETH",
	"FK": "FLK",
	"FO": "FRO",
	"FJ": "FJI",
	"FI": "FIN",
	"FR": "FRA",
	"GF": "GUF",
	"PF": "PYF",
	"TF": "ATF",
	"GA": "GAB",
	"GM": "GMB",
	"GE": "GEO",
	"DE": "DEU",
	"GH": "GHA",
	"GI": "GIB",
	"GR": "GRC",
	"GL": "GRL",
	"GD": "GRD",
	"GP": "GLP",
	"GU": "GUM",
	"GT": "GTM",
	"GG": "GGY",
	"GN": "GIN",
	"GW": "GNB",
	"GY": "GUY",
	"HT": "HTI",
	"HM": "HMD",
	"VA": "VAT",
	"HN": "HND",
	"HK": "HKG",
	"HU": "HUN",
	"IS": "ISL",
	"IN": "IND",
	"ID": "IDN",
	"IR": "IRN",
	"IQ": "IRQ",
	"IE": "IRL",
	"IM": "IMN",
	"IL": "ISR",
	"IT": "ITA",
	"JM": "JAM",
	"JP": "JPN",
	"JE": "JEY",
	"JO": "JOR",
	"KZ": "KAZ",
	"KE": "KEN",
	"KI": "KIR",
	"KP": "PRK",
	"KR": "KOR",
	"KW": "KWT",
	"KG": "KGZ",
	"LA": "LAO",
	"LV": "LVA",
	"LB": "LBN",
	"LS": "LSO",
	"LR": "LBR",
	"LY": "LBY",
	"LI": "LIE",
	"LT": "LTU",
	"LU": "LUX",
	"MO": "MAC",
	"MK": "MKD",
	"MG": "MDG",
	"MW": "MWI",
	"MY": "MYS",
	"MV": "MDV",
	"ML": "MLI",
	"MT": "MLT",
	"MH": "MHL",
	"MQ": "MTQ",
	"MR": "MRT",
	"MU": "MUS",
	"YT": "MYT",
	"MX": "MEX",
	"FM": "FSM",
	"MD": "MDA",
	"MC": "MCO",
	"MN": "MNG",
	"ME": "MNE",
	"MS": "MSR",
	"MA": "MAR",
	"MZ": "MOZ",
	"MM": "MMR",
	"NA": "NAM",
	"NR": "NRU",
	"NP": "NPL",
	"NL": "NLD",
	"NC": "NCL",
	"NZ": "NZL",
	"NI": "NIC",
	"NE": "NER",
	"NG": "NGA",
	"NU": "NIU",
	"NF": "NFK",
	"MP": "MNP",
	"NO": "NOR",
	"OM": "OMN",
	"PK": "PAK",
	"PW": "PLW",
	"PS": "PSE",
	"PA": "PAN",
	"PG": "PNG",
	"PY": "PRY",
	"PE": "PER",
	"PH": "PHL",
	"PN": "PCN",
	"PL": "POL",
	"PT": "PRT",
	"PR": "PRI",
	"QA": "QAT",
	"RE": "REU",
	"RO": "ROU",
	"RU": "RUS",
	"RW": "RWA",
	"BL": "BLM",
	"SH": "SHN",
	"KN": "KNA",
	"LC": "LCA",
	"MF": "MAF",
	"PM": "SPM",
	"VC": "VCT",
	"WS": "WSM",
	"SM": "SMR",
	"ST": "STP",
	"SA": "SAU",
	"SN": "SEN",
	"RS": "SRB",
	"SC": "SYC",
	"SL": "SLE",
	"SG": "SGP",
	"SX": "SXM",
	"SK": "SVK",
	"SI": "SVN",
	"SB": "SLB",
	"SO": "SOM",
	"ZA": "ZAF",
	"GS": "SGS",
	"SS": "SSD",
	"ES": "ESP",
	"LK": "LKA",
	"SD": "SDN",
	"SR": "SUR",
	"SJ": "SJM",
	"SZ": "SWZ",
	"SE": "SWE",
	"CH": "CHE",
	"SY": "SYR",
	"TW": "TWN",
	"TJ": "TJK",
	"TZ": "TZA",
	"TH": "THA",
	"TL": "TLS",
	"TG": "TGO",
	"TK": "TKL",
	"TO": "TON",
	"TT": "TTO",
	"TN": "TUN",
	"TR": "TUR",
	"TM": "TKM",
	"TC": "TCA",
	"TV": "TUV",
	"UG": "UGA",
	"UA": "UKR",
	"AE": "ARE",
	"GB": "GBR",
	"US": "USA",
	"UM": "UMI",
	"UY": "URY",
	"UZ": "UZB",
	"VU": "VUT",
	"VE": "VEN",
	"VN": "VNM",
	"VG": "VGB",
	"VI": "VIR",
	"WF": "WLF",
	"EH": "ESH",
	"YE": "YEM",
	"ZM": "ZMB",
	"ZW": "ZWE"
};


ilib.Locale.a1toa3langmap = {
	"ab": "abk",
	"aa": "aar",
	"af": "afr",
	"ak": "aka",
	"sq": "sqi",
	"am": "amh",
	"ar": "ara",
	"an": "arg",
	"hy": "hye",
	"as": "asm",
	"av": "ava",
	"ae": "ave",
	"ay": "aym",
	"az": "aze",
	"bm": "bam",
	"ba": "bak",
	"eu": "eus",
	"be": "bel",
	"bn": "ben",
	"bh": "bih",
	"bi": "bis",
	"bs": "bos",
	"br": "bre",
	"bg": "bul",
	"my": "mya",
	"ca": "cat",
	"ch": "cha",
	"ce": "che",
	"ny": "nya",
	"zh": "zho",
	"cv": "chv",
	"kw": "cor",
	"co": "cos",
	"cr": "cre",
	"hr": "hrv",
	"cs": "ces",
	"da": "dan",
	"dv": "div",
	"nl": "nld",
	"dz": "dzo",
	"en": "eng",
	"eo": "epo",
	"et": "est",
	"ee": "ewe",
	"fo": "fao",
	"fj": "fij",
	"fi": "fin",
	"fr": "fra",
	"ff": "ful",
	"gl": "glg",
	"ka": "kat",
	"de": "deu",
	"el": "ell",
	"gn": "grn",
	"gu": "guj",
	"ht": "hat",
	"ha": "hau",
	"he": "heb",
	"hz": "her",
	"hi": "hin",
	"ho": "hmo",
	"hu": "hun",
	"ia": "ina",
	"id": "ind",
	"ie": "ile",
	"ga": "gle",
	"ig": "ibo",
	"ik": "ipk",
	"io": "ido",
	"is": "isl",
	"it": "ita",
	"iu": "iku",
	"ja": "jpn",
	"jv": "jav",
	"kl": "kal",
	"kn": "kan",
	"kr": "kau",
	"ks": "kas",
	"kk": "kaz",
	"km": "khm",
	"ki": "kik",
	"rw": "kin",
	"ky": "kir",
	"kv": "kom",
	"kg": "kon",
	"ko": "kor",
	"ku": "kur",
	"kj": "kua",
	"la": "lat",
	"lb": "ltz",
	"lg": "lug",
	"li": "lim",
	"ln": "lin",
	"lo": "lao",
	"lt": "lit",
	"lu": "lub",
	"lv": "lav",
	"gv": "glv",
	"mk": "mkd",
	"mg": "mlg",
	"ms": "msa",
	"ml": "mal",
	"mt": "mlt",
	"mi": "mri",
	"mr": "mar",
	"mh": "mah",
	"mn": "mon",
	"na": "nau",
	"nv": "nav",
	"nb": "nob",
	"nd": "nde",
	"ne": "nep",
	"ng": "ndo",
	"nn": "nno",
	"no": "nor",
	"ii": "iii",
	"nr": "nbl",
	"oc": "oci",
	"oj": "oji",
	"cu": "chu",
	"om": "orm",
	"or": "ori",
	"os": "oss",
	"pa": "pan",
	"pi": "pli",
	"fa": "fas",
	"pl": "pol",
	"ps": "pus",
	"pt": "por",
	"qu": "que",
	"rm": "roh",
	"rn": "run",
	"ro": "ron",
	"ru": "rus",
	"sa": "san",
	"sc": "srd",
	"sd": "snd",
	"se": "sme",
	"sm": "smo",
	"sg": "sag",
	"sr": "srp",
	"gd": "gla",
	"sn": "sna",
	"si": "sin",
	"sk": "slk",
	"sl": "slv",
	"so": "som",
	"st": "sot",
	"az": "azb",
	"es": "spa",
	"su": "sun",
	"sw": "swa",
	"ss": "ssw",
	"sv": "swe",
	"ta": "tam",
	"te": "tel",
	"tg": "tgk",
	"th": "tha",
	"ti": "tir",
	"bo": "bod",
	"tk": "tuk",
	"tl": "tgl",
	"tn": "tsn",
	"to": "ton",
	"tr": "tur",
	"ts": "tso",
	"tt": "tat",
	"tw": "twi",
	"ty": "tah",
	"ug": "uig",
	"uk": "ukr",
	"ur": "urd",
	"uz": "uzb",
	"ve": "ven",
	"vi": "vie",
	"vo": "vol",
	"wa": "wln",
	"cy": "cym",
	"wo": "wol",
	"fy": "fry",
	"xh": "xho",
	"yi": "yid",
	"yo": "yor",
	"za": "zha",
	"zu": "zul"
};

/**
 * Tell whether or not the str does not start with a lower case ASCII char.
 * @private
 * @param {string} str the char to check
 * @return {boolean} true if the char is not a lower case ASCII char
 */
ilib.Locale._notLower = function(str) {
	// do this with ASCII only so we don't have to depend on the CType functions
	var ch = str.charCodeAt(0);
	return ch < 97 || ch > 122;
};

/**
 * Tell whether or not the str does not start with an upper case ASCII char.
 * @private
 * @param {string} str the char to check
 * @return {boolean} true if the char is a not an upper case ASCII char
 */
ilib.Locale._notUpper = function(str) {
	// do this with ASCII only so we don't have to depend on the CType functions
	var ch = str.charCodeAt(0);
	return ch < 65 || ch > 90;
};

/**
 * Tell whether or not the str does not start with a digit char.
 * @private
 * @param {string} str the char to check
 * @return {boolean} true if the char is a not an upper case ASCII char
 */
ilib.Locale._notDigit = function(str) {
	// do this with ASCII only so we don't have to depend on the CType functions
	var ch = str.charCodeAt(0);
	return ch < 48 || ch > 57;
};

/**
 * Tell whether or not the given string has the correct syntax to be 
 * an ISO 639 language code.
 * 
 * @private
 * @param {string} str the string to parse
 * @return {boolean} true if the string could syntactically be a language code.
 */
ilib.Locale._isLanguageCode = function(str) {
	if (typeof(str) === 'undefined' || str.length < 2 || str.length > 3) {
		return false;
	}

	for (var i = 0; i < str.length; i++) {
		if (ilib.Locale._notLower(str.charAt(i))) {
			return false;
		}
	}
	
	return true;
};

/**
 * Tell whether or not the given string has the correct syntax to be 
 * an ISO 3166 2-letter region code or M.49 3-digit region code.
 * 
 * @private
 * @param {string} str the string to parse
 * @return {boolean} true if the string could syntactically be a language code.
 */
ilib.Locale._isRegionCode = function (str) {
	if (typeof(str) === 'undefined' || str.length < 2 || str.length > 3) {
		return false;
	}
	
	if (str.length === 2) {
		for (var i = 0; i < str.length; i++) {
			if (ilib.Locale._notUpper(str.charAt(i))) {
				return false;
			}
		}
	} else {
		for (var i = 0; i < str.length; i++) {
			if (ilib.Locale._notDigit(str.charAt(i))) {
				return false;
			}
		}
	}
	
	return true;
};

/**
 * Tell whether or not the given string has the correct syntax to be 
 * an ISO 639 language code.
 * 
 * @private
 * @param {string} str the string to parse
 * @return {boolean} true if the string could syntactically be a language code.
 */
ilib.Locale._isScriptCode = function(str)
{
	if (typeof(str) === 'undefined' || str.length !== 4 || ilib.Locale._notUpper(str.charAt(0))) {
		return false;
	}
	
	for (var i = 1; i < 4; i++) {
		if (ilib.Locale._notLower(str.charAt(i))) {
			return false;
		}
	}
	
	return true;
};

/**
 * Return the ISO-3166 alpha3 equivalent region code for the given ISO 3166 alpha2
 * region code. If the given alpha2 code is not found, this function returns its
 * argument unchanged.
 * @static
 * @param {string|undefined} alpha2 the alpha2 code to map
 * @return {string|undefined} the alpha3 equivalent of the given alpha2 code, or the alpha2
 * parameter if the alpha2 value is not found
 */
ilib.Locale.regionAlpha2ToAlpha3 = function(alpha2) {
	return ilib.Locale.a2toa3regmap[alpha2] || alpha2;
};

/**
 * Return the ISO-639 alpha3 equivalent language code for the given ISO 639 alpha1
 * language code. If the given alpha1 code is not found, this function returns its
 * argument unchanged.
 * @static
 * @param {string|undefined} alpha1 the alpha1 code to map
 * @return {string|undefined} the alpha3 equivalent of the given alpha1 code, or the alpha1
 * parameter if the alpha1 value is not found
 */
ilib.Locale.languageAlpha1ToAlpha3 = function(alpha1) {
	return ilib.Locale.a1toa3langmap[alpha1] || alpha1;
};

ilib.Locale.prototype = {
	/**
	 * Return the ISO 639 language code for this locale. 
	 * @return {string|undefined} the language code for this locale 
	 */
	getLanguage: function() {
		return this.language;
	},
	
	/**
	 * Return the language of this locale as an ISO-639-alpha3 language code
	 * @return {string|undefined} the alpha3 language code of this locale
	 */
	getLanguageAlpha3: function() {
		return ilib.Locale.languageAlpha1ToAlpha3(this.language);
	},
	
	/**
	 * Return the ISO 3166 region code for this locale.
	 * @return {string|undefined} the region code of this locale
	 */
	getRegion: function() {
		return this.region;
	},
	
	/**
	 * Return the region of this locale as an ISO-3166-alpha3 region code
	 * @return {string|undefined} the alpha3 region code of this locale
	 */
	getRegionAlpha3: function() {
		return ilib.Locale.regionAlpha2ToAlpha3(this.region);
	},
	
	/**
	 * Return the ISO 15924 script code for this locale
	 * @return {string|undefined} the script code of this locale
	 */
	getScript: function () {
		return this.script;
	},
	
	/**
	 * Return the variant code for this locale
	 * @return {string|undefined} the variant code of this locale, if any
	 */
	getVariant: function() {
		return this.variant;
	},
	
	/**
	 * Return the whole locale specifier as a string.
	 * @return {string} the locale specifier
	 */
	getSpec: function() {
		return this.spec;
	},
	
	/**
	 * Express this locale object as a string. Currently, this simply calls the getSpec
	 * function to represent the locale as its specifier.
	 * 
	 * @return {string} the locale specifier
	 */
	toString: function() {
		return this.getSpec();
	},
	
	/**
	 * Return true if the the other locale is exactly equal to the current one.
	 * @return {boolean} whether or not the other locale is equal to the current one 
	 */
	equals: function(other) {
		return this.language === other.language &&
			this.region === other.region &&
			this.script === other.script &&
			this.variant === other.variant;
	},

	/**
	 * Return true if the current locale is the special pseudo locale.
	 * @return {boolean} true if the current locale is the special pseudo locale
	 */
	isPseudo: function () {
		return (this.language === 'zxx' && this.region === 'XX');
	}
};

// static functions
/**
 * @private
 */
ilib.Locale.locales = [
	
];

/**
 * Return the list of available locales that this iLib file was assembled
 * with. The list that this file was assembled with may be much smaller
 * than the list of all available locales in the iLib repository. The
 * assembly tool will automatically fill in the list.
 * 
 * @return {Array.<string>} this is an array of locale specs for which 
 * this iLib file has locale data for
 */
ilib.Locale.getAvailableLocales = function () {
	return ilib.Locale.locales;
};
/*
 * strings.js - ilib string subclass definition
 * 
 * Copyright © 2012-2014, JEDLSoft
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

// !depends ilibglobal.js util/utils.js locale.js

// !data plurals

/**
 * Create a new string instance. This string inherits from the Javascript
 * String class, and adds two more methods, fmt and fmtChoice. It can be
 * used anywhere that a normal Javascript string is used. The formatting
 * methods are of course most useful when localizing strings in an app
 * or web site in combination with the ilib.ResBundle class.<p>
 * 
 * Depends directive: !depends strings.js
 * 
 * @class
 * @constructor
 * @param {string|ilib.String=} string initialize this instance with this string 
 */
ilib.String = function (string) {
	if (typeof(string) === 'object') {
		this.str = string.str;
	} else if (typeof(string) === 'string') {
		this.str = new String(string);
	} else {
		this.str = "";
	}
	this.length = this.str.length;
	this.cpLength = -1;
	this.localeSpec = ilib.getLocale();
};

/**
 * Return true if the given character is a Unicode surrogate character,
 * either high or low.
 * 
 * @private
 * @static
 * @param {string} ch character to check
 * @return {boolean} true if the character is a surrogate
 */
ilib.String._isSurrogate = function (ch) {
	var n = ch.charCodeAt(0);
	return ((n >= 0xDC00 && n <= 0xDFFF) || (n >= 0xD800 && n <= 0xDBFF));
};

/**
 * Convert a UCS-4 code point to a Javascript string. The codepoint can be any valid 
 * UCS-4 Unicode character, including supplementary characters. Standard Javascript
 * only supports supplementary characters using the UTF-16 encoding, which has 
 * values in the range 0x0000-0xFFFF. String.fromCharCode() will only
 * give you a string containing 16-bit characters, and will not properly convert 
 * the code point for a supplementary character (which has a value > 0xFFFF) into 
 * two UTF-16 surrogate characters. Instead, it will just just give you whatever
 * single character happens to be the same as your code point modulo 0x10000, which
 * is almost never what you want.<p> 
 * 
 * Similarly, that means if you use String.charCodeAt()
 * you will only retrieve a 16-bit value, which may possibly be a single
 * surrogate character that is part of a surrogate pair representing a character
 * in the supplementary plane. It will not give you a code point. Use 
 * ilib.String.codePointAt() to access code points in a string, or use 
 * an iterator to walk through the code points in a string. 
 * 
 * @static
 * @param {number} codepoint UCS-4 code point to convert to a character
 * @return {string} a string containing the character represented by the codepoint
 */
ilib.String.fromCodePoint = function (codepoint) {
	if (codepoint < 0x10000) {
		return String.fromCharCode(codepoint);
	} else {
		var high = Math.floor(codepoint / 0x10000) - 1;
		var low = codepoint & 0xFFFF;
		
		return String.fromCharCode(0xD800 | ((high & 0x000F) << 6) |  ((low & 0xFC00) >> 10)) +
			String.fromCharCode(0xDC00 | (low & 0x3FF));
	}
};

/**
 * Load the plural the definitions of plurals for the locale.
 * @param {ilib.Locale|string} locale
 * @param {boolean} sync
 * @param {Object} loadParams
 * @param {function(*)|undefined} onLoad
 */
ilib.String.loadPlurals = function (sync, locale, loadParams, onLoad) {
	var loc;
	if (locale) {
		loc = (typeof(locale) === 'string') ? new ilib.Locale(locale) : locale;
	} else {
		loc = new ilib.Locale(ilib.getLocale());
	}
	var spec = loc.getLanguage();
	if (!ilib.data["plurals_" + spec]) {
		ilib.loadData({
			name: "plurals.json",
			object: ilib.String,
			locale: loc,
			sync: sync,
			loadParams: loadParams,
			callback: /** @type function(Object=):undefined */ ilib.bind(this, /** @type function() */ function(plurals) {
				if (!plurals) {
					ilib.String.cache[spec] = {};
				}
				ilib.data["plurals_" + spec] = plurals || {};
				if (onLoad && typeof(onLoad) === 'function') {
					onLoad(ilib.data["plurals_" + spec]);
				}
			})
		});
	} else {
		if (onLoad && typeof(onLoad) === 'function') {
			onLoad(ilib.data["plurals_" + spec]);
		}
	}
};

/**
 * @private
 * @static
 */
ilib.String._fncs = {
	/**
	 * @private
	 * @param {Object} obj
	 * @return {string|undefined}
	 */
	firstProp: function (obj) {
		for (var p in obj) {
			if (p && obj[p]) {
				return p;
			}
		}
		return undefined; // should never get here
	},
	
	/**
	 * @private
	 * @param {Object} obj
	 * @param {number} n
	 * @return {?}
	 */
	getValue: function (obj, n) {
		if (typeof(obj) === 'object') {
			var subrule = ilib.String._fncs.firstProp(obj);
			return ilib.String._fncs[subrule](obj[subrule], n);
		} else if (typeof(obj) === 'string') {
			return n;
		} else {
			return obj;
		}
	},
	
	/**
	 * @private
	 * @param {number} n
	 * @param {Array.<number|Array.<number>>} range
	 * @return {boolean}
	 */
	matchRangeContinuous: function(n, range) {
		for (var num in range) {
			if (typeof(num) !== 'undefined' && typeof(range[num]) !== 'undefined') {
				var obj = /** @type {Object|null|undefined} */ range[num];
				if (typeof(obj) === 'number') {
					if (n === range[num]) {
						return true;
					}
				} else if (Object.prototype.toString.call(obj) === '[object Array]') {
					if (n >= obj[0] && n <= obj[1]) {
						return true;
					}
				}
			}
		}
		return false;
	},

	/**
	 * @private
	 * @param {number} n
	 * @param {Array.<number|Array.<number>>} range
	 * @return {boolean}
	 */
	matchRange: function(n, range) {
		if (Math.floor(n) !== n) {
			return false;
		}
		return ilib.String._fncs.matchRangeContinuous(n, range);
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {boolean}
	 */
	is: function(rule, n) {
		var left = ilib.String._fncs.getValue(rule[0], n);
		var right = ilib.String._fncs.getValue(rule[1], n);
		return left == right;
		// return ilib.String._fncs.getValue(rule[0]) == ilib.String._fncs.getValue(rule[1]);
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {boolean}
	 */
	isnot: function(rule, n) {
		return ilib.String._fncs.getValue(rule[0], n) != ilib.String._fncs.getValue(rule[1], n);
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {boolean}
	 */
	inrange: function(rule, n) {
		return ilib.String._fncs.matchRange(ilib.String._fncs.getValue(rule[0], n), rule[1]);
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {boolean}
	 */
	notin: function(rule, n) {
		return !ilib.String._fncs.matchRange(ilib.String._fncs.getValue(rule[0], n), rule[1]);
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {boolean}
	 */
	within: function(rule, n) {
		return ilib.String._fncs.matchRangeContinuous(ilib.String._fncs.getValue(rule[0], n), rule[1]);		
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {number}
	 */
	mod: function(rule, n) {
		return ilib.mod(ilib.String._fncs.getValue(rule[0], n), ilib.String._fncs.getValue(rule[1], n));
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {number}
	 */
	n: function(rule, n) {
		return n;
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {boolean}
	 */
	or: function(rule, n) {
		return ilib.String._fncs.getValue(rule[0], n) || ilib.String._fncs.getValue(rule[1], n);
	},
	
	/**
	 * @private
	 * @param {Object} rule
	 * @param {number} n
	 * @return {boolean}
	 */
	and: function(rule, n) {
		return ilib.String._fncs.getValue(rule[0], n) && ilib.String._fncs.getValue(rule[1], n);
	}
};

ilib.String.prototype = {
	/**
	 * Return the length of this string in characters. This function defers to the regular
	 * Javascript string class in order to perform the length function. Please note that this
	 * method is a real method, whereas the length property of Javascript strings is 
	 * implemented by native code and appears as a property.<p>
	 * 
	 * Example:
	 * 
	 * <pre>
	 * var str = new ilib.String("this is a string");
	 * console.log("String is " + str._length() + " characters long.");
	 * </pre>
	 * @private
	 */
	_length: function () {
		return this.str.length;
	},
	
	/**
	 * Format this string instance as a message, replacing the parameters with 
	 * the given values.<p>
	 * 
	 * The string can contain any text that a regular Javascript string can
	 * contain. Replacement parameters have the syntax:
	 * 
	 * <pre>
	 * {name}
	 * </pre>
	 * 
	 * Where "name" can be any string surrounded by curly brackets. The value of 
	 * "name" is taken from the parameters argument.<p>
	 * 
	 * Example:
	 * 
	 * <pre>
	 * var str = new ilib.String("There are {num} objects.");
	 * console.log(str.format({
	 *   num: 12
	 * });
	 * </pre>
	 * 
	 * Would give the output:
	 * 
	 * <pre>
	 * There are 12 objects.
	 * </pre>
	 * 
	 * If a property is missing from the parameter block, the replacement
	 * parameter substring is left untouched in the string, and a different
	 * set of parameters may be applied a second time. This way, different
	 * parts of the code may format different parts of the message that they
	 * happen to know about.<p>
	 * 
	 * Example:
	 * 
	 * <pre>
	 * var str = new ilib.String("There are {num} objects in the {container}.");
	 * console.log(str.format({
	 *   num: 12
	 * });
	 * </pre>
	 * 
	 * Would give the output:<p>
	 * 
	 * <pre>
	 * There are 12 objects in the {container}.
	 * </pre>
	 * 
	 * The result can then be formatted again with a different parameter block that
	 * specifies a value for the container property.
	 * 
	 * @param params a Javascript object containing values for the replacement 
	 * parameters in the current string
	 * @return a new ilib.String instance with as many replacement parameters filled
	 * out as possible with real values.
	 */
	format: function (params) {
		var formatted = this.str;
		if (params) {
			var regex;
			for (var p in params) {
				if (typeof(params[p]) !== 'undefined') {
					regex = new RegExp("\{"+p+"\}", "g");
					formatted = formatted.replace(regex, params[p]);
				}
			}
		}
		return formatted.toString();
	},
	
	/**
	 * Format a string as one of a choice of strings dependent on the value of
	 * a particular argument index.<p>
	 * 
	 * The syntax of the choice string is as follows. The string contains a
	 * series of choices separated by a vertical bar character "|". Each choice
	 * has a value or range of values to match followed by a hash character "#"
	 * followed by the string to use if the variable matches the criteria.<p>
	 * 
	 * Example string:
	 * 
	 * <pre>
	 * var num = 2;
	 * var str = new ilib.String("0#There are no objects.|1#There is one object.|2#There are {number} objects.");
	 * console.log(str.formatChoice(num, {
	 *   number: num
	 * }));
	 * </pre>
	 * 
	 * Gives the output:
	 * 
	 * <pre>
	 * "There are 2 objects."
	 * </pre>
	 * 
	 * The strings to format may contain replacement variables that will be formatted
	 * using the format() method above and the params argument as a source of values
	 * to use while formatting those variables.<p>
	 * 
	 * If the criterion for a particular choice is empty, that choice will be used
	 * as the default one for use when none of the other choice's criteria match.<p>
	 * 
	 * Example string:
	 * 
	 * <pre>
	 * var num = 22;
	 * var str = new ilib.String("0#There are no objects.|1#There is one object.|#There are {number} objects.");
	 * console.log(str.formatChoice(num, {
	 *   number: num
	 * }));
	 * </pre>
	 * 
	 * Gives the output:
	 * 
	 * <pre>
	 * "There are 22 objects."
	 * </pre>
	 * 
	 * If multiple choice patterns can match a given argument index, the first one 
	 * encountered in the string will be used. If no choice patterns match the 
	 * argument index, then the default choice will be used. If there is no default
	 * choice defined, then this method will return an empty string.<p>
	 * 
	 * <b>Special Syntax</b><p>
	 * 
	 * For any choice format string, all of the patterns in the string should be
	 * of a single type: numeric, boolean, or string/regexp. The type of the 
	 * patterns is determined by the type of the argument index parameter.<p>
	 * 
	 * If the argument index is numeric, then some special syntax can be used 
	 * in the patterns to match numeric ranges.<p>
	 * 
	 * <ul>
	 * <li><i>&gt;x</i> - match any number that is greater than x 
	 * <li><i>&gt;=x</i> - match any number that is greater than or equal to x
	 * <li><i>&lt;x</i> - match any number that is less than x
	 * <li><i>&lt;=x</i> - match any number that is less than or equal to x
	 * <li><i>start-end</i> - match any number in the range [start,end)
	 * <li><i>zero</i> - match any number in the class "zero". (See below for
	 * a description of number classes.)
	 * <li><i>one</i> - match any number in the class "one"
	 * <li><i>two</i> - match any number in the class "two"
	 * <li><i>few</i> - match any number in the class "few"
	 * <li><i>many</i> - match any number in the class "many"
	 * </ul>
	 * 
	 * A number class defines a set of numbers that receive a particular syntax
	 * in the strings. For example, in Slovenian, integers ending in the digit
	 * "1" are in the "one" class, including 1, 21, 31, ... 101, 111, etc.
	 * Similarly, integers ending in the digit "2" are in the "two" class. 
	 * Integers ending in the digits "3" or "4" are in the "few" class, and
	 * every other integer is handled by the default string.<p>
	 * 
	 * The definition of what numbers are included in a class is locale-dependent.
	 * They are defined in the data file plurals.json. If your string is in a
	 * different locale than the default for ilib, you should call the setLocale()
	 * method of the string instance before calling this method.<p> 
	 * 
	 * <b>Other Pattern Types</b><p>
	 * 
	 * If the argument index is a boolean, the string values "true" and "false" 
	 * may appear as the choice patterns.<p>
	 * 
	 * If the argument index is of type string, then the choice patterns may contain
	 * regular expressions, or static strings as degenerate regexps.
	 * 
	 * @param {*} argIndex The index into the choice array of the current parameter
	 * @param {Object} params The hash of parameter values that replace the replacement 
	 * variables in the string
	 * @throws "syntax error in choice format pattern: " if there is a syntax error
	 * @return {string} the formatted string
	 */
	formatChoice: function(argIndex, params) {
		var choices = this.str.split("|");
		var type = typeof(argIndex);
		var limits = [];
		var strings = [];
		var i;
		var parts;
		var limit;
		var arg;
		var result = undefined;
		var defaultCase = "";
	
		if (this.str.length === 0) {
			// nothing to do
			return "";
		}
		
		// first parse all the choices
		for (i = 0; i < choices.length; i++) {		
			parts = choices[i].split("#");		
			if (parts.length > 2) {
				limits[i] = parts[0];
				parts = parts.shift();			
				strings[i] = parts.join("#");
			} else if (parts.length === 2) {
				limits[i] = parts[0];
				strings[i] = parts[1];
			} else {
				// syntax error
				throw "syntax error in choice format pattern: " + choices[i];
			}		
		}
		
		// then apply the argument index
		for (i = 0; i < limits.length; i++) {
			if (limits[i].length === 0) {
				// this is default case
				defaultCase = new ilib.String(strings[i]);			
			} else {
				switch (type) {
					case 'number':
						arg = parseInt(argIndex, 10);
											
						if (limits[i].substring(0,2) === "<=") {						
							limit = parseFloat(limits[i].substring(2));
							if (arg <= limit) {
								result = new ilib.String(strings[i]);
								i = limits.length;
							}
						} else if (limits[i].substring(0,2) === ">=") {						
							limit = parseFloat(limits[i].substring(2));
							if (arg >= limit) {
								result = new ilib.String(strings[i]);
								i = limits.length;
							}
						} else if (limits[i].charAt(0) === "<") {						
							limit = parseFloat(limits[i].substring(1));
							if (arg < limit) {
								result = new ilib.String(strings[i]);
								i = limits.length;
							}
						} else if (limits[i].charAt(0) === ">") {						
							limit = parseFloat(limits[i].substring(1));
							if (arg > limit) {
								result = new ilib.String(strings[i]);
								i = limits.length;
							}
						} else {
							this.locale = this.locale || new ilib.Locale(this.localeSpec);
							switch (limits[i]) {
								case "zero":
								case "one":
								case "two":
								case "few":
								case "many":
									// CLDR locale-dependent number classes
									var ruleset = ilib.data["plurals_" + this.locale.getLanguage()];
									if (ruleset) {
										var rule = ruleset[limits[i]];
										if (ilib.String._fncs.getValue(rule, arg)) {
											result = new ilib.String(strings[i]);
											i = limits.length;
										}
									}
									break;
								default:
									var dash = limits[i].indexOf("-");
									if (dash !== -1) {							
										// range
										var start = limits[i].substring(0, dash);
										var end = limits[i].substring(dash+1);							
										if (arg >= parseInt(start, 10) && arg <= parseInt(end, 10)) {								
											result = new ilib.String(strings[i]);
											i = limits.length;
										}
									} else if (arg === parseInt(limits[i], 10)) {							
										// exact amount
										result = new ilib.String(strings[i]);
										i = limits.length;
									}
									break;
							}
						}
						break;
					case 'boolean':					
						if (limits[i] === "true" && argIndex === true) {						
							result = new ilib.String(strings[i]);
							i = limits.length;
						} else if (limits[i] === "false" && argIndex === false) {						
							result = new ilib.String(strings[i]);
							i = limits.length;
						}
						break;
					case 'string':					
						var regexp = new RegExp(limits[i], "i");
						if (regexp.test(argIndex)) {
							result = new ilib.String(strings[i]);
							i = limits.length;
						}
						break;
					case 'object':
						throw "syntax error: fmtChoice parameter for the argument index cannot be an object";
				}
			}
		}
		
		if (!result) {		
			result = defaultCase || new ilib.String("");
		}
		
		result = result.format(params);
		
		return result.toString();
	},
	
	// delegates
	/**
	 * Same as String.toString()
	 * @return {string} this instance as regular Javascript string
	 */
	toString: function () {
		return this.str.toString();
	},
	
	/**
	 * Same as String.valueOf()
	 * @return {string} this instance as a regular Javascript string
	 */
	valueOf: function () {
		return this.str.valueOf();
	},
	
	/**
	 * Same as String.charAt()
	 * @param {number} index the index of the character being sought
	 * @return {ilib.String} the character at the given index
	 */
	charAt: function(index) {
		return new ilib.String(this.str.charAt(index));
	},
	
	/**
	 * Same as String.charCodeAt(). This only reports on 
	 * 2-byte UCS-2 Unicode values, and does not take into
	 * account supplementary characters encoded in UTF-16.
	 * If you would like to take account of those characters,
	 * use codePointAt() instead.
	 * @param {number} index the index of the character being sought
	 * @return {number} the character code of the character at the 
	 * given index in the string 
	 */
	charCodeAt: function(index) {
		return this.str.charCodeAt(index);
	},
	
	/**
	 * Same as String.concat()
	 * @param {string} strings strings to concatenate to the current one
	 * @return {ilib.String} a concatenation of the given strings
	 */
	concat: function(strings) {
		return new ilib.String(this.str.concat(strings));
	},
	
	/**
	 * Same as String.indexOf()
	 * @param {string} searchValue string to search for
	 * @param {number} start index into the string to start searching, or
	 * undefined to search the entire string
	 * @return {number} index into the string of the string being sought,
	 * or -1 if the string is not found 
	 */
	indexOf: function(searchValue, start) {
		return this.str.indexOf(searchValue, start);
	},
	
	/**
	 * Same as String.lastIndexOf()
	 * @param {string} searchValue string to search for
	 * @param {number} start index into the string to start searching, or
	 * undefined to search the entire string
	 * @return {number} index into the string of the string being sought,
	 * or -1 if the string is not found 
	 */
	lastIndexOf: function(searchValue, start) {
		return this.str.lastIndexOf(searchValue, start);
	},
	
	/**
	 * Same as String.match()
	 * @param {string} regexp the regular expression to match
	 * @return {Array.<string>} an array of matches
	 */
	match: function(regexp) {
		return this.str.match(regexp);
	},
	
	/**
	 * Same as String.replace()
	 * @param {string} searchValue a regular expression to search for
	 * @param {string} newValue the string to replace the matches with
	 * @return {ilib.String} a new string with all the matches replaced
	 * with the new value
	 */
	replace: function(searchValue, newValue) {
		return new ilib.String(this.str.replace(searchValue, newValue));
	},
	
	/**
	 * Same as String.search()
	 * @param {string} regexp the regular expression to search for
	 * @return {number} position of the match, or -1 for no match
	 */
	search: function(regexp) {
		return this.str.search(regexp);
	},
	
	/**
	 * Same as String.slice()
	 * @param {number} start first character to include in the string
	 * @param {number} end include all characters up to, but not including
	 * the end character
	 * @return {ilib.String} a slice of the current string
	 */
	slice: function(start, end) {
		return new ilib.String(this.str.slice(start, end));
	},
	
	/**
	 * Same as String.split()
	 * @param {string} separator regular expression to match to find
	 * separations between the parts of the text
	 * @param {number} limit maximum number of items in the final 
	 * output array. Any items beyond that limit will be ignored.
	 * @return {Array.<string>} the parts of the current string split 
	 * by the separator
	 */
	split: function(separator, limit) {
		return this.str.split(separator, limit);
	},
	
	/**
	 * Same as String.substr()
	 * @param {number} start the index of the character that should 
	 * begin the returned substring
	 * @param {number} length the number of characters to return after
	 * the start character.
	 * @return {ilib.String} the requested substring 
	 */
	substr: function(start, length) {
		return new ilib.String(this.str.substr(start, length));
	},
	
	/**
	 * Same as String.substring()
	 * @param {number} from the index of the character that should 
	 * begin the returned substring
	 * @param {number} to the index where to stop the extraction. If
	 * omitted, extracts the rest of the string
	 * @return {ilib.String} the requested substring 
	 */
	substring: function(from, to) {
		return this.str.substring(from, to);
	},
	
	/**
	 * Same as String.toLowerCase(). Note that this method is
	 * not locale-sensitive. 
	 * @return {ilib.String} a string with the first character
	 * lower-cased
	 */
	toLowerCase: function() {
		return this.str.toLowerCase();
	},
	
	/**
	 * Same as String.toUpperCase(). Note that this method is
	 * not locale-sensitive. Use toLocaleUpperCase() instead
	 * to get locale-sensitive behaviour. 
	 * @return {ilib.String} a string with the first character
	 * upper-cased
	 */
	toUpperCase: function() {
		return this.str.toUpperCase();
	},
	
	/**
	 * Convert the character or the surrogate pair at the given
	 * index into the string to a Unicode UCS-4 code point.
	 * @protected
	 * @param {number} index index into the string
	 * @return {number} code point of the character at the
	 * given index into the string
	 */
	_toCodePoint: function (index) {
		if (this.str.length === 0) {
			return -1;
		}
		var code = -1, high = this.str.charCodeAt(index);
		if (high >= 0xD800 && high <= 0xDBFF) {
			if (this.str.length > index+1) {
				var low = this.str.charCodeAt(index+1);
				if (low >= 0xDC00 && low <= 0xDFFF) {
					code = (((high & 0x3C0) >> 6) + 1) << 16 |
						(((high & 0x3F) << 10) | (low & 0x3FF));
				}
			}
		} else {
			code = high;
		}
		
		return code;
	},
	
	/**
	 * Return an iterator that will step through all of the characters
	 * in the string one at a time and return their code points, taking 
	 * care to step through the surrogate pairs in UTF-16 encoding 
	 * properly.<p>
	 * 
	 * The standard Javascript String's charCodeAt() method only
	 * returns information about a particular 16-bit character in the 
	 * UTF-16 encoding scheme.
	 * If the index is pointing to a low- or high-surrogate character,
	 * it will return a code point of the surrogate character rather 
	 * than the code point of the character 
	 * in the supplementary planes that the two surrogates together 
	 * encode.<p>
	 * 
	 * The iterator instance returned has two methods, hasNext() which
	 * returns true if the iterator has more code points to iterate through,
	 * and next() which returns the next code point as a number.<p>
	 * 
	 * @return {Object} an iterator 
	 * that iterates through all the code points in the string
	 */
	iterator: function() {
		/**
		 * @constructor
		 */
		function _iterator (istring) {
			this.index = 0;
			this.hasNext = function () {
				return (this.index < istring.str.length);
			};
			this.next = function () {
				if (this.index < istring.str.length) {
					var num = istring._toCodePoint(this.index);
					this.index += ((num > 0xFFFF) ? 2 : 1);
				} else {
					num = -1;
				}
				return num;
			};
		};
		return new _iterator(this);
	},

	/**
	 * Return an iterator that will step through all of the characters
	 * in the string one at a time, taking 
	 * care to step through the surrogate pairs in UTF-16 encoding 
	 * properly.<p>
	 * 
	 * The standard Javascript String's charAt() method only
	 * returns information about a particular 16-bit character in the 
	 * UTF-16 encoding scheme.
	 * If the index is pointing to a low- or high-surrogate character,
	 * it will return that surrogate character rather 
	 * than the surrogate pair which represents a character 
	 * in the supplementary planes.<p>
	 * 
	 * The iterator instance returned has two methods, hasNext() which
	 * returns true if the iterator has more characters to iterate through,
	 * and next() which returns the next character.<p>
	 * 
	 * @return {Object} an iterator 
	 * that iterates through all the characters in the string
	 */
	charIterator: function() {
		/**
		 * @constructor
		 */
		function _chiterator (istring) {
			this.index = 0;
			this.hasNext = function () {
				return (this.index < istring.str.length);
			};
			this.next = function () {
				var ch;
				if (this.index < istring.str.length) {
					ch = istring.str.charAt(this.index);
					if (ilib.String._isSurrogate(ch) && 
							this.index+1 < istring.str.length && 
							ilib.String._isSurrogate(istring.str.charAt(this.index+1))) {
						this.index++;
						ch += istring.str.charAt(this.index);
					}
					this.index++;
				}
				return ch;
			};
		};
		return new _chiterator(this);
	},
	
	/**
	 * Return the code point at the given index when the string is viewed 
	 * as an array of code points. If the index is beyond the end of the
	 * array of code points or if the index is negative, -1 is returned.
	 * @param {number} index index of the code point 
	 * @return {number} code point of the character at the given index into
	 * the string
	 */
	codePointAt: function (index) {
		if (index < 0) {
			return -1;
		}
		var count,
			it = this.iterator(),
			ch;
		for (count = index; count >= 0 && it.hasNext(); count--) {
			ch = it.next();
		}
		return (count < 0) ? ch : -1;
	},
	
	/**
	 * Set the locale to use when processing choice formats. The locale
	 * affects how number classes are interpretted. In some cultures,
	 * the limit "few" maps to "any integer that ends in the digits 2 to 9" and
	 * in yet others, "few" maps to "any integer that ends in the digits
	 * 3 or 4".
	 * @param {ilib.Locale|string} locale locale to use when processing choice
	 * formats with this string
	 * @param {boolean} sync [optional] whether to load the locale data synchronously 
	 * or not
	 * @param {Object} loadParams [optional] parameters to pass to the loader function
	 * @param {function(*)=} onLoad [optional] function to call when the loading is done
	 */
	setLocale: function (locale, sync, loadParams, onLoad) {
		if (typeof(locale) === 'object') {
			this.locale = locale;
		} else {
			this.localeSpec = locale;
			this.locale = new ilib.Locale(locale);
		}
		
		ilib.String.loadPlurals(typeof(sync) !== 'undefined' ? sync : true, this.locale, loadParams, onLoad);
	},

	/**
	 * Return the locale to use when processing choice formats. The locale
	 * affects how number classes are interpretted. In some cultures,
	 * the limit "few" maps to "any integer that ends in the digits 2 to 9" and
	 * in yet others, "few" maps to "any integer that ends in the digits
	 * 3 or 4".
	 * @return {string} localespec to use when processing choice
	 * formats with this string
	 */
	getLocale: function () {
		return (this.locale ? this.locale.getSpec() : this.localeSpec) || ilib.getLocale();
	},

	/**
	 * Return the number of code points in this string. This may be different
	 * than the number of characters, as the UTF-16 encoding that Javascript
	 * uses for its basis returns surrogate pairs separately. Two 2-byte 
	 * surrogate characters together make up one character/code point in 
	 * the supplementary character planes. If your string contains no
	 * characters in the supplementary planes, this method will return the
	 * same thing as the length() method.
	 * @return {number} the number of code points in this string
	 */
	codePointLength: function () {
		if (this.cpLength === -1) {
			var it = this.iterator();
			this.cpLength = 0;
			while (it.hasNext()) { 
				this.cpLength++;
				it.next();
			};
		}
		return this.cpLength;	
	}
};
/*
 * localeinfo.js - Encode locale-specific defaults
 * 
 * Copyright © 2012-2014, JEDLSoft
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

// !depends ilibglobal.js locale.js

// !data localeinfo

/**
 * Create a new locale info instance. Locale info instances give information about
 * the default settings for a particular locale. These settings may be overridden
 * by various parts of the code, and should be used as a fall-back setting of last
 * resort. <p>
 * 
 * The optional options object holds extra parameters if they are necessary. The
 * current list of supported options are:
 * 
 * <ul>
 * <li><i>onLoad</i> - a callback function to call when the locale info object is fully 
 * loaded. When the onLoad option is given, the localeinfo object will attempt to
 * load any missing locale data using the ilib loader callback.
 * When the constructor is done (even if the data is already preassembled), the 
 * onLoad function is called with the current instance as a parameter, so this
 * callback can be used with preassembled or dynamic loading or a mix of the two.
 * 
 * <li><i>sync</i> - tell whether to load any missing locale data synchronously or 
 * asynchronously. If this option is given as "false", then the "onLoad"
 * callback must be given, as the instance returned from this constructor will
 * not be usable for a while. 
 *
 * <li><i>loadParams</i> - an object containing parameters to pass to the 
 * loader callback function when locale data is missing. The parameters are not
 * interpretted or modified in any way. They are simply passed along. The object 
 * may contain any property/value pairs as long as the calling code is in
 * agreement with the loader callback function as to what those parameters mean.
 * </ul>
 * 
 * If this copy of ilib is pre-assembled and all the data is already available, 
 * or if the data was already previously loaded, then this constructor will call
 * the onLoad callback immediately when the initialization is done. 
 * If the onLoad option is not given, this class will only attempt to load any
 * missing locale data synchronously.
 * 
 * Depends directive: !depends localeinfo.js
 * 
 * @class
 * @constructor
 * @see {ilib.setLoaderCallback} for information about registering a loader callback
 * function
 * @param {ilib.Locale|string=} locale the locale for which the info is sought, or undefined for
 * @param {Object=} options the locale for which the info is sought, or undefined for
 * the current locale
 */
ilib.LocaleInfo = function(locale, options) {
	var sync = true,
	    loadParams = undefined;
	
	/* these are all the defaults. Essentially, en-US */
	/** @type {{
		scripts:Array.<string>,
		timezone:string,
		units:string,
		calendar:string,
		clock:string,
		currency:string,
		firstDayOfWeek:number,
		numfmt:Object.<{
			currencyFormats:Object.<{common:string,commonNegative:string,iso:string,isoNegative:string}>,
			script:string,
			decimalChar:string,
			groupChar:string,
			prigroupSize:number,
			secgroupSize:number,
			negativenumFmt:string,
			pctFmt:string,
			negativepctFmt:string,
			pctChar:string,
			roundingMode:string,
			exponential:string,
			digits:string
		}>
	}}*/
	this.info = ilib.LocaleInfo.defaultInfo;
	
	switch (typeof(locale)) {
		case "string":
			this.locale = new ilib.Locale(locale);
			break;
		default:
		case "undefined":
			this.locale = new ilib.Locale();
			break;
		case "object":
			this.locale = locale;
			break;
	}
	
	if (options) {
		if (typeof(options.sync) !== 'undefined') {
			sync = (options.sync == true);
		}
		
		if (typeof(options.loadParams) !== 'undefined') {
			loadParams = options.loadParams;
		}
	}

	if (!ilib.LocaleInfo.cache) {
		ilib.LocaleInfo.cache = {};
	}

	ilib.loadData({
		object: ilib.LocaleInfo, 
		locale: this.locale, 
		name: "localeinfo.json", 
		sync: sync, 
		loadParams: loadParams, 
		callback: ilib.bind(this, function (info) {
			if (!info) {
				info = ilib.LocaleInfo.defaultInfo;
				var spec = this.locale.getSpec().replace(/-/g, "_");
				ilib.LocaleInfo.cache[spec] = info;
			}
			this.info = info;
			if (options && typeof(options.onLoad) === 'function') {
				options.onLoad(this);
			}
		})
	});
};

ilib.LocaleInfo.defaultInfo = /** @type {{
	scripts:Array.<string>,
	timezone:string,
	units:string,
	calendar:string,
	clock:string,
	currency:string,
	firstDayOfWeek:number,
	numfmt:Object.<{
		currencyFormats:Object.<{
			common:string,
			commonNegative:string,
			iso:string,
			isoNegative:string
		}>,
		script:string,
		decimalChar:string,
		groupChar:string,
		prigroupSize:number,
		secgroupSize:number,
		negativenumFmt:string,
		pctFmt:string,
		negativepctFmt:string,
		pctChar:string,
		roundingMode:string,
		exponential:string,
		digits:string
	}>
}}*/ ilib.data.localeinfo;
ilib.LocaleInfo.defaultInfo = ilib.LocaleInfo.defaultInfo || {
	"scripts": ["Latn"],
    "timezone": "Etc/UTC",
    "units": "metric",
    "calendar": "gregorian",
    "clock": "24",
    "currency": "USD",
    "firstDayOfWeek": 1,
    "numfmt": {
        "currencyFormats": {
            "common": "{s}{n}",
            "commonNegative": "{s}-{n}",
            "iso": "{s}{n}",
            "isoNegative": "{s}-{n}"
        },
        "script": "Latn",
        "decimalChar": ",",
        "groupChar": ".",
        "prigroupSize": 3,
        "secgroupSize": 0,
        "pctFmt": "{n}%",
        "negativepctFmt": "-{n}%",
        "pctChar": "%",
        "roundingMode": "halfdown",
        "exponential": "e",
        "digits": ""
    }
};

ilib.LocaleInfo.prototype = {
    /**
     * Return the name of the locale's language in English.
     * @returns {string} the name of the locale's language in English
     */
    getLanguageName: function () {
    	return this.info["language.name"];	
    },
    
    /**
     * Return the name of the locale's region in English. If the locale
     * has no region, this returns undefined.
     * 
     * @returns {string|undefined} the name of the locale's region in English
     */
    getRegionName: function () {
    	return this.info["region.name"];	
    },

    /**
	 * Return whether this locale commonly uses the 12- or the 24-hour clock.
	 *  
	 * @returns {string} "12" if the locale commonly uses a 12-hour clock, or "24"
	 * if the locale commonly uses a 24-hour clock. 
	 */
	getClock: function() {
		return this.info.clock;
	},

	/**
	 * Return the locale that this info object was created with.
	 * @returns {ilib.Locale} The locale spec of the locale used to construct this info instance
	 */
	getLocale: function () {
		return this.locale;
	},
	
	/**
	 * Return the name of the measuring system that is commonly used in the given locale.
	 * Valid values are "uscustomary", "imperial", and "metric".
	 * 
	 * @returns {string} The name of the measuring system commonly used in the locale
	 */
	getUnits: function () {
		return this.info.units;
	},
	
	/**
	 * Return the name of the calendar that is commonly used in the given locale.
	 * 
	 * @returns {string} The name of the calendar commonly used in the locale
	 */
	getCalendar: function () {
		return this.info.calendar;
	},
	
	/**
	 * Return the day of week that starts weeks in the current locale. Days are still
	 * numbered the standard way with 0 for Sunday through 6 for Saturday, but calendars 
	 * should be displayed and weeks calculated with the day of week returned from this 
	 * function as the first day of the week.
	 * 
	 * @returns {number} the day of the week that starts weeks in the current locale.
	 */
	getFirstDayOfWeek: function () {
		return this.info.firstDayOfWeek;
	},
	
	/**
	 * Return the default time zone for this locale. Many locales span across multiple
	 * time zones. In this case, the time zone with the largest population is chosen
	 * to represent the locale. This is obviously not that accurate, but then again,
	 * this method's return value should only be used as a default anyways.
	 * @returns {string} the default time zone for this locale.
	 */
	getTimeZone: function () {
		return this.info.timezone;
	},
	
	/**
	 * Return the decimal separator for formatted numbers in this locale.
	 * @returns {string} the decimal separator char
	 */
	getDecimalSeparator: function () {
		return this.info.numfmt.decimalChar;
	},
	
	/**
	 * Return the decimal separator for formatted numbers in this locale for native script.
	 * @returns {string} the decimal separator char
	 */
	getNativeDecimalSeparator: function () {
		return (this.info.native_numfmt && this.info.native_numfmt.decimalChar) || this.info.numfmt.decimalChar;
	},
	
	/**
	 * Return the separator character used to separate groups of digits on the 
	 * integer side of the decimal character.
	 * @returns {string} the grouping separator char
	 */
	getGroupingSeparator: function () {
		return this.info.numfmt.groupChar;
	},

	/**
	 * Return the separator character used to separate groups of digits on the 
	 * integer side of the decimal character for the native script if present other than the default script.
	 * @returns {string} the grouping separator char
	 */
	getNativeGroupingSeparator: function () {
		return (this.info.native_numfmt && this.info.native_numfmt.groupChar) || this.info.numfmt.groupChar;
	},
	
	/**
	 * Return the minimum number of digits grouped together on the integer side 
	 * for the first (primary) group. 
	 * In western European cultures, groupings are in 1000s, so the number of digits
	 * is 3. 
	 * @returns {number} the number of digits in a primary grouping, or 0 for no grouping
	 */
	getPrimaryGroupingDigits: function () {
		return (typeof(this.info.numfmt.prigroupSize) !== 'undefined' && this.info.numfmt.prigroupSize) || 0;
	},

	/**
	 * Return the minimum number of digits grouped together on the integer side
	 * for the second or more (secondary) group.<p>
	 *   
	 * In western European cultures, all groupings are by 1000s, so the secondary
	 * size should be 0 because there is no secondary size. In general, if this 
	 * method returns 0, then all groupings are of the primary size.<p> 
	 * 
	 * For some other cultures, the first grouping (primary)
	 * is 3 and any subsequent groupings (secondary) are two. So, 100000 would be
	 * written as: "1,00,000".
	 * 
	 * @returns {number} the number of digits in a secondary grouping, or 0 for no 
	 * secondary grouping. 
	 */
	getSecondaryGroupingDigits: function () {
		return this.info.numfmt.secgroupSize || 0;
	},

	/**
	 * Return the format template used to format percentages in this locale.
	 * @returns {string} the format template for formatting percentages
	 */
	getPercentageFormat: function () {
		return this.info.numfmt.pctFmt;
	},

	/**
	 * Return the format template used to format percentages in this locale
	 * with negative amounts.
	 * @returns {string} the format template for formatting percentages
	 */
	getNegativePercentageFormat: function () {
		return this.info.numfmt.negativepctFmt;
	},

	/**
	 * Return the symbol used for percentages in this locale.
	 * @returns {string} the symbol used for percentages in this locale
	 */
	getPercentageSymbol: function () {
		return this.info.numfmt.pctChar || "%";
	},

	/**
	 * Return the symbol used for exponential in this locale.
	 * @returns {string} the symbol used for exponential in this locale
	 */
	getExponential: function () {
		return this.info.numfmt.exponential;
	},

	/**
	 * Return the symbol used for exponential in this locale for native script.
	 * @returns {string} the symbol used for exponential in this locale for native script
	 */
	getNativeExponential: function () {
		return (this.info.native_numfmt && this.info.native_numfmt.exponential) || this.info.numfmt.exponential;
	},

	/**
	 * Return the symbol used for percentages in this locale for native script.
	 * @returns {string} the symbol used for percentages in this locale for native script
	 */
	getNativePercentageSymbol: function () {
		return (this.info.native_numfmt && this.info.native_numfmt.pctChar) || this.info.numfmt.pctChar || "%";
	
	},
	/**
	 * Return the format template used to format negative numbers in this locale.
	 * @returns {string} the format template for formatting negative numbers
	 */
	getNegativeNumberFormat: function () { 
		return this.info.numfmt.negativenumFmt;
	},
	
	/**
	 * Return an object containing the format templates for formatting currencies
	 * in this locale. The object has a number of properties in it that each are
	 * a particular style of format. Normally, this contains a "common" and an "iso"
	 * style, but may contain others in the future.
	 * @returns {Object} an object containing the format templates for currencies
	 */
	getCurrencyFormats: function () {
		return this.info.numfmt.currencyFormats;
	},
	
	/**
	 * Return the currency that is legal in the locale, or which is most commonly 
	 * used in regular commerce.
	 * @returns {string} the ISO 4217 code for the currency of this locale
	 */
	getCurrency: function () {
		return this.info.currency;
	},
	
	/**
	 * Return a string that describes the style of digits used by this locale.
	 * Possible return values are:
	 * <ul>
	 * <li><i>western</i> - uses the regular western 10-based digits 0 through 9
	 * <li><i>optional</i> - native 10-based digits exist, but in modern usage,
	 * this locale most often uses western digits
	 * <li><i>native</i> - native 10-based native digits exist and are used
	 * regularly by this locale
	 * <li><i>custom</i> - uses native digits by default that are not 10-based
	 * </ul>
	 * @returns {string} string that describes the style of digits used in this locale
	 */
	getDigitsStyle: function () {
		if (this.info.numfmt.useNative) {
			return "native";
		}
		if (typeof(this.info.native_numfmt) !== 'undefined') {
			return "optional";
		}
		return "western";
	},
	
	/**
	 * Return the digits of the default script if they are defined.
	 * If not defined, the default should be the regular "Arabic numerals"
	 * used in the Latin script. (0-9)
	 * @returns {string|undefined} the digits used in the default script 
	 */
	getDigits: function () {
		return this.info.numfmt.digits;
	},
	
	/**
	 * Return the digits of the native script if they are defined. 
	 * @returns {string|undefined} the digits used in the default script 
	 */
	getNativeDigits: function () {
		return (this.info.numfmt.useNative && this.info.numfmt.digits) || (this.info.native_numfmt && this.info.native_numfmt.digits);
	},
	
	/**
	 * If this locale typically uses a different type of rounding for numeric
	 * formatting other than halfdown, especially for currency, then it can be 
	 * specified in the localeinfo. If the locale uses the default, then this 
	 * method returns undefined. The locale's rounding method overrides the 
	 * rounding method for the currency itself, which can sometimes shared 
	 * between various locales so it is less specific.
	 * @returns {string} the name of the rounding mode typically used in this
	 * locale, or "halfdown" if the locale does not override the default
	 */
	getRoundingMode: function () {
		return this.info.numfmt.roundingMode;
	},
	
	/**
	 * Return the default script used to write text in the language of this 
	 * locale. Text for most languages is written in only one script, but there
	 * are some languages where the text can be written in a number of scripts,
	 * depending on a variety of things such as the region, ethnicity, religion, 
	 * etc. of the author. This method returns the default script for the
	 * locale, in which the language is most commonly written.<p> 
	 * 
	 * The script is returned as an ISO 15924 4-letter code.
	 * 
	 * @returns {string} the ISO 15924 code for the default script used to write
	 * text in this locale 
	 */
	getDefaultScript: function() {
		return (this.info.scripts) ? this.info.scripts[0] : "Latn";
	},
	
	/**
	 * Return the script used for the current locale. If the current locale
	 * explicitly defines a script, then this script is returned. If not, then 
	 * the default script for the locale is returned.
	 * 
	 * @see ilib.LocaleInfo.getDefaultScript
	 * @returns {string} the ISO 15924 code for the script used to write
	 * text in this locale
	 */
	getScript: function() {
		return this.locale.getScript() || this.getDefaultScript(); 
	},
	
	/**
	 * Return an array of script codes which are used to write text in the current
	 * language. Text for most languages is written in only one script, but there
	 * are some languages where the text can be written in a number of scripts,
	 * depending on a variety of things such as the region, ethnicity, religion, 
	 * etc. of the author. This method returns an array of script codes in which 
	 * the language is commonly written.
	 * 
	 * @returns {Array.<string>} an array of ISO 15924 codes for the scripts used 
	 * to write text in this language
	 */
	getAllScripts: function() {
		return this.info.scripts || ["Latn"];
	}
};

/*
 * resources.js - Resource bundle definition
 * 
 * Copyright © 2012-2014, JEDLSoft
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

// !depends ilibglobal.js locale.js localeinfo.js strings.js util/utils.js

// !data pseudomap

/**
 * Create a new resource bundle instance. The resource bundle loads strings
 * appropriate for a particular locale and provides them via the getString 
 * method.<p>
 * 
 * The options object may contain any (or none) of the following properties:
 * 
 * <ul>
 * <li><i>locale</i> - The locale of the strings to load. If not specified, the default
 * locale is the the default for the web page or app in which the bundle is 
 * being loaded.
 * 
 * <li><i>name</i> - Base name of the resource bundle to load. If not specified the default
 * base name is "resources".
 * 
 * <li><i>type</i> - Name the type of strings this bundle contains. Valid values are 
 * "xml", "html", "text", or "raw". The default is "text". If the type is "xml" or "html",
 * then XML/HTML entities and tags are not pseudo-translated. During a real translation, 
 * HTML character entities are translated to their corresponding characters in a source
 * string before looking that string up in the translations. Also, the characters "<", ">",
 * and "&" are converted to entities again in the output, but characters are left as they
 * are. If the type is "xml", "html", or "text" types, then the replacement parameter names
 * are not pseudo-translated as well so that the output can be used for formatting with 
 * the ilib.String class. If the type is raw, all characters are pseudo-translated, 
 * including replacement parameters as well as XML/HTML tags and entities.
 * 
 * <li><i>lengthen</i> - when pseudo-translating the string, tell whether or not to 
 * automatically lengthen the string to simulate "long" languages such as German
 * or French. This is a boolean value. Default is false.
 * 
 * <li><i>missing</i> - what to do when a resource is missing. The choices are:
 * <ul>
 *   <li><i>source</i> - return the source string unchanged
 *   <li><i>pseudo</i> - return the pseudo-translated source string, translated to the
 *   script of the locale if the mapping is available, or just the default Latin 
 *   pseudo-translation if not
 *   <li><i>empty</i> - return the empty string 
 * </ul>
 * The default behaviour is the same as before, which is to return the source string
 * unchanged.
 * 
 * <li><i>onLoad</i> - a callback function to call when the resources are fully 
 * loaded. When the onLoad option is given, this class will attempt to
 * load any missing locale data using the ilib loader callback.
 * When the constructor is done (even if the data is already preassembled), the 
 * onLoad function is called with the current instance as a parameter, so this
 * callback can be used with preassembled or dynamic loading or a mix of the two. 
 * 
 * <li>sync - tell whether to load any missing locale data synchronously or 
 * asynchronously. If this option is given as "false", then the "onLoad"
 * callback must be given, as the instance returned from this constructor will
 * not be usable for a while. 
 *
 * <li><i>loadParams</i> - an object containing parameters to pass to the 
 * loader callback function when locale data is missing. The parameters are not
 * interpretted or modified in any way. They are simply passed along. The object 
 * may contain any property/value pairs as long as the calling code is in
 * agreement with the loader callback function as to what those parameters mean.
 * </ul>
 * 
 * The locale option may be given as a locale spec string or as an 
 * ilib.Locale object. If the locale option is not specified, then strings for
 * the default locale will be loaded.<p> 
 * 
 * The name option can be used to put groups of strings together in a
 * single bundle. The strings will then appear together in a JS object in
 * a JS file that can be included before the ilib.<p>
 * 
 * A resource bundle with a particular name is actually a set of bundles
 * that are each specific to a language, a language plus a region, etc. 
 * All bundles with the same base name should
 * contain the same set of source strings, but with different translations for 
 * the given locale. The user of the bundle does not need to be aware of 
 * the locale of the bundle, as long as it contains values for the strings 
 * it needs.<p>
 * 
 * Strings in bundles for a particular locale are inherited from parent bundles
 * that are more generic. In general, the hierarchy is as follows (from 
 * least locale-specific to most locale-specific):
 * 
 * <ol>
 * <li> language
 * <li> region
 * <li> language_script
 * <li> language_region
 * <li> region_variant
 * <li> language_script_region
 * <li> language_region_variant
 * <li> language_script_region_variant
 * </ol>
 * 
 * That is, if the translation for a string does not exist in the current
 * locale, the more-generic parent locale is searched for the string. In the
 * worst case scenario, the string is not found in the base locale's strings. 
 * In this case, the missing option guides this class on what to do. If
 * the missing option is "source", then the original source is returned as 
 * the translation. If it is "empty", the empty string is returned. If it
 * is "pseudo", then the pseudo-translated string that is appropriate for
 * the default script of the locale is returned.<p> 
 * 
 * This allows developers to create code with new or changed strings in it and check in that
 * code without waiting for the translations to be done first. The translated
 * version of the app or web site will still function properly, but will show 
 * a spurious untranslated string here and there until the translations are 
 * done and also checked in.<p>   
 *  
 * The base is whatever language your developers use to code in. For
 * a German web site, strings in the source code may be written in German 
 * for example. Often this base is English, as many web sites are coded in
 * English, but that is not required.<p>
 * 
 * The strings can be extracted with the ilib localization tool (which will be
 * shipped at some future time.) Once the strings
 * have been translated, the set of translated files can be generated with the
 * same tool. The output from the tool can be used as input to the ResBundle
 * object. It is up to the web page or app to make sure the JS file that defines
 * the bundle is included before creating the ResBundle instance.<p>
 * 
 * A special locale "zxx-XX" is used as the pseudo-translation locale because
 * zxx means "no linguistic information" in the ISO 639 standard, and the region 
 * code XX is defined to be user-defined in the ISO 3166 standard. 
 * Pseudo-translation is a locale where the translations are generated on
 * the fly based on the contents of the source string. Characters in the source 
 * string are replaced with other characters and returned. 
 * 
 * Example. If the source string is:
 * 
 * <pre>
 * "This is a string"
 * </pre>
 * 
 * then the pseudo-translated version might look something like this: 
 * 
 * <pre>
 * "Ţħïş ïş á şţřïñĝ"
 * </pre>
 * <p>
 * 
 * Pseudo-translation can be used to test that your app or web site is translatable
 * before an actual translation has happened. These bugs can then be fixed 
 * before the translation starts, avoiding an explosion of bugs later when
 * each language's tester registers the same bug complaining that the same 
 * string is not translated. When pseudo-localizing with
 * the Latin script, this allows the strings to be readable in the UI in the 
 * source language (if somewhat funky-looking), 
 * so that a tester can easily verify that the string is properly externalized 
 * and loaded from a resource bundle without the need to be able to read a
 * foreign language.<p> 
 * 
 * If one of a list of script tags is given in the pseudo-locale specifier, then the
 * pseudo-localization can map characters to very rough transliterations of
 * characters in the given script. For example, zxx-Hebr-XX maps strings to
 * Hebrew characters, which can be used to test your UI in a right-to-left
 * language to catch bidi bugs before a translation is done. Currently, the
 * list of target scripts includes Hebrew (Hebr), Chinese Simplified Han (Hans),
 * and Cyrillic (Cyrl) with more to be added later. If no script is explicitly
 * specified in the locale spec, or if the script is not supported,
 * then the default mapping maps Latin base characters to accented versions of
 * those Latin characters as in the example above.
 *  
 * When the "lengthen" property is set to true in the options, the 
 * pseudotranslation code will add digits to the end of the string to simulate
 * the lengthening that occurs when translating to other languages. The above 
 * example will come out like this:
 * 
 * <pre>
 * "Ţħïş ïş á şţřïñĝ76543210"
 * </pre>
 * 
 * The string is lengthened according to the length of the source string. If
 * the source string is less than 20 characters long, the string is lengthened 
 * by 50%. If the source string is 20-40 
 * characters long, the string is lengthened by 33%. If te string is greater
 * than 40 characters long, the string is lengthened by 20%.<p>
 * 
 * The pseudotranslation always ends a string with the digit "0". If you do
 * not see the digit "0" in the UI for your app, you know that truncation
 * has occurred, and the number you see at the end of the string tells you 
 * how many characters were truncated.<p>
 * 
 * Depends directive: !depends resources.js
 * 
 * @class
 * @constructor
 * @param {?Object} options Options controlling how the bundle is created
 */
ilib.ResBundle = function (options) {
	var lookupLocale, spec;
	
	this.locale = new ilib.Locale();	// use the default locale
	this.baseName = "strings";
	this.type = "text";
	this.loadParams = {};
	this.missing = "source";
	this.sync = true;
	
	if (options) {
		if (options.locale) {
			this.locale = (typeof(options.locale) === 'string') ? 
					new ilib.Locale(options.locale) :
					options.locale;
		}
		if (options.name) {
			this.baseName = options.name;
		}
		if (options.type) {
			this.type = options.type;
		}
		this.lengthen = options.lengthen || false;
		
		if (typeof(options.sync) !== 'undefined') {
			this.sync = (options.sync == true);
		}
		
		if (typeof(options.loadParams) !== 'undefined') {
			this.loadParams = options.loadParams;
		}
		if (typeof(options.missing) !== 'undefined') {
			if (options.missing === "pseudo" || options.missing === "empty") {
				this.missing = options.missing;
			}
		}
	}
	
	this.map = {};

	if (!ilib.ResBundle[this.baseName]) {
		ilib.ResBundle[this.baseName] = {};
	}

	lookupLocale = this.locale.isPseudo() ? new ilib.Locale("en-US") : this.locale;

	ilib.loadData({
		object: ilib.ResBundle[this.baseName], 
		locale: lookupLocale, 
		name: this.baseName + ".json", 
		sync: this.sync, 
		loadParams: this.loadParams, 
		callback: ilib.bind(this, function (map) {
			if (!map) {
				map = ilib.data[this.baseName] || {};
				spec = lookupLocale.getSpec().replace(/-/g, '_');
				ilib.ResBundle[this.baseName].cache[spec] = map;
			}
			this.map = map;
			if (this.locale.isPseudo()) {
				if (!ilib.ResBundle.pseudomap) {
					ilib.ResBundle.pseudomap = {};
				}
	
				this._loadPseudo(this.locale, options.onLoad);
			} else if (this.missing === "pseudo") {
				if (!ilib.ResBundle.pseudomap) {
					ilib.ResBundle.pseudomap = {};
				}
	
				new ilib.LocaleInfo(this.locale, {
					sync: this.sync,
					loadParams: this.loadParams,
					onLoad: ilib.bind(this, function (li) {
						var pseudoLocale = new ilib.Locale("zxx", "XX", undefined, li.getDefaultScript());
						this._loadPseudo(pseudoLocale, options.onLoad);
					})
				});
			} else {
				if (options && typeof(options.onLoad) === 'function') {
					options.onLoad(this);
				}
			}
		})
	});

	// console.log("Merged resources " + this.locale.toString() + " are: " + JSON.stringify(this.map));
	//if (!this.locale.isPseudo() && ilib.isEmpty(this.map)) {
	//	console.log("Resources for bundle " + this.baseName + " locale " + this.locale.toString() + " are not available.");
	//}
};

ilib.ResBundle.defaultPseudo = ilib.data.pseudomap || {
	"a": "à",
	"e": "ë",
	"i": "í",
	"o": "õ",
	"u": "ü",
	"y": "ÿ",
	"A": "Ã",
	"E": "Ë",
	"I": "Ï",
	"O": "Ø",
	"U": "Ú",
	"Y": "Ŷ"
};

ilib.ResBundle.prototype = {
    /**
     * @protected
     */
    _loadPseudo: function (pseudoLocale, onLoad) {
		ilib.loadData({
			object: ilib.ResBundle.pseudomap, 
			locale: pseudoLocale, 
			name: "pseudomap.json", 
			sync: this.sync, 
			loadParams: this.loadParams, 
			callback: ilib.bind(this, function (map) {
				if (!map || ilib.isEmpty(map)) {
					map = ilib.ResBundle.defaultPseudo;
					var spec = pseudoLocale.getSpec().replace(/-/g, '_');
					ilib.ResBundle.pseudomap.cache[spec] = map;
				}
				this.pseudomap = map;
				if (typeof(onLoad) === 'function') {
					onLoad(this);
				}	
			})
		});
    },
    
	/**
	 * Return the locale of this resource bundle.
	 * @return {ilib.Locale} the locale of this resource bundle object 
	 */
	getLocale: function () {
		return this.locale;
	},
	
	/**
	 * Return the name of this resource bundle. This corresponds to the name option
	 * given to the constructor.
	 * @return {string} name of the the current instance
	 */
	getName: function () {
		return this.baseName;
	},
	
	/**
	 * Return the type of this resource bundle. This corresponds to the type option
	 * given to the constructor.
	 * @return {string} type of the the current instance
	 */
	getType: function () {
		return this.type;
	},

	/*
	 * @private
	 * Pseudo-translate a string
	 */
	pseudo: function (str) {
		if (!str) {
			return undefined;
		}
		var ret = "", i;
		for (i = 0; i < str.length; i++) {
			if (this.type !== "raw") {
				if (this.type === "html" || this.type === "xml") {
					if (str.charAt(i) === '<') {
						ret += str.charAt(i++);
						while (i < str.length && str.charAt(i) !== '>') {
							ret += str.charAt(i++);
						}
						if (i < str.length) {
							ret += str.charAt(i++);
						}
					} else if (str.charAt(i) === '&') {
						ret += str.charAt(i++);
						while (i < str.length && str.charAt(i) !== ';' && str.charAt(i) !== ' ') {
							ret += str.charAt(i++);
						}
						if (i < str.length) {
							ret += str.charAt(i++);
						}
					}
				}
				if (i < str.length) { 
					if (str.charAt(i) === '{') {
						ret += str.charAt(i++);
						while (i < str.length && str.charAt(i) !== '}') {
							ret += str.charAt(i++);
						}
						if (i < str.length) {
							ret += str.charAt(i);
						}
					} else {
						ret += this.pseudomap[str.charAt(i)] || str.charAt(i);
					}
				}
			} else {
				ret += this.pseudomap[str.charAt(i)] || str.charAt(i);
			}
		}
		if (this.lengthen) {
			var add;
			if (ret.length <= 20) {
				add = Math.round(ret.length / 2);
			} else if (ret.length > 20 && ret.length <= 40) {
				add = Math.round(ret.length / 3);
			} else {
				add = Math.round(ret.length / 5);
			}
			for (i = add-1; i >= 0; i--) {
				ret += (i % 10);
			}
		}
		if (this.locale.getScript() === "Hans" || this.locale.getScript() === "Hant" ||
				this.locale.getScript() === "Hani" ||
				this.locale.getScript() === "Hrkt" || this.locale.getScript() === "Jpan" ||
				this.locale.getScript() === "Hira" || this.locale.getScript() === "Kana" ) {
			// simulate Asian languages by getting rid of all the spaces
			ret = ret.replace(/ /g, "");
		}
		return ret;
	},
	
	/*
	 * @private
	 * Escape html characters in the output.
	 */
	escapeXml: function (str) {
		str = str.replace(/&/g, '&amp;');
		str = str.replace(/</g, '&lt;');
		str = str.replace(/>/g, '&gt;');
		return str;
	},

	/*
	 * @private
	 * @param {string} str the string to unescape
	 */
	unescapeXml: function (str) {
		str = str.replace(/&amp;/g, '&');
		str = str.replace(/&lt;/g, '<');
		str = str.replace(/&gt;/g, '>');
		return str;
	},
	
	/*
	 * @private
	 * Create a key name out of a source string. All this does so far is 
	 * compress sequences of white space into a single space on the assumption
	 * that this doesn't really change the meaning of the string, and therefore
	 * all such strings that compress to the same thing should share the same
	 * translation.
	 * @param {string} source the source string to make a key out of
	 */
	makeKey: function (source) {
		var key = source.replace(/\s+/gm, ' ');
		return (this.type === "xml" || this.type === "html") ? this.unescapeXml(key) : key;
	},
	
	/**
	 * Return a localized string. If the string is not found in the loaded set of
	 * resources, the original source string is returned. If the key is not given,
	 * then the source string itself is used as the key. In the case where the 
	 * source string is used as the key, the whitespace is compressed down to 1 space
	 * each, and the whitespace at the beginning and end of the string is trimmed.<p>
	 * 
	 * The escape mode specifies what type of output you are escaping the returned
	 * string for. Modes are similar to the types: 
	 * 
	 * <ul>
	 * <li>"html" -- prevents HTML injection by escaping the characters &lt &gt; and &amp;
	 * <li>"xml" -- currently same as "html" mode
	 * <li>"js" -- prevents breaking Javascript syntax by backslash escaping all quote and 
	 * double-quote characters
	 * <li>"attribute" -- meant for HTML attribute values. Currently this is the same as
	 * "js" escape mode.
	 * <li>"default" -- use the type parameter from the constructor as the escape mode as well
	 * <li>"none" or undefined -- no escaping at all.
	 * </ul>
	 * 
	 * The type parameter of the constructor specifies what type of strings this bundle
	 * is operating upon. This allows pseudo-translation and automatic key generation
	 * to happen properly by telling this class how to parse the string. The escape mode 
	 * for this method is different in that it specifies how this string will be used in 
	 * the calling code and therefore how to escape it properly.<p> 
	 * 
	 * For example, a section of Javascript code may be constructing an HTML snippet in a 
	 * string to add to the web page. In this case, the type parameter in the constructor should
	 * be "html" so that the source string can be parsed properly, but the escape mode should
	 * be "js" so that the output string can be used in Javascript without causing syntax
	 * errors.
	 * 
	 * @param {?string=} source the source string to translate
	 * @param {?string=} key optional name of the key, if any
	 * @param {?string=} escapeMode escape mode, if any
	 * @return {ilib.String|undefined} the translation of the given source/key or undefined 
	 * if the translation is not found and the source is undefined 
	 */
	getString: function (source, key, escapeMode) {
		if (!source && !key) return new ilib.String("");

		var trans;
		if (this.locale.isPseudo()) {
			var str = source ? source : this.map[key];
			trans = this.pseudo(str || key);
		} else {
			var keyName = key || this.makeKey(source);
			if (typeof(this.map[keyName]) !== 'undefined') {
				trans = this.map[keyName];
			} else if (this.missing === "pseudo") {
				trans = this.pseudo(source || key);
			} else if (this.missing === "empty") {
				trans = "";
			} else {
				trans = source;
			}
		}

		if (escapeMode && escapeMode !== "none") {
			if (escapeMode == "default") {
				escapeMode = this.type;
			}
			if (escapeMode === "xml" || escapeMode === "html") {
				trans = this.escapeXml(trans);
			} else if (escapeMode == "js" || escapeMode === "attribute") {
				trans = trans.replace(/'/g, "\\\'").replace(/"/g, "\\\"");
			}
		}
		if (trans === undefined) {
			return undefined;
		} else {
			var ret = new ilib.String(trans);
			ret.setLocale(this.locale.getSpec(), true, this.loadParams); // no callback
			return ret;
		}
	},
	
	/**
	 * Return true if the current bundle contains a translation for the given key and
	 * source. The
	 * getString method will always return a string for any given key and source 
	 * combination, so it cannot be used to tell if a translation exists. Either one
	 * or both of the source and key must be specified. If both are not specified,
	 * this method will return false.
	 * 
	 * @param {?string=} source source string to look up
	 * @param {?string=} key key to look up
	 * @return {boolean} true if this bundle contains a translation for the key, and 
	 * false otherwise
	 */
	containsKey: function(source, key) {
		if (typeof(source) === 'undefined' && typeof(key) === 'undefined') {
			return false;
		}
		
		var keyName = key || this.makeKey(source);
		return typeof(this.map[keyName]) !== 'undefined';
	},
	
	/**
	 * Return the merged resources as an entire object. When loading resources for a
	 * locale that are not just a set of translated strings, but instead an entire 
	 * structured javascript object, you can gain access to that object via this call. This method
	 * will ensure that all the of the parts of the object are correct for the locale.<p>
	 * 
	 * For pre-assembled data, it starts by loading <i>ilib.data[name]</i>, where 
	 * <i>name</i> is the base name for this set of resources. Then, it successively 
	 * merges objects in the base data using progressively more locale-specific data. 
	 * It loads it in this order from <i>ilib.data</i>:
	 * 
	 * <ol>
	 * <li> language
	 * <li> region
	 * <li> language_script
	 * <li> language_region
	 * <li> region_variant
	 * <li> language_script_region
	 * <li> language_region_variant
	 * <li> language_script_region_variant
	 * </ol>
	 * 
	 * For dynamically loaded data, the code attempts to load the same sequence as
	 * above, but with slash path separators instead of underscores.<p>
	 *  
	 * Loading the resources this way allows the program to share resources between all
	 * locales that share a common language, region, or script. As a 
	 * general rule-of-thumb, resources should be as generic as possible in order to
	 * cover as many locales as possible.
	 * 
	 * @return {Object} returns the object that is the basis for this resources instance
	 */
	getResObj: function () {
		return this.map;
	}
};

/*
 * scriptinfo.js - information about scripts
 * 
 * Copyright © 2012-2014, JEDLSoft
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

// !depends ilibglobal.js

// !data scripts

/**
 * Create a new script info instance. This class encodes information about
 * scripts, which are sets of characters used in a writing system.<p>
 * 
 * The options object may contain any of the following properties:
 * 
 * <ul>
 * <li><i>onLoad</i> - a callback function to call when the script info object is fully 
 * loaded. When the onLoad option is given, the script info object will attempt to
 * load any missing locale data using the ilib loader callback.
 * When the constructor is done (even if the data is already preassembled), the 
 * onLoad function is called with the current instance as a parameter, so this
 * callback can be used with preassembled or dynamic loading or a mix of the two.
 * 
 * <li><i>sync</i> - tell whether to load any missing locale data synchronously or 
 * asynchronously. If this option is given as "false", then the "onLoad"
 * callback must be given, as the instance returned from this constructor will
 * not be usable for a while. 
 *
 * <li><i>loadParams</i> - an object containing parameters to pass to the 
 * loader callback function when locale data is missing. The parameters are not
 * interpretted or modified in any way. They are simply passed along. The object 
 * may contain any property/value pairs as long as the calling code is in
 * agreement with the loader callback function as to what those parameters mean.
 * </ul>
 * 
 * Depends directive: !depends scriptinfo.js
 * 
 * @class
 * @constructor
 * @param {string} script The ISO 15924 4-letter identifier for the script
 * @param {Object} options parameters to initialize this matcher 
 */
ilib.ScriptInfo = function(script, options) {
	var sync = true,
	    loadParams = undefined;
	
	this.script = script;
	
	if (options) {
		if (typeof(options.sync) !== 'undefined') {
			sync = (options.sync == true);
		}
		
		if (typeof(options.loadParams) !== 'undefined') {
			loadParams = options.loadParams;
		}
	}

	if (!ilib.ScriptInfo.cache) {
		ilib.ScriptInfo.cache = {};
	}

	if (!ilib.data.scripts) {
		ilib.loadData({
			object: ilib.ScriptInfo, 
			locale: "-", 
			name: "scripts.json", 
			sync: sync, 
			loadParams: loadParams, 
			callback: ilib.bind(this, function (info) {
				if (!info) {
					info = {"Latn":{"nb":215,"nm":"Latin","lid":"Latin","rtl":false,"ime":false,"casing":true}};
					var spec = this.locale.getSpec().replace(/-/g, "_");
					ilib.ScriptInfo.cache[spec] = info;
				}
				ilib.data.scripts = info;
				this.info = script && ilib.data.scripts[script];
				if (options && typeof(options.onLoad) === 'function') {
					options.onLoad(this);
				}
			})
		});
	} else {
		this.info = ilib.data.scripts[script];
	}

};

/**
 * Return an array of all ISO 15924 4-letter identifier script identifiers that
 * this copy of ilib knows about.
 * @static
 * @return {Array.<string>} an array of all script identifiers that this copy of
 * ilib knows about
 */
ilib.ScriptInfo.getAllScripts = function() {
	var ret = [],
		script = undefined,
		scripts = ilib.data.scripts;
	
	for (script in scripts) {
		if (script && scripts[script]) {
			ret.push(script);
		}
	}
	
	return ret;
};

ilib.ScriptInfo.prototype = {
	/**
	 * Return the 4-letter ISO 15924 identifier associated
	 * with this script.
	 * @return {string} the 4-letter ISO code for this script
	 */
	getCode: function () {
		return this.info && this.script;
	},
	
	/**
	 * Get the ISO 15924 code number associated with this
	 * script.
	 * 
	 * @return {number} the ISO 15924 code number
	 */
	getCodeNumber: function () {
		return this.info && this.info.nb || 0;
	},
	
	/**
	 * Get the name of this script in English.
	 * 
	 * @return {string} the name of this script in English
	 */
	getName: function () {
		return this.info && this.info.nm;
	},
	
	/**
	 * Get the long identifier assciated with this script.
	 * 
	 * @return {string} the long identifier of this script
	 */
	getLongCode: function () {
		return this.info && this.info.lid;
	},
	
	/**
	 * Return the usual direction that text in this script is written
	 * in. Possible return values are "rtl" for right-to-left,
	 * "ltr" for left-to-right, and "ttb" for top-to-bottom.
	 * 
	 * @return {string} the usual direction that text in this script is
	 * written in
	 */
	getScriptDirection: function() {
		return (this.info && typeof(this.info.rtl) !== 'undefined' && this.info.rtl) ? "rtl" : "ltr";
	},
	
	/**
	 * Return true if this script typically requires an input method engine
	 * to enter its characters.
	 * 
	 * @return {boolean} true if this script typically requires an IME
	 */
	getNeedsIME: function () {
		return this.info && this.info.ime ? true : false; // converts undefined to false
	},
	
	/**
	 * Return true if this script uses lower- and upper-case characters.
	 * 
	 * @return {boolean} true if this script uses letter case
	 */
	getCasing: function () {
		return this.info && this.info.casing ? true : false; // converts undefined to false
	}
};
/**
 * Copyright © 2012-2014, JEDLSoft
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
 * @license
 */

/*
 * ilib-core-inc.js - metafile that includes a minimal set of other js files for the minimal build
 */

/* !depends
strings.js
resources.js
scriptinfo.js
*/
