/** 
 * @author Guillermo Martel
 * @email martelgames@gmail.com
 * @description general tools
 */


;(function(namespace,document,undefined){
    'use strict';

    var Piggy = namespace.Piggy;


    var isArray = function ( cosa ) {
        if ( Array.isArray ) {
            return Array.isArray(cosa);
        } else {
            if ( cosa instanceof Array ) {
                return true;
            }
            return false;
        }
    }

    /** 
     * @author Guillermo Martel
     * @class CreateClassPath
     * @description creates the objects necessaries to add a class to a simulated path , class hierachy.
     * @example  CreateClassPath( 'Components.Search.Base.BaseDisplayBox', { ... } );
     */
    var createClassPath = function ( fullPath, classObject ) {
        
        var pathArray = [];
        var root = namespace;
   
        if ( classObject === undefined || classObject === null ) {
            console.error( ' null arguments, You must provide a class Object , error in CreateClassPath ' );
            return 0;
        }
        
        if ( fullPath.indexOf(".") !== -1 ) {
            pathArray =  fullPath.split(".");
        }

        if ( pathArray.length > 0 ) {
            if ( pathArray[0].toLowerCase() === 'window' ) {
                pathArray.shift();
            }   
            for ( var x = 0; x < pathArray.length; x++ ) {
                root[ pathArray[x] ] = root[ pathArray[x] ] || {};
                if ( pathArray.length -1 === x ) {
                    root[ pathArray[x] ] = classObject;
                }
                root = root[ pathArray[x] ];
            }
        }
         
    };
    
    
    /**
     * @name getClassConstructor
     * @description get the class constructor for the given object path 'Components.Compounds.DisplayBox', 
     * @param {string} classPath
     * @returns {object} returns the last object in the provided path, examp: path = 'Components.Pitufo', returns = Pitufo constructor
     */
    var getClassConstructor = function( classPath ) {
        var path = classPath.split('.');
        var tempCont = namespace;
        
        if ( path[0].toLowerCase() === 'document' ) {
            path.shift();
            tempCont = namespace;
        }

        if ( path[0].toLowerCase() === 'window' ) {
            path.shift();
            tempCont = namespace;
        }

        for ( var x = 0; x < path.length; x++ ) {
            if (tempCont[ path[x] ]) {
                tempCont = tempCont[path[x]];
            } else {
                tempCont = null;
            }
        } 

        if ( !tempCont ) {
            console.error(  ' the class <' +  classPath + '> does not exists ' );
            return function(){};
        }

        if ( typeof(tempCont) !== 'function' ) {
            console.error(' <' + classPath + '> is not a valid constructor, is seems to be a path');
        }

        return tempCont;
    };


    var log = function(message){
        if ( Piggy.config.debug ) {
            if ( isArray(message) ) {
                for ( var i = 0; i < message.length; i++ ) {
                    console.log(message[i]);
                }
            } else {
                console.log(message);
            }
        }
    };


    /**
     * copy the items on properties on the base json
     * this overrides the items with the same name
     * @param base <json>
     * @param properties <json>
     */
    var merge = function ( base, properties ) {
        var temp_base = {};
        if ( base ) {
            for ( var b in base ) {
                temp_base[b] = base[b];
            }
            for ( var prop in properties ) {
                temp_base[prop] = properties[prop];
            }
        } else {
            console.log('base is null');
        }
        return temp_base;
    }
            

    namespace.Piggy.utils = {};
    namespace.Piggy.utils.createClassPath = createClassPath;
    namespace.Piggy.utils.getClassConstructor = getClassConstructor;
    namespace.Piggy.utils.log = log;
    namespace.Piggy.log = log;
    namespace.Piggy.utils.merge = merge;
    namespace.Piggy.utils.isArray = isArray;

})(window,document,undefined);