enyo.kind({
	name: "simpletwitch.TopDota2StreamsCollection",
	kind: "enyo.Collection",
	model: "simpletwitch.TopDota2StreamsModel",
	defaultSource: "twitch",
	instanceAllRecords: true,
	published: {
		isFetching: false
	},
	url: "streams",
	parse: function(data) {
		return data && data.streams;
	},
    fetchNextItems: function(count) {
        var opts = { params: {}};
        opts.params.on_site = 1;
        opts.params.game = "Dota 2";
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

enyo.kind({
	name: "simpletwitch.TopDota2StreamsModel",
	kind: "enyo.Model",
	readOnly: true,
})