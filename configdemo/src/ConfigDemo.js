/** 
TriFold/configdemo/scripts/ConfigDemo.js
ConfigDemo widget building, handlers, and codegen automating
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

//--------------------------------------------------------------
// functions that could ONLY work in javascript / require tight
// coupling with DOM access.

// Widgets that scale: polyfill classes for
// form controls.
/*
	TO DO:
		make it so changing classnames
		(selected, disabled, etc)
		remove obsolete class names and add the new ones
		instead of writing over all classNames
		which would delete user added classnames
*/
var JS=0;
var GWT=1;

var svgInjector = Similitude.svgInjector;
var SVGTools = Similitude.SVGTools;

var floatFmt = function(value) { // str (float)
	var precision = 1; 
	var power = Math.pow(10, precision || 0); 
	return String(Math.round(value * power) / power); 
};	
window.isSupportedBrowser = function() {
	if (bowser.msie && bowser.version <=9 ) 
	{ return false; }
	return true;
};

var classListRemove = function(list, key) {
	return list.replace(
	new RegExp("( " + key +"($|(?= ))|(^|(?= ))" + key + " |^" + key +"$)", 
	"g"), "");
};

window.changedMinColRes = function(xyMin) {
	//console.log("stylesheets length:" document.styleSheets.length.toString());
	var offset = 1;
	
	var std = [240, 400];
	var shadow = [4, 4];
	var dist = [10, 10]; 
	console.log("xymin 0 " + floatFmt(xyMin[0]) + 
				"xymin 1 " + floatFmt(xyMin[1]));
	var fact = (xyMin[0]/std[0] + xyMin[1]/std[1]) /2;
	var shadowNew = [fact*shadow[0], fact*shadow[1]];
	// var dimContent = [std[0]-(fact*dist[0]), std[1]-(fact*dist[1])];
	var dimContent = [xyMin[0]-(fact*dist[0]), xyMin[1]-(fact*dist[1])];
	//console.log("shadownew:" + shadowNew[0].toString() + "px " + shadowNew[1].toString());
	//console.log("dimcontent:" + dimContent[0].toString() + "px; height: " + dimContent[1].toString());
	
	var newRule = ".tri-fold_colContent { box-shadow: " +
	shadowNew[0].toString() + "px " + shadowNew[1].toString() + 
	"px 4px rgba(50, 50, 50, 0.58); width: " + 
	dimContent[0].toString() + "px; height: " + 
	dimContent[1].toString() + "px; }";
	
	/* var newRuleHW = ".tri-fold_colContent {  width: " + 
		dimContent[0].toString() + "px; height: " + 
		dimContent[1].toString() + "px; }";
	var newRuleShadow = " .tri-fold_col0 .tri-fold_colContentPlusBorder > div, " +
		" .sim-panelboundary { box-shadow: " +
		shadowNew[0].toString() + "px " + shadowNew[1].toString() + 
		"px 4px rgba(50, 50, 50, 0.58); }"; */
	
	//console.log("text:" + document.styleSheets[offset].cssRules[0].cssText);
	//console.log("newrule:" + newRule);
	//document.styleSheets[offset].deleteRule(0);
	document.styleSheets[offset].deleteRule(0);
	document.styleSheets[offset].insertRule(newRule,0);
	//document.styleSheets[offset].insertRule(newRuleShadow,0);
	//document.styleSheets[offset].insertRule(newRuleHW,0);
};

window.b64toBlob = function(str) {
	var decoded = atob(str);
	var i, il = decoded.length;
	var array = new Uint8Array(il);
	for (i = 0; i < il; ++i) { array[i] = decoded.charCodeAt(i); }
	return array;
};


var Replacer = function(loc, changes) {
	this.loc = loc;
	this.changes = changes;
};

var ZipModder = function(src, srcType, fsOps, replacers) {
	//if you're worried about XSS attacks from generating a download in JS
	//, don't be. Even if you generated it on the server, any attacker 
	// using an XSS attack could just as easily hange the click listener to
	// request it to the browser and man-in-the-middle the zip in place
	// before serving it as a download and users wouldn't be able to tell
	// the difference. They might not even have to contact the server
	// if any mods to the file can be understood and imitated without much work.
	
	var t = this;
	t.src = src;
	t.srcType = srcType;
	t.fsOps = fsOps; //[void (zipObject, argsdict), void...]
	//use fsOps for things like creating/deleting/moving/renaming 
	// files/folders
	t.replacers = replacers; // {fileloc : [filetext (filetext, argsdict),...],
							//   fileloc...}
	//uses lazy decoding.. zip only converted to object at first request
	//for it to be modded and new zip generated.
	t.zipObjectCreated = false;
	t.zipObject = 0;
	
	//only relevant if you're fetching zip from URL.
	t.downloadLock = false;
	t.downloadQueue = [];
	
	
	//not implemented...  do down the roat if we ever
	//turn this into a micro-library.


	t.downloadZip = function(argsdict, url) {
		var t= this;
		if (t.downloadLock) {
			t.downloadQueue.push(argsdict);
		} else {
			t.downloadLock = true;
			
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = "arraybuffer";
			//if (xhr.overrideMimeType) {
			//	xhr.overrideMimeType('text/plain; charset=x-user-defined');
			//}
			xhr.onreadystatechange = function () {
				console.log(xhr.readyState.toString());
				if (xhr.readyState == 4) {
				
					//var allah = btoa(bindata);
					t.zipObject = new JSZip(xhr.response);
					t.zipObjectCreated = true;
					t.mod(argsdict);
					while (t.downloadQueue.length > 0) {
						var ad = t.downloadQueue.splice(0,1)[0];
						t.mod(ad);
					}
				}
			};
			
			xhr.send(null);
		}
	};
	t.mod = function(argsdict) {
		if (!this.zipObjectCreated) {
			if (this.srcType === ZipModder.URL) {
				this.downloadZip(argsdict, this.src);
				return;
			}
			this.zipObjectCreated = true;
			this.zipObject = new JSZip(
			(this.srcType === ZipModder.B64)? 
			window.b64toBlob(this.data, '', 512):this.data);
		}
		var i,j,text;
		var ziptmp = this.zipObject;
		for (i=0;i<t.fsOps;i++) {
			ziptmp = t.fsOps[i](ziptmp, argsdict);
		}
		for (i=0;i<t.replacers.length;i++) {
			text = ziptmp.file(t.replacers[i].loc).asText();
			window.text = text;
			for (j=0;j<t.replacers[i].changes.length;j++) {
				text = t.replacers[i].changes[j](text, argsdict);
			}
			//console.log(text);
			ziptmp.remove(t.replacers[i].loc);
			ziptmp.file(t.replacers[i].loc, text);
		}
	saveAs(ziptmp.generate({type:"blob",compression:"store"}),
			argsdict.filename);
	};
	return function(argsdict) { t.mod(argsdict); };
};

ZipModder.URL = 0;
ZipModder.BLOB = 1;
ZipModder.B64 = 2;

var replaceStyleValues = function (fileText, argsDict) {
	var i=argsDict.currentStyleSheetNum;
	fileText.replace("DemoStyle1.css", "ActiveSheet.css");
	fileText.replace("DemoStyle2.css", 
					"DemoStyle" + (1+((i + 1) % 2)).toString() + ".css");
	fileText.replace("DemoStyle3.css", 
			"DemoStyle" + (1+((i + 2) % 2)).toString() + ".css");
	fileText.replace("ActiveSheet.css", "DemoStyle" + i.toString() + ".css");
	return fileText;
};

var replaceConfigSection = function(fileText, argsDict) {
	var begin = fileText.search("//begin customized config");
	var endword = "//end customized config";
	var end = fileText.search(endword);
	return fileText.substr(0,begin) + argsDict.configCode +
			fileText.substr(end+endword.length);
};

window.downloadCallbacks = {};

//window.downloadCallbacks[JS] = new ZipModder("resources/TriFold_Example.zip",ZipModder.URL,[],[
window.downloadCallbacks[JS] = new ZipModder(window.TriFold_Example,ZipModder.B64,[],[
new Replacer("TriFold_Example/TriFold-Demo.html",
[replaceStyleValues,replaceConfigSection])
]);

//window.downloadCallbacks[GWT] = new ZipModder("resources/GWTriFold_SampleApp.zip", ZipModder.URL,[],[
window.downloadCallbacks[GWT] = new ZipModder(window.GWTriFold_Example, ZipModder.B64,[],[
new Replacer("GWTriFold_SampleApp/src/com/website/sample/client/Sample.java",
[replaceConfigSection]),
new Replacer("GWTriFold_SampleApp/src/com/website/sample/Sample.gwt.xml",
[replaceStyleValues])
]);

//-----------------------------------------------------------------

// fixed state that's not language specific, or static functions  
// only called by the language flexible ConfigDemo code.


var COL_CONSTS = ["LEFT", "CENT", "RIGHT"], 
	MODE_CONSTS = ["FIXED", "SLIDE", "CAN_MINIMIZE"],
	AVAIL_CONSTS = ["ONE_AVAILABLE", "TWO_AVAILABLE", "THREE_AVAILABLE"],
	ROLLOVER_CONSTS = ["NO_ROLLOVER", "ROLLOVER", "ROLLOVER_OPT"];
	

var CODE_SAMPLE = {
  1:{ 
	PREFACE : "private GWTriFold createGWTriFold(Panel parent,<br/> Panel leftCol, Panel centerCol, Panel rightCol) {<br/><br/>DefaultBehavior behavior = new DefaultBehavior();<br/>",
	HAS_ARGS : [["","<br/>"],["","<br/>"]],
	MIDPOINT : "GWTriFold triFold = GWTriFold.create(behavior, <div class='longindent'>leftCol, centerCol, rightCol);</div>",
	SUFFIX : "triFold.addTo(parent);<br/>return triFold;<br/>}"},
  0:{	
	PREFACE : "function createTriFold(parentDiv,<div class='longindent'>leftDiv, centDiv, rightDiv) {</div><br/>var Behavior = TriFold.DefaultBehavior;<br/>var behavior = new Behavior();<br/>",
	HAS_ARGS : [["behavior.setOpts({<div class='indent'>", "});</div>"],
				["triFold.setOpts({<div class='indent'>","});</div>"]],
	MIDPOINT : "var triFold = new TriFold(behavior, <div class='longindent'>leftDiv, centDiv, rightDiv);</div>",
	SUFFIX : "triFold.addTo(parentDiv);<br/>return triFold;</div><br/>}"}
};

var consoleLog = function(message) {
	if ("debugLog" in (window.triFold._proto_ || 
						window.triFold.constructor.prototype)) {
		window.triFold[0].debugLog("DEMO:"+message);
	}
	console.log(message);
};
//var check = function(obj, prop) {if (prop in (obj._proto_ || obj.constructor.prototype)) { return true; }return false;};

var genElement = function(parent, cname) {
	var el = document.createElement("div");
	el.className = cname;
	if (parent !== 0) { parent.appendChild(el); }
	return el;
};

var addSvg = function(parent, srckey, srcString) {	
	svgInjector.addSvgVariantsBright(parent,srckey,srcString, "");
};
//for svgs where using fill breaks it (right now logo only.
var addSvgVariantsBrightStroke = function(parent, 
					srckey, svgString) {
	svgInjector.addSvgVariants(parent, 
		[[srckey, svgString,  " brightbg", "", 0],
		[srckey, svgString," darkbg", "darkbg", 
		function(el) { 
			SVGTools.replaceStyle(
				el, ["path"], "stroke", "#FFFFFF");
		}]]);
};
function ConfigDemoJS(triFold, behavior, descriptPanel, configPanel, previewPanel) {
	var t = this;
	t._triFold = triFold;
	var i,j,col,btn;
	for (i=0;i<3;i++) { //there has to be a better way to do this.
		col = t._triFold.getCol(i);
		for (j=0;j<3;j++) {
			if (i==j){continue;}
			btn = col.getElementsByClassName("tri-fold_buttonCol" +j.toString());
			addSvg(btn[0], (j==0)?"gear-2":((j==1)?"note-11":"icon_6041"),0);
		}
	}
	var logo = document.body.getElementsByClassName("logo")[0];
	addSvgVariantsBrightStroke(logo, "logo", "", 0);
	//for some reason chrome won't display this particular svg in this particular
	// area unless we force it to redraw the block. To investigate further.
	logo.style.display = "block"; 
	logo.style.display = "inline-block"; 
	t._behavior = behavior.copy();
	t._windowLoaded = false;
	t._demoOptsBehavior = [];
	t._demoOptsVisual = [];
	t._currentDemoStyle = 1;
	t._codeDisp = [];
	
	//genElement(configPanel, "spacer");
	//genElement(previewPanel, "spacer");
	var configPanelInner = genElement(configPanel, "content configcolcontent");
	var previewPanelInner = genElement(previewPanel, "content previewcolcontent");
	
	t._previewTabpanel = new (Similitude.TabPanels)();
	var pane, codeWindow, wrapper, downloadSection, 
		downloadButton, label, info, previewHeader;
	
  var makeDownloadClickHandler = function(language) {
		var r = function() { 
			window.downloadCallbacks[language]({
				configCode:t._genDownloadCfgText(language),
				currentStyleSheetNum:t._currentDemoStyle,
				filename:((language===0)?
                 "DemoTriFoldJS.zip":"DemoGWTriFold.zip")});
		};
		return r;
  };
  for (i=0;i<2;i++) {
		pane = genElement(0, "pane");
		previewHeader = genElement(pane, "previewheader em2");
		previewHeader.innerHTML = "Code to add triFold to your page with this configuration.";
		codeWindow = genElement(pane, "codewindow");
		t._codeDisp[i] = genElement(codeWindow, "codewindow-inner");
		downloadSection = genElement(pane, "downloadsection");
		wrapper = genElement(downloadSection, "iconwrapper");
		downloadButton = genElement(wrapper, "downloadicon");
		addSvg(downloadButton, "download","",0);
		genElement(wrapper, "language").innerHTML = (i===0)? "js":"GWT";
		wrapper = genElement(downloadSection, "infowrapper");		
		info = genElement(wrapper, "downloadinfo");
		info.innerHTML = "Download a fully functional demo that uses the configurations you've set on this page.";
		downloadButton.addEventListener("click", makeDownloadClickHandler(i));
		label = document.createElement("span");
		label.innerHTML = ((i===0)?"JS":"GWT");
		label.className = "em1";
		t._previewTabpanel.appendPanel(pane,label);
	}
	previewPanelInner.appendChild(t._previewTabpanel.getElement());
	t._previewTabpanel._widthChanged();
	
	
	
	t._reloadBehavior = new (Similitude.PushButton)();
	t._reloadBehavior.setEnabled(false);
	t._reloadBehavior.getElement().className += " reloadBehaviorButton";
	
	t._buildConfigColumn(configPanelInner);
	
	
	//if we try to load ConfigDemoJS before the rest of the page's
	// resources load, we will need to scedule this call for
	//until the rest of the page loads.
	t._pickDemoStyle(t._currentDemoStyle);
	var flt = Similitude.fixedLineTool;
	t._previewTabpanel.setOnChange(function() { flt.rescan(false); });
	t._configTabpanel.setOnChange(function() { flt.rescan(false); });
	triFold.addScaleCallback(function(s) { flt.scaleCallback(s); });
	t.refresh();
}
ConfigDemoJS.StyleSelector = function() {
};

/* for dart, 5 years from now, haha.
abstract class DemoOpt {
	abstract public ComplexPanel getDisplay();
	abstract public String[] configCallStr();
	abstract public void writeChanges();
} 
*/

// void (bool, string);
ConfigDemoJS.BooleanOpt = function(defaultVal, refreshFunc) { //extends DemoOpt;
	this._display = genElement(0, "checkboxFrame");
	this._check = new (Similitude.ToggleDiv)(defaultVal);
	this._check.setDown(defaultVal);
	if (refreshFunc !== 0) //aah
	{ this._check.setOnClick(refreshFunc); }
};

ConfigDemoJS.BooleanOpt.prototype = {
	getDisplay : function() { return this._display; }
};

var getVariantsArrow = function(srckey, srcStr) {
	return [
	[srckey, srcStr, "active brightbg",	0, 0],
	[srckey, srcStr, "inactive brightbg","inactivebrightbg",
		function(el){  
			SVGTools.replaceStyle(
				el, ["path"], "stroke", "#999999");
			SVGTools.replaceStyle(
				el, ["path"], "fill", "#999999");
		}],
	[srckey, srcStr, "active darkbg","activedarkbg",
		function(el){ 
			SVGTools.replaceStyle( //c5e3dd,b7d5d0
				el, ["path"], "stroke", "#bcd0d0");
			SVGTools.replaceStyle(
				el, ["path"], "fill", "#bcd0d0"); }],
	[srckey, srcStr, "inactive darkbg","inactivedarkbg",
		function(el){
			SVGTools.replaceStyle(
				el, ["path"], "stroke", "#808080");
			SVGTools.replaceStyle(
				el, ["path"], "fill", "#808080");
		}]];
};
ConfigDemoJS.DoubleOptInfo = function(
								value, min, max, buttonInterval, descriptor) {
	var t= this;
	var el;
	t._float = true;
	t._value = value;
	t._defaultVal = value;
	t._min = min;
	t._max = max;
	t._buttonInterval = buttonInterval;
	t.descriptor = descriptor;
	t.incr = new (Similitude.PushButton)();
	el = t.incr.getElement();
	t.incr.getElement().className += " incr";
	t.incr.setEnabled(value<t._max);
	t.incr.setOnClick(function() { 
		t._onValueChange(t._value + t._buttonInterval, true); });
	svgInjector.addSvgVariants(t.incr.getFace(), 
                       getVariantsArrow("arrow-21_up",0));
	t.decr = new (Similitude.PushButton)();
	t.decr.getElement().className += " decr";
	t.decr.setEnabled(value>t._min);
	t.decr.setOnClick(function() { 
		t._onValueChange(t._value - t._buttonInterval, true); });
	svgInjector.addSvgVariants(t.decr.getFace(), 
                       getVariantsArrow("arrow-21_down",0));
	t._refresh = function() {};
	t.entry = document.createElement("input");
	t.entry.value = value;
	t.entry.setAttribute("type", "text");
	t.entry.addEventListener("keydown", function(e) { 
		t._allowNumericInputOnly(e);});
	//t.entry.addEventListener("keyup", function(e) { 
	//	t._preventDoubleDots(e);});	
	t.entry.addEventListener("blur", function() { 
		t._onValueChange(parseFloat(t.entry.value),false);});
	t.entry.className = "double-entry";
};
ConfigDemoJS.DoubleOptInfo.prototype = {
_allowNumericInputOnly : function (e) {
	var key = e.charCode || e.keyCode;
	if (!(
		key == 8 || 
		key == 9 ||
		key == 46 ||
		key == 110 ||
		(this._float && key == 190) ||
		(key >= 35 && key <= 40) ||
		(key >= 48 && key <= 57) ||
		(key >= 96 && key <= 105))) {
		e.preventDefault();
	}
	/*if (key == 190 && (true || this.entry.value.indexOf(".") !== -1)) {
		console.log(this.entry.value);
		this.entry.value = this.entry.value.replace("4","5");
	}*/
},
isDefault: function() {
	return this._value == this._defaultVal;
},
getValue : function() {
	return this._value;
},
_onValueChange : function(newVal, fromButton) {
	consoleLog("doubleOptInfo " + this.descriptor + " value change to " + 
				floatFmt(newVal) + " from button? " + fromButton.toString());
	var t = this;
	if (newVal === t._value) { return; }
	var isChange = true;
	var unexpectedChange = false;
	if (newVal > t._value ) {
		if (t._value == t._min) {
			t.decr.setEnabled(true);
		}
		if (t._value == t._max) {
			isChange = false;
		} else if (newVal >= t._max) {
			unexpectedChange = true;
			t._value = t._max;
			t.incr.setEnabled(false);
		} else {
			t._value = newVal;
		}
	} else {
		if (t._value == t._max) {
			t.incr.setEnabled(true);
		}
		if (t._value == this._min) {
			isChange = false;
		} else if (newVal <= t._min) {
			unexpectedChange = true;
			t._value = t._min;
			t.decr.setEnabled(false);
		} else {
			t._value = newVal;
		}
	}
	if (unexpectedChange || (isChange && fromButton)) {
		t.entry.value = t._value;
	}
	t._refresh();
},
setIntOnly : function(intOnly) {
	this._float = !(intOnly);
},
setValue : function(newVal) {
	this._onValueChange(newVal, true);
}	
};

ConfigDemoJS.DoubleOpt = function(optInfos, extraClasses, refreshFunc) { 
	//extends DemoOpt
	var t = this;
	t._optInfos = optInfos;

	t._display = genElement(0, "double-opt " + extraClasses + 
			(optInfos.length == 1)? " double-row":" multi-double-row");
	var entryPanel;
	for (var i=0;i<t._optInfos.length;i++) {
		t._optInfos[i]._refresh = refreshFunc;
		entryPanel = genElement(t._display, "entry-panel");
		genElement(entryPanel, "entry-label em1").innerHTML = t._optInfos[i].descriptor;
		entryPanel.appendChild(t._optInfos[i].incr.getElement());
		entryPanel.appendChild(t._optInfos[i].entry);
		entryPanel.appendChild(t._optInfos[i].decr.getElement());
	}	
};

ConfigDemoJS.DoubleOpt.prototype = {
getDisplay : function() {
	return this._display;
},
_getValues : function() {
	var results = [];
	for (var i=0;i<this._optInfos.length;i++) 
	{ results.push(this._optInfos[i].getValue()); }
	return results;
},
isDefault: function() {
	for (var i=0;i<this._optInfos.length;i++) {
		if (!(this._optInfos[i].isDefault())) {
			return false;
		}
	}
	return true;
},
isApplicable: function() { return true; },
_valuesAsString : function(isJS) {
	var vals = this._getValues();
	var result = ((isJS)?"[":"new double[]{") + floatFmt(vals[0]);
	for (var i=1;i<vals.length;i++)
	{ result += (", " + floatFmt(vals[i])); }
return result + ((isJS)?"]":"}");		
}
};

ConfigDemoJS.BehaviorNet = function() {
	//nodeOpt
	//firstLayoutOpt
	//secondLayoutOpt
	//secondVisOpt
	//rolloverOpt
	//thirdVisOpt
	//thirdOrderOpt
};

ConfigDemoJS.ModeOpt = function(defaultVal, bhvNet, refreshFunc) { //extends DemoOpt
	var t = this;
	t._value = defaultVal;
	t._defaultVal = defaultVal;
	t._sb = new (Similitude.SelectBox)();
	t._sb.appendStr("Fixed");
	t._sb.appendStr("Slide");
	t._sb.appendStr("Minimize");	
	t._sb.selectIndex(defaultVal);
	t._sb.addedToDom();
	t._display = genElement(0, "modeOpt dropDownRow");
	t._display.appendChild(t._sb.getElement());
	t._sb.setOnChangeCallback(function() {
		t.onChange(); });
	t._bhvNet = bhvNet;
	t._refresh = refreshFunc;
};

ConfigDemoJS.ModeOpt.prototype = {
configStr : function() {
	var results = ["ModeAll:[Behavior." + 
					window.MODE_CONSTS[this._value] + "]", 
					"behavior.setModeAll(DefaultBehavior." + 
					window.MODE_CONSTS[this._value] + ");"];
	return results;
},
getDisplay: function() { return this._display; },
getValue : function() { return this._value; },
isApplicable : function() { return true; },
isDefault : function() { return this._value == this._defaultVal; },
onChange : function() { 
	var t = this;
	var newMode = t._sb.getSelectedIndex();
	var notFixed = (newMode !== 0);
	t._bhvNet.secondVisOpt.setMode(newMode);
	t._bhvNet.rolloverOpt.setEnabled(notFixed);
	t._bhvNet.thirdVisOpt.setMode(newMode);
	t._bhvNet.thirdOrderedOpt.setEnabled(newMode == 2);
	t._value = newMode;
	t._refresh();
},
setValue : function(newVal) { 
  this._value = newVal; 
  this._sb.selectIndex(newVal); 
},
writeChanges : function(behavior) { 
	for (var i=0;i<3;i++) 
	{ behavior.setMode(i, this._value);}
}
};

ConfigDemoJS.FirstLayoutOpt = function(defaultVal, bhvNet, refreshFunc) { //extends DemoOpt
	var t = this;
	t._value = defaultVal;
	t._defaultVal = defaultVal;
	t._sb = new (Similitude.SelectBox)();
	t._sb.appendStr("Left");
	t._sb.appendStr("Center");
	t._sb.appendStr("Right");	
	t._sb.selectIndex(defaultVal);
	t._sb.addedToDom();
	t._display = genElement(0, "firstLayoutOpt dropDownRow");
	t._display.appendChild(t._sb.getElement());
	t._sb.setOnChangeCallback(function() {
		t.onChange(); });
	t._bhvNet = bhvNet;
	t._refresh = refreshFunc;
};

ConfigDemoJS.FirstLayoutOpt.prototype = {
configStr : function() {
	return [ "DefaultOneCol:[TriFold." + 
				window.COL_CONSTS[this._value] + "]",
			"behavior.setDefaultOneCol(GWTriFold" + 
				window.COL_CONSTS[this._value] + ");"];
},
getDisplay: function() { return this._display; },
getValue : function() { return this._value; },
isApplicable : function() { return true; },
isDefault : function() { return this._value == this._defaultVal; },
onChange : function() { 
	this._value =  this._sb.getSelectedIndex();
	this._refresh();
},
setValue : function(newVal) { 
  this._value = newVal; 
  this._sb.selectIndex(newVal); 
},
writeChanges : function(behavior) { 
	behavior.setDefaultOneCol(this._value);
}
};

ConfigDemoJS.SecondLayoutOpt = function(defaultVals, bhvNet, refreshFunc) { //extends DemoOpt
	var t = this;
	t.EMPTY = 3;
	t._values = [3,3];
	t._selectBoxes = [];
	t._display = genElement(0, "secondlayoutopt dropDownRow");
	var sb;
  var makeLayoutChangeCallback = function(posnum) {
    var r = function() { t._secondLayoutChange(posnum); }; 
    return r; 
  };
	for (var i=0;i<2;i++) {
		sb = new (Similitude.SelectBox)();
		sb.appendStr("Left");
		sb.appendStr("Center");
		sb.appendStr("Right");	
		if (i < defaultVals.length) 
		{ t._values[i] = defaultVals[i]; }
		sb.selectIndex(t._values[i]);
		sb.addedToDom();
		sb.setOnChangeCallback(makeLayoutChangeCallback(i));
		t._display.appendChild(sb.getElement());
		t._selectBoxes.push(sb);
	}
	
	t._defaultOut = t._toArrayShort();
	t._bhvNet = bhvNet;
	t._refresh = refreshFunc;
};

ConfigDemoJS.SecondLayoutOpt.prototype = {
configStr : function() {
	var args = this._toArrayShort();
	var results = ["DefaultTwoCol:[[",
					"behavior.setDefaultTwoCol(new int[] {"];
	for (var i=0; i<args.length; i++) {
		results[0] += ((i==1)? ", ":"") + 
					"TriFold." + window.COL_CONSTS[args[i]];
		results[1] += ((i==1)? ", ":"") + 
					"GWTriFold." + window.COL_CONSTS[args[i]];
	}
	results[0] +="]]";
	results[1] +="});";	
	return results;
},
getDisplay: function() { return this._display; },
getColumns : function() { return this._values.slice(0); },
isApplicable : function() { return true; },
isDefault : function() { 
	var out=this._toArrayShort();
	if (out.length !== this._defaultOut.length) { return false; }
	for (var i=0;i<out.length;i++) {
		if (this._defaultOut[i] !== out[i]) { return false; }}
	return true;
},
_secondLayoutChange : function(posNum) { 
	var t = this;
	var newCol = t._selectBoxes[posNum].getSelectedIndex();
	//console.log("second layout change at posnum " + posNum.toString() + 
	//" to newcol " + newCol.toString());
	var oldpos = t._values[posNum]; 
	//necessary to change it up here, otherwise changes applied below 
	//may trigger callback in other selectbox which get the wrong 
	//vision of current situation
	t._values[posNum] = newCol;
	if (t._values[1-posNum] == newCol) {
		if (newCol == 3 || t._values[posNum] == 3) {
			t._values[1-posNum] = (newCol + 1) % 3;
		} else {
			t._values[1-posNum] = oldpos;
		}
		t._selectBoxes[1-posNum].selectIndex(t._values[1-posNum]);
	}
	t._bhvNet.secondVisOpt.changedNumberOfColumns();
	t._refresh();
},
setColumns : function(newCols) {
	if (newCols.length < 1 || newCols.length > 2) { return;}
	for (var i=0;i<2;i++) {
		if (i>=newCols.size()) { newCols.push(3); }
		if (newCols[i] !== this._values[i]) { 
			this._selectBoxes.selectIndex(newCols[i]);
		}
	}
},
_toArrayShort : function() {
	var results = [];
	for (var i=0;i<2;i++) {
		if (this._values[i] !== 3) 
		{ results.push(this._values[i]); }}
	return results;
},
writeChanges : function(behavior) { 
	behavior.setDefaultTwoCol(this._toArrayShort());
}
};

ConfigDemoJS.SecondVisOpt = function(defaultVals, mode, bhvNet, refreshFunc) {
	var t = this;
	t._display = genElement(0, "checkboxrow secondVisOpt");
	t._values = defaultVals;
	t._checks = [];
	t._enabled = [true, true];
	t._bhvNet = bhvNet;
	t._refresh = refreshFunc;
	
  var makeVisChangeCallback = function(posnum) {
			var r=function() { t._secondVisClick(posnum); };
			return r;
  };
	for (var i=0;i<2;i++){
		t._checks[i] = new (Similitude.ToggleDiv)(defaultVals[i]);
		t._checks[i].setOnClick(makeVisChangeCallback(i));
		t._display.appendChild(t._checks[i].getElement());
	}
	//if we have one selected and are on can_minimize,
	//we want to disable the other now, and not wait until
	//there's some change in another option to trigger this:
	t.setMode(mode);
	t._defaultOut = t._toCols();
};

ConfigDemoJS.SecondVisOpt.prototype = {
changedNumberOfColumns : function() {
	this.setMode(this._mode);
},
configStr : function() {
	if (!this._enabled[0] && !this._enabled[1]) { return ["",""]; }
	var results = ["VisTwoCol:[[",
				"behavior.setVisTwoCol(new int[]{"];
	var cols = this._toCols();
	for (var i=0; i<cols.length; i++) {
		results[0] += ((i==1)? ", ":"") + 
				"TriFold." + window.COL_CONSTS[cols[i]];
		results[1] += ((i==1)? ", ":"") + 
				"GWTriFold." + window.COL_CONSTS[cols[i]];
	}
	results[0] += "]]";
	results[1] += "});";
	return results;
},
getDisplay : function() 
{ return this._display; },
isApplicable : function() { 
	return this._mode !== TriFold.DefaultBehavior.FIXED; 
},
isDefault : function() { 
	var out = this._toCols();
	if (out.length !== this._defaultOut.length) { return false; }
	for (var i=0;i<out.length;i++) {
		if (this._defaultOut.indexOf(out[i]) == -1) { return false; }}
	return true;
},
_secondVisClick : function(posNum) {
	var t = this;
	t._values[posNum] = t._checks[posNum].isDown();
	var numAlwaysVis = (t._enabled[0] && t._values[0])?1:0 + 
						(t._enabled[1] && t._values[1])?1:0;
	t._bhvNet.rolloverOpt.setEnabled(numAlwaysVis == 1 || 
		(numAlwaysVis===0 && t._mode == TriFold.DefaultBehavior.SLIDE));
	t.setMode(t._mode);
	t._refresh();
},
_setEnabled : function(first, second, newMode) {
  var t = this;
	t._checks[0].setEnabled(first);
	t._checks[1].setEnabled(second);
	t._enabled = [first, second];
	var numAlwaysVis = (t._enabled[0] && t._values[0])?1:0 + 
						(t._enabled[1] && t._values[1])?1:0;
	t._bhvNet.rolloverOpt.setEnabled(numAlwaysVis == 1 ||
			(numAlwaysVis===0 && newMode == TriFold.DefaultBehavior.SLIDE)) ;
},
setMode : function (newMode) {
	var t = this;
	if (newMode == TriFold.DefaultBehavior.FIXED) { 
		t._setEnabled(false, false, newMode);
		t._mode = newMode;
		return;
	}
	var cols = t._bhvNet.secondLayoutOpt.getColumns();
	if (cols[0] < 3 && cols[1] == 3) { 
		if (t._mode !== newMode) { t._values[1] = false; }
		t._setEnabled(true, false, newMode); 
	} else if (cols[0] === 3 && cols[1] < 3) { 
		if (t._mode != newMode) { t._values[0] = false; }
		t._setEnabled(false, true, newMode); 
	} else if (newMode == TriFold.DefaultBehavior.SLIDE) { 
		t._setEnabled(true, true, newMode); 
	} else if (t._values[0]) //both set or first set only
		{ t._setEnabled(true, false, newMode); }					
	else if (t._values[1])  //last set true
		{ t._setEnabled(false, true, newMode); }
	else
		{ t._setEnabled(true, true, newMode); }
	t._mode = newMode;
},
_toCols : function() {
	var out = [];
	var cols = this._bhvNet.secondLayoutOpt.getColumns();
	for (var i=0;i<2;i++) {
		if (this._values[i] && this._enabled[i]) {
			out.push(cols[i]); }}
	return out;
},
writeChanges : function(behavior) {
	behavior.setVisTwoCol(this._toCols());
}};

ConfigDemoJS.RolloverOpt = function(
			defaultVal, bhvNet, refreshFunc) {
	var t = this;
	t._value = defaultVal;
	t._defaultVal = defaultVal;
	t._display = genElement(0, "checkboxrow rollover");
	t._check = new (Similitude.ToggleDiv)(defaultVal);
	t._display.appendChild(t._check.getElement());
	t._enabled = true;
	t._check.setOnChange(function() { t._onChanged(); });
	t._bhvNet = bhvNet;
	t._refresh = refreshFunc;
};

ConfigDemoJS.RolloverOpt.prototype = {
configStr : function() {
	return ["RolloverTwoCol:[Behavior." +
	window.ROLLOVER_CONSTS[(this._value)?1:0] + "]",
	"behavior.setRolloverTwoCol(DefaultBehavior." + 
	window.ROLLOVER_CONSTS[(this._value)?1:0] + ");" ];
},
getDisplay : function() 
	{ return this._display; },
isChecked : function() 
	{ return this._value; },
isApplicable : function() { return this._enabled; },
isDefault : function()
	{ return this._value == this._defaultVal; },
setChecked : function(checked)
	{ this._check.setDown(checked); },
setEnabled : function(enabled) {
	this._check.setEnabled(enabled);
	this._enabled = enabled;
},
_onChanged : function() {
	this._value = this._check.isDown();
	this._refresh();
},
writeChanges : function(behavior) {
	//we want to make sure that if we're in can_available at 0 vis,
	//rollover is set to FALSE as as of now that's undefined behavior
	//in triFold + even if it was defined, the user wouldn't expect it.
	
	behavior.setRolloverTwoCol((this._enabled && this.value)?1:0); 
}
};

ConfigDemoJS.ThirdVisOpt = function(defaultVals, mode, bhvNet, refreshFunc) {
	var t = this;
	t._display = genElement(0, "checkboxrow thirdvis");
	t._mode = mode;
	t._values = defaultVals;
	t._checks = [];
	t._enabled = [true, true, true];
  var makeThirdVisCallback = function(posnum) {
			var r = function() {
				t._thirdVisClick(posnum);
			};
			return r;
  };
	for (var i=0;i<3;i++) {
		t._checks.push(new (Similitude.ToggleDiv)(defaultVals[i]));
		t._checks[i].setOnClick(makeThirdVisCallback(i));
		t._display.appendChild(t._checks[i].getElement());
	}
	t._bhvNet = bhvNet;
	t._refresh = refreshFunc;
	t._defaultOut = t._toCols();
};

ConfigDemoJS.ThirdVisOpt.prototype = {
configStr : function() {
	var t = this;
	if (t._enabled.indexOf(true) === -1) 
	{ return ["",""]; }
	var results = ["VisThreeCol:[[",
						"behavior.setVisThreeCol(new int[]{"];
	var cols = t._toCols();
	for (var i=0;i<cols.length;i++) {
		results[0] += ((i>=1)?", ":"") + "TriFold." +
				window.COL_CONSTS[cols[i]];
		results[1] += ((i>=1)?", ":"") + "GWTriFold." +
				window.COL_CONSTS[cols[i]];
	}
	results[0] += "]]";
	results[1] += "});";
	return results;
},
getDisplay : function() 
{ return this._display; },
_setEnabled : function(first, second, third) {
	this._enabled = [first, second, third];
	for (var i=0;i<3;i++) 
	{ this._checks[i].setEnabled(this._enabled[i]);}
},
isApplicable : function() 
{ return this._mode == TriFold.DefaultBehavior.CAN_MINIMIZE; },
isDefault : function() {
	var out = this._toCols();
	if (out.length !== this._defaultOut.length) { return false; }
	for (var i=0;i<out.length;i++) {
		if (this._defaultOut.indexOf(out[i]) == -1) { return false; }}
	return true;
},
setMode : function(newMode) {
	var t = this;
	if (newMode == TriFold.DefaultBehavior.FIXED ||
			newMode == TriFold.DefaultBehavior.SLIDE) {  
		t._setEnabled(false, false, false); 
		t._mode = newMode; 
		return; 
	}
	if (t._values[0] && t._values[1]) {
		t._values[2] = false;
		t._setEnabled(true, true, false);
	} else if (t._values[0] && t._values[2]) {
		t._setEnabled(true, false, true);
	} else if (t._values[1] && t._values[2]) {
		t._setEnabled(false, true, true);
	} else {
		t._setEnabled (true, true, true);
	}
	t._mode = newMode;
},
_thirdVisClick : function(posnum) {
	this._values[posnum] = this._checks[posnum].isDown();
	//console.log("third vis click (posnum: " + posnum.toString() + 
	//") new value is " + this._values[posnum].toString());
	this.setMode(this._mode);
	this._refresh();
},
_toCols : function() {
	var results = [];
	var cols = [TriFold.LEFT, TriFold.CENT, TriFold.RIGHT];
	for (var i=0;i<3;i++) {
		if (this._values[i] && this._enabled[i]) 
		{ results.push(cols[i]); }}
	return results;
},
writeChanges : function(behavior) {
	behavior.setVisThreeCol(this._toCols());
}

};

ConfigDemoJS.ThirdOrderedOpt = function(
					defaultVal, bhvNet, refreshFunc) {
	var t = this;
	t._display = genElement(0, "checkboxrow thirdordered");
	t._value = defaultVal;
	t._defaultVal = defaultVal;
	t._check = new (Similitude.ToggleDiv)(defaultVal);
	t._check.setOnClick(function() { t.onClick();});
	t._display.appendChild(t._check.getElement());
	t._enabled = true;
	t._bhvNet = bhvNet;
	t._refresh = refreshFunc;
};
ConfigDemoJS.ThirdOrderedOpt.prototype = {
configStr : function() {
	if (!this._enabled) { return ["", ""]; }
	return ["OrderedThreeCol:[" + this._value.toString() + "]",
			"behavior.setOrderedThreeCol(" + this._value.toString() + ");" ];
},
getDisplay: function() 
{ return this._display; },
isChecked : function() 
{ return this._value; },
isApplicable : function() 
{ return this._enabled; },
isDefault : function() 
{ return this._value == this._defaultVal; },
onClick : function() { 
	this._value = this._check.isDown();
	this._refresh();
},	
setChecked : function(checked) {
	this._value = checked;
	this._check.setDown(checked);
},
setEnabled : function(enabled) {
	this._check.setEnabled(enabled);
	this._enabled = enabled;
},
writeChanges : function(behavior) {
	if (this._enabled)
	{ behavior.setOrderedThreeCol(this._value); }
}
};

ConfigDemoJS.StyleSelector = function(styleLabels, defaultSelected, 
							stylecallback) {
	var t = this;
	t._elem = genElement(0, "styleSelector");
	var makeClickCallback = function(stylenum) {
		var r = function() { t.setStyle(stylenum); };
		return r;
	};
	
	var btn;
	t._stylecallback = stylecallback;
	t._styleButtons = [];
	for (var i=0;i<styleLabels.length;i++) {
		btn = new (Similitude.PushButton)();
		btn.setOnClick(makeClickCallback(i));
		btn.getFace().innerHTML=styleLabels[i];
		t._elem.appendChild(btn.getElement());
		t._styleButtons.push(btn);
	}
	t._styleButtons[defaultSelected].setEnabled(false);
}

ConfigDemoJS.StyleSelector.prototype = {
getElement: function()
{  return this._elem; },
setStyle : function(stylenum) {
	this._stylecallback(stylenum);
	for (var i=0;i<this._styleButtons.length;i++) {
		this._styleButtons[i].setEnabled(i !== stylenum);
	}
}
};


ConfigDemoJS.prototype = {
_pickDemoStyle : function(styleNum) {
	//console.log("pick demo style called with stylenum " +
	//styleNum.toString());
	var offset = 1; //where the first demo style begins.
	var count=3; //number of demo styles
	var el = this._triFold.getElement();
	if (styleNum == 3) {
		el.className = classListRemove(el.className, "brightbgarea");
		el.className += " darkbgarea";
	} else {
		el.className = classListRemove(el.className, "darkbgarea");
		el.className += " brightbgarea";
	}
	for (var i=offset;i<(offset+count);i++) {
		document.styleSheets[i].disabled = 
			(styleNum+(offset-1)==i)? false: true;
	}
	if (styleNum == 1) {
		this._configTabpanel.setSquareMode(true);
		this._previewTabpanel.setSquareMode(true);
	} else {
		this._configTabpanel.setSquareMode(false);
		this._previewTabpanel.setSquareMode(false);
	}
	this._currentDemoStyle = styleNum;
},
_genDownloadCfgText : function(language) {
	var result = this._codeDisp[language].innerHTML;
	//console.log("cfg 1::\n" + result);
	var outerindent = "\n\t";
	var newline ="\n\t\t";
	
	//first replace last newline with outerident for last paren.
	result = result.replace(/((<br>)?\s*<br\s*\/>|<br>)\s*}[^}]*$/, outerindent + "}");
	result = result.replace(/(<br>)?\s*<br\s*\/>/g, newline);
	result = result.replace(/<br>/g, newline);
	result = result.replace(/<\/?div>/g, newline);
	result = result.replace(/<div\s+class=['"]longindent['"]\s*>/g, 
										newline +"\t\t");
	result = result.replace(/<div\s+class=['"]indent['"]\s*>/g, 
										newline +"\t");
	result = outerindent + result;
	//console.log("cfg 2::" + result);
	return result;
},
refresh : function() {
	var t=this;
	consoleLog("refresh called!");
	var i,j,o,g,strs = [[],[]];
	var tgt = [t._demoOptsBehavior, t._demoOptsVisual],
		tgtArg = [t._behavior, t._triFold];
	for (g=0; g<2; g++) {
		for (o=0;o<tgt[g].length;o++) {
			tgt[g][o].writeChanges(tgtArg[g]);
			if (tgt[g][o].isApplicable() &&
			(!(tgt[g][o].isDefault()))) {
				strs[g].push(tgt[g][o].configStr());
			}
		}
	}
	var printout = function(tgt_strs,i) {
		var string="";
		for (j=0;j<tgt_strs.length;j++) { 
			//console.log("wwiv" + t._configCodeRaw[i]);
			string += ((i == JS && j>0 && j+1<=tgt_strs.length)?",":"") +
						((j>0)?"<br/>":"") + 
						((j>0 && i==JS)?"\t":"") + 
						tgt_strs[j][i]; }		
		return string;
	};
	var argtxt;
	for (i=0;i<2;i++) {
		argtxt = CODE_SAMPLE[i].HAS_ARGS;
		t._codeDisp[i].innerHTML =
			CODE_SAMPLE[i].PREFACE + 
			((strs[0].length > 0)? 
			(argtxt[0][0] + printout(strs[0],i, console) + argtxt[0][1]):"") +
			CODE_SAMPLE[i].MIDPOINT + 
			((strs[1].length > 0)? 
			(argtxt[1][0] + printout(strs[1],i, console) + argtxt[1][1]):"") +
			CODE_SAMPLE[i].SUFFIX;
	}
	t._triFold.redraw();
},
_buildConfigColumn : function(column) {
	var xy, nesw; //float[2], float[4]
	var scalar;
	var i;
	var paneName;
	var t = this;
	var r = function() { t.refresh(); };
	var rb = function() { 
		t._reloadBehavior.setEnabled(true);
		t.refresh(); 
	};
	
	var tabpanel = new (Similitude.TabPanels)();
	t._configTabpanel = tabpanel;
	var visualPane = genElement(0, "visualconfig");
	
	var DoubleOptInfo = ConfigDemoJS.DoubleOptInfo;
	var DoubleOpt = ConfigDemoJS.DoubleOpt;
	
	var genLabel = function(parent, extraClasses, text) {
		//console.log("generating element with text " + text);
		var label = genElement(parent, "label " + extraClasses);
		label.innerHTML = text;
	};
	var genFrame = function(parent, extraClasses, text, widget, visual) {
		//console.log("genFrame:" + extraClasses);
		var frame = genElement(parent, extraClasses);
		if (text !== 0) 
			{ genLabel(frame, "em2", text); }
		frame.appendChild(widget.getDisplay());
		if (visual) {
			t._demoOptsVisual.push(widget);
		} else {
			t._demoOptsBehavior.push(widget);
		}
	};
	
	genLabel(visualPane, "em2","Pick an example stylesheet for your demo:");
	pickstyleCallback = function(stylenum) {
		t._pickDemoStyle(stylenum+1);
	}
	var styleSel = new (ConfigDemoJS.StyleSelector)(
						["one","two","three"], 0,
										pickstyleCallback);
	visualPane.appendChild(styleSel.getElement());
	
	genLabel(visualPane, "em2","Customize the proportions of your app");	
	xy = t._triFold.getMinColDimensions();
	window.changedMinColRes(xy); 
	//graceful degradation 
	//in case we change the default in the future.	
	var mincolres = new DoubleOpt([
						new DoubleOptInfo(xy[0], 240, 480, 10, "X"),
						new DoubleOptInfo(xy[1], 360, 720, 10, "Y") ], "", r);
	mincolres.configStr = function() { 
		return [
		"MinColDimensions:[" + this._valuesAsString(true) + "]",
		"triFold.setMinColDimensions(" + this._valuesAsString(false) + ");"];
	};
	mincolres.writeChanges = function(triFold) {
		var vals = this._getValues();
		window.changedMinColRes(vals);
		triFold.setMinColDimensions(vals);
		t._previewTabpanel._widthChanged();
		t._configTabpanel._widthChanged();
	};
	genFrame(visualPane, "mincolres", "column dimensions", mincolres, true);
	
	scalar = t._triFold.getColSpacing();
	var colspacing = new DoubleOpt(
			[new DoubleOptInfo(scalar, 0, 150, 4, "")],
				"", r);
	colspacing.configStr = function() {
		var strval = this._optInfos[0].getValue().toString();
		return ["ColSpacing:[" + strval + "]",
				"triFold.setColSpacing(" + strval + ");"];
	};
	colspacing.writeChanges = function(triFold) 
	{triFold.setColSpacing(this._optInfos[0].getValue()); };
	genFrame(visualPane, "colspacing", "column spacing", colspacing, true);
	
	nesw = t._triFold.getMargins();
	var margin = new DoubleOpt([
				new DoubleOptInfo(nesw[0], 0, 250, 10, "N"),
				new DoubleOptInfo(nesw[1], 0, 350, 10, "E"),
				new DoubleOptInfo(nesw[2], 0, 250, 10, "S"),
				new DoubleOptInfo(nesw[3], 0, 350, 10, "W")], "", r);
	margin.configStr = function() {
		return ["Margins:[" + this._valuesAsString(true) + "]",
				"triFold.setMargins(" + this._valuesAsString(false) + ");"];
	};
	margin.writeChanges = function(triFold) 
	{ triFold.setMargins(this._getValues()); };
	genFrame(visualPane, "margins", "margins", margin, true);
		
	nesw = t._triFold.getPadding();
	var padding = new DoubleOpt([
			new DoubleOptInfo(nesw[0], 0, 250, 10, "N"),
			new DoubleOptInfo(nesw[1], 0, 350, 10, "E"),
			new DoubleOptInfo(nesw[2], 0, 250, 10, "S"),
			new DoubleOptInfo(nesw[3], 0, 350, 10, "W")], "", r);
	padding.configStr = function() {
		return ["Padding:[" + this._valuesAsString(true) + "]",
				"triFold.setPadding(" + this._valuesAsString(false) + ");"];
	};
	padding.writeChanges = function(triFold) 
	{ triFold.setPadding(this._getValues()); };
	genFrame(visualPane, "padding", "padding", padding, true);
	
	/*
	scalarInt = t._triFold.getSlidespeed();
	var slidespeed = new DoubleOpt(
			[new DoubleOptInfo(scalarInt, 0, 3000, 100, "")], "", r);
	slidespeed.setIntOnly = true;
	slidespeed.configStr = function() {
		var strval = this._optInfos[0].getValue().toString();
		return ["Slidespeed:[" + strval + "]",
				"triFold.setSlidespeed(" + strval + ");"];
	};
	slidespeed.writeChanges = function(triFold) {
		triFold.setSlidespeed(this._optInfos[0].getValue().toString());
	};
	genFrame(visualPane, "slidespeed", "column slide speed", slidespeed, true);
	*/
	
	//PushButton freezeButton = new PushButton("FREEZE");
	//freezeButton.addClickHandler(new FreezeHandler());
	//lengthsPanel.add(freezeButton);

	//PushButton debugPrintButton = new PushButton("PRINT DEBUG");
	//debugPrintButton.addClickHandler(new DebugPrintHandler());
	//lengthsPanel.add(debugPrintButton);
	paneName = document.createElement("span");
	paneName.innerHTML = "Appearance";
	paneName.className = "em1";
	tabpanel.appendPanel(visualPane, paneName);
	
	var behaviorPane = genElement(0, "behaviorconfig");
	
	var bhvNet = new (ConfigDemoJS.BehaviorNet)();
	bhvNet.firstLayoutOpt = new (ConfigDemoJS.FirstLayoutOpt)(
								t._behavior.getDefaultOneCol(), bhvNet, rb);
	bhvNet.secondLayoutOpt = new (ConfigDemoJS.SecondLayoutOpt)(
								t._behavior.getDefaultTwoCol(), bhvNet, rb);
	bhvNet.modeOpt = new (ConfigDemoJS.ModeOpt)(
				t._behavior.getMode(TriFold.DefaultBehavior.TWO_AVAILABLE), 
				bhvNet, rb);
	bhvNet.rolloverOpt = new (ConfigDemoJS.RolloverOpt)(
							t._behavior.getRolloverTwoCol(), bhvNet, rb);
	bhvNet.thirdOrderedOpt = new (ConfigDemoJS.ThirdOrderedOpt)(
							t._behavior.getOrderedThreeCol(), bhvNet, rb);
	
	var visTwoCol = t._behavior.getVisTwoCol();
	var layoutTwoCol = t._behavior.getDefaultTwoCol();
	var visByPosTwo = [false,false];
	//triFold's API actually represents visibility as a list of 
	//all column enums with Always Visible set to on.
	for (i=0;i<layoutTwoCol.length;i++) {
		if (visTwoCol.indexOf(layoutTwoCol[i]) !== -1)
			{ visByPosTwo[i] = true; }}
				
	bhvNet.secondVisOpt = new (ConfigDemoJS.SecondVisOpt)(
				visByPosTwo,bhvNet.modeOpt.getValue(), bhvNet, rb);
		
	var visThreeCol = t._behavior.getVisThreeCol();
	var visByPosThree = [false,false,false];
	var layoutThreeCol = [TriFold.LEFT,TriFold.CENT,TriFold.RIGHT];

	for (i=0;i<layoutThreeCol.length;i++) {
		if (visThreeCol.indexOf(layoutThreeCol[i]) !== -1)
			{ visByPosThree[i] = true; }}
	bhvNet.thirdVisOpt = new (ConfigDemoJS.ThirdVisOpt)(
				visByPosThree,bhvNet.modeOpt.getValue(), bhvNet, rb);
	
	var tbl = document.createElement("table");
	var strsToDiv = function(maybeStr) {
		var el = maybeStr;
		if (typeof el == 'string' || el instanceof String) {
			el = document.createElement("div");
			el.className = "bhvlabel";
			el.innerHTML = maybeStr;
		} else {
			if (!("notAWidget" in el)) {
				t._demoOptsBehavior.push(el);
				return el.getDisplay();
			}
		}
		return el;
	};
	var genRow = function(table, style, els) {
		var el,cell, row = document.createElement("tr");
		for (var i=0;i<2;i++) {
			cell=document.createElement("td");
			el = strsToDiv(els[i]);
			cell.appendChild(el);
			row.appendChild(cell);
		}
		row.className = style;
		table.appendChild(row);
	};
	var genMergeRow = function(table, style, el) {
		var row = document.createElement("tr");
		var cell = document.createElement("td");
		cell.setAttribute("colspan", "2");
		cell.appendChild(strsToDiv(el));
		row.appendChild(cell);
		row.className = style;
		table.appendChild(row);
	};
	genRow(tbl, "modeopt", 
			["column movement", bhvNet.modeOpt]);
	genMergeRow(tbl, "colsavail em2",
		"one column available");
	genRow(tbl, "firstlayoutopt", 
			["Initial Layout", bhvNet.firstLayoutOpt]);
	genMergeRow(tbl, "colsavail em2", 
		"two columns available");
	genRow(tbl, "secondlayoutopt", 
			["Initial Layout", bhvNet.secondLayoutOpt]);	
	genRow(tbl, "secondvisopt", 
			["always visible?", bhvNet.secondVisOpt]);
	genRow(tbl, "rolloveropt", 
			["fold over", bhvNet.rolloverOpt]);
	genMergeRow(tbl, "colsavail em2", 
		"three columns available");
	var colnames = genElement(0, "colnames");
	genLabel(colnames, "left", "left"); 
	genLabel(colnames, "center", "center");
	genLabel(colnames, "right", "right");
	colnames.notAWidget = true;
	genRow(tbl, "thirdlayout", ["Initial Layout", colnames]);
	genRow(tbl, "thirdvisopt", 
			["always visible?", bhvNet.thirdVisOpt]);
	genRow(tbl, "thirdorderedopt", 
			["keep L->R order", bhvNet.thirdOrderedOpt]);
	behaviorPane.appendChild(tbl);
	
	behaviorPane.appendChild(t._reloadBehavior.getElement());
	t._reloadBehavior.getFace().innerHTML = " apply behavior ";
	t._reloadBehavior.setOnClick(function() {
		t._triFold.setBehavior(t._behavior);
		t._behavior = t._behavior.copy();
		t._reloadBehavior.setEnabled(false);
	});
	
	
	genLabel(behaviorPane, "","click this button to reset " +
		" the layout as if you just loaded a page with these settings");
		
	paneName = document.createElement("span");
	paneName.innerHTML = "Behavior";
	paneName.className = "em1";
	tabpanel.appendPanel(behaviorPane, paneName);
  column.appendChild(tabpanel.getElement());
  tabpanel._widthChanged();
}

};
