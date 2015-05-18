/**
 * enyo.Benchmark kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name: 'enyo.Benchmark',
	statics: {
		_aMeasures: {},
		begin: function(sKey) {
			if (typeof this._aMeasures[sKey] == 'undefined') {
				this._aMeasures[sKey] = [];
			}
			this._aMeasures[sKey].push({
				begin : (new Date()).getTime(),
				end   : 0
			});
		},

		end: function(sKey, bBroadcast) {
			this._aMeasures[sKey][this._aMeasures[sKey].length - 1].end = (new Date()).getTime();
			if (bBroadcast) {
				this.broadcast();
			}
		},

		get: function(sKey) {
			var nSum  = 0,
				n     = 0,
				nRuns = 0;

			for (; n<this._aMeasures[sKey].length; n++) {
				if (this._aMeasures[sKey][n].end !== 0) {
					nSum += (this._aMeasures[sKey][n].end - this._aMeasures[sKey][n].begin);
					nRuns ++;
				}
			}

			return {
				runs    : nRuns,
				total   : nSum,
				average : nSum/nRuns
			};
		},

		getAll: function() {
			var oResults = {};
			for (var sKey in this._aMeasures) {
				oResults[sKey] = this.get(sKey);
			}
			return oResults;
		},

		broadcast: function() {
			enyo.Signals.send('onBenchmark', {data: this.getAll()});
		}
	}
});