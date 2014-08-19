"use strict";
(function(window, $){
	var userScores = localStorage.userScores ? JSON.parse(localStorage.userScores) : null;
	var tempScores = [];
	
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
	var extraColorKeys = ["green", "blue", "gold", "red", "purple"];
	
	$.ajax({
		type: 'GET',
		dataType: 'xml',
		url: 'competencies/performance-frameworks/v1/demonstrate-warrior-athlete-ethos.xml',
		success: function(data){
		
			perf = parsePerformanceFramework(data);
			
			var tempArr = [];
			for(var i = 0; i < perf.Component.length; i++){
				for(var g = 0; g < perf.Component[i].PerformanceLevelSet.PerformanceLevel.length; g++){
					tempArr.push(perf.Component[i].PerformanceLevelSet.PerformanceLevel[g]);
				}
			}
			
			generateTestData();
			
			perf.getImgURL = getImgURL;
			perf.isCurrentScore = isCurrentScore;
			ko.applyBindings(perf);
			
			var collection = (new ADL.Collection(tempArr)).groupBy('Indicator.Description');
			
			drawHorizontalBar();
			drawChart(collection);

			console.log(perf);
			console.log(userScores);
		},
		error: function(err, status, mess){
			console.error("ERROR!!", err, status, mess);
		}
	});

	function drawChart(collection){
		var sum = userScores.reduce(function(a, b){ return a + b});
		var sumRemaining = perf.Component.reduce(function(a, b){ return (a>0?a:a.PerformanceLevelSet.total) + (b>0?b:b.PerformanceLevelSet.total)}) - sum;
		var options = {percentageInnerCutout: 45, segmentStrokeColor : sumRemaining > 0 ? "#FFF" : "#FDB45C"};
		
		//Copy userScores so we don't mutate the original values
		var data = [];
		
		data.push({
			value: sum,
			color:colors.darkgray[0],
			highlight: colors.darkgray[1],
			label: "Your Total Score"
		});
		
		for(var i = 0; i < collection.contents.length; i++){
			var totalCount = 0;
			for(var g = 0; g < collection.contents[i].data.length; g++){

				var item =  collection.contents[i].data[g];
				
				if(item._pie != "over"){
					totalCount += item._pointValue;
				}
			}

			data.push({
				value: totalCount,
				color: colors[extraColorKeys[i]][0],
				highlight: colors[extraColorKeys[i]][1],
				label: collection.contents[i].group
			});	
		}
		
		var chart = new Chart(document.getElementById('myChart').getContext('2d')).Doughnut(data, options);
		$("#legend").html(chart.generateLegend());
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
				if(!Array.isArray(perfLevel.PerformanceLevel[g]._include.match(/both|max/))){
					perfLevel.PerformanceLevel[g].max--;
				}
				
				var color = perfLevel.PerformanceLevel[g].Indicator.Description.toLowerCase() == "not competent" ? colors.gray : colors[extraColorKeys[g]];
				perfLevel.PerformanceLevel[g]._pointValue = perfLevel.PerformanceLevel[g].max-totalDiff;
				
				data.datasets.push({
					fillColor : color[0],
					strokeColor : color[1],
					data: [perfLevel.PerformanceLevel[g]._pointValue],
					title: perfLevel.PerformanceLevel[g].Indicator.Description,
				});
				
				totalDiff = perfLevel.PerformanceLevel[g].max;
				
				handlePieChartInfo(perfLevel.PerformanceLevel[g], i);
			}
			
			perfLevel.PerformanceLevel[g]._pointValue = perfLevel.total-totalDiff;
			data.datasets.push({
			    fillColor : colors.gold[0],
				strokeColor : colors.gold[1],
				data: [perfLevel.total-totalDiff],
				title: perfLevel.PerformanceLevel[g].Indicator.Description
			});
			handlePieChartInfo(perfLevel.PerformanceLevel[g], i);

			var options = {
				annotateLabel: "<%=(v1 == '' ? '' : v1) %>",
				graphMin: 0,
				annotateDisplay: true				
			};
			var chart = new ChartNew(document.getElementById('canvas' + i).getContext('2d')).HorizontalStackedBar(data, options);
		}
	}
	
	function handlePieChartInfo(perf, index){
		if(perf._pie == "over"){
			tempScores[index] -= perf._pointValue;
			perf._pointValue = 0;
		}		
		else if(perf._pie == "current"){
			
			perf._pointValue -= tempScores[index];
			tempScores[index] = 0;
		}		
	}
	
	function isCurrentScore(single, index){

		var score = userScores[index];
		
		if(((single._include == "both" || single._include == "max") && score > single.max) || (single._include == "min" && score >= single.max)){
			single._pie = "over";
			return false;
		}
		else if(((single._include == "both" || single._include == "min") && score < single.min) || (single._include == "max" && score <= single.min)){
			single._pie = "under";
			return false;
		}
		
		if(single._include == "both" && single.min <= score && score <= single.max){
			single._pie = "current";
			return true;
		}
		else if(single._include == "min" && single.min <= score && score < single.max){
			single._pie = "current";
			return true;
		}
		else if(single._include == "max" && single.min < score && score <= single.max){
			single._pie = "current";
			return true;
		}

		return false;
	}		
	
	function getImgURL(single){
		return "";
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

		Array.prototype.push.apply(tempScores, userScores);
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
			perfObj._include = "both";
		}
		
		else{
			intervalArr = str.match(/([0-9]+)-out-of-([0-9]+)/);
			perfObj.total = +intervalArr[2];
			
			if(str.indexOf('less') > -1){
				perfObj.min = 0;
				perfObj.max = +intervalArr[1];
				perfObj._include = "min";
			}	
			else if(str.indexOf('more') > -1){
				perfObj.min = +intervalArr[1];
				perfObj.max = +intervalArr[2];
				perfObj._include = "max";
			}	
			else if(intervalArr){
				perfObj.min = +intervalArr[1];
				perfObj.max = +intervalArr[1];
				perfObj._include = "both";
			}
			else{
				console.error("Unable to parse performance string: ", str);
				return;
			}
		}
	}
}(window, jQuery));