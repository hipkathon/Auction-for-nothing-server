
const express = require('express');
const path = require('path');
const dir = path.join(__dirname, 'public');
const fs = require('fs');
const app = express();

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

const HTTPServer = app.listen(30001,
    () => {
        console.log("Server is open at port:30001");
    });

const wsModule = require('ws');
const webSocketServer = new wsModule.Server({
    server: HTTPServer,
});

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

app.use(express.static('public'));

app.get('*', function (req, res) {
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

app.post("/upload", function(req, res) {
    console.log(req.body);
    res.status(200);
    res.send('ok');
});