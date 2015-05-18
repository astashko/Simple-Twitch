enyo.kind({
	name: "simpletwitch.Player",
	bindings: [
	    {from: ".model.streamUrl", to: ".src"}
	],
	selectChannel: function (channel) {
		this.model.loadForChannel(channel);
	},
	create: function() {
		this.inherited(arguments);
		this.set("model", new simpletwitch.AccessToken());
	},
	kind: "moon.VideoPlayer", poster: "assets/video-poster.png"/*, autoplay: true, /*infoComponents: [
	                                                                                                                                                      			{kind: "moon.VideoInfoBackground", orient: "left", background: true, fit: true, components: [
	                                                                                                                                                      				{
	                                                                                                                                                      					kind: "moon.ChannelInfo",
	                                                                                                                                                      					channelNo: "13",
	                                                                                                                                                      					channelName: "AMC",
	                                                                                                                                                      					classes: "moon-2h", 
	                                                                                                                                                      					components: [
	                                                                                                                                                      						{content: "3D"},
	                                                                                                                                                      						{content: "Live"},
	                                                                                                                                                      						{content: "REC 08:22", classes: "moon-video-player-info-redicon "}
	                                                                                                                                                      					]
	                                                                                                                                                      				},
	                                                                                                                                                      				{
	                                                                                                                                                      					kind: "moon.VideoInfoHeader",
	                                                                                                                                                      					title: "Downton Abbey - Extra Title",
	                                                                                                                                                      					subTitle: "Mon June 21, 7:00 - 8:00pm",
	                                                                                                                                                      					subSubTitle: "R - TV 14, V, L, SC",
	                                                                                                                                                      					description: "The series, set in the Youkshire country estate of Downton Abbey, depicts the lives of the aristocratic Crawley famiry and"
	                                                                                                                                                      				}
	                                                                                                                                                      			]},
	                                                                                                                                                      			{kind: "moon.VideoInfoBackground", orient: "right", background: true, components: [
	                                                                                                                                                      				{kind:"moon.Clock"}
	                                                                                                                                                      			]}
	                                                                                                                                                      		], components: [
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.TooltipDecorator", components: [
	                                                                                                                                                      				{kind: "moon.ContextualPopupDecorator", components: [
	                                                                                                                                                      					{kind: "moon.Button", content: "Popup"},
	                                                                                                                                                      					{
	                                                                                                                                                      						kind: "moon.ContextualPopup",
	                                                                                                                                                      						classes: "moon-3h moon-6v",
	                                                                                                                                                      						components: [
	                                                                                                                                                      							{kind: "moon.Item", content:"Item 1"},
	                                                                                                                                                      							{kind: "moon.Item", content:"Item 2"},
	                                                                                                                                                      							{kind: "moon.Item", content:"Item 3"}
	                                                                                                                                                      						]
	                                                                                                                                                      					}
	                                                                                                                                                      				]},
	                                                                                                                                                      				{kind: "moon.Tooltip", floating:true, content: "I'm a tooltip for a button."}
	                                                                                                                                                      			]},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"},
	                                                                                                                                                      			{kind: "moon.IconButton", src: "$lib/moonstone/images/video-player/icon-placeholder.png"}
	                                                                                                                                                      		]*/
});