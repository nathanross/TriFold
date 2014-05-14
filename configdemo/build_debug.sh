#!/bin/bash
cd `dirname ${BASH_SOURCE[0]}`
python3 $PATH_TILTH -d --path-closure $PATH_CLOSURE --path-yui $PATH_YUICOMP -s "libs/*" "src/" -p"bridge/out"  "tilth_configdemo.csv"
wait $!
cp index.php bridge/
python3 $PATH_TILTH -d --path-closure $PATH_CLOSURE --path-yui $PATH_YUICOMP -s "bridge/" -p"out/"  "tilth_configdemo.csv"
wait $!
cat out/bridge/index.php | sed -r "s/\.\.\/resources/resources/g" | sed -r "s/<\?php\s+\?>//g" > out.inlined.html
