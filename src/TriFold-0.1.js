/** 
TriFold/src/TriFold-0.1.js
A responsive set-and-forget layout tool enabling consistent web app UIs.
Copyright 2013-2014 Nathan Ross (nrossit2@gmail.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var TriFold = function(behavior, leftDiv, centDiv, rightDiv) {
var TriFoldNameSpace = (function(window, document, navigator, console, library) {

function Debugger() { //#
	/*not set you so you can set it externally. because
	it's important that anyone debugging knows how to call
	this so it debugs from the start. We could set it 
	as a constructor param, but that would inconvenience
	library users as most won't be doing any dev. of this library.*/
	this.DEBUG = true; //#
	this.useDebugQueue = true; //#
	this.debugQueue = []; //#
} //#
var CSS_PREFIX = "tri-fold_";
var INLINE_CSS = false;

// ------- Begin Public Classes, Methods, and Fields ------------

//public fields and function calls you'll want as a user of this library
// are declared beginning here and until the next line..

//var TriFold = function(behavior, rootDiv, leftDiv, centDiv, rightDiv){
var TriFold = function(behavior, leftDiv, centDiv, rightDiv){
	_outerParent = document.createElement("div");
	behavior.resetToDefaults();
	_behavior = behavior;
	//_rootDiv = rootDiv;
	_leftDiv = leftDiv;
	_centDiv = centDiv;
	_rightDiv = rightDiv; 
	_LayoutManip = library.LayoutManip.prototype;
	_manips = [ new library.DefaultManip(this, 0), 
				new library.DefaultManip(this,1), 
				new library.DefaultManip(this,2)];
	window.manips = _manips;
	_constructComponents.call(this);
};

TriFold.prototype = {
addTo : function(rootDiv) { //E void (element)
	_outerParent.style.visibility = "hidden";
	rootDiv.appendChild(_outerParent);
	this.redraw();
	_outerParent.style.visibility = "visible";
	_onAdded.call(this);
},

// to avoid user confusion, by default changes to visual settings are
// (like padding size and margin) are structured so you can apply them
// as a group rather than incrementally. All changes are applied when
// A. on calls to display() or the more single-purpose redraw(). 
// B. the user resizes the window.
redraw : function()	{	//E void ()
	_scaler.resizeCallback(true); 
	// _slideLogic.redrawHorizontal();
},

// note that calling redraw() will not necessarily trigger TriFold to 
// confer with any behavior implementation (and retrieve possible 
// layout and manip changes). This is done because many resizes happen
// at once (unless the user has lazy desktop composition turned on) when
// resizing, TriFold is designed to support policies written in another
// language (like java for GWT), and callbacks to converted javascript 
// can be too expensive. The events that trigger behavior calls: 
// A. only resizes that change the number of columns that can be displayed.
// B. a call to simulateButtonPress(...) below - usually done by manips
// C. a call to reCheckBehavior() which is more explicit semantically
//		if you have behavior changes that can occur unrelated to the 
//		above two events.
// D. when provided with a behavior on startup or through setBehavior.
recheckBehavior : function()		//E void ()
	{ _evtMgr.behaviorEffect(); },
//getElement exists because need for resizeSensor to always be added
// after in final DOM position, combined with GWT's need for wrapper
// to be on DOM but off of GWT Dom Tree before it can be added as a widget
// (and it must be added as a widget or GWT will throw a cleanup exception)
addScaleCallback : function(cback) //E void (funct)
	{ _scaleCallbacks.push(cback); },
disableDefaultScaleCallback : function(disable) {	//E void (bool)
	_defaultScaleCallback = !(disable);
	if (disable) {
		for (var e,i=0;i<3;i++) {
			e = _el.colContentPlusBorder[i];
			e.style.removeProperty("transform");
			e.style.removeProperty("-ms-transform");
			e.style.removeProperty("-webkit-transform");
		}
	}
},
getElement : function()				//E element ()
	{ return _outerParent; },
getCol : function(colno)			//E element ()
	{ return _el["col" + colno.toString()][0]; },
setMinColDimensions : function(arr) //E void (float[])
	{ _scaler.xyMinColRes=arr.slice(0); _redrawStgChanged(); },
getMinColDimensions : function()	//E float[] ()
	{ return _scaler.xyMinColRes.slice(0); },
setPadding : function(arr)			//E void (float[])
	{ _scaler.quadPadding=arr.slice(0);  _redrawStgChanged(); },
getPadding : function()				//E float[] ()
	{ return _scaler.quadPadding.slice(0); },
setMargins : function(arr)			//E void (float[])
	{ _scaler.quadMargin=arr.slice(0);  _redrawStgChanged(); },
getMargins : function()				//E float[] ()
	{ return _scaler.quadMargin.slice(0); },
setColSpacing : function(dist)		//E void (float)
	{ _scaler.colSpacing = dist;  _redrawStgChanged(); },
getColSpacing : function()			//E float ()
	{ return _scaler.colSpacing; },
hide : function(doHide)				//E void (bool)
	{ _outerParent.style.visibility = (doHide)? "hidden":"visible"; },
setSlidespeed : function(duration)	//E void (int) 
	{ _slideLogic.setSlidespeed(duration); },
getSlidespeed : function()			//E int (void)
	{ return _slideLogic.getSlidespeed(); },
debugLog : function(msg) //# void ()
	{ _debugger.log(msg); }, //#
freeze : function() //# void ()
	{ _slideMotion._tween.freeze(); }, //#
printLogQueue : function() //# void()
	{ _debugger.printLogQueue(); }, //#
setBehavior : function(newBehavior) { //E void (behavior) 
	_behavior = newBehavior; //legacy. need to remove need for.
	_evtMgr.setBehavior(newBehavior);
},
setLayoutManip : function(colnum, replace) { //E void (int, LayoutManip)
	var ctrls = [library.LayoutManip.BUTTON_ONE, library.LayoutManip.BUTTON_TWO,
				library.LayoutManip.CONTAINER];
	for (var i=0;i<ctrls.length;i++)
	{ replace.setStatus(ctrls[i], _manips[colnum].getStatus(ctrls[i])); }
	_manips[colnum] = replace;
},
getLayoutManip : function(colnum)	//E LayoutManip ()
	{ return _manips[colnum]; },
// exposed to 1. allow devs  to test their own Behavior classes and 
// 2. externally create their own Manips with this as a callback.
simulateButtonPress : function(src, code) { //E void, (int, int)
	_debugger.log("buttonPress src:" + src.toString() + " code:" + //#
					code.toString()); //#
	_evtMgr.buttonPress(src,code);
},
setOpts : function(optobj) {	//E void {str:[...],...}
	for (var opt in optobj) {
		if (optobj.hasOwnProperty(opt) &&
			('set' + opt) in this) {
			(this['set' + opt]).apply(this,optobj[opt]);
		}
	}
},
//del : function()  TODO
//	{}
};

function _redrawStgChanged() {
	if (_eagerRedraw) 
	{ _scaler.resizeCallback(true); }
}

/* //todo for 0.3
TriFold.prototype.setSwitchbarSlidespeed = function(animSpeed) 
{ };
TriFold.prototype.getSwitchbarSlidespeed = function() 
{ return 100; }; */


// ------- End Public Classes, Methods, and Fields ------------
// ------- Begin Debugger class vars -----------

Debugger.prototype = {	//#
log : function(msg) { //# void (String)
	if (this.DEBUG === true) { //#
		if (this.useDebugQueue === true) { //#
			this.debugQueue.push(msg); //#
		} else { //#
			console.log("trfld:" + msg); //#
		} //#
	} //#
}, //#
//ensures all log lines are sequential
//as console.log can take unpredictable delay times
//that lead to async in log line output and also changed program
//behavior.
printLogQueue : function() { //# void ()
	this.debugQueue.reverse(); //#
	while (this.debugQueue.length > 0) { //#
		console.log("trfld:" + this.debugQueue.pop()); //#
	} //#
}}; //#

// -------  end Debugger class vars -----------
// -------  Begin (semantic) library-scope methods and fields -----------
// does not include semantically-private instance methods and fields for TriFold
// does not include class constructor functions, which are kept with their
//		respective class.

function pxToFloat(pxMeasure) 
	{ return parseFloat(pxMeasure.slice(0,-2)); }

function floatToPx(measure) 
	{ return (measure.toString() + "px"); }

//meant to accommodate IE toFixed() bug.
function floatFmt(value) { //# str(float)
	var precision = 1; //#
	var power = Math.pow(10, precision || 0); //#
	return String(Math.round(value * power) / power); //#
} //#

// -------  End library-scope methods and fields -----------
// -------  Begin TriFold private methods and fields -----------
//	although these are technically library scope (and are referenced as such)
//	semantically they're non-static and should exist as Tri-Fold private vars
//	to that extent, the more we reduce these by 0.2, the more de-coupled.
//	subclasses will be.

var _outerParent;
var _leftDiv;
var _centDiv;
var _rightDiv;
//var LayoutManip = TriFold.LayoutManip;
var _debugger = new Debugger(); //#
var _el = {};
var _slideMotion;
var _slideLogic;
var _animator;
var _evtMgr;
var _scaler;
var _behavior;
var _defaultScaleCallback = true;
var _scaleCallbacks = [];
//var _fade = false;
//var _rootDiv;
var _scale = 1;
var _colVisible = [false,false,false];
var _colIntended = [false,false,false];
var _manips;
var _deviceWrangler;
var _eagerRedraw = false;
var _LayoutManip = [];

function _onAdded() {
	var onPageLoadCallback = (function(that){
		_onAddedAndPageLoad.call(that);
	})(this);
	
	if(window.attachEvent) {
		window.attachEvent('onload', onPageLoadCallback);
	} else {
		if(window.onload) {
			var curronload = window.onload;
			var newonload = function() {
				curronload();
				onPageLoadCallback();
			};
			window.onload = newonload;
		} else {
			window.onload = onPageLoadCallback;
		}
	}
}
function _onAddedAndPageLoad() {
	var resizeCall = (function() {
		var onCall = function() {
			_scaler.resizeCallback(false);
		};
		return onCall;
	})();
	//window.addEventListener("resize", resizeCall, false);
	for (var i=0;i<3;i++) {
		if (_manips[i].isDefault) {
			_manips[i].isAddedToDom();
		}
	}
	library.ResizeSensor(_outerParent, resizeCall);
}

//TODO come up with a better solution to the early drawing bug.
function _constructComponents() {
	//having a set root element allows us to make queries
	//and resultant styling safe and much faster.
	//var elOuterParent = _rootDiv;
	//document.getElementById(_rootID);
	var builder = new WidgetBuilder();
	_debugger.log("building html scaffolding."); //#
	_el = builder.construct(CSS_PREFIX, _manips);
	
	//todo: do we need to "wait" for these? Is there any initialization problem
	//that prevents them from being constructed to no effect?
	
	_debugger.log("building slideMotion."); //#
	_slideMotion = new SlideMotion();
	this.slideMotion = _slideMotion; //# debugging only
	
	_debugger.log("building slideLogic."); //#
	_slideLogic = new SlideLogic(_slideMotion);
	_animator = _slideLogic;
	
	_debugger.log("building Event Manager."); //#
	_evtMgr = new EvtMgr(_behavior, _animator);
	_debugger.log("building Scaler."); //#
	_deviceWrangler = new DeviceWrangler();
	_scaler = new Scaler(_outerParent, _evtMgr, _animator);
}
// ------- Eegin TriFold private methods and fields -----------
// ------- Begin WidgetBuilder -----------
//	constructs TriFold HTML and CSS.

function WidgetBuilder() {
}
WidgetBuilder.prototype = {
_applyCss : function(e, directives) { // void (Element, String[][])
	for (var d=0; d<directives.length; d++) {
		e.style[directives[d][0]] = directives[d][1];
	}
},
//void (Element, String[], String[][])
_makeDiv : function(parent, classes, directives) { 
	var e = document.createElement("div");
	for (var i=0; i<classes.length; i++) {
		if (!(classes[i] in this.el))
			{ this.el[classes[i]] = []; }
		this.el[classes[i]].push(e);
		classes[i] = this.prefix + classes[i];
		//e.classList.add(classes[i]) 
		//FF doesn't support adding mult. at once.
	}
	e.className = classes.join(" ");
	parent.appendChild(e);
	if (INLINE_CSS)
	{ this._applyCss(e, directives); }
	return e;
},
//{String: Element[]}  (String, Element)
construct : function(prefix, manips) {
	//for only 1 kb, js construction will be way faster than extra HTTP request.
	//Todo: test just passing outerParent, there was a small bug w/
	//that last time, just do that one change and see regres. problems.
	var t = this;
	t.el = {};
	t.prefix=prefix;
	t._applyCss(_outerParent,[]);
	_outerParent.classList.add(prefix +"outerParent");
	
	var innerParent = t._makeDiv(_outerParent, ["innerParent"],[]);
	var relWrapper = t._makeDiv(innerParent, ["innerParentRel"],[]);
	var i, j, buttonNo, colname, columnPanel, colRel, colContent,
			colContentPlusBorder, switchBar, sbRel, button;
	for (i=0; i<3; i++) {
		colname = "col" + i.toString();
		columnPanel = t._makeDiv(relWrapper, [colname, "cols"], []);
		colRel = t._makeDiv(columnPanel, ["colRel"], []); 
		colContentPlusBorder = t._makeDiv(colRel, ["colContentPlusBorder"],
				[]);
		colContent = t._makeDiv(colContentPlusBorder, ["colContent"], []);
		
		switchBar = t._makeDiv(colContent, ["switchbar",
			"switchbar" + i.toString()], []);
		if (manips[i].isDefault) { //poor polymorphism. tofix next maint. rel.
			manips[i].addContainer(switchBar, _LayoutManip.HIDDEN);
		}
		sbRel = t._makeDiv(switchBar, ["switchbarRel"],[]);
		buttonNo = 0;
		for (j=0; j<3; j++) {
			if (i == j) { continue; }
			button = t._makeDiv(sbRel, ["switchbarBtn",
				"switchbarBtnSide" + buttonNo.toString(),
				"buttonCol" + j.toString()],[]);		
			if (manips[i].isDefault) {
				manips[i].addButton(button, _LayoutManip.ENABLED);
			}
			buttonNo++;
		}
		colContent.appendChild(
			(i === 0)? _leftDiv:((i === 1)? _centDiv:_rightDiv));
	}
	return t.el;
}
};

// ------- End WidgetBuilder -----------
// ------- Begin DefaultBehavior -----------
// ------- End DefaultBehavior -----------

// ------- Begin EvtMgr -----------
	
function EvtMgr(behavior, animator) {
//animation-type independent.
	this.animator = animator;
	this.availColumns = 0;	
	this._behavior = behavior;
	this._curLayout = [];
	this._curManipStatus = [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
	//this.curManipStatus = [[0,0,0],[0,2,2],[0,2,2]];
}

EvtMgr.prototype = {
_log : function(msg) { //# void (string)
	_debugger.log("EvtMgr:" + msg); //#
}, //#
avChange : function(newColAvail) {	// void (int)
	if (newColAvail == this.availColumns) { return; }
	this._behavior.onAvailChange(newColAvail);
	this.availColumns = newColAvail;
	this.behaviorEffect();
},
buttonPress : function(srcColumn, keycode) { // void (int, int)
	this._behavior.onManipUse(srcColumn, keycode);
	this.behaviorEffect();
},
setBehavior : function(newBehavior) { // void (behavior)
	this._behavior = newBehavior;
	this._behavior.onAvailChange(this.availColumns);
	this.behaviorEffect();
},
getLayout : function() 
	{ return this._curLayout; },
behaviorEffect : function() {
	var t = this;
	var i,j, newLayout, newManipStatus;
	// [manip][comp]
	newLayout = t._behavior.getLayout(t.availColumns);
	newManipStatus = t._behavior.getButtonStatus(t.availColumns);

	t._log("AV change: columns avail before: " + //#
						t._curLayout.length.toString() + //#
						" columns avail after:" + //#
						newLayout.length.toString()); //#
	//t._log("AVchange: buttonsBefore:" + buttonDebug(tmpButtons) //#
	//		+ " buttonsAfter:" + buttonDebug(newButtons)); //#
	//t._log("old manip:" + //#
	//	t.behavior._debugTwoDimArray(t.curManipStatus)); //#
	//t._log("new manip:" + //#
	//	t.behavior._debugTwoDimArray(newManipStatus)); //#
	
	for (i=0; i<3; i++) {
		for (j=0;j<3;j++) {
			if (newManipStatus[i][j] != t._curManipStatus[i][j]) {
				_manips[i].setStatus(j, newManipStatus[i][j]);
			}
		}
	} 
	
	t.animator.animate(t._curLayout,newLayout);
	t._curLayout = newLayout;
	t._curManipStatus = newManipStatus;
}
};


// ------- End EvtMgr -----------
// ------- Begin DeviceWrangler -------

//v.0.3 TODO enable: zoom-in by allowing scale >1 and calculating whether
// actual screen size is within epsilon of current actually used resolution
// from zoom * nominal resolution * DIP pixel issues (DIP complications
// are one reason this is a backburner task - other remaining tasks offer 
// higher usability return / man hour.)

function DeviceWrangler() {	
	//TODO better method than User-Agent. Mainly we're interested
	//in diagonal length in landscape mode (and thus readability)
	//and screen size in portrait mode (and thus elimination of margins)
	this._isPhone = (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
	if (this._isPhone) 
	{ _outerParent.className += " onPhone"; }
	
}
DeviceWrangler.prototype = {
getIsPhone : function() { return this._isPhone; }
};

// ------- End DeviceWrangler ------
// ------- Begin Scaler -----------

function Scaler(elOuterParent, evtMgr, animator) {
	var t = this;
	t.elOuterParent = elOuterParent;
	
	//todo: limited interface. maybe just pass callbacks? too functional? :|
	t.evtMgr = evtMgr;	//needed only for avChange();
	t.animator = animator;	//needed only for scaleAndClip();

	//scaler properties - todo: separate scaler func. from evtMgr.
	t.colSpacing = 10;
	t.xyMinColRes = [240, 400];
	t.quadMargin = [20,30,40,30];
	t.quadPadding = [18,12,15,12];
	t.availColumns = 0;
	t.scaleInitialized = false;
	t.lastXY = [0,0];
}

Scaler.prototype = {
_log : function(msg) { //#
	_debugger.log("scaler:" + msg); //#
}, //#
resizeCallback : function(manual) {
	var t = this;
	t._log("getting initial outerParent Width, Height"); //#
	var nowX = pxToFloat(getComputedStyle(t.elOuterParent).width);
	var nowY = pxToFloat(getComputedStyle(t.elOuterParent).height);
	if (isNaN(nowX) || isNaN(nowY)) { return; } //relContainer
	var now = [nowX, nowY];
	if (!manual) { 
		if (t.lastXY[0] == now[0] && t.lastXY[1] == now[1])
		{ return; }
	} 
	t.lastXY = now;
	var i;
	var X=0,Y=1;
	var NORTH=0, EAST=1, SOUTH=2, WEST=3;
	t._log(" ---- BEGIN RESIZE CALLBACK ----"); //#
	//mincolres:
	//the absolute minimum width and height necessary such that
	//an entire column's contents could be visible and readable
	//without a mash of pixels.
	
	var quadMargin = t.quadMargin;
	var quadPadding = t.quadPadding;
	if (_deviceWrangler.getIsPhone()) {
		quadMargin = [1,0,1,0];
		for(i=0;i<4;i++) {
			quadPadding[i] = t.quadPadding[i] * 0.8;
		}
		
	} 
	
	//width by height
	var k_tmp = nowX / nowY;
	var k_cols = [-1,-1,-1,-1];
	var x_min = [-1,-1,-1,-1]; //used to ensure that when the scale is brought up to 1,
										//the number of columns is correct for scale 1.
	var xyPaddingSum = 
			[quadPadding[WEST] + quadPadding[EAST],
			quadPadding[NORTH] + quadPadding[SOUTH]];
	var xyMarginSum = 
			[quadMargin[WEST] + quadMargin[EAST],
			quadMargin[NORTH] + quadMargin[SOUTH]];
	for (i=1; i<4; i++) {
		k_cols[i] = (t.xyMinColRes[X]*i + xyPaddingSum[X] + 
					(i-1)*t.colSpacing + xyMarginSum[X]) /
					(t.xyMinColRes[Y] + xyPaddingSum[Y] + xyMarginSum[Y]);
		x_min[i] = t.xyMinColRes[X]*i + xyPaddingSum[X] + 
					(i-1)*t.colSpacing + xyMarginSum[X];
	}
	//0.4 would mean I want 40% of the margin to be at the top.
	var reqNorth = (xyMarginSum[Y] === 0)? 0.5 : quadMargin[NORTH] / xyMarginSum[Y];
	var reqWest = (xyMarginSum[X] === 0)? 0.5 : quadMargin[WEST] / xyMarginSum[X];
	
	
	//calculating it without margin is to support cases where hardMinMargin == false.
	//if we allow hardMinMargin to be true, we should startcalculating it with margin.
	//remember: hardMinMargin is whether the margin stays in some cases of
	//extremely low resolution.
	//hardMinMargin = false doesn't mean there's never a hard margin, just that it's
	//only partially implemented. So for example, at tier two, even with hardMinMargin=false,
	//as its currently set up the screen would rather have a scrollbar and push the right margin
	//off the edge of the screen than decrease both margins (opposite of hardMinMargin, I'd imagine)
	//or bump down to tier one (which would be hardMinMargin behavior, if we added a situation
	//below where k_cols and k_tmp were calculated with margin.
	
	//eta: scratch former notes here, we're now calculating with margin for k_cols.
	//resultant behavior: hardMinMargin = true: screen will always bump down to lower tier
	// or, if it can't do that, scroll, than decrease margins past ratio. hardMinMargin = false:
	// that same behavior will occur in most cases, however in select cases where reducing axis
	// length brings the axis Below scale 1 limit, (Y axis) and (X-axis at tier 1) margins will
	// be decreased before scrolling. 
	var colnum;
	if (k_tmp < k_cols[2] || now[X] < x_min[2]) {
		colnum = 1;
	} else if (k_tmp < k_cols[3] || now[X] < x_min[3])  {
		if (k_tmp < (k_cols[2]*1.20) && 
				(t.availColumns == 1 ||
				t.availColumns == 2)) {
			colnum = t.availColumns;
		} else {
			colnum = 2;
		}
	} else {
		if (k_tmp < (k_cols[3]*1.20) && 
			t.availColumns >= 2) {
			colnum = t.availColumns;
		} else {
			colnum = 3;
		}
	}
	
	var inrvis = [t.xyMinColRes[X]*colnum + xyPaddingSum[X] + 
						(colnum-1)*t.colSpacing,
						t.xyMinColRes[Y] + xyPaddingSum[Y]];
	var scale1limit = [inrvis[X] + xyMarginSum[X], 
							inrvis[Y] + xyMarginSum[Y]];	
	var scale = 0;
	
	/* marginMin: at least this much length along this axis
	* is reserved such that a column or border never appears there as
	* long as the resolution is the same.
	* if you just resized horizontally inward, columns or borders
	* moving inward will be pushed ahead to not take up this margin's space.
	*
	* marginExtra: until a screen is resized, a border (and possibly 
	* column portion) might take up space in this area, but always on a 
	* temporary basis e.g. folding in. marginExtra is only ever greater
	* than 0 for one axis at a time, this is because marginExtra
	* is the result of the screen rarely being resized in
	* exact scaled proportion to the minimum resolution.
	*
	* when the user minimizes a column (if they can), activities might take
	* place in the new space that might normally occur within the margins
	* but for terminological purposes here, those would not be considered
	* part of marginMax because it's possible you could have stable padding
	* and column there. */
	
	var marginExtra = [0,0];
	var marginMin = [0,0];
	var hardMinMargin = false; //TODO: enable setting as param.
	
	if (now[X] <= scale1limit[X] || now[Y] <= scale1limit[Y]) {
		scale = 1;
	} else {
		scale = Math.min(
			now[X]/scale1limit[X], now[Y]/scale1limit[Y]);
	}
	
	var debugArgs1 = [now[X], now[Y], //#
			scale, scale1limit[X], scale1limit[Y], //#
			k_tmp, k_cols[2], k_cols[3], x_min[2], x_min[3], colnum, //#
			scale1limit[X]*scale, scale1limit[Y]*scale]; //#
	var debugDesc1 = ["now[X]", "now[Y]", //#
			"scale", "scale1limit[X]", "scale1limit[Y]",  //#
			"k_tmp", "k_cols[2]", "k_cols[3]", "x_min[2]", //#
			"x_min[3]", "colnum", "scale1limit[X]*scale",  //#
			"scale1limit[Y]*scale"]; //#
	for(i=0;i<debugArgs1.length; i++) {  //#
		t._log(debugDesc1[i] + ":\t" + floatFmt(debugArgs1[i])); //#
	} //#
	
	for (i=0;i<2;i++) { //better to do for i in [X, Y] ?
		if (now[i] <= scale1limit[i]) {
			if (i == X) { t._log("scale-limited by X or scale is 1"); } //#
			else { t._log("scale-limited by Y or scale is 1"); } //#
			marginExtra[i] = 0;
			if (!hardMinMargin && (i == Y || colnum == 1)) 
			{ marginMin[i] = Math.max(0,now[i] - scale*inrvis[i]); }
			else 
			{ marginMin[i] = scale*xyMarginSum[i]; }
		} else {
			marginMin[i] = scale*xyMarginSum[i];
			marginExtra[i] = now[i] - (scale*scale1limit[i]);
		}
	}

	var present = [false, false, false];
	var maxWidth = now[X] - (marginMin[X] + scale*xyPaddingSum[X]);
	//var usedWidth = inrvis[X]; 
	//currently an unused and misleadingly named value.
	if (t.scaleInitialized) {	//some scaling problems mean we need 
				//to set a reasonable scale before columns first start moving.
		if (t.availColumns != colnum) {
			t.evtMgr.avChange(colnum); 
		}
		t.availColumns = colnum;
		//todo: this is unnecessary: slideLogic, which has the reins on animate
		//should be able to provide t. OTOH, i like slideLogic being
		//with the exception of a few pass-throughs to slideMotion,
		//and the moveColSimple() calls themselves,
		//basically stand-alone.
		var curLayout = t.evtMgr.getLayout();  
		for (i=0; i<curLayout.length; i++)
			{present[curLayout[i]] = true; } 
			//depends on LEFT being 0, CENT being 1... etc. fix that.
	}
	
	var debugArgs2 = [marginMin[X], marginExtra[X], marginMin[Y], //#
			marginExtra[Y], scale,  //#
			reqWest, reqNorth, maxWidth, // usedWidth, //#
			scale*quadPadding[NORTH], scale*quadPadding[EAST],  //#
			scale*quadPadding[SOUTH], scale*quadPadding[WEST],  //#
			t.xyMinColRes[X], t.xyMinColRes[Y],  //#
			scale*t.colSpacing, present[0], present[1], present[2]]; //#
	var debugDesc2 = ["marginMin[X]", "marginExtra[X]", //#
			"marginMin[Y]", "marginExtra[Y]", "scale",  //#
			"reqWest", "reqNorth", "maxWidth", // "usedWidth", //#
			"scale*quadPadding[NORTH]", "scale*quadPadding[EAST]", //#
			"scale*quadPadding[SOUTH]", "scale*quadPadding[WEST]", //#
			"t.xyMinColRes[X]", "t.xyMinColRes[Y]", //#
			"scale*t.colSpacing", "present[LEFT]", //#
			"present[CENT]", "present[RIGHT]"]; //#
	for(i=0;i<debugArgs2.length; i++) { //#
		t._log(debugDesc2[i] + ":\t" + //#
			floatFmt(debugArgs2[i])); //#
	} //#
	_slideMotion.scaleAndClip( //dirty hack. todo: fix t.
			marginMin, marginExtra, scale, reqWest, reqNorth, 
			maxWidth, // usedWidth,
			[scale*quadPadding[NORTH], scale*quadPadding[EAST], 
			scale*quadPadding[SOUTH], scale*quadPadding[WEST]], 
			t.xyMinColRes, scale*t.colSpacing, present);
	if (!(t.scaleInitialized)) {
		t.evtMgr.avChange(colnum);
		t.availColumns = colnum;
		t.scaleInitialized = true;
	}

	t._log(" ---- END RESIZE CALLBACK ----"); //#
}
}; 


// ------- End Scaler -----------
// ------- Begin Feather Tween -----------
// bare bones light-weight tweening. way more performant for simple use cases
// than jQuery or tween.js

function FeatherTween() {
	this.unresolvedAnims = {};
	this.activeAnims = {};
	//some anims may be superceded but still be unresolved.
	this.animstepPause =3;
}

FeatherTween.prototype = {
FeatherTweenAnim: function(strkey, initval, endval, duration, startTime,
					stepCallback, completeCallback, cancelledCallback) {
	var t=this;
	t.strkey = strkey;
	t.initval = initval;
	t.endval = endval;
	t.duration = duration;
	t.startTime = startTime;
	t.stepCallback = stepCallback;
	t.completeCallback = completeCallback;
	t.cancelledCallback = cancelledCallback;
	//in case of odd browser timeout behavior we support a list.
	t.superceded = [];
	t.idnum = 0;
},
freeze : function() {	// void ()
	var strkey;
	for (strkey in this.activeAnims){
		if (this.activeAnims.hasOwnProperty(strkey)) { //keep checkers happy
			this.activeAnims[strkey] = -1;
		}
	}
},
_log : function(msg) //# void (String)
	{ _debugger.log("FeatherTween:" + msg); }, //#
getActiveAnim : function(strkey) // FeatherTweenAnim (string)
	{ return this.unresolvedAnims[strkey][this.activeAnims[strkey]]; },
animStep : function(anim) {	// void FeatherTweenAnim 
	//this._log("anim step called for strkey <" + strkey + ">"); //#
	if (anim.id == this.activeAnims[anim.strkey]) {
		var now = (new Date()).getTime();
		var timeD = Math.max(0,now - anim.startTime);
		var tweenDcomplete = anim.endval - anim.initval;
		var timeProportion = timeD/ anim.duration;
		if (timeProportion > 1) { timeProportion = 1; }
		var tweenD = anim.initval + (tweenDcomplete * timeProportion);
		//console.log("animStep: about to call //#
		//stepCallback for strkey " + strkey); //#
		//this._log("anim<"+ anim.strkey + //#
		//"> about to call step callback with tweenval " + floatFmt(tweenD)); //#
		anim.stepCallback(tweenD);
		//this._log("anim<" + anim.strkey + //#
		//	" called step callback successfully"); //#
		if (timeProportion < 1) {
			var that = this;
			//this._log("anim<" + strkey + //#
			// "called step callback successfully"); //#
			var wrap = function() { that.animStep(anim); };
			window.setTimeout(wrap, this.animstepPause);
		} else {
			anim.completeCallback();
			delete this.unresolvedAnims[anim.strkey][anim.id];
			delete this.activeAnims[anim.strkey];
		}
	} else {
		anim.cancelledCallback();
		delete this.unresolvedAnims[anim.strkey][anim.id];
	}
},	
//disables any other animations using the same strkey
// void (String, float, float, int, func, func, func)
startAnim : function(strkey, initval, endval, durationms,
					stepCallback, completeCallback, cancelledCallback) {
	var t = this;
	var newAnim = new (t.FeatherTweenAnim)(strkey, initval, endval, 
				durationms, (new Date()).getTime(), stepCallback, 
				completeCallback, cancelledCallback);
	if (!(strkey in t.activeAnims)) { t.activeAnims[strkey] = 0; }
	t.activeAnims[strkey] = (t.activeAnims[strkey] +1) % 1000;
	newAnim.id = t.activeAnims[strkey];
	if (!(strkey in t.unresolvedAnims)) {t.unresolvedAnims[strkey] = {}; }
	t.unresolvedAnims[strkey][newAnim.id] = newAnim;
	
	t.animStep(newAnim);
}
};

// ------- End Feather Tween -----------
// ------- Begin SlideMotion -----------

function SlideMotion() {
	var t = this;
	t._tween = new FeatherTween();
	t._scaletween = new FeatherTween();
	t._innerParentWidth = 1;
	t._innerParentMoving = 0;
	t._innerParentStart = 0;
	t._innerParentDest = 1;
	t._innerParentMajTimeFactor = 1;
	//these are the SCALED values. You can't just reach into
	//java for these.	
	t._colDest = [0,0,0];
	t._colSrc = [0,0,0];
	t._innerParentCapture = [false,false,false];
	t._colResizeParent = [true,true,true];
	t._colDestReached = [true,true,true];
	t._colFolding = [false, false, false];
	t._colMajTimeFactor = [1,1,1];
	t._columnEnds = [0,0,0];
	t._sequences = [];
	t._msPerPixel = 3;
	
	t.colZDest = [1,1,1];
	
	//todo, pass these in.
	t.elcol = [ _el.col0[0], _el.col1[0], _el.col2[0] ];
	t._elInnerParent = _el.innerParent[0];
	
	t._minMarginX=0;
	t._maxWidth = 1000;
	t._reqWest=0.5;
	t._padWest=0;
	t._exWest = 0;
	t._colX = 1;
	t._colSpacing = 1;
	t._slidespeed = 1000;
	t._scalespeed = 400;
}

SlideMotion.prototype = {
_log : function(msg) { //#
	_debugger.log("slideMotion:" + msg);	//#
},	//#
createSequence : function(srcs, tgt, add) {
	var msg = "stack sequence created of srcs: {" + srcs[0].toString(); //#
	if (srcs.length > 1) { msg = msg + ", " + srcs[1].toString();} //#
	msg = msg + "}, tgt " +tgt.toString() + " add " + add.toString(); //#
	this._log(msg); //#
	var newSequence = {};
	newSequence.srcs = srcs; //int[]
	newSequence.tgt = tgt; //int 
	newSequence.add = add; //bool
	
	//compensate for a limit in removing stack sequences at begin
	//normally scaling has permission to re-call move for a column
	//at any time (but will only do so for moving columns - not the
	//kind which are having other columns cover them or move away
	//from them) so we can't allow that to destoy stack sequences
	//for columns which plan to hide or appear after they move
	//into position. Instead calls of insert or remove have to replace
	//any old ones explicitly.
	if (srcs[0] == tgt && srcs.length == 1) {
		for (var i=0; i<this._sequences.length; i++) {
			if (this._sequences[i].tgt == tgt &&
				this._sequences[i].srcs.length == 1 &&
				this._sequences[i].srcs[0] == srcs[0]) {
				this._sequences.splice(i, 1);
				break;
			}
		}
	}
	this._sequences.push(newSequence);
},
_setVisible : function(colnum, isVisible) {

	this._log("setVisibleColumn colval " + colnum.toString() + //#
					" vis " + isVisible.toString()); //#
	if (isVisible) 
		{ this.elcol[colnum].style.zIndex = this.colZDest[colnum].toString();}
	else
		{ this.elcol[colnum].style.zIndex = "-1000"; }
	_colVisible[colnum] = isVisible;
},
_columnMoveComplete : function(colnum) {
	var t = this;
	var i=0;
	while(i<t._sequences.length) {
		var j = t._sequences[i].srcs.indexOf(colnum);
		if (j > -1) { 
			t._sequences[i].srcs.splice(j, 1);
			if (t._sequences[i].srcs.length === 0) {
				t._log("stack sequence complete for tgt column " + //#
						t._sequences[i].tgt.toString());	//#
				t._setVisible(t._sequences[i].tgt,
					((t._sequences[i].add == 1)? true:false));
				t._sequences.splice(i, 1);
			} else {
				i++;
			}
		} else {
			i++;
		}
		
	}
},
_changeOwnership : function(prevcol, newcol) {
	var t = this;
	for(var i=0; i<t._sequences.length;i++) {
		if (t._sequences[i].srcs.length == 1 && 
			t._sequences[i].srcs[0] == prevcol &&
			(t._sequences[i].tgt != prevcol)) {
			t._sequences[i].srcs[0] = newcol;
		}
	}
},
_columnMoveBegun : function(colnum) {
	var i=0;
	while(i<this._sequences.length) {
		if (this._sequences[i].tgt == colnum &&
				(this._sequences[i].srcs[0] != colnum)){
			this._sequences.splice(i, 1);
		} else {
			i++;
		}
		
	}
	
},
_centerInnerParent : function(newWidth) {
	//remember, maxWidth is the maximum innerParent width available
	//after already taking out minimum margins from the screen width
	var extraMarginXremain = this._maxWidth - newWidth;
	
	this._log("center Inner Parent ingredients: minMarginX:" + //#
		floatFmt(this._minMarginX) + " maxWidth:" + floatFmt(this._maxWidth) + //#
		" newWidth:" + floatFmt(newWidth) + " reqWest:" + //#
		floatFmt(this._reqWest) + " padWest:" + floatFmt(this._padWest)); //#
	// I initially put "+ this._padWest" here, but I'm preserving it here
	// to prevent that mistake happening again. Remember that padwest displaces
	// the actual div to the right by its length, instead of keeping the div
	// in place and existing in a layer over whatever is to the left of it.
	// so you don't need to account for it in the left margin.
	var marginWest = (this._minMarginX + (extraMarginXremain)) *
								this._reqWest; // + this._padWest;
	this._log("centerInner: setting left to " + //#
		floatFmt(marginWest)); //#
	this._elInnerParent.style.left = floatToPx(marginWest);
},
setSlidespeed : function(speed)	// void (float) 
	{ this._slidespeed = speed; },
getSlidespeed : function() // float ()
	{ return this._slidespeed; },
//TODO: SIMPLIFY THIS PROTOTYPE
//it's definitely an improvement from calling it from JSNI, but 
// it could still use work.
scaleAndClip : function(minMargin, extraMargin,
	scale,  reqWest, reqNorth, maxWidth, 
	scaledPadding, minCol, colSpacing, present) {		
	var t = this;
	//if not encasing columns in innerParent:
	//encasedWest = padWest + marginWest
	//encasedNorth = padNorth + marginNorth
	var X=0, Y=1;
	var WEST=3;
	var exWest = 0;
	var exNorth = 0;
	var colX = minCol[X] * scale;
	var colY = minCol[Y] * scale;
	var i;
	_scale = scale;
	
	t._minMarginX = minMargin[X];
	t._reqWest = reqWest;
	t._maxWidth = maxWidth;
	t._padWest = scaledPadding[WEST];
	t._exWest = exWest;
	t._colSpacing = colSpacing;
	var e;
	for (i=0;i<3;i++) {
		e = _el.colContentPlusBorder[i];
		e.style.height = floatToPx(minCol[Y]);
		e.style.width = floatToPx(minCol[X]);
		if (_defaultScaleCallback) {
			e.style.transform ="scale(" +
					scale.toString() + "," + scale.toString() + ")";
			e.style["-ms-transform:"] = "scale(" +
					scale.toString() + "," + scale.toString() + ")"; 
			e.style["-webkit-transform"] = 
				"scale(" + scale.toString() + "," + scale.toString() + ")"; 
		}
	}
	for (i=0;i<_scaleCallbacks.length;i++) {
		_scaleCallbacks[i](scale);
	}
	
	t._log("S&C: minColres.x*scale" + floatFmt(colX) + //#
			" minColres.y*scale" + floatFmt(colY) ); //#
	t._msPerPixel = t._slidespeed/(colX+colSpacing);
	t._log("S&C: ms Per pixel is " + floatFmt(t._msPerPixel)); //#
	
	//jsni array-passing limitations.
	_colIntended = present;
	if (!present[0]) { t._columnEnds[0] = 0; }
	if (!present[1]) { t._columnEnds[1] = 0; }
	if (!present[2]) { t._columnEnds[2] = 0; }
	
				
	var effectiveLeft = [0,0,0];
	var innerWidth = 1;
	var scaleratio = 1;
	if (t._colX != 1)
		{ scaleratio = (parseFloat(colX) / t._colX); }
	var expectInnerParentTrigger = false;
	for (i=0; i<3; i++) {
		t._log("S&C:analyzing column " + i.toString()); //#
		effectiveLeft[i] = scaleratio * pxToFloat(
			getComputedStyle(t.elcol[i]).left);
		if (isNaN(effectiveLeft[i])) { effectiveLeft[i] = 0; }
		if (t._colDestReached[i]) {
			//effectiveLeft[i] = colDest[i]*(colX+colspacing);
			t._log("S&C: column will be set to stationary " + //#
					"location at left:" + floatFmt(effectiveLeft[i])); //#
			if (effectiveLeft[i] + colX > maxWidth && !present[i]) {
				t._log("S&C: looks like column" + i.toString() + //#
				"is a middle column that is on its way to disappearing" + //#
				"and is going to be covered by another column."); //#
				t._setVisible(i, false);
			}
		} else {
			//todo possibly notate different operation on this
			//based on set dest pts.
			if (t._innerParentMoving == 1 && 
				t._innerParentCapture[i]) {
				//if window is resized to another tier while inner parent
				//is already moving, instead of jolting innerParent to 
				//a proportionate pos and dest, and then later have animation
				//set it to a correct pos and dest, better to just not set
				//it to proportional here if we know its dest will change
				//later anyway.
				expectInnerParentTrigger = true;
			}
			if (effectiveLeft[i] + colX > maxWidth) {
				effectiveLeft[i] = maxWidth - colX;
			}
			t._columnEnds[i] = effectiveLeft[i] + colX;
			t._log("S&C: column is in motion, and will be skip'd to " + //#
				floatFmt(effectiveLeft[i]) + " on its way to pos " + //#
				floatFmt(t._colDest[i]*scaleratio)); //#
		}
			/* we can't depend solely on this to determine inner Width, 
			 * until we develop a way to keep track of when a column has 
			 * _left_ a space but set resizeParent to no when it left 
			 * that space. Right now we're only able to track with where 
			 * a column is now, not where it was, so respecting 
			 * resizeParent=no just means trusting the former innerWidth 
			 * rather than purely calculating the correct one. */
		if ((effectiveLeft[i] + colX) > innerWidth &&
			//_colVisible[i] && 
			present[i] && t._colResizeParent[i]) {
			innerWidth = (effectiveLeft[i] + colX);
		}
	}
	

	
	
	if (t._innerParentMoving === 0) {
		if (_deviceWrangler.getIsPhone()){
			t._elInnerParent.style.width = floatToPx(maxWidth);
			t._innerParentDest = maxWidth;
		} else {
			t._elInnerParent.style.width = floatToPx(innerWidth);
		}
		
		t._log("S&C: innerParent is, at this new scale, set " + //#
				"to inner width" +  floatFmt(innerWidth)); //#
	} else if (!expectInnerParentTrigger) {	
		//console.log("S&C: innerParent is in motion, at current location " 
		//	+ floatToPx(skipTo) + " headed towards " + 
		//	floatToPx(innerParentDest*scale)); //#
		var skipTo = scaleratio*
			pxToFloat(getComputedStyle(t._elInnerParent).width);
		if (skipTo > maxWidth) { skipTo = maxWidth; }
		innerWidth = skipTo;
		t._clipInnerParent(t._innerParentStart*scaleratio, 
					t._innerParentDest*scaleratio, 
					skipTo, -1);
	} 
	for (i=0; i<3; i++) {
		if (t._colDestReached[i]) {
			t.elcol[i].style.left = 
				floatToPx(exWest+effectiveLeft[i]);
		} else {
			var srcPosition = t._colSrc[i]*scaleratio;
			var destPt = t._colDest[i]*scaleratio;
			t._log("S&C: scaling motion of moving column." + //#
				"New src position " + floatFmt(srcPosition) + //#
				" | new dest position " + floatFmt(destPt) + //#
				" effective Left " + floatFmt(effectiveLeft[i])); //#
			t.moveCol(i, srcPosition, destPt, 
				effectiveLeft[i], -1, 
				t.colZDest[i], t._colResizeParent[i]);
		}
	}
	//down here because the ratio of the new to the old is 
	//used to calculate hoz. scale ratio. TODO fix.
	t._colX = colX;
	t._centerInnerParent(innerWidth);
	t._elInnerParent.style.top = floatToPx(
								(minMargin[Y] + extraMargin[Y]) * reqNorth);
	t._elInnerParent.style.height = floatToPx(colY);
	for (i=0;i<4;i++) { scaledPadding[i] = floatToPx(scaledPadding[i]); }
	t._elInnerParent.style.padding = scaledPadding.join(" ");
	for (i=0; i<3; i++) {
		t.elcol[i].style.width = floatToPx(colX);
		t.elcol[i].style.height = floatToPx(colY);
		t.elcol[i].style.top = floatToPx(exNorth);
	}

	//if (!_initialScaleComplete) {
	//	_initialScaleComplete = true;
	//	if (_reqDisplay) {
	//		this._elInnerParent.style.visibility = "visible";
	//	}
	//}
},
moveColSimple : function(colnum,  
			endColPos, isPos, timeFactor, zEnd, resizeParent, folding) {
	var endPt;
	this._colFolding[colnum] = folding;
	this._log("FN: moveCol Simple called : colnum ; " + floatFmt(colnum) + //#
			" endcolPos" + floatFmt(endColPos) + " isPos:" + //#
			isPos.toString() + " minor time factor:" + //#
			floatFmt(timeFactor) + " zEnd" + floatFmt(zEnd) + //#
			" resizeParent:" + resizeParent.toString() +  //#
			" folding:" + folding.toString()); //#
	if (!isPos) {
		endPt = pxToFloat(getComputedStyle(this.elcol[endColPos]).left);
		//columnEnds[endColPos] - lcolX; 
	} else {
		endPt =endColPos*(this._colX + this._colSpacing);
	}
	var skipToPt = pxToFloat(getComputedStyle(this.elcol[colnum]).left);
	this._colSrc[colnum] = skipToPt;
	this._innerParentCapture[colnum] = false;
	this.moveCol(colnum, this._colSrc[colnum], endPt,
			skipToPt, timeFactor, zEnd, resizeParent); 
},
//grouped into one function for faster JIT priming. Probably best to
//change this in the future though.
_slideStepCallback : function(strkey, tweenval) {
	var t = this;
	var i=0;
	try {
	if (strkey.slice(0,-1) == "col") {
		var colnum = parseInt(strkey.slice(-1));
		
		//if (tweenval.toString().slice(-1) == "1") {
			t._log("ANIM*: movecol step. col:" + //#
			floatFmt(colnum) + "|pos:" + floatFmt(tweenval) + //#
			" |dest:" + floatFmt(t._colDest[colnum])); //# 
		//}
		//elcol[colnum].style["left"] = floatToPx(tweenval);
		t.elcol[colnum].style.left = floatToPx(tweenval);
		
		t._columnEnds[colnum] = tweenval + t._colX;

		var dests = [0];
		var ends = [];
		for (i=0; i<3; i++) {
			if (_colVisible[i]) {
				if (getComputedStyle(t.elcol[i]).zIndex > 1500)
				{ dests.push(t._colDest[i]); }
				ends.push(t._columnEnds[i]);
			}
		}
		
		var eventualPos = Math.max.apply(Math, dests) +t._colX;
		
		if (t._colFolding[colnum]) {
			var pos = -1;
			var externCol = -1;
			for (i=0;i<3;i++) {
				if (i != colnum && _colVisible[i] && 
					t._columnEnds[i] > pos &&
					parseInt(getComputedStyle(t.elcol[i]).zIndex) >
					parseInt(getComputedStyle(t.elcol[colnum]).zIndex)) {
					pos = t._columnEnds[i];
					externCol = i;
				}
			}
			if (externCol > -1) {
				//swap it while it's hot.
				t._changeOwnership(colnum, externCol);
				var durationC=Math.abs((pos-t._colX)-t._colSrc[colnum]) * 
					t._msPerPixel * t._colMajTimeFactor[colnum];
				
				t._tween.getActiveAnim(strkey).endval =
					(pos-t._colX);
				t._tween.getActiveAnim(strkey).duration =
					durationC;
				t._log("folding:setting dest pos of folding column " + //#
					colnum.toString() + //#
					" to position of column " + externCol.toString() + //#
					" which is " + (pos-t._colX).toString() + //#
					" from src " + t._colSrc[colnum].toString() + //#
					" at duration " + durationC.toString()); //#
				if (t._innerParentCapture[colnum]) {
				
					var durationI=Math.abs(
					pos-t._innerParentStart) * 
					t._msPerPixel * t._innerParentMajTimeFactor;
					t._innerParentDest = pos;
					t._tween.getActiveAnim("iPar").endval =
					(pos);
					t._tween.getActiveAnim("iPar").duration =
					durationI;
					t._log("folding: likewise adjusting width of " + //#
					"innerParent to dest pos of " +  pos.toString() +  //#
					"from src" + t._innerParentStart + //#
					" at duration " + durationI.toString()); //#
				}
			}
		}
		
		var isFarthestRight = (t._columnEnds[colnum] ==
			Math.max.apply(Math, ends));
		var notAtEventualPos = (Math.abs(eventualPos -
				t._innerParentDest) > 10);
		var notInControl = (t._innerParentMoving != colnum || 
				!(t._innerParentCapture[colnum]));
		var permissionToResize = (_colVisible[colnum] &&
						t._colResizeParent[colnum]);
		t._log("test For IP control: colnum " + colnum.toString() + //#
				" ColisFarthestRight:" + isFarthestRight.toString() + //#
				//causing problem with 2,0->0,1,2
				" IPnotAtEventualPos:" + notAtEventualPos.toString() + //#
				" ColnotInControl:" + notInControl.toString() + //#
				" permissionToResize:" + permissionToResize.toString() + //#
				" colResizeParent:" +  //#
				t._colResizeParent[colnum].toString()); //#
		if (isFarthestRight && notAtEventualPos &&
				notInControl && permissionToResize) {
			//there's definitely a more efficient way to
			//do this than checking the below for evey step
			//of the farthest right column during
			//times innerParent has reached its
			//dest width
			t._log("colnum " + colnum.toString() + " captured innerParent"); //#
			var ipstart;
			t._innerParentCapture[colnum] = true;
			t._innerParentMoving = colnum;
			
			ipstart = t._columnEnds[colnum]+5;
			
			//var ipend = colDest[colnum]+lcolX+10;
			
			t._log("ANIM: col " + floatFmt(colnum) + //#
				" is changing innerParentDest to " + floatFmt(eventualPos) + //#
				" for context, the columnEnds are: " + //#
				floatFmt(t._columnEnds[0]) + " ; " + //#
				floatFmt(t._columnEnds[1]) + " ; " + //#
				floatFmt(t._columnEnds[2])); //#

			var ensureOutpace = 30/29;
			if (eventualPos > ipstart) { ensureOutpace = 29/30; }
			t._innerParentMajTimeFactor = 
				ensureOutpace*t._colMajTimeFactor[colnum];
			//shouldn't we be using ipstart??
			t._clipInnerParent(t._innerParentStart, 
				eventualPos, ipstart, -1);
		}
	} else if (strkey == "iPar") {
		t._elInnerParent.style.width = floatToPx(tweenval);
		t._innerParentWidth = tweenval;		
		
		//if (tweenval.toString().slice(-1) == "1") {
			t._log("ANIM*: clipInnerParent. At position"  + //#
					floatFmt(tweenval) + " capture: " + //#
					t._innerParentCapture[0].toString() + "|" + //#
					t._innerParentCapture[1].toString() + "|" + //#
					t._innerParentCapture[2].toString() + " moving" + //#
					t._innerParentMoving.toString()); //#
		//}
		t._centerInnerParent(tweenval);
	}

	} catch(err) {
		t._log(" error at SlideStepCallback of name " + //#
				err.name + " and description " + err.message); //#
	}
},
_slideCompleteCallback : function(strkey) {
	var t = this;
	try {
		if (strkey.slice(0,-1) == "col") {
			var colnum = parseInt(strkey.slice(-1));
			if (t._colFolding[colnum]) {
				t._colDest[colnum] = 
					t._tween.getActiveAnim(strkey).endval;
			}
			t.elcol[colnum].style.left = 
					floatToPx(t._colDest[colnum]);
			t._columnEnds[colnum] = t._colDest[colnum] + t._colX;
			
			t._log("ANIM: movecol col:" + floatFmt(colnum) + //#
				" finished at left : " + floatFmt(t._colDest[colnum]) + //#
				" columnEnd is " + floatFmt(t._columnEnds[colnum]) + //#
				" setting Z to " + t.colZDest[colnum].toString()); //#
			t._colResizeParent[colnum] = true;
			t._colSrc[colnum] = t._colDest[colnum];
			t._colDestReached[colnum] = true;
			t.elcol[colnum].style.zIndex = 
					t.colZDest[colnum].toString();
			t._innerParentCapture[colnum] = false;
			t._columnMoveComplete(colnum);
		} else if (strkey == "iPar") {
			t._elInnerParent.style.width = 
					floatToPx(t._innerParentDest);
			t._innerParentStart = t._innerParentDest;
			t._innerParentMoving = -1;
			t._innerParentCapture = [false, false, false];
			t._log("ANIM: moveInnerParent finished at ~width " +  //#
					floatFmt(t._innerParentWidth)); //#
		//} else if (strkey.slice(0,-1) == "toggleBranch"){
		}
	} catch(err) {
		t._log(" error at SlideCompleteCallback of name " + //#
				err.name + " and description " + err.message); //#
	}
},
_slideFailureCallback : function(strkey) {	
},	
//Prime the JIT engine for these functions so there's 
// no jittery beginning to the engine in FF. 
// currently disabled, need to adjust to previous refactoring changes.
/* _prime = function() {
	var that = this;
	var wrapStep = function(tweenval) 
		{ that._slideStepCallback("primer", tweenval); };
	var wrapComplete = function() { that._slideCompleteCallback("primer"); };
	var wrapFail = function() { that._slideFailureCallback("primer"); };
	this._tween.startAnim("primer", 100, 500, 1000, wrapStep,
							wrapComplete, wrapFail);
}; */	
_clipInnerParent : function(startingPt, 
							endPt, skipToPt, minorTimeFactor) {
	var t = this;
	t._log("FN: clipInnerParent called with startingPt " + //#
			floatFmt(startingPt) + //#
			" endPt " + floatFmt(endPt) + //#
			" skipToPt " + floatFmt(skipToPt) + //#
			"and minorTimeFactor " + floatFmt(minorTimeFactor)); //#
	t._innerParentStart = startingPt;
	t._innerParentDest = endPt;
	var startFrom = startingPt;
	
	if (skipToPt >= 0) {
		t._elInnerParent.style.width = floatToPx(skipToPt);
		startFrom = skipToPt;
	}
	if (minorTimeFactor > 0) {
		t._innerParentMajTimeFactor =  minorTimeFactor*Math.min(
				(t._colX+t._colSpacing)/
				Math.max(Math.abs(endPt-startFrom),0.001), 1);
	}
	var duration=Math.abs(endPt-startFrom) * t._msPerPixel *
					t._innerParentMajTimeFactor;

	t._log("midfn: innerParent calculations: majTimeFact of: " + //#
			floatFmt(t._innerParentMajTimeFactor) + //#
			" duration of: " + floatFmt(duration) + //#
			" initpos of: " + floatFmt(startFrom)); //#
	if (Math.abs(endPt-startFrom) < 0.1) {	
		//deal with float math anomolies.
		t._slideStepCallback("iPar",endPt);
		t._slideCompleteCallback("iPar");
	} else {
		var that = this;
		var wrapStep = function(tweenval) 
			{ that._slideStepCallback("iPar", tweenval); };
		var wrapComplete = function() 
			{ that._slideCompleteCallback("iPar"); };
		var wrapFail = function() 
			{ that._slideFailureCallback("iPar"); };
		t._tween.startAnim("iPar", startFrom, endPt, duration, 
			wrapStep, wrapComplete, wrapFail);
	}
},
moveCol : function(colnum, 
			startingPt, endPt, skipToPt, minorTimeFactor, 
			zEnd, resizeParent) {
	//to make sure the rightmost column doesn't repeatedly call
	//the innerParent to animate again and again as its moving.
	var t = this;
	t._innerParentCapture[colnum] = false;
	
	t._colDestReached[colnum] = false;
	t._colDest[colnum] = endPt;
	t.colZDest[colnum] = zEnd;
	t._colResizeParent[colnum] = resizeParent;
	t._columnMoveBegun(colnum);
	
	var startFrom = startingPt;
	
	t._log("FN: moveCol called with colnum " + floatFmt(colnum) + //#
				" startingPt " + floatFmt(startingPt) + //#
				" endPt " + floatFmt(endPt) + //#
				" skipToPt " + floatFmt(skipToPt) + //#
				" minorTimeFactor " + floatFmt(minorTimeFactor) + //#
				" zEnd " + floatFmt(zEnd) + //#
				" resizeParent" + resizeParent.toString()); //#

	if (skipToPt >= 0) {
		t.elcol[colnum].style.left = floatToPx(skipToPt);
		startFrom=skipToPt;
	}
	
	if (minorTimeFactor > 0) {
		t._colMajTimeFactor[colnum] = minorTimeFactor*Math.min(
				(t._colX+t._colSpacing)/
				Math.max(Math.abs(endPt-startFrom),0.001), 1);
	}
	var duration=Math.abs(endPt-startFrom) * t._msPerPixel *
				t._colMajTimeFactor[colnum];

	t._log("midfn: movecol calculations: majTimeFact of: " + //#
			floatFmt(t._colMajTimeFactor[colnum]) + //#
			" duration of: " + floatFmt(duration) + //#
			" initpos of: " + floatFmt(startFrom)); //#
	if (Math.abs(endPt-startFrom) < 0.1 || 
			(minorTimeFactor < 0.01 && minorTimeFactor >=0)) {	
			//deal with float math anomolies.
		t._log("midfn:looks like the column is already there, or there" + //#
			"was a request for an instant move. Jumping column to endpt" + //#
			", and running through a step and a complete callback."); //#
		t._slideStepCallback("col" + colnum.toString(),endPt);
		t._slideCompleteCallback("col" + colnum.toString());
	} else {
		var that = this;
		var wrapStep = function(tweenval) 
			{ that._slideStepCallback("col" + colnum.toString(), tweenval); };
		var wrapComplete = function() 
			{ that._slideCompleteCallback("col" + colnum.toString()); };
		var wrapFail = function() 
			{ that._slideFailureCallback("col" + colnum.toString()); };
		t._tween.startAnim("col" + colnum.toString(), 
			startFrom, endPt, duration, wrapStep, wrapComplete, wrapFail);
	}
}
};


// ------- End SlideMotion -----------
//----------------------------------------------------------------
// ------- Begin SlideLogic -----------

function SlideLogic(slideMotion) {
	var t = this;
	t.slideMotion = slideMotion;
	
	t.fadespeed = 200;
	t.isFade = false;
	
	t._zLevelDefaultAdd = 2000;
	t._zLevelDefaultRemove = 1000;
	t._zLevelCurrentAdd = 2000;
	t._zLevelCurrentRemove = 1000;
	
	t._redrawCount = 0;
	t._endState = [];
	t._zDisappear = -2500;
	t._zShow = 2500;	
}

SlideLogic.prototype = {
_zRemove : function() // int ()
	{ this._zLevelCurrentRemove++; return this._zLevelCurrentRemove; },
_zAdd : function() // int ()
	{ this._zLevelCurrentAdd--; return this._zLevelCurrentAdd; },
contains : function(tier, key) // boolean (int[], int)
	{ return (tier.indexOf(key) > -1); },
_log : function(msg) //# void (string)
	{ _debugger.log("slideLogic:" + msg); }, //#
debugArr : function(inArr) //# String (int[])
	{ return "{" + inArr.join() + "}"; }, //#
_setZlvl : function(key, zLevel) { // void (int, int)
	this._log("setZlvlJSNI (ZLVL) colnum " + key.toString() + //#
		" z" + zLevel.toString()); //#
	this.slideMotion.colZDest[key] = zLevel;
	this.slideMotion.elcol[key].style.zIndex = zLevel.toString();
},
_getVisible : function(colnum) // bool (int)
	{ return _colVisible[colnum]; },
	
_setVisible : function(colnum, vis) { // void (int, bool)
	var t = this;
	t._log("setVisibleColumn colval " + colnum.toString() + //#
					" vis " + vis.toString()); //#
	if (vis == 1) {
		//if (fade == 1) {
		//trifold will never use jQuery or anything of the sort,
		//this is just convenient pseudoCode for what the 
		//essentila functionality will be.
			//$wnd.elcol[colnum].fadeIn({duration: durval });
		//} else { 
		t.slideMotion.elcol[colnum].style.visibility = "visible";
		t.slideMotion.elcol[colnum].style.display = "block";
		t._log("setting to previous zDest :" + //#
				t.slideMotion.colZDest[colnum].toString()); //#
		t.slideMotion.elcol[colnum].style.zIndex = 
		t.slideMotion.colZDest[colnum].toString();
		//}
	} else {
		//if (fade == 1) {
			//$wnd.elcol[colnum].fadeOut({duration: durval });
		//	$wnd.elcol[colnum].css("display", "none");
		
		//} else {
		t.slideMotion.elcol[colnum].style.zIndex = "-1000";
		//}
	}
	_colVisible[colnum] = vis;
},
// void (int, int, int, bool)
_move : function(colnum, endcolpos, zEnd, resizeParent, folding) {
	//zEnd is set after the panel arrives at xEnd.
	//it's assumed xStart should begin within the parent. 
	//resize is for contracting as the panel moves inward,
	if (this.isFade) {
		this._setVisible(colnum, false);
		//legacy int value stuff.
		this.slideMotion.moveColSimple(
				colnum, endcolpos, true, 1, zEnd, resizeParent, folding);
		this._setVisible(colnum, true);
	} else {
		this._log("move called for column no. " + colnum.toString() + //#
				" endpos set to " + endcolpos.toString() + //#
				" zEnd set to " + zEnd.toString() + //#
				" and resizeParent set to " + resizeParent.toString()); //#

		this.slideMotion.moveColSimple(colnum, endcolpos, 
				true, 1.0, zEnd, resizeParent, folding);	
	}
},
//void (int, int, bool, int, bool)
_moveInstant : function
			(colnum, endcolpos, isPos, zEnd, resizeParent, folding) {
	this._log("move instant called for column no. " + colnum.toString() + //#
			" isPos set at " + isPos.toString() + //#
			" endpos set to" + endcolpos.toString() +  //#
			" zEnd set to " + zEnd.toString() + //#
			" and resizeParent set to " + resizeParent.toString()); //#
	this.slideMotion.moveColSimple(colnum, endcolpos, 
			isPos, 0.001, zEnd, resizeParent, folding);
	this._setVisible(colnum, true);		
},
//int[] (int[], int, bool)
_remove : function(tier, key, resizeParent) {
	var t = this;
	t._log("remove("); //#
	t._log(t.debugArr(tier) + ", colval:" + key.toString() + ", " + //#
					resizeParent.toString() + ")"); //#
	var results = []; // !!
	var shiftBack = false;
	for (var i=0;i<tier.length;i++) {
		if (tier[i] != key) {
			results.push(tier[i]);
			if (shiftBack) 
				{ t._move(tier[i], i-1, t._zShow, true, false); } 
		} else {
			t._setZlvl(tier[i], t._zRemove()); 
			if (i+1 == tier.length) {
				t._move(tier[i], i-1, t._zDisappear, resizeParent, true); 
				t.slideMotion.createSequence([key], key, 0);
			} else {
				if (resizeParent) { 
					shiftBack = true; 
					var disappearCountdown = [];
					for (var k=i+1; k<tier.length; k++)
						{ disappearCountdown.push(tier[k]); }
					if (disappearCountdown.length > 0) {
						t.slideMotion.createSequence(
								disappearCountdown, key, 0);
					}
				} else {
					t._move(tier[i], i+1, t._zDisappear, true, false); 
					t.slideMotion.createSequence(
							[key], key, 0);
				}
			}
		}
	}
	return results;
},
// void (int, int[], int)
_instantiate : function(colnum, tier, shadow) {
	if (!(this._getVisible(colnum))) {
		this._log("anmt.insert(): column doesn't appear to" + //#
		" be present"); //#
		if (tier.length === 0) {
			this._moveInstant(colnum, 0, true, this._zShow, true, false);
		}else { 
			this._moveInstant(
				colnum, tier[shadow], false, this._zAdd(), true, false); 
		}
	}
},
// int[] (int[], int, int, bool)
_insert : function(
					tier, toAdd, pos, noPushback) {
	var t = this;
	t._log("insert("); //#
	t._log(t.debugArr(tier) + ", colvalToAdd:"+ toAdd.toString() + //#
				", atPos:" + pos.toString() + ")"); //#
	t._log("column visibility by colval (not current pos)" + _colVisible.join(",")); //#
	var results = [];
	for (var i=0;(i<tier.length || i===0);i++) {
		if (i == pos) {
			t._instantiate(toAdd, tier, i);
			t._setZlvl(toAdd, t._zAdd());
			t._setVisible(toAdd, true);
			
			t.slideMotion.createSequence([toAdd], toAdd, 1);
			t._move(toAdd, i, 
				(tier.length === 0 || noPushback)? t._zShow:t._zAdd(), 
				true, false);	
			results.push(toAdd);
			if (!(tier.length === 0 || noPushback)) {
				var appearCountdown = [];
				for (var k = i; k<tier.length; k++)
					{ appearCountdown.push(tier[k]); }
				if (appearCountdown.length > 0) {
					t.slideMotion
					.createSequence(appearCountdown, toAdd, 1);
				}
				for (k=tier.length-1; k>=i; k--) {
					t._move(tier[k], k+1, t._zShow, true, false);
				}
			}
			if (tier.length > 0) {
				results.push(tier[i]);
			}
		} else {
			results.push(tier[i]);
			if (i+1 == tier.length && tier.length == pos) {
				if (t.isFade) {
					t._moveInstant(toAdd, i+1, true, 
								t._zAdd(), true, false);
					t._setZlvl(toAdd, t._zShow);
				} else {
					t._instantiate(toAdd,tier,i);
					t._setZlvl(toAdd, t._zAdd());
					t._setVisible(toAdd, true);
					//TODO: moveInstant column here.
					t.slideMotion.createSequence([toAdd], toAdd, 1);
					t._move(toAdd, i+1, t._zShow, true, false);
				}
				results.push(toAdd);
			}
		}
		
	}
	return results;
},
// int[] (int[], int)
_rollOver : function(tier, coverLoc){
	var t = this;
	var mover = tier[1-coverLoc];
	var tgt = tier[coverLoc];
	var i, adding;
	for (i=0;i<3;i++) {
		if (i != mover && i != tgt) { adding=i; break; } //note: recent change
	}
	
	var disappearCountdown = [];
	disappearCountdown.push(mover);
	disappearCountdown.push(adding);
	t._log("create sequence " + disappearCountdown.join()); //#
	t.slideMotion.createSequence(disappearCountdown, tgt, 0);
	//todo: will this create problems if there's a sudden change?
	//has to do with whether zAdd() is reset prematurely.

	t._moveInstant(adding, mover, false, t._zAdd(), true, false);
	t._setVisible(adding, true);
	t._move(adding, 1-coverLoc, t._zAdd(), true, false);
	var zshowCountdown = [];
	zshowCountdown.push(mover);
	
	t._setZlvl(tgt, t._zRemove());
	t._log("create sequence " + zshowCountdown.join()); //#
	t.slideMotion.createSequence(zshowCountdown, adding, 1);
	t._move(mover, coverLoc, t._zShow, true, false);
	
	tier[coverLoc] = mover;
	tier[1-coverLoc] = adding;
	return tier;
},
// int[] (int[], int, int)
_inplace : function(tier, toAdd) {
	//inline replace. For one-tier.
	var results = [-1];
	this._moveInstant(toAdd, 0, true, this._zShow, true, false);
	this._moveInstant(tier[0], 0, true, this._zRemove(), true, false);
	this._setVisible(toAdd, true);
	this._setVisible(tier[0],false);
	results[0] = toAdd;
	return results;
},
// int[] (int[], int, int, bool)
_slide : function(tier, initIndex, endIndex, resizeParent) {
	//resizeParent would be set to false here in any instance 
	//where the initial columns are [AB] and the ending 
	//columns are [CBA] or [BAC]
	var t = this;
	t._log("slide(" + t.debugArr(tier) + "," +  //#
		initIndex.toString() + "," + endIndex.toString() + //#
		"," + resizeParent.toString()); //#
	var results = []; //new int[tier.length];
	var moveForward = (initIndex < endIndex);
	var j;
	for (var i=0; i<tier.length; i++) {
		//beginning from the moved column, iterating in a wrap-around way.
		j=(initIndex +i)% tier.length;
		if (i===0) {
			//	was results.length -1 (fixed because of instance where
			// tier 3 !canMinimize !fixed, slide({0,1,2}, 0,1,true}))
			results[Math.min(endIndex,tier.length-1)] = tier[j]; 
			t._setZlvl(tier[j], t._zAdd());
			t._move(tier[j], endIndex, t._zShow, 
					((moveForward)? true:resizeParent), false);
		} else if (moveForward && initIndex<j && j<=endIndex) {
			//this might have problems. 
			if (resizeParent)
				{ t._move(tier[j], j-1, t._zShow, resizeParent, false);}
			results[j-1] = tier[j];
		} else if (!moveForward && endIndex<=j && j<initIndex) {
			if (resizeParent)
				{ t._move(tier[j], j+1, t._zShow, resizeParent, false); }
			results[j+1] = tier[j];
		} else {
			results[j] = tier[j];
		}
	}
	return results;
},
_redrawInt : function(redrawNum) {
	var t=this;
	if (t._redrawCount != redrawNum) { return; }
	if (t.slideMotion._innerParentMoving == -1 && 
		t.slideMotion._colDestReached[0] &&
		t.slideMotion._colDestReached[1] &&
		t.slideMotion._colDestReached[2]) {
		for (var i=0; i<(t._endState.length); i++) {
			this._log("redrawHoriz: setting col" + //#
			t._endState[i].toString() + "at pos" + //#
			i.toString() + "to z value " + //# 
			t.slideMotion.colZDest[i].toString()); //#
			t._moveInstant(t._endState[i], i, true,
				t.slideMotion.colZDest[t._endState[i]], true, false);
		}	
		t._redrawCount = 0;
	} else {
		var wrap = function() {
			t._redrawInt(redrawNum);
		};
		window.setTimeout(wrap, 5);
	}
},
redrawHorizontal : function() {
	//this is so if mincolres[x] is changed,
	//or colspacing is changed after first layout,
	//it changes to the correct position.
	//(remember: slidemotion does not keep track of
	// the "colpos" - abstract position of the column
	// just the pixel location.)
	this._redrawCount += 1;
	this._redrawInt(this._redrawCount);
},
animate : function(begin, end) { // void (int[], int[] end)
	var beginTmp = []; 
	var t = this;
	t._endState = end;
	var i;
	for (i=0;i<begin.length;i++) 
	{ beginTmp.push(begin[i]);}
	
	t._log("animate(" + t.debugArr(begin) + //#
			", " + t.debugArr(end) + ");"); //#
	
	if (begin.length == end.length) {
		for (i=0; i<begin.length; i++) {
			if (begin[i] != end[i]) { break; }
			if (i+1 == begin.length) { return; }}}	
	
	if (begin.length == 1 && end.length == 1) {
		beginTmp = t._inplace(beginTmp, end[0]);
		return end;
	} else if (begin.length == 2 && end.length == 2) {
		if (begin[0] == end[1] && begin[1] == end[0]) {
			// this shouldn't work. Needs looking into.
			//resize parent set to true, and seems to be passed
			// on to move, yet for some reason innerParent
			// stays at static width. If we fix a bug, and this
			// breaks, set resizeParent to false here and fix 
			// the second switch case in _slide()
			beginTmp = t._slide(beginTmp, 0, 1, true);
		} else if (begin[0] == end[1] || begin[1] == end[0]) {
			var coveredPos = (begin[0] == end[1])? 1:0;
			beginTmp = t._rollOver(beginTmp, coveredPos);
		} else {
			var replacePos = (begin[0] == end[0])? 1:0;
			//beginTmp = replace(beginTmp, end[replacePos], replacePos); 
			beginTmp = t._remove(beginTmp, begin[replacePos], false);
			beginTmp = t._insert(beginTmp, end[replacePos], 
										replacePos, true);
		}
		return end;
	} else if (begin.length == 2 && end.length == 3) {
		if (begin[0] == end[2] && begin[1] == end[1]) {	
			beginTmp = t._slide(beginTmp, 0, 2, false);
			beginTmp = t._insert(beginTmp, end[0], 0, false);
			return end;
		} else if (begin[0] == end[1] && begin[1] == end[0]) {
			beginTmp = t._slide(beginTmp, 1,0, true); //was false..
			beginTmp = t._insert(beginTmp, end[2], 2, false);
			return end;							
		}  else if (begin[0] == end[2] && begin[1] == end[0]) {
			t._setZlvl(begin[0], t._zAdd());
			t._setZlvl(begin[1], t._zAdd());
			t._instantiate(end[1], beginTmp, 1);
			t._move(begin[1], 0, t._zShow, false, false);
			t._move(begin[0], 2, t._zShow, true, false);
			t._move(end[1], 1, t._zAdd(), true, false);
			t.slideMotion.createSequence([begin[0], begin[1]], end[1], 1);
			return end;
		} 
		//else if (begin[0] == end[1] && begin[1] == end[2]) {
		//}
	} else if (begin.length == 3 && end.length == 2) {
		if (begin[2] == end[0] && begin[1] == end[1]) {
			beginTmp = t._remove(beginTmp, begin[0], false);
			beginTmp = t._slide(beginTmp, 1,0, true);
			return end;
		} else if (begin[0] == end[1] && begin[1] == end[0]) {
			beginTmp = t._remove(beginTmp, begin[2], true);
			beginTmp = t._slide(beginTmp, 0,1, true);
			return end;
		} else if (begin[2] == end[0] && begin[0] == end[1]) {
			t._setZlvl(begin[2],t._zAdd());
			t._setZlvl(begin[0],t._zAdd());
			t._setZlvl(begin[1],t._zRemove());
			t._move(begin[2], 0, t._zShow, true, false);
			t._move(begin[0], 1, t._zShow, false, false);
			t.slideMotion.createSequence([begin[0]], begin[1], 0);
			return end;
			//beginTmp = t._slide(beginTmp,2,0,true);
			//beginTmp = t._remove(beginTmp,begin[1],false);
			//beginTmp = t._slide(beginTmp,1,0,true);
		} 
		//else if (begin[1] == end[0] && begin[2] == end[1]) {
		//}
	}
	
	i=0;
	while (i<beginTmp.length) {
		if (!t.contains(end, beginTmp[i])) 
		{ beginTmp = t._remove(beginTmp, beginTmp[i], true); }
		else {i++;}
	}
	
	//a simple sorting algorithm for a simple problem domain.
	//we do sorting before adding because if both are required,
	//doing sorting first minimizes the amount of column
	//switches the player must see.
	
	//get same elements as beginTmp but in order.
	var cmp = [];
	for (i=0; i<end.length; i++) {
		if (t.contains(beginTmp, end[i])) {
			cmp.push(end[i]);
		}
	}
	for (i=0; i<beginTmp.length; i++) {
		for (var j=0;j<cmp.length; j++) {
			if (beginTmp[i] == cmp[j]) {
				if (i != j)
				{ beginTmp = t._slide(beginTmp, i, j, true); }
				break;
			}
		}
	}
	
	//add any missing elements.
	for (i=0; i<end.length; i++) {
		if (i>=beginTmp.length || end[i] != beginTmp[i]) {
			beginTmp = t._insert(beginTmp, end[i], i, false);
		}
	}
},
setSlidespeed : function(speed) // void (int)
	{ this.slideMotion.setSlidespeed(speed); },
getSlidespeed : function() // int ()
	{ return this.slideMotion.getSlidespeed(); }
};
// ------- End SlideLogic -----------


return TriFold;

});

//return new (new TriFoldNameSpace(window, document, console, TriFold))(behavior, rootDiv, leftDiv, centDiv, rightDiv);
return new (new TriFoldNameSpace(window, document, navigator, console,
								TriFold))(behavior, leftDiv, centDiv, rightDiv);

};

// ------- Begin interfaces -----------

//In the future it's /possible/ ve may actually implement some of
//these methods in which case for future proofing, it's good to inherit
//from this. but up until 0.3 there will be no ill effects.
TriFold.Behavior = function() {	
};
TriFold.Behavior.prototype = {
getLayout : function(availColumns) // int[] (int)
{ },
getButtonStatus : function(availColumns) // int[] (int)
{ },
onManipUse : function(src, keycode) // void (int, int)
{ },
onAvailChange : function(newColAvail) //void (int)
{ },
onWidgetUse : function() //void ()
{ }
};

TriFold.LEFT = 0;
TriFold.CENT = 1;
TriFold.RIGHT = 2;
TriFold.TWO_AVAILABLE = 1;
TriFold.THREE_AVAILABLE = 2;

TriFold.LayoutManip = function() {
	this.status = [-1,-1,-1];
};

TriFold.LayoutManip.prototype = {
NOCHANGE : 3, 
ENABLED : 2,
DISABLED : 1,
HIDDEN : 0,
BUTTON_TWO : 2,
BUTTON_ONE : 1,
CONTAINER : 0,
isDefault : false,
setStatus : function(comp, newStatus) { // void (int, int)
	if (newStatus != this.NOCHANGE) 
	{ this.status[comp] = status; }
},
getStatus : function(comp) {  // int (int)
	return this.status[comp];
},
getButton : function(comp) {  // element (int)
	//if (comp == this.BUTTON_ONE) {
	//} else if (comp == this.BUTTON_TWO) {
	//}
}
};

// ------- End interfaces -----------
// ------- Begin DefaultManip -----------
	//I think a little too particular for most developers to want to extend
	//so it's kept further down here.

TriFold.DefaultManip = function(TriFoldInst, colnum) {
	TriFold.LayoutManip.call(this);
	var t=this;
	t.colnum = colnum;
	t.btns = [];
	t.callbacks = [];
	t.NOCHANGE = 3;
	t.ENABLED = 2;
	t.DISABLED = 1;
	t.HIDDEN = 0;
	t.BUTTON_TWO = 2;
	t.BUTTON_ONE = 1;
	t.CONTAINER = 0;
	//t._log = function(msg) { TriFoldInst.debugLog(msg); }; //#
  var makeButtonPressCallback = function(colnum, buttonNo) {
    var r = function() {
			TriFoldInst.simulateButtonPress(colnum, buttonNo);
    };
    return r;
  };
	for (var j=0;j<2;j++){
		t.callbacks.push(makeButtonPressCallback(colnum, j));
	}
	//debugging Purposes.
	t.eventListenerOn = [false, false];
	t.btnContainer = 0;
	t.containerVisible = false;
	t.addedToDom = false;
};

TriFold.DefaultManip.prototype = Object.create(TriFold.LayoutManip.prototype);

// allow listeners to be added. If listeners are added before
// being added/moved in DOM (ala GWT), then not only do those listeners
// not work, but any further listeners added to that element will not work.
TriFold.DefaultManip.prototype.isAddedToDom = function() {
	var t = this;
	t.addedToDom = true;
	//make up for any blocked adding of listeners.
	for (var i=0;i<t.btns.length;i++) {
		if ((t.status[t.CONTAINER] == t.ENABLED) &&
			(t.status[i+1] == t.ENABLED)) {
			t.btns[i].addEventListener("click", t.callbacks[i],false);
		}
	}
};

//void (el)
TriFold.DefaultManip.prototype.addButton = function(elButton, newStatus) {
	this.btns.push(elButton);
	this.setStatus((this.btns.length == 1)? this.BUTTON_ONE:this.BUTTON_TWO, newStatus);
};
//void (el)
TriFold.DefaultManip.prototype.addContainer = function(elContainer, newStatus) {
	this.btnContainer = elContainer;
	this.setStatus(this.CONTAINER, newStatus);
};
//el (int)
TriFold.DefaultManip.prototype.getButton = function(comp) {
	if (comp == this.BUTTON_ONE) {
		return this.btns[0];
	} else if (comp == this.BUTTON_TWO) {
		return this.btns[1];
	}
};
//void (bool)
TriFold.DefaultManip.prototype._showContainer = function(vis) {
	if (vis == this.containerVisible && vis == 1) { return; }
	this.containerVisible = vis;
	if (vis){ this.btnContainer.style.opacity = 0.5; }
	else { this.btnContainer.style.opacity = 0; }
};
//void (int, int)
TriFold.DefaultManip.prototype.setStatus = function(comp, newStatus) {
	//console.log("setStatus(" + comp.toString() + //#
	//			"," + newStatus.toString() + ")" + //#
	//			this.status.join(",") + ":" + this.eventListenerOn.join(",")); //#
	var t = this;
	if (newStatus == t.status[comp] || newStatus == t.NOCHANGE) 
	{ return; }
	//t.status[comp] = status;
	if (comp == t.CONTAINER && t.btnContainer !== 0) {
		t._showContainer((newStatus != t.HIDDEN));
		if (newStatus == t.ENABLED) {
			t.btnContainer.style.opacity = 1.0; 
		}
		for (var i=1;i<3;i++) { //todo use the enums here.
			if (t.status[i] == t.ENABLED) {
				if (newStatus == t.ENABLED) {
					t.eventListenerOn[i-1] = true;
					if (t.addedToDom)
					{ t.btns[i-1].addEventListener("click", 
						t.callbacks[i-1], false); }
				} else if (newStatus != t.NOCHANGE) { 
					t.eventListenerOn[i-1] = false;
					if (t.addedToDom)
					{ t.btns[i-1].removeEventListener("click", 
						t.callbacks[i-1], false); }
				}
			}
		}
	} else if ((comp == t.BUTTON_ONE && t.btns.length > 0) ||
				(comp == t.BUTTON_TWO && t.btns.length > 1)) {
		var num = (comp == t.BUTTON_ONE)? 0:1;
		var btn = t.btns[num];
		if (newStatus == t.HIDDEN) {
			btn.style.opacity = 0;
		} else if (newStatus == t.DISABLED) {
			btn.style.opacity = 0.5;
		} else if (newStatus == t.ENABLED) {
			btn.style.opacity = 1;
		}
		
		if (t.status[t.CONTAINER] == t.ENABLED) {
			if (newStatus == t.ENABLED) {
				t.eventListenerOn[num] = true;
				if (t.addedToDom)
				{ btn.addEventListener("click", 
					t.callbacks[num], false); }
			} else {
				t.eventListenerOn[num] = false;
				if (t.addedToDom)
				{ btn.removeEventListener("click", 
					t.callbacks[num], false); }
			}
		}
	}
	t.status[comp] = newStatus;
	//console.log(" -> " + this.status.join(",") + ":" + this.eventListenerOn.join(",")); //#
};
TriFold.DefaultManip.prototype.isDefault = true;

// ------- End DefaultManip -----------
// ------- Begin DefaultBehavior -----------

var defaultBehaviorConsts = 
{ ONE_AVAILABLE : 0, TWO_AVAILABLE : 1,
	THREE_AVAILABLE : 2, FIXED : 0,
	SLIDE : 1, CAN_MINIMIZE : 2,
	LEFT : 0, CENT : 1, RIGHT : 2,
	NO_ROLLOVER: 0, ROLLOVER: 1, ROLLOVER_OPT: 2 };

TriFold.DefaultBehavior = function() {
	var i;
	var t = this;
	for (i in defaultBehaviorConsts) {
		if (defaultBehaviorConsts.hasOwnProperty(ii)) { //keep checkers happy.
			this[i] = defaultBehaviorConsts[i];
		}
	}
    t.X = 0;
	t.Y = 1;
	t.NORTH = 0;
	t.EAST = 1;
	t.SOUTH = 2;
	t.WEST = 3;
	t.HIDDEN = 0;
	t.ENABLED = 2;
	t.CONTAINER = 0;
	t.BUTTON_ONE = 1;
	t.BUTTON_TWO = 2;
	t._recentResize = true;
	t._recentSwitch = false;
	t._defaultOneCol = [t.CENT];
	t._defaultTwoCol = [t.RIGHT, t.CENT];
	t._mem = [[],
				t._defaultOneCol.slice(0),
				t._defaultTwoCol.slice(0),
				[t.LEFT, t.CENT, t.RIGHT]];	
	//int[4][3][3]
	t._availColumns = 0;
	t._modes = [t.CAN_MINIMIZE, t.CAN_MINIMIZE,
					t.CAN_MINIMIZE];
	t._aVisTwoCol = [t.CENT];
	t._aVisThreeCol = [t.CENT]; 
	t._rolloverAtTwo = t.NO_ROLLOVER;
	t._orderedAtThree = true;
}; 

for (var ii in defaultBehaviorConsts) {
	if (defaultBehaviorConsts.hasOwnProperty(ii)) { //keep checkers happy.
		TriFold.DefaultBehavior[ii] = defaultBehaviorConsts[ii];
	}
}

//void (str)
TriFold.DefaultBehavior.prototype =  {
_log : function(msg) { //# 
//	console.log(msg); //#
}, //#
resetToDefaults : function() {		//E void ()
	this._mem = [[],
				this._defaultOneCol.slice(0),
				this._defaultTwoCol.slice(0),
				[this.LEFT, this.CENT, this.RIGHT]];
},
setOpts : function(optobj) {		//E void ({str:[...],str:...})
	for (var opt in optobj) {
		if (optobj.hasOwnProperty(opt) &&
			('set' + opt) in this) {
			(this['set' + opt]).apply(this,optobj[opt]);
		}
	}
},
setModeAll : function(mode)			//E void (int)
	{ this._modes = [mode, mode, mode]; },
setMode : function(tier, mode)		//E void (int, int)
	{ this._modes[tier] = mode; },
getMode : function(tier)			//E int (int)
	{ return this._modes[tier]; },
setDefaultOneCol : function(col)	//E void (int)
	{ this._defaultOneCol = [col]; },
getDefaultOneCol : function()		//E int()
	{ return this._defaultOneCol[0]; },
setDefaultTwoCol : function(colArr)	//E void (int[])
	{ this._defaultTwoCol = colArr.slice(0); },
getDefaultTwoCol : function()		//E int[] () 
	{ return this._defaultTwoCol.slice(0); },
setVisTwoCol : function(visArr)		//E void (int[])
	{ this._aVisTwoCol = visArr.slice(0); },
getVisTwoCol : function()			//E int[] ()
	{ return this._aVisTwoCol.slice(0); },
setVisThreeCol : function(visArr)	//E void (int[])
	{ this._aVisThreeCol = visArr.slice(0); },
getVisThreeCol : function()			//E int[] ()
	{ return this._aVisThreeCol.slice(0); },
setOrderedThreeCol : function(y)	//E void (int)
	{ this._orderedAtThree = y; },
getOrderedThreeCol : function()		//E int ()
	{ return this._orderedAtThree; },
setRolloverTwoCol : function(roll)	//E void (int)
	{ this._rolloverAtTwo = roll; },
getRolloverTwoCol : function()		//E int ()
	{ return this._rolloverAtTwo; },
		
_debugThreeDimArray : function(arr) { //# String()
	var results = "["; //#
	for (var i=0;i<arr.length;i++) { //#
		results = results + this._debugTwoDimArray(arr[i]) + ","; //#
	} //#
	results = results + "]"; //#
	return results; //#
}, //#
_debugTwoDimArray : function(arr) { //# String ()	
	var results = "["; //#
	for (var i=0;i<arr.length;i++) { //#
		results = results + "{" + arr[i].join(",") + "},"; //#
	} //#
	results = results + "]"; //#
	return results; //#
}, //#
_debugArr : function(arr) { //#
	return "{" + arr.join(",") + "}"; //#
}, //#

onWidgetUse : function() { //E void ()
	var t = this;
	if (t._recentResize) {
		t._recentResize = false;
		if (t._availColumns != 1) {
			if (t._mem[1][0] != t.CENT) 
			{ t._mem[1] = t._defaultOneCol.slice(0);  }
		} else if (t._availColumns != 2 && t._mem[2].length < 2) {
			t._mem[2] = t._defaultTwoCol.slice(0);
		} else if (t._availColumns != 3 && t._mem[3].length < 3) {
			t._mem[3] = [t.LEFT, t.CENT, t.RIGHT];
		}
	}
	if (t._recentSwitch) { //recentSwitch is cancelled out by a resize
		t._recentSwitch = false;
		if (t._availColumns == 3 && t._mem[3].length == 2) {
			t._mem[2] = t._mem[3].slice(0);
		}
		
	}
},
getLayout : function(availColumns)  //E int[] (int)
	{ return this._mem[availColumns].slice(0); },
getButtonStatus : function(availColumns) { //E int[][] (int)
	var t = this;
	var i, HIDDEN = t.HIDDEN, ENABLED = t.ENABLED,
		FIXED = t.FIXED, SLIDE = t.SLIDE,
		ONE = t.ONE_AVAILABLE,
		TWO = t.TWO_AVAILABLE, THREE = t.THREE_AVAILABLE; 
	var allHidden = function() { return [HIDDEN, HIDDEN, HIDDEN]; };
	var enabledAll = function() { return [ENABLED, ENABLED, ENABLED]; };
	var enabledLeft = function() { return [ENABLED, ENABLED, HIDDEN]; };
	var enabledRight = function() { return [ENABLED, HIDDEN, ENABLED]; };
	
	var curLayout = t._mem[availColumns];
	var manipState = [allHidden(), allHidden(), allHidden()];
	if (availColumns == 1 && t._modes[ONE] !== FIXED){
		manipState = [enabledAll(), enabledAll(), enabledAll()];
	} else if (availColumns == 2 && t._modes[TWO] !== FIXED) {
		if (t._modes[TWO] == SLIDE) { 
			if (t._aVisTwoCol.length == 1) {
				var fk = t._aVisTwoCol[0];
				if (t._rolloverAtTwo == t.ROLLOVER_OPT) {
					manipState[fk] = enabledAll();
				} else {
					manipState[fk] = (curLayout[0] == fk)? 
								enabledRight(): enabledLeft();
				}
			} else {
				manipState[curLayout[0]] = enabledRight();
				manipState[curLayout[1]] = enabledLeft();
			}
		} else {
			if (t._aVisTwoCol.length == 1) {
				manipState[t._aVisTwoCol[0]] = enabledAll();
			} else {
				manipState = [enabledAll(), enabledAll(), enabledAll()];
			}
		}
	} else if (availColumns == 3 && t._modes[THREE] !== FIXED) {
		if (t._modes[THREE] == SLIDE) {
			manipState[curLayout[0]] = enabledRight();
			manipState[curLayout[1]] = enabledAll();
			manipState[curLayout[2]] = enabledLeft();
		} else {
			if (t._aVisThreeCol.length === 0) {
				manipState = [enabledAll(), enabledAll(), enabledAll()];
			} else if (t._aVisThreeCol.length == 1) {
				manipState[t._aVisThreeCol[0]] = enabledAll();
			} else {
				var hidable = 3;
				hidable -= (t._aVisThreeCol[0] + t._aVisThreeCol[1]);
				for (i=0;i<2;i++) {
					manipState[t._aVisThreeCol[i]] = 
						(hidable == 2 || 
						(hidable == 1 && t._aVisThreeCol[i]==2))? 
						enabledRight() : enabledLeft();
				}
			}
		}
	}
	//this._log(this._debugTwoDimArray(manipState)); //#
	return manipState;
},
copy : function() { //E DefaultBehavior ()
	//does NOT copy current mem[][] values.
	//not nec. though - only called during setBehavior()
	var t = this;
	var echo = new TriFold.DefaultBehavior();
	echo.setDefaultOneCol(t._defaultOneCol[0]);
	echo.setDefaultTwoCol(t._defaultTwoCol);
	echo.setMode(t.ONE_AVAILABLE, t._modes[t.ONE_AVAILABLE]);
	echo.setMode(t.TWO_AVAILABLE, t._modes[t.TWO_AVAILABLE]);
	echo.setMode(t.THREE_AVAILABLE, t._modes[t.THREE_AVAILABLE]);
	echo.setVisTwoCol(t._aVisTwoCol);
	echo.setVisThreeCol(t._aVisThreeCol);
	echo.setRolloverTwoCol(t._rolloverAtTwo);
	echo.setOrderedThreeCol(t._orderedAtThree);
	return echo;
},
onManipUse : function(src, keycode) { //E void (int, int)
	/* this is called after a column switch button is
	 *  pressed or you call the column switch callback 
	 *  through a widget.*/
	var t = this, srcpos, toadd, tgtpos;
	t._log("polColSwitch: running Behavior column switch." + //#
			"At beginning of behavior call, mem looked like t : " + //#
			t._debugTwoDimArray(t._mem)); //#
	t._recentSwitch = true;
	var SLIDE = t.SLIDE,
		TWO= t.TWO_AVAILABLE, THREE = t.THREE_AVAILABLE;
	var results = t._mem[t._availColumns].slice(0);
	var column = keycode;
	if (src === 0 || (src == 1 && keycode == 1)) { column = keycode + 1; }
	
	srcpos = 0;
	if (results.length > 1 && results[1] == src) { srcpos = 1; }
	if (t._availColumns == 1) {
		results[0] = column;
	} else if (t._availColumns == 2) {
		if (t._modes[TWO] == SLIDE) {
			if (t._aVisTwoCol.length == 2) {
				results.push(results[0]);
				results.splice(0,1);
			} else {
				//switch buttons don't nec. correspond to col nos.
				toadd = 3 - (results[1-srcpos] + src);
				if (t._rolloverAtTwo == t.ROLLOVER) {
					results[1-srcpos] = src;
					results[srcpos] = toadd;
				} else {
					results[1-srcpos] = toadd;
				}
			}
		} else if (results.indexOf(column) > -1) { 
			results.splice(results.indexOf(column), 1);		
		} else {
			if (t._aVisTwoCol.length == 1) {
				tgtpos = 1-t._defaultTwoCol.indexOf(src);
				if (t._rolloverAtTwo == t.ROLLOVER && 
					t._defaultTwoCol.indexOf(column) == -1) {
					tgtpos =  1-tgtpos;
				}
			} else {
				tgtpos = 1-srcpos;
				if (t._rolloverAtTwo == t.ROLLOVER &&
					results.length == 2) {
					tgtpos = srcpos;
				}
			}
			results = [src, src];
			results[tgtpos] = column;
		}
	} else if (t._availColumns == 3) {
		if (results.length > 2 && results[2] == src) { srcpos = 2; }
		if (t._modes[THREE] == SLIDE) {
			results.splice(srcpos, 1);
			results.splice(srcpos + ((keycode==1)? 1:-1),0,src); 
			//todo check splice at array length works on IE9
		} else if (results.indexOf(column) > -1) { 
			results.splice(results.indexOf(column), 1);		
		} else {
			if ((!(t._orderedAtThree) && (t._aVisThreeCol.length === 0 || 
						(src===0||(src==1&&results.length==2)))) ||			
						(t._orderedAtThree && column == 2)) {
				results.push(column);
			} else if (!(t._orderedAtThree) ||
					(column === 0 || results[0] == 2)) {
				results.splice(0,0,column);
			} else {
				results.splice(1,0,1); 
			}
		}
	}

	t._mem[t._availColumns] = results.slice(0);
	t._log("polColSwitch: finishing Behavior column switch." + //#
			" At end of behavior call, mem looked like t : " +  //#
			t._debugTwoDimArray(t._mem)); //#
},
onAvailChange : function(newcolavail) { //E void (int)
	/* changes in column memories that occur as soon as a
	 * larger or smaller number of columns are available
	 * due to resizing. changes to memory here can affect the columns
	 * loaded at the new tier. */
	var t = this;
	t._recentResize = true;
	t._recentSwitch = false;
	t._log("beginning Behavior AV change. At beginning of behavior call," + //#
			"mem looked like this : " + t._debugTwoDimArray(t._mem)); //#
	
	if (newcolavail == t._availColumns) { return; } 
	
	//if we ever allow default avail3 to be l.t. 3 length we might
	// have to ensure that layout 3 isn't automatic at start up...
	// otherwise this will autocopy layout 3 to 2.
	if (t._availColumns == 3 && newcolavail == 2 && t._mem[3].length <= 2) 
	{ t._mem[2] = t._mem[3].slice(0); }
	//} else	if 
	//   (availColumns == 1 && newcolavail == 2 && mem[1][0] == CARDCOL) {
	//	mem[2] = ;		
	t._availColumns = newcolavail;
	t._log("finishing Behavior AV change. At end of behavior call," + //#
			"mem looked like this : " + t._debugTwoDimArray(t._mem)); //#
}
};

// ------- End DefaultBehavior -----------



TriFold.ResizeSensor = function(element, callback) {
        /**
         * Adds a listener to the over/under-flow event.
         *
         * @param {HTMLElement} element
         * @param {Function}    callback
         */
        function addResizeListener(element, callback) {
            if (window.OverflowEvent) {
                //webkit
                element.addEventListener('overflowchanged', function(e) {
                    callback.call(this, e);
                });
            } else {
			
                element.addEventListener('overflow', function(e) {
                    callback.call(this, e);
                });
                element.addEventListener('underflow', function(e) {
                    callback.call(this, e);
                });
            }
        }

        /**
         *
         * @constructor
         */
        function EventQueue() {
            this.q = [];
            this.add = function(ev) {
                this.q.push(ev);
            };

            var i, j;
            this.call = function() {
                for (i = 0, j = this.q.length; i < j; i++) {
                    this.q[i].call();
                }
            };
        }

        /**
         * @param {HTMLElement} element
         * @param {String}      prop
         * @returns {String|Number}
         */
        function getComputedStyle(element, prop) {
            if (element.currentStyle) {
                return element.currentStyle[prop];
            } else if (window.getComputedStyle) {
                return window.getComputedStyle(element, null).getPropertyValue(prop);
            } else {
                return element.style[prop];
            }
        }

        /**
         *
         * @param {HTMLElement} element
         * @param {Function}    resized
         */
        function attachResizeEvent(element, resized) {
            if (!element.resizedAttached) {
                element.resizedAttached = new EventQueue();
                element.resizedAttached.add(resized);
            } else if (element.resizedAttached) {
                element.resizedAttached.add(resized);
                return;
            }

            if ('onresize' in element) {
                //internet explorer
                if (element.attachEvent) {
                    element.attachEvent('onresize', function() {
                        element.resizedAttached.call();
                    });
                } else if (element.addEventListener) {
                    element.addEventListener('resize', function(){
                        element.resizedAttached.call();
                    });
                }
            } else {
				var setupSensor;
                var myResized = function() {
                    if (setupSensor() || true) {
                        element.resizedAttached.call();
                    }
                };
                element.resizeSensor = document.createElement('div');
                element.resizeSensor.className = 'resize-sensor';
                var style =
                    'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;';
                element.resizeSensor.style.cssText = style;
                element.resizeSensor.innerHTML =
                    '<div class="resize-sensor-overflow" style="' + style + '">' +
                        '<div></div>' +
                        '</div>' +
                        '<div class="resize-sensor-underflow" style="' + style + '">' +
                        '<div></div>' +
                        '</div>';
                element.appendChild(element.resizeSensor);

                if ('absolute' !== getComputedStyle(element, 'position')) {
                    element.style.position = 'relative';
                }

                var x = -1,
                    y = -1,
                    firstStyle = element.resizeSensor.firstElementChild.firstChild.style,
                    lastStyle = element.resizeSensor.lastElementChild.firstChild.style;

                setupSensor = function() {
                    var change = false,
                        width = element.resizeSensor.offsetWidth,
                        height = element.resizeSensor.offsetHeight;

                    if (x != width) {
                        firstStyle.width = (width - 1) + 'px';
                        lastStyle.width = (width + 1) + 'px';
                        change = true;
                        x = width;
                    }
                    if (y != height) {
                        firstStyle.height = (height - 1) + 'px';
                        lastStyle.height = (height + 1) + 'px';
                        change = true;
                        y = height;
                    }
                    return change;
                };

                setupSensor();
                addResizeListener(element.resizeSensor, myResized);
                addResizeListener(element.resizeSensor.firstElementChild, myResized);
                addResizeListener(element.resizeSensor.lastElementChild, myResized);
            }
        }

        if ('array' === typeof element) {
            var i = 0, j = element.length;
            for (; i < j; i++) {
                attachResizeEvent(element[i], callback);
            }
        } else {
            attachResizeEvent(element, callback);
        }
};