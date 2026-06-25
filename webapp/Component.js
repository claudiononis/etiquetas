sap.ui.define([
    "sap/ui/core/UIComponent",
    "etiquetas/model/models",
    "etiquetas/service/DataServiceFactory"
], (UIComponent, models, DataServiceFactory) => {
    "use strict";

    return UIComponent.extend("etiquetas.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            this._oDataService = DataServiceFactory.create();
            this.setModel(this._oDataService.getModel(), "app");
            this._oDataService.load();

            // enable routing
            this.getRouter().initialize();
        },

        getDataService() {
            return this._oDataService;
        }
    });
});
