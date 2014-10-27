/** 
 * @author Guillermo Martel
 * @email martelgames@gmail.com
 * @description core module
 */


;(function(namespace,document,undefined){
    'use strict';

    var config = {
        debug: true
    };

    var BaseObject = function(){};

    namespace.Piggy = namespace.Piggy || {};
    namespace.Piggy.config = config;
    namespace.Piggy.BaseObject = BaseObject;

})(window,document,undefined);
