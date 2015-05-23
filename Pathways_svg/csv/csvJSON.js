function csvJSON (csv){ //csv to JSON convertor

var lines = csv.split("\n");
var headers = lines[0].split(",");

var result = [];
for(var i=1;i<lines.length;i++){
	var obj = {};
	var values = [];
	var rows = lines[i].split(",");
	for(var j=0;j<headers.length;j++){
		var valueObj={};
		if(headers[j]=="Name"){
			obj[headers[j]] = rows[j]; 
		}
		else{
			valueObj["time"] = j;
			valueObj["conc"] = rows[j];			
			values.push(valueObj); //all the concentrations in an array
		}
		
		obj["values"] = values; //key is values
	}

  console.log(obj);
  result.push(obj);
}
		
//return JSON.stringify(result) ;
return result;

}