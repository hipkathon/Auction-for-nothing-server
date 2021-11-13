class Network {
    // 로그인 없이 ip port 로 아이디 처리
    static getUid(ip, port) {
        return ip + ":"// ; + port;
    }
}

module.exports = Network