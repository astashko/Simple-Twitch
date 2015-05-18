/**
	For simple applications, you might define all of your views in this file.  
	For more complex applications, you might choose to separate these kind definitions 
	into multiple files under this folder.
*/

enyo.kind({
	name: "simpletwitch.MainView",
	kind: "moon.Panels",
	classes: "moon enyo-fit",
	pattern:"activity",
	components: [
		{kind: "moon.Panels", classes: "enyo-fit", pattern: "alwaysviewing", popOnBack: true, components: [
		    {kind: "simpletwitch.SearchPanel"}
		]}
	]
});

enyo.kind({
	name: "simpletwitch.SearchPanel",
	kind: "moon.Panel",
	title: "Search Simple Twitch",
	titleBelow: "Enter search term above",
	headerOptions: {inputMode: true, dismissOnEnter: true},
	handlers: {
		onInputHeaderChange: "search"
	},
	search: function (inSender, inEvent) {
		this.$.resultList.collection.set("searchText", inEvent.originator.get("value"));
	},
	components: [{
		kind: "moon.DataGridList",
		fit: true,
		name: "resultList",
		minWidth: 250,
		minHeight: 300,
		components: [{
			kind: "moon.GridListImageItem",
			imageSizing: "cover",
			useSubCaption: false,
			centered: false,
			bindings: [
			    {from: ".model.title", to: ".caption"},
			    {from: ".model.thumbnail", to: ".source"}
			]
		}]
	}],
	headerComponents: [
	    {
	    	kind: "moon.Spinner",
	    	content: "Loading...",
	    	name: "spinner"
	    }
	],
	create: function() {
		this.inherited(arguments);
		this.set("photos", new simpletwitch.SearchCollection());
	},
	bindings: [
	    { from: ".photos", to: ".$.resultList.collection" },
	    { from: ".photos.loading", to: ".$.spinner.showing"}
	]
});

enyo.kind({
	name: "simpletwitch.DetailPanel",
	kind: "moon.Panel",
	layoutKind: "FittbaleColumnsLayout",
	components: [
	    {kind: "moon.Image", fit: true, sizing: "contain", name: "image"}
	],
	bindings: [
	    {from: ".model.title", to: ".title"},
	    {from: ".model.original", to: ".$.image.src"}
	]
});