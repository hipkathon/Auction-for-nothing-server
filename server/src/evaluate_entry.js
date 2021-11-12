class EvaluateEntry {
    static EvVALUATE_ENTRY = 1;

    constructor() {
        this.id = EvaluateEntry.EvVALUATE_ENTRY++;
    }

    toString() {
        const obj = {
            id : this.id
        };
        return JSON.stringify(obj);
    }
}

module.exports = EvaluateEntry