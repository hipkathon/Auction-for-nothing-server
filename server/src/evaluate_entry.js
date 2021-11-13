class EvaluateEntry {
    static EVALUATE_ENTRY_ID = 1;

    constructor(url, src) {
        this.id = EvaluateEntry.EVALUATE_ENTRY_ID++;
        this.url = url;
        this.src = src;

        // custom
        this.intParam1 = 0;
        this.intParam2 = 0;
        this.strParam1 = "";
        this.strParam2 = "";
    }

    toString() {
        const obj = {
            id : this.id,
            url : this.url,
            src : this.src,
            intParam1 : this.intParam1,
            intParam2 : this.intParam2,
            strParam1 : this.strParam1,
            strParam2 : this.strParam2
        };
        return JSON.stringify(obj);
    }
}

module.exports = EvaluateEntry