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
    var CUSTOM_CLASSES = 'Piggy.customClassess';

    var PREDEFINED_PROPERTIES_NAMES = {
        'static': 'static'
    };

    //define a class
    var define = function ( className, params ) {
        var Class = function(){
            Piggy.log( 'class ' + className + ' created' );
            var _type = className;
            this.getType = function(){
                return _type;
            };
        };
        Class.prototype.constructor = Class;
        Class.prototype.config = params || {};
        if ( params.static ) {
            addStaticPropertiesToClass( Class, params.static );
        }
        createClassPath(CUSTOM_CLASSES + '.' + className ,Class);
        return Class;
    };

    //create an instance of a class
    var create = function( className, params ){
        var cls_constructor =  getClassConstructor(CUSTOM_CLASSES + '.' + className);
        var cls_instance = null;
        var full_config = {};
        if ( typeof(cls_constructor) === 'function' ) {
            cls_instance = new cls_constructor();
        } else {
            return {};
        }
        full_config = Piggy.utils.merge( cls_constructor.prototype.config, params );
        addPropertiesToClassInstance( cls_instance, full_config );
        return cls_instance;
    }

    // -- helpers --

    var addStaticPropertiesToClass = function ( myclass, static_properties ) {
        for ( var prop in static_properties ) {
            myclass[ prop ] = static_properties[ prop ];
        }
    };

    var addPropertiesToClassInstance = function ( myclass, properties ) {
        for ( var prop in properties ) {
            if ( !isPrefedinedProperty(prop) ) {
                myclass[prop] = properties[prop];
            } 
        }
        myclass.config = properties;
    };

    var isPrefedinedProperty = function ( name ) {
        if ( PREDEFINED_PROPERTIES_NAMES[name] ) {
            return true;
        }
        return false;
    };

    createClassPath('Piggy.define', define);
    createClassPath('Piggy.create', create);

})(window,document,undefined);

Piggy.define('cosa.pijudo.Pokemon',{
    name: 'cerdito',
    hablar: function(mumble){
        console.log(mumble);
    },
    static: {
        count: 20
    }
});
myPokemon1 = Piggy.create('cosa.pijudo.Pokemon',{
    name: 'pikachu'
});
myPokemon2 = Piggy.create('cosa.pijudo.Pokemon');
console.log(myPokemon1);
console.log(typeof(myPokemon2));
Piggy.customClassess.cosa.pijudo.Pokemon.count = 45;
console.log(Piggy.customClassess.cosa.pijudo.Pokemon.count);
//console.log( myPokemon.hasOwnProperty('name'));