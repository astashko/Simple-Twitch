/**
	An <a href="#enyo.Source">enyo.Source</a> subkind designed to support webOS ls2 services.
	Intended to be used internaly by <a href="#enyo.ServiceModel">enyo.ServiceModel</a>, this
	source kind includes support for on-device as well as mock service calls
*/

enyo.kind({
	name: "enyo.LS2Source",
	kind: "enyo.Source",
	/**
		The request is created and sent, saving the request object reference to the
		"request" property on the record.

		Fetch's options para may include a json with the following properties:
			params - parameters payload to be sent with the service request
			success - callback on request success
			fail - callback on request failure
	*/
	fetch: function(record, options) {
		var Kind = ((record.mock) ? enyo.MockRequest : enyo.ServiceRequest);
		var o = enyo.only(this._serviceOptions, record);
		record.request = new Kind(o);
		record.request.response(options.success);
		record.request.error(options.fail);
		record.request.go(options.params || {});
	},
	/**
		With service requests, fetch and commit share identical routes, so see the 
		above fetch function.
	*/
	commit: function(record, options) {
		//redirect to fetch as for services they're basically the same
		this.fetch(record, options);
	},
	destroy: function (record, options) {
		if(record && record.request && record.request.cancel) {
			record.request.cancel();
			record.request = undefined;
		}
	},
	//* @protected
	_serviceOptions: ["service", "method", "subscribe", "resubscribe", "mockFile"]
});
//* @protected
//add to store
enyo.store.addSources({service:"enyo.LS2Source"});
