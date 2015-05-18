enyo.Spotlight.Muter = new function() {
	var _oMutes = {},
		_nMutes = 0;

	this.addMuteReason = function(oSender) {
		if (typeof _oMutes[oSender.id] != 'undefined') { return; }

		if (_nMutes === 0) {
			var oCurrent = enyo.Spotlight.getCurrent();
			if (oCurrent) { oCurrent.removeClass('spotlight'); }
		}

		_oMutes[oSender.id] = 1;
		_nMutes ++;
	};

	this.removeMuteReason = function(oSender) {
		if (typeof _oMutes[oSender.id] == 'undefined') { return; }

		delete _oMutes[oSender.id];
		_nMutes --;

		if (_nMutes === 0) {
			var oCurrent = enyo.Spotlight.getCurrent();
			if (oCurrent) { oCurrent.addClass('spotlight'); }
		}
	};

	this.isMuted = function() {
		return _nMutes > 0;
	};
};