"use strict";

var userScores = localStorage.userScores ? JSON.parse(localStorage.userScores) : null;
var perf;

$.ajax({
	type: 'GET',
	dataType: 'xml',
	url: 'competencies/performance-frameworks/v1/demonstrate-warrior-athlete-ethos.xml',
	success: function(data){
	
		perf = parsePerformanceFramework(data);
		generateTestData();
		drawChart();
		
		perf.handleScore = handleScore;
		ko.applyBindings(perf);
		
		console.log(perf);
		console.log(userScores);
	},
	error: function(err, status, mess){
		console.error("ERROR!!", err, status, mess);
	}
});

function drawChart(){
	var sum = userScores.reduce(function(a, b){ return a + b});
	var sumRemaining = perf.Component.reduce(function(a, b){ return (a>0?a:a.PerformanceLevelSet.total) + (b>0?b:b.PerformanceLevelSet.total)}) - sum;
	var options = {percentageInnerCutout: 45, segmentStrokeColor : sumRemaining > 0 ? "#FFF" : "#FDB45C"};
	
	var data = [
		{
			value: sumRemaining,
			color: "#46BFBD",
			highlight: "#5AD3D1",
			label: "Score Remaining"
		},		
		{
			value: sum,
			color:"#FDB45C",
			highlight: "#FFC870",
			label: "Your Total Score"
		}, 
	];
	var chart = new Chart(document.getElementById('myChart').getContext('2d')).Doughnut(data, options);
	$("#legend").html(chart.generateLegend());
}

function handleScore(single, index){
	//console.log(single, index);
	
	var score = userScores[index], str = "This is where you are!";
	if(single.include == "both" && single.min <= score && score <= single.max){
		return str;
	}
	else if(single.include == "min" && single.min <= score && score < single.max){
		return str;
	}
	else if(single.include == "max" && single.min < score && score <= single.max){
		return str;
	}

	return "";
}

function generateTestData(){
	if(!userScores){
		userScores = [];
		for(var i = 0; i < perf.Component.length; i++){
			userScores.push(Math.round(Math.random() * perf.Component[i].PerformanceLevelSet.total));
		}
		localStorage.userScores = JSON.stringify(userScores);
	}
}

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
		var performanceLevelArr = outObj.Component[i].PerformanceLevelSet.PerformanceLevel;
		
		for(var g = 0; g < performanceLevelArr.length; g++){
			parsePerformanceStr(performanceLevelArr[g]);
		}
		
		outObj.Component[i].PerformanceLevelSet.total = performanceLevelArr[0].total;
	}
	
	return outObj;
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