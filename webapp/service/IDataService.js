sap.ui.define([], () => {
    "use strict";

    const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

    class IDataService {
        getModel() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        load() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        getFeatureByRoute() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        getBusinessObject() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        query() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        get() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        create() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        update() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        remove() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }

        executeAction() {
            throw new Error(NOT_IMPLEMENTED_MESSAGE);
        }
    }

    return IDataService;
});
