
const express = require('express');
const path = require('path');
const dir = path.join(__dirname, 'public');
const fs = require('fs');
const app = express();


// user defined
const EvaluateEntry = require('./src/evaluate_entry.js');
const ResultCode = require('./src/result_code');
const Utils = require('./src/utils.js');
const Network = require('./src/network.js');
const AuctionEntry = require('./src/auction_entry.js');

const mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

app.use(express.static('public'));
app.use(express.json({ limit: "50mb" }));

const HTTPServer = app.listen(30001,
    () => {
        console.log("Server is open at port:30001");
    });

const wsModule = require('ws');
const { REFUSED } = require('dns');
const webSocketServer = new wsModule.Server({
    server: HTTPServer,
});

// User variable
let evaluateEntryList = [];
let auctionEntryList = [];

let SOCKET_LIST = {};

function update() {
    const curDate = Utils.getCurrentDate();
    const expiredEntryList = evaluateEntryList
        .filter(evaluateEntry => evaluateEntry.isHippable())
        .filter(evaluateEntry => evaluateEntry.isExpire(curDate));

    let removeReservedEvaluateEntryList = [];
    expiredEntryList.forEach(expiredEntry => {
        expiredEntry.finish();
        broadcastUpdatedEvaluatedEntry(expiredEntry);

        if (expiredEntry.isHip()) {
            let auctionEntry = new AuctionEntry(
                expiredEntry.uid,
                expiredEntry.url,
                expiredEntry.src,
                expiredEntry.title,
                expiredEntry.content,
                Utils.getCurrentDate());
            auctionEntryList[auctionEntry.id] = auctionEntry;
            removeReservedEvaluateEntryList.push(expiredEntry.id);
        }
    });

    for (id in removeReservedEvaluateEntryList)
        expiredEntryList[id] = null;

    auctionEntryList
        .filter(auctionEntry => (auctionEntry != null))
        .forEach(auctionEntry => {
            const prevState = auctionEntry.state;
            auctionEntry.update(Utils.getCurrentDate());
            if (auctionEntry.state != prevState)
                broadcastUpdatedAuctionEntry(auctionEntry);
        });
}

setInterval(function () {
    update();
}, 1000 / 32);

function sendHttpResponse(res, resultCode, payload) {
    res.status(resultCode);
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    res.end(payload);
}

webSocketServer.on('connection', (ws, request) => {
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log(`새로운 클라이언트[${ip}] 접속`);

    ws.id = Utils.getRandomId(1, 10000000);
    SOCKET_LIST[ws.id] = ws;

    if (ws.readyState === ws.OPEN) { // 연결 여부 체크 
        ws.send(`클라이언트[${ip}] 접속을 환영합니다 from 서버`);
    }
    ws.on('message', (msg) => { console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`); ws.send('메시지 잘 받았습니다! from 서버') })

    ws.on('error', (error) => { console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`); })

    ws.on('close', () => {
        delete SOCKET_LIST[ws.id];
        console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
    })
});

app.get('/evaluates', function (req, res) {
    let evaluates = {
        list: evaluateEntryList
            .filter(evaluate => evaluate != null)
            .map(evaluate => evaluate.toString())
    }

    sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: evaluates }));
});


app.get('/auctions', function (req, res) {
    let auctions = {
        list: auctionEntryList
            .filter(auction => auction != null)
            .map(auction => auction.toString())
    }

    sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: auctions }));
});

app.get('/mypage', function (req, res) {
    const uid = Network.getUid(req.socket.remoteAddress, req.socket.remotePort);

    let mypageEntryList = {
        beEvaluatedList: evaluateEntryList
            .filter(evaluate => evaluate != null)
            .filter(evaluate => evaluate.getUid() == uid)
            .map(evaluate => evaluate.toString()),
        evaluateList: evaluateEntryList
            .filter(evaluate => evaluate != null)
            .filter(evaluate => evaluate.isAlreadyEvaluate(uid))
            .map(auction => auction.toString()),
        beBidList: auctionEntryList
            .filter(auction => auction != null)
            .filter(auction => auction.getUid() == uid)
            .map(auction => auction.toString()),
        evaluateist: auctionEntryList
            .filter(auction => auction != null)
            .filter(auction => auction.isBidUser(uid))
            .map(auction => auction.toString()),
    }

    sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: mypageEntryList }));
});

app.get('/public/*', function (req, res) {
    var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
    if (file.indexOf(dir + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});

app.post("/upload", function (req, res) {
    const fileName = req.body.name;
    const fileExt = path.extname(req.body.name);
    const title = req.body.title;
    const content = req.body.content;

    if (!Utils.isImageFile(fileExt)) {
        sendHttpResponse(res, ResultCode.LOGIC_ERROR);
        return;
    }

    let base64Data;
    if (fileExt == ".png")
        base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
    else if (fileExt == ".gif")
        base64Data = req.body.image.replace(/^data:image\/gif;base64,/, "");
    else if (fileExt == ".jpg")
        base64Data = req.body.image.replace(/^data:image\/jpg;base64,/, "");

    fs.writeFile("./public/images/" + fileName, base64Data, 'base64', function (err) {
        if (err) {
            console.log(err);
            sendHttpResponse(res, ResultCode.LOGIC_ERROR);
        }

        const uid = Network.getUid(req.socket.remoteAddress, req.socket.remotePort);
        let evaluateEntry = new EvaluateEntry(
            uid,
            "./images/" + fileName,
            base64Data,
            title,
            content);

        evaluateEntryList[evaluateEntry.id] = evaluateEntry;

        sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: evaluateEntry.toString() }));
    });
});

app.post('/evaluate', function (req, res) {
    const id = req.body.id;
    const evaluateEntry = evaluateEntryList[id];

    if (
        evaluateEntry == null ||
        evaluateEntry == undefined) {
        sendHttpResponse(res, ResultCode.NO_EVALUATE_ENTRY);
        return;
    }

    const uid = Network.getUid(req.socket.remoteAddress, req.socket.remotePort);
    if (evaluateEntry.getUid() == uid) {
        sendHttpResponse(res, ResultCode.CANNOT_EVALUATE_OWN);
        return;
    }

    if (evaluateEntry.isAlreadyEvaluate(uid)) {
        sendHttpResponse(res, ResultCode.ALREADY_EVALUATE_ENTRY);
        return;
    }

    evaluateEntry.evaluate(uid);
    sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: evaluateEntry.toString() }));

    broadcastUpdatedEvaluatedEntry(evaluateEntry);
});

app.post('/bid', function (req, res) {
    const id = req.body.id;
    const price = req.body.price;
    const auctionEntry = auctionEntryList[id];

    if (
        auctionEntry == null ||
        auctionEntry == undefined) {
        sendHttpResponse(res, ResultCode.NO_EVALUATE_ENTRY);
        return;
    }

    const uid = Network.getUid(req.socket.remoteAddress, req.socket.remotePort);
    if (!auctionEntry.isInPorgress()) {
        sendHttpResponse(res, ResultCode.NOT_IN_PROGRESS_AUCTION);
        return;
    }

    if (auctionEntry.getLastBidUid() == uid) {
        sendHttpResponse(res, ResultCode.CANNOT_BID_CONSECUTIVELY);
        return;
    }

    if (auctionEntry.getLastBidPrice() >= price) {
        sendHttpResponse(res, ResultCode.NOT_ENOUGH_PRICE);
        return;
    }

    auctionEntry.bid(uid, price, Utils.getCurrentDate());
    sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: auctionEntry.toString() }));

    broadcastUpdatedAuctionEntry(auctionEntry);
});

/// broadcast
function broadcastUpdatedEvaluatedEntry(entry) {
    const obj = {
        type: "UpdateEvaluateEntry",
        id: entry.id,
        hip: entry.hip,
        state: entry.state,
        expireDate: entry.expireDate
    };

    JSON.stringify(obj);

    for (let i in SOCKET_LIST) {
        let ws = SOCKET_LIST[i];
        if (ws.readyState === ws.OPEN) { // 연결 여부 체크 
            ws.send(JSON.stringify(obj));
        }
    }
}

function broadcastUpdatedAuctionEntry(entry) {
    const obj = {
        type: "UpdateAuctionEntry",
        id: entry.id,
        state: entry.state,
        nextUpdateDate: entry.nextUpdateDate,
        lastBidUid: entry.lastBidUid,
        lastBidPrice: entry.lastBidPrice
    };

    JSON.stringify(obj);

    for (let i in SOCKET_LIST) {
        let ws = SOCKET_LIST[i];
        if (ws.readyState === ws.OPEN) { // 연결 여부 체크 
            ws.send(JSON.stringify(obj));
        }
    }
}

/// test
app.post("/test", function (req, res) {
    if (req.body.type == "init") {
        testInit(req, res);
    }
    else if (req.body.type == "vt") {
        testVT(req, res);
    }
    else if (req.body.type == "show") {
        testShow(req, res);
    }
    else {
        sendHttpResponse(res, ResultCode.NOT_FOUND);
    }
});

function testInit(req, res) {
    const uid = Utils.getRandomId(1, 10000000);
    const title = req.body.title;
    const content = req.body.content;
    const src = fs.readFileSync("public/" + req.body.url, { encoding: 'base64' });
    let evaluateEntry = new EvaluateEntry(uid, req.body.url, src, title, content);

    const hip = Utils.getRandomId(127, 3000);
    evaluateEntry.hip = hip;

    evaluateEntryList[evaluateEntry.id] = evaluateEntry;

    sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: evaluateEntry.toString() }));
}

function testVT(req, res) {
    if (req.body.time == "sec") {
        Utils.virtualTime += req.body.value;
    }
    else if (req.body.time == "min") {
        Utils.virtualTime += req.body.value * 60;
    }
    else if (req.body.time == "hour") {
        Utils.virtualTime += req.body.value * 60 * 60;
    }
    else if (req.boy.time == "clear") {
        Utils.virtualTime = 0;
    }
    else {
        sendHttpResponse(res, ResultCode.NOT_FOUND);
        return;
    }

    console.log("vt time : ", Utils.getCurrentDate());

    update();

    sendHttpResponse(res, ResultCode.SUCCESS);
}

function testShow(req, res) {
    console.log(evaluateEntryList);
    console.log(auctionEntryList);

    sendHttpResponse(res, ResultCode.SUCCESS);
}