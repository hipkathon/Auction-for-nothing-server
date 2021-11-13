class AuctionEntry {
    static AUCTION_ENTRY_ID = 1;

    static State = {
        TO_DO: 1,
        IN_PROGRESS: 2,
        DONE: 3
    };

    constructor(uid, url, src, title, content, curDate) {
        this.id = AuctionEntry.AUCTION_ENTRY_ID++;
        this.uid = uid;
        this.url = url;
        this.src = src;
        this.title = title;
        this.content = content;
        this.state = AuctionEntry.State.TO_DO;

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
            src: 0, // this.src,
            title: this.title,
            content: this.content,
            state: this.state,
            nextUpdateDate: this.nextUpdateDate.getSeconds(),
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
            this.nextUpdateDate = new Date(new Date(curDate).setHours(curDate.getHours() + 2));
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

    bid(uid, price, curDate) {
        this.lastBidUid = uid;
        this.lastBidPrice = price;

        const biddingEndDate = new Date(new Date(curDate).setHours(curDate.getHours() + 2));
        this.nextUpdateDate =
            this.nextUpdateDate > biddingEndDate ?
                this.nextUpdateDate :
                biddingEndDate;
    }

    isBidUser(uid) {
        return this.bidUidDict[uid] == uid;
    }
}

module.exports = AuctionEntry