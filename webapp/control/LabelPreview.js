sap.ui.define([
    "sap/ui/core/Control"
], (Control) => {
    "use strict";

    const SVG_NS = "http://www.w3.org/2000/svg";

    const LabelPreview = Control.extend("etiquetas.control.LabelPreview", {
        metadata: {
            properties: {
                materialName: { type: "string", defaultValue: "" },
                presentation: { type: "string", defaultValue: "" },
                lot: { type: "string", defaultValue: "" },
                expirationDate: { type: "string", defaultValue: "" },
                gtin: { type: "string", defaultValue: "" },
                format: { type: "string", defaultValue: "" },
                labelLayout: { type: "string", defaultValue: "HOSPITAL_LARGE" },
                visualCodeType: { type: "string", defaultValue: "" },
                visualCodeValue: { type: "string", defaultValue: "" },
                gs1String: { type: "string", defaultValue: "" },
                showGtin: { type: "boolean", defaultValue: true }
            }
        },

        renderer(oRm, oControl) {
                const oLayout = getLayout(oControl.getLabelLayout());

                oRm.openStart("div", oControl);
                oRm.style("box-sizing", "border-box");
                oRm.style("width", "100%");
                oRm.style("max-width", oLayout.maxWidth);
                oRm.style("min-height", oLayout.minHeight);
                oRm.style("margin", "0 auto");
                oRm.style("padding", oLayout.padding);
                oRm.style("background", "#fff");
                oRm.style("border", "1px solid #8a8d90");
                oRm.style("border-radius", "0.25rem");
                oRm.style("box-shadow", "0 0.125rem 0.5rem rgba(34, 53, 72, 0.16)");
                oRm.style("color", "#1d2d3e");
                oRm.style("font-family", "Arial, Helvetica, sans-serif");
                oRm.style("overflow", "hidden");
                oRm.openEnd();

                renderHeader(oRm, oControl, oLayout);

                if (oControl.getLabelLayout() === "OPP_BATCH_EXPIRY") {
                    renderOppBody(oRm, oControl);
                } else {
                    renderProductBody(oRm, oControl, oLayout);
                    renderCode(oRm, oControl, oLayout);
                }

                renderFooter(oRm, oControl, oLayout);
                oRm.close("div");
        }
    });

    function getLayout(sLayout) {
        const mLayouts = {
            HOSPITAL_LARGE: {
                maxWidth: "22rem",
                minHeight: "28rem",
                padding: "1rem",
                codeHeight: 76,
                matrixSize: 132,
                titleSize: "1.05rem",
                compact: false
            },
            HOSPITAL_COMPACT: {
                maxWidth: "20rem",
                minHeight: "22rem",
                padding: "0.75rem",
                codeHeight: 58,
                matrixSize: 112,
                titleSize: "0.95rem",
                compact: true
            },
            FAM: {
                maxWidth: "20rem",
                minHeight: "22rem",
                padding: "0.75rem",
                codeHeight: 64,
                matrixSize: 118,
                titleSize: "0.95rem",
                compact: true
            },
            LOGISTIC: {
                maxWidth: "22rem",
                minHeight: "20rem",
                padding: "0.75rem",
                codeHeight: 64,
                matrixSize: 128,
                titleSize: "0.95rem",
                compact: true
            },
            PALLET: {
                maxWidth: "30rem",
                minHeight: "17rem",
                padding: "0.875rem",
                codeHeight: 64,
                matrixSize: 148,
                titleSize: "1rem",
                compact: true,
                horizontal: true
            },
            OPP_BATCH_EXPIRY: {
                maxWidth: "18rem",
                minHeight: "9rem",
                padding: "0.875rem",
                codeHeight: 0,
                matrixSize: 0,
                titleSize: "1rem",
                compact: true
            }
        };

        return mLayouts[sLayout] || mLayouts.HOSPITAL_LARGE;
    }

    function renderHeader(oRm, oControl, oLayout) {
        oRm.openStart("div");
        oRm.style("display", "flex");
        oRm.style("justify-content", "space-between");
        oRm.style("gap", "0.75rem");
        oRm.style("border-bottom", "1px solid #d9d9d9");
        oRm.style("padding-bottom", "0.5rem");
        oRm.openEnd();

        oRm.openStart("div");
        oRm.style("min-width", "0");
        oRm.openEnd();
        oRm.openStart("div");
        oRm.style("font-size", oLayout.titleSize);
        oRm.style("font-weight", "700");
        oRm.style("line-height", "1.2");
        oRm.openEnd();
        oRm.text(oControl.getMaterialName());
        oRm.close("div");
        oRm.openStart("div");
        oRm.style("font-size", "0.75rem");
        oRm.style("line-height", "1.2");
        oRm.style("margin-top", "0.25rem");
        oRm.openEnd();
        oRm.text(oControl.getPresentation());
        oRm.close("div");
        oRm.close("div");

        oRm.openStart("div");
        oRm.style("font-size", "0.65rem");
        oRm.style("font-weight", "700");
        oRm.style("text-align", "right");
        oRm.style("text-transform", "uppercase");
        oRm.openEnd();
        oRm.text(oControl.getFormat());
        oRm.close("div");

        oRm.close("div");
    }

    function renderProductBody(oRm, oControl, oLayout) {
        oRm.openStart("div");
        oRm.style("display", oLayout.horizontal ? "grid" : "block");
        oRm.style("grid-template-columns", oLayout.horizontal ? "1fr auto" : "");
        oRm.style("gap", oLayout.horizontal ? "0.75rem" : "");
        oRm.style("margin-top", "0.75rem");
        oRm.openEnd();

        oRm.openStart("div");
        oRm.openEnd();
        renderDataRow(oRm, "Lote", oControl.getLot(), true);
        renderDataRow(oRm, "Vencimiento", oControl.getExpirationDate(), true);

        if (oControl.getShowGtin()) {
            renderDataRow(oRm, "GTIN", oControl.getGtin(), false);
        }

        oRm.close("div");
    }

    function renderOppBody(oRm, oControl) {
        oRm.openStart("div");
        oRm.style("margin-top", "0.875rem");
        oRm.style("display", "grid");
        oRm.style("grid-template-columns", "1fr");
        oRm.style("gap", "0.625rem");
        oRm.openEnd();

        renderDataRow(oRm, "Lote", oControl.getLot(), true);
        renderDataRow(oRm, "Vencimiento", oControl.getExpirationDate(), true);

        oRm.close("div");
    }

    function renderDataRow(oRm, sLabel, sValue, bStrong) {
        oRm.openStart("div");
        oRm.style("display", "flex");
        oRm.style("justify-content", "space-between");
        oRm.style("gap", "0.75rem");
        oRm.style("padding", "0.25rem 0");
        oRm.style("border-bottom", "1px solid #f0f0f0");
        oRm.openEnd();

        oRm.openStart("span");
        oRm.style("font-size", "0.72rem");
        oRm.style("color", "#5b738b");
        oRm.openEnd();
        oRm.text(sLabel);
        oRm.close("span");

        oRm.openStart("span");
        oRm.style("font-size", bStrong ? "0.95rem" : "0.8rem");
        oRm.style("font-weight", bStrong ? "700" : "600");
        oRm.style("text-align", "right");
        oRm.style("word-break", "break-word");
        oRm.openEnd();
        oRm.text(sValue);
        oRm.close("span");

        oRm.close("div");
    }

    function renderCode(oRm, oControl, oLayout) {
        oRm.openStart("div");
        oRm.style("display", "flex");
        oRm.style("justify-content", "center");
        oRm.style("align-items", "center");
        oRm.style("margin-top", oLayout.horizontal ? "0" : "0.875rem");
        oRm.openEnd();

        if (oControl.getVisualCodeType() === "LINEAR_EAN") {
            renderLinearCode(oRm, oControl.getVisualCodeValue(), oLayout);
        } else {
            renderMatrixCode(
                oRm,
                oControl.getGs1String() || oControl.getVisualCodeValue(),
                oLayout
            );
        }

        oRm.close("div");

        oRm.openStart("div");
        oRm.style("font-size", "0.7rem");
        oRm.style("letter-spacing", "0.12rem");
        oRm.style("text-align", "center");
        oRm.style("margin-top", "0.25rem");
        oRm.style("word-break", "break-word");
        oRm.openEnd();
        oRm.text(oControl.getVisualCodeValue());
        oRm.close("div");
    }

    function renderLinearCode(oRm, sValue, oLayout) {
        const aBars = getLinearBars(sValue);
        const iWidth = 260;
        const iHeight = oLayout.codeHeight;
        const iBarWidth = iWidth / aBars.length;

        oRm.openStart("svg");
        oRm.attr("xmlns", SVG_NS);
        oRm.attr("viewBox", `0 0 ${iWidth} ${iHeight}`);
        oRm.attr("role", "img");
        oRm.attr("aria-label", "Código de barras lineal mock");
        oRm.style("width", "100%");
        oRm.style("max-width", "16.25rem");
        oRm.style("height", `${iHeight}px`);
        oRm.openEnd();

        aBars.forEach((iBar, iIndex) => {
            if (!iBar) {
                return;
            }

            const bGuard = iIndex < 3 ||
                (iIndex > aBars.length / 2 - 3 &&
                    iIndex < aBars.length / 2 + 3) ||
                iIndex > aBars.length - 4;

            oRm.openStart("rect");
            oRm.attr("x", (iIndex * iBarWidth).toFixed(2));
            oRm.attr("y", 0);
            oRm.attr("width", Math.max(iBarWidth, 1).toFixed(2));
            oRm.attr("height", bGuard ? iHeight : iHeight - 8);
            oRm.attr("fill", "#111");
            oRm.openEnd();
            oRm.close("rect");
        });

        oRm.close("svg");
    }

    function getLinearBars(sValue) {
        const mPatterns = {
            "0": "0001101",
            "1": "0011001",
            "2": "0010011",
            "3": "0111101",
            "4": "0100011",
            "5": "0110001",
            "6": "0101111",
            "7": "0111011",
            "8": "0110111",
            "9": "0001011"
        };
        const sDigits = String(sValue || "").replace(/\D/g, "").slice(-12);
        const sSafeDigits = sDigits.padStart(12, "0");
        let sPattern = "101";

        sSafeDigits.slice(0, 6).split("").forEach((sDigit) => {
            sPattern += mPatterns[sDigit] || mPatterns["0"];
        });

        sPattern += "01010";

        sSafeDigits.slice(6).split("").forEach((sDigit) => {
            sPattern += (mPatterns[sDigit] || mPatterns["0"])
                .replace(/0/g, "x")
                .replace(/1/g, "0")
                .replace(/x/g, "1");
        });

        sPattern += "101";

        return sPattern.split("").map(Number);
    }

    function renderMatrixCode(oRm, sValue, oLayout) {
        const iCells = oLayout.matrixSize > 140 ? 24 : 20;
        const iSize = oLayout.matrixSize;
        const iCellSize = iSize / iCells;
        const aMatrix = getMatrix(sValue, iCells);

        oRm.openStart("svg");
        oRm.attr("xmlns", SVG_NS);
        oRm.attr("viewBox", `0 0 ${iSize} ${iSize}`);
        oRm.attr("role", "img");
        oRm.attr("aria-label", "Datamatrix mock generado");
        oRm.style("width", `${iSize}px`);
        oRm.style("max-width", "100%");
        oRm.style("height", `${iSize}px`);
        oRm.openEnd();

        aMatrix.forEach((aRow, iRow) => {
            aRow.forEach((bFilled, iColumn) => {
                if (!bFilled) {
                    return;
                }

                oRm.openStart("rect");
                oRm.attr("x", (iColumn * iCellSize).toFixed(2));
                oRm.attr("y", (iRow * iCellSize).toFixed(2));
                oRm.attr("width", Math.ceil(iCellSize));
                oRm.attr("height", Math.ceil(iCellSize));
                oRm.attr("fill", "#111");
                oRm.openEnd();
                oRm.close("rect");
            });
        });

        oRm.close("svg");
    }

    function getMatrix(sValue, iCells) {
        const aMatrix = [];
        let iSeed = 2166136261;
        const sText = String(sValue || "");

        for (let i = 0; i < sText.length; i += 1) {
            iSeed ^= sText.charCodeAt(i);
            iSeed += (iSeed << 1) + (iSeed << 4) +
                (iSeed << 7) + (iSeed << 8) + (iSeed << 24);
        }

        for (let iRow = 0; iRow < iCells; iRow += 1) {
            const aRow = [];

            for (let iColumn = 0; iColumn < iCells; iColumn += 1) {
                let bFilled = false;

                if (iColumn === 0 || iRow === iCells - 1) {
                    bFilled = true;
                } else if (iRow === 0 || iColumn === iCells - 1) {
                    bFilled = (iRow + iColumn) % 2 === 0;
                } else {
                    iSeed = (iSeed * 1664525 + 1013904223) >>> 0;
                    bFilled = (iSeed % 100) > 48;
                }

                aRow.push(bFilled);
            }

            aMatrix.push(aRow);
        }

        return aMatrix;
    }

    function renderFooter(oRm, oControl, oLayout) {
        oRm.openStart("div");
        oRm.style("margin-top", oLayout.compact ? "0.625rem" : "0.875rem");
        oRm.style("padding-top", "0.5rem");
        oRm.style("border-top", "1px solid #d9d9d9");
        oRm.style("font-size", "0.65rem");
        oRm.style("color", "#5b738b");
        oRm.style("text-align", "center");
        oRm.openEnd();
        oRm.text("Vista previa mock sin validez para impresión productiva");
        oRm.close("div");
    }

    return LabelPreview;
});
