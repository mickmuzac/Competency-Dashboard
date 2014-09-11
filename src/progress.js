var app = angular.module('badge-progress', []);

app.controller('BadgeCtrl', ['$scope', function($scope)
{
	$scope.children = [
		{name: 'Strength', color: 'orange', image: 'img/Strength_Badge-Large.png', progress: 0},
		{name: 'Endurance', color: 'firebrick', image: 'img/Endurance_Badge-Large.png', progress: 0},
		{name: 'Mobility', color: 'orangered', image: 'img/Mobility_Badge-Large.png', progress: 0},
		{name: 'Nutrition', color: 'limegreen', image: 'img/Nutrition_Badge-Large.png', progress: 0},
		{name: 'Ethos', color: 'dodgerblue', image: 'img/Philosophy_Badge-Large.png', progress: 0}
	];

	$scope.name = 'Warrior Athlete';
	$scope.color = 'purple';
	$scope.image = 'img/Soldier-Athlete_Badge-Large.png';
	$scope.progress = 0;

	$scope.$watchGroup(['children[0].progress','children[1].progress','children[2].progress','children[3].progress','children[4].progress'],
		function(newVals, oldVals){
			$scope.progress = newVals.reduce(function(old,cur){return old+cur;}, 0) / 5;
		}
	);

	$scope.genGradient = function(comp){
		var bgColor = 'rgba(255,255,255,0.6)';
		var transition = 0;
		return {
			'background-image':
				'linear-gradient( 0deg, {c}, {c} {p-}, {bg} {p+}, {bg} )'
				.replace(/\{c\}/g, comp.color)
				.replace(/\{p-\}/g, (comp.progress-transition)+'%')
				.replace(/\{p\+\}/g, (comp.progress+transition)+'%')
				.replace(/\{bg\}/g, bgColor)
		};
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

var noCM = function(e){
	if(e.preventDefault) e.preventDefault();
	return false;
};

