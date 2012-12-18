/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />

class Module_Main {
    
    /**
     * 
     */
    static addEntryFromSidebarLeftQueue (entry:string) {
        tmpCubeVizLeftSidebarLeftQueue.push ( entry );
    }
    
    /**
     * Build component selection in the left sidebar (to select component elements), 
     * (using jsontemplate)
     */
    static buildComponentSelection ( components, selectedComponents ) : void {
    
        var selectedComLength:number = 1,
            tplEntries = {"dimensions":[]};
                        
        for ( var com in components ["dimensions"] ) {
            
            if ( undefined != selectedComponents ["dimensions"][com] ) {
                selectedComLength = System.countProperties (selectedComponents ["dimensions"][com]["elements"]);
                selectedComLength = 0 < selectedComLength ? selectedComLength : 1;
            } else {
                selectedComLength = 1;
            }
            
            com = components ["dimensions"][com];

            com ["selectedElementCount"] = selectedComLength;
            com ["elementCount"] = com ["elements"]["length"];
            tplEntries ["dimensions"].push (com);
        }
    
        try {
            var tpl = jsontemplate.Template(CubeViz_Dimension_Template);
            $("#sidebar-left-data-selection-dims-boxes").html ( tpl.expand(tplEntries) );
        } catch ( e ) {
            System.out ( "buildComponentSelection error" );
            System.out ( e );
        }
    }
    
    /**
     * Build selectbox for datasets
     * 
     * Called by:
     * - onComplete_LoadDataSets
     */
    static buildDataSetBox ( options, selectedDataSetUrl:string ) {
        var entry = null;
        
        $("#sidebar-left-data-selection-sets").empty ();
        
        for ( var i in options ) {
            entry = $("<option value=\"" + options [i].url +"\">" + options [i].label + "</option>");  
            
            if ( selectedDataSetUrl == options [i].url ) {
                entry.attr ( "selected", "selected" );
            }
                      
            $("#sidebar-left-data-selection-sets").append ( entry );
        }
    }
    
    /**
     * Build selectbox for data structure definitions.
     */
    static buildDataStructureDefinitionBox (options:any, selectedDsdUrl:string) {
        var entry = null;
        
        /**
         * Fill data structure definitions selectbox 
         */
        $("#sidebar-left-data-selection-strc").empty ();
        
        for ( var i in options ) {
            entry = $("<option value=\"" + options[i]["url"] +"\">" + options[i]["label"] + "</option>");            
            
            if ( options [i]["url"] == selectedDsdUrl ) {
                entry.attr ("selected", "selected");
            }
            
            $("#sidebar-left-data-selection-strc").append ( entry );
        }
    }
    
    /**
     * Build dialog to select / unselect certain elements
     */
    static buildDimensionDialog ( hashedUrl:string, label:string, typeUrl:string, url:string, 
                                   componentDimensionElements:any ) {
                                  
        // Prepare jsontemplate
        var tpl = jsontemplate.Template(CubeViz_Dialog_Template);

        // Sorting the list of to be shown elements alphabetically
        componentDimensionElements.sort(function (a, b){
            a = a["propertyLabel"].toUpperCase();         
            b = b["propertyLabel"].toUpperCase();         
            return a < b ? -1 : (a > b ? 1 : 0 );
        });
        
        // fill template placeholders with data
        $("#dimensionDialogContainer").html ( tpl.expand({ 
            "hashedUrl": hashedUrl, "label": label, "typeUrl": typeUrl, "url": url,
            "list": componentDimensionElements
        }));
        
        // collect urls of all selected component dimensions
        var elements = CubeViz_Links_Module ["selectedComponents"]["dimensions"][hashedUrl]["elements"],
            selectedDimensionUrls:string[] = []; 
            
        for ( var index in elements ) {
            selectedDimensionUrls.push ( elements [index]["property"] );
        }
        
        // go through the list of checkboxes and select one if its a the previously 
        // selected component dimension
        elements = $(".dialog-checkbox-" + hashedUrl);
        var length = elements ["length"];
        
        for ( var i = 0; i < length; ++i) {
            
            if ( 0 <= $.inArray ( $(elements[i]).attr("value").toString (), selectedDimensionUrls ) ) {
                $(elements[i]).attr ("checked", "checked" );
            }
        }
    }
    
    /**
     * 
     */
    static hideSidebarLoader () {
        if ( 0 == tmpCubeVizLeftSidebarLeftQueue ["length"] ) {
            $("#sidebar-left-loader")
                .fadeOut ( 400 );
        }
    }
    
    /**
     * 
     */
    static removeEntryFromSidebarLeftQueue (entry:string) {
        var newQueue = [];
        
        for ( var index in removeEntryFromSidebarLeftQueue ) {
            if ( entry != removeEntryFromSidebarLeftQueue[index] ) {
                newQueue.push ( removeEntryFromSidebarLeftQueue[index] );
            }
        }
        
        tmpCubeVizLeftSidebarLeftQueue = newQueue;
    }
    
    /**
     * Reset all module parts, except this ones in exceptOf parameter
     */
    static resetModuleParts ( exceptOf:string[] = [] ) : void {
    
        if ( -1 == $.inArray ("selectedDSD", exceptOf) ) {
            CubeViz_Links_Module ["selectedDSD"] = undefined;
        }
    
        if ( -1 == $.inArray ("selectedDS", exceptOf) ) {
            CubeViz_Links_Module ["selectedDS"] = undefined;
        }
        
        if ( -1 == $.inArray ("linkCode", exceptOf) ) {
            CubeViz_Links_Module ["linkCode"] = undefined;
        }
        
        if ( -1 == $.inArray ("selectedComponents.dimensions", exceptOf) ) {
            CubeViz_Links_Module ["selectedComponents"]["dimensions"] = undefined;
        }
        
        /*
        Leave measure stuff untouched as long as there is only one of it
        if ( -1 == $.inArray ("selectedComponents.measures", exceptOf) ) {
            CubeViz_Links_Module ["selectedComponents"]["measures"] = null;
        }
        */
        
        if ( -1 == $.inArray ("components.dimensions", exceptOf) ) {
            CubeViz_Links_Module ["components"]["dimensions"] = undefined;
        }
        
        /*
        Leave measure stuff untouched as long as there is only one of it
        if ( -1 == $.inArray ("components.measures", exceptOf) ) {
            CubeViz_Links_Module ["components"]["measures"] = null;
        }*/
    }
    
    /**
     * 
     */
    static showSidebarLoader () : void {
                
        $("#sidebar-left-loader")
            .fadeIn ( 1000 )
            // set height dynamicly
            .css ( "height", ( $("#sidebar-left").css ("height") ) );
    }
}