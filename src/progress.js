var app = angular.module('badge-progress', []);

app.controller('BadgeCtrl', ['$scope','$http', function($scope, $http)
{
	$scope.name = 'Warrior Athlete';
	$scope.color = 'purple';
	$scope.image = 'img/Soldier-Athlete_Badge-Large.png';
	$scope.progress = 0;

	$scope.horiz = false;
	$scope.badgeStart = true;
	$scope.transparency = 1;

	$http.get('src/tasks.json')
		.success(function(data,status,headers,config)
		{
			for(var i=0; i<data.length; i++)
				data[i].progress = 0;
			
			$scope.children = data;
			$scope.calculatePerformanceData();
		})
		.error(function(data,status,headers,config){
			console.log('Could not retrieve competency data');
		});


	$scope.calculatePerformanceData = function()
	{
		var config = {
			'method': 'GET',
			'url': 'http://ec2-54-85-28-165.compute-1.amazonaws.com:8100/xAPI/statements', 
			'headers': {'X-Experience-API-Version': '1.0.1', 'Authorization': 'Basic ZGFzaFJlcG9ydGluZzpSZXBvcnREYXRhQW5hbHl0aWNz'},
			'responseType': 'json',
			'params': {'agent': JSON.stringify({'account':{'homePage':'http://vm-edx','name':'vergenzs'}}), 'verb':'http://adlnet.gov/expapi/verbs/passed'}
		};

		$http(config).success(function success(data){
			console.log(data);
		})
		.error(function(data){
			console.log('Could not retrieve data from LRS:', data);
		});

		$scope.progress = $scope.children.reduce(function(old,cur){return old+cur.progress;}, 0) / $scope.children.length;
	};

	$scope.genGradient = function(comp)
	{
		var bgColor = 'rgba(255,255,255,'+$scope.transparency+')';

		if(comp.progress === 0){
			return {'background-color': bgColor};
		}
		else if(comp.progress === 100){
			return {'background-color': comp.color};
		}
		else {
			return {
				'background-image':
					'linear-gradient( {dir}deg, {c}, {c} {p}, {bg} {p}, {bg} )'
					.replace(/\{dir\}/g, comp.horiz ? 90 : 0)
					.replace(/\{c\}/g, comp.color)
					.replace(/\{p\}/g, comp.progress+'%')
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

