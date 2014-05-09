#!/bin/bash
#
# TriFold/tools/getDemoStylesFromCfgDemo.sh
# extract portions of ConfigDemo's demo css styles that aren't specific to
#	ConfigDemo
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
for i in Demo1.css Demo2.css Demo3.css ConfigDemo.css
do
	cp ../configdemo/src/$i /tmp/$i
done
mv /tmp/ConfigDemo.css /tmp/TriFold-Fullscreen.css
for i in Demo1.css Demo2.css Demo3.css TriFold-Fullscreen.css
do
	gawk	'
		BEGIN { doprint=1; descriptline=-1 }
		doprint {
			if (/TriFold\/[Cc]onfig[Dd]emo/) {
				print "TriFold/'${i}'";
				descriptline = NR+1
			} else if (NR == descriptline) {
				print "A template for TriFold"
			} else if (/BEGINtemplate/) 
			{}
			else if (/ENDtemplate/)
			{ doprint=0 }
			else
			{ print $0 }

		}
		' /tmp/$i > ../debug/style/$i
done
