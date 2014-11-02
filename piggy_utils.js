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
     * @example  createClassPath( 'root.app.MyClass', { ... } );
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
        } else {
            pathArray[0] = fullPath;
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

        try {
            for ( var x = 0; x < path.length; x++ ) {
                if (tempCont[ path[x] ]) {
                    tempCont = tempCont[path[x]];
                } else {
                    tempCont = null;
                }
            } 
        } catch (e) {
            tempCont = null;
        }

        if ( !tempCont ) {
            Piggy.logging.warning(  ' the class <' +  classPath + '> does not exists ' );
            return function(){};
        }

        if ( typeof(tempCont) !== 'function' ) {
            Piggy.logging.warning(' <' + classPath + '> is not a valid constructor, is seems to be a path');
            return function(){};
        }

        return tempCont;
    };

    /**
     * @param  {string} message
     * @param  {string} type possible values : 'log'|'warning'|'error'>
     */
    var logging = function(message, type){
        var warning = 'log';
        var error = 'log';

        //pollyfill logs
        if ( console.warning ) {
            warning = 'warning';
        } else if ( console.warn ) {
            warning = 'warn';
        }

        if ( console.error ) {
            error = 'error';
        }

        //checking vallid types
        var validTypes = {
            'log': 'log',
            'warning': warning,
            'error': error
        };
        if ( !validTypes[type]) {
            type = 'log';
        } else {
            type = validTypes[type];
        }
        if ( Piggy.settings.debug ) {
            if ( isArray(message) ) {
                for ( var i = 0; i < message.length; i++ ) {
                    console[type](message[i]);
                }
            } else {
                console[type](message);
            }
        }
    };

    var loggingLog = function(message){
        logging(message, 'log');
    };
    var loggingWarning = function(message){
        logging(message, 'warning');
    };
    var loggingError = function(message){
        logging(message, 'error');
    };


    /**
     * copy the items of <properties> on the <base>
     * this overrides the items with the same name
     * @param base <object|json>
     * @param properties <object|json>
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

    var isObjectNullOrEmpty = function(obj) {
        if ( typeof(obj) === 'function' ) {
            if ( obj.toString().trim() !== 'function (){}' && obj.toString().trim() !== 'function(){}') {
                return false;
            } else {
                return true;
            }
        }
        if ( !obj ) {
            return true;
        }
        for (var key in obj) {
            if(obj.hasOwnProperty(key)) {
                return false;
            }
        }
      return true;
    }
            

    createClassPath('Piggy.utils.createClassPath', createClassPath)
    createClassPath('Piggy.utils.getClassConstructor', getClassConstructor)

    createClassPath('Piggy.utils.logging.log', loggingLog)
    createClassPath('Piggy.logging.log', loggingLog)
    createClassPath('Piggy.utils.logging.warning', loggingWarning)
    createClassPath('Piggy.logging.warning', loggingWarning)
    createClassPath('Piggy.utils.logging.error', loggingError)
    createClassPath('Piggy.logging.error', loggingError)

    createClassPath('Piggy.utils.merge', merge)
    createClassPath('Piggy.utils.isArray', isArray)
    createClassPath('Piggy.utils.isObjectNullOrEmpty', isObjectNullOrEmpty)

})(window,document,undefined);