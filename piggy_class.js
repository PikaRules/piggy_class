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
    var isNullOrEmpty = Piggy.utils.isObjectNullOrEmpty;

    var PREDEFINED_PROPERTIES_NAMES = {
        'statics': 'statics',
        'parent': 'parent',
        'extend': 'extend',
        'initialize': 'initialize',
        'mixins': 'mixins',
        'override': 'override',
        'alias': 'alias'
    };

    var BaseClass = function( className, parent ){
        this._classname = 'BaseClass';
        this._parentname = parent;
        this._super = this;
        this.processConfig = function ( config ) {
            addPropertiesToClassInstance(this, config);
        };
        this.isInstanceof = function ( classname ) {
            if ( this._classname === classname ) {
                return true;
            }
            return false;
        };
    };

    BaseClass.prototype.callSuperInitialize = function() {
        if ( this._super.initialize ) {
            this._super.initialize.apply(this,arguments);
        }
    };

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
    };



    //define a class
    var define = function ( className, params ) {
        // class constructor
        var Class = function ( config ) {
            Piggy.logging.log( 'class ' + className + ' created' );
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
            Class.prototype._parentname = params.parent || 'BaseClass';

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
                Class.prototype.initialize = function(){};
            }

            //add extend method
            Class["extend"] = function (){
                var args = Array.prototype.slice.call(arguments);
                if ( arguments.length > 0 ) {
                    extend(Class,args);
                }
            };

            //extend mixins
            if ( params.mixins ) {
                if ( params.mixins.length > 0 ) {
                    extend(Class,params.mixins);
                }
            }

            //add override method
            Class['override'] = function ( methodName, methodDefinition ) {
                override(Class,methodName, methodDefinition);
            };

            //add class to path
            createClassPath(className, Class);

            //add to aliases
            if ( params.alias ) {
                if ( !Piggy.aliases[params.alias] ) {
                    Piggy.aliases[params.alias] = className;
                } else {
                    Piggy.logging.warning('There is already an alias defined with this name : ' +  params.alias);
                }
            }
            return Class;
    };


    //create an instance of a class
    var create = function ( className, config ) {
        var cls_constructor =  getClassConstructor(className);
        var cls_instance = {};
        if ( isNullOrEmpty(cls_constructor) ) {
            cls_constructor = getClassConstructor(Piggy.aliases[className]);
        }
        if ( typeof(cls_constructor) === 'function' ) {
            cls_instance = new cls_constructor(config);
        } else {
            return {};
        }
        return cls_instance;
    }


    // -------------------- helpers ----------------

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
     *  only those methods that are not in the givingClass (does not override)
     *  @param givingClass  <class constructor function | json | object | array > 
     *                      function( recivingCLass, givingClass1, givinClass2,...)
     */
    var extend = function ( receivingClass ) {
        var args = Array.prototype.slice.call(arguments);
        if ( Piggy.utils.isArray(args[1]) && args.length === 2 ) {
            args = Array.prototype.slice.call(arguments[1]);
            args.splice(0, 0, receivingClass);
        }
        if ( args[1] ) {
            if ( args.length === 3 && typeof args[1] === 'string' && typeof(args[2]) === 'function' ) {
                //its a normal function
                extendFromFunction(receivingClass, args[1], args[2]);
            } else {
                for ( var i = 1, len = args.length; i < len; i++ ) {
                    if ( typeof(args[i]) === 'object' ) {
                        //is an object, or json
                        extendFromObject(receivingClass ,args[i])
                    } else {
                        //its a function (constructor)
                        extendFromConstructor(receivingClass ,args[i])
                    } 
                }
            }
        }
    };

    var extendFromFunction = function ( receivingClass, functionName, functionDefinition ) {
        if (!Object.hasOwnProperty.call( receivingClass.prototype, functionName )) {
            if ( !isPrefedinedProperty(functionName) ) {
                receivingClass.prototype[functionName] = functionDefinition;
            }
        }
    };

    var extendFromConstructor = function ( receivingClass, functionConstructor ) {
        for ( var methodName in functionConstructor.prototype ) {
            if ( typeof functionConstructor.prototype[methodName] === 'function' ) {
                if (!Object.hasOwnProperty.call( receivingClass.prototype, methodName )) {
                    if ( !isPrefedinedProperty(methodName) ) {
                        receivingClass.prototype[methodName] = functionConstructor.prototype[methodName];
                    }
                }
            }
        }
    };

    var extendFromObject = function ( receivingClass ,jsonObj ) {
        for ( var methodName in jsonObj ) {
            if ( typeof jsonObj[methodName] === 'function' ) {
                if ( receivingClass.prototype ) {
                    if (!Object.hasOwnProperty.call( receivingClass.prototype, methodName )) {
                        if ( !isPrefedinedProperty(methodName) ) {
                            receivingClass.prototype[methodName] = jsonObj[methodName];
                        }
                    }
                } else {
                    Piggy.logging.warning("extendFromObject, You can only extend from classess not from instances ");
                }
            }
        }
    };

    var override = function ( receivingClass, methodName, methodDefinition ) {
        receivingClass.prototype[methodName] = methodDefinition;
    };

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
    createClassPath('Piggy.override', override);
    

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
    alias: 'Butuco.colocho',
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



//---------- extend test --


var pichu = {
    pintar: function(){
        console.log('yo pinto: ' + this.name);
    }
};

Piggy.define('Poco',{
    initialize: function(){},
    caminar: function(myvar) {
        console.log('yo camino: ' + this.name);
    }
});

var myFunction = function( myvar ) {
    console.log('Yo como : ' + this.name);
};

//Piggy.extend( Auto, pichu, Poco)
//Piggy.extend( Auto, 'comer', myFunction)

Auto.extend(pichu, Poco);
Auto.extend('comer',myFunction);


//------ mixins ----


Piggy.define('Pajaro',{
    mixins: [pichu, Poco],
    volar: function(myvar) {
        console.log('yo vuelo: ' + this.name);
    }
});

myPajaro = Piggy.create('Pajaro',{
    name: 'cacatua'
});

//-------- override ---


Auto.override('encender', function(){
    console.log('overrided');
});



//----- igualdad ---

myVehiculo = Piggy.create('Vehiculo',{});
myPokemon1 = Piggy.create('Butuco.colocho',{
    name: 'pikachu'
});

myPokemon2 = Piggy.create('Auto',{
    name: 'pikachu'
});

myPokemon3 = myPokemon1;
myPokemon1.bato = function(cosa){ var mi = 'fdsfsdf'; };

console.log( ' pk1 === pk2 :' + (myPokemon1 == myPokemon2).toString() );
console.log( ' pk1 === pk3 :' + (myPokemon1 == myPokemon3).toString() );
console.log(myVehiculo instanceof Auto);

console.log('-------- extend ------')
console.log(myPokemon2)
myPokemon2.pintar()
myPokemon2.caminar()
myPokemon2.comer()

console.log('-------- mixin ------')
console.log(myPajaro);
myPajaro.pintar();
myPajaro.caminar();

console.log('-------- override ------')
myPokemon2.encender();
myPokemon2.hablar();

console.log('-------- instanceof ------')
console.log(myPokemon2._classname);
console.log( "myPokemon2.isInstanceof('Auto') : " + myPokemon2.isInstanceof('Auto') );
console.log( "myPokemon2.isInstanceof('Vehiculo') : " + myPokemon2.isInstanceof('Vehiculo') );
console.log( "myPokemon2 instanceof Auto : " + (myPokemon2 instanceof Auto).toString() );
console.log( "myPokemon2 instanceof Vehiculo : " + (myPokemon2 instanceof Vehiculo).toString() );

console.log('-------- new operator ------')
var pingu = new Auto();
console.log(pingu);

var pingu2 = new Auto({
    name: 'pingu2',
    initialize: function(config){
        this.processConfig(config);
        this.callSuperInitialize();

    }
});
console.log(pingu2);

//mixins -
//override -
//extend -
//alias -
