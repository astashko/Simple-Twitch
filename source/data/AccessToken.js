enyo.kind({
	name: "simpletwitch.AccessToken",
	kind: "enyo.Model",
	defaultSource: "jsonp",
	readOnly: true,
	channelName: null,
	urlRoot: "https://jsonp.afeld.me/",
	attributes: {
		streamUrl: function() {
			return "http://usher.twitch.tv/api/channel/hls/" + this.channelName + ".m3u8?player=twitchweb&token=" + this.get("token") + "&sig=" + this.get("sig") + "&allow_audio_only=true&allow_source=true&type=any&p=1"
		}
	},
	computed: {
		streamUrl: ["sig"]
	},
	loadForChannel: function(channel) {
		this.channelName = channel.name;
		var url = "https://api.twitch.tv/api/channels/" + this.channelName + "/access_token";
		this.fetch({params: {url: url}});
	}
});