/**
	_enyo.GridList_ extends <a href="#enyo.List">enyo.List</a>, allowing the
	display of multiple items per row, based on the available container width.
	Three rendering modes are supported: _fixedSize_, _fluidWidth_, and
	_variableSize_ (with or without normalization of rows).

	In _fixedSize_ mode, all items are of the same size, which may be configured
	upfront by setting the _itemWidth_ and _itemHeight_ properties at creation
	time.

	In _fluidWidth_ mode, all items are of the same size, but that size may grow
	or shrink to fit the available container width, while honoring the
	_itemMinWidth_ property.

	When the _itemWidth_ and _itemHeight_ are not known at creation time, you may
	set _normalizeRows_ to true and handle the _sizeupItem_ event to set the
	dimensions of each item at runtime.

		enyo.kind( {
			name: "App",
			components: [
				{
					name: "gridList",
					kind: "enyo.GridList",
					onSizeupItem: "sizeupItem",
					onSetupItem: "setupItem",
					itemMinWidth: 160,
					itemSpacing: 2,
					components: [
						{name: "img", kind: "enyo.Image"}
					]
				},
			],
			...
			//array of all item data
			_data: [],  // example: [{width: 100, height: 100, source: "http://www.flickr.com/myimage.jpg"},....]
			sizeupItem: function(inSender, inEvent) {
				var item = this._data[inEvent.index];
				inSender.setItemWidth(item.width);
				inSender.setItemHeight(item.height);
			},
			setupItem: function(inSender, inEvent) {
				var item = this._data[inEvent.index];
				this.$.img.setSrc(item.source);
				this.$.img.addStyles("width:100%; height: auto;");
				return true;
			}
			...
		});
*/

enyo.kind(
    {
        name: "enyo.GridList",
        kind: "enyo.List",
        classes: "enyo-gridlist",
        published: {
            /**
                Set to true if you want all items to be of same size with fluid
                width (percentage-based width depending on how many items can fit
                in the available container width while honoring _itemMinWidth_).
                The _sizeupItem_ event is not fired in this case.
            */
            itemFluidWidth: false,
            /**
                Set to true if you want all items to be of the same size, with
                fixed dimensions (configured by setting _itemWidth_ and _itemHeight_
                upfront). The _sizeupItem_ event is not fired in this case.
            */
            itemFixedSize: false,
            /**
                Minimum item width (in pixels). This is used to calculate the
                optimal _rowsPerPage_ (items per page) setting based on the
                available width of the container.
            */
            itemMinWidth: 160,
            /**
                Minimum item height (in pixels). This is used to calculate the
                optimal _rowsPerPage_ (items per page) setting based on the
                available width of the container.
            */
            itemMinHeight: 160,
            /**
                Width of each item (in pixels). The _sizeupItem_ event may be
                handled to set the width of each item at runtime. This value may
                be set upfront for all fixed-size items; for variable-sized
                items, any _itemWidth_ values set upfront will be ignored.
            */
            itemWidth: 160,
            /**
                Height of each item (in pixels). The _sizeupItem_ event may be
                handled to set the height of each item at runtime. This value
                may be set upfront for all fixed-size items; for variable-sized
                items, any _itemHeight_ values set upfront will be ignored.
            */
            itemHeight: 160,
            //* Spacing (in pixels) between GridList items.
            itemSpacing: 0,
            /**
                Set to true if you want the items in each GridList row to be
                normalized to the same height. If either _itemFluidWidth_ or
                _itemFixedSize_ is set to true, this setting will be ignored
                (i.e., rows will not be normalized for improved performance),
                since we already know that the items have the same height.
            */
            normalizeRows: false
        },
        horizontal: "hidden",
        events: {
            /**
                Fires once per item only in cases when items are NOT fluid-width
                or fixed-size at pre-render time.  This gives the developer an
                opportunity to set the dimensions of the item.

                _inEvent.index_ contains the current item index.
            */
            onSizeupItem: ""
        },
        /**
            Designed to be called after the GridList data is ready, this method
            sets the _count_ on the list and renders it. This is a convenience
            method that calls _setCount()_ and then _reset()_ on the List, so
            the developer does not have to invoke the two methods separately.
        */
        show: function(count) {
            this._calculateItemsPerRow();
            this.setCount(count);
            this.reset();
        },
        create: enyo.inherit(function(sup) {
            return function() {
                this._setComponents();
                sup.apply(this, arguments);
                this.itemFluidWidthChanged();
                this.itemFixedSizeChanged();
                this.itemMinWidthChanged();
                this.itemMinHeightChanged();
                this.itemWidthChanged();
                this.itemHeightChanged();
                this.itemSpacingChanged();
                this.normalizeRowsChanged();
                this.$.generator.setClientClasses("enyo-gridlist-row");
            };
        }),
        // Relays the published-property changes over to the GridFlyweightRepeater.
        itemFluidWidthChanged: function() {
            this.$.generator.itemFluidWidth = this.itemFluidWidth;
            this.setNormalizeRows(!this.itemFluidWidth && !this.itemFixedSize);
        },
        itemFixedSizeChanged: function() {
            this.$.generator.itemFixedSize = this.itemFixedSize;
            this.setNormalizeRows(!this.itemFluidWidth && !this.itemFixedSize);
        },
        itemWidthChanged: function() {
            this.$.generator.itemWidth = this.itemWidth;
        },
        itemHeightChanged: function() {
            this.$.generator.itemHeight = this.itemHeight;
        },
        itemMinWidthChanged: function() {
            var n = this.hasNode();
            if (n) {
                if (!this.itemMinWidth) {
                    this.itemMinWidth = 160;
                }
                this.itemMinWidth = Math.min(this.itemMinWidth, n.clientWidth);
            }
            this.$.generator.itemMinWidth = this.itemMinWidth;
        },
        itemMinHeightChanged: function() {
            var n = this.hasNode();
            if (n) {
                if (!this.itemMinHeight) {
                    this.itemMinHeight = 160;
                }
                this.itemMinHeight = Math.min(this.itemMinHeight, n.clientHeight);
            }
            this.$.generator.itemMinHeight = this.itemMinHeight;
        },
        itemSpacingChanged: function() {
            if (this.itemSpacing < 0) {
                this.itemSpacing = 0;
            }
            this.itemSpacing = this.itemSpacing;
            this.$.generator.itemSpacing = this.itemSpacing;
        },
        normalizeRowsChanged: function() {
            this.$.generator.normalizeRows = this.normalizeRows;
        },
        //* @protected
        bottomUpChanged: function() {
            //Don't let users change this (bottomUp is a published property of List but is not supported by GridList)
            this.bottomUp = false;
            this.pageBound = 'top';
        },
        //* @protected
        reflow: enyo.inherit(function(sup) {
            return function() {
                this._calculateItemsPerRow();
                sup.apply(this, arguments);
            };
        }),
        //* @protected
        _calculateItemsPerRow: function() {
            var n = this.hasNode();
            if (n) {
                this.itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemMinWidth + this.itemSpacing));
                var visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemMinHeight + this.itemSpacing));
                if (this.itemFixedSize || this.itemFluidWidth) {
                    var itemsPerRow = Math.floor((n.clientWidth - this.itemSpacing)/(this.itemWidth + this.itemSpacing));
                    var low = Math.floor(itemsPerRow);
                    var high = Math.ceil(itemsPerRow);
                    var gutter = n.clientWidth - this.itemSpacing - (high * (this.itemWidth + this.itemSpacing));
                    this.itemsPerRow = (gutter > 0) ? high : low;
                    visibleRows = Math.round((n.clientHeight - this.itemSpacing)/(this.itemHeight + this.itemSpacing));
                }
                // Make sure there's at least 1 item per row
                this.itemsPerRow = Math.max(1, this.itemsPerRow);
                this.rowsPerPage = 3 * this.itemsPerRow * visibleRows;
                this.$.generator.itemsPerRow = this.itemsPerRow;
            }
        },
        //* @protected
        _setComponents: function() {
            // TODO: The entire implementation of GridList needs an overhaul, but for now this ugly cloning is
            // needed to prevent the generator kind modification below from modifying enyo.Lists's generator
            this.listTools = enyo.clone(this.listTools);
            this.listTools[0] = enyo.clone(this.listTools[0]);
            this.listTools[0].components = enyo.clone(this.listTools[0].components);
            var c = this.listTools[0].components;
            // Create a dummy component to dynamically compute the dimensions of items at run-time (once for each item during sizeupItem) based on the actual content inside the item (only for variable sized items where sizeupItem is called).
            this.createComponent(new enyo.Component({name: "_dummy_", allowHtml: true, classes: "enyo-gridlist-dummy", showing: false}, {owner: this}));
            // Override List's listTools array to use GridFlyweightRepeater instead of FlyweightRepeater
            for (var i=0; i<c.length; i++) {
                if (c[i].name == 'generator') {
                    c[i] = enyo.clone(c[i]);
                    c[i].kind = "enyo.GridFlyWeightRepeater";
                    return;
                }
            }
        }
    }
);