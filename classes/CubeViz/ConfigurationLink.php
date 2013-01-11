<?php
/**
 * This class represents an LinkHandle object
 * Used for handling files in the links/ directory
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */ 
class CubeViz_ConfigurationLink
{   
    /**
     * Path to the links folder
     */
    protected $_hashDirectory = '';    

    /**
     * filePrefix for dataHash
     */
    public static $filePrefForDataHash = 'dataHash-';
    
    /**
     * filePrefix for uiHash
     */
    public static $filePrefForUiHash = 'uiHash-';
    
    /**
     * Constructor
     */
    public function __construct($path) 
    {
        $this->_hashDirectory = $path;
    }
    
    /**
     *
     */
    public function loadStandardConfigForData($config, &$model) 
    {
        $query = new DataCube_Query($model);
        
        // if no data structure definitions were selected
        if(0 === count($config['dataStructureDefinitions'])) {
            $config['dataStructureDefinitions'] = $query->getDataStructureDefinitions();
        } 
        
        // if no data structure definition was selected
        if(0 === count($config['selectedDSD'])) {
            $config['selectedDSD'] = $config['dataStructureDefinitions'][0];
        }
                        
        // if no data structure definitions were selected
        if(0 === count($config['dataSets'])) {
            $config['dataSets'] = $query->getDataSets($config['selectedDSD']['url']);
        } 
        
        // if no data sets were selected
        if(0 === count($config['selectedDS'])) {
            $config['selectedDS'] = $config['dataSets'][0];
        }
        
        // if no components were selected
        if(0 === count($config['components'])) {
            
            /**
             * Dimensions
             */
            $dimensions = $query->getComponents(
                $config['selectedDSD']['url'],
                $config['selectedDS']['url'],
                DataCube_UriOf::Dimension
            );
            
            // set components
            $config['components']['dimensions'] = array();
            foreach ($dimensions as $dimension) {
                $config['components']['dimensions']
                    [$dimension['hashedUrl']] = $dimension;
            }
            
            // set selectedComponents
            $config['selectedComponents']['dimensions'] = array();
            foreach ($dimensions as $dimension) {
                
                $dimension['elements'] = array(
                    $dimension['elements'][0]
                );
                
                $config['selectedComponents']['dimensions']
                    [$dimension['hashedUrl']] = $dimension;
            }
            
            /**
             * Measures
             */
            $measures = $query->getComponents(
                $config['selectedDSD']['url'],
                $config['selectedDS']['url'],
                DataCube_UriOf::Measure
            );
            
            // set measures
            $config['components']['measures'] = array();
            foreach ($measures as $measure) {
                $config['components']['measures']
                    [$measure['hashedUrl']] = $measure;
            }
            
            // set selectedComponents
            $config['selectedComponents']['measures'] = array();
            foreach ($measures as $measure) {
                $config['selectedComponents']['measures']
                    [$measure['hashedUrl']] = $measure;
            }
        }
        
        // number of multiple dimensions
        $config['numberOfMultipleDimensions'] = 0;
            
        foreach ($config['selectedComponents']['dimensions'] as $dim) {
            if(1 < count($dim ['elements'])) {
                ++$config['numberOfMultipleDimensions'];
            }
        }
        
        // number of one element dimensions
        $config['numberOfOneElementDimensions'] = 0;
        
        foreach ($config['selectedComponents']['dimensions'] as $dim) {
            if(1 == count($dim ['elements'])) {
                ++$config['numberOfOneElementDimensions'];
            }
        }
        
        // if no retrievedObservations were selected
        if(0 === count($config['retrievedObservations'])){
            
            $config['retrievedObservations'] = $query->getObservations(array(
                'selectedComponents' => $config['selectedComponents'],
                'selectedDS' => array('url' => $config['selectedDS']['url'])
            ));
        }
        
        return $config;
    }
    
    /**
     *
     */
    public function read($hash, &$model) 
    {
        /**
         * load and return file content, if file exists
         */
        if(true === file_exists($this->_hashDirectory . $hash)){
            $c = file($this->_hashDirectory . $hash);
            
            // if configuration file contains information
            if (true == isset ($c [0])) {                
                // contains stuff e.g. selectedDSD, ...
                return json_decode($c[0], true);
            }
        }
        
        /**
         * If you are here, either the file does not exists or there was nothing
         * to read in the file's first line.
         * 
         * ... so now set standard values.
         */
        $config = array();
        $type = '';
        
        $filePrefData = CubeViz_ConfigurationLink::$filePrefForDataHash;
        $filePrefUi= CubeViz_ConfigurationLink::$filePrefForUiHash;
        
        // determine which type the hash is:
        if($filePrefData == substr($hash, 0, strlen($filePrefData))) {
            $type = 'data';
        } elseif($filePrefUi == substr($hash, 0, strlen($filePrefUi))){
            $type = 'ui';
        }
        
        switch($type) {
            
            /**
             * Information about the data cube itself and what was selected
             */
            case 'data':
            
                $config = $this->loadStandardConfigForData(array(
                    'dataStructureDefinitions'      => array(),
                    'dataSets'                      => array(),
                    'components'                    => array(),
                    'numberOfOneElementDimensions'  => 0,
                    'numberOfMultipleDimensions'    => 0,
                    'selectedDSD'                   => array(),
                    'selectedDS'                    => array(),
                    'selectedComponents'            => array(
                        'dimensions'                => array(),
                        'measures'                  => array()
                    ),
                    'retrievedObservations'         => array()
                ), $model);                
                
                $config = $this->write($config, 'data');
                
                break;
            
            /**
             * Information about the user interface
             */
            case 'ui':
            
                $config = array(
                    'visualization'                 => array(
                        'class'                     => ''
                    ),
                    // will contain information/settings for each visualization class
                    'visualizationSettings'         => array(
                        // dirty hack, without it, jQuery does not transmit empty array
                        0                           => null
                    )
                );
                
                $config = $this->write($config, 'ui');
                  
                break;
                
            // something went wrong, hash type unknown
            default: return null; break;
        }
        
        return $config;
    }
    
    /**
     *
     */
    public function write($content, $type) 
    {
        $filename = '';
        
        if('data' == $type) {
            $filename = CubeViz_ConfigurationLink::$filePrefForDataHash;
        } elseif('ui' == $type) {
            $filename = CubeViz_ConfigurationLink::$filePrefForUiHash;
        } else {
            // in this case something went wrong!
            return;
        }
        
        // attach hash based on the given string
        $filename .= $this->generateHash ($content);
        
        $content['hash'] = $filename;
        
        // set full file path
        $filePath = $this->_hashDirectory . $filename;
        
        if(false == file_exists($filePath)) {
            
            // can't open the file: throw exception
            if(false === ($fh = fopen($filePath, 'w'))) {
                $m = 'No write permissions for '. $filePath;
                throw new CubeViz_Exception ( $m );
                return $m;
            }

            // write all parameters line by line
            fwrite($fh, json_encode($content)."\n");
            chmod ($filePath, 0755);
            fclose($fh);
        } 
        
        return $content;
    }
    
    /**
     * 
     */	
    private function generateHash ($content) 
    {
        return hash('sha256', json_encode($content));
    }
}
