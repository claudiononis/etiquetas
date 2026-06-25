sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("etiquetas.controller.View1", {
        onInit() {
        },

        onModulePress(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("app");
            const sRoute = oContext
                ? oContext.getProperty("route")
                : null;

            if (sRoute) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo(sRoute);
            }
        }
    });
});
