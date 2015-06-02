/* global enyo */

enyo.kind({
	name: "simpletwitch.TwitchRemoteCollection",
	kind: "enyo.Collection",
	defaultSource: "twitch",
	instanceAllRecords: true,
	published: {
		isFetching: false
	},
	parse: function(data) {
		return data && data.streams;
	},
    fetchNextItems: function(count) {
        var opts = { params: {}};
        opts.params.on_site = 1;
        opts.params.offset = opts.offset || this.length;
        opts.params.limit = count || 20;
        this.fetch(opts);
    },
	fetch: function (opts) {
		this.set("isFetching", true);
		return this.inherited(arguments);
	},
	didFetch: function() {
		this.inherited(arguments);
		this.set("isFetching", false);
	},
	didFail: function() {
		this.inherited(arguments);
		this.set("isFetching", false);
	}
});