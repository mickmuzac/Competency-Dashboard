"use strict";

console.log("Testing!");


$.ajax({

	type: 'GET',
	dataType: 'xml',
	url: 'competencies/performance-frameworks/v1/demonstrate-warrior-athlete-ethos.xml',
	success: function(data){
	
		console.log(data);
		parsePerformanceFramework(data);
	},
	error: function(err, status, mess){
	
		console.log("ERROR!!", err, status, mess);
	}
});

function parsePerformanceFramework(xml){

	var jXML = $(xml);
	
	var outObj;
	try{
		outObj = JSON.parse(xml2json(xml).replace("undefined", "")).PerformanceFramework;
	}
	catch(e){
		console.error("Unable to parse XML document", xml, e);
		return;
	}
	
	for(var i = 0; i < outObj.Component.length; i++){
		//console.log(outObj.Component[i]);
		var performanceLevelArr = outObj.Component[i].PerformanceLevelSet.PerformanceLevel;
		for(var g = 0; g < performanceLevelArr.length; g++){
			parsePerformanceStr(performanceLevelArr[g])
			console.log(performanceLevelArr[g]);
		}
	}
	
	
	
}

function parsePerformanceStr(perfObj){

	var intervalArr, str = perfObj.Indicator['@id'];

	if(str.indexOf('between') > -1){
		intervalArr = str.match(/([0-9]+)-and-([0-9]+)-out-of-([0-9]+)/);
		perfObj.total = +intervalArr[3];
		
		perfObj.min = +intervalArr[1];
		perfObj.max = +intervalArr[2];
		perfObj.include = "both";
	}
	
	else{
		intervalArr = str.match(/([0-9]+)-out-of-([0-9]+)/);
		perfObj.total = +intervalArr[2];
		
		if(str.indexOf('less') > -1){
			perfObj.min = 0;
			perfObj.max = +intervalArr[1];
			perfObj.include = "min";
		}	
		else if(str.indexOf('more') > -1){
			perfObj.min = +intervalArr[1];
			perfObj.max = +intervalArr[2];
			perfObj.include = "max";
		}	
		else if(intervalArr){
			perfObj.min = +intervalArr[1];
			perfObj.max = +intervalArr[1];
			perfObj.include = "both";
		}
		else{
			console.error("Unable to parse performance string: ", str);
			return;
		}
	}
}