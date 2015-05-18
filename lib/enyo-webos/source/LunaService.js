/**
	_enyo.LunaService_ is a component similar to <a href="#enyo.WebService">enyo.WebService</a>, but for
	LS2 service requests.

	Internally it generates new <a href="#enyo.ServiceRequest">enyo.ServiceRequest</a> for each `send()`
	call, keeping  track of each request made and sending out resulting events as they occur. This
	allows for multiple concurrent request calls to be sent without any potential overlap or gc issues.
*/

enyo.kind({
	name: "enyo.LunaService",
	kind: "enyo.Component",
	published: {
		//* Luna service URI.  Starts with luna://
		service:"",
		//* Service method you want to call
		method:"",
		//* Whether or not the request to subscribe to the service
		subscribe: false,
		//* Whether or not the request should resubscribe when an error is returned
		resubscribe: false
	},
	//* If true, <a href="#enyo.MockRequest">enyo.MockRequest</a> will be used in place of enyo.ServiceRequest
	mock: false,
	//* Optionally specify the json file to read for mock results, rather than autogenerating the filepath
	mockFile: undefined,
	events: {
		/**
			Fires when a response is received. Event data contains the returned response.
			The _originator_ property will contain the calling <a href="#enyo.ServiceRequest">enyo.ServiceRequest</a>.
		*/
		onResponse: "",
		/**
			Fires when an error is received. Event data contains the error data.
			The _originator_ property will contain the calling <a href="#enyo.ServiceRequest">enyo.ServiceRequest</a>.
		*/
		onError: "",
		/**
			Fires when a service request is complete (regardless of success or failure).
			Event data contains the response data and/or error data.
			The _originator_ property will contain the calling <a href="#enyo.ServiceRequest">enyo.ServiceRequest</a>.
		*/
		onComplete: ""
	},
	//* @protected
	noDefer: true, //needed for referencing to enyo.PalmService for compatability
	create: function() {
		this.inherited(arguments);
		this.activeRequests = [];
		this.activeSubscriptionRequests = [];
	},
	//* @public
	/**
		Sends a webOS service request with the passed-in parameters, returning the associated
		<a href="#enyo.ServiceRequest">enyo.ServiceRequest</a> instance.
	*/
	send: function(inParams) {
		inParams = inParams || {};
		var request = this.createComponent({
			kind: ((this.mock) ? "enyo.MockRequest" : "enyo.ServiceRequest"),
			service: this.service,
			method: this.method,
			subscribe: this.subscribe,
			resubscribe: this.resubscribe
		});
		if(this.mock && this.mockFile) {
			request.mockFile = this.mockFile;
		}
		request.originalCancel = request.cancel;
		request.cancel = enyo.bind(this, "cancel", request);
		request.response(this, "requestSuccess");
		request.error(this, "requestFailure");
		if(this.subscribe && !this.mock) {
			this.activeSubscriptionRequests.push(request);
		} else {
			this.activeRequests.push(request);
		}
		request.go(inParams);
		return request;
	},
	//* Cancels a given request.  The equivalent of `inRequest.cancel()`
	cancel: function(inRequest) {
		this.removeRequest(inRequest);
		inRequest.originalCancel();
	},
	//* @protected
	removeRequest: function(inRequest) {
		var i = -1;
		i = this.activeRequests.indexOf(inRequest);
		if (i !== -1) {
			this.activeRequests.splice(i, 1);
		} else {
			i = this.activeSubscriptionRequests.indexOf(inRequest);
			if (i !== -1) {
				this.activeSubscriptionRequests.splice(i, 1);
			}
		}
	},
	requestSuccess: function(inRequest, inResponse) {
		inResponse.originator = inRequest;
		this.doResponse(inResponse);
		this.requestComplete(inRequest, inResponse);
	},
	requestFailure: function(inRequest, inError) {
		inError.originator = inRequest;
		this.doError(inError);
		this.requestComplete(inRequest, inError);
	},
	requestComplete: function(inRequest, inData) {
		var i = -1;
		i = this.activeRequests.indexOf(inRequest);
		if (i !== -1) {
			this.activeRequests.splice(i, 1);
		}
		this.doComplete(inData);
	},
	destroy: function() {
		var i;
		for(i=0; i<this.activeRequests.length; i++) {
			this.activeRequests[i].originalCancel();
		}
		delete this.activeRequests;

		for(i=0; i<this.activeSubscriptionRequests.length; i++) {
			this.activeSubscriptionRequests[i].originalCancel();
		}
		delete this.activeSubscriptionRequests;
		this.inherited(arguments);
	}
});
enyo.PalmService = enyo.LunaService;
