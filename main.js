'use strict';
function toString(val)
{
	return ['string','number'].indexOf(typeof val)>-1?val.toString():'';
}
function addslashes(val)
{
	return toString(val).replace(/[\\']/g,i=>({'\\':'\\\\','\'':'\\\''})[i]);
}
function esc(val,a)
{
	val=toString(val).replace(/[&<>"]/g,i=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[i]);
	return !a?val:addslashes(val);
}