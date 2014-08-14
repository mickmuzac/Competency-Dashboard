"use strict";

console.log("Testing!");


$.ajax({

	type: 'GET',
	dataType: 'xml',
	url: 'competencies/competency-frameworks/v1/demonstrate-warrior-athlete-ethos.xml',
	success: function(data){
	
		console.log(data);
		debugger;
	},
	error: function(err, status, mess){
	
		console.log("ERROR!!", err, status, mess);
	}
});