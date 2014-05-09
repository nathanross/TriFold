/** 
Similitude/src/Similitude.js
A library of cross-browser, transform-scalable widgets
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


// section notation
// :section<used by>
// we do 'used by' instead of 'dependent on' because it's easy to see
// dependency referentially from the content of a section. not so much 
// which other sections use it.

// dependency are defined in this JS file. The CSS file has the same section
// names, but will be tree-shaken according to the dependency relations
// established w-in the JS file.

//BEGIN:BROWSER<SVG,FLT>

/* 
* browser detection is used here for two use cases:
* detecting browsers we KNOW TriFold won't work with, 
	and notifying the user what upgraded version we *do* support.
* although CSS implementation is consistent before CSS transform scaling,
* many browsers use different tricks or approaches for scaling,
* or tricks or approaches for normal rendering that with distinct results
* that only occur in scaling. 

* E.g. an interesting problem: if scaling up a div by a non-integer number,
* if there are two parallel single pixel lines within that div (e.g. a border)
* subpixel rendering may not be used and instead one line might be 2px while
* the other is 1px.

* There are certain everyday div decorations that are founded on the ability
* to draw lines with particular width and height, and those decorations require
* particular techniques for their intent to remain within different browsers
* under a CSS scale transform.
*/

var bowser = {}; //hinting issues regarding this.
//bowser.js -- MIT license.

!function(e,t){typeof define=="function"?define(t):typeof module!="undefined"&&module.exports?module.exports.browser=t():this[e]=t()}("bowser",function(){function g(){return n?{name:"Internet Explorer",msie:t,version:e.match(/(msie |rv:)(\d+(\.\d+)?)/i)[2]}:l?{name:"Opera",opera:t,version:e.match(d)?e.match(d)[1]:e.match(/opr\/(\d+(\.\d+)?)/i)[1]}:r?{name:"Chrome",webkit:t,chrome:t,version:e.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)[1]}:i?{name:"PhantomJS",webkit:t,phantom:t,version:e.match(/phantomjs\/(\d+(\.\d+)+)/i)[1]}:a?{name:"TouchPad",webkit:t,touchpad:t,version:e.match(/touchpad\/(\d+(\.\d+)?)/i)[1]}:o||u?(m={name:o?"iPhone":"iPad",webkit:t,mobile:t,ios:t,iphone:o,ipad:u},d.test(e)&&(m.version=e.match(d)[1]),m):f?{name:"Android",webkit:t,android:t,mobile:t,version:(e.match(d)||e.match(v))[1]}:s?{name:"Safari",webkit:t,safari:t,version:e.match(d)[1]}:h?(m={name:"Gecko",gecko:t,mozilla:t,version:e.match(v)[1]},c&&(m.name="Firefox",m.firefox=t),m):p?{name:"SeaMonkey",seamonkey:t,version:e.match(/seamonkey\/(\d+(\.\d+)?)/i)[1]}:{}}var e=navigator.userAgent,t=!0,n=/(msie|trident)/i.test(e),r=/chrome|crios/i.test(e),i=/phantom/i.test(e),s=/safari/i.test(e)&&!r&&!i,o=/iphone/i.test(e),u=/ipad/i.test(e),a=/touchpad/i.test(e),f=/android/i.test(e),l=/opera/i.test(e)||/opr/i.test(e),c=/firefox/i.test(e),h=/gecko\//i.test(e),p=/seamonkey\//i.test(e),d=/version\/(\d+(\.\d+)?)/i,v=/firefox\/(\d+(\.\d+)?)/i,m,y=g();return y.msie&&y.version>=8||y.chrome&&y.version>=10||y.firefox&&y.version>=4||y.safari&&y.version>=5||y.opera&&y.version>=10?y.a=t:y.msie&&y.version<8||y.chrome&&y.version<10||y.firefox&&y.version<4||y.safari&&y.version<5||y.opera&&y.version<10?y.c=t:y.x=t,y})

// end of bowser.js

//END:BROWSER

var Similitude = (function() {
  
var Similitude = {};

//BEGIN:UTILITY<*>
//functions of enough generalapplicability that it's usually
//not worth discerning individual dependencies, but subject
//to periodic review as to whether they are truly only used by one widget

var genElement= function(parent, cname) {
	var el = document.createElement("div");
	el.className = cname;
	if (parent !== 0) { parent.appendChild(el); }
	return el;
};


var pxToFloat = function(pxMeasure) 
{ return parseFloat(pxMeasure.slice(0,-2)); };

var pxToFloatSafe = function(pxMeasure) { 
	if (pxMeasure.slice(-2) == "px")
	{ return parseFloat(pxMeasure.slice(0,-2)); }
	else return pxMeasure;
};

var floatToPx = function(measure) 
{ return (measure.toString() + "px"); };

var floatFmt = function(value) { //# str(float)
	var precision = 1; //#
	var power = Math.pow(10, precision || 0); //#
	return String(Math.round(value * power) / power); //#
};

var classListRemove = function(list, key) {
	return list.replace(
	new RegExp("( " + key +"($|(?= ))|(^|(?= ))" + key + " |^" + key +"$)", 
	"g"), "");
};

window.systemFontsOnly = (function() {
	var result = ("webkit" in bowser && bowser.webkit);
	if (result) { document.body.className += " systemFontsOnly"; }
	return result;
})();
//END:UTILITY

//BEGIN:FIXEDLINETOOL<TOGGLEDIV,SELECTBOX>

Similitude.bordersScaleWell = (function() {
	//honestly, it's more of a question of which browser in which
	//borders are apparently the best option available.
	//IE can do borders alright (at least consistently like chrome)
	//but it scales based on pixel-rounding like FF so you can do hairline borders
	//using LineTools; that looks better, so we use that.
	return ("webkit" in bowser && bowser.webkit);
	//return (!("gecko" in bowser && bowser.gecko));
})();


Similitude._FixedLineTool = function() {
	this.items = {};
	this.curscale = 1;
};

Similitude._FixedLineTool.prototype = {
//fmt: (classname, [['height', true, [4 'px']],
//					['padding', true, [3,'px ', 5, 'px']],
//					[csskey...]...])
	addItem: function(cn, keyvalpairs) {
    var i;
		if (!(cn in this.items)) {
			var nl = document.getElementsByClassName(cn);
			var arr = [];
			for(i = nl.length; i--; arr.unshift(nl[i])) {}
			//console.log("while adding class " + cn + " found " + arr.length.toString() + " elements");
			this.items[cn]=[arr,[]];
		}
		for (i=0;i<keyvalpairs.length;i++)
		{ this.items[cn][1].push(keyvalpairs[i]); }
	},
	//call rescan after you're done adding elements to the DOM tree,
	//and whenever you add a group (or just one) of new elements to the DOM tree 
	// (or just only when its an element you know FixedLineTool
	// so if you have display:none to display: block of such an element, 
	// you'll want to rescan. But if it's just visibility:hidden to visible,
	// you don't need to rescan because it was on the DOM tree the first
	// time you called scan).
	rescan : function (discardOld) {
		var cn,i;
    for (cn in this.items) {
		if (this.items.hasOwnProperty(cn)) {
			var nl = document.getElementsByClassName(cn);
			var arr = [];
			for(i = nl.length; i--; arr.unshift(nl[i])) {}
			if (discardOld) 
			{ this.items[cn][0] = arr; continue; }
			for (i=0;i<arr.length;i++) { 
				if (this.items[cn][0].indexOf(arr[i]) === -1) {
					this.items[cn][0].push(arr[i]);
				}
			}
		}
		}
		this.scaleCallback(this.curscale);
	},
	scaleCallback: function(scale) {
		var i,j,kv,generalFactor, jval,
			individRounding,valtmp,valComplete,cn;
		generalFactor = Math.round(scale) / scale;
		for (cn in this.items) {
		if (this.items.hasOwnProperty(cn)) {
		for (i=0;i<this.items[cn][1].length;i++) {
			kv = this.items[cn][1][i];
			valtmp = "";
			individRounding = kv[1];
			for (j=0;j<kv[2].length;j++) {
				jval = kv[2][j];
				if (typeof(jval) === "string")
				{ valtmp += jval; continue; }
				if (!individRounding) { 
					valtmp += (generalFactor*jval).toString(); 
					continue; 
				}
				valtmp += 
					(jval*Math.round(scale*jval*0.8)/(scale*jval))
					.toString();
			}
			valComplete = valtmp;
			// console.log("at scale " + scale.toString() + 
			//			" about to add rule <" + kv[0] + 
			//			":" + valComplete + 
			//			"> to " + this.items[cn][0].length.toString() 
			//			+ " items of class " + cn);
			for (j=0;j<this.items[cn][0].length;j++) {
				this.items[cn][0][j].style[kv[0]] = valComplete; 
			}
		}
		}
		}
		this.curscale = scale;
	}
};

//it would only be useful to create more than one instance of this
//in the rare occasion you had two different divs that were subject to
//different scale values at different times.
Similitude.fixedLineTool = new Similitude._FixedLineTool();
	
//END:FUXEDLINETOOL
//BEGIN:FIXEDLINETOOLUSE<SELECTBOX,TOGGLEDIV>

//some users may want fixedlinetool, but not any of the std. widgets
//that depen on it.
var _initialize = function() {
	var flt = Similitude.fixedLineTool;
	if (!(Similitude.bordersScaleWell)) {
		flt.addItem("sim-selectbox",
		[["padding",true,[1, "px"]]]);		
		//flt.addItem("sim-disp", 
		//[["boxShadow",true,[1, "px ", 1, "px 0px 0px"]]]);
		flt.addItem("sim-togglediv",
		[["padding",true,[1, "px"]]]);
		flt.addItem("sim-listbox",
		[["padding",true,["0px ", 1, "px ", 1, "px ", 1, "px "]]]);
		flt.addItem("sim-listbox",
		[["margin",true,[1, "px 0px 0px ", -1, "px"]]]);
		//[["boxShadow",true,[1, "px ", 1, "px 0px 0px"]]]);
	} else {
		flt.addItem("sim-listbox",
		[["margin",true,[1, "px 0px 0px 0px"]]]);
	}
};

_initialize();

//END:FIXEDLINETOOLUSE
//BEGIN:SVGTOOLS<TOGGLEDIV,SELECTBOX>

Similitude._SVGTools = function() {
	this.svgie = ("msie" in bowser && bowser.msie);
	this.displayInline = (!("gecko" in bowser && bowser.gecko));

	if (!(this.svgie)) { this._serializer = new XMLSerializer(); }
};

Similitude._SVGTools.prototype	 = {
  cloneSvgNode : function(curnode) {
    //browsers have variant behavior re. SVG and cloneNode
    var result = document.createElementNS(
		"http://www.w3.org/2000/svg",curnode.nodeName);
    var attlist = curnode.attributes;
    var child, i;
	for (i=0;i<attlist.length;i++) {
		result.setAttribute(attlist.item(i).nodeName,
							attlist.item(i).nodeValue);
    }
    child = curnode.firstChild;
    while (child) {
		result.appendChild(
			((child.nodeType == 1)? this.cloneSvgNode(child):
			document.createTextNode(child.nodeValue)));
		child = child.nextSibling;
	}
    return result;
},
preprocess : function(svg) {
	//uniform processing to apply to displayed SVGs.
	if (this.displayInline) {
		var w= svg.getAttribute("width");
		var h= svg.getAttribute("height");
		if (!(svg.hasAttribute("viewBox"))) {
			//some SVGs have special viewbox sizes crucial to their
			//drawing that we don't want to mess with. chances are
			//if it comes with a viewbox, changing it could break it.
			//many with a viewbox can _already_ be resized fine thru
			//css height and width
			svg.setAttribute("viewBox", "0 0 " + 
					floatFmt(pxToFloatSafe(w)) +
					" " + 
					floatFmt(pxToFloatSafe(h)));
		}
		svg.setAttribute("x", "0px");
		svg.setAttribute("y", "0px");
		svg.setAttribute("preserveAspectRatio","xMidYMid");
	}
},
replaceStyle : function(root, tags, key, value) {
	if (!("firstChild" in root)) { return; }
	var child = root.firstElementChild;
	while (child) {
		if (tags.indexOf(child.nodeName) > -1) {
			child.style[key] = value;
		}
		this.replaceStyle(child, tags, key, value);
		child = child.nextElementSibling;
	}
},
svgToSerialized : function(svg) {
	if (this.svgie) {
		return this._xmlSerializeIE(svg);
	} else {
		return this._serializer.serializeToString(svg);
	}
},
serializedToSvg : function(svgString) {
	var el=document.createElement("div");
	el.innerHTML = svgString;
	return el.firstChild;
},
_xmlSerializeIE : function(curnode) {
    //ie's xmlserializer is not to spec
    //it will 'helpfully' 'clean' svgs for you
    //usually breaking them for re-use.
    var result = "<" + curnode.nodeName;
    var attlist = curnode.attributes;
    var child, i;
    for (i=0;i<attlist.length;i++) {
        result+= " " + attlist.item(i).nodeName +
                 "='" + attlist.item(i).nodeValue +
                 "'";
    }
    child = curnode.firstChild;
	//if has contents
    if (child && (child.nextSibling || 
                  child.nodeType==1 ||
		//tags whose only child is blank text might be closed? or safe
		//to say all nodeType==3 means hasContents?
      (child.nodeValue.replace(/^\s+|\s+$/g, ''))
                 )) {
        result += ">";
        while (child) {
            result += ((child.nodeType == 1)? 
				this._xmlSerializeIE(child):child.nodeValue); 
            child = child.nextSibling;
        }
        result += "</" + curnode.nodeName + ">";
    } else {
        result += " />";
    }
    return result;
}
};
Similitude.SVGTools = new (Similitude._SVGTools)();
var SVGTools = Similitude.SVGTools;


/*
	Known issues:
	Google Chrome:
		If your SVG is NOT displaying in google chrome (bug last seen in v33, 
		but displays fine in firefox and IE, try this:
		go to the direct parent div in chrome inspector, set display to none
		and then back to block or maybe inline-block. If it shows now here
		is your problem:
		AFAIK sometimes if there's a div with specified width and height,
		and then several divs between it and the SVG without width or height,
		in some cases chrome will never render that SVG. The way to fix this
		for now is to set a height AND/OR width property, usually 
		one is sufficient. 
		
		I'm not sure this is something that /can/ be fixed, it just seems
		to be a choice Chrome makes re rendering added SVG elements dynamically
		This is only really an issue because inline SVG elements are really
		the only way of rendering a dynamically-added SVG that chrome
		will render correctly. If either of those issues are fixed, the
		other becomes irrelevant.
		
		For an example of this bug in action, please open ConfigDemo backup
		20140403, open ConfigDemo.html in chrome and style/ConfigDemo.css in
		an editor and comment out lines 203 and 204 (.descriptcol height and
		width rules). the logo on the top left of the description column should disappear

*/

Similitude._SVGInjector = function() {
	this._svgCache = {};
	this._lazySrcCaching = true; 
	this.CACHE_MANUAL_ONLY = 0;
	this.CACHE_CROSS_BROWSER = 1;	//cache src after converting for browser
	this.CACHE_MOD_SRCS=2;	//cache as above AND ensure src cached as element 
							//	when src used in mod (speeds up modding)
	this.CACHE_MODS = 3;	//as above AND cache mods (in browser out fmt)
	this.CACHE_ALL = 4;
	this._cacheLevel = this.CACHE_MODS;
	
	//generally best to set to true. saves memory if you're using
	// a lot of one-time use SVGs loaded via javascript (and not by the body
	//	or by XHR request). If you want to add all SVGs to divs through
	// the cache, and are mostly loading SVGs through the body or XHR
	// you can safely set to false.
	// CACHE_MODS == only cache src if not cached and after conversion or before mod
	// CACHE_ALL == also cache src if not cached and above OR on passthrough 
	//					with no mod or conversion.
	this._cacheMods = true;
};

Similitude._SVGInjector.prototype = {
addSvgCached : function(parent,
	srckey, src, style, modkey, modcallback) {	
	var div=document.createElement("div");
	this.setSvgCached(div, srckey, src, style, modkey, modcallback);
	parent.appendChild(div);
},

//probably the function you want. the idea is add multiple svgs 
// and show or hide them with css.
addSvgVariants : function(parent, addSvgCacheArgSets) {
	var args;
	for (var i=0;i<addSvgCacheArgSets.length;i++) {
		args = addSvgCacheArgSets[i];
		this.addSvgCached(parent, 
					args[0], args[1], args[2], args[3], args[4]);
	}
},

// purely an example of the type of convenience function that you 
// can construct using addSvgVariants
addSvgVariantsBright : function(parent, srckey, svgString, style) {
	this.addSvgVariants(parent, 
		[[srckey, svgString,  style + " brightbg", "", 0],
		[srckey, svgString, style + " darkbg", "darkbg", 
		function(el) { 
			SVGTools.replaceStyle(
				el, ["path"], "stroke", "#FFFFFF");
			SVGTools.replaceStyle(
				el, ["path"], "fill", "#FFFFFF");
		}]]);
},
getCacheLevel : function()
{ return this._cacheLevel; },
preloadSvgCache : function(removeCargoNode) {
	var box,oldbox,cargo = document.getElementById("svgcargo");
	box = cargo.firstElementChild;
	while (box) {
		this._svgCache[box.className] = box.firstChild;		
		SVGTools.preprocess(this._svgCache[box.className]);
		oldbox=box;
		box = box.nextElementSibling;
		//cargo.removeChild(oldbox);
	}
	if (removeCargoNode) 
	{ cargo.parentNode.removeChild(cargo); }
},
setCacheLevel : function(cacheLevel)
{ this._cacheLevel = cacheLevel; },
setSvgCached : function(div, 
						srckey, src, style, modkey, modcallback) {
	//src can be an element or a string. 
	//caches converted version if needs to convert, 
	//srckey should be unique to that src string/element
	//if you pass a srckey, for example, and that srckey was already used
	// the src is loaded from cache using that key. 
	// with modkey it's srckey+modkey.
	//and caches any modified versions if a modifier is passed.
	//if adding a svg multiple times
	//if not modding, modkey should be "" and modcallback should be 0
	var inline= SVGTools.displayInline; 
	//the opposing being set as a data-uri in a background image.
	
	div.className += (inline? " svginline":" svgbg") + " svg " + style;
	var cache = this._svgCache,
		srcInCache = (src === false || src === "" || src === 0),
		srcIsString = (typeof(src) === "string") && src.length > 0,
		srcIsEl = typeof(src) === "object",
		hasMod = typeof(modkey)==="string" && modkey.length > 0;
	//console.log("srckey<"+srckey+"> src<"+src+"> style <"+style+"> modkey <"+modkey+">");
	//console.log("srcInCache<"+srcInCache.toString()+"> hasMod<"+hasMod.toString()+">");

	var el, modded=false,serialized=false,text,doClone=true;
	
	/* begin conversion of srcs, caching of srcs and/or converted srcs */
	if (srcIsEl) {
		SVGTools.preprocess(src);
	}
	if (!(srckey in cache)) {
		if (srcIsString && (inline || hasMod)) {
			el = SVGTools.serializedToSvg(src);	
			SVGTools.preprocess(el);
			if ((this._cacheLevel >= this.CACHE_MOD_SRC && hasMod) ||
				(this._cacheLevel >= this.CACHE_CONVERSION && inline)) {
				cache[srckey] = el;			 
			} else { doClone = false; }
		} else if (srcIsEl) {
			SVGTools.preprocess(src);
			if ((hasMod) &&
				((this._cacheLevel >= this.CACHE_MOD_SRC && hasMod) ||
				this._cacheLevel == this.CACHE_ALL)) {
				cache[srckey] = src;
			}
		}
	}
	if (!inline && !((srckey+"_serialized") in cache)) {
		if (srcIsString && this._cacheLevel == this.CACHE_ALL) {
			cache[srckey+"_serialized"] = src;
		} else if (!srcIsString && !hasMod) {
			if (srcInCache && !(srckey in cache)) 
			{ return false; }
			text = SVGTools.svgToSerialized(
				(srcInCache?cache[srckey]:src));
			serialized = true;
			if (this._cacheLevel >= this.CACHE_CONVERSION) {
				cache[srckey+"_serialized"] = text;
			}
		}
	}
	/* end conversion of srcs, caching of srcs and/or converted srcs */

	if (hasMod && (srckey+modkey) in cache) {
		if (!inline) { 
			text = cache[srckey+modkey];
			serialized = true;
		} else { el = cache[srckey+modkey]; }
		modded=true;
	} else if (srckey in cache) {
		el = cache[srckey];
	} else if (srcInCache) {
		return false; //has to be in cache if that's where we're getting it.
	} else if (srcIsEl) {
		el = src;
	}
	if ((hasMod && !modded) || inline) { 
		if (doClone)	//do NOT mjoin this with the conditions above
						// or it will make the "else if" clause below
						// invalid. (else if clause depends upon the
						// outer condiftion being false.
		{ el = SVGTools.cloneSvgNode(el); }
	} else if (!serialized) {
		//any conversion already done.
		text = (srcIsString)?src:cache[srckey+"_serialized"];
		serialized = true;
	}
	if (hasMod && !modded) {
		modcallback(el);
		if (this._cacheLevel >= this.CACHE_MODS) {
			cache[srckey+modkey] = (inline)?
			SVGTools.cloneSvgNode(el):SVGTools.svgToSerialized(el);
			if (!inline) { 
				text = cache[srckey+modkey];
				serialized = true;
			}
		}
	}
	if (inline) {
		div.appendChild(el);
	} else {
		if (!serialized) { text = SVGTools.svgToSerialized(el); }
		
		var result = "url('data:image/svg+xml," + 
			encodeURIComponent(text) + "')";
		div.style.backgroundImage = result;	
	}
}

};
Similitude.svgInjector = new (Similitude._SVGInjector)();
var svgInjector = Similitude.svgInjector;



//END:SVGTOOLS
//BEGIN:PUSHBUTTON<>

Similitude.PushButton = function() {
	var t = this;
	t._elem = genElement(0, "sim-pushbutton sim-pushbutton-enabled");
	t._enabled = true;
	t._onclick = function() { };
	t._onclickWrapper = function() { t._onclick(); };
	t._afill = document.createElement("a");
	t._face = genElement(t._afill, "sim-pushbutton-face");
	
	t._afill.setAttribute("href", "#");
	t._elem.appendChild(t._afill);
	t._afill.addEventListener("click", t._onclickWrapper);
	
};
Similitude.PushButton.prototype = {
getEnabled : function()
{ return this._enabled; },
getElement : function() 
{ return this._elem; },
getFace : function()
{ return this._face; },
setEnabled : function(en) { 
	var t = this;
  if (en == t._enabled) { return; }
	t._enabled = en;
	t._elem.className = classListRemove(t._elem.className,
					"sim-pushbutton-" + ((en)? "disabled":"enabled"));
	t._elem.className +=
					" sim-pushbutton-" + ((en)? "enabled":"disabled");
	t._elem.removeChild(t._elem.firstChild);
	if (en) {
		t._elem.appendChild(t._afill);
		t._afill.appendChild(t._face);
	} else {
		t._afill.removeChild(t._face);
		t._elem.appendChild(t._face);
	}
},
setOnClick : function(cback) {
	this._onclick = cback;
}
};

//END:PUSHBUTTON
//BEGIN:TOGGLEDIV<>

/* TOGGLE DIV */
Similitude.ToggleDiv = function(down) {
	var t = this;
	t._elem = genElement(0, "");
	t._afill = document.createElement("a");
	t._afill.setAttribute("href", "#");
	t._afill.className = ("sim-togglediv-afill");
	t._elem.appendChild(t._afill);
	t._facebg = genElement(t._afill, "sim-togglediv-facebg");
	t._face = genElement(t._facebg, "sim-togglediv-face");
	t._down = down;
	t._enabled = true;
	t._writeClass();
	t._onClick = function() { };
	t._onChange = function() { };
	t._onClickWrapper = function() { 
		t.setDown(!(t._down)); 
		t._onClick();
	};
	
	svgInjector.addSvgVariantsBright(t._face, "toggleDiv",
		Similitude.ToggleDiv.CheckmarkSvgStr, "");
	
	t._afill.addEventListener("click", t._onClickWrapper);
};
Similitude.ToggleDiv.SvgEl = 0;
Similitude.ToggleDiv.prototype = {
getElement : function() { return this._elem; },
getFace : function() { return this._face; },
isDown : function() 
{ return this._down; },
setDown: function(down) {
	if (this.setDownSilent(down)) {
		this._onChange();
	}
},
_writeClass : function() {
	this._elem.className = "sim-togglediv " + 
		((this._down)? " sim-togglediv-down":" sim-togglediv-up") + 
		((this._enabled)? " sim-togglediv-enabled":" sim-togglediv-disabled") + 
		((this._enabled)? 
			((this._down)?" sim-togglediv-enabled-down":
						" sim-togglediv-enabled-up"):
			((this._down)?" sim-togglediv-disabled-down":
						" sim-togglediv-disabled-up")) +
		" sim-" + ((Similitude.bordersScaleWell)? "border":"box");
},
setEnabled: function(en) {
	var t = this;
	if (t._enabled == en) { return; }
	t._enabled = en;
	t._writeClass();
	t._elem.removeChild(t._elem.firstChild);
	if (en) {
		t._elem.appendChild(t._afill);
		t._afill.appendChild(t._facebg);
	} else {
		t._afill.removeChild(t._facebg);
		t._elem.appendChild(t._facebg);
	}
},
setDownSilent : function(down) {
	if (down == this._down) { return false; }
	this._down = down;
	this._writeClass();
	return true;
},
setOnChange : function(callback) {
	this._onChange = callback;
},
setOnClick : function(callback) {
	this._onClick = callback;
}};

Similitude.ToggleDiv.CheckmarkSvgStr = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" width="300" height="324.7" viewBox="0 0 300 324.7" xml:space="preserve" overflow="visible" enable-background="new 0 0 300 324.7"><metadata id="metadata1967"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/>        </cc:Work></rdf:RDF></metadata><defs id="defs1965"/><g transform="matrix(0.73874711,0,0,0.73874711,43.063663,38.33353)"><path d="M 0,223.7 C 0,213.3 6.9,204 20.8,196 c 9.2,-4.6 16.2,-6.9 20.8,-6.9 5.8,1.2 9.8,4.6 12.1,10.4 6.9,16.2 11.6,27.2 13.9,32.9 2.3,4.6 4.6,6.9 6.9,6.9 2.3,0 4.6,-1.7 6.9,-5.2 C 120.7,164.7 156,111 187.2,72.8 211.5,43.9 226.5,27.1 232.3,22.5 250.9,8.7 272.8,1.2 298.3,0 l 1.7,8.7 c -19.7,19.7 -53.8,63.6 -102.3,131.8 -47.4,68.2 -81.5,122 -102.3,161.3 -4.6,10.3 -10.4,16.7 -17.4,19 -3.5,3.5 -11,4.6 -22.5,3.5 -8.1,1.2 -13.9,0 -17.3,-3.5 -3.5,-2.3 -6.9,-6.9 -10.4,-13.9 C 16.2,279.2 7.6,255.5 1.8,235.8 1.7,231.2 1.2,227.2 0,223.7 z"/></g></svg>';

//END:TOGGLEDIV
//BEGIN:TABPANELS<>

/* TAB BOX */
Similitude.TabPanels = function(width) {
	var t = this;
	t.elem = document.createElement("div");
	t.elem.className = "sim-tabpanels";
	t._squareMode = false;
	t.header = genElement(t.elem, "sim-header");
	t.tabRow = genElement(t.header, "sim-tabrow sim-tabrowheader");
	t.headerTabGroup = genElement(t.tabRow, "sim-tabgroup sim-headertabgroup");
	t.panelBoundary = genElement(t.elem, "sim-panelboundary");
	t.panelSpace = genElement(t.panelBoundary, "sim-panelspace");
	t.footer = genElement(t.elem, "sim-footer");
	t.tabRowFooter = genElement(0, "sim-tabrow sim-tabrowfooter");
	t.footerTabGroup = genElement(t.tabRowFooter, "sim-tabgroup sim-footertabgroup");
	
	t._Panel = function(content, tab) {
		this.content = content;
		this.tab = tab;
		this.tabBoxes = [];
		this.tabBoxContents = [];
		this.tabBoxHundred = [];
		this.ctrval = 0;
		for (var j=0;j<2;j++) {
			this.tabBoxes.push(document.createElement("div"));
			this.tabBoxes[j].className = "sim-tab sim-tabunselected";
			
			this.tabBoxHundred.push(document.createElement("div"));
			this.tabBoxHundred[j].className = "sim-tabHundred";
			this.tabBoxContents.push(document.createElement("div"));
			this.tabBoxContents[j].className = "sim-tabContents";
			this.tabBoxHundred[j].appendChild(this.tabBoxContents[j]);
			this.tabBoxes[j].appendChild(this.tabBoxHundred[j]);
			//this.tabBoxes[j].appendChild(this.tabBoxContents[j]);
			this.tabBoxContents[j].appendChild((j===0)?tab:tab.cloneNode(true));
		}
	};

	t._Panel.prototype.clean = function() {
		//we need to free the tab and any fancy borders.
		var cont = this.tabBoxes;
		for (var i=0;i<2;i++) {
			while (cont[i].hasChildNodes()) {
				cont[i].removeChild(cont[i].firstChild);
			}
		}
	};
	
	t._tabGroups = [t.headerTabGroup, t.footerTabGroup];
	t._fancyBorders = [t.headerLine, t.footerLine];
	
	t.lineComponents = [[],[]];
	
	t._panels = [];
	t._onSelect = function() {};
	t._onChange = function() {};
	t._addedToDom = true;
	t._width = width;
	t._currentPanel = -1;
	t._dispFancyBorder = [true, false];
	t._dispTabs = [true, false];
	t._ctr = 0;
	
	for (var i=0; i<2; i++) {
		t.lineComponents[i] = [
			genElement(0,"leftOfSelected"),
			genElement(0,"underSelected"),
			genElement(0,"rightOfSelected")];
	}
};

Similitude.TabPanels.prototype = {
appendPanel : function(content, tab) 
{ this.insertPanel(this._panels.length, content, tab); },
clear: function() {
	var t=this;
	var i;
	for (i=0;i<t._panels.length;i++) {
		t._panels[i].clear();
	}
	t._panels = [];
	for (i=0;i<2;i++) {
		while (t._tabGroups[i].firstChild) 
		{ t._tabGroups[i].removeChild(t._tabGroups[i].firstChild); }
	}
	t.panelSpace.removeChild(t.panelSpace.firstChild);
},
displayFancyBorders : function(top, bottom) {
	var t = this;
	var needToRewidth = false;
	var i,j,add = [top, bottom];
	
	for (i=0;i<2;i++) {
		if (add[i] === t._dispFancyBorder[i]) { continue; }
		var tabBox = t._panels[t._currentPanel].tabBoxes[i];
		if (add[i]) {
			needToRewidth = true;
			for (j=0;j<3;j++) {
				t.lineComponents[i][j].style.visibility = 'hidden';
				tabBox.appendChild(t.lineComponents[i][j]);
			}
		} else {
			while (!(tabBox.firstChild.isEqualNode(tabBox.lastChild))) {
				tabBox.removeChild(tabBox.lastChild);
			}			
		}
	}
	t._dispFancyBorder = add;	
	if (needToRewidth) {
		t._widthChanged();
	}
},
displayTabRow : function(top, bottom) {
	if (!top && !bottom) { return false; }
	var i,j,t = this;
	var needToRewidth = false;
	var blocks = [t.header, t.footer], tabRows = [t.tabRow, t.tabRowFooter], add = [top, bottom];
	for (i=0;i<2;i++) { 
		if (t._dispTabs[i] !== add[i]) {
			if (add[i]) {
				if (t._dispFancyBorder[i]) { 
					needToRewidth = true; 
					for (j=0;j<3;j++) {
						t.lineComponents[i][j].style.visibility = 'hidden';
					}
				}
				blocks[i].appendChild(tabRows[i]);
			} else {
				blocks[i].removeChild(tabRows[i]);
			}
		}
	}
	t._dispTabs = add;
	if (needToRewidth) { 
		t._widthChanged();
	}
},
getElement : function () {
	return this.elem;
},
getSelectedIndex : function() 
{ return this._currentPanel; },
insertPanel : function(position, content, tab) {
	var t = this;
	var i;
	t._panels.splice(position, 0, new (t._Panel)(content, tab));
	if (position+1 === t._panels.length) {	
		for (i=0;i<2;i++) {
			t._tabGroups[i].appendChild(t._panels[position].tabBoxes[i]);
		}
	} else {
		for (i=0;i<2;i++) {
			t._tabGroups[i].insertBefore(t._panels[position].tabBoxes[i],
								t._panels[position+1].tabBox);
		}
	}
	t._ctr++;
	t._panels[position].ctrval = t._ctr;
	var ctrval = t._ctr;
  var make_handler = function(k) {
		var r=function() { t._selectCtr(k); };
    return r;
  };
	for (i=0;i<2;i++) {
		t._panels[position].tabBoxes[i].addEventListener(
			"click", make_handler(ctrval));
	}
	if (t._panels.length === 1) {
		t.selectTabSilent(0);
	} else if (position <= t._currentPanel) {
		t._currentPanel += 1;
		t._widthChanged();
	}
},
removeTab : function (index) {
	var t = this;
	if (index < 0 || index >= t._panels.length) { return; }
	if (t._currentPanel === index) {
		if (t._panels.length > 1) {
			var newpanel = (index + 1 === t._panels.length)? 
							index-1:index+1;
			this.selectTabSilent(newpanel);
		} else {
			t.panelSpace.removeChild(t.panelSpace.firstChild);
		}
	}
	for (var i=0;i<2;i++) 
	{ t._tabGroups[i].removeChild(this._panels[index].tabBoxes[i]); }
	t._panels[index].clean();
	t._panels.splice(index, 1);
	if (this._currentPanel === this.panels.length) { 
		this._currentPanel = this.panels.length-1; 
		t._widthChanged();
	}
},
_selectCtr : function (ctrval) {
	for (var i=0;i<this._panels.length;i++) {
		if (this._panels[i].ctrval === ctrval) {
			this.selectTab(i);
			break;
		}
	}
},
selectTab : function (index) {
	if (this.selectTabSilent(index)) {
		this._onChange();
	}
},
selectTabSilent : function(index) {
	var i,j,t = this;
	if (index === t._currentPanel || index < 0 || 
		index >= t._panels.length) { return false; }
	if (t.panelSpace.hasChildNodes()) {
		t.panelSpace.removeChild(t.panelSpace.firstChild);
	}
	for (i=0;i<2;i++) { 
		if (t._currentPanel !== -1) { 
			t._panels[t._currentPanel].tabBoxes[i].className ="sim-tab sim-tabunselected";
			var oldbord = t._panels[t._currentPanel]
											.tabBoxes[i];
			while (!(oldbord.firstChild.isEqualNode
									(oldbord.lastChild))) {
				oldbord.removeChild(oldbord.lastChild);
			}
		}
		if (t._dispFancyBorder[i]) {
			var newbord = t._panels[index].tabBoxes[i];
			for (j=0;j<3;j++) {
				newbord.appendChild(t.lineComponents[i][j]);
			}
		}
		t._panels[index].tabBoxes[i].className = "sim-tab sim-tabselected";		
	}
	t._currentPanel = index;
	t._widthChanged();
	t.panelSpace.appendChild(t._panels[index].content);
	return true;
},
setOnChange : function(callback) 
{ this._onChange = callback; },
setOnSelect : function(callback) 
{ this._onSelect = callback; },
setSquareMode : function(squareMode) {
	this._squareMode = squareMode;
	if (squareMode) {
		for (var i=0;i<3;i++) {
			this.lineComponents[0][i].style.visibility = "hidden";
		}
	} else {
		this._panels[1].tabBoxes[0].style.removeProperty('width');
	}
	this._widthChanged();
},
_widthChanged: function() {
	var t = this;
	if (t._currentPanel == -1) { return; }
	var curPanelEl;
	var block, blockWidth, tabWidth, lc, l, h;
	
	for (var i=0;i<2;i++) {
		if (!(t._dispFancyBorder[i])) { continue;}
		curPanelEl = t._panels[t._currentPanel].tabBoxes[i];
		block = (i===0)?t.header:t.footer;
		blockWidth = pxToFloat(getComputedStyle(block).width);
		tabWidth = pxToFloat(
			getComputedStyle(curPanelEl).width);
		lc = t.lineComponents[i];
		l =(curPanelEl.offsetLeft -1); //round down.
		//console.log(" l:" + floatFmt(l) + " tabWidth:" + floatFmt(tabWidth) +
		//			" blockwidth:" + floatFmt(blockWidth));
		if (this._squareMode) { //ugly hack. TODO generalize this.
			var a = blockWidth;
			var b = pxToFloat(getComputedStyle(t._panels[0].tabBoxes[0]).width);
			var c = pxToFloat(getComputedStyle(t._panels[1].tabBoxes[0]).marginLeft);
			var d = t._panels[0].tabBoxes[0].offsetLeft;
			//console.log("blockwidth:" + floatFmt(a) + " width:" + floatFmt(b) +
			//" marginleft:" + floatFmt(c) + " offset:" + floatFmt(d));
			t._panels[1].tabBoxes[0].style.width = floatToPx(a - (b+c+d));	
		} else {
			lc[0].style.width =  floatToPx(l);
			lc[0].style.marginLeft = floatToPx(-1 * l);
			lc[0].style.visibility = "visible";
			h = pxToFloat(getComputedStyle(lc[0]).height);
			lc[1].style.marginTop = floatToPx(h*-1);
			lc[1].style.visibility = "visible";
			//lc[1].style.width = floatToPx(tabWidth -2);
			lc[2].style.marginTop = floatToPx(h*-1);
			lc[2].style.width = floatToPx(
								blockWidth - (l+ tabWidth));
			lc[2].style.visibility = "visible";
		}
		
		//t.lineComponents[i][1].style.left = floatToPx(curPanelEl.offsetLeft);
		//t.lineComponents[i][2].style.width = floatToPx(blockWidth - 
		//					(curPanelEl.offsetLeft + curPanelEl.offsetWidth));
	}
}

};

//END:TABPANELS
//BEGIN:SELECTBOX<>
/* SELECT BOX */
Similitude.SelectBox = function() {
	var t = this;
    t.elem = document.createElement("div");
	t.elem.className = "sim-selectbox sim-" +
			((Similitude.bordersScaleWell)? "border":"box");
    t.items = [];
	t.dispBg = genElement(t.elem, "sim-dispbg");
	t.curBoxEl = genElement(t.dispBg, "sim-disp");
	t.btnEl = genElement(t.curBoxEl, "sim-btn");
	t.listBoxEl = genElement(t.elem, "sim-listbox");
	t.listBoxEl.style.display = "none";
	
	t.listBoxDisplay = false;
	t.newDisplay = true;
	t.isAddedToDom = false;
    t.selected = -1;
    t.ctr = 0;
	t.curnode = 0;
	t.onSelect = function(ind) {};
	t.onChange = function(ind) {}; 
	
	svgInjector.addSvgVariantsBright(t.btnEl, "selectbox",
		Similitude.SelectBox.DropdownSvgStr, "");
};
Similitude.SelectBox.SvgEl = 0;
Similitude.SelectBox.prototype = {
    getElement : function() 
		{ return this.elem; },
	setOnSelect: function(cb) 
		{ this.onSelect = cb; },
	setOnChangeCallback: function(cb) 
		{ this.onChange = cb; },
	addedToDom : function() {
		var t=this;
		var dispshow = function(){
			t.listBoxDisplay = true;
			if (t.newDisplay) {
				var cbStyle = getComputedStyle(t.curBoxEl);
				t.listBoxEl.style.top = cbStyle.height + cbStyle.paddingTop +
					cbStyle.paddingBottom;
			}
			t.listBoxEl.style.display = "block";	
		};
		var instahide = function() {
			t.listBoxDisplay = false;
			t.listBoxEl.style.display = "none";
		};
		var disphide = function() {
			t.listBoxDisplay = false;
			window.setTimeout(function(){ 
				if (!(t.listBoxDisplay)) {
					t.listBoxEl.style.display = "none";
					t.newDisplay = true;
				}
			}, 100);
		};
		var useCurBox = function() { 
				dispshow();
				//if (t.newDisplay) {
					for (var f=0;f<t.items.length;f++) {
						t.items[f].setAttribute("data-hover", 
							(f === t.selected)?"true":"false");
					}
				//}
				t.newDisplay = false;
			};
		t.curBoxEl.addEventListener("mouseover", useCurBox);
		t.curBoxEl.addEventListener("click", useCurBox);
		t.curBoxEl.addEventListener("mouseout",  
			function() { disphide(); });
		var addEl, i, j;
    var make_click_handler = function(k) {   
      var r= function() { t._selectCtr(k);  
				t._selectCtr(t.items[k].ctr); 
				instahide();
      };
      return r;
    };
    var make_mouseover_handler = function(k) {
      var r= function() {
				dispshow();
				for (j=0;j<t.items.length;j++) {
					if (t.items[j].ctr === t.items[k].ctr) {
						t.items[j].setAttribute("data-hover","true"); 
					} else {
						t.items[j].setAttribute("data-hover","false"); 
					}
				}
      };
			return r;
    };
    var make_mouseout_handler = function(k) {
				var r= function() { 
					//console.log("mouse out!");
					//t.items[k].setAttribute("data-hover","false"); 
					disphide();
				};
				return r;
    };
    
		for (i=0; i<t.items.length;i++) {
			addEl = t.items[i];
			addEl.addEventListener("click", make_click_handler(i));
			addEl.addEventListener("mouseover", make_mouseover_handler(i));
			addEl.addEventListener("mouseout", make_mouseout_handler(i));
		}
		
		t.isAddedToDom = true;
	},
	removeElem : function(el) {
		for (var i=0;i<this.items.length;i++) {
			if (this.items[i] === el) {
				return this.removeIndex(i);
			}
		}
		return false;
	},
    removeIndex : function (i) { 
		var t = this;
		console.log("remove called");
		if (i >= t.items.length || i < 0) { return false; } 
		t.items[i].className = classListRemove(t.items[i].className, "sim-row");
		t.listBoxEl.removeChild(t.items[i]);
		var removingSel = false;
		if (t.selected === i) { 
			t.curBoxEl.removeChild(t.items[i]);
			removingSel = true;
		} else if (t.selected > i) 
		{ t.selected -= 1; }
		t.items.splice(i, 1);
		if (t.items.length > 0 && removingSel)
		{ t.selectElement(0); }
		else if (t.items.length === 0)
		{ t.selected = -1; }
		return true;
	},
    len : function() 
		{ return this.items.length; },
    addItem : function(addEl) 
		{ this.insertItem(addEl, this.items.length); },
    insertItem : function(addEl, index) {
		var t = this;
		if (addEl.className === "") { addEl.className = "sim-row"; }
		else { addEl.className = addEl.className + " sim-row"; }
        if (index === t.items.length) { t.listBoxEl.appendChild(addEl); }
        else { t.listBoxEl.insertBefore(addEl, t.items[index]); }
        t.ctr += 1;
        var ctrval = t.ctr;
		addEl.ctr = t.ctr;
		var dispshow = function(){
			t.listBoxDisplay = true;
			t.listBoxEl.style.display = "block";			
		};
		var disphide = function() {
			t.listBoxDisplay = false;
			window.setTimeout(function(){ 
			t.listBoxEl.style.display = 
				(t.listBoxDisplay)?"block":"none";}, 300);
		};
		var instahide = function() {
			t.listBoxDisplay = false;
			t.listBoxEl.style.display = "none";
		};
		if (t.isAddedToDom) {
			addEl.addEventListener("click", 
				function() { t._selectCtr(ctrval); instahide(); } );
			addEl.addEventListener("mouseover", function() { 
				for (var i=0;i<t.items.length;i++) {
					if (t.items[i].ctr == addEl.ctr) {
						t.items[i].setAttribute("data-hover","true"); 
					} else {
						t.items[i].setAttribute("data-hover","false"); 
					}
				}
				dispshow();
			});
			addEl.addEventListener("mouseout", function() { 
				addEl.setAttribute("data-hover","false");
				disphide();
			});
		}
        t.items.splice(index,0,addEl);
		if (t.selected == -1) { t.selectIndex(0); t.selected = 0; }
        else { t.selected += (index <= t.selected)? 1 : 0; }
    },
    appendStr : function(addStr) 
		{ return this.insertStr(addStr, this.items.length); },
    insertStr : function(addStr, index) { 
        var newEl = document.createElement("div");
        newEl.innerHTML = addStr;
        this.addItem(newEl, index);
		return newEl;
    },
    selectIndex : function(index, suppresscallbacks) {
		var t = this;
		var wasChanged = false;
		if (index != t.selected) {
			wasChanged = true;
			if (t.curnode !== 0) 
			{ t.curBoxEl.removeChild(t.curnode); }
			t.selected = index;
			t.curnode = t.items[index].cloneNode(true);
			t.curnode.className = t.curnode.className + " sim-selected";
			t.curBoxEl.insertBefore(t.curnode, t.btnEl);			
		}
		if (!suppresscallbacks) {
			t.onSelect();
			if (wasChanged) { t.onChange(); }
		}
    },
	getSelectedIndex : function() {
		return this.selected;
	},
	_selectCtr : function(ctr) {
		//an object in the list's index may change, but it's callback
		//still needs to be able to select itself (and not the 
		//object that is now in it's old place)
		for (var i=0;i<this.items.length;i++) {
			if (this.items[i].ctr == ctr) {
				return this.selectIndex(i, false);
			}
		}
	}
};
Similitude.SelectBox.DropdownSvgStr = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" width="600" height="471" id="svg3051" version="1.1"> <defs id="defs3053"/> <metadata id="metadata3056"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/> <dc:title/> </cc:Work> </rdf:RDF> </metadata> <g id="layer1" transform="translate(0,-581.36218)"> <path d="M 54.426933,-44.38965 148.99618,52.073249 243.56543,148.53615 112.74148,182.20407 -18.082462,215.87199 18.172235,85.74117 z" transform="matrix(0.43196572,1.2288534,-1.4582918,0.36400298,417.18586,618.88433)" fill="#241c1c"/> </g> </svg>';
//END:SELECTBOX

return Similitude;

})();
