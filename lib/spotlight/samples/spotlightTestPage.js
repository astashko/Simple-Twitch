enyo.kind({
	name: 'moon.sample.SpotlightTest',
	classes: "moon",
	fit: false,
	components:[
		{kind: 'enyo.Spotlight'},
		{style: "position:relative;", components: [
			{kind: "moon.Button", content: "A", style: "top:20px; left:140px; width:300px;"},
			{name: "bigItem", kind: "moon.Button", content: "B", classes: "big-item", style: "top:100px; left:40px; width:1000px; height:40px;"},
			{kind: "moon.Button", content: "C", style: "top:200px; left:140px;"}
		]},
		{style: "position:relative;top:300px;left:100px;", components: [
			{kind: "moon.Button", content: "D", style: "top:140px; left:40px; width:40px; height:300px;"},
			{name: "bigItem2", kind: "moon.Button", content: "E", classes: "big-item", style: "top:40px; left:140px; width:40px; height:1000px;"},
			{kind: "moon.Button", content: "F", style: "top:140px; left:240px; width:40px; height:300px;"}
		]}
	]
});
