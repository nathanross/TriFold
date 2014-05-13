
<?php 
 

// 1. define libname and variable that stores lib locations and whether
// 	they're loaded

if (!(array_key_exists("tilthBlocks", $GLOBALS))) 
	{ $GLOBALS["tilthBlocks"] = array(); }
$libname = "maincache";

// 2. get path from document opened by browser to this included _tilth.php

$arrRootD = explode("/", 
	str_replace("\\","/",$_SERVER['DOCUMENT_ROOT']));
//these arrays are relative to the server root folder (e.g. rel to /var/www/)
//__FILE__ always returns the filename, so we remove that with dirname.
$arrBlockD = array_slice(explode("/",
	str_replace("\\","/",dirname(__FILE__))),count($arrRootD));

			//it has to be 4 backslashes
//PHP_SELF doesn't necessarily return the filename.
$arrDocD = explode("/", ltrim($_SERVER['PHP_SELF'],"/"));
//if url ended in /, remove space created by slash
//otherwise remove what is assumed to be filename.
array_pop($arrDocD);
$additive = "";
$subtractive = "";
$steps = max(count($arrBlockD), count($arrDocD));
$skipOnMatch = True;
for ($i=0;$i<$steps;$i++){
	if ($i < count($arrBlockD) && $i < count($arrDocD) &&
			($arrBlockD[$i] === $arrDocD[$i]) && $skipOnMatch) {
		continue;
	} else {
		$skipOnMatch = False;
		if ($i < count($arrBlockD)) {
			$additive.=$arrBlockD[$i].'/';
		}
		if ($i < count($arrDocD)) {
			$subtractive.="../";
		}
	}
}
$docToBlock = $subtractive . $additive;
$joomlaPath = $additive;
$GLOBALS["joomlaMode"] = False;

//3. Store this library's name, relative path, and a boolean value
//	indicating that there are no not--yet-loaded grouped files in this lib.

$selfpath = $docToBlock;
$GLOBALS["tilthBlocks"][$libname] = array($selfpath,False);
$liblocs = array(
	"Similitude" => array($selfpath . 'Similitude',False),
	"tmp" => array($selfpath . 'tmp',False),
	"TriFold" => array($selfpath . 'TriFold',False),
	"zipTools" => array($selfpath . 'zipTools',True),
	"src" => array($selfpath . 'src',False));
//if a library was in an unusual location, was included
//in the header but happened to be included before this,
//we don't want to overwrite its location or change it 
//from loaded to not. 
foreach ($liblocs as $name => $val) {
	if (!(array_key_exists($name,$GLOBALS["tilthBlocks"])) ||
				($GLOBALS["tilthBlocks"][$name][1] == True) &&
				($liblocs[$name][1] == False)){ 
		$GLOBALS["tilthBlocks"][$name] = $liblocs[$name];
	}
}	

//4. define a few internally used functions. will be good to eventually
//	move this to a class.

// tilthLoaded array is used by tilthSrc to check if a particular
//	file from a lib is already loaded on the page (from loading the maincache
//	or loading the library's cache, or that file specifically)
if (!(array_key_exists("tilthFmt", $GLOBALS))) { 
	$GLOBALS["tilthFmt"] = function($url) {
		if ($GLOBALS["joomlaMode"]) {
			$urlParts = explode("/", $url);
			$breakpos = 0;
			for ($i=0;$i<count($urlParts);$i++) {
				if (!($urlParts[$i] == "..")) {
					$breakpos = $i;
					break;
				}
			}
			return implode("/",array_slice($urlParts,$breakpos));
		} else {
			return $url;
		}
	};
} 
if (!(array_key_exists("tilthLoaded", $GLOBALS)))
	{ $GLOBALS["tilthLoaded"] = array(); } 
if (!(array_key_exists("scope", $GLOBALS)))
	{ $GLOBALS["scope"] = array(); } 
//	tilthPath returns the path to the library from your current doc.
//	useful if there's images or assets you're storing in the library that
//	you want to link to/ source without having to enforce a relative
//	path to that library in the future / for other users.
if (!(array_key_exists("tilthPath", $GLOBALS))) {
	$GLOBALS["tilthPath"] = function($libname) {
		$path = $GLOBALS["tilthBlocks"][$libname][0];
		if ($path == ".") { return ""; }
		return $path . '/';
	};
}

//5. define central user-facing function tilthSrc

if (!(array_key_exists("tilthSrc", $GLOBALS))) {
	$GLOBALS["tilthSrc"] = function($loc) {
		if (!(array_key_exists($loc,$GLOBALS["tilthLoaded"]))) { 
				$locSplit = explode("/",$loc);
			if (count($locSplit)==1 || (count($locSplit)==2 && 
				strlen($locSplit[0])==0)){
				$libname="maincache";
				$newloc = implode("/",array_slice($locSplit,-1));
			} else {
				$libname=$locSplit[0];
				$arrEnd = array_slice($locSplit,-1);
				$newloc = $arrEnd[0];
			}
			if (!(array_key_exists($libname,$GLOBALS["tilthBlocks"]))) {
				var_dump($GLOBALS["tilthBlocks"]);
				trigger_error("this php file requires a file from" .
					" library " . $libname . " but that library is " .
					" not added to Tilth's path. Check the spelling" . 
					" of the library and ensure that you include the " .
					" maincache's _tilth.php in the header of " .
					" this document. ");
			}
			$libroot = $GLOBALS["tilthBlocks"][$libname][0];
			if ($GLOBALS["tilthBlocks"][$libname][1] == True) {
				require_once($libroot  .'/'.
					"_tilth.php");
				$GLOBALS["tilthBlocks"][$libname][1] = False;
			}
			$ext = pathinfo($newloc, PATHINFO_EXTENSION);
			if ($ext=='css') { 
				echo "<link rel=\"stylesheet\" href=\"" . 
					$GLOBALS["tilthFmt"]($libroot) .	$newloc ."\">";
			} else if ($ext=='js'){ 
				echo "<script src=\"" . $GLOBALS["tilthFmt"]($libroot)
					. $newloc ."\"></script>";
			} else if ($ext=='php'){
				if (!(array_key_exists($libname, $GLOBALS["scope"]))) {
					$GLOBAL["scope"][$libname] = array();
				}
			  $globalInclude = function($incpath,$libn) {
						require_once $incpath;
						//begin added code  
						$vararr = get_defined_vars();
						foreach($vararr as $varName => $varValue) {
							if (!($name === "incpath") && 
									!($name === "libn")) {
								$GLOBALS["scope"][$libn][$varName] = $varValue;   
							}
						}         
						//end added code          
				};
				$globalInclude($libroot .'/'. $newloc,$libname);
			}
		} 
	};
} 
// 6. Join section. This section only exists because files in this library
//		are 'grouped' or cached in join files that will only be opened
//		by first including this library file. When you call tilthSrc
//		if the library has groups, tilthSrc includes its blockfile, 
//		otherwise tilthSrc will create <script> and/or <link> tags,
//		to any asked for stylesheets not in the maincache. Both these actions
//		require having the path to the library in the tilthBlocks variable. 
//		The maincache blockfile provides this, unless you move the library 
//		relative to the production folder, in which case you will need
//		to separately include the moved library's blockfile. 

// stores path relative to open document
$joinBase= $selfpath . '_join';

$joinExists = True;

//the $joinExists tests are here so any generated _loadTilth.php
//can be placed with its library's source and work as-is
// stores path on filesystem
$joinExistsBase= $selfpath . '_join';


for ($i=0;$i<2;$i++) {
	$fileloc = $joinExistsBase . ($i+1) . '.js';
	if (!(file_exists($fileloc))) {
		$join_exists = False;
		break;
	}
}
for ($i=0;$i<1;$i++) {
	$fileloc = $joinExistsBase . ($i+1) . '.css';
	if (!(file_exists($fileloc))) {
		$join_exists = False;
		break;
	}
}

if ($joinExists) { 

	for ($i=0;$i<2;$i++) {
		echo "<script src=\"" . $GLOBALS["tilthFmt"]($joinBase) . ($i+1) . ".js\" ></script>";
	}
	for ($i=0;$i<1;$i++) {
		echo "<link rel=\"stylesheet\" href=\"" . 
			$GLOBALS["tilthFmt"]($joinBase) . ($i+1) . ".css\" >";
	}
	$tmpLoaded=array();
	
	$tmpLoaded["Similitude/Similitude.css"]=True;
	$tmpLoaded["Similitude/Similitude.js"]=True;
	$tmpLoaded["TriFold/TriFold-0.1.js"]=True;
	$tmpLoaded["TriFold/TriFold.css"]=True;
	$tmpLoaded["src/ConfigDemo.css"]=True;
	$tmpLoaded["src/ConfigDemo.custmin.js"]=True;
	$GLOBALS["tilthLoaded"] = array_merge(
		$GLOBALS["tilthLoaded"], $tmpLoaded);
}

