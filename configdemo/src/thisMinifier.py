#!/usr/bin/python3
import re,sys

encode_str_f = '_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
encode_str = '_0123456789abcdefghijklmnopqrstuvwxyz'

#credit to Sehe at StackOverflow for this convenient base encoder function
def baseN(num, b=len(encode_str), numerals=encode_str, first_letter=True, numerals_f=encode_str_f):
    return ((num == 0) and numerals[0]) or ((numerals_f[num % b] if first_letter else numerals[num % b]) + baseN(num // b, b, numerals, False, numerals_f).lstrip(numerals[0]))

def main(l_js, retVarmap=False):
    f_j = open(l_js, "r")
    init_js = f_j.read()
    f_j.close()
    #remove lines with the "//#" preprocessor directive
    # (which of course, indicates that the line is extraneous 
    # for the final product, such as debugging code)
    init_js = re.sub("\n[^\n]*//#[^\n]*","\n",init_js)
    instanceVars = set(re.findall(
        "(?:this|prototype|\st)\.([A-Za-z0-9_]+)", init_js))
    protoVars = set(re.findall(
        "\n\s?([A-Za-z0-9_]+)\s*:\s*function\(", init_js))
    instanceVars = instanceVars.union(protoVars)
    #intf vars: vars which are in the API spec for users of the library
    intfVars = set(re.findall(
        "\n(TriFold|ConfigDemo|Similitude)\..*prototype\.([a-zA-Z][a-zA-Z0-9_]+)", init_js))
    protoIntfVars = set(re.findall(
        "\n\s?([A-Za-z0-9_]+)\s*:\s*function\([^\n]*?//E", init_js))
    intfVars = intfVars.union(protoIntfVars);
    jsKeywords = set(["call", "add", 
                        "log", #debugging minifaction problems when we want.
                        "TWO_AVAILABLE", "THREE_AVAILABLE", 
                        "LEFT", "CENT", "RIGHT", "SLIDE", "FIXED",
                        "CAN_MINIMIZE", "NO_ROLLOVER", "ROLLOVER", 
                        "ROLLOVER_OPT", "getElement","setEnabled",
						"setMode","value","style","className",
						"getFace","setOnClick"])
    nonIntfVars = instanceVars.difference(intfVars) #rm public vars
    nonIntfVars = nonIntfVars.difference(jsKeywords)

    i=0
    nonIntfVarMap = {}
    for v in nonIntfVars:
        i += 1
        nonIntfVarMap[v] = baseN(i)

    def privateVarsReplace(matchObj, protoBunch=False):
        if (matchObj.group(1) in nonIntfVarMap):
            #print(matchObj.group(1))
            if protoBunch:
                return "\n" + nonIntfVarMap[matchObj.group(1)] + \
                    " : function"
            else:
                return "." + \
                nonIntfVarMap[matchObj.group(1)]
        return matchObj.group(0)
		
    def protobunchReplace(matchObj):
        return privateVarsReplace(matchObj, True)
    
    
    min_js = re.sub("\.([A-Za-z0-9_]+)", privateVarsReplace, init_js)   
    min_js = re.sub("\n*([A-Za-z0-9_]+)\s*:\s*function", 
                        protobunchReplace, min_js)   

    if retVarmap:
        #return min_js
        a=nonIntfVarMap
        d1= "___".join([ key+":"+a[key] for key in sorted(a.keys())])
        b = {a[k] : k for k in a} #invert dictionary
        d2 = "___".join([ key+":"+b[key] for key in sorted(b.keys())])
        return d1 + "\n\n\n" + d2 
    return min_js
    #f_j2 = open("triFoldMin.2.js", "w")
    #f_j2.write(min_js)
    #f_j2.flush()
    #f_j2.close()

if __name__ == "__main__":
    if len(sys.argv) == 1:
        print("please provide the filename of the JS file")
    elif len(sys.argv) == 3:
        print(main(sys.argv[1], True))
    else:
        print(main(sys.argv[1]))
