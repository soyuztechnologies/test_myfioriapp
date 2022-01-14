sap.ui.define([
    'emc2/sd/products/controller/BaseController',
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/ui/core/Fragment',
    "sap/m/MessageToast"
], function(BaseController,JSONModel,MessageBox,Fragment,MessageToast) {
    'use strict';
    return BaseController.extend("emc2.sd.products.controller.Add",{
        //This is the constructor of the class
        //where we can put all the initialization code
        onInit: function(){
            //alert("welcome to my app");
            this.anubhav = "my initial value";
            var oModel = new JSONModel();
            oModel.setData(this.getInitialData());
            this.getView().setModel(oModel,"prod");
            this.setMode("Create");
        },
        onClear: function(){
            let oModel = this.getView().getModel("prod");
            oModel.setData(this.getInitialData());
            this.setMode("Create");
        },
        onLoadSingle: function(oEvent){
            //Step 1: Read data of the product Id entered by user
            var prodId = oEvent.getSource().getValue();
            this.prodId = prodId;
            if(!prodId){
                return "";
            }
            //Step 2: Load our Odata Model
            var oDataModel = this.getView().getModel();
            //Step 3: Fire a GET call to read data by KEY - GET_ENTITY
            // Path = /ProductSet('HT-1010')
            //https://www.youtube.com/watch?v=RMsTYQe_3Jg
            var that = this;
            //var oProdModel = this.getView().getModel("prod");
            oDataModel.read("/ProductSet('" + prodId +"')",{
                //Step 4: Handle the response - Success, map data to local model
                success: function(data){
                    var oProdModel = that.getView().getModel("prod");
                    oProdModel.setProperty("/productData",data);
                    that.setMode("Update");
                    that.setImage();
                },
                //Step 5: Handle the response - Error
                error: function(oError){
                    debugger;
                    that.setMode("Create");
                }
            });
            
        },
        setImage: function(){
            var oImg = this.getView().byId("myImg");
            oImg.setSrc("/sap/opu/odata/sap/ZJAN_2022_SRV/ProductPicSet('" + this.prodId + "')/$value");
        },
        onDelete: function(){
            MessageBox.confirm("Do you really want to delete",{
                onClose: this.onDelConfirm.bind(this)
            });
        },
        onLoadExp: function(){
            //Step 1: Our odata object
            var oDataModel = this.getView().getModel();
            //Step 2: Call Function to load most expensive
            var that = this;
            oDataModel.callFunction("/GetMostExpensiveProduct",{
                urlParameters: {
                    I_CATEGORY: 'Notebooks'
                },
                //Step 3: Set data back to the screen from response
                success: function(data){
                    var oProdModel = that.getView().getModel("prod");
                    oProdModel.setProperty("/productData",data);
                    that.setMode("Update");
                }
            });
        },
        onDelConfirm: function(status){
            if(status === "OK"){
                var oDataModel = this.getView().getModel();
                var prodId = this.prodId;
                oDataModel.remove("/ProductSet('" + prodId + "')",{
                    success: function(){
                        MessageToast.show("Removed successfully");
                    },
                    error: function(){
                        MessageToast.show("Action has failed");
                    }
                });
            }else{
                MessageToast.show("action was cancelled");
            }
        },
        prodId: "",
        mode: "Create",
        setMode: function(sMode){
            if (sMode === "Create"){
                this.getView().byId("idCommit").setText("Create");
                this.mode = "Create";
                this.getView().byId("name").setEnabled(true);
                this.getView().byId("idDelete").setVisible(false);
            }else{
                this.getView().byId("idCommit").setText("Update");
                this.mode = "Update";
                this.getView().byId("name").setEnabled(false);
                this.getView().byId("idDelete").setVisible(true);
            }
        },
        onSave: function(){
            //Step 1: Access the Data and preapre payload
            let oModel = this.getView().getModel("prod");
            let payload = oModel.getProperty("/productData");
            if(!payload.PRODUCT_ID){
                MessageBox.error("Please enter a valid product ID");
            }
            //Step 2: Get the object of Odata Model which is default model
            var oDataModel = this.getView().getModel();
            //Step 3: Use the model object and POST the data to
            //        Product Entityset
            if(this.mode === "Create"){
                //JS Is Asynchronous NonBlocking IO
                oDataModel.create("/ProductSet", payload,{
                    //Step 4: Once the data is posted, check the response
                    //        if success, show success message
                    success: function(data){
                        MessageToast.show("Wallah! You made it Amigo!");
                    },
                    //Step 5: Handle the error 
                    error: function(oError){
                        var errorMessage = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                        MessageBox.error(errorMessage);                    
                        //debugger;
                    }
                });
            }else{
                //JS Is Asynchronous NonBlocking IO
                oDataModel.update("/ProductSet('" + payload.PRODUCT_ID +"')", payload,{
                    //Step 4: Once the data is posted, check the response
                    //        if success, show success message
                    success: function(data){
                        MessageToast.show("Wallah! You made it Amigo!");
                    },
                    //Step 5: Handle the error 
                    error: function(oError){
                        var errorMessage = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                        MessageBox.error(errorMessage);                    
                        //debugger;
                    }
                });
            }
            
        },
        oSupplierPopup: null,
        oField: null,
        onFilterSupplier: function(oEvent){
            //What do you do in ABAP when you ALV to avoid
            //Creating ALV object again and again in PBO??
            //IF lo_alv IS NOT BOUND NOT INITIAL
            //Create the object of popup fragment
            this.oField = oEvent.getSource();
            var that = this;
            if(!this.oSupplierPopup){
                Fragment.load({
                    type: "XML",
                    name: "emc2.sd.products.fragments.popup",
                    controller: this,
                    id: "supplier"
                }).then(function(oFragment){
                    //By Default we will not have access to this pointer
                    //inside the promise function, but we will have access
                    //to local variables created outside promise
                    that.oSupplierPopup = oFragment;
                    that.oSupplierPopup.setTitle("Suppliers");
                    //giving access of resources to the fragment by view
                    //immune system is granting access to parasite for body parts
                    that.getView().addDependent(that.oSupplierPopup);
                    that.oSupplierPopup.bindAggregation("items",{
                        path: '/SupplierSet',
                        template: new sap.m.DisplayListItem({
                            label: "{COMPANY_NAME}",
                            value: "{BP_ID}"
                        })
                    });
                    that.oSupplierPopup.setMultiSelect(false);
                    that.oSupplierPopup.open();
                });
            }else{
                //This way we save lots of memory and avoid creation
                //of objects unnecessarily
                this.oSupplierPopup.open();
            }     
        },
        onConfirm: function(oEvent){
                var sValue = oEvent.getParameter("selectedItem").getLabel();
                var sName = oEvent.getParameter("selectedItem").getValue();
                this.oField.setValue(sName);
                this.getView().getModel("prod").setProperty("/supplierName",sValue);
        },
        getInitialData: function(){
            return {
                "productData": {
                    "PRODUCT_ID": "",
                    "TYPE_CODE": "PR",
                    "CATEGORY": "Notebooks",
                    "NAME": "",
                    "DESCRIPTION": "",
                    "SUPPLIER_ID": "0100000046",
                    "SUPPLIER_NAME": "SAP",
                    "PRICE": "0.00",
                    "CURRENCY_CODE": "USD",
                    "DIM_UNIT": "CM"
                },
                "supplierName": "<unknown>"
            };
        }
    });
});