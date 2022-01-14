sap.ui.define([
    'emc2/sd/products/controller/BaseController',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function(BaseController, MessageBox, MessageToast, Fragment, Filter, FilterOperator) {
    'use strict';
    return BaseController.extend("emc2.sd.products.controller.View2",{
        //This is the constructor of the class
        //where we can put all the initialization code
        onInit: function(){

            this.oRouter = this.getOwnerComponent().getRouter();
            //I need a function which gets triggered every time the end point changes
            //Route changes, Hash Tag changes
            //Whenever the route changes to loadMyV2, an Event matched will gets triggered
            //whenever its triggered we are calling a function herculis
            //also pass the controller object to this function
            this.oRouter.getRoute("loadMyV2").attachMatched(this.herculis, this);
        },
        herculis : function(oEvent){
            //Extract the Fruit id from the route of the router
            var sFruitId = oEvent.getParameter("arguments").fruitId;
            //Build the path for element binding- /fruits/2
            var sPath = '/' + sFruitId;
            //Bind the current view 2 object directly
            this.getView().bindElement(sPath,{
                expand: 'To_Supplier'
            });
        },
        onSave: function(){
            MessageBox.confirm("Would you like to save?",{
                title: "Confirm",
                onClose: this.closePopup.bind(this)
            });
        },
        oSupplierPopup: null,
        onFilterSupplier: function(oEvent){
            //What do you do in ABAP when you ALV to avoid
            //Creating ALV object again and again in PBO??
            //IF lo_alv IS NOT BOUND NOT INITIAL
            //Create the object of popup fragment
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
                        path: '/suppliers',
                        template: new sap.m.DisplayListItem({
                            label: "{name}",
                            value: "{city}"
                        })
                    });
                    that.oSupplierPopup.setMultiSelect(true);
                    that.oSupplierPopup.open();
                });
            }else{
                //This way we save lots of memory and avoid creation
                //of objects unnecessarily
                this.oSupplierPopup.open();
            }     
        },
        oCityPopup: null,
        oField: null,
        onF4Help: function(oEvent){
            this.oField = oEvent.getSource();
            //What do you do in ABAP when you ALV to avoid
            //Creating ALV object again and again in PBO??
            //IF lo_alv IS NOT BOUND NOT INITIAL
            //Create the object of popup fragment
            var that = this;
            if(!this.oCityPopup){
                Fragment.load({
                    type: "XML",
                    name: "emc2.sd.products.fragments.popup",
                    controller: this,
                    id: "city"
                }).then(function(oFragment){
                    //By Default we will not have access to this pointer
                    //inside the promise function, but we will have access
                    //to local variables created outside promise
                    that.oCityPopup = oFragment;
                    that.oCityPopup.setTitle("Cities");
                    //giving access of resources to the fragment by view
                    //immune system is granting access to parasite for body parts
                    that.getView().addDependent(that.oCityPopup);
                    that.oCityPopup.bindAggregation("items",{
                        path: '/cities',
                        template: new sap.m.DisplayListItem({
                            label: "{name}",
                            value: "{famousFor}"
                        })
                    });
                    that.oCityPopup.open();
                });
            }else{
                //This way we save lots of memory and avoid creation
                //of objects unnecessarily
                this.oCityPopup.open();
            }
        },
        onConfirm: function(oEvent){
            var popupId = oEvent.getSource().getId();
            //Which data was selected by user
            
            if(popupId.indexOf("supplier") !== -1){
                var aItems = oEvent.getParameter("selectedItems");
                var aFilter = [];
                for (let i = 0; i < aItems.length; i++) {
                    const element = aItems[i];
                    var sValue = element.getLabel();
                    
                    aFilter.push(new Filter("name",FilterOperator.EQ,sValue));
                }
                console.log(aFilter);
                var oFilter = new Filter({
                    filters: aFilter,
                    and: false
                });
                //Logic for supplier popup
                //Take the table object
                var oTable = this.getView().byId("idTab");
                //Construct a filter
                //var oFilter = new Filter("name", FilterOperator.EQ, sValue);
                //Inject filter inside items binding of the table
                oTable.getBinding("items").filter(oFilter);
            }else{
                var sValue = oEvent.getParameter("selectedItem").getLabel();
                //Logic for city popup
                //Set the value to the same input field INSIDE the table
                this.oField.setValue(sValue);
            }
        },
        onFilterClear: function(){
                //Logic for supplier popup
                //Take the table object
                var oTable = this.getView().byId("idTab");
                //Inject filter inside items binding of the table
                oTable.getBinding("items").filter([]);
        },
        closePopup: function(status){
            //here we will not be allowed to access this pointer 
            //we have to explicitly pass the 'this' pointer to the controller object
            if(status === "OK"){
                MessageToast.show("The order has been created successfully");
            }else{
                MessageBox.error("Action was cancelled");
            }
        },
        onBack: function(){
            //nav to view 1
            this.getView().getParent().to("idView1");
        },
        onSupplierSelect: function(oEvent){
            var oSelected = oEvent.getParameter("listItem");
            var sPath = oSelected.getBindingContextPath();
            var sId = sPath.split("/")[sPath.split("/").length - 1];
            this.oRouter.navTo("supplier",{
                supplierId : sId
            });
            //alert(sPath);
        },
        onAddNewCol: function(){
            var oColumn = new sap.m.Column({header: new sap.m.Text({text: "Dynamite"})
                                            });
            var oTable = this.getView().byId("idTab");
            oTable.addColumn(oColumn);
            oTable.bindAggregation("items",{
                path : '/suppliers',
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({text: "{name}"}),
                        new sap.m.Input({value: "{city}"}),
                        new sap.m.Text({text: "{sinceWhen}"}),
                        new sap.m.Text({text: "{contactPerson}"}),
                        new sap.m.Text({text: "{email}"})
                    ]
                })
            });
        }
    });
});