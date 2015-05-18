enyo.kind({
	name: "simpletwitch.Source",
	kind: "enyo.JsonpSource",
	urlRoot: "https://api.twitch.tv/kraken/",
	fetch: function(rec, opts) {
		/*opts.headers = {
			"Client-ID": "66lofemq9aw0xrdsof4bz9e2uu1wp4c",
			"Accept": "application/vnd.twitchtv[.version]+json"
		};*/
		//opts.mimeType = "application/vnd.twitchtv[.version]+json";
		opts.params.api_version=3;
		//opts.params.client_id = "66lofemq9aw0xrdsof4bz9e2uu1wp4c";
		this.inherited(arguments);
	}
});

enyo.store.addSources({twitch: "simpletwitch.Source"});