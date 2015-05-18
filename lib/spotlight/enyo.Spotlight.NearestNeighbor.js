/**
 * enyo.Spotlight.NearestNeighbor definition
 * @author: Lex Podgorny
 */

enyo.Spotlight.NearestNeighbor = new function() {
	var _isInHalfPlane = function(sDirection, oBounds1, oBounds2, bCenterCheck) {
			if (bCenterCheck) {
				switch (sDirection) {
					case 'UP'    : return oBounds1.top + oBounds1.height / 2 > oBounds2.top  + oBounds2.height / 2;
					case 'DOWN'  : return oBounds1.top + oBounds1.height / 2 < oBounds2.top  + oBounds2.height / 2;
					case 'LEFT'  : return oBounds1.left + oBounds1.width / 2 > oBounds2.left + oBounds2.width  / 2;
					case 'RIGHT' : return oBounds1.left + oBounds1.width / 2 < oBounds2.left + oBounds2.width  / 2;
				}
			} else {
				switch (sDirection) {
					case 'UP'    : return oBounds1.top  >= oBounds2.top    +  oBounds2.height - 1;
					case 'DOWN'  : return oBounds1.top  +  oBounds1.height - 1 <= oBounds2.top;
					case 'LEFT'  : return oBounds1.left >= oBounds2.left   +  oBounds2.width - 1;
					case 'RIGHT' : return oBounds1.left +  oBounds1.width  - 1 <= oBounds2.left;
				}
			}
		},

		_getAdjacentControlPrecedence = function(sDirection, oBounds1, oBounds2) {
			var oPoints = _getAdjacentControlPoints(sDirection, oBounds1, oBounds2);
			return _getPrecedenceValue(oPoints, sDirection);
		},

		_getAdjacentControlPoints = function(sDirection, oBounds1, oBounds2) {
			switch (sDirection) {
				case 'UP'    :
				case 'DOWN'  :
					return _getYAxisPoints(sDirection, oBounds1, oBounds2);
				case 'LEFT'  :
				case 'RIGHT' :
					return _getXAxisPoints(sDirection, oBounds1, oBounds2);
			}
		},

		_getYAxisPoints = function(sDirection, oBounds1, oBounds2) {
			var x1, x2, y1, y2;

			y1 = (sDirection === 'UP')
				? oBounds1.top
				: oBounds1.top + oBounds1.height;

			y2 = (sDirection === 'UP')
				? oBounds2.top + oBounds2.height
				: oBounds2.top;

			if (oBounds1.left < oBounds2.left) {
				if (oBounds1.left + oBounds1.width <= oBounds2.left) {
					x1 = oBounds1.left + oBounds1.width + 1;
					x2 = oBounds2.left;
				} else {
					x1 = oBounds2.left;
					x2 = oBounds2.left;
				}
			} else {
				if (oBounds1.left >= oBounds2.left + oBounds2.width) {
					x1 = oBounds1.left;
					x2 = oBounds2.left + oBounds2.width + 1;
				} else {
					x1 = oBounds1.left;
					x2 = oBounds1.left;
				}
			}

			return [{x: x1, y: y1}, {x: x2, y: y2}];
		},

		_getXAxisPoints = function(sDirection, oBounds1, oBounds2) {
			var x1, x2, y1, y2;

			x1 = (sDirection === 'LEFT')
				? oBounds1.left
				: oBounds1.left + oBounds1.width;

			x2 = (sDirection === 'LEFT')
				? oBounds2.left + oBounds2.width
				: oBounds2.left;

			if (oBounds1.top < oBounds2.top) {
				if (oBounds1.top + oBounds1.height <= oBounds2.top) {
					y1 = oBounds1.top + oBounds1.height + 1;
					y2 = oBounds2.top;
				} else {
					y1 = oBounds2.top;
					y2 = oBounds2.top;
				}
			} else {
				if (oBounds1.top >= oBounds2.top + oBounds2.height) {
					y1 = oBounds1.top;
					y2 = oBounds2.top + oBounds2.height + 1;
				} else {
					y1 = oBounds1.top;
					y2 = oBounds1.top;
				}
			}

			return [{x: x1, y: y1}, {x: x2, y: y2}];
		},

		_getPrecedenceValue = function(oPoints, sDirection) {
			var delta    = _getDelta(oPoints[0], oPoints[1]),
				slope    = _getSlope(delta, sDirection),
				angle    = _getAngle(slope),
				distance = _getDistance(delta);

			return angle > 89 ? 0 : 1/(angle * Math.pow(distance, 4));
		},

		_getDelta = function(point1, point2) {
			return {
				dx: Math.abs(point2.x - point1.x),
				dy: Math.abs(point2.y - point1.y)
			};
		},

		_getCenterToCenterDistance = function(oBounds1, oBounds2) {
			var oCenter1 = {
					x: oBounds1.left + oBounds1.width  / 2,
					y: oBounds1.top  + oBounds1.height / 2
				},
				oCenter2 = {
					x: oBounds2.left + oBounds2.width  / 2,
					y: oBounds2.top  + oBounds2.height / 2
				},
				oDelta    = _getDelta(oCenter1, oCenter2),
				nDistance = _getDistance(oDelta);

				return nDistance;
		},

		_getSlope = function(delta, sDirection) {
			switch (sDirection) {
				case 'UP'    :
				case 'DOWN'  :
					return delta.dx/delta.dy;
				case 'LEFT'  :
				case 'RIGHT' :
					return delta.dy/delta.dx;
			}
		},

		_getDistance = function(delta) {
			return Math.pow(delta.dx*delta.dx + delta.dy*delta.dy, 0.5) || 0.1;
		},
		
		_getAngle = function(nSlope) {
			return Math.atan(nSlope) * 180/Math.PI || 0.1;
		};

	//* @public
	/**************************************************************/

	this.getNearestNeighbor = function(sDirection, oControl) {
		sDirection = sDirection.toUpperCase();
		oControl = oControl || enyo.Spotlight.getCurrent();

		// Check to see if default direction is specified
		var oNeighbor = enyo.Spotlight.Util.getDefaultDirectionControl(sDirection, oControl);
		if (oNeighbor && enyo.Spotlight.isSpottable(oNeighbor)) { return oNeighbor; }

		// If default control in the directin of navigation is not specified, calculate it

		var n,
			oBestMatch    = null,
			nBestMatch    = 0,
			nBestDistance = 0,

			oBounds1      = oControl.getAbsoluteBounds(),
			oBounds2      = null,
			o             = enyo.Spotlight.getSiblings(oControl),
			nLen          = o.siblings.length,
			oSibling      = null,
			nPrecedence,
			nDistance;

		for (n=0; n<nLen; n++) {
			oSibling = o.siblings[n];
			if (oSibling === oControl) { continue; }

			oBounds2 = oSibling.getAbsoluteBounds();

			// If control is in half plane specified by direction
			if (_isInHalfPlane(sDirection, oBounds1, oBounds2)) {
				// Find control with highest precedence to the direction
				nPrecedence = _getAdjacentControlPrecedence(sDirection, oBounds1, oBounds2);
				if (nPrecedence > nBestMatch) {
					nBestMatch    = nPrecedence;
					oBestMatch    = oSibling;
					nBestDistance = _getCenterToCenterDistance(oBounds1, oBounds2);
				} else if (nPrecedence == nBestMatch) {
					nDistance = _getCenterToCenterDistance(oBounds1, oBounds2);
					if (nBestDistance > nDistance) {
						nBestMatch    = nPrecedence;
						oBestMatch    = oSibling;
						nBestDistance = nDistance;
					}
				}
			}
		}
		return oBestMatch;
	};
};
