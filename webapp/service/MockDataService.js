sap.ui.define([
    "etiquetas/service/IDataService",
    "sap/ui/model/json/JSONModel"
], (IDataService, JSONModel) => {
    "use strict";

    class MockDataService extends IDataService {
        constructor() {
            super();

            this._oModel = new JSONModel({
                featureGroups: []
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
                const aFeatureGroups =
                    this._oModel.getProperty("/featureGroups") || [];

                for (
                    let iGroupIndex = 0;
                    iGroupIndex < aFeatureGroups.length;
                    iGroupIndex += 1
                ) {
                    const aFeatures =
                        aFeatureGroups[iGroupIndex].features || [];
                    const iFeatureIndex = aFeatures.findIndex(
                        (oFeature) => oFeature.route === sRouteName
                    );

                    if (iFeatureIndex !== -1) {
                        return {
                            feature: aFeatures[iFeatureIndex],
                            path:
                                `/featureGroups/${iGroupIndex}` +
                                `/features/${iFeatureIndex}`
                        };
                    }
                }

                return null;
            });
        }
    }

    return MockDataService;
});
