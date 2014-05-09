if [ ! -f "$1" ]
then
	echo "please call this with the name of the src javascript file you want to minify. The css file can be called as a second arg, but if not is assumed to be TriFold.css"
exit
fi
cssfile="TriFold.css"
if [ -f "$2" ]
then
cssfile=$2
fi
python3 trifoldMinifier.py $1 > "mtmp-$1"
java -jar $PATH_CLOSURE --jscomp_off=internetExplorerChecks --compilation_level SIMPLE_OPTIMIZATIONS "mtmp-$1" > ..\\`basename $1 js`min.js && rm mtmp-$1
java -jar $PATH_YUICOMP $cssfile > ..\\`basename $cssfile css`min.css 
