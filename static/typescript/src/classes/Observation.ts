/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Observation {
    
    /**
     * 
     */
    static loadAll (linkCode:string, callback) {
        $.ajax({
            url: CubeViz_Links_Module ["cubevizPath"] + "getresultobservations/",
            data: {
                lC: linkCode
            }
        }).done( function (entries) { 
            Observation.prepareLoadedResultObservations ( entries, callback );
        });
    }
    
    /**
     * 
     */
    static prepareLoadedResultObservations (entries, callback) {
        // TODO: fix it, because sometimes you got JSON from server, 
        // sometimes not, than you have to parse it
        var parse = $.parseJSON ( entries );
        if ( null == parse ) {
            callback ( entries );
        } else {
            callback ( parse );
        }
    }
    
}
