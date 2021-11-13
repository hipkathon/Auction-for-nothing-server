class EvaluateEntry {
    static EVALUATE_ENTRY_ID = 1;

    static State = {
        HIPPABLE: 1,
        NOT_HIP: 2,
        HIP: 3
    };

    constructor(uid, url, src, title, content) {
        this.id = EvaluateEntry.EVALUATE_ENTRY_ID++;
        this.uid = uid;
        this.url = url;
        this.src = src;
        this.title = title;
        this.content = content;
        this.state = EvaluateEntry.State.HIPPABLE;

        const curDate = new Date();
        this.expireDate = new Date(new Date(curDate).setHours(curDate.getHours() + 2));

        this.evaluateUidDict = {};
        this.hip = 0;

        // custom
        this.intParam1 = 0;
        this.intParam2 = 0;
        this.strParam1 = "";
        this.strParam2 = "";
    }

    getUid() {
        return this.uid;
    }

    toString() {
        const obj = {
            id: this.id,
            url: this.url,
            src: 0, // this.src,
            title: this.title,
            content: this.content,
            hip: this.hip,
            state: this.state,
            expireDate: this.expireDate,
            intParam1: this.intParam1,
            intParam2: this.intParam2,
            strParam1: this.strParam1,
            strParam2: this.strParam2
        };
        return JSON.stringify(obj);
    }

    isAlreadyEvaluate(uid) {
        return this.evaluateUidDict[uid] == uid;
    }

    evaluate(uid) {
        this.hip++;
        this.evaluateUidDict[uid] = uid;
    }

    isExpire(curDate) {
        return this.expireDate < curDate;
    }

    isHippable() {
        return this.state == EvaluateEntry.State.HIPPABLE;
    }

    isHip() {
        return this.state == EvaluateEntry.State.HIP;
    }

    finish() {
        if (this.hip >= 0)
            this.state = EvaluateEntry.State.HIP;
        else
            this.state = EvaluateEntry.State.NOT_HIP;
    }
}

module.exports = EvaluateEntry