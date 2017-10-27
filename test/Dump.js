function toHTML(s,nl2br) {
	s=String(s);
	s=s.replace(/\&/g,'&amp;');
	s=s.replace(/\</g,'&lt;');
	s=s.replace(/\>/g,'&gt;');
	s=s.replace(/\'/g,'&#39;');
	s=s.replace(/\"/g,'&quot;');
	if (nl2br) s=s.replace(/\n/g,"<br>");
	return s;
	} 
	
function Dump(obj) {
	var html = '<table class="Dump">';
	
	if (obj instanceof Object) {
		html+='<tr><td colspan="2" class="ClassName">'+toHTML(obj.constructor.name)+'</td></tr>';
		}
	var member;
	for( member in obj) {
		html+='<tr><td>'+toHTML(member)+'</td>';
		var val = obj[member];
		
		html+='<td>';
		
		if (val instanceof Object) {
			html+=Dump(val);
		} else if (val instanceof Function) {
			html+=Dump(val);
		} else if (val instanceof Array) {
			html+=Dump(val.join(', '));
		} else if (val instanceof String) {
			html+=toHTML('"'+val+'"');
		} else {
			html+=toHTML(val);
			}
		
		html+='</td></tr>';
		}
		
	html+='</table>';
	return html;	
	}