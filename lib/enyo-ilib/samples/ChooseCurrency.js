
enyo.kind({
    name: "ilib.sample.ChooseCurrency",

    published: {
        "value": ""
    },

    components: [
        {content: rb.getString("Currency"), classes: "ilib-onyx-sample-divider"},
        {kind: "onyx.PickerDecorator", components: [
            {},
            {name: "currencies", kind: "onyx.Picker", onChange: "setCurrency"}
        ]}
    ],

    create: function() {
        this.inherited(arguments);
        this.initCurrencies();
        this.value = this.$.currencies.selected.content;
    },
    
    initCurrencies: function() {
        var currencies = ilib.Currency.getAvailableCurrencies();
        var indexCC = -1;
        for (var i = 0; i < currencies.length; ++i) {
            this.$.currencies.createComponent({content: currencies[i]});
        }
        // pre-selects the current locale's currency
        this.selectCurrency();
    },
    
    selectCurrency: function(locale) {
        var li = new ilib.LocaleInfo(locale);
        var currency = li['info'].currency;
        var components = this.$.currencies.getClientControls();
        var selected;
        if (components[0])
            selected = components[0];
        for (var i = 0; i < components.length; ++i)
            if (components[i].content === currency) {
                selected = components[i];
                break;
            }
        this.$.currencies.setSelected(selected);
    },

    setCurrency: function(inSender, inEvent) {
        this.setValue(inEvent.selected.content);
        this.bubble("onSelectedCurrency", {content: inEvent.selected.content});
    }
});
