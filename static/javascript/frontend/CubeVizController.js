$(document).ready(function(){
	
	/************
	 * Includes *
	 ************/
	 
	Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
    var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
    
    /******************
     * Event Handlers *
     ******************/
     
    $(body).bind("AjaxCubeVizParametersRetrieved.CubeViz", function(event) {
		//set parameters to global array
		CubeViz_Parameters_Component = CubeViz_Controller_Main.retrievedCubeVizParameters;
		//get observations for the retrieved parameters
		CubeViz_Controller_Main.getResultObservations(CubeViz_Link_Chosen_Component);
	});
	
	$(body).bind("AjaxResultObservationsRetrieved.CubeViz", function(event) {
		
		//check if there is suitable charts
		var multipleDimensions = CubeViz_Controller_Main.getMultipleDimensions(CubeViz_Parameters_Component);
		var suitableCharts = CubeViz_Controller_Main.getSuitableChartTypes(multipleDimensions, CubeViz_ChartConfig);
		
		if(suitableCharts.charts.length == 0) {
			return;
		} else {
			//pick the first suitable chart type
			Namespacedotjs.include(suitableCharts.charts[0].class);
			eval('var chart = '+suitableCharts.charts[0].class+';');
			
			chart.init(CubeViz_Controller_Main.retrievedResultObservations, CubeViz_Parameters_Component);
			var renderedChart = chart.getRenderResult();
			CubeViz_Controller_Main.renderChart(renderedChart);
		}		
	});
        
    //init controller
    CubeViz_Controller_Main.init(CubeViz_Parameters_Component);
    //get the parameters for the link
    CubeViz_Controller_Main.getParametersFromLink(CubeViz_Link_Chosen_Component);    
    
});