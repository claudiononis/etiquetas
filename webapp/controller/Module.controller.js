sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    "use strict";

    return Controller.extend("etiquetas.controller.Module", {
        onInit() {
            this.getOwnerComponent()
                .getRouter()
                .attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched(oEvent) {
            const sRouteName = oEvent.getParameter("name");

            if (
                sRouteName === "home" ||
                sRouteName === "RouteView1"
            ) {
                return;
            }

            this.getOwnerComponent()
                .getDataService()
                .getFeatureByRoute(sRouteName)
                .then((oResult) => {
                    if (!oResult) {
                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("home", {}, true);
                        return;
                    }

                    this.getView().bindElement({
                        path: oResult.path,
                        model: "app"
                    });
                });
        },

        onNavBack() {
            const sPreviousHash =
                History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
                return;
            }

            this.getOwnerComponent()
                .getRouter()
                .navTo("home", {}, true);
        }
    });
});
