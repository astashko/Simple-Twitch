
enyo.kind({
    name: "ilib.sample.ChooseTimeZone",

    published: {
        "value": "default",
        label: rb.getString("Time Zone")
    },

    components: [
        {name: "tzheader", content: "", classes: "ilib-onyx-sample-divider"},
        {kind: "onyx.PickerDecorator", components: [
            {},
            {name: "timeZones", kind: "onyx.Picker", onChange: "setTimeZone", components: [
                {content: rb.getString("local"), active: true}
            ]}
        ]},
        {kind: "onyx.TimePicker", name: "timePickerFake", content: rb.getString("Time"), showing: false}
    ],

    create: function() {
        this.inherited(arguments);
        this.initTimeZones();
        this.$.tzheader.setContent(this.label.toString());
    },
    
    initTimeZones: function() {
        var timeZones = ilib.TimeZone.getAvailableIds();
        for (var i = 0; i < timeZones.length; ++i)
            this.$.timeZones.createComponent({content: timeZones[i]});
    },

    setTimeZone: function(inSender, inEvent) {
        this.setValue(inEvent.selected.content);
        this.bubble("onSelectedTimeZone", {content: inEvent.selected.content});
    }
});
