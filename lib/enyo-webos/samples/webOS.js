enyo.kind({
	name: "enyo.webos.sample.webOS",
	classes: "onyx enyo-fit",
	kind:"enyo.Scroller",
	components: [
		{kind:"enyo.Signals", ondeviceready:"deviceready", onresume:"resume", onpause:"pause", onresize:"resize"},
		{name:"wrongPlatform", classes:"webos-sample", content:"webOS.js API not available on this platform", showing:false},
		{name:"apiDetails", classes:"webos-sample", components:[
			{classes: "webos-sample-divider", content: "Application API"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.fetchAppId"},
				{name:"appID", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.fetchAppInfo"},
				{name:"appInfo", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.fetchAppRootPath"},
				{name:"appPath", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{classes: "webos-sample-divider", content: "Device API"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.device"},
				{name:"deviceInfo", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{classes: "webos-sample-divider", content: "Extended Accelerometer API"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "navigator.accelerometer.setFastAccelerometer"},
				{classes:"webos-sample-result", content:"By default, the webOS accelerometer is limited to 4Hz. When you pass true to this function, it increases to 30Hz."}
			]},
			{tag:"br"},
			{classes: "webos-sample-divider", content: "Extended Notification API"},
			{classes: "webos-sample-tools", components: [
				{kind:"onyx.Button", content: "showToast", ontap:"showToast"},
				{kind:"onyx.Button", content: "removeToast", ontap:"removeToast"},
				{name:"dash", kind:"onyx.Button", content: "showDashboard", ontap:"showDashboard", showing:false}
			]},
			{tag:"br"},
			{classes: "webos-sample-divider", content: "Orientation API"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.orientation.getOrientation"},
				{kind: "onyx.MenuDecorator", style:"float:right;", onSelect: "orientationSelected", components: [
					{content: "setOrientation"},
					{kind: "onyx.Menu", components: [
						{content: "up"},
						{content: "down"},
						{content: "left"},
						{content: "right"},
						{content: "free"}
					]}
				]},
				{name:"orientation", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{classes: "webos-sample-divider", content: "Platform API"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.platform"},
				{name:"platformInfo", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{name:"vkSection", components:[
				{classes: "webos-sample-divider", content: "Virtual Keyboard API"},
				{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
					{kind: "onyx.GroupboxHeader", content: "Keyboard Type Constants"},
					{name:"vkTypes", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
				]},
				{tag:"br"},
				{classes: "webos-sample-tools", components: [
					{kind:"onyx.Button", content: "Show Keyboard", ontap:"showVK"},
					{kind:"onyx.Button", content: "Hide Keyboard", ontap:"hideVK"}
				]},
				{tag:"br"}
			]},
			{classes: "webos-sample-divider", content: "Window API"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.window.launchParams"},
				{name:"launchP", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "webOS.window.isActivated"},
				{name:"isAct", classes:"webos-sample-result", allowHtml:true, content:"&nbsp;"}
			]},
			{tag:"br"},
			{classes: "webos-sample-tools", components: [
				{kind:"onyx.Button", content: "Deactivate", ontap:"deactivate"},
				{kind:"onyx.Button", content: "New Card", ontap:"newCard"}
			]},
			{tag:"br"},
			{classes: "webos-sample-tools", components: [
				{name:"autoOffBtn", kind:"onyx.Button", content: "Block Screen Timeout", ontap:"noAutoOff"},
				{name:"lightbarBtn", kind:"onyx.Button", content: "Subtle Lightbar", ontap:"dimLightbar"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		if(window.webOS) {
			//Application API
			this.$.appID.setContent(webOS.fetchAppId());
			this.$.appInfo.setContent(enyo.json.stringify(webOS.fetchAppInfo(), null, "\t"));
			this.$.appPath.setContent(webOS.fetchAppRootPath());

			//Device API
			this.$.deviceInfo.setContent(enyo.json.stringify(webOS.device, null, "\t"));
			
			//Extended Notification API
			//Dashboard only available on old webOS 1-3
			this.toastIDs = [];
			if(webOS.notification.supportsDashboard()) {
				this.$.dash.show();
			}

			//Orientation API
			this.$.orientation.setContent(webOS.orientation.getOrientation());
			
			//Platform API
			this.$.platformInfo.setContent(enyo.json.stringify(webOS.platform, null, "\t"));

			//Virtual Keyboard API
			if(webOS.keyboard) {
				this.$.vkTypes.setContent("<ul><li>webOS.keyboard.types.text</li>" +
						"<li>webOS.keyboard.types.password</li>" +
						"<li>webOS.keyboard.types.search</li>" +
						"<li>webOS.keyboard.types.range</li>" +
						"<li>webOS.keyboard.types.email</li>" +
						"<li>webOS.keyboard.types.number</li>" +
						"<li>webOS.keyboard.types.phone</li>" +
						"<li>webOS.keyboard.types.url</li>" +
						"<li>webOS.keyboard.types.color</li></list>");
			} else {
				this.$.vkSection.hide();
			}

			//Window API
			this.$.launchP.setContent(enyo.json.stringify(webOS.window.launchParams(), null, "\t"));
		} else {
			this.$.apiDetails.hide();
			this.$.wrongPlatform.show();
		}
	},
	resume: function(inSender, inEvent) {
		this.$.isAct.setContent(webOS.window.isActivated() + "");
	},
	pause: function(inSender, inEvent) {
		this.$.isAct.setContent(webOS.window.isActivated() + "");
	},
	resize: function(inSender, inEvent) {
		this.$.orientation.setContent(webOS.orientation.getOrientation());
	},
	showToast: function(inSender, inEvent) {
		webOS.notification.showToast({message:"This is a toaster example!"}, enyo.bind(this, "toastShown"));
		return true;
	},
	toastShown: function(id) {
		if(id != null) {
			this.toastIDs.push(id);
		}
	},
	removeToast: function(inSender, inEvent) {
		if(this.toastIDs.length>0) {
			var id = this.toastIDs.pop();
			webOS.notification.removeToast(id);
		}
		return true;
	},
	showDashboard: function(inSender, inEvent) {
		//first argument can alternately be an html filepath
		//second argument is any html to be written to the dashboard
		var html = "<html><head></head><body style=\"" +
		((webOS.device.platformVersionMajor==3) ? "background-color: black;" : "") +
		"\"><h3 style=\"color:white;\">This is a sample dashboard window</body></html>";
		navigator.notification.showDashboard(undefined, html);
		return true;
	},
	orientationSelected: function(inSender, inEvent) {
		webOS.orientation.setOrientation(inEvent.selected.content);
		return true;
	},
	showVK: function(inSender, inEvent) {
		if(webOS.keyboard && !webOS.keyboard.isShowing()) {
			//can pass a keyboard type constant; no type will default to webOS.keyboard.types.text
			webOS.keyboard.forceShow();
		}
		return true;
	},
	hideVK: function(inSender, inEvent) {
		if(webOS.keyboard && webOS.keyboard.isShowing()) {
			webOS.keyboard.forceHide();
		}
		return true;
	},
	newCard: function(inSender, inEvent) {
		//first argument can alternately be an html filepath
		//second argument is any html to be written to the new card
		var html = "<html><head></head><body><h2>This is a sample new card.</body></html>";
		webOS.window.newCard(undefined, html);
		return true;
	},
	noAutoOff: function(inSender, inEvent) {
		if(!this.autoOffBlocked) {
			this.autoOffBlocked = true;
			this.$.autoOffBtn.setContent("Unblock Screen Timeout");
		} else {
			this.autoOffBlocked = false;
			this.$.autoOffBtn.setContent("Block Screen Timeout");
		}
		webOS.window.blockScreenTimeout(this.autoOffBlocked);
		return true;
	},
	dimLightbar: function(inSender, inEvent) {
		if(!this.lightbarDimmed) {
			this.lightbarDimmed = true;
			this.$.lightbarBtn.setContent("Restore Lightbar");
		} else {
			this.lightbarDimmed = false;
			this.$.lightbarBtn.setContent("Subtle Lightbar");
		}
		webOS.window.setSubtleLightbar(this.lightbarDimmed);
		return true;
	}
});