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
            return this.load().then(() => {
                if (sBusinessObject === "Labels") {
                    return this._executeLabelAction(
                        sAction,
                        oParameters
                    );
                }

                if (sBusinessObject === "QuarantinePackages") {
                    return this._executeQuarantinePackageAction(
                        sAction,
                        oParameters
                    );
                }

                throw new Error("Not implemented yet");
            });
        }

        _executeLabelAction(sAction, oParameters = {}) {
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

        _executeQuarantinePackageAction(sAction, oParameters = {}) {
            switch (sAction) {
                case "selectMaterial":
                    return this._selectPackageMaterial(
                        oParameters.materialId
                    );
                case "selectBatch":
                    return this._selectPackageBatch(
                        oParameters.batchId
                    );
                case "generateDistribution":
                    return this._generatePackageDistribution();
                case "addLine":
                    return this._addPackageLine();
                case "removeLine":
                    return this._removePackageLine(
                        oParameters.path
                    );
                case "selectLine":
                    return this._selectPackageLine(
                        oParameters.path
                    );
                case "updateLine":
                    return this._updatePackageLine();
                case "generatePreview":
                    return this._generatePackagePreview();
                case "clear":
                    this._clearPackageRequest();
                    return null;
                case "print":
                    return this._printPackageMock();
                default:
                    throw new Error("Not implemented yet");
            }
        }

        _selectPackageMaterial(sMaterialId) {
            const sBasePath = "/businessObjects/QuarantinePackages";
            const aBatches =
                this._oModel.getProperty(`${sBasePath}/batches`) || [];

            this._oModel.setProperty(
                `${sBasePath}/availableBatches`,
                aBatches.filter(
                    (oBatch) => oBatch.materialId === sMaterialId
                )
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageRequest/batchId`,
                ""
            );
            this._setPackageDerivedData();
            this._clearPackageLinesAndPreview();
        }

        _selectPackageBatch(sBatchId) {
            const sBasePath = "/businessObjects/QuarantinePackages";
            const aBatches =
                this._oModel.getProperty(`${sBasePath}/batches`) || [];
            const oBatch = aBatches.find(
                (oCurrentBatch) => oCurrentBatch.id === sBatchId
            );

            this._setPackageDerivedData(oBatch);
            this._clearPackageLinesAndPreview();

            return oBatch || null;
        }

        _setPackageDerivedData(oBatch) {
            const sBasePath = "/businessObjects/QuarantinePackages";

            this._oModel.setProperty(
                `${sBasePath}/selectedPackageRequest/expirationDate`,
                oBatch ? oBatch.expirationDate : ""
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageRequest/gtin`,
                oBatch ? oBatch.gtin : ""
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageRequest/stockStatus`,
                oBatch ? oBatch.stockStatus : ""
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageRequest/availableStock`,
                oBatch ? oBatch.availableStock : 0
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageRequest/packageCharacteristic`,
                oBatch ? oBatch.packageCharacteristic : ""
            );
        }

        _generatePackageDistribution() {
            const sBasePath = "/businessObjects/QuarantinePackages";
            const oRequest = this._oModel.getProperty(
                `${sBasePath}/selectedPackageRequest`
            );

            this._validatePackageRequest(oRequest);

            const iPackageCount = Number(oRequest.packageCount);
            const aLines = [];

            for (let iIndex = 1; iIndex <= iPackageCount; iIndex += 1) {
                aLines.push({
                    packageNumber: iIndex,
                    quantity: Number(oRequest.quantityPerPackage),
                    unit: oRequest.unit
                });
            }

            this._oModel.setProperty(
                `${sBasePath}/packageLines`,
                aLines
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageLine`,
                aLines[0] || this._getEmptyPackageLine()
            );
            this._recalculatePackageTotal();
            this._resetPackagePreview();

            return aLines;
        }

        _addPackageLine() {
            const sBasePath = "/businessObjects/QuarantinePackages";
            const oRequest = this._oModel.getProperty(
                `${sBasePath}/selectedPackageRequest`
            );
            const aLines =
                this._oModel.getProperty(`${sBasePath}/packageLines`) || [];
            const iNextPackageNumber = aLines.reduce(
                (iMax, oLine) =>
                    Math.max(iMax, Number(oLine.packageNumber) || 0),
                0
            ) + 1;
            const oLine = {
                packageNumber: iNextPackageNumber,
                quantity: Number(oRequest.quantityPerPackage) || 1,
                unit: oRequest.unit || "UN"
            };

            aLines.push(oLine);
            this._oModel.setProperty(
                `${sBasePath}/packageLines`,
                aLines
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageLine`,
                oLine
            );
            this._recalculatePackageTotal();
            this._resetPackagePreview();

            return oLine;
        }

        _removePackageLine(sLinePath) {
            const sBasePath = "/businessObjects/QuarantinePackages";
            const aLines =
                this._oModel.getProperty(`${sBasePath}/packageLines`) || [];
            const iIndex = this._getIndexFromPath(sLinePath);

            if (iIndex >= 0 && iIndex < aLines.length) {
                aLines.splice(iIndex, 1);
            }

            this._renumberPackageLines(aLines);
            this._oModel.setProperty(
                `${sBasePath}/packageLines`,
                aLines
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageLine`,
                aLines[0] || this._getEmptyPackageLine()
            );
            this._recalculatePackageTotal();
            this._resetPackagePreview();
        }

        _selectPackageLine(sLinePath) {
            const oLine = this._oModel.getProperty(sLinePath) ||
                this._getEmptyPackageLine();

            this._oModel.setProperty(
                "/businessObjects/QuarantinePackages/selectedPackageLine",
                Object.assign({}, oLine)
            );
            this._resetPackagePreview();

            return oLine;
        }

        _updatePackageLine() {
            this._recalculatePackageTotal();
            this._resetPackagePreview();
        }

        _generatePackagePreview() {
            const sBasePath = "/businessObjects/QuarantinePackages";
            const aLines =
                this._oModel.getProperty(`${sBasePath}/packageLines`) || [];
            const oRequest = this._oModel.getProperty(
                `${sBasePath}/selectedPackageRequest`
            );
            const oMessages = this._oModel.getProperty(
                `${sBasePath}/validationMessages`
            );

            if (!aLines.length) {
                throw new Error(oMessages.distributionRequired);
            }

            const oSelectedLine = this._getSelectedPackageLine(aLines);
            const oMaterial = this._getPackageMaterial(
                oRequest.materialId
            );
            const oPreview = {
                generated: true,
                materialName: oMaterial ? oMaterial.name : "",
                lot: oRequest.batchId,
                packageNumber: oSelectedLine.packageNumber,
                quantity: Number(oSelectedLine.quantity),
                unit: oSelectedLine.unit,
                stockStatus: oRequest.stockStatus || "Cuarentena",
                visualCodeValue: this._buildPackageVisualCodeValue(
                    oRequest,
                    oSelectedLine
                )
            };

            this._oModel.setProperty(
                `${sBasePath}/selectedPackageLine`,
                Object.assign({}, oSelectedLine)
            );
            this._oModel.setProperty(
                `${sBasePath}/preview`,
                oPreview
            );

            return oPreview;
        }

        _printPackageMock() {
            const sBasePath = "/businessObjects/QuarantinePackages";
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

        _clearPackageRequest() {
            const sBasePath = "/businessObjects/QuarantinePackages";

            this._oModel.setProperty(
                `${sBasePath}/selectedPackageRequest`,
                {
                    materialId: "",
                    batchId: "",
                    packageCount: 1,
                    quantityPerPackage: 1,
                    unit: "UN",
                    expirationDate: "",
                    gtin: "",
                    stockStatus: "",
                    availableStock: 0,
                    packageCharacteristic: ""
                }
            );
            this._oModel.setProperty(
                `${sBasePath}/availableBatches`,
                []
            );
            this._clearPackageLinesAndPreview();
        }

        _clearPackageLinesAndPreview() {
            const sBasePath = "/businessObjects/QuarantinePackages";

            this._oModel.setProperty(
                `${sBasePath}/packageLines`,
                []
            );
            this._oModel.setProperty(
                `${sBasePath}/selectedPackageLine`,
                this._getEmptyPackageLine()
            );
            this._oModel.setProperty(
                `${sBasePath}/totalDistributed`,
                0
            );
            this._resetPackagePreview();
        }

        _resetPackagePreview() {
            this._oModel.setProperty(
                "/businessObjects/QuarantinePackages/preview",
                {
                    generated: false,
                    materialName: "",
                    lot: "",
                    packageNumber: 0,
                    quantity: 0,
                    unit: "",
                    stockStatus: "Cuarentena",
                    visualCodeValue: ""
                }
            );
        }

        _validatePackageRequest(oRequest) {
            const oMessages = this._oModel.getProperty(
                "/businessObjects/QuarantinePackages/validationMessages"
            );

            if (!oRequest.materialId) {
                throw new Error(oMessages.materialRequired);
            }
            if (!oRequest.batchId) {
                throw new Error(oMessages.batchRequired);
            }
            if (!Number.isFinite(Number(oRequest.packageCount)) ||
                Number(oRequest.packageCount) <= 0) {
                throw new Error(oMessages.packageCountInvalid);
            }
            if (!Number.isFinite(Number(oRequest.quantityPerPackage)) ||
                Number(oRequest.quantityPerPackage) <= 0) {
                throw new Error(oMessages.quantityPerPackageInvalid);
            }
            if (!oRequest.unit) {
                throw new Error(oMessages.unitRequired);
            }
        }

        _recalculatePackageTotal() {
            const sBasePath = "/businessObjects/QuarantinePackages";
            const aLines =
                this._oModel.getProperty(`${sBasePath}/packageLines`) || [];
            const iTotal = aLines.reduce(
                (iSum, oLine) =>
                    iSum + (Number(oLine.quantity) || 0),
                0
            );

            this._oModel.setProperty(
                `${sBasePath}/totalDistributed`,
                iTotal
            );
        }

        _renumberPackageLines(aLines) {
            aLines.forEach((oLine, iIndex) => {
                oLine.packageNumber = iIndex + 1;
            });
        }

        _getSelectedPackageLine(aLines) {
            const oSelectedLine = this._oModel.getProperty(
                "/businessObjects/QuarantinePackages/selectedPackageLine"
            );

            if (oSelectedLine && oSelectedLine.packageNumber) {
                return aLines.find(
                    (oLine) =>
                        oLine.packageNumber === oSelectedLine.packageNumber
                ) || aLines[0];
            }

            return aLines[0];
        }

        _getPackageMaterial(sMaterialId) {
            const aMaterials = this._oModel.getProperty(
                "/businessObjects/QuarantinePackages/materials"
            ) || [];

            return aMaterials.find(
                (oMaterial) => oMaterial.id === sMaterialId
            );
        }

        _buildPackageVisualCodeValue(oRequest, oLine) {
            return [
                "BULTO",
                oRequest.materialId,
                oRequest.batchId,
                oLine.packageNumber,
                Number(oLine.quantity),
                oLine.unit
            ].join("|");
        }

        _getEmptyPackageLine() {
            return {
                packageNumber: 0,
                quantity: 0,
                unit: ""
            };
        }

        _getIndexFromPath(sPath) {
            const sIndex = String(sPath || "").split("/").pop();
            const iIndex = Number(sIndex);

            return Number.isInteger(iIndex) ? iIndex : -1;
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
