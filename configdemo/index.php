<!-- 
TriFold/configdemo/ConfigDemo.html
Website and WYSIWYG configuration tool for TriFold layout tool
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
-->
<!DOCTYPE HTML>
<head>

<meta charset="UTF-8">
<meta name="viewport" content="height =device-height, 
			width = device-width, initial-scale = 1,
          minimum-scale = 1, maximum-scale = 1,
          user-scalable =no" />
		  
<?php $tilthSrc("bridge/out/_join1.css"); ?>
<?php $tilthSrc("bridge/out/src/Demo1.css"); ?>
<?php $tilthSrc("bridge/out/src/Demo2.css"); ?>
<?php $tilthSrc("bridge/out/src/Demo3.css"); ?>
<script>
	if(window.attachEvent) {
		window.attachEvent('onload', pageLoadScript);
	} else {
		if(window.onload) {
			var curronload = window.onload;
			var newonload = function() {
				curronload();
				pageLoadScript();
			};
			window.onload = newonload;
		} else {
			window.onload = pageLoadScript;
		}
	} 
	//begin customized config
	function createTriFold(parentDiv, leftDiv, centDiv, rightDiv) {
		
		var Behavior = TriFold.DefaultBehavior;
		var behavior = new Behavior();
		window.behavior = behavior;
		behavior.setOpts({
			DefaultOneCol:[TriFold.LEFT],
			DefaultTwoCol:[[TriFold.LEFT, TriFold.CENT]],
			VisTwoCol:[[]],
			RolloverTwoCol:[Behavior.NO_ROLLOVER],
			ModeAll:[Behavior.THREE_AVAILABLE, Behavior.CAN_MINIMIZE],
			VisThreeCol:[[TriFold.CENT]],
			OrderedThreeCol:[true]
		});
		var triFold = new TriFold(behavior, leftDiv, centDiv, rightDiv);
		triFold.addTo(parentDiv);
		return triFold;
	}
	//end customized config
	
	function pageLoadScript() {
		
		Similitude.svgInjector.preloadSvgCache(false);
		
		var rootPanel = document.getElementById("fillScreen");
		var cols = [];
		var e, f;
		for (var i=0;i<3;i++) {
			e = document.createElement("div");
			cols.push(e);
		}
		
		//descript column
		var descript = document.getElementById("descript");
		document.body.removeChild(descript);
		descript.style.visibility = "visible";
		cols[0].appendChild(descript);
		
		cols[0].className = "descriptcol";
		cols[1].className = "configcol";
		cols[2].className = "previewcol";
		//config column
		
		//preview column
		if (window.isSupportedBrowser()) {
			window.triFold = new createTriFold(rootPanel, cols[0], cols[1], cols[2]);
			window.cfg = new ConfigDemoJS(window.triFold, window.behavior,
			descript, cols[1], cols[2]);
			
			//window.triFold.addTo(rootPanel);
		} else {
			document.getElementById("obsoleteBrowser")
			.style.visibility = "visibile";
		}
	}
</script>
</head>
<body>
	<div id="fillScreen">	
		<noscript>
		  <div style="width: 22em; position: absolute; left: 50%; margin-left: -11em; color: red; background-color: white; border: 1px solid red; padding: 4px; font-family: sans-serif">
			Your web browser must have JavaScript enabled
			in order for this application to display correctly.
		  </div>
		</noscript>
	</div>
	<div id="obsoleteBrowser" style="visibility: hidden">
		TriFold and GWTriFold are standardized to 
		the following browsers:
		<ul>
			<li>Firefox 16</li>
			<li>IE 10</li>
			<li>Chrome 12</li>
			<li>Android 3.5 browser</li>
			<li>Safari 4</li>
			<li>Opera 12.10</li>
		</ul>
		<p>You will be automatically redirected to the 
		 TriFold source repository in 10 seconds, or
		 <a href='#'>click here</a> to go now.</p>
	</div>
	<div id="descript" style="visibility: hidden;">
		
		<div id="logo" class="logo">
		</div><div style="display:inline-block; padding-left: 14px; vertical-align: middle;" class="em_h">TriFold </div>

		<p class="em1" style="margin-top:3px;">A layout engine that enables consistent UI for your web app across devices. Available in JS and GWT, usable for free under the Apache2 license.</p>

		<p>With TriFold, your customers use your web app in the same way on mobile as they do on tablet and laptop; it's <span class="em1">a frictionless user experience</span>.</p>

		<p>You provide TriFold with three columns, and TriFold scales and places them to fit the user's window. To see TriFold in action resize your browser window, view this page on another device, or click the buttons at the bottom.</p>

		<div style="font-size: 170%;" class="em_h">Get started</div>
		
		<table>
			<tr><td>easy</td><td><a href="http://github.com/nathanross/TriFold">Visit the Github repo</a></td></tr>
			<tr><td>easier</td><td><a id="stockdemo" href="#">Download the stock demo</a></td></tr>
			<tr><td>easiest</td><td>Explore the configuration options via this app, and download your configured demo.</td></tr>
		</table>

	</div>
	
	<div style="visibility: hidden; height:1px; width:1px; overflow:hidden" id="svgcargo">
	
	<div class='arrow-21_down'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' id='Layer_1' x='0px' y='0px' width='512' height='238' viewBox='0 0 512 238' enable-background='new 0 0 512 512' xml:space='preserve'> <metadata id='metadata9'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> <dc:title/> </cc:Work> </rdf:RDF> </metadata> <defs id='defs7'/><path d='m 0,84.968405 0,44.038655 126.37288,44.95071 c 69.50509,24.72288 127.83729,44.9507 129.62712,44.9507 1.78983,0 60.12203,-20.22782 129.62712,-44.9507 L 512,129.00706 512,84.968405 c 0,-24.22127 -0.32866,-44.03866 -0.73036,-44.03866 -0.4017,0 -58.0017,20.39525 -128,45.32279 L 256,131.57532 128.73036,86.252535 C 58.732065,61.324995 1.1320645,40.929745 0.73036431,40.929745 0.32866386,40.929745 0,60.747135 0,84.968405 z' fill='#4d4d4d'/> <path d='M 210.44068,202.14669 C 188.3661,194.35168 132.23051,174.51688 85.694915,158.06935 L 1.0847458,128.16477 1.8065284,86.215969 C 2.2035089,63.144129 2.7666556,44.028825 3.0579653,43.737515 3.5122425,43.283238 64.524995,64.723899 220.74576,120.23579 L 256,132.76312 291.25424,120.23579 C 447.475,64.723899 508.48777,43.283238 508.94204,43.737515 c 0.29129,0.29131 0.85445,19.388766 1.25142,42.438789 l 0.72179,41.909136 -56.67349,20.20079 c -109.45938,39.01587 -195.54526,68.45069 -199.58528,68.24298 -2.24412,-0.11538 -22.14123,-6.58751 -44.2158,-14.38252 z' fill='#000080'/></svg></div><div class='arrow-21_up'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' id='Layer_1' x='0px' y='0px' width='512' height='238' viewBox='0 0 512 238' enable-background='new 0 0 512 512' xml:space='preserve'> <metadata id='metadata9'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> <dc:title/> </cc:Work> </rdf:RDF> </metadata> <defs id='defs7'/><path d='m 256,38.406779 256,91.118641 0,91.11865 L 256,129.52542 0,220.64407 0,129.52542 256,38.406779 z' fill='#000080'/></svg></div><div class='download'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' id='Layer_1' x='0px' y='0px' width='108' height='107' viewBox='0 0 108 107' enable-background='new 0 0 100 100' xml:space='preserve'> <metadata id='metadata11'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> </cc:Work> </rdf:RDF> </metadata> <defs id='defs9'/><g transform='matrix(0.98305085,0,0,0.98305085,5.1774365,3.3232697)'> <path d='m 30.729,57.915 c 5.941,7.138 11.883,14.276 17.824,21.414 0.438,0.524 0.951,0.715 1.447,0.681 0.496,0.034 1.011,-0.156 1.447,-0.681 5.941,-7.138 11.883,-14.276 17.824,-21.414 1.1,-1.319 0.461,-3.494 -1.446,-3.494 -2.494,0 -4.986,0 -7.479,0 0,-10.795 0,-21.59 0,-32.386 0,-1.116 -0.931,-2.047 -2.047,-2.047 -5.531,0 -11.064,0 -16.598,0 -1.116,0 -2.047,0.931 -2.047,2.047 0,10.796 0,21.591 0,32.386 -2.493,0 -4.985,0 -7.479,0 -1.907,0 -2.546,2.175 -1.446,3.494 z'/> <path d='M 50,100 C 77.614,100 100,77.614 100,50 100,22.386 77.614,0 50,0 22.386,0 0,22.386 0,50 0,77.614 22.386,100 50,100 z M 50,8 C 73.196,8 92,26.804 92,50 92,73.195 73.196,92 50,92 26.805,92 8,73.195 8,50 8,26.804 26.805,8 50,8 z'/> </g></svg></div><div class='gear-2'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' id='Layer_1' x='0px' y='0px' width='512px' height='512px' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'> <metadata id='metadata9'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> </cc:Work> </rdf:RDF> </metadata> <defs id='defs7'/><path d='M462,280.72v-49.44l-46.414-16.48c-3.903-15.098-9.922-29.343-17.675-42.447l0.063-0.064l21.168-44.473l-34.96-34.96 l-44.471,21.167l-0.064,0.064c-13.104-7.753-27.352-13.772-42.447-17.673L280.72,50h-49.44L214.8,96.415 c-15.096,3.9-29.343,9.919-42.447,17.675l-0.064-0.066l-44.473-21.167l-34.96,34.96l21.167,44.473l0.066,0.064 c-7.755,13.104-13.774,27.352-17.675,42.447L50,231.28v49.44l46.415,16.48c3.9,15.096,9.921,29.343,17.675,42.447l-0.066,0.064 l-21.167,44.471l34.96,34.96l44.473-21.168l0.064-0.063c13.104,7.753,27.352,13.771,42.447,17.675L231.28,462h49.44l16.48-46.414 c15.096-3.903,29.343-9.922,42.447-17.675l0.064,0.063l44.471,21.168l34.96-34.96l-21.168-44.471l-0.063-0.064 c7.753-13.104,13.771-27.352,17.675-42.447L462,280.72z M256,338.4c-45.509,0-82.4-36.892-82.4-82.4c0-45.509,36.891-82.4,82.4-82.4 c45.509,0,82.4,36.891,82.4,82.4C338.4,301.509,301.509,338.4,256,338.4z' fill='#808080'/></svg></div><div class='icon_6041'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' id='Layer_1' x='0px' y='0px' width='77.272728' height='80' viewBox='0 0 612 633.6' enable-background='new 0 0 612 792' xml:space='preserve'> <metadata id='metadata21'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> </cc:Work> </rdf:RDF> </metadata> <defs id='defs19'/><g transform='matrix(2.4060695,0,0,2.4060695,-425.92849,-676.4739)' fill='#808080'> <path d='m 231.279,333.436 c -2.396,1.072 -4.597,2.667 -6.542,4.739 -1.946,2.069 -3.566,4.672 -4.816,7.738 -1.252,3.067 -1.887,6.648 -1.887,10.642 v 33.67 c 0,3.135 -0.428,6.072 -1.271,8.729 -0.842,2.645 -1.969,4.93 -3.348,6.792 -1.371,1.849 -2.968,3.296 -4.748,4.304 -1.765,1 -3.611,1.507 -5.489,1.507 h -0.5 v 13.58 h 0.5 c 1.88,0 3.73,0.479 5.5,1.422 1.78,0.95 3.375,2.336 4.741,4.116 1.375,1.798 2.5,4.051 3.343,6.692 0.844,2.659 1.271,5.658 1.271,8.913 v 33.485 c 0,3.994 0.635,7.574 1.887,10.641 1.25,3.066 2.87,5.671 4.816,7.739 1.944,2.072 4.146,3.666 6.542,4.738 2.4,1.073 4.834,1.617 7.234,1.617 h 13.45 v -12.101 h -9.75 c -1.721,0 -3.107,-0.428 -4.121,-1.271 -1.047,-0.872 -1.903,-2.057 -2.544,-3.518 -0.658,-1.494 -1.112,-3.189 -1.35,-5.043 -0.243,-1.866 -0.366,-3.743 -0.366,-5.578 v -33.67 c 0,-4.729 -0.667,-8.718 -1.981,-11.85 -1.311,-3.118 -2.866,-5.688 -4.624,-7.635 -1.765,-1.95 -3.59,-3.39 -5.426,-4.276 -1.383,-0.666 -2.554,-1.113 -3.546,-1.354 1,-0.334 2.197,-0.885 3.571,-1.645 1.83,-1.01 3.648,-2.54 5.407,-4.549 1.755,-2.004 3.308,-4.568 4.617,-7.624 1.316,-3.069 1.983,-6.839 1.983,-11.205 v -33.854 c 0,-1.958 0.123,-3.897 0.366,-5.765 0.237,-1.852 0.69,-3.515 1.346,-4.944 0.64,-1.4 1.497,-2.554 2.547,-3.431 1.014,-0.843 2.4,-1.271 4.121,-1.271 h 9.75 v -12.1 h -13.45 c -2.4,0.005 -4.834,0.548 -7.233,1.62 z' fill='#808080'/> <path d='m 409.822,411.555 c -1.886,0 -3.735,-0.479 -5.499,-1.422 -1.78,-0.947 -3.373,-2.361 -4.736,-4.204 -1.381,-1.858 -2.508,-4.144 -3.348,-6.792 -0.845,-2.646 -1.271,-5.645 -1.271,-8.913 v -33.669 c 0,-3.985 -0.635,-7.566 -1.888,-10.642 -1.251,-3.063 -2.871,-5.666 -4.815,-7.738 -1.949,-2.073 -4.15,-3.667 -6.543,-4.739 -2.399,-1.072 -4.834,-1.616 -7.233,-1.616 H 361.04 v 12.1 h 9.75 c 1.72,0 3.104,0.428 4.119,1.271 1.043,0.87 1.897,2.053 2.545,3.518 0.654,1.491 1.107,3.188 1.35,5.042 0.243,1.896 0.366,3.897 0.366,5.948 v 33.485 c 0,4.732 0.667,8.721 1.981,11.849 1.312,3.128 2.867,5.695 4.622,7.635 1.76,1.952 3.586,3.392 5.426,4.276 1.36,0.659 2.551,1.113 3.549,1.354 -1.002,0.335 -2.199,0.886 -3.573,1.644 -1.833,1.014 -3.651,2.543 -5.406,4.549 -1.752,2 -3.305,4.565 -4.615,7.624 -1.315,3.072 -1.982,6.843 -1.982,11.205 v 33.67 c 0,1.93 -0.123,3.868 -0.366,5.764 -0.24,1.854 -0.693,3.519 -1.346,4.941 -0.646,1.409 -1.504,2.563 -2.549,3.434 -1.013,0.845 -2.398,1.271 -4.119,1.271 h -9.75 v 12.1 h 13.449 c 2.397,0 4.832,-0.544 7.233,-1.617 2.394,-1.071 4.595,-2.665 6.543,-4.738 1.944,-2.071 3.564,-4.675 4.815,-7.739 1.253,-3.074 1.888,-6.654 1.888,-10.641 V 446.28 c 0,-3.139 0.429,-6.044 1.271,-8.633 0.84,-2.584 1.967,-4.839 3.349,-6.702 1.367,-1.845 2.965,-3.292 4.747,-4.302 1.769,-1.001 3.614,-1.508 5.488,-1.508 h 0.5 v -13.58 h -0.503 z' fill='#808080'/></g><circle cx='306.5' cy='467.55499' r='9' transform='matrix(2.4060695,0,0,2.4060695,-425.92849,-676.4739)' fill='#808080'/><circle cx='342.5' cy='467.55499' r='9' transform='matrix(2.4060695,0,0,2.4060695,-425.92849,-676.4739)' fill='#808080'/><circle cx='270.5' cy='467.55499' r='9' transform='matrix(2.4060695,0,0,2.4060695,-425.92849,-676.4739)' fill='#808080'/></svg></div><div class='logo'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' width='778' height='527' id='svg2993' version='1.1'> <defs id='defs2995'> <filter id='filter4251' x='-0.85633352' width='2.712667' y='-0.03384718' height='1.0676944'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4253'/> </filter> <filter id='filter4255' x='-1.2233346' width='3.4466692' y='-0.033063075' height='1.0661262'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4257'/> </filter> <filter id='filter4259'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4261'/> </filter> <filter id='filter4263'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4265'/> </filter> </defs> <metadata id='metadata2998'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> <dc:title/> </cc:Work> </rdf:RDF> </metadata> <g id='layer2' transform='translate(0,-525.36215)'> <path d='M 59.280303,1018.2713 C 201.70455,916.75612 201.70455,916.75612 201.70455,916.75612 l 37.87878,-10.60606 206.06061,-9.09091 21.21212,-6.06061 25.75758,4.54545 207.57575,48.48485 37.87879,-312.12121 -218.18182,-54.54545 -127.27272,12.12121 -116.66667,4.54545 -59.09091,-4.54545 -36.36364,9.09091 -133.333329,90.90909 0,324.24241 z' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='4' stroke-opacity='1' stroke-dasharray='none' filter='url(#filter4263)'/> <path d='M 53.598484,707.28642 C 223.29546,622.43793 212.6894,622.43793 212.6894,622.43793 l 42.42424,10.60606 90.90909,4.54546 115.15152,-9.09091 21.21212,-16.66667 22.72727,10.60606 210.60606,25.75758 6.06061,0' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='round' stroke-linejoin='miter' stroke-miterlimit='35.30000305000000100' stroke-opacity='1' stroke-dasharray='none' display='inline' filter='url(#filter4259)'/> </g> <g id='layer5' transform='translate(0,-525.36215)'> <path d='m 219.82389,908.11819 c 7.21649,-267.01031 7.21649,-267.01031 7.21649,-267.01031 l 0,0' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='4' stroke-opacity='1' stroke-dasharray='none' filter='url(#filter4255)'/> <path d='M 485.80327,625.64397 475.49399,886.46871' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='4' stroke-opacity='1' stroke-dasharray='none' filter='url(#filter4251)'/> </g></svg></div><div class='note-11'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' id='Layer_1' x='0px' y='0px' width='512' height='512' viewBox='0 0 512 512' enable-background='new 0 0 512 512' xml:space='preserve'> <metadata id='metadata9'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> </cc:Work> </rdf:RDF> </metadata> <defs id='defs7'/><path d='M 432,95.050845 V 165.42373 H 103.59322 V 95.050845 c 0,-12.965471 10.49216,-23.457621 23.45763,-23.457621 H 408.54237 C 421.50858,71.593224 432,82.085374 432,95.050845 z M 103.59322,188.88136 H 432 v 234.57627 c 0,12.96621 -10.49216,23.45763 -23.45763,23.45763 H 127.05085 c -12.9662,0 -23.45763,-10.49216 -23.45763,-23.45763 V 188.88136 z m 46.91526,70.37288 H 385.08475 V 235.79662 H 150.50848 v 23.45762 z m 0,70.37288 H 385.08475 V 306.1695 H 150.50848 v 23.45762 z m 0,70.37289 H 385.08475 V 376.54238 H 150.50848 v 23.45763 z' fill='#808080'/></svg></div>
	
	
	<div class='chromelogo'><svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' width='778' height='527' id='svg2993' version='1.1'> <defs id='defs2995'> <filter id='filter4251' x='-0.85633352' width='2.712667' y='-0.03384718' height='1.0676944'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4253'/> </filter> <filter id='filter4255' x='-1.2233346' width='3.4466692' y='-0.033063075' height='1.0661262'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4257'/> </filter> <filter id='filter4259'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4261'/> </filter> <filter id='filter4263'> <feGaussianBlur stdDeviation='3.6784092' id='feGaussianBlur4265'/> </filter> </defs> <metadata id='metadata2998'> <rdf:RDF> <cc:Work rdf:about=''> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/> <dc:title/> </cc:Work> </rdf:RDF> </metadata> <g id='layer2' transform='translate(0,-525.36215)'> <path d='M 59.280303,1018.2713 C 201.70455,916.75612 201.70455,916.75612 201.70455,916.75612 l 37.87878,-10.60606 206.06061,-9.09091 21.21212,-6.06061 25.75758,4.54545 207.57575,48.48485 37.87879,-312.12121 -218.18182,-54.54545 -127.27272,12.12121 -116.66667,4.54545 -59.09091,-4.54545 -36.36364,9.09091 -133.333329,90.90909 0,324.24241 z' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='4' stroke-opacity='1' stroke-dasharray='none' /> <path d='M 53.598484,707.28642 C 223.29546,622.43793 212.6894,622.43793 212.6894,622.43793 l 42.42424,10.60606 90.90909,4.54546 115.15152,-9.09091 21.21212,-16.66667 22.72727,10.60606 210.60606,25.75758 6.06061,0' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='round' stroke-linejoin='miter' stroke-miterlimit='35.30000305000000100' stroke-opacity='1' stroke-dasharray='none' display='inline'/> </g> <g id='layer5' transform='translate(0,-525.36215)'> <path d='m 219.82389,908.11819 c 7.21649,-267.01031 7.21649,-267.01031 7.21649,-267.01031 l 0,0' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='4' stroke-opacity='1' stroke-dasharray='none' /> <path d='M 485.80327,625.64397 475.49399,886.46871' fill='none' stroke='#000000' stroke-width='11' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='4' stroke-opacity='1' stroke-dasharray='none'/> </g></svg></div>
	
	</div>

<?php $tilthSrc("bridge/out/_join1.js"); ?>
<?php $tilthSrc("bridge/out/_join2.js"); ?>
<?php $tilthSrc("bridge/out/_join3.js"); ?>
<?php $tilthSrc("bridge/out/zipTools/_join1.js"); ?>
<?php $tilthSrc("bridge/out/zipTools/_join2.js"); ?>
<?php $tilthSrc("bridge/out/zipTools/_join3.js"); ?>
</body>
</html>
