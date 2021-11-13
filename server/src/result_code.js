class ResultCode {
    static SUCCESS = 200; // 성공
    static NOT_FOUND = 404; // 없는 명령어
    static LOGIC_ERROR = 600; // 무언가 에러
    static NO_EVALUATE_ENTRY = 601; // 평가할 엔트리가 존재하지 않음
    static ALREADY_EVALUATE_ENTRY = 602; // 이미 평가한 항목
}

module.exports = ResultCode