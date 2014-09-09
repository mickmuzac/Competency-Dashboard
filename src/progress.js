var app = angular.module('badge-progress', []);

app.controller('BadgeCtrl', ['$scope', function($scope)
{
	$scope.children = [
		{name: 'Strength', color: 'orange', image: 'img/Strength_Badge-Large.png'},
		{name: 'Endurance', color: 'firebrick', image: 'img/Endurance_Badge-Large.png'},
		{name: 'Mobility', color: 'orangered', image: 'img/Mobility_Badge-Large.png'},
		{name: 'Nutrition', color: 'limegreen', image: 'img/Nutrition_Badge-Large.png'},
		{name: 'Ethos', color: 'dodgerblue', image: 'img/Philosophy_Badge-Large.png'}
	];

	$scope.name = 'Warrior Athlete';
	$scope.color = 'purple';
	$scope.image = 'img/Soldier-Athlete_Badge-Large.png';
	$scope.progress = Math.floor(Math.random()*100);

	$scope.genGradient = function(color){
		return {
			'background-image':
				'linear-gradient( 0deg, {c}, {c} {p}%, rgba(255,255,255,0.6) {p}%, rgba(255,255,255,0.6) )'
				.replace(/\{c\}/g, color).replace(/\{p\}/g, $scope.progress)
		};
	};

	$scope.randomizeValue = function(evt){
		$scope.progress = Math.floor(Math.random()*100);
		evt.stopPropagation();
		return false;
	};

}]);

