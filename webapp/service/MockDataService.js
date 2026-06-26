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

        getBusinessObject(sBusinessObject) {
            return this.load().then(() => {
                const sPath = `/businessObjects/${sBusinessObject}`;
                const oBusinessObject = this._oModel.getProperty(sPath);

                if (!oBusinessObject) {
                    return null;
                }

                return {
                    data: oBusinessObject,
                    path: sPath
                };
            });
        }

        executeAction(sBusinessObject, sAction, oParameters = {}) {
            if (sBusinessObject !== "Labels") {
                return Promise.reject(new Error("Not implemented yet"));
            }

            return this.load().then(() => {
                switch (sAction) {
                    case "selectMaterial":
                        return this._selectLabelMaterial(
                            oParameters.materialId
                        );
                    case "selectBatch":
                        return this._selectLabelBatch(
                            oParameters.batchId
                        );
                    case "invalidatePreview":
                        this._resetLabelPreview();
                        return null;
                    case "generatePreview":
                        return this._generateLabelPreview();
                    case "clear":
                        this._clearLabelRequest();
                        return null;
                    case "print":
                        return this._printLabelMock();
                    default:
                        throw new Error("Not implemented yet");
                }
            });
        }

        _selectLabelMaterial(sMaterialId) {
            const sBasePath = "/businessObjects/Labels";
            const aMaterials =
                this._oModel.getProperty(`${sBasePath}/materials`) || [];
            const aBatches =
                this._oModel.getProperty(`${sBasePath}/batches`) || [];
            const oMaterial = aMaterials.find(
                (oCurrentMaterial) =>
                    oCurrentMaterial.id === sMaterialId
            );

            this._oModel.setProperty(
                `${sBasePath}/availableBatches`,
                aBatches.filter(
                    (oBatch) => oBatch.materialId === sMaterialId
                )
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedLabelRequest/batchId`,
                ""
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedLabelRequest/expirationDate`,
                ""
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedLabelRequest/gtin`,
                oMaterial ? oMaterial.gtin : ""
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedProduct`,
                this._mapSelectedProduct(oMaterial)
            );
            this._resetLabelPreview();

            return oMaterial || null;
        }

        _selectLabelBatch(sBatchId) {
            const sBasePath = "/businessObjects/Labels";
            const aBatches =
                this._oModel.getProperty(`${sBasePath}/batches`) || [];
            const oBatch = aBatches.find(
                (oCurrentBatch) => oCurrentBatch.id === sBatchId
            );

            this._oModel.setProperty(
                `${sBasePath}/selectedLabelRequest/expirationDate`,
                oBatch ? oBatch.expirationDate : ""
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedLabelRequest/gtin`,
                oBatch ? oBatch.gtin : ""
            );
            this._resetLabelPreview();

            return oBatch || null;
        }

        _generateLabelPreview() {
            const sBasePath = "/businessObjects/Labels";
            const oRequest = this._oModel.getProperty(
                `${sBasePath}/selectedLabelRequest`
            );
            const oMessages = this._oModel.getProperty(
                `${sBasePath}/validationMessages`
            );

            if (!oRequest.materialId) {
                throw new Error(oMessages.materialRequired);
            }
            if (!oRequest.batchId) {
                throw new Error(oMessages.batchRequired);
            }
            if (!oRequest.market) {
                throw new Error(oMessages.marketRequired);
            }
            if (!oRequest.formatId) {
                throw new Error(oMessages.formatRequired);
            }
            if (!Number.isFinite(Number(oRequest.quantity)) ||
                Number(oRequest.quantity) <= 0) {
                throw new Error(oMessages.quantityInvalid);
            }

            const aMaterials =
                this._oModel.getProperty(`${sBasePath}/materials`) || [];
            const aFormats =
                this._oModel.getProperty(`${sBasePath}/labelFormats`) || [];
            const aMarkets =
                this._oModel.getProperty(`${sBasePath}/markets`) || [];
            const aBatches =
                this._oModel.getProperty(`${sBasePath}/batches`) || [];
            const oMaterial = aMaterials.find(
                (oCurrentMaterial) =>
                    oCurrentMaterial.id === oRequest.materialId
            );
            const oBatch = aBatches.find(
                (oCurrentBatch) =>
                    oCurrentBatch.id === oRequest.batchId
            );
            const oFormat = aFormats.find(
                (oCurrentFormat) =>
                    oCurrentFormat.id === oRequest.formatId
            );
            const oMarket = aMarkets.find(
                (oCurrentMarket) =>
                    oCurrentMarket.id === oRequest.market
            );
            const oPreview = {
                generated: true,
                materialName: oMaterial ? oMaterial.name : "",
                lot: oRequest.batchId,
                expirationDate: oRequest.expirationDate,
                gtin: oRequest.gtin,
                format: oFormat ? oFormat.name : "",
                market: oMarket ? oMarket.name : "",
                quantity: Number(oRequest.quantity),
                visualCode: this._buildLabelVisualCode(
                    oFormat,
                    oRequest,
                    oBatch
                ),
                gs1String: this._buildLabelGs1String(
                    oFormat,
                    oRequest,
                    oBatch
                )
            };

            this._oModel.setProperty(
                `${sBasePath}/preview`,
                oPreview
            );

            return oPreview;
        }

        _printLabelMock() {
            const sBasePath = "/businessObjects/Labels";
            const bGenerated = this._oModel.getProperty(
                `${sBasePath}/preview/generated`
            );
            const oMessages = this._oModel.getProperty(
                `${sBasePath}/validationMessages`
            );

            if (!bGenerated) {
                throw new Error(oMessages.previewRequired);
            }

            return {
                message: this._oModel.getProperty(
                    `${sBasePath}/labelTexts/printMock`
                )
            };
        }

        _clearLabelRequest() {
            const sBasePath = "/businessObjects/Labels";

            this._oModel.setProperty(
                `${sBasePath}/selectedLabelRequest`,
                {
                    materialId: "",
                    batchId: "",
                    market: "NATIONAL",
                    formatId: "HOSPITAL_LARGE",
                    quantity: 1,
                    expirationDate: "",
                    gtin: ""
                }
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedProduct`,
                this._mapSelectedProduct()
            );
            this._oModel.setProperty(
                `${sBasePath}/availableBatches`,
                []
            );
            this._resetLabelPreview();
        }

        _resetLabelPreview() {
            this._oModel.setProperty(
                "/businessObjects/Labels/preview",
                {
                    generated: false,
                    materialName: "",
                    lot: "",
                    expirationDate: "",
                    gtin: "",
                    format: "",
                    market: "",
                    quantity: 0,
                    visualCode: {
                        type: "",
                        title: "",
                        description: "",
                        icon: "",
                        value: "",
                        labelLayout: "",
                        showGtin: true
                    },
                    gs1String: ""
                }
            );
        }

        _buildLabelVisualCode(oFormat, oRequest, oBatch) {
            const sType = oFormat ? oFormat.visualCodeType : "";

            return {
                type: sType,
                title: oFormat ? oFormat.visualCodeTitle : "",
                description: oFormat ? oFormat.visualCodeDescription : "",
                icon: this._getLabelVisualCodeIcon(sType),
                value: this._getLabelVisualCodeValue(
                    sType,
                    oRequest,
                    oBatch
                ),
                labelLayout: oFormat ? oFormat.labelLayout : "",
                showGtin: oFormat ? oFormat.showGtin !== false : true
            };
        }

        _getLabelVisualCodeIcon(sType) {
            switch (sType) {
                case "LINEAR_EAN":
                    return "sap-icon://bar-code";
                case "DATAMATRIX":
                case "DATAMATRIX_LOGISTIC":
                    return "sap-icon://qr-code";
                case "BATCH_EXPIRY":
                    return "sap-icon://tag";
                default:
                    return "sap-icon://show";
            }
        }

        _getLabelVisualCodeValue(sType, oRequest, oBatch) {
            if (sType === "BATCH_EXPIRY") {
                return `Lote ${oRequest.batchId} · Vto ${oRequest.expirationDate}`;
            }

            if (sType === "LINEAR_EAN") {
                return oRequest.gtin;
            }

            if (sType === "DATAMATRIX_LOGISTIC" &&
                oBatch &&
                oBatch.sscc) {
                return oBatch.sscc;
            }

            return oRequest.gtin;
        }

        _buildLabelGs1String(oFormat, oRequest, oBatch) {
            if (!oFormat || oFormat.gs1Profile === "NONE") {
                return "No aplica para este formato.";
            }

            const sExpirationDate =
                this._formatGs1ExpirationDate(
                    oRequest.expirationDate
                );

            if (oFormat.gs1Profile === "TRACEABILITY") {
                return `(01)${oRequest.gtin}` +
                    `(17)${sExpirationDate}` +
                    `(10)${oRequest.batchId}`;
            }

            if (oFormat.gs1Profile === "LOGISTIC") {
                let sGs1String = `(02)${this._toGtin14(oRequest.gtin)}` +
                    `(17)${sExpirationDate}` +
                    `(10)${oRequest.batchId}` +
                    `(37)${Number(oRequest.quantity)}`;

                if (oFormat.includeSscc && oBatch && oBatch.sscc) {
                    sGs1String += `(00)${oBatch.sscc}`;
                }

                return sGs1String;
            }

            return "No aplica para este formato.";
        }

        _formatGs1ExpirationDate(sExpirationDate) {
            if (!sExpirationDate) {
                return "";
            }

            return sExpirationDate.replace(/-/g, "").slice(2);
        }

        _toGtin14(sGtin) {
            return String(sGtin || "").padStart(14, "0").slice(-14);
        }

        _mapSelectedProduct(oMaterial) {
            return {
                name: oMaterial ? oMaterial.name : "",
                description: oMaterial ? oMaterial.description : "",
                certificate: oMaterial ? oMaterial.certificate : "",
                content: oMaterial ? oMaterial.content : "",
                technicalDirector:
                    oMaterial ? oMaterial.technicalDirector : "",
                storage: oMaterial ? oMaterial.storage : "",
                regulatoryText:
                    oMaterial ? oMaterial.regulatoryText : ""
            };
        }
    }

    return MockDataService;
});
