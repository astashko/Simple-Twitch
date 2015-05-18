/**
	For simple applications, you might define all of your models, collections,
	and sources in this file.  For more complex applications, you might choose to separate
	these kind definitions into multiple files under this folder.
*/

/*if(!enyo.AjaxProperties.callbackName) {
	enyo.AjaxProperties = "callback";
}*/

enyo.kind({
	name: "simpletwitch.Source",
	kind: "enyo.JsonpSource",
	urlRoot: "https://api.flickr.com/services/rest",
	fetch: function (rec, opts) {
		opts.callbackName = "jsoncallback";
		opts.params = enyo.clone(rec.params);
		opts.params.api_key = "2a21b46e58d207e4888e1ece0cb149a5";
		opts.params.format = "json";
		this.inherited(arguments);	
	},
	constructor: function () {
		this.inherited(arguments);
		this._ajaxOptions = enyo.clone(this._ajaxOptions);
		this._ajaxOptions.push("callbackName");
	}
});

enyo.store.addSources({flickr: "simpletwitch.Source"});

enyo.kind({
	name: "simpletwitch.SearchCollection",
	kind: "enyo.Collection",
	model: "simpletwitch.ImageModel",
	defaultSource: "flickr",
	options: {parse: true},
	published: {
		searchText: null,
		loading: false
	},
	searchTextChanged: function() {
		this.set("loading", true);
		var opts = {};
		thisRef = this;
		opts.success = opts.fail = function () {
			thisRef.set("loading", false);
		};
		this.empty();
		this.fetch(opts);
	},
	fetch: function(opts) {
		this.params = {
				method: "flickr.photos.search",
				sort: "interestingness-desc",
				per_page: 50,
				text: this.searchText
		};
		return this.inherited(arguments);
	},
	parse: function(data) {
		return data && data.photos && data.photos.photo;
	},
	empty: function () {
		var models = this.removeAll();
		for (var i = 0; i < models.length; i++) {
			if (models[i].destroyLocal) {
				models[i].destroyLocal();
			}
		}
	}
});

enyo.kind({
	name: "simpletwitch.ImageModel",
	kind: "enyo.Model",
	computed: {
		thumbnail: ["farm", "server", "id", "secret"],
		original: ["farm", "server", "id", "secret"]
	},
	attributes: {
	thumbnail: function() {
		return "https://farm" + this.get("farm") +
        ".static.flickr.com/" + this.get("server") +
        "/" + this.get("id") + "_" + this.get("secret") + "_m.jpg";
	},
	original: function() {
		return "https://farm" + this.get("farm") +
        ".static.flickr.com/" + this.get("server") +
        "/" + this.get("id") + "_" + this.get("secret") + ".jpg";
	}
	}
});