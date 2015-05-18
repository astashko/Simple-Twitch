/**
 *  enyo.Spotlight.States
 *  @author: Lex Podgorny
 *
 *  Use enyo.Spotlight.States when need to save spotlight state (what is currently spotted) to spot again later
 *  A use case would be a model window that takes over spotlight interaction for the duration of being open. 
 *  To restore component that has been spotted before it opened, call enyo.Spotlight.push("mystackname")
 *  then, on window closed, call enyo.Spotlight.pop("mystackname") and previous state is restored.
 * 
 *  You can create as many stacks as needed and push as many states as necessary on each stack by specifying it's name or 
 *  component that keeps track of changes: enyo.Spotlight.push(this.id) => enyo.Spotlight.pop(this.id)
 *  
 *  In addition, you can specify the component that you want to be spotted on pop(), which if left blank, defaults to enyo.Spotlight.getCurrent()
 *
 *  To log changes in States, turn on verbose mode (see verbose() method)
 */

enyo.Spotlight.States = new function() {
	var _oStacks  = {},
		_bVerbose = false;
	
	var // Figure out string component id to push	
		_resolveComponentId = function(oComponentToSpotOnPop) {
			return (oComponentToSpotOnPop && oComponentToSpotOnPop.id)
				? oComponentToSpotOnPop.id
				: enyo.Spotlight.getCurrent().id;
		},
		
		// Has stack with this name been created?
		_stackExists = function(sStackName) {
			return typeof _oStacks[sStackName] != 'undefined';
		},
		
		// Logs string in verbose mode
		_log = function() {
			if (!_bVerbose) { return; }
			enyo.log('SPOTLIGHT STATES: ' + Array.prototype.slice.call(arguments, 0).join(' '));
		};
	
	/************** PUBLIC ***************/
	
	this.push = function(sStackName, /*optional*/ oComponentToSpotOnPop) {
		
		var sComponentId = _resolveComponentId(oComponentToSpotOnPop);

		// Create stack if it has not been created
		if (!_stackExists(sStackName)) {
			_oStacks[sStackName] = [];
		}
		
		// Push component id onto the stack
		_oStacks[sStackName].push(sComponentId);
		_log('Pushed', sComponentId, 'onto stack', sStackName + '[' + _oStacks[sStackName].length + ']');
	};
	
	this.pop = function(sStackName) {
		var sComponentId;
			
		if (!_stackExists(sStackName)) {
			throw 'Error in enyo.Spotlight.States: stack "' + sStackName + "' dose not exist, call push to create it";
		}
		
		if (_oStacks[sStackName].length > 0) {
			sComponentId = _oStacks[sStackName].pop();
			if (sComponentId) {
				enyo.Spotlight.spot(enyo.$[sComponentId]);
				_log('Popped', sComponentId, 'off stack', sStackName + '[' + _oStacks[sStackName].length + ']');
			}
		} else {
			enyo.warn('enyo.Spotlight.States.pop() has failed: Stack "' + sStackName + '" is empty');
		}
	};
	
	this.verbose = function(bVerbose) {
		_bVerbose = (typeof bVerbose == 'undefined') ? !_bVerbose : bVerbose;
		return 'SPOTLIGHT.STATES: verbose mode is ' + (_bVerbose ? 'ON' : 'OFF');
	};
};