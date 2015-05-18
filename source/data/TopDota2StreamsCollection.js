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
	loadStreams: function() {
		this.fetch({params: {
			limit: 20,
			offset: 0,
			game: "Dota 2",
			on_site: 1
		}})
	},
	parse: function(data) {
		return data && data.streams;
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