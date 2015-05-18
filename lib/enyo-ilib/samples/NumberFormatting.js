enyo.kind({
    name: "ilib.sample.NumberFormatting",
    kind: "FittableRows",
    classes: "onyx ilib-onyx-sample enyo-fit",
    
    components: [
        {kind: "Scroller", fit: true, components: [
            {kind: "FittableColumns", components: [
                /* Header with selecting locale */
                {kind: "ilib.sample.ChooseLocale", name: "localeSelector", onSelectedLocale: "setLocale"},
                {style: "width: 20px"},
                {kind: "onyx.Button", content: rb.getString("Apply"), ontap: "calcFormat", style: "vertical-align: bottom;", classes: "onyx-affirmative"},
                {fit: true}
            ]},
            {tag: "br"},
            
            {content: rb.getString("Type"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.RadioGroup", name: "type", onActivate: "buttonActivated", components: [
                {content: "number", active: true},
                {content: "percentage"},
                {content: "currency"}
            ]},


            {kind: "FittableColumns", components: [
                {components: [
                    {content: rb.getString("Max Frac Digits"), classes: "ilib-onyx-sample-divider"},
                    {kind: "onyx.InputDecorator", alwaysLooksFocused: true, components: [
                        {kind: "onyx.Input", name: "maxFractionDigits", placeholder: rb.getString("Enter number")}
                    ]}
                ]},
                {style: "width: 20px"},
                {components: [
                    {content: rb.getString("Min Frac Digits"), classes: "ilib-onyx-sample-divider"},
                    {kind: "onyx.InputDecorator", alwaysLooksFocused: true, components: [
                        {kind: "onyx.Input", name: "minFractionDigits", placeholder: rb.getString("Enter number")}
                    ]}
                ]},
                {fit: true}
            ]},
            
            
            {content: rb.getString("Rounding Mode"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.RadioGroup", name: "roundingMode", components: [
                {content: "up"},
                {content: "down"},
                {content: "ceiling"},
                {content: "floor"},
                {content: "half up", active: true},
                {content: "half down"},
                {content: "half even"},
                {content: "half odd"} 
            ]},
            
            {name: "numberParams", components: [
                {content: rb.getString("Style"), classes: "ilib-onyx-sample-divider"},
                {kind: "onyx.PickerDecorator", components: [
                    {},
                    {name: "styleOfNumber", kind: "onyx.Picker", components: [
                        {content: "standard", active: true},
                        {content: "scientific"}
                    ]}
                ]}            
            ]},
            
            {name: "currencyParams", components: [
                {content: rb.getString("Style"), classes: "ilib-onyx-sample-divider"},
                {kind: "onyx.PickerDecorator", components: [
                    {},
                    {name: "styleOfCurrency", kind: "onyx.Picker", components: [
                        {content: "common", active: true},
                        {content: "iso"}
                    ]}
                ]},
                
                {kind: "ilib.sample.ChooseCurrency", name: "currency"}
            ]},
                        
            {tag: "br"}
        ]},

        {kind: "onyx.Groupbox", classes:"onyx-sample-result-box", components: [
            {kind: "onyx.GroupboxHeader", content: rb.getString("Number")},
            {kind: "onyx.InputDecorator", alwaysLooksFocused: true, components: [
                {kind: "onyx.Input", name: "number", placeholder: rb.getString("Enter number")}
            ]}
        ]},
        {tag: "br"},
        {kind: "onyx.Groupbox", classes:"onyx-sample-result-box", components: [
            {kind: "onyx.GroupboxHeader", content: rb.getString("Format result:")},
            {name: "rtlResult", fit: true, content: "-", style: "padding: 10px"}
        ]}
    ],
    
    setLocale: function(inSender, inEvent) {
        if (this.$['currency'])
            this.$.currency.selectCurrency(this.$.localeSelector.getValue());
    },
    
    buttonActivated: function(inSender, inEvent) {
        this.updateParameters();
    },

    updateParameters: function() {
        this.$.numberParams.setShowing(this.$.type.getActive().content === 'number');
        this.$.currencyParams.setShowing(this.$.type.getActive().content === 'currency');
    },

    calcFormat: function(inSender, inEvent) {
        // Processing parameters
        var options = {
            locale: this.$.localeSelector.getValue(),
            type: this.$.type.getActive().content,
            roundingMode: this.$.roundingMode.getActive().content
        };
        if ((parseInt(this.$.maxFractionDigits.getValue(), 10) || 0) !== 0)
            options.maxFractionDigits = parseInt(this.$.maxFractionDigits.getValue(), 10);
        if ((parseInt(this.$.minFractionDigits.getValue(), 10) || 0) !== 0)
            options.minFractionDigits = parseInt(this.$.minFractionDigits.getValue(), 10);
        if (options.type === 'number')
            options.style = this.$.styleOfNumber.getSelected().content;
        if (options.type === 'currency') {
            options.style = this.$.styleOfCurrency.getSelected().content;
            options.currency = this.$.currency.getValue();
        }
        // Formatting
        var num = new ilib.Number(this.$.number.getValue());
        var fmt = new ilib.NumFmt(options);
        var postFmtData = fmt.format(num); 
        // Output results
        this.$.rtlResult.setContent(postFmtData);
    }
});
