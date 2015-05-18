enyo.kind({
    name: "ilib.sample.AdvDateFormatting",
    kind: "FittableRows",
    classes: "onyx ilib-onyx-sample enyo-fit",

    components: [
        {kind: "Scroller", fit: true, components: [
            {kind: "ilib.sample.ChooseTimeZone", name: "timeZonesSelector", label: rb.getString("Input Time Zone")},

            {content: rb.getString("Input Calendar"), classes: "ilib-onyx-sample-divider"},
            {kind: "onyx.PickerDecorator", components: [
                {},
                {name: "calendarType", kind: "onyx.Picker", onChange: "changedParameters"}
            ]},

            {kind: "FittableColumns", name: "datetimeParameters", components: [
                {kind: "FittableColumns", name: "regularDate", components: [
                    {style: "margin: 4px 6px 5px;", components: [
                        {content: rb.getString("Year"), classes: "ilib-onyx-sample-divider"},
                        {kind: "onyx.InputDecorator", alwaysLooksFocused: true, components: [
                            {kind: "onyx.Input", name: "year", placeholder: rb.getString("Enter year")}
                        ]}
                    ]},
                    {style: "margin: 4px 6px 5px;", components: [
                            {content: rb.getString("Month"), classes: "ilib-onyx-sample-divider"},
                            {kind: "onyx.PickerDecorator", components: [
                                {},
                                {name: "month", kind: "onyx.Picker", onChange: "changedParameters"}
                            ]}
                    ]},
                    {style: "margin: 4px 6px 5px;", components: [
                        {content: rb.getString("Day"), classes: "ilib-onyx-sample-divider"},
                        {kind: "onyx.PickerDecorator", components: [
                            {},
                            {name: "day", kind: "onyx.Picker"}
                        ]}
                    ]}
                ]},
                {style: "margin: 4px 6px 5px;", name: "julianDate", components: [
                    {content: rb.getString("Julian Day"), classes: "ilib-onyx-sample-divider"},
                    {kind: "onyx.InputDecorator", alwaysLooksFocused: true, components: [
                        {kind: "onyx.Input", name: "julianDay", placeholder: rb.getString("Enter julian day")}
                    ]}
                ]},
                {style: "width: 20px"},
                {components: [
                    {content: rb.getString("Time"), classes: "ilib-onyx-sample-divider"},
                    {kind: "onyx.TimePicker", name: "timePicker", style: "margin-top: -4px;"}
                ]},
                {style: "margin: 4px 6px 5px;", components: [
                    {content: rb.getString("Millisecond"), classes: "ilib-onyx-sample-divider"},
                    {kind: "onyx.InputDecorator", alwaysLooksFocused: true, components: [
                        {kind: "onyx.Input", name: "millisecond", placeholder: rb.getString("Enter milliseconds")}
                    ]}
                ]},
                {fit: true}
            ]},

            /* Header with selecting locale */
            {kind: "ilib.sample.ChooseLocale", name: "localeSelector"},
            {kind: "ilib.sample.ChooseTimeZone", name: "formatZonesSelector", label: rb.getString("Format Time Zone")},
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
            {content: " "},
            {kind: "onyx.Button", content: rb.getString("Apply"), ontap: "calcFormat", style: "vertical-align: bottom;", classes: "onyx-affirmative"},
        ]},

        {kind: "onyx.Groupbox", classes:"onyx-sample-result-box", components: [
            {kind: "onyx.GroupboxHeader", content: rb.getString("Format result:")},
            {name: "rtlResult", fit: true, content: "-", style: "padding: 10px"}
        ]}
    ],

    changedDate: function(inSender, inEvent) {
        if (inEvent.value)
            this.$.calendar.setValue(inEvent.value);
    },

    create: function() {
        this.inherited(arguments);
        this.initCalendars();
        this.updateParameters();
    },

    initCalendars: function() {
        var calendarList = ilib.Cal.getCalendars();
        if (calendarList.indexOf('julianday') < 0)
            calendarList.push('julianday');
        calendarList.sort();
        for (var i = 0; i < calendarList.length; ++i)
            this.$.calendarType.createComponent({content: calendarList[i], active: (calendarList[i] === 'gregorian')});
    },

    changedParameters: function(inSender, inEvent) {
        this.updateParameters();
    },

    updateParameters: function() {
        if (this.updateParametersProcessing)
            return;
        this.updateParametersProcessing = true;
        // Show/Hide julianday / year-month-day 
        this.$.regularDate.setShowing(this.$.calendarType.selected.content !== 'julianday');
        this.$.julianDate.setShowing(this.$.calendarType.selected.content === 'julianday');
        // Recalc calendar/sysres 
        var calendar = this.$.calendarType.selected.content || 'gregorian';
        var cal = ilib.Cal.newInstance({
            locale: this.$.localeSelector.getValue(),
            type: (calendar === "julianday") ? "gregorian" : calendar
        });
        var sysres = new ilib.ResBundle({
            name: "sysres",
            locale: this.$.localeSelector.getValue()
        });
        // Init Year
        if (this.$.year.getValue() == '') {
        	var d = ilib.Date.newInstance();
            this.$.year.setValue(d.getYears());
        }
        // Init/Refill Month
        var numMonths = cal.getNumMonths(parseInt(this.$.year.getValue(), 10) || 0);
        var prevSelectedValue = (this.$.month.getSelected() ? this.$.month.getSelected().value : 1);
        this.$.month.setSelected();
        this.$.month.destroyClientControls();
        var selected;
        for (var i = 1; i <= numMonths; ++i) {
            var monthName = sysres.getString(undefined, "MMMM"+ i +"-"+ calendar) || sysres.getString(undefined, "MMMM"+ i);
            var component = this.$.month.createComponent({content: i +' '+ monthName, value: i});
            if ((i === 1) || (i === prevSelectedValue))
                selected = component;
        }
        this.$.month.setSelected(selected);
        this.$.month.render();
        // Init/Refill Day
        var numDays = cal.getMonLength(this.$.month.getSelected().value, (parseInt(this.$.year.getValue(), 10) || 0));
        if (this.$.day.getClientControls().length !== numDays) {
            var prevSelectedValue = (this.$.day.getSelected() ? this.$.day.getSelected().value : 1);
            this.$.day.destroyClientControls();
            var selected;
            for (var i = 1; i <= numDays; ++i) {
                var component = this.$.day.createComponent({content: i, value: i});
                if ((i === 1) || (i === prevSelectedValue))
                    selected = component;
            }
            this.$.day.setSelected(selected);
            this.$.day.render();
        }
        this.updateParametersProcessing = false;
    },
    updateParametersProcessing: false,
           
    calcFormat: function(inSender, inEvent) {
        var options = {};
        var calendar = this.$.calendarType.selected.content || 'gregorian';
        var inputTimeZone = "local";
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
        	inputTimeZone = this.$.timeZonesSelector.getValue();
        if (this.$.formatZonesSelector.getValue() !== 'default')
            options['timezone'] = this.$.formatZonesSelector.getValue();
        
        // processing
        var cal = ilib.Cal.newInstance({
            locale: options['locale'],
            type: (calendar === "julianday") ? "gregorian" : calendar
        });
        var date;
        if (calendar === 'julianday')
            date = cal.newDateInstance({julianday: this.$.julianDay.getValue()});
        else {
            var time = this.$.timePicker.getValue();
            date = cal.newDateInstance({
            	timezone: inputTimeZone,
                year: this.$.year.getValue(),
                month: this.$.month.selected.value,
                day: this.$.day.selected.value,
                hour: time.getHours(),
                minute: time.getMinutes(),
                second: time.getSeconds(),
                millisecond: this.$.millisecond.getValue()
            });
        };
        //
        if (calendar !== 'gregorian' && calendar !== 'julianday')
            options.calendar = calendar;
        var fmt = new ilib.DateFmt(options);
        var postFmtData = fmt.format(date);
        // Output results
        this.$.rtlResult.setContent(postFmtData + ', '+ rb.getString('julian day: ') + date.getJulianDay() +', '+ rb.getString('unix time: ') + date.getTime());
    }
});
