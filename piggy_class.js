/** 
 * @author Guillermo Martel
 * @email martelgames@gmail.com
 * @description class module
 */


;(function(namespace,document,undefined){
    'use strict';

    var Piggy = namespace.Piggy;
    var createClassPath = namespace.Piggy.utils.createClassPath;
    var getClassConstructor = namespace.Piggy.utils.getClassConstructor;

    var PREDEFINED_PROPERTIES_NAMES = {
        'statics': 'statics',
        'parent': 'parent',
        'extend': 'extend',
        'initialize': 'initialize',
        'mixins': 'mixins',
        'override': 'override'
    };

    var BaseClass = function( className, parent ){
        var _classname = className;
        var _parent = parent;
        this.getClassName = function(){
            return _classname;
        };
        this.getParent = function(){
            return _parent;
        };
        this.processConfig = function ( config ) {
            addPropertiesToClassInstance(this, config);
        };
        this.callsuper = function () {
            var arg = arguments;
            if ( this._parent !== 'Object' ) {
                this._parent.apply(this, arg)
            }
        }
    };


    //define a class
    var define = function ( className, params ) {
        // new class
        var Class = function(){
            Piggy.log( 'class ' + className + ' created' );
        };
        Class.prototype.constructor = Class;
        //inherit from parent
        if ( params.parent ) {
            var classParent = getClassConstructor(params.parent) || BaseClass;
            Class.prototype = new classParent(className, params.parent);
        } else {
            Class.prototype = new BaseClass(className, 'Object');
        }
        //add parameters to the class definition
        augment( Class, params )
        //add statics
        if ( params.statics ) {
            addStaticPropertiesToClass( Class, params.statics );
        }
        //add init
        if ( params.initialize ) {
            Class.prototype.initialize = function ( config ) {
                params.initialize.call(this, config);
            }
        } else {
            Class.prototype.initialize = function ( config ) {
                addPropertiesToClassInstance(this, config)
            }
        }

        //add class to path
        createClassPath(className, Class);
        return Class;
    };

    //create an instance of a class
    var create = function ( className, config ) {
        var cls_constructor =  getClassConstructor(className);
        var cls_instance = {};
        if ( typeof(cls_constructor) === 'function' ) {
            cls_instance = new cls_constructor();
        } else {
            return {};
        }
        cls_instance.initialize(config);
        return cls_instance;
    }

    // -- helpers --

    var addStaticPropertiesToClass = function ( myclass, static_properties ) {
        for ( var prop in static_properties ) {
            myclass[prop] = static_properties[prop];
        }
    };

    var addPropertiesToClassInstance = function ( classInstance, properties ) {
        for ( var prop in properties ) {
            if ( typeof(prop) !== 'function' ) {
                if ( !isPrefedinedProperty(prop) ) {
                    classInstance[prop] = properties[prop];
                }
            } 
        }
    };

    var isPrefedinedProperty = function ( name ) {
        if ( PREDEFINED_PROPERTIES_NAMES[name] ) {
            return true;
        }
        return false;
    };

    /** copies all methos of the givingClass to the receivingClass
     *  @param givingClass  <class constructor function | json | object > : function( recivingCLass, givingClass1, givinClass2,...)
     */
    var extend = function ( receivingClass ) {
        if ( arguments[1] ) {
            for ( var i = 1, len = arguments.length; i < len; i++ ) {
                if ( typeof(arguments[i]) === 'object' ) {
                    //is an object, or json
                    for ( var methodName in arguments[i] ) {
                        if ( typeof arguments[i][methodName] === 'function' ) {
                            if (!Object.hasOwnProperty.call( receivingClass.prototype, methodName )) {
                                if ( !isPrefedinedProperty(methodName) ) {
                                    receivingClass.prototype[methodName] = arguments[i][methodName];
                                }
                            }
                        }
                    }
                } else {
                    //its a function (constructor)
                    for ( var methodName in arguments[i].prototype ) {
                        if ( typeof arguments[i][methodName] === 'function' ) {
                            if (!Object.hasOwnProperty.call( receivingClass.prototype, methodName )) {
                                if ( !isPrefedinedProperty(methodName) ) {
                                    receivingClass.prototype[methodName] = arguments[i].prototype[methodName];
                                }
                            }
                        }
                    }
                } 
            }
        }
    }

    /** copies all methos and properties of the givingClass to the receivingClass
     *  @param givingClass  <class constructor function | json | object > : function( recivingCLass, givingClass1, givinClass2,...)
     */
    var augment = function ( receivingClass ) {
        if ( arguments[1] ) {
            for ( var i = 1, len = arguments.length; i < len; i++ ) {
                if ( typeof(arguments[i]) === 'object' ) {
                    //is an object, or json
                    for ( var methodName in arguments[i] ) {
                        if (!Object.hasOwnProperty.call( receivingClass.prototype, methodName )) {
                            if ( !isPrefedinedProperty(methodName) ) {
                                receivingClass.prototype[methodName] = arguments[i][methodName];
                            }
                        }
                    }
                } else {
                    //its a function (constructor)
                    for ( var methodName in arguments[i].prototype ) {
                        if (!Object.hasOwnProperty.call( receivingClass.prototype, methodName )) {
                            if ( !isPrefedinedProperty(methodName) ) {
                                receivingClass.prototype[methodName] = arguments[i].prototype[methodName];
                            }
                        }
                    }
                } 
            }
        }
    }

    createClassPath('Piggy.define', define);
    createClassPath('Piggy.create', create);
    createClassPath('Piggy.extend', extend);

})(window,document,undefined);

Piggy.define('Vehiculo',{
    marca: 'vorder',
    hablar: function(){
        console.log('hhhh');
    },
    statics: {
        counter: 0
    },
    initialize: function(config){
        this.processConfig(config);
        console.log('que onda');
    }
});


Piggy.define('Auto',{
    parent: 'Vehiculo',
    name:'cuzuco',
    combustible: 'gasolina',
    encender: function(){
        console.log('runrunrun');
    },
    initialize: function(config){
        console.log('init');
        console.log(config);
        this.processConfig(config);
        this.callsuper(config);
    }
});


myPokemon1 = Piggy.create('Auto',{
    name: 'pikachu'
});

console.log( myPokemon1 );

