var app = angular.module('badge-progress', ['angularSpinner']);

app.controller('BadgeCtrl', ['$scope','$http', function($scope, $http)
{
	$scope.name = 'Warrior Athlete';
	$scope.color = 'purple';
	$scope.image = 'img/Soldier-Athlete_Badge-Large.png';
	$scope.progress = 0;

	$scope.horiz = false;
	$scope.badgeStart = true;
	$scope.dataReady = false;
	$scope.showSingleBadge = Array.isArray(window.location.pathname.match(/single\-progress/i));
	$scope.transparency = 1;

	$http.get('src/tasks.json')
		.success(function(data,status,headers,config)
		{
			// initialize progress and append tasks to rollup badge
			for(var i=0; i<data.length; i++){
				data[i].progress = 0;		
			}

			$scope.children = data;
			$scope.calculatePerformanceData();
		})
		.error(function(data,status,headers,config){
			console.log('Could not retrieve competency data');
		});


	$scope.calculatePerformanceData = function()
	{
		var homepage = /homepage=([^&]+)/.exec(window.location.search);
		homepage = homepage? decodeURIComponent(homepage[1]) : null;
		var username = /username=(\w+)/.exec(window.location.search);
		username = username? decodeURIComponent(username[1]) : null;
		
		var config = {
			'method': 'GET',
			'url': 'http://adlx.adlnet.gov:8100/xAPI/statements', 
			'headers': {'X-Experience-API-Version': '1.0.1', 'Authorization': 'Basic ZGFzaFJlcG9ydGluZzpSZXBvcnREYXRhQW5hbHl0aWNz'},
			'responseType': 'json',
			'params': {'agent': JSON.stringify({'account':{'homePage':homepage,'name':username}}), 'verb':'http://adlnet.gov/expapi/verbs/passed'}
		};

		$http(config).success(function success(data)
		{
			for(var i=0; i<data.statements.length; i++)
			{
				var stmt = data.statements[i];
				for(var j=0; j<$scope.children.length; j++)
				{
					if( $scope.children[j].tasks.indexOf(stmt.object.id) != -1 ){
						$scope.children[j].progress++;
					}

				}
			}

			$scope.progress = $scope.children.reduce(function(sum,i){ return sum+i.progress; }, 0);
			$scope.tasksLength = $scope.children.reduce(function(sum,i){ return sum+i.tasks.length; }, 0);

			//if showing single badge, then remove badges that are not current
			if($scope.showSingleBadge){
				var currentBadge = /currentBadge=(\w+)/.exec(window.location.search);
				currentBadge = currentBadge? decodeURIComponent(currentBadge[1]) : null;
				
				for(var i=0; i < $scope.children.length; i++)
				{
					if($scope.children[i].name == currentBadge){
						$scope.children = [$scope.children[i]];
						break;
					}
				}
			}

			if( data.more !== '' ){
				config.url = 'http://ec2-54-85-28-165.compute-1.amazonaws.com:8100'+data.more;
				$http(config)
					.success(success)
					.error(function(data){
						console.log('Could not get more:', data);
					});
			}
			else{
				$scope.dataReady = true;
			}
		})
		.error(function(data){
			
			console.log('Could not retrieve data from LRS:', data);
		});

	};

	$scope.genGradient = function(comp)
	{
		var bgColor = 'rgba(255,255,255,'+$scope.transparency+')';


		if(comp.progress === 0){
			return {'background-color': bgColor};
		}
		else if(comp.progress === (comp.tasks ? comp.tasks.length : comp.tasksLength)){
			return {'background-color': comp.color};
		}
		else {
			return {
				'background-image':
					'linear-gradient( {dir}deg, {c}, {c} {p}, {bg} {p}, {bg} )'
					.replace(/\{dir\}/g, comp.horiz ? 90 : 0)
					.replace(/\{c\}/g, comp.color)
					.replace(/\{p\}/g, Math.ceil(comp.progress/ (comp.tasks ? comp.tasks.length : comp.tasksLength)*100)+'%')
					.replace(/\{bg\}/g, 'transparent'),
				'background-color': bgColor
			}
		}
	};

	/*$scope.incrementValue = function(comp, evt)
	{
		if(evt.button === 0)
			comp.progress = Math.min(comp.progress+20, 100);
		else
			comp.progress = Math.max(comp.progress-20, 0);

		evt.stopPropagation();
	};*/

}]);

var noCM = function(e){
	if(e.preventDefault) e.preventDefault();
	return false;
};

