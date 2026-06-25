sap.ui.define([
    "etiquetas/service/MockDataService"
], (MockDataService) => {
    "use strict";

    return {
        create() {
            return new MockDataService();
        }
    };
});
