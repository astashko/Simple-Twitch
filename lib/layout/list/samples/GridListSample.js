enyo.kind({
	name: "enyo.sample.GridListSample",
	classes: "enyo-unselectable enyo-fit onyx",
	kind: "FittableRows",
	components: [
		{kind: "onyx.Toolbar", classes: "onyx-toolbar onyx-toolbar-inline", components: [
			{kind: "onyx.InputDecorator", components: [
				{name: "searchInput", kind: "onyx.Input", value: "Hurricane", placeholder: "Enter seach term"},
				{kind: "Image", src: "assets/search-input-search.png", style: "width: 20px;"}
			]},
			{name: "sizeToggle", kind: "onyx.RadioGroup", components: [
				{content: "Fixed Size", ontap: "setSizeFixed"},
				{content: "Variable Size", active: true, ontap: "setSizeVariable"},
				{content: "Fluid Size", ontap: "setSizeFluid"}
			]},
			{content: "Spacing", style: "margin-left: 100px;"},
			{name:"tileSpacingSlider", kind:"onyx.Slider", onChange: "tileSpacingChanged", style:"width:400px;", value: 40}
		]},
		{
			name: "list",
			kind: "enyo.GridList",
			fit:true,
			onSetupItem: "setupItem",
			onSizeupItem: "sizeupItem",
			style: "background:#000;",
			normalizeRows: true,
			itemMinWidth: 160,
			itemMinHeight: 160,
			itemSpacing: 8,
			components: [
				{name: "tile", kind: "enyo.GridListImageItem"}
			]
		}
	],
	rendered: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.search();
		};
	}),
	setSizeFixed: function() {
		this.$.list.setItemFixedSize(true);
		this.$.list.setItemFluidWidth(false);
		this.$.list.setItemWidth(160);
		this.$.list.setItemHeight(160);
		this.$.list.show(this.results.length);
	},
	setSizeVariable: function() {
		this.$.list.setItemFixedSize(false);
		this.$.list.setItemFluidWidth(false);
		this.$.list.show(this.results.length);
	},
	setSizeFluid: function() {
		this.$.list.setItemFluidWidth(true);
		this.$.list.setItemFixedSize(false);
		this.$.list.show(this.results.length);
	},
	search: function() {
		// Capture searchText and strip any whitespace
		var searchText = this.$.searchInput.getValue().replace(/^\s+|\s+$/g, '');
		if (searchText === "") {
			// For whitespace searches, set new content value in order to display placeholder
			this.$.searchInput.setValue(searchText);
			return;
		}
		this.searchFlickr(searchText);
	},
	searchFlickr: function(inSearchText) {
		var params = {
			method: "flickr.photos.search",
			format: "json",
			api_key: '2a21b46e58d207e4888e1ece0cb149a5',
			per_page: 100,
			page: 0,
			text: inSearchText,
			sort: 'date-posted-desc',
			extras: 'url_m'
		};
		new enyo.JsonpRequest({url: "http://api.flickr.com/services/rest/", callbackName: "jsoncallback"}).response(this, "processFlickrResults").go(params);
	},
	processFlickrResults: function(inRequest, inResponse) {
		this.results = inResponse.photos.photo;
		this.$.list.show(this.results.length);
	},
	setupItem: function(inSender, inEvent) {
		return this.setupFlickrItem(inSender, inEvent);
	},
	setupFlickrItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.results[i];
		//console.log(item);
		if (!item.url_m) {
			return true;
		}
		this.$.tile.setSource(item.url_m);
		this.$.tile.setCaption(item.title);
		this.$.tile.setSelected(this.$.list.isSelected(i));
		return true;
	},
	sizeupItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.results[i];
		//this.log(item);
		this.$.list.setItemWidth(item.width_m);
		this.$.list.setItemHeight(item.height_m);
		return true;
	},
	tileSpacingChanged: function() {
		var spacing = Math.round(48 * this.$.tileSpacingSlider.value/100);
		this.$.list.setItemSpacing(spacing);
		this.$.list.show(this.results.length);
		return true;
	},
	getRelativeDateString: function(inDateString) {
		var d = new Date(inDateString);
		var td = new Date();
		var s;
		if (td.toLocaleDateString() == d.toLocaleDateString()) {
			var dh = td.getHours() - d.getHours();
			var dm = td.getMinutes() - d.getMinutes();
			s = dh ? dh + " hour" : (dm ? dm + " minute" : td.getSeconds() - d.getSeconds() + " second");
		} else {
			var dmo = td.getMonth() - d.getMonth();
			s = dmo ? dmo + " month" : td.getDate() - d.getDate() + " day";
		}
		return s.split(" ")[0] > 1 ? s + "s ago" : s + " ago";
	},
	generateRandomColor: function () {
		var bg = "#" + Math.random().toString(16).slice(2, 8);
		var fg = '#' + (Number('0x'+bg.substr(1)).toString(10) > 0xffffff/2 ? '000000' :  'ffffff');
		return {bg: bg, fg: fg};
	}
});
