/*
 * Copyright (C) 2017 by epto@tramaci.Org
 * 
 * Javascript Annotations parser is free software; you can redistribute 
 * it and/or modify it under the terms of the GNU General Public License 
 * as published by the Free Software Foundation; either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * This source code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this source code; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
function AnnotationsParser() { throw "Can't create an instance of AnnotationsParser"; }

AnnotationsParser.PARSER_MODE_CLASS = 'class';
AnnotationsParser.PARSER_MODE_OBJECT = 'object';
AnnotationsParser.PARSER_MODE_INSTANCE = 'instance';

function ClassAnnotations(obj,cls,mode,private) {
		if (!obj || !cls || !mode || !private ) throw "Bad ClassAnnotations instance";
		
		var member='';
		var me = {};	// private context
		
		me.classAnnotations={};

		if (obj instanceof Function) me.classAnnotations = private.parseFunction(obj,{"where" : "Function "+cls});
		if (obj instanceof Object && obj._) me.classAnnotations = private.parseFunction(obj._,{"where" : "Class "+cls});

		me.name = cls;
		me.methods = [];
		me.properties = [];
		me.annotations = {};
		me.classContext = {};
		me.mode = mode;
		
		for(member in obj) {
			
			if (member.charAt(0)=='_' && member.indexOf('__')!=0) continue;

			if (obj[member] instanceof Function) {
				me.methods.push(member);
				me.annotations[member] = private.parseFunction(obj[member],{"where" : "Class `"+cls+"` method `"+member+"`"}) ;
			} else {
				me.properties.push(member);
			}
		}
		
		if (obj instanceof Function) {
			var pobj=obj.prototype;
			
			for(member in pobj) {
				if (me.annotations[member]) continue;
				
				if (member.charAt(0)=='_' && member.indexOf('__')!=0) continue;

				if (pobj[member] instanceof Function) {
					me.methods.push(member);
					me.annotations[member] = private.parseFunction(pobj[member],{"where" : "Class `"+cls+"` method `"+member+"`"}) ;
				} else {
					me.properties.push(member);
				}
			}
		}

		me.classContext.class = {};
		for(member in me.classAnnotations) {

			if (me.classAnnotations[member].f) {
				me.classContext.class[member] = me.classAnnotations[member].v;
			}
		}

		me.classContext.methods = {};
		me.classContext.data = null;

		for(member in me.annotations) {

			var tags = me.annotations[member];
			var tmp = {};
			var flg = false;
				for( var annot in tags ) {
					if (tags[annot].f) {
						flg=true;
						tmp[annot]=tags[annot].v;
					}
				}

			if (flg) me.classContext.methods[member] = tmp;
			tmp=null;
		}

		this.getContext = function(name,def) {

			var v = def ? def : null;
			if (name) {
				return me.classContext[name] ? me.classContext[name] : v;
			}

			return me.classContext;
		} ;

		this.getAnnotation = function(method,name) {
			if (!me.annotations[method]) return null;
			if (!me.annotations[method][name]) return null;
			return me.annotations[method][name].v;
		} ;

		this.getAnnotationData = function(method,name) {
			if (!me.annotations[method]) return null;
			if (!me.annotations[method][name]) return null;
			return private.toAnnotation(me.annotations[method][name]);
		} ;

		this.getClassAnnotation = function(name) {
			if (!me.classAnnotations[name]) return null;
			return me.classAnnotations[name].v;
		} ;

		this.getClassAnnotationData = function(name) {
			if (!me.classAnnotations[name]) return null;
			return private.toAnnotation(me.classAnnotations[name]);
		} ;

		this.getAllAnnotations = function() {
			var o = {};
			for(var k in me.annotations) {
				o[k]={};

				for (var kk in me.annotations[k]) {
					o[k][kk] = me.annotations[k][kk].v;
				}

			}
			return o;
		} ;
		
		this.getAllMethodAnnotations = function(method) {
			var o = {};
			if (!me.annotations[method]) return null;

			for (var kk in me.annotations[method]) {
				o[kk] = me.annotations[method][kk].v;
			}
		
			return o;
		} ;

		this.getAllClassAnnotations = function() {
			var o = {};
			for(var k in me.classAnnotations) {
				o[k]=me.classAnnotations[k].v;
			}
			return o;
		} ;
		
		if (obj._) {
			me.classContext.data = obj._(me.classContext,this);
		}
		
		return this;
	}
	
(function () {
	
	AnnotationsParser.prototype._ = function() {
		   /**
			* @version  1.0.0
			* @title    Javascript Annotations parser
			* @supported
			* */
		   return null;
		} ;	
		
	var private = {
		// Private static property
		"supported"	:	false,
		"loaded"	:	false,
		"cache"		:	{},
		
		// Private static functions
		"parseDocComment" : function(str) {
				var o = [];
				str = str.replace(/\r\n/g,"\n");
				str = str.replace(/\r/g,"\n");
				str = str.replace(/\n+/g,"\n");
				str = str.replace(/\t+/g," ");
				str = str.split("\n");
				var j = str.length;
				var i;
				var st=0;
				for (i=0;i<j;i++) {
					var li = str[i];
					li=li.replace('/\s+/g',' ');
					li=li.trim();
					if (li.length==0) continue;
					if (st==0 && li.indexOf('\x2f*')!=-1) st=1;
					if (st==1) {
						li=li.trim();
						var p=0;
						var last=false;

						p = li.indexOf('\x2f*');
						if (p>-1) {
							li=li.substr(p+2);
							li=li.trim();
						}

						p = li.indexOf('*\x2f');
						if (p>-1) {
							li=li.substr(0,p);
							li=li.trim();
							last=true;
						}

						p = li.indexOf('*');
						if (p==0) {
							li=li.substr(1);
							li=li.trim();
						}

						p = li.indexOf('##');
						if (p>-1) {
							li=li.substr(0,p);
							li=li.trim();
						}

						if (li.length>0) o.push(li);
						if (last) break;
					}

				}

				return o;
			} ,
			
		"getMultiline" : function (endChar,arr,fromPos) {

				var first = "";
				var i = 0;
				var j = arr.length;

				for (i=fromPos; i<j;i++) {
					var li = arr[i].trim();
					if (li==endChar) break;
					first = first + li + "\n";
				}

				first=first.replace('/\n+/g',"\n");
				first=first.trim();

				return {
					"next"	:	i,
					"line"	:	first	}
					;

			} ,
			
		"parseAnnotations" : function (arr) {

				var j = arr.length;
				var i = 0;
				var lc = 0;
				var o = [];
				var cur = false;
				var val = null;
				var regTag = /^\@([A-Za-z\x3f][A-Za-z0-9\\_\x3a\x5b\x5d]{0,40})(\s+(.*)|)$/;
				var res;
				var anv = null;
				var fac = false;
				
				for (i=0;i<j;i++) {
					
					res = regTag.exec(arr[i]);
					if (!res) continue;
					cur = res[1];
					val = res[3]?res[3]:'';
					val = val.trim();

					if (cur.charAt(0)=='?') {
						
						cur=cur.substr(1);
						fac=true;
						
					} else {
						
						fac=false;
					
					}

					if (val == '') {
						o.push({
							"f"	:	fac,
							"t"	:	'bool',
							"k"	:	cur,
							"v"	:	true
						})	;

					} else if (val == '{') {
						val = private.getMultiline('}',arr,i+1);
						i=val.next;

						o.push({
							"f"	: fac,
							"t" : 'string',
							"k"	: cur,
							"v"	: val.line
						})	;

					} else if (val == '(') {
						val = private.getMultiline(')',arr,i+1);
						i=val.next;

						o.push({
							"f"	: fac,
							"t" : 'obj',
							"k"	: cur,
							"v"	: val.line
						})	;

					} else if (/^{|\-}.[0-9]+(|\.[0-9]+)$/.test(val)) {

						o.push({
							"f"	: fac,
							"t" : 'number',
							"k"	: cur,
							"v"	: parseFloat(val)
						})	;

					} else {

						o.push({
							"f"	: fac,
							"t" : 'string',
							"k"	: cur,
							"v"	: val
						})	;

					}

				}

				return o;
			} ,
			
		"parseMember" : function(src,vars) {
				src = private.parseDocComment(src);
				src = private.parseAnnotations(src);
				var arrTag = /^([A-Za-z0-9\\_]{1,40})\x5b([A-Za-z0-9\\_]{0,40})\x5d$/;
				var strTag = /^([A-Za-z0-9\\_]{1,40})$/;
				var li=null;
				var out = {};

				var j = src.length;
				var i = 0;
				for (i=0;i<j;i++) {

					var cur = src[i];
					var org = cur.k;

					var lc = cur.k.length;
					lc = cur.k.charAt(lc-1);

					if (lc==':') {
						cur.l=true;
						cur.k=cur.k.substr(0,cur.k.length-1);
						cur.v=cur.v.replace(/\s/g,'');
						cur.v=cur.v.split(',');
					} else {
						cur.l=false;
					}

					li = arrTag.exec(cur.k);
					if (li !== null ) {
						var k = li[1];
						var v = li[2];
						var isArr = (v=='');
						if (!out[k]) out[k] = {
							"k"	:	k,
							"f"	:	cur.f,
							"l"	:	cur.l,
							"t"	:	cur.t,
							"a"	:	isArr ? 'array' : 'object',
							"v"	:	isArr ? [] : {}
						} ;

						if (isArr) out[k].v.push(cur.v); else out[k].v[v]=cur.v;
						continue;
					}

					li = strTag.exec(cur.k);
					if (li !== null ) {
						if (out[cur.k]) throw "Duplicated annotation `"+org+"` in `"+vars.where+"`";
						cur.a = 'tag';
						out[cur.k] = cur;
						delete(out[cur.k].k);
						continue;
					}

					throw "Invalid annotation `"+org+"` in `"+vars.where+"`";

				}

				return out;

			} ,
			
		"toAnnotation" : function(ann) {
			
				var out = {
					"name"          :   ann.k,
					"inContext"     :   ann.f ? true : false,
					"isList"        :   ann.l ? true : false,
					"valueType"     :   ann.t,
					"annotationMode":   ann.a ? ann.a : 'tag',
					"value"         :   ann.v }
					;

				out.type = out.isList ? 'list' : out.valueType;
				if (ann.a) out.type = out.type + '_' + ann.a;
				return out;
			} ,
		
		"parseFunction" : function(fun) {
				var src = fun.toString();
				src = private.parseMember(src,{"where" : "function X"});
				return src;
			} 
			
	} ; // private
	
	AnnotationsParser.isSupported = function() {
		if (private.loaded) return private.supported;
		
		try {
			var p = AnnotationsParser.parseClass('AnnotationsParser');
			private.supported = p.getClassAnnotation('supported');;
			} catch(DevNull) {}
		
		private.loaded=true;
		return private.supported;
		
		} ;
	
	AnnotationsParser.parseClass = function(cls) {
        var out = null;
        var obj = null;
        if (!cls instanceof String) throw "AnnotationsParser: String required";
        
        if (private.loaded) {
			if (!AnnotationsParser.isSupported()) throw "AnnotationsParser not supported";
			}

        if (private.cache[cls]) return private.cache[cls];

        eval("obj = "+cls+";");

        if (obj instanceof Object) out = new ClassAnnotations(obj,cls, AnnotationsParser.PARSER_MODE_OBJECT,private);
        if (obj instanceof Function) out = new ClassAnnotations(obj.prototype,cls,AnnotationsParser.PARSER_MODE_CLASS,private);

        private.cache[cls] = out;
        return out;
		} ;
		
	AnnotationsParser.parseObject = function(obj) {
        var out = null;
                
        if (private.loaded) {
			if (!AnnotationsParser.isSupported()) throw "AnnotationsParser not supported";
			}
		
		var cls = obj.constructor ? obj.constructor : 'Object';
				
        out = new ClassAnnotations(obj,cls, AnnotationsParser.PARSER_MODE_INSTANCE,private);
        return out;
		} ;
	
}()); 
 