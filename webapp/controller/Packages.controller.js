sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, History, MessageBox, MessageToast) => {
    "use strict";

    const BUSINESS_OBJECT = "QuarantinePackages";

    return Controller.extend("etiquetas.controller.Packages", {
        onInit() {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("packages")
                .attachPatternMatched(this.onRouteMatched, this);
        },

        onRouteMatched() {
            this.getOwnerComponent()
                .getDataService()
                .getBusinessObject(BUSINESS_OBJECT)
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
                })
                .catch((oError) => MessageBox.error(oError.message));
        },

        onMaterialChange(oEvent) {
            return this._executeAction("selectMaterial", {
                materialId: oEvent.getSource().getSelectedKey()
            }).catch(this._handleActionError);
        },

        onBatchChange(oEvent) {
            return this._executeAction("selectBatch", {
                batchId: oEvent.getSource().getSelectedKey()
            }).catch(this._handleActionError);
        },

        onGenerateDistribution() {
            return this._executeAction("generateDistribution")
                .then(() => {
                    MessageToast.show(
                        this.getResourceBundle().getText(
                            "packagesDistributionGenerated"
                        )
                    );
                })
                .catch(this._handleActionError);
        },

        onAddLine() {
            return this._executeAction("addLine")
                .catch(this._handleActionError);
        },

        onRemoveLine(oEvent) {
            const oContext = oEvent.getSource()
                .getBindingContext("app");

            return this._executeAction("removeLine", {
                path: oContext ? oContext.getPath() : ""
            }).catch(this._handleActionError);
        },

        onLineSelectionChange(oEvent) {
            const oListItem = oEvent.getParameter("listItem");
            const oContext = oListItem
                ? oListItem.getBindingContext("app")
                : null;

            return this._executeAction("selectLine", {
                path: oContext ? oContext.getPath() : ""
            }).catch(this._handleActionError);
        },

        onLineChange() {
            return this._executeAction("updateLine")
                .catch(this._handleActionError);
        },

        onGeneratePreview() {
            return this._executeAction("generatePreview")
                .then(() => {
                    MessageToast.show(
                        this.getResourceBundle().getText(
                            "packagesPreviewGenerated"
                        )
                    );
                })
                .catch(this._handleActionError);
        },

        onPrint() {
            return this._executeAction("print")
                .then((oResult) => {
                    MessageBox.information(oResult.message);
                })
                .catch(this._handleActionError);
        },

        onClear() {
            return this._executeAction("clear")
                .then(() => {
                    MessageToast.show(
                        this.getResourceBundle().getText(
                            "packagesFormCleared"
                        )
                    );
                })
                .catch(this._handleActionError);
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
        },

        getResourceBundle() {
            return this.getOwnerComponent()
                .getModel("i18n")
                .getResourceBundle();
        },

        _executeAction(sAction, oParameters) {
            return this.getOwnerComponent()
                .getDataService()
                .executeAction(
                    BUSINESS_OBJECT,
                    sAction,
                    oParameters
                );
        },

        _handleActionError(oError) {
            MessageBox.warning(oError.message);
        }
    });
});
