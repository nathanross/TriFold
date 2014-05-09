#!/bin/bash
#
# TriFold/tools/genDemoZip.sh
# create a copy of TriFold demo and zip it.
# Copyright 2013-2014 Nathan Ross (nrossit2@gmail.com)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

cd `dirname ${BASH_SOURCE[0]}`
./getDemoStylesFromCfgDemo.sh
if [ -e TriFold_Example ]
then
rm -r TriFold_Example
fi
if [ -e /tmp/TriFold_Example.zip ]
then
rm /tmp/TriFold_Example.zip
fi
if [ -e tfd ]
then
rm -r tfd
fi

mkdir tfd tfd/scripts
cp -r ../debug/style ../docs ../LICENSE tfd
mintext=".min"
if [[ "$#" -gt 0 ]] && [[ "$1" = "debug" ]]
then
mintext=""
	cp ../src/TriFold*.js tfd/scripts/
	cp ../src/TriFold.css tfd/style/
else
	cp ../TriFold*.min.js tfd/scripts/
	cp ../TriFold.min.css tfd/style/
fi
cat ../debug/TriFold-Demo.html | sed -r 's/\.\.\/src\/(TriFold[0-9\.\-]*)\.css/style\/\1'${mintext}'.css/g' | sed -r 's/\.\.\/src\/(TriFold[0-9\.\-]*)\.js/scripts\/\1'${mintext}'.js/g' > tfd/TriFold-Demo.html
mv tfd TriFold_Example
zip -q -r /tmp/TriFold_Example.zip TriFold_Example
if [[ ("$#" -gt 0 && "$1" = "b64") || ("$#" -gt 1 && "$2" = "b64") ]]
then
echo -n "window.TriFold_Example=\"" > /tmp/TriFold_Example_base64.js
cat /tmp/TriFold_Example.zip | base64 -w0 >> /tmp/TriFold_Example_base64.js
echo -n "\";" >> /tmp/TriFold_Example_base64.js
fi
rm -r TriFold_Example



#cp /tmp/base64.js ConfigurationDemo/src/io/github/nathanross/gwtrifold/configurationdemo/public/b64_TriFold_Example_zip.js
