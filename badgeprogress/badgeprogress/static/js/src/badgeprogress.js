function BadgeProgressXBlock(runtime,element)
{
	$(function($){

	var app = angular.module('badge-progress', []);

	app.controller('BadgeCtrl', ['$scope', function($scope)
	{
		$scope.children = [
			{name: 'Strength', color: 'orange', image: 'static/img/Strength_Badge-Large.png', progress: 40},
			{name: 'Endurance', color: 'firebrick', image: 'static/img/Endurance_Badge-Large.png', progress: 100},
			{name: 'Mobility', color: 'orangered', image: 'static/img/Mobility_Badge-Large.png', progress: 20},
			{name: 'Nutrition', color: 'limegreen', image: 'static/img/Nutrition_Badge-Large.png', progress: 80},
			{name: 'Ethos', color: 'dodgerblue', image: 'static/img/Philosophy_Badge-Large.png', progress: 60}
		];

		$scope.name = 'Warrior Athlete';
		$scope.color = 'purple';
		$scope.image = 'img/Soldier-Athlete_Badge-Large.png';
		$scope.progress = 0;
		$scope.horiz = false;
		$scope.badgeStart = true;
		$scope.transparency = 1;

		$scope.$watchGroup(['children[0].progress','children[1].progress','children[2].progress','children[3].progress','children[4].progress'],
			function(newVals, oldVals){
				$scope.progress = newVals.reduce(function(old,cur){return old+cur;}, 0) / 5;
			}
		);

		$scope.genGradient = function(comp){
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
	
		$scope.incrementValue = function(comp, evt)
		{
			if(evt.button === 0)
				comp.progress = Math.min(comp.progress+20, 100);
			else
				comp.progress = Math.max(comp.progress-20, 0);
	
			evt.stopPropagation();
		};

	}]);

	window.noCM = function(e){
		if(e.preventDefault) e.preventDefault();
		return false;
	};

	angular.bootstrap( element, ['badge-progress'] );
	
	});
}

