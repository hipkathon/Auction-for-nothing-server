class Utils {
    static isImageFile(fileExt) {
        if (fileExt == ".png")
            return true;
        if (fileExt == ".gif")
            return true;
        if (fileExt == ".jpg")
            return true;

        return false;
    }

    static virtualTime = 0;
    static getCurrentDate() {
        let curDate = new Date();
        curDate.setSeconds(curDate.getSeconds() + Utils.virtualTime);
        return curDate;
    }

    static getRandomId(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }

    static timestamp(date) {
        function pad(n) { return n < 10 ? "0" + n : n }

        return date.getFullYear() + "-" +
            pad(date.getMonth() + 1) + "-" +
            pad(date.getDate()) + " " +
            pad(date.getHours()) + ":" +
            pad(date.getMinutes()) + ":" +
            pad(date.getSeconds())
    }
}

module.exports = Utils