class ResultCode {
    static SUCCESS = 200; // 성공
    static NOT_FOUND = 404; // 없는 명령어
    static LOGIC_ERROR = 600; // 무언가 에러
    static NO_EVALUATE_ENTRY = 601; // 평가할 엔트리가 존재하지 않음
    static CANNOT_EVALUATE_OWN = 602; // 자신의 힙함을 평가하지 마라
    static ALREADY_EVALUATE_ENTRY = 603; // 이미 평가한 항목
    static ALREADY_DONE_AUCTION_ENTRY = 604; // 이미 종료된 경매
    static CANNOT_BID_CONSECUTIVELY = 605; // 두번 연속으로 입찰 할 수 없습니다.
    static NOT_ENOUGH_PRICE = 606;
}

module.exports = ResultCode