
const express = require('express');
const path = require('path');
const dir = path.join(__dirname, 'public');
const fs = require('fs');
const app = express();


// user defined
const EvaluateEntry = require('./src/evaluate_entry.js');
const ResultCode = require('./src/result_code');
const Utils = require('./src/utils.js');

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
app.use(express.json());

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

function update() {

}

setInterval(function () {
    // update();
}, 1000 / 32);

function sendHttpResponse(res, resultCode, payload) {
    res.status(resultCode);
    res.setHeader('Content-Type', 'application/json');
    res.end(payload);
}


webSocketServer.on('connection', (ws, request) => {
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log(`새로운 클라이언트[${ip}] 접속`);
    if (ws.readyState === ws.OPEN) { // 연결 여부 체크 
        ws.send(`클라이언트[${ip}] 접속을 환영합니다 from 서버`);
    }
    ws.on('message', (msg) => { console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`); ws.send('메시지 잘 받았습니다! from 서버') })

    ws.on('error', (error) => { console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`); })

    ws.on('close', () => {
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

    if (!Utils.isImageFile(fileExt)) {
        sendHttpResponse(res, ResultCode.LOGIC_ERROR);
        return;
    }

    let base64Data;
    if (fileExt == ".png")
        base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
    else if (fileExt == ".gif")
        base64Data = req.body.image.replace(/^data:image\/gif;base64,/, "");

    fs.writeFile("./public/images/" + fileName, base64Data, 'base64', function (err) {
        if (err) {
            console.log(err);
            sendHttpResponse(res, ResultCode.LOGIC_ERROR);
        }
        sendHttpResponse(res, ResultCode.SUCCESS);
    });
});

app.post('/evaluate', function (req, res) {
    
    sendHttpResponse(res, ResultCode.SUCCESS, JSON.stringify({ payload: evaluates }));
});

app.post("/test", function (req, res) {
    if (req.body.type == "init") {
        testInit(req, res);
    }
    else if (req.body.type == "vt") {
        testVT(req, res);
    }
    else {
        sendHttpResponse(res, ResultCode.NOT_FOUND);
    }
});

function testInit(req, res) {
    const contents = fs.readFileSync(req.body.url, { encoding: 'base64' });
    let evaluateEntry = new EvaluateEntry(req.body.url, contents);

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