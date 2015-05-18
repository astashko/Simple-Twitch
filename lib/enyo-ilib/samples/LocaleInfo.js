enyo.kind({
    name: "ilib.sample.LocaleInfo",
    kind: "FittableRows",
    classes: "onyx ilib-onyx-sample enyo-fit",
    
    components: [
        {kind: "Scroller", fit: true, components: [
            /* Header with selecting locale */
            {kind: "ilib.sample.ChooseLocale", onSelectedLocale: "setLocale"},
            {tag: "br"},
            
            {kind: "onyx.Groupbox", classes:"onyx-sample-result-box", components: [
                {kind: "onyx.GroupboxHeader", content: rb.getString("Current Locale")},
                {name: "currentLocateData", classes:"onyx-sample-result"}
            ]}            
        ]}
    ],

    create: function() {
        this.inherited(arguments);
        /* Fill in info on current locale */
        this.printItemLocale(ilib.getLocale());
    },
    
    setLocale: function(inSender, inEvent) {
        /* Fill in info on selected locale */
        this.printItemLocale(inEvent.content);
    },

    printItemLocale: function(locale) {
        if (this.$['currentLocateData']) {
            this.$.currentLocateData.destroyComponents();
            this.$.currentLocateData.createComponent({content: "getLocale : "+ locale, style: "font-size: 16px"});
            var localeInfo = new ilib.LocaleInfo(locale);
            var str = JSON.stringify(localeInfo, null, ' ').replace(/"([^"]+)"/g, '$1').replace(/,$/mg, '');
            this.$.currentLocateData.createComponent({tag: "pre", fit: true, content: str, style: "font-size: 16px"});
            this.$.currentLocateData.render();
        }
    }
});
