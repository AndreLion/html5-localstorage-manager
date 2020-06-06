var local = localStorage;
var session = sessionStorage;
var dump = function(){
    var len = 0,
        limit = 2621440,
        result = {
            storage:[],
            percentage:0
        },
        key,value,obj;

	for(var i=0,l=local.length;i<l;i++){
		key = local.key(i);
		value = local.getItem(key);
        obj = {
            key:key,
            value:value,
            isJson:false,
            expand:false,
            type:'local'
        };
        try{
            JSON.parse(value);
            if(!+value){
                obj.isJson = true;
            }
        }catch(e){}
        result.storage.push(obj);
        len += key.length;
        len += value.length;
	}
    result.percentage = (len/limit*100).toFixed(2);

	return result;
};

var dumpSession = function(){
    var result = [],
        key,value,obj;

	for(var i=0,l=session.length;i<l;i++){
		key = session.key(i);
		value = session.getItem(key);
        obj = {
            key:key,
            value:value,
            isJson:false,
            expand:false,
            type:'session'
        };
        try{
            JSON.parse(value);
            if(!+value){
                obj.isJson = true;
            }
        }catch(e){}
        result.push(obj);
	}
	return result;
};

var dumpCookie = function(){
    var c = '; '+document.cookie;
    var result = [];
    var obj = {};
    var key, value;
    var arr = c.split('; ');
    for(var i=0,l=arr.length;i<l;i++){
        if(arr[i] === ''){
            continue;
        }
        key = arr[i].split('=')[0];
        value = Cookies.get(key);
        obj = {
            key:key,
            value:value,
            isJson:false
        };
        try{
            JSON.parse(value);
            if(!+value){
                obj.isJson = true;
            }
        }catch(e){}
        result.push(obj);
    }
    return result;
};

