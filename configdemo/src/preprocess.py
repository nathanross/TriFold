import os 
import sys
from os import path
import subprocess
libpath = path.dirname(__file__)
f_out = open(libpath+"/ConfigDemo.custmin.js","wb")
subprocess.call(["python", libpath+"/thisMinifier.py", libpath+"/COnfigDemo.js"],stdout=f_out)
f_out.flush()
f_out.close()
