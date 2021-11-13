class Utils {
    static isImageFile(fileExt) {
        if (fileExt == ".png")
            return true;

        return false;
    }

    static virtualTime = 0;
    static getCurrentDate() {
        let curDate = new Date();
        curDate.setSeconds(curDate.getSeconds() + Utils.virtualTime);
        return curDate;
    }
}

module.exports = Utils