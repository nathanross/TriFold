var JSZip=function(e,r){this.files={};this.root="";e&&this.load(e,r)};JSZip.signature={LOCAL_FILE_HEADER:"PK\u0003\u0004",CENTRAL_FILE_HEADER:"PK\u0001\u0002",CENTRAL_DIRECTORY_END:"PK\u0005\u0006",ZIP64_CENTRAL_DIRECTORY_LOCATOR:"PK\u0006\u0007",ZIP64_CENTRAL_DIRECTORY_END:"PK\u0006\u0006",DATA_DESCRIPTOR:"PK\u0007\b"};JSZip.defaults={base64:!1,binary:!1,dir:!1,date:null,compression:null};
JSZip.support={arraybuffer:function(){return"undefined"!==typeof ArrayBuffer&&"undefined"!==typeof Uint8Array}(),nodebuffer:function(){return"undefined"!==typeof Buffer}(),uint8array:function(){return"undefined"!==typeof Uint8Array}(),blob:function(){if("undefined"===typeof ArrayBuffer)return!1;var e=new ArrayBuffer(0);try{return 0===(new Blob([e],{type:"application/zip"})).size}catch(r){}try{var k=new (window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder);k.append(e);
return 0===k.getBlob("application/zip").size}catch(p){}return!1}()};
JSZip.prototype=function(){var e,r;JSZip.support.uint8array&&"function"===typeof TextEncoder&&"function"===typeof TextDecoder&&(e=new TextEncoder("utf-8"),r=new TextDecoder("utf-8"));var k=function(c){if(c._data instanceof JSZip.CompressedObject&&(c._data=c._data.getContent(),c.options.binary=!0,c.options.base64=!1,"uint8array"===JSZip.utils.getTypeOf(c._data))){var d=c._data;c._data=new Uint8Array(d.length);0!==d.length&&c._data.set(d,0)}return c._data},p=function(c){var d=k(c);if("string"===JSZip.utils.getTypeOf(d)){if(!c.options.binary){if(e)return e.encode(d);
if(JSZip.support.nodebuffer)return new Buffer(d,"utf-8")}return c.asBinary()}return d},h=function(c){var d=k(this);if(null===d||"undefined"===typeof d)return"";this.options.base64&&(d=JSZip.base64.decode(d));d=c&&this.options.binary?JSZip.prototype.utf8decode(d):JSZip.utils.transformTo("string",d);c||this.options.binary||(d=JSZip.prototype.utf8encode(d));return d},a=function(c,d,a){this.name=c;this._data=d;this.options=a};a.prototype={asText:function(){return h.call(this,!0)},asBinary:function(){return h.call(this,
!1)},asNodeBuffer:function(){var c=p(this);return JSZip.utils.transformTo("nodebuffer",c)},asUint8Array:function(){var c=p(this);return JSZip.utils.transformTo("uint8array",c)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var b=function(c,d){var a="",b;for(b=0;b<d;b++)a+=String.fromCharCode(c&255),c>>>=8;return a},l=function(){var c={},a,g;for(a=0;a<arguments.length;a++)for(g in arguments[a])arguments[a].hasOwnProperty(g)&&"undefined"===typeof c[g]&&(c[g]=arguments[a][g]);return c},
m=function(c,d,g){var b,f=c;"/"==f.slice(-1)&&(f=f.substring(0,f.length-1));b=f.lastIndexOf("/");b=0<b?f.substring(0,b):"";f=JSZip.utils.getTypeOf(d);b&&q.call(this,b);g=g||{};!0===g.base64&&null==g.binary&&(g.binary=!0);g=l(g,JSZip.defaults);g.date=g.date||new Date;null!==g.compression&&(g.compression=g.compression.toUpperCase());if(g.dir||null===d||"undefined"===typeof d)g.base64=!1,g.binary=!1,d=null;else if("string"===f)g.binary&&!g.base64&&!0!==g.optimizedBinaryString&&(d=JSZip.utils.string2binary(d));
else{g.base64=!1;g.binary=!0;if(!(f||d instanceof JSZip.CompressedObject))throw Error("The data of '"+c+"' is in an unsupported format !");"arraybuffer"===f&&(d=JSZip.utils.transformTo("uint8array",d))}d=new a(c,d,g);return this.files[c]=d},q=function(c){"/"!=c.slice(-1)&&(c+="/");this.files[c]||m.call(this,c,null,{dir:!0});return this.files[c]},v=function(){this.data=[]};v.prototype={append:function(c){c=JSZip.utils.transformTo("string",c);this.data.push(c)},finalize:function(){return this.data.join("")}};
var w=function(c){this.data=new Uint8Array(c);this.index=0};w.prototype={append:function(c){0!==c.length&&(c=JSZip.utils.transformTo("uint8array",c),this.data.set(c,this.index),this.index+=c.length)},finalize:function(){return this.data}};return{load:function(c,a){throw Error("Load method is not defined. Is the file jszip-load.js included ?");},filter:function(c){var d=[],g,b,f;for(g in this.files)this.files.hasOwnProperty(g)&&(b=this.files[g],f=new a(b.name,b._data,l(b.options)),b=g.slice(this.root.length,
g.length),g.slice(0,this.root.length)===this.root&&c(b,f)&&d.push(f));return d},file:function(c,a,b){if(1===arguments.length){if(JSZip.utils.isRegExp(c)){var l=c;return this.filter(function(c,a){return!a.options.dir&&l.test(c)})}return this.filter(function(a,d){return!d.options.dir&&a===c})[0]||null}c=this.root+c;m.call(this,c,a,b);return this},folder:function(c){if(!c)return this;if(JSZip.utils.isRegExp(c))return this.filter(function(a,d){return d.options.dir&&c.test(a)});var a=q.call(this,this.root+
c),b=this.clone();b.root=a.name;return b},remove:function(c){c=this.root+c;var a=this.files[c];a||("/"!=c.slice(-1)&&(c+="/"),a=this.files[c]);if(a)if(a.options.dir)for(var a=this.filter(function(a,d){return d.name.slice(0,c.length)===c}),b=0;b<a.length;b++)delete this.files[a[b].name];else delete this.files[c];return this},generate:function(a){a=l(a||{},{base64:!0,compression:"STORE",type:"base64"});JSZip.utils.checkSupport(a.type);var d=[],g=0,e=0,f;for(f in this.files)if(this.files.hasOwnProperty(f)){var t=
this.files[f],k=t.options.compression||a.compression.toUpperCase(),h=JSZip.compressions[k];if(!h)throw Error(k+" is not a valid compression method !");var k=t,m=new JSZip.CompressedObject,s=void 0;if(k._data instanceof JSZip.CompressedObject)m.uncompressedSize=k._data.uncompressedSize,m.crc32=k._data.crc32,0===m.uncompressedSize||k.options.dir?(h=JSZip.compressions.STORE,m.compressedContent="",m.crc32=0):k._data.compressionMethod===h.magic?m.compressedContent=k._data.getCompressedContent():(s=k._data.getContent(),
m.compressedContent=h.compress(JSZip.utils.transformTo(h.compressInputType,s)));else{s=p(k);if(!s||0===s.length||k.options.dir)h=JSZip.compressions.STORE,s="";m.uncompressedSize=s.length;m.crc32=this.crc32(s);m.compressedContent=h.compress(JSZip.utils.transformTo(h.compressInputType,s))}m.compressedSize=m.compressedContent.length;m.compressionMethod=h.magic;var k=m,h=t,t=k,m=g,s=this.utf8encode(h.name),r=s!==h.name,n=h.options,q=void 0,u=void 0,q=n.date.getHours(),q=q<<6,q=q|n.date.getMinutes(),q=
q<<5,q=q|n.date.getSeconds()/2,u=n.date.getFullYear()-1980,u=u<<4,u=u|n.date.getMonth()+1,u=u<<5,u=u|n.date.getDate(),n="",n=n+"\n\x00",n=n+(r?"\x00\b":"\x00\x00"),n=n+t.compressionMethod,n=n+b(q,2),n=n+b(u,2),n=n+b(t.crc32,4),n=n+b(t.compressedSize,4),n=n+b(t.uncompressedSize,4),n=n+b(s.length,2),n=n+"\x00\x00",r=JSZip.signature.LOCAL_FILE_HEADER+n+s,h=JSZip.signature.CENTRAL_FILE_HEADER+"\u0014\x00"+n+"\x00\x00\x00\x00\x00\x00"+(!0===h.options.dir?"\u0010\x00\x00\x00":"\x00\x00\x00\x00")+b(m,4)+
s,t={fileRecord:r,dirRecord:h,compressedObject:t},g=g+(t.fileRecord.length+k.compressedSize),e=e+t.dirRecord.length;d.push(t)}f="";f=JSZip.signature.CENTRAL_DIRECTORY_END+"\x00\x00\x00\x00"+b(d.length,2)+b(d.length,2)+b(e,4)+b(g,4)+"\x00\x00";switch(a.type.toLowerCase()){case "uint8array":case "arraybuffer":case "blob":case "nodebuffer":g=new w(g+e+f.length);break;default:g=new v(g+e+f.length)}for(e=0;e<d.length;e++)g.append(d[e].fileRecord),g.append(d[e].compressedObject.compressedContent);for(e=
0;e<d.length;e++)g.append(d[e].dirRecord);g.append(f);d=g.finalize();switch(a.type.toLowerCase()){case "uint8array":case "arraybuffer":case "nodebuffer":return JSZip.utils.transformTo(a.type.toLowerCase(),d);case "blob":return JSZip.utils.arrayBuffer2Blob(JSZip.utils.transformTo("arraybuffer",d));case "base64":return a.base64?JSZip.base64.encode(d):d;default:return d}},crc32:function(a,d){if("undefined"===typeof a||!a.length)return 0;var b="string"!==JSZip.utils.getTypeOf(a),e=[0,1996959894,3993919788,
2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,
3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,
984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,
4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,
1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918E3,2847714899,3736837829,
1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];"undefined"==typeof d&&(d=0);var f=0,f=f=0;d^=-1;for(var l=0,h=a.length;l<h;l++)f=b?a[l]:a.charCodeAt(l),f=(d^f)&255,f=e[f],d=d>>>8^f;return d^-1},clone:function(){var a=new JSZip,d;for(d in this)"function"!==typeof this[d]&&(a[d]=this[d]);return a},utf8encode:function(a){if(e)return a=e.encode(a),JSZip.utils.transformTo("string",
a);if(JSZip.support.nodebuffer)return JSZip.utils.transformTo("string",new Buffer(a,"utf-8"));for(var d=[],b=0,l=0;l<a.length;l++){var f=a.charCodeAt(l);128>f?d[b++]=String.fromCharCode(f):(127<f&&2048>f?d[b++]=String.fromCharCode(f>>6|192):(d[b++]=String.fromCharCode(f>>12|224),d[b++]=String.fromCharCode(f>>6&63|128)),d[b++]=String.fromCharCode(f&63|128))}return d.join("")},utf8decode:function(a){var b=[],g=0,e="string"!==JSZip.utils.getTypeOf(a),f=0,l=0,h=0,k=0;if(r)return r.decode(JSZip.utils.transformTo("uint8array",
a));if(JSZip.support.nodebuffer)return JSZip.utils.transformTo("nodebuffer",a).toString("utf-8");for(;f<a.length;)l=e?a[f]:a.charCodeAt(f),128>l?(b[g++]=String.fromCharCode(l),f++):191<l&&224>l?(h=e?a[f+1]:a.charCodeAt(f+1),b[g++]=String.fromCharCode((l&31)<<6|h&63),f+=2):(h=e?a[f+1]:a.charCodeAt(f+1),k=e?a[f+2]:a.charCodeAt(f+2),b[g++]=String.fromCharCode((l&15)<<12|(h&63)<<6|k&63),f+=3);return b.join("")}}}();
JSZip.compressions={STORE:{magic:"\x00\x00",compress:function(e){return e},uncompress:function(e){return e},compressInputType:null,uncompressInputType:null}};
(function(){function e(a){return a}function r(a,b){for(var l=0;l<a.length;++l)b[l]=a.charCodeAt(l)&255;return b}function k(a){var b=65536,l=[],e=a.length,h=JSZip.utils.getTypeOf(a),k=0,p=!0;try{switch(h){case "uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case "nodebuffer":String.fromCharCode.apply(null,new Buffer(0))}}catch(c){p=!1}if(!p){b="";for(l=0;l<a.length;l++)b+=String.fromCharCode(a[l]);return b}for(;k<e&&1<b;)try{"array"===h||"nodebuffer"===h?l.push(String.fromCharCode.apply(null,
a.slice(k,Math.min(k+b,e)))):l.push(String.fromCharCode.apply(null,a.subarray(k,Math.min(k+b,e)))),k+=b}catch(d){b=Math.floor(b/2)}return l.join("")}function p(a,b){for(var e=0;e<a.length;e++)b[e]=a[e];return b}JSZip.utils={string2binary:function(a){for(var b="",e=0;e<a.length;e++)b+=String.fromCharCode(a.charCodeAt(e)&255);return b},string2Uint8Array:function(a){return JSZip.utils.transformTo("uint8array",a)},uint8Array2String:function(a){return JSZip.utils.transformTo("string",a)},arrayBuffer2Blob:function(a){JSZip.utils.checkSupport("blob");
try{return new Blob([a],{type:"application/zip"})}catch(b){}try{var e=new (window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder);e.append(a);return e.getBlob("application/zip")}catch(h){}throw Error("Bug : can't construct the Blob.");},string2Blob:function(a){a=JSZip.utils.transformTo("arraybuffer",a);return JSZip.utils.arrayBuffer2Blob(a)}};var h={};h.string={string:e,array:function(a){return r(a,Array(a.length))},arraybuffer:function(a){return h.string.uint8array(a).buffer},
uint8array:function(a){return r(a,new Uint8Array(a.length))},nodebuffer:function(a){return r(a,new Buffer(a.length))}};h.array={string:k,array:e,arraybuffer:function(a){return(new Uint8Array(a)).buffer},uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return new Buffer(a)}};h.arraybuffer={string:function(a){return k(new Uint8Array(a))},array:function(a){return p(new Uint8Array(a),Array(a.byteLength))},arraybuffer:e,uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return new Buffer(new Uint8Array(a))}};
h.uint8array={string:k,array:function(a){return p(a,Array(a.length))},arraybuffer:function(a){return a.buffer},uint8array:e,nodebuffer:function(a){return new Buffer(a)}};h.nodebuffer={string:k,array:function(a){return p(a,Array(a.length))},arraybuffer:function(a){return h.nodebuffer.uint8array(a).buffer},uint8array:function(a){return p(a,new Uint8Array(a.length))},nodebuffer:e};JSZip.utils.transformTo=function(a,b){b||(b="");if(!a)return b;JSZip.utils.checkSupport(a);var e=JSZip.utils.getTypeOf(b);
return h[e][a](b)};JSZip.utils.getTypeOf=function(a){if("string"===typeof a)return"string";if("[object Array]"===Object.prototype.toString.call(a))return"array";if(JSZip.support.nodebuffer&&Buffer.isBuffer(a))return"nodebuffer";if(JSZip.support.uint8array&&a instanceof Uint8Array)return"uint8array";if(JSZip.support.arraybuffer&&a instanceof ArrayBuffer)return"arraybuffer"};JSZip.utils.isRegExp=function(a){return"[object RegExp]"===Object.prototype.toString.call(a)};JSZip.utils.checkSupport=function(a){var b=
!0;switch(a.toLowerCase()){case "uint8array":b=JSZip.support.uint8array;break;case "arraybuffer":b=JSZip.support.arraybuffer;break;case "nodebuffer":b=JSZip.support.nodebuffer;break;case "blob":b=JSZip.support.blob}if(!b)throw Error(a+" is not supported by this browser");}})();(function(){JSZip.CompressedObject=function(){this.crc32=this.uncompressedSize=this.compressedSize=0;this.compressedContent=this.compressionMethod=null};JSZip.CompressedObject.prototype={getContent:function(){return null},getCompressedContent:function(){return null}}})();
JSZip.base64=function(){return{encode:function(e,r){for(var k="",p,h,a,b,l,m,q=0;q<e.length;)p=e.charCodeAt(q++),h=e.charCodeAt(q++),a=e.charCodeAt(q++),b=p>>2,p=(p&3)<<4|h>>4,l=(h&15)<<2|a>>6,m=a&63,isNaN(h)?l=m=64:isNaN(a)&&(m=64),k=k+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(p)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(l)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(m);
return k},decode:function(e,r){var k="",p,h,a,b,l,m=0;for(e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");m<e.length;)p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e.charAt(m++)),h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e.charAt(m++)),b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e.charAt(m++)),l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e.charAt(m++)),p=p<<2|h>>4,h=(h&15)<<
4|b>>2,a=(b&3)<<6|l,k+=String.fromCharCode(p),64!=b&&(k+=String.fromCharCode(h)),64!=l&&(k+=String.fromCharCode(a));return k}}}();
(function(q){function k(a){this.data=null;this.index=this.length=0}function g(a,b){this.data=a;b||(this.data=c.utils.string2binary(this.data));this.length=this.data.length;this.index=0}function h(a){a&&(this.data=a,this.length=this.data.length,this.index=0)}function l(a){this.data=a;this.length=this.data.length;this.index=0}function n(a,b){this.options=a;this.loadOptions=b}function p(a,b){this.files=[];this.loadOptions=b;a&&this.load(a)}var c=q.JSZip,m=function(a){var b="",d,c;for(c=0;c<(a||"").length;c++)d=
a.charCodeAt(c),b+="\\x"+(16>d?"0":"")+d.toString(16).toUpperCase();return b};k.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<a||0>a)throw Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?");},setIndex:function(a){this.checkIndex(a);this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(a){},readInt:function(a){var b=0,d;this.checkOffset(a);for(d=this.index+a-1;d>=this.index;d--)b=
(b<<8)+this.byteAt(d);this.index+=a;return b},readString:function(a){return c.utils.transformTo("string",this.readData(a))},readData:function(a){},lastIndexOfSignature:function(a){},readDate:function(){var a=this.readInt(4);return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(a&31)<<1)}};g.prototype=new k;g.prototype.byteAt=function(a){return this.data.charCodeAt(a)};g.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)};g.prototype.readData=function(a){this.checkOffset(a);
var b=this.data.slice(this.index,this.index+a);this.index+=a;return b};h.prototype=new k;h.prototype.byteAt=function(a){return this.data[a]};h.prototype.lastIndexOfSignature=function(a){var b=a.charCodeAt(0),d=a.charCodeAt(1),c=a.charCodeAt(2);a=a.charCodeAt(3);for(var e=this.length-4;0<=e;--e)if(this.data[e]===b&&this.data[e+1]===d&&this.data[e+2]===c&&this.data[e+3]===a)return e;return-1};h.prototype.readData=function(a){this.checkOffset(a);var b=this.data.subarray(this.index,this.index+a);this.index+=
a;return b};l.prototype=new h;l.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);this.index+=a;return b};n.prototype={isEncrypted:function(){return 1===(this.bitFlag&1)},useUTF8:function(){return 2048===(this.bitFlag&2048)},prepareCompressedContent:function(a,b,c){return function(){var f=a.index;a.setIndex(b);var e=a.readData(c);a.setIndex(f);return e}},prepareContent:function(a,b,d,f,e){return function(){var a=c.utils.transformTo(f.uncompressInputType,
this.getCompressedContent()),a=f.uncompress(a);if(a.length!==e)throw Error("Bug : uncompressed data size mismatch");return a}},readLocalPart:function(a){var b,d;a.skip(22);this.fileNameLength=a.readInt(2);d=a.readInt(2);this.fileName=a.readString(this.fileNameLength);a.skip(d);if(-1==this.compressedSize||-1==this.uncompressedSize)throw Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");a:{d=this.compressionMethod;
for(b in c.compressions)if(c.compressions.hasOwnProperty(b)&&c.compressions[b].magic===d){b=c.compressions[b];break a}b=null}if(null===b)throw Error("Corrupted zip : compression "+m(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");this.decompressed=new c.CompressedObject;this.decompressed.compressedSize=this.compressedSize;this.decompressed.uncompressedSize=this.uncompressedSize;this.decompressed.crc32=this.crc32;this.decompressed.compressionMethod=this.compressionMethod;this.decompressed.getCompressedContent=
this.prepareCompressedContent(a,a.index,this.compressedSize,b);this.decompressed.getContent=this.prepareContent(a,a.index,this.compressedSize,b,this.uncompressedSize);if(this.loadOptions.checkCRC32&&(this.decompressed=c.utils.transformTo("string",this.decompressed.getContent()),c.prototype.crc32(this.decompressed)!==this.crc32))throw Error("Corrupted zip : CRC32 mismatch");},readCentralPart:function(a){this.versionMadeBy=a.readString(2);this.versionNeeded=a.readInt(2);this.bitFlag=a.readInt(2);this.compressionMethod=
a.readString(2);this.date=a.readDate();this.crc32=a.readInt(4);this.compressedSize=a.readInt(4);this.uncompressedSize=a.readInt(4);this.fileNameLength=a.readInt(2);this.extraFieldsLength=a.readInt(2);this.fileCommentLength=a.readInt(2);this.diskNumberStart=a.readInt(2);this.internalFileAttributes=a.readInt(2);this.externalFileAttributes=a.readInt(4);this.localHeaderOffset=a.readInt(4);if(this.isEncrypted())throw Error("Encrypted zip are not supported");this.fileName=a.readString(this.fileNameLength);
this.readExtraFields(a);this.parseZIP64ExtraField(a);this.fileComment=a.readString(this.fileCommentLength);this.dir=this.externalFileAttributes&16?!0:!1},parseZIP64ExtraField:function(a){this.extraFields[1]&&(a=new g(this.extraFields[1].value),-1===this.uncompressedSize&&(this.uncompressedSize=a.readInt(8)),-1===this.compressedSize&&(this.compressedSize=a.readInt(8)),-1===this.localHeaderOffset&&(this.localHeaderOffset=a.readInt(8)),-1===this.diskNumberStart&&(this.diskNumberStart=a.readInt(4)))},
readExtraFields:function(a){var b=a.index,c,f,e;for(this.extraFields=this.extraFields||{};a.index<b+this.extraFieldsLength;)c=a.readInt(2),f=a.readInt(2),e=a.readString(f),this.extraFields[c]={id:c,length:f,value:e}},handleUTF8:function(){this.useUTF8()&&(this.fileName=c.prototype.utf8decode(this.fileName),this.fileComment=c.prototype.utf8decode(this.fileComment))}};p.prototype={checkSignature:function(a){var b=this.reader.readString(4);if(b!==a)throw Error("Corrupted zip or bug : unexpected signature ("+
m(b)+", expected "+m(a)+")");},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2);this.diskWithCentralDirStart=this.reader.readInt(2);this.centralDirRecordsOnThisDisk=this.reader.readInt(2);this.centralDirRecords=this.reader.readInt(2);this.centralDirSize=this.reader.readInt(4);this.centralDirOffset=this.reader.readInt(4);this.zipCommentLength=this.reader.readInt(2);this.zipComment=this.reader.readString(this.zipCommentLength)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=
this.reader.readInt(8);this.versionMadeBy=this.reader.readString(2);this.versionNeeded=this.reader.readInt(2);this.diskNumber=this.reader.readInt(4);this.diskWithCentralDirStart=this.reader.readInt(4);this.centralDirRecordsOnThisDisk=this.reader.readInt(8);this.centralDirRecords=this.reader.readInt(8);this.centralDirSize=this.reader.readInt(8);this.centralDirOffset=this.reader.readInt(8);this.zip64ExtensibleData={};for(var a=this.zip64EndOfCentralSize-44,b,c,f;0<a;)b=this.reader.readInt(2),c=this.reader.readInt(4),
f=this.reader.readString(c),this.zip64ExtensibleData[b]={id:b,length:c,value:f}},readBlockZip64EndOfCentralLocator:function(){this.diskWithZip64CentralDirStart=this.reader.readInt(4);this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8);this.disksCount=this.reader.readInt(4);if(1<this.disksCount)throw Error("Multi-volumes zip are not supported");},readLocalFiles:function(){var a,b;for(a=0;a<this.files.length;a++)b=this.files[a],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(c.signature.LOCAL_FILE_HEADER),
b.readLocalPart(this.reader),b.handleUTF8()},readCentralDir:function(){var a;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===c.signature.CENTRAL_FILE_HEADER;)a=new n({zip64:this.zip64},this.loadOptions),a.readCentralPart(this.reader),this.files.push(a)},readEndOfCentral:function(){var a=this.reader.lastIndexOfSignature(c.signature.CENTRAL_DIRECTORY_END);if(-1===a)throw Error("Corrupted zip : can't find end of central directory");this.reader.setIndex(a);this.checkSignature(c.signature.CENTRAL_DIRECTORY_END);
this.readBlockEndOfCentral();if(65535===this.diskNumber||65535===this.diskWithCentralDirStart||65535===this.centralDirRecordsOnThisDisk||65535===this.centralDirRecords||-1===this.centralDirSize||-1===this.centralDirOffset){this.zip64=!0;a=this.reader.lastIndexOfSignature(c.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR);if(-1===a)throw Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(a);this.checkSignature(c.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
this.readBlockZip64EndOfCentralLocator();this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);this.checkSignature(c.signature.ZIP64_CENTRAL_DIRECTORY_END);this.readBlockZip64EndOfCentral()}},prepareReader:function(a){var b=c.utils.getTypeOf(a);this.reader="string"!==b||c.support.uint8array?"nodebuffer"===b?new l(a):new h(c.utils.transformTo("uint8array",a)):new g(a,this.loadOptions.optimizedBinaryString)},load:function(a){this.prepareReader(a);this.readEndOfCentral();this.readCentralDir();
this.readLocalFiles()}};c.prototype.load=function(a,b){var d,f,e;b=b||{};b.base64&&(a=c.base64.decode(a));d=(new p(a,b)).files;for(f=0;f<d.length;f++)e=d[f],this.file(e.fileName,e.decompressed,{binary:!0,optimizedBinaryString:!0,date:e.date,dir:e.dir});return this}})(this);
(function () {
   "use strict";

   if(!JSZip) {
      throw "JSZip not defined";
   }

   /*jshint -W004, -W030, -W032, -W033, -W034, -W040, -W056, -W061, -W064, -W093 */
   var context = {};
   (function () {

      // https://github.com/imaya/zlib.js
      // tag 0.1.6
      // file bin/deflate.min.js

/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';var l=void 0,p=this;function q(c,d){var a=c.split("."),b=p;!(a[0]in b)&&b.execScript&&b.execScript("var "+a[0]);for(var e;a.length&&(e=a.shift());)!a.length&&d!==l?b[e]=d:b=b[e]?b[e]:b[e]={}};var r="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array;function u(c){var d=c.length,a=0,b=Number.POSITIVE_INFINITY,e,f,g,h,k,m,s,n,t;for(n=0;n<d;++n)c[n]>a&&(a=c[n]),c[n]<b&&(b=c[n]);e=1<<a;f=new (r?Uint32Array:Array)(e);g=1;h=0;for(k=2;g<=a;){for(n=0;n<d;++n)if(c[n]===g){m=0;s=h;for(t=0;t<g;++t)m=m<<1|s&1,s>>=1;for(t=m;t<e;t+=k)f[t]=g<<16|n;++h}++g;h<<=1;k<<=1}return[f,a,b]};function v(c,d){this.g=[];this.h=32768;this.c=this.f=this.d=this.k=0;this.input=r?new Uint8Array(c):c;this.l=!1;this.i=w;this.p=!1;if(d||!(d={}))d.index&&(this.d=d.index),d.bufferSize&&(this.h=d.bufferSize),d.bufferType&&(this.i=d.bufferType),d.resize&&(this.p=d.resize);switch(this.i){case x:this.a=32768;this.b=new (r?Uint8Array:Array)(32768+this.h+258);break;case w:this.a=0;this.b=new (r?Uint8Array:Array)(this.h);this.e=this.u;this.m=this.r;this.j=this.s;break;default:throw Error("invalid inflate mode");
}}var x=0,w=1;
v.prototype.t=function(){for(;!this.l;){var c=y(this,3);c&1&&(this.l=!0);c>>>=1;switch(c){case 0:var d=this.input,a=this.d,b=this.b,e=this.a,f=l,g=l,h=l,k=b.length,m=l;this.c=this.f=0;f=d[a++];if(f===l)throw Error("invalid uncompressed block header: LEN (first byte)");g=f;f=d[a++];if(f===l)throw Error("invalid uncompressed block header: LEN (second byte)");g|=f<<8;f=d[a++];if(f===l)throw Error("invalid uncompressed block header: NLEN (first byte)");h=f;f=d[a++];if(f===l)throw Error("invalid uncompressed block header: NLEN (second byte)");h|=
f<<8;if(g===~h)throw Error("invalid uncompressed block header: length verify");if(a+g>d.length)throw Error("input buffer is broken");switch(this.i){case x:for(;e+g>b.length;){m=k-e;g-=m;if(r)b.set(d.subarray(a,a+m),e),e+=m,a+=m;else for(;m--;)b[e++]=d[a++];this.a=e;b=this.e();e=this.a}break;case w:for(;e+g>b.length;)b=this.e({o:2});break;default:throw Error("invalid inflate mode");}if(r)b.set(d.subarray(a,a+g),e),e+=g,a+=g;else for(;g--;)b[e++]=d[a++];this.d=a;this.a=e;this.b=b;break;case 1:this.j(z,
A);break;case 2:B(this);break;default:throw Error("unknown BTYPE: "+c);}}return this.m()};
var C=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],D=r?new Uint16Array(C):C,E=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],F=r?new Uint16Array(E):E,G=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],H=r?new Uint8Array(G):G,I=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],J=r?new Uint16Array(I):I,K=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,
13],L=r?new Uint8Array(K):K,M=new (r?Uint8Array:Array)(288),N,O;N=0;for(O=M.length;N<O;++N)M[N]=143>=N?8:255>=N?9:279>=N?7:8;var z=u(M),P=new (r?Uint8Array:Array)(30),Q,R;Q=0;for(R=P.length;Q<R;++Q)P[Q]=5;var A=u(P);function y(c,d){for(var a=c.f,b=c.c,e=c.input,f=c.d,g;b<d;){g=e[f++];if(g===l)throw Error("input buffer is broken");a|=g<<b;b+=8}g=a&(1<<d)-1;c.f=a>>>d;c.c=b-d;c.d=f;return g}
function S(c,d){for(var a=c.f,b=c.c,e=c.input,f=c.d,g=d[0],h=d[1],k,m,s;b<h;){k=e[f++];if(k===l)break;a|=k<<b;b+=8}m=g[a&(1<<h)-1];s=m>>>16;c.f=a>>s;c.c=b-s;c.d=f;return m&65535}
function B(c){function d(a,c,b){var d,f,e,g;for(g=0;g<a;)switch(d=S(this,c),d){case 16:for(e=3+y(this,2);e--;)b[g++]=f;break;case 17:for(e=3+y(this,3);e--;)b[g++]=0;f=0;break;case 18:for(e=11+y(this,7);e--;)b[g++]=0;f=0;break;default:f=b[g++]=d}return b}var a=y(c,5)+257,b=y(c,5)+1,e=y(c,4)+4,f=new (r?Uint8Array:Array)(D.length),g,h,k,m;for(m=0;m<e;++m)f[D[m]]=y(c,3);g=u(f);h=new (r?Uint8Array:Array)(a);k=new (r?Uint8Array:Array)(b);c.j(u(d.call(c,a,g,h)),u(d.call(c,b,g,k)))}
v.prototype.j=function(c,d){var a=this.b,b=this.a;this.n=c;for(var e=a.length-258,f,g,h,k;256!==(f=S(this,c));)if(256>f)b>=e&&(this.a=b,a=this.e(),b=this.a),a[b++]=f;else{g=f-257;k=F[g];0<H[g]&&(k+=y(this,H[g]));f=S(this,d);h=J[f];0<L[f]&&(h+=y(this,L[f]));b>=e&&(this.a=b,a=this.e(),b=this.a);for(;k--;)a[b]=a[b++-h]}for(;8<=this.c;)this.c-=8,this.d--;this.a=b};
v.prototype.s=function(c,d){var a=this.b,b=this.a;this.n=c;for(var e=a.length,f,g,h,k;256!==(f=S(this,c));)if(256>f)b>=e&&(a=this.e(),e=a.length),a[b++]=f;else{g=f-257;k=F[g];0<H[g]&&(k+=y(this,H[g]));f=S(this,d);h=J[f];0<L[f]&&(h+=y(this,L[f]));b+k>e&&(a=this.e(),e=a.length);for(;k--;)a[b]=a[b++-h]}for(;8<=this.c;)this.c-=8,this.d--;this.a=b};
v.prototype.e=function(){var c=new (r?Uint8Array:Array)(this.a-32768),d=this.a-32768,a,b,e=this.b;if(r)c.set(e.subarray(32768,c.length));else{a=0;for(b=c.length;a<b;++a)c[a]=e[a+32768]}this.g.push(c);this.k+=c.length;if(r)e.set(e.subarray(d,d+32768));else for(a=0;32768>a;++a)e[a]=e[d+a];this.a=32768;return e};
v.prototype.u=function(c){var d,a=this.input.length/this.d+1|0,b,e,f,g=this.input,h=this.b;c&&("number"===typeof c.o&&(a=c.o),"number"===typeof c.q&&(a+=c.q));2>a?(b=(g.length-this.d)/this.n[2],f=258*(b/2)|0,e=f<h.length?h.length+f:h.length<<1):e=h.length*a;r?(d=new Uint8Array(e),d.set(h)):d=h;return this.b=d};
v.prototype.m=function(){var c=0,d=this.b,a=this.g,b,e=new (r?Uint8Array:Array)(this.k+(this.a-32768)),f,g,h,k;if(0===a.length)return r?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);f=0;for(g=a.length;f<g;++f){b=a[f];h=0;for(k=b.length;h<k;++h)e[c++]=b[h]}f=32768;for(g=this.a;f<g;++f)e[c++]=d[f];this.g=[];return this.buffer=e};
v.prototype.r=function(){var c,d=this.a;r?this.p?(c=new Uint8Array(d),c.set(this.b.subarray(0,d))):c=this.b.subarray(0,d):(this.b.length>d&&(this.b.length=d),c=this.b);return this.buffer=c};q("Zlib.RawInflate",v);q("Zlib.RawInflate.prototype.decompress",v.prototype.t);var T={ADAPTIVE:w,BLOCK:x},U,V,W,X;if(Object.keys)U=Object.keys(T);else for(V in U=[],W=0,T)U[W++]=V;W=0;for(X=U.length;W<X;++W)V=U[W],q("Zlib.RawInflate.BufferType."+V,T[V]);}).call(this); 


   }).call(context);
   /*jshint +W004, +W030, +W032, +W033, +W034, +W040, +W056, +W061, +W064, +W093 */

   var uncompress = function (input) {
      var inflate = new context.Zlib.RawInflate(input);
      return inflate.decompress();
   };

   var USE_TYPEDARRAY =
      (typeof Uint8Array !== 'undefined') &&
      (typeof Uint16Array !== 'undefined') &&
      (typeof Uint32Array !== 'undefined');


   // we add the compression method for JSZip
   if(!JSZip.compressions["DEFLATE"]) {
      JSZip.compressions["DEFLATE"] = {
         magic : "\x08\x00",
         uncompress : uncompress,
         uncompressInputType : USE_TYPEDARRAY ? "uint8array" : "array"
      };
   } else {
      JSZip.compressions["DEFLATE"].uncompress = uncompress;
      JSZip.compressions["DEFLATE"].uncompressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
   }
})();

// enforcing Stuk's coding style
// vim: set shiftwidth=3 softtabstop=3:

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2013-12-27
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  || (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
  || (function(view) {
	"use strict";
	var
		  doc = view.document
		  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, URL = view.URL || view.webkitURL || view
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link =  !view.externalHost && "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			node.dispatchEvent(event);
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					URL.revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
                        window.open(object_url, "_blank");
                    }
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				// FF for Android has a nasty garbage collection mechanism
				// that turns all objects that are not pure javascript into 'deadObject'
				// this means `doc` and `save_link` are unusable and need to be recreated
				// `view` is usable though:
				doc = view.document;
				save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a");
				save_link.href = object_url;
				save_link.download = name;
				var event = doc.createEvent("MouseEvents");
				event.initMouseEvent(
					"click", true, false, view, 0, 0, 0, 0, 0
					, false, false, false, false, 0, null
				);
				save_link.dispatchEvent(event);
				filesaver.readyState = filesaver.DONE;
				dispatch_all();
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	view.addEventListener("unload", process_deletion_queue, false);
	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined") module.exports = saveAs;

