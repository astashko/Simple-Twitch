/**
 * enyo.Spotlight.Accelerator definition
 * @author: Lex Podgorny
 */

enyo.Spotlight.Accelerator = new function() {

	//* @protected
	/*************************************************************/

	var _nSkipped = 0,
		_nTime    = 0,
		_nKey     = 0;

	//* @public
	/*************************************************************/

	//* Firing configuration. At n-th second use every frequency[n] subsequent keydown event
	this.frequency = [3, 3, 3, 2, 2, 2, 1];

	//* Called from enyo.Spotlight, with current keydown event and Spotlight's callback
	//* Which will be called when an event is allowed through
	this.processKey = function(oEvent, fCallback, oContext) {
		switch (oEvent.type) {
			case 'keydown':
			case 'pagehold':
			case 'pageholdpulse':
				if (oEvent.keyCode != _nKey) {
					this.reset();
					_nTime = (new Date()).getTime();
					_nKey  = oEvent.keyCode;
					return fCallback.apply(oContext, [oEvent]);
				} else {
					var nElapsedTime = (new Date()).getTime() - _nTime,
						nSeconds     = Math.floor(nElapsedTime / 1000),
						nToSkip      = 0;

					nSeconds = nSeconds > this.frequency.length - 1
						? this.frequency.length - 1
						: nSeconds;

					nToSkip = this.frequency[nSeconds] - 1;
					if (nToSkip < 0) { nToSkip = 0; }

					if (_nSkipped >= nToSkip) {
						_nSkipped = 0;
						return fCallback.apply(oContext, [oEvent]);
					} else {
						_nSkipped ++;
						oEvent.preventDefault(); // Prevent skipped keydown events from bubbling
						return true;
					}
				}
				break;
			case 'keyup':
			case 'pagerelease':
				this.reset();
				return fCallback.apply(oContext, [oEvent]);
		}
	};

	this.reset = function() {
		_nSkipped = 0;
		_nTime    = 0;
		_nKey     = 0;
	};
};