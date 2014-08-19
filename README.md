Competency-Dashboard
====================

Click [here](http://mickmuzac.github.io/Competency-Dashboard/) to view a live demo of this project.

####Introduction
The Competency Dashboard currently displays visualizations related to progress towards a set of competencies and the temporary (made up) badges that go along with them. However, this project primarily serves as a functional mockup for future development and just about everything will probably change.

####How does it work?
The way this dashboard works is very likely to change soon. With that said, this project only requires 2 inputs: a properly formatted Medbiquitous performance framework XML file and user performance data. I encourage checking out the developer console in your browser to see what the performance framework and the generated user data look like.

The performance framework file is currently being loaded via AJAX from `competencies/performance-frameworks/v1/demonstrate-warrior-athlete-ethos.xml` (hard coded, will be generalized soon). For ease of use, this XML file is immediately converted to JSON. 

From there, the dashboard parses the performance ranges given by each `Component`'s `PerformanceLevelSet` array. These ranges are initially given in the form `points_less-than-3-out-of-5`, but are translated to min, max, and include values. 

User performance data is being generated by the `generateTestData` function. For each `Component` in the performance framework, a random integer between 0 and `PerformanceLevelSet.total` is generated.

Given this information, it then becomes possible to include logic that compares user performance data to data in the performance framework to generate informing visualizations.

####Why so many dependencies?
This project currently depends on six Javascript libraries. They are: jQuery, Knockout, xml2json, Chart.js, ChartNew.js, and xAPI Collection. Using these libraries allows me to quickly crank out prototypes and application level code without spending hours or days doing things like converting XML to JSON. If necessary, we can optimize the code to not rely on some of these libraries, but there isn't really a reason to do so prematurely.
