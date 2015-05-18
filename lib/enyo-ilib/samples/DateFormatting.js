// It's a hack that deletes enyo.g11n because the current version of enyo.g11n has some bugs in the enyo.g11n.Fmts
delete(enyo.g11n);

enyo.kind({
    name: "ilib.sample.DateFormatting",
    kind: "FittableRows",
    classes: "onyx ilib-onyx-sample enyo-fit",
    
    components: [
        {kind: "Scroller", fit: true, components: [
            {kind: "FittableColumns", components: [
                /* Header with selecting locale */
                {kind: "ilib.sample.ChooseLocale", name: "localeSelector"},
                {style: "width: 20px"},
                {kind: "onyx.Button", content: rb.getString("Apply"), ontap: "calcFormat", style: "vertical-align: bottom;", classes: "onyx-affirmative"},
                {fit: true}
            ]},
            
            {kind: "ilib.sample.ChooseTimeZone", name: "timeZonesSelector"},
            
            {kind: "FittableColumns", components: [
                {components: [
                    {content: rb.getString("Date"), classes: "ilib-onyx-sample-divider"},
                    {kind: "onyx.DatePicker", name: "datePicker"}
                ]},
                {style: "width: 20px"},
                {components: [
                    {content: rb.getString("Time"), classes: "ilib-onyx-sample-divider"},
                    {kind: "onyx.TimePicker", name: "timePicker"}
                ]},
                {fit: true}
            ]},
            
            {content: rb.getString("Length"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.RadioGroup", name: "length", components: [
                {content: "short"},
                {content: "medium"},
                {content: "long", active: true},
                {content: "full"},
            ]},
           {content: rb.getString("Type"), classes: "ilib-onyx-sample-divider"},
           {kind: "onyx.RadioGroup", name: "type", components: [
                {content: "date"},
                {content: "time"},
                {content: "datetime", active: true}
            ]},
            {content: rb.getString("Date"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.RadioGroup", name: "date", components: [
                {content: "dmwy"},
                {content: "dmy", active: true},
                {content: "dmw"},
                {content: "dm"},
                {content: "my"},
                {content: "dw"},
                {content: "d"},
                {content: "m"},
                {content: "n"},
                {content: "y"}
            ]},
            {content: rb.getString("Time"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.RadioGroup", name: "time", components: [
                {content: "ahmsz"},
                {content: "ahms"},
                {content: "hmsz"},
                {content: "hms"},
                {content: "ahmz"},
                {content: "ahm"},
                {content: "hmz", active: true},
                {content: "ah"},
                {content: "hm"},
                {content: "ms"},
                {content: "h"},
                {content: "m"},
                {content: "s"}
            ]},
            {content: rb.getString("Clock"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.RadioGroup", name: "clock", components: [
                {content: "12"},
                {content: "24"},
                {content: "locale", active: true}
            ]},
            {content: rb.getString("Native Digits"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.RadioGroup", name: "useNative", components: [
                {content: "false", active: true},
                {content: "true"}
            ]},
            {tag: "br"}
        ]},
        
        {kind: "onyx.Groupbox", classes:"onyx-sample-result-box", components: [
            {kind: "onyx.GroupboxHeader", content: rb.getString("Format result:")},
            {name: "rtlResult", fit: true, content: "-", style: "padding: 10px"}
        ]}
    ],
    
    calcFormat: function(inSender, inEvent) {
        var options = {};
        options['locale'] = this.$.localeSelector.getValue();
        options['length'] = this.$.length.getActive().content;
        options['length'] = this.$.length.getActive().content;
        options['type'] = this.$.type.getActive().content;
        options['date'] = this.$.date.getActive().content;
        options['time'] = this.$.time.getActive().content;
        if (this.$.clock.getActive().content !== 'locale')
            options['clock'] = this.$.clock.getActive().content;
        options['useNative'] = this.$.useNative.getActive().content === 'true';
        if (this.$.timeZonesSelector.getValue() !== 'default')
            options['timezone'] = this.$.timeZonesSelector.getValue();
        // processing    
        var cal = ilib.Cal.newInstance({
            locale: options['locale']
        });
        var dateCalendar = this.$.datePicker.getValue();
        var time = this.$.timePicker.getValue();
        var date = cal.newDateInstance({
            year: dateCalendar.getFullYear(),
            month: dateCalendar.getMonth() + 1,
            day: dateCalendar.getDate(),
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: time.getSeconds(),
            millisecond: 0,
            timezone: options['timezone']
        });
        var fmt = new ilib.DateFmt(options);
        var postFmtData = fmt.format(date);
        // Output results
        this.$.rtlResult.setContent(postFmtData + ', '+ rb.getString('julian day: ') + date.getJulianDay() +', '+ rb.getString('unix time: ') + date.getTime());
    }
});
