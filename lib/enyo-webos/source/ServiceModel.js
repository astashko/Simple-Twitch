/**
	A webOS service version of <a href="#enyo.Model">enyo.Model</a> designed to allow
	for proper formatting of service parameters within the Enyo data layer.
	
	Includes support for mock services via the mock property.
	
	Fetch/commit commands may include a json with the following properties:
		params - JSON parameters payload to be sent with the service request
		success - callback on request success
		fail - callback on request failure
*/

enyo.kind({
	name: "enyo.ServiceModel",
	kind: "enyo.Model",
	defaultSource:"service",
	//* Luna service URI.  Starts with luna://
	service: "",
	//* Service method you want to call
	method: "",
	//* Whether or not the request to subscribe to the service
	subscribe: false,
	//* Whether or not the request should resubscribe when an error is returned
	resubscribe: false,
	//* If true, <a href="#enyo.MockRequest">enyo.MockRequest</a> will be used in place of enyo.ServiceRequest
	mock: false,
	//* Optionally specify the json file to read for mock results, rather than autogenerating the filepath
	mockFile: undefined,
	//* Outputs the model data in a payload form
	raw: function() {
		return {
			service:this.service,
			method:this.method,
			subscribe:this.subscribe,
			resubscribe:this.resubscribe,
			mock:this.mock,
			mockFile:this.mockFile
		};
	}
});
