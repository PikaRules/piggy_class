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
        this._classname = 'BaseClass';
        this._parent = parent;
        this._super = this;
        var self = this;
        this.processConfig = function ( config ) {
            addPropertiesToClassInstance(this, config);
        };
    };

    BaseClass.prototype.callSuperInitialize = function() {
        if ( this._super.initialize ) {
            this._super.initialize.apply(this,arguments);
        }
    }

    BaseClass.prototype.toString = function(){
        var temp = {};
        var re = /\{(.|\s)+\}/gi;
        for ( var prop in this ) {
            if ( this[prop] ) {
                if ( typeof(this[prop]) === 'function' ) {
                    temp[prop] = this[prop].toString().replace(re, "{...}");
                } else {
                    temp[prop] = this[prop]
                }
            }
        }
        delete temp._super;
        return this._classname + ' ' + JSON.stringify(temp); 
    }


    //define a class
    var define = function ( className, params ) {
        // class constructor
        var Class = function ( config ) {
            Piggy.log( 'class ' + className + ' created' );
            console.log( 'consturctor config : ')
            console.log(config);
            if ( this.initialize && config ) {
                this.initialize(config);
            }
        };
        Class.prototype.constructor = Class;
        //inherit from parent
        if ( params.parent ) {
            var classParent = getClassConstructor(params.parent) || Object;
            Class.prototype = new classParent();
        } else {
            Class.prototype = new BaseClass(className, 'Object');
        }
        Class.prototype._classname = className;
        Class.prototype._parent = params.parent || 'BaseClass';
        //add parameters to the class definition
        augment( Class, params )
        //add statics
        if ( params.statics ) {
            addStaticPropertiesToClass( Class, params.statics );
        }
        //add init
        if ( params.initialize ) {
            Class.prototype.initialize = function ( config ) {
                console.log('aqui');
                params.initialize.call(this, config);
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
            cls_instance = new cls_constructor(config);
        } else {
            return {};
        }
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
    tienda: 'amapala',
    hablar: function(){
        console.log('vvvvvvv');
        console.log(this.name);
    },
    statics: {
        counter: 0
    },
    initialize: function(config){
        console.log('Vehiculo init');
        console.log(config);
        console.log(this.name);
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
        console.log('auto init');
        console.log(this.name);
        this.processConfig(config);
        console.log(this.name);
        this.callSuperInitialize({text:'que ondas'});
        this._super.hablar();
    },
    hablar: function(){
        console.log('aaaaaa');
    }
});

myv = Piggy.create('Vehiculo',{});
myPokemon1 = Piggy.create('Auto',{
    name: 'pikachu'
});

myPokemon2 = Piggy.create('Auto',{
    name: 'pikachu'
});

myPokemon3 = myPokemon1;
myPokemon1.bato = function(cosa){ var mi = 'fdsfsdf'; };

console.log( ' pk1 === pk2 :' + (myPokemon1 == myPokemon2).toString() );
console.log( ' pk1 === pk3 :' + (myPokemon1 == myPokemon3).toString() );
console.log(myv instanceof Auto);
console.log( myPokemon1.toString() )
console.log( myPokemon1.bato.arguments )

//equals
//mixins
//override
//alias
//extend