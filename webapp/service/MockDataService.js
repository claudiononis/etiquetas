sap.ui.define([
    "etiquetas/service/IDataService",
    "sap/ui/model/json/JSONModel"
], (IDataService, JSONModel) => {
    "use strict";

    class MockDataService extends IDataService {
        constructor() {
            super();

            this._oModel = new JSONModel({
                features: []
            });

            this._pLoadPromise = null;
        }

        getModel() {
            return this._oModel;
        }

        load() {
            if (!this._pLoadPromise) {
                this._pLoadPromise = fetch(
                    sap.ui.require.toUrl("etiquetas/model/mockData.json")
                )
                    .then((oResponse) => {
                        if (!oResponse.ok) {
                            throw new Error(
                                `Mock data could not be loaded: ${oResponse.status}`
                            );
                        }

                        return oResponse.json();
                    })
                    .then((oData) => {
                        this._oModel.setData(oData);
                        return oData;
                    });
            }

            return this._pLoadPromise;
        }

        getFeatureByRoute(sRouteName) {
            return this.load().then(() => {
                const aFeatures =
                    this._oModel.getProperty("/features") || [];

                const iFeatureIndex = aFeatures.findIndex(
                    (oFeature) => oFeature.route === sRouteName
                );

                if (iFeatureIndex === -1) {
                    return null;
                }

                return {
                    feature: aFeatures[iFeatureIndex],
                    path: `/features/${iFeatureIndex}`
                };
            });
        }
    }

    return MockDataService;
});
