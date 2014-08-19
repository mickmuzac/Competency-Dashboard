"use strict";
(function(window, $){
	var userScores = localStorage.userScores ? JSON.parse(localStorage.userScores) : null;
	var perf;
	var colors = {
		gray:["rgba(220,220,220,0.5)", "rgba(220,220,220,1)"], 
		blue:["rgba(151,187,205,0.5)", "rgba(151,187,205,1)"], 
		purple:["rgba(201, 198, 229, 0.5)", "rgba(201, 198, 229, 1)"], 
		green:["rgba(151, 205, 158, 0.5)","rgba(151, 205, 158, 1)"],
		gold:["rgba(237, 235, 65, 0.5)", "rgba(207, 205, 65, 1)"],
		red: ["rgba(237, 65, 65, 0.5)", "#DB7D7D"],
		darkgray: ["rgba(190, 190, 190, 0.5)","#ccc"]
	};
	var extraColorKeys = ["green", "blue"];
	
	$.ajax({
		type: 'GET',
		dataType: 'xml',
		url: 'competencies/performance-frameworks/v1/demonstrate-warrior-athlete-ethos.xml',
		success: function(data){
		
			perf = parsePerformanceFramework(data);
			generateTestData();
			drawChart();
			
			perf.getImgURL = getImgURL;
			perf.isCurrentScore = isCurrentScore;
			//perf.drawHorizontalBar = drawHorizontalBar;
			ko.applyBindings(perf);
			
			drawHorizontalBar();
			
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
		
		//var chart = new Chart(document.getElementById('myChart').getContext('2d')).Doughnut(data, options);
		//$("#legend").html(chart.generateLegend());
	}
	
	function drawHorizontalBar(){
		for(var i = 0; i < perf.Component.length; i++){
		
			var data = {labels: ["Performance Levels","You"], datasets: []};
			var perfLevel = perf.Component[i].PerformanceLevelSet;
			var totalDiff = 0;
			

			data.datasets.push({
				fillColor : colors.darkgray[0],
				strokeColor : colors.darkgray[1],
				data: [0,userScores[i]],
				title: "Current"
			});
			
			for(var g = 0; g < perfLevel.PerformanceLevel.length-1; g++){
				if(!Array.isArray(perfLevel.PerformanceLevel[g].include.match(/both|max/))){
					perfLevel.PerformanceLevel[g].max--;
				}
				var color = perfLevel.PerformanceLevel[g].Indicator.Description.toLowerCase() == "not competent" ? colors.gray : colors[extraColorKeys[g]];
				data.datasets.push({
					fillColor : color[0],
					strokeColor : color[1],
					data: [perfLevel.PerformanceLevel[g].max-totalDiff],
					title: perfLevel.PerformanceLevel[g].Indicator.Description,
				});
				
				totalDiff = perfLevel.PerformanceLevel[g].max;
			}
			
			data.datasets.push({
			    fillColor : colors.gold[0],
				strokeColor : colors.gold[1],
				data: [perfLevel.total-totalDiff],
				title: perfLevel.PerformanceLevel[g].Indicator.Description
			});

			var options = {
				annotateLabel: "<%=(v1 == '' ? '' : v1) %>",
				graphMin: 0,
				annotateDisplay: true				
			};
			var chart = new ChartNew(document.getElementById('canvas' + i).getContext('2d')).HorizontalStackedBar(data, options);
		}
	}
	
	function isCurrentScore(single, index){

		var score = userScores[index];
		if(single.include == "both" && single.min <= score && score <= single.max){
			return true;
		}
		else if(single.include == "min" && single.min <= score && score < single.max){
			return true;
		}
		else if(single.include == "max" && single.min < score && score <= single.max){
			return true;
		}

		return false;
	}		
	
	function getImgURL(single){
		var lower = single.Indicator.Description.toLowerCase(), 
			lowerMatch = lower.match(/advanced|intermediate|beginner/),
			prefix = "img/";
		
		if(Array.isArray(lowerMatch)){
			return prefix + lowerMatch[0] + ".png";
		}
		else if(lower == "competent"){
			return prefix + "advanced.png";
		}
		else if(lower == "not competent"){
			return prefix + "none.png";
		}
		else return prefix + "question.png";
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
}(window, jQuery));