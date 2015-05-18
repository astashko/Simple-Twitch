/**
	_enyo.GridFlyweightRepeater_ extends
	<a href="#enyo.FlyweightRepeater">enyo.FlyweightRepeater</a>
	to lay out items in a grid pattern.
*/
enyo.kind({
	name: "enyo.GridFlyWeightRepeater",
	kind: "enyo.FlyweightRepeater",
	events: {
		/**
			Fires once per item at pre-render time, to determine the item's dimensions.

			_inEvent.index_ contains the current item index.

			_inEvent.selected_ is a boolean indicating whether the current item is selected.
		*/
		onSizeupItem: ""
	},
	itemsPerRow: 0,
	//* @protected
	_itemsFromPreviousPage: 0,
	generateChildHtml: function() {
		if (this.itemFluidWidth || this.itemFixedSize) {
			return this._generateChildHtmlEqualSizedItems();
		}
		return this._generateChildHtmlVariableSizedItems();
	},
	//* @protected
	_generateChildHtmlEqualSizedItems: function() {
		var cw = this.owner.hasNode().clientWidth;
		var cl = this.$.client, ht = "";
		var itemWidthPercent = 0, itemScaledWidth = this.itemWidth, itemScaledHeight = this.itemHeight;
		if (this.itemFluidWidth) {
			itemWidthPercent = 100/this.itemsPerRow;
			var totalMargin = 0;
			if (this.itemSpacing >= 0) {
				totalMargin = (this.itemsPerRow + 1) * this.itemSpacing;
				itemWidthPercent = 100/this.itemsPerRow - ((100 * totalMargin)/(this.itemsPerRow * cw));
			}
			itemScaledWidth = (itemWidthPercent/100)*cw;
			itemScaledHeight = itemScaledWidth * (this.itemHeight/this.itemWidth);
		}
		for (var i=this.rowOffset; i < this.rowOffset + this.count; i++) {
			// Setup each item
			cl.setAttribute("data-enyo-index", i);
			this.doSetupItem({index: i, selected: this.isSelected(i)});
			if (this.itemFluidWidth) {
				cl.addStyles("width:" + itemWidthPercent + "%;height:" + itemScaledHeight + "px;");
			} else {
				cl.addStyles("width:" + this.itemWidth + "px;height:" + this.itemHeight + "px;");
			}
			if (this.itemSpacing >= 0) {
				cl.addStyles("margin-top:" + this.itemSpacing + "px; margin-left:" + this.itemSpacing + "px;");
				if (i % this.itemsPerRow == this.itemsPerRow-1) {
					cl.addStyles("margin-right:" + this.itemSpacing + "px;");
				} else {
					cl.addStyles("margin-right: 0px;");
				}
				// Add bottom margin for items in last row
				if (i >= this.count-this.itemsPerRow) {
					cl.addStyles("margin-bottom:" + this.itemSpacing + "px;");
				}
			}
			ht += cl.generateHtml();
			cl.teardownRender();
		}
		return ht;
	},
	//* @protected
	_generateChildHtmlVariableSizedItems: function() {
		this.index = null;
		var item = null;
		var cl = this.$.client;
		var cw = this.owner.hasNode().clientWidth;
		var w = 0, rw = 0, h = 0, rh = 0, raw = 0, rah = 0,  rowIndex = 0, itemW = 0, itemH = 0, w2h = this.itemMinWidth/this.itemMinHeight;
		var rows = [{index: 0, items: []}];
		var dummy = this.owner.$._dummy_.hasNode();
		var i, r;

		if (this.owner.page === 0) {
			this._itemsFromPreviousPage = 0;
		}
		var count = this.count + this._itemsFromPreviousPage;
		for (i=0, r = i + this.rowOffset - this._itemsFromPreviousPage; i < count; i++, r++) {
			itemW = 0;
			itemH = 0;
			this.doSizeupItem({index: r, selected: this.isSelected(r)});
			itemW = this.itemWidth;
			itemH = this.itemHeight;
			if (!itemW || itemW <= 0) {
				//Try setupitem
				this.doSetupItem({index: r, selected: this.isSelected(r)});
				dummy.innerHTML = cl.generateChildHtml();
				itemW = dummy.clientWidth;
				itemH = dummy.clientHeight;
			}
			if (!itemW || itemW <= 0) {
				//Use default values
				itemW = this.itemMinWidth;
				itemH = this.itemMinHeight;
			}
			if (!itemH || itemH <= 0) {
				itemH = this.itemMinHeight;
			}
			w2h = itemW/itemH;
			w = Math.min(itemW, cw);
			if (this.itemMinWidth && this.itemMinWidth > 0) {
				w = Math.max(itemW, this.itemMinWidth);
			}
			var lastRowInPage = (i == count - 1);
			h = w/w2h;

			rw += w;
			rh += h;

			item = {index: r, pageIndex: i, width: w, height: h};
			rows[rowIndex].items.push(item);
			if (!this.normalizeRows) {
				continue;
			}

			raw = rw/(rows[rowIndex].items.length);
			rah = rh/(rows[rowIndex].items.length);

			if (rw >= cw || lastRowInPage) {
				rows[rowIndex].avgHeight = rah;
				rows[rowIndex].index = rowIndex;

				// Spill over items collected so far on this page to next page if they don't scale well to fill up remaining gutter
				var itemsInRow = rows[rowIndex].items.length;
				var gutterPeritem = (cw-rw)/itemsInRow;

				// If remaining items in the row need to be stretched more than 50% of the avg item width in the row, ditch/spill them over into the next page
				this._itemsFromPreviousPage = 0;
				if ((lastRowInPage && gutterPeritem + raw > (1.5 * raw))) {
					// Remove all these items from this row and push them to next page
					this._itemsFromPreviousPage = itemsInRow;
					rows[rowIndex] = {avgHeight: 0, index: rowIndex, items: []};
					break;
				}
				this._normalizeRow(rows[rowIndex]);
				if (!lastRowInPage) {
					rowIndex++;
					rows[rowIndex] = { avgHeight: 0, index: 0, items: [] };
				}
				rw = rh = rah = raw = w = h = itemW = itemH = 0;
			}
		}
		dummy.innerHTML = "";

		// Now that we have completed normalization of items into rows and pages, we have the computed item widths and heights. Render the items now.
		var ht = "", clh = "";
		var row;
		for (i=0; i < rows.length; i++) {
			row = rows[i];
			if (!row.items || row.items.length===0) {
				continue;
			}
			for (var j=0; j < row.items.length; j++) {
				item = row.items[j];
				this.doSetupItem({index: item.index, selected: this.isSelected(item.index)});
				cl.setAttribute("data-enyo-index", item.index);
				cl.addStyles("width:" + item.width + "px;height:" + item.height + "px;");
				if (this.itemSpacing >= 0) {
					cl.addStyles("margin-top:" + this.itemSpacing + "px;margin-left:" + this.itemSpacing + "px;");
				}
				clh = cl.generateHtml();
				cl.teardownRender();
				ht += clh;
			}
		}
		return ht;
	},
	//* @protected
	// Normalizes items in each GridList row so that they maintain the correct (original) aspect ratio while ensuring the height of each item is the same.
	_normalizeRow: function(inRowData) {
		if (!this.normalizeRows) {
			return;
		}
		if (!inRowData.items || inRowData.items.length === 0) {
			return;
		}
		var cw = this.owner.hasNode().clientWidth;
		// Use avg height to scale heights of all items in row to the same height
		var item;
		var runningWidth = 0, nw = 0;
		var newWidths = "";
		var itemW = 0, itemH = 0, scale = 0, gutter = 0;
		var i;

		for (i=0; i < inRowData.items.length; i++) {
			item = inRowData.items[i];
			itemW = item.width;
			itemH = item.height;

			nw = Math.floor((inRowData.avgHeight/itemH) * itemW);
			newWidths += " " + nw;

			item.width = nw;
			item.height = inRowData.avgHeight;
			runningWidth += nw;
			if (this.itemSpacing >= 0) {
				// Spacing can range from 0-10px only - so cap at 10 - otherwise looks ugly
				runningWidth += this.itemSpacing;
				if (i==inRowData.items.length-1) {
					// Accomodate right margin on last item
					runningWidth += this.itemSpacing;
				}
			}
		}
		gutter = cw - runningWidth;

		// Now scale the whole row uniformly up or down depending on positive or negative width gutter
		scale = cw/(cw-gutter);//Math.abs(1 + gutter/clientWidth);
		runningWidth = 0;
		nw = 0;
		newWidths = "";
		for (i=0; i < inRowData.items.length; i++) {
			item = inRowData.items[i];
			itemW = item.width;
			itemH = item.height;

			nw = Math.floor(itemW * scale);
			newWidths += " " + nw;
			var nh = Math.floor(itemH * scale);
			item.width = nw;
			item.height = nh;

			runningWidth += nw;
			if (this.itemSpacing >= 0) {
				// Spacing can range from 0-10px only - so cap at 10 - otherwise looks ugly
				runningWidth += this.itemSpacing;
				if (i==inRowData.items.length-1) {
					// Accomodate right margin on last item
					runningWidth += this.itemSpacing;
				}
			}
		}
		gutter = cw - runningWidth;

		// Adjust the remaining spill over gutter to last item
		item = inRowData.items[inRowData.items.length-1];
		itemW = item.width;
		itemH = item.height;
		item.width = (itemW + gutter);
		item.height = itemH;
	}
});