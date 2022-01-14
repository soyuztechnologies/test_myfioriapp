sap.ui.define([
    'emc2/sd/products/controller/BaseController'
], function(BaseController) {
    'use strict';
    return BaseController.extend("emc2.sd.products.controller.App",{
        //This is the constructor of the class
        //where we can put all the initialization code
        onInit: function(){
            //alert("welcome to my app");
            this.anubhav = "my initial value";
        },
        onExit: function(){
            //will be called when app is closed
            this.anubhav = "app is closed";
        },
        onBeforeRendering: function(){
            console.log(this.anubhav);
            this.anubhav = "the view is about to display";
            console.log(this.anubhav);
        },
        onAfterRendering: function(){
            console.log(this.anubhav);
            this.anubhav = "the view is now displayed to the user";
            console.log(this.anubhav);
        }
    });
});