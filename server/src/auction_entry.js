class AuctionEntry {
    static AUCTION_ENTRY_ID = 1;

    static State = {
        TO_DO: 1,
        IN_PROGRESS: 2,
        DONE: 3
    };

    constructor(uid, url, src) {
        this.id = AuctionEntry.AuctionEntry++;
        this.uid = uid;
        this.url = url;
        this.src = src;
        this.state = AuctionEntry.State.TO_DO;

        const curDate = new Date();
        this.nextUpdateDate = new Date(new Date(curDate).setHours(curDate.getHours() + 2));

        this.bidUidDict = {};

        this.lastBidUid = 0;
        this.lastBidPrice = 0;

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
            src: this.src,
            state: this.state,
            nextUpdateDate: this.nextUpdateDate,
            lastBidUid: this.lastBidUid,
            lastBidPrice: this.lastBidPrice,
        };
        return JSON.stringify(obj);
    }

    isDone() {
        return this.state != AuctionEntry.State.DONE;
    }

    update(curDate) {
        if (this.nextUpdateDate < curDate) {
            if (this.state == AuctionEntry.State.TO_DO) {
                this.state = AuctionEntry.State.IN_PROGRESS;
            }
            else if (this.state == AuctionEntry.State.IN_PROGRESS) {
                this.state = AuctionEntry.State.DONE;
            }
        }
    }

    getLastBidUid() {
        return this.lastBidUid;
    }

    getLastBidPrice() {
        return this.lastBidPrice;
    }

    bid(uid, price) {
        this.lastBidUid = uid;
        this.lastBidPrice = price;
    }

    isBidUser(uid) {
        return this.bidUidDict[uid] == uid;
    }
}

module.exports = AuctionEntry