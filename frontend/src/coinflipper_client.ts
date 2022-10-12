import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class BetResult {
    won: boolean = false;
    amount: bigint = BigInt(0);
    static codec: algosdk.ABIType = algosdk.ABIType.from("(bool,uint64)");
    static fields: string[] = ["won", "amount"];
    static decodeResult(val: algosdk.ABIValue | undefined): BetResult {
        return bkr.decodeNamedTuple(val, BetResult.fields) as BetResult;
    }
    static decodeBytes(val: Uint8Array): BetResult {
        return bkr.decodeNamedTuple(BetResult.codec.decode(val), BetResult.fields) as BetResult;
    }
}
export class CoinFlipper extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: { beacon_app_id: { type: bkr.AVMType.uint64, key: "beacon_app_id", desc: "", static: false }, bets_outstanding: { type: bkr.AVMType.uint64, key: "bets_outstanding", desc: "", static: false }, max_bet: { type: bkr.AVMType.uint64, key: "max_bet", desc: "", static: false }, min_bet: { type: bkr.AVMType.uint64, key: "min_bet", desc: "", static: false } }, dynamic: {} };
    override acctSchema: bkr.Schema = { declared: { bet: { type: bkr.AVMType.uint64, key: "bet", desc: "", static: false }, commitment_round: { type: bkr.AVMType.uint64, key: "commitment_round", desc: "", static: false }, heads: { type: bkr.AVMType.uint64, key: "heads", desc: "", static: false } }, dynamic: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDAgMSAyCmJ5dGVjYmxvY2sgMHg2MjY1NzQ3MzVmNmY3NTc0NzM3NDYxNmU2NDY5NmU2NyAweDYzNmY2ZDZkNjk3NDZkNjU2ZTc0NWY3MjZmNzU2ZTY0IDB4NjI2NTc0IDB4NjI2NTYxNjM2ZjZlNWY2MTcwNzA1ZjY5NjQgMHg2ZDYxNzg1ZjYyNjU3NCAweDZkNjk2ZTVmNjI2NTc0IDB4Njg2NTYxNjQ3MyAweDE1MWY3Yzc1IDB4MDAKdHhuIE51bUFwcEFyZ3MKaW50Y18wIC8vIDAKPT0KYm56IG1haW5fbDgKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHgzNTJkMGYxMiAvLyAiY29uZmlndXJlKHVpbnQ2NCx1aW50NjQsdWludDY0KXZvaWQiCj09CmJueiBtYWluX2w3CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4NzMzMGVlOGEgLy8gImZsaXBfY29pbihwYXksYm9vbCl1aW50NjQiCj09CmJueiBtYWluX2w2CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4OTgyZmE4ZTUgLy8gInNldHRsZShhY2NvdW50LGFwcGxpY2F0aW9uKShib29sLHVpbnQ2NCkiCj09CmJueiBtYWluX2w1CmVycgptYWluX2w1Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCmludGNfMCAvLyAwCmdldGJ5dGUKc3RvcmUgMTEKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgppbnRjXzAgLy8gMApnZXRieXRlCnN0b3JlIDEyCmxvYWQgMTEKbG9hZCAxMgpjYWxsc3ViIHNldHRsZV8xMgpzdG9yZSAxMwpieXRlYyA3IC8vIDB4MTUxZjdjNzUKbG9hZCAxMwpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2w2Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCmludGNfMCAvLyAwCnB1c2hpbnQgOCAvLyA4CioKZ2V0Yml0CnN0b3JlIDQKdHhuIEdyb3VwSW5kZXgKaW50Y18xIC8vIDEKLQpzdG9yZSAzCmxvYWQgMwpndHhucyBUeXBlRW51bQppbnRjXzEgLy8gcGF5Cj09CmFzc2VydApsb2FkIDMKbG9hZCA0CmNhbGxzdWIgZmxpcGNvaW5fOQpzdG9yZSA1CmJ5dGVjIDcgLy8gMHgxNTFmN2M3NQpsb2FkIDUKaXRvYgpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2w3Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCmJ0b2kKc3RvcmUgMAp0eG5hIEFwcGxpY2F0aW9uQXJncyAyCmJ0b2kKc3RvcmUgMQp0eG5hIEFwcGxpY2F0aW9uQXJncyAzCmJ0b2kKc3RvcmUgMgpsb2FkIDAKbG9hZCAxCmxvYWQgMgpjYWxsc3ViIGNvbmZpZ3VyZV84CmludGNfMSAvLyAxCnJldHVybgptYWluX2w4Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CmJueiBtYWluX2wxOAp0eG4gT25Db21wbGV0aW9uCmludGNfMSAvLyBPcHRJbgo9PQpibnogbWFpbl9sMTcKdHhuIE9uQ29tcGxldGlvbgppbnRjXzIgLy8gQ2xvc2VPdXQKPT0KYm56IG1haW5fbDE2CnR4biBPbkNvbXBsZXRpb24KcHVzaGludCA0IC8vIFVwZGF0ZUFwcGxpY2F0aW9uCj09CmJueiBtYWluX2wxNQp0eG4gT25Db21wbGV0aW9uCnB1c2hpbnQgNSAvLyBEZWxldGVBcHBsaWNhdGlvbgo9PQpibnogbWFpbl9sMTQKZXJyCm1haW5fbDE0Ogp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQphc3NlcnQKY2FsbHN1YiBkZWxldGVfMwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTU6CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CmFzc2VydApjYWxsc3ViIHVwZGF0ZV81CmludGNfMSAvLyAxCnJldHVybgptYWluX2wxNjoKdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KYXNzZXJ0CmNhbGxzdWIgY2xvc2VvdXRfNwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTc6CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CmFzc2VydApjYWxsc3ViIG9wdGluXzYKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDE4Ogp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAo9PQphc3NlcnQKY2FsbHN1YiBjcmVhdGVfMAppbnRjXzEgLy8gMQpyZXR1cm4KCi8vIGNyZWF0ZQpjcmVhdGVfMDoKYnl0ZWNfMyAvLyAiYmVhY29uX2FwcF9pZCIKcHVzaGludCAxMTAwOTYwMjYgLy8gMTEwMDk2MDI2CmFwcF9nbG9iYWxfcHV0CmJ5dGVjXzAgLy8gImJldHNfb3V0c3RhbmRpbmciCmludGNfMCAvLyAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDQgLy8gIm1heF9iZXQiCnB1c2hpbnQgMTAwMDAwMCAvLyAxMDAwMDAwCmFwcF9nbG9iYWxfcHV0CmJ5dGVjIDUgLy8gIm1pbl9iZXQiCnB1c2hpbnQgNTAwMCAvLyA1MDAwCmFwcF9nbG9iYWxfcHV0CnJldHN1YgoKLy8gYXV0aF9vbmx5CmF1dGhvbmx5XzE6Cmdsb2JhbCBDcmVhdG9yQWRkcmVzcwo9PQpyZXRzdWIKCi8vIGF1dGhfb25seQphdXRob25seV8yOgpnbG9iYWwgQ3JlYXRvckFkZHJlc3MKPT0KcmV0c3ViCgovLyBkZWxldGUKZGVsZXRlXzM6CnR4biBTZW5kZXIKY2FsbHN1YiBhdXRob25seV8yCi8vIHVuYXV0aG9yaXplZAphc3NlcnQKYnl0ZWNfMCAvLyAiYmV0c19vdXRzdGFuZGluZyIKYXBwX2dsb2JhbF9nZXQKaW50Y18wIC8vIDAKPT0KYXNzZXJ0Cml0eG5fYmVnaW4KaW50Y18xIC8vIHBheQppdHhuX2ZpZWxkIFR5cGVFbnVtCnR4biBTZW5kZXIKaXR4bl9maWVsZCBSZWNlaXZlcgppbnRjXzAgLy8gMAppdHhuX2ZpZWxkIEFtb3VudAp0eG4gU2VuZGVyCml0eG5fZmllbGQgQ2xvc2VSZW1haW5kZXJUbwppdHhuX3N1Ym1pdAppbnRjXzEgLy8gMQpyZXR1cm4KCi8vIGF1dGhfb25seQphdXRob25seV80OgpnbG9iYWwgQ3JlYXRvckFkZHJlc3MKPT0KcmV0c3ViCgovLyB1cGRhdGUKdXBkYXRlXzU6CnR4biBTZW5kZXIKY2FsbHN1YiBhdXRob25seV80Ci8vIHVuYXV0aG9yaXplZAphc3NlcnQKaW50Y18xIC8vIDEKcmV0dXJuCgovLyBvcHRfaW4Kb3B0aW5fNjoKaW50Y18xIC8vIDEKcmV0dXJuCgovLyBjbG9zZV9vdXQKY2xvc2VvdXRfNzoKdHhuIFNlbmRlcgpieXRlY18xIC8vICJjb21taXRtZW50X3JvdW5kIgphcHBfbG9jYWxfZ2V0CmludGNfMCAvLyAwCj4KYnogY2xvc2VvdXRfN19sMgpieXRlY18wIC8vICJiZXRzX291dHN0YW5kaW5nIgpieXRlY18wIC8vICJiZXRzX291dHN0YW5kaW5nIgphcHBfZ2xvYmFsX2dldAppbnRjXzEgLy8gMQotCmFwcF9nbG9iYWxfcHV0CmNsb3Nlb3V0XzdfbDI6CmludGNfMSAvLyAxCnJldHVybgoKLy8gY29uZmlndXJlCmNvbmZpZ3VyZV84OgpzdG9yZSAyMgpzdG9yZSAyMQpzdG9yZSAyMAp0eG4gU2VuZGVyCmNhbGxzdWIgYXV0aG9ubHlfMQovLyB1bmF1dGhvcml6ZWQKYXNzZXJ0CmxvYWQgMjEKbG9hZCAyMgo8Ci8vIG1pbiBiZXQgbXVzdCBiZSA8IG1heCBiZXQKYXNzZXJ0CmJ5dGVjXzMgLy8gImJlYWNvbl9hcHBfaWQiCmxvYWQgMjAKYXBwX2dsb2JhbF9wdXQKYnl0ZWMgNSAvLyAibWluX2JldCIKbG9hZCAyMQphcHBfZ2xvYmFsX3B1dApieXRlYyA0IC8vICJtYXhfYmV0Igpsb2FkIDIyCmFwcF9nbG9iYWxfcHV0CnJldHN1YgoKLy8gZmxpcF9jb2luCmZsaXBjb2luXzk6CnN0b3JlIDcKc3RvcmUgNgpsb2FkIDYKZ3R4bnMgQW1vdW50CmJ5dGVjIDUgLy8gIm1pbl9iZXQiCmFwcF9nbG9iYWxfZ2V0Cj49Ci8vIHBheW1lbnQgbXVzdCBiZSA+PSA1bUEgYW5kIDwgMUEKYXNzZXJ0CmxvYWQgNgpndHhucyBBbW91bnQKYnl0ZWMgNCAvLyAibWF4X2JldCIKYXBwX2dsb2JhbF9nZXQKPD0KLy8gcGF5bWVudCBtdXN0IGJlID49IDVtQSBhbmQgPCAxQQphc3NlcnQKbG9hZCA2Cmd0eG5zIFJlY2VpdmVyCmdsb2JhbCBDdXJyZW50QXBwbGljYXRpb25BZGRyZXNzCj09Ci8vIHBheW1lbnQgbXVzdCB0byB0aGUgY29udHJhY3QgYWRkcmVzcwphc3NlcnQKdHhuIFNlbmRlcgppbnRjXzAgLy8gMApieXRlY18xIC8vICJjb21taXRtZW50X3JvdW5kIgphcHBfbG9jYWxfZ2V0X2V4CnN0b3JlIDkKc3RvcmUgOApsb2FkIDkKIQovLyB0aGVyZSBpcyBhbHJlYWR5IGEgYmV0IG91dHN0YW5kaW5nCmFzc2VydApnbG9iYWwgUm91bmQKcHVzaGludCAzIC8vIDMKKwpzdG9yZSAxMAp0eG4gU2VuZGVyCmJ5dGVjXzEgLy8gImNvbW1pdG1lbnRfcm91bmQiCmxvYWQgMTAKYXBwX2xvY2FsX3B1dAp0eG4gU2VuZGVyCmJ5dGVjXzIgLy8gImJldCIKbG9hZCA2Cmd0eG5zIEFtb3VudAphcHBfbG9jYWxfcHV0CnR4biBTZW5kZXIKYnl0ZWMgNiAvLyAiaGVhZHMiCmxvYWQgNwphcHBfbG9jYWxfcHV0CmJ5dGVjXzAgLy8gImJldHNfb3V0c3RhbmRpbmciCmJ5dGVjXzAgLy8gImJldHNfb3V0c3RhbmRpbmciCmFwcF9nbG9iYWxfZ2V0CmludGNfMSAvLyAxCisKYXBwX2dsb2JhbF9wdXQKbG9hZCAxMApyZXRzdWIKCi8vIGdldF9yYW5kb21uZXNzCmdldHJhbmRvbW5lc3NfMTA6CnN0b3JlIDIzCmludGNfMCAvLyAwCml0b2IKZXh0cmFjdCA2IDAKcHVzaGJ5dGVzIDB4IC8vICIiCmNvbmNhdApzdG9yZSAyNAppdHhuX2JlZ2luCnB1c2hpbnQgNiAvLyBhcHBsCml0eG5fZmllbGQgVHlwZUVudW0KYnl0ZWNfMyAvLyAiYmVhY29uX2FwcF9pZCIKYXBwX2dsb2JhbF9nZXQKaXR4bl9maWVsZCBBcHBsaWNhdGlvbklECnB1c2hieXRlcyAweDQ3YzIwYzIzIC8vICJtdXN0X2dldCh1aW50NjQsYnl0ZVtdKWJ5dGVbXSIKaXR4bl9maWVsZCBBcHBsaWNhdGlvbkFyZ3MKbG9hZCAyMwppdG9iCml0eG5fZmllbGQgQXBwbGljYXRpb25BcmdzCmxvYWQgMjQKaXR4bl9maWVsZCBBcHBsaWNhdGlvbkFyZ3MKaXR4bl9zdWJtaXQKaXR4biBMYXN0TG9nCmV4dHJhY3QgNCAwCnJldHN1YgoKLy8gcGF5b3V0CnBheW91dF8xMToKc3RvcmUgMjUKaXR4bl9iZWdpbgppbnRjXzEgLy8gcGF5Cml0eG5fZmllbGQgVHlwZUVudW0KbG9hZCAyNQppdHhuX2ZpZWxkIFJlY2VpdmVyCmxvYWQgMjUKYnl0ZWNfMiAvLyAiYmV0IgphcHBfbG9jYWxfZ2V0CmludGNfMiAvLyAyCioKaXR4bl9maWVsZCBBbW91bnQKaXR4bl9zdWJtaXQKcmV0c3ViCgovLyBzZXR0bGUKc2V0dGxlXzEyOgpzdG9yZSAxNQpzdG9yZSAxNApsb2FkIDE0CnR4bmFzIEFjY291bnRzCmJ5dGVjXzEgLy8gImNvbW1pdG1lbnRfcm91bmQiCmFwcF9sb2NhbF9nZXQKY2FsbHN1YiBnZXRyYW5kb21uZXNzXzEwCnN0b3JlIDE5CnR4biBTZW5kZXIKYnl0ZWMgNiAvLyAiaGVhZHMiCmFwcF9sb2NhbF9nZXQKbG9hZCAxOQpleHRyYWN0IDIgMAppbnRjXzAgLy8gMApnZXRiaXQKPT0KIQohCnN0b3JlIDE3CmxvYWQgMTcKYm56IHNldHRsZV8xMl9sMgpsb2FkIDE0CnR4bmFzIEFjY291bnRzCmJ5dGVjXzIgLy8gImJldCIKYXBwX2xvY2FsX2dldApzdG9yZSAxOApieXRlYyA4IC8vIDB4MDAKaW50Y18wIC8vIDAKbG9hZCAxNwpzZXRiaXQKbG9hZCAxOAppdG9iCmNvbmNhdApzdG9yZSAxNgpiIHNldHRsZV8xMl9sMwpzZXR0bGVfMTJfbDI6CmxvYWQgMTQKdHhuYXMgQWNjb3VudHMKY2FsbHN1YiBwYXlvdXRfMTEKbG9hZCAxNAp0eG5hcyBBY2NvdW50cwpieXRlY18yIC8vICJiZXQiCmFwcF9sb2NhbF9nZXQKaW50Y18yIC8vIDIKKgpzdG9yZSAxOApieXRlYyA4IC8vIDB4MDAKaW50Y18wIC8vIDAKbG9hZCAxNwpzZXRiaXQKbG9hZCAxOAppdG9iCmNvbmNhdApzdG9yZSAxNgpzZXR0bGVfMTJfbDM6CmxvYWQgMTQKdHhuYXMgQWNjb3VudHMKYnl0ZWNfMSAvLyAiY29tbWl0bWVudF9yb3VuZCIKYXBwX2xvY2FsX2RlbApsb2FkIDE0CnR4bmFzIEFjY291bnRzCmJ5dGVjXzIgLy8gImJldCIKYXBwX2xvY2FsX2RlbApsb2FkIDE0CnR4bmFzIEFjY291bnRzCmJ5dGVjIDYgLy8gImhlYWRzIgphcHBfbG9jYWxfZGVsCmJ5dGVjXzAgLy8gImJldHNfb3V0c3RhbmRpbmciCmJ5dGVjXzAgLy8gImJldHNfb3V0c3RhbmRpbmciCmFwcF9nbG9iYWxfZ2V0CmludGNfMSAvLyAxCi0KYXBwX2dsb2JhbF9wdXQKbG9hZCAxNgpyZXRzdWI=";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDEgMApieXRlY2Jsb2NrIDB4NjI2NTc0NzM1ZjZmNzU3NDczNzQ2MTZlNjQ2OTZlNjcKdHhuIE51bUFwcEFyZ3MKaW50Y18xIC8vIDAKPT0KYm56IG1haW5fbDIKZXJyCm1haW5fbDI6CmNhbGxzdWIgY2xlYXJzdGF0ZV8wCmludGNfMCAvLyAxCnJldHVybgoKLy8gY2xlYXJfc3RhdGUKY2xlYXJzdGF0ZV8wOgp0eG4gU2VuZGVyCnB1c2hieXRlcyAweDYzNmY2ZDZkNjk3NDZkNjU2ZTc0NWY3MjZmNzU2ZTY0IC8vICJjb21taXRtZW50X3JvdW5kIgphcHBfbG9jYWxfZ2V0CmludGNfMSAvLyAwCj4KYnogY2xlYXJzdGF0ZV8wX2wyCmJ5dGVjXzAgLy8gImJldHNfb3V0c3RhbmRpbmciCmJ5dGVjXzAgLy8gImJldHNfb3V0c3RhbmRpbmciCmFwcF9nbG9iYWxfZ2V0CmludGNfMCAvLyAxCi0KYXBwX2dsb2JhbF9wdXQKY2xlYXJzdGF0ZV8wX2wyOgppbnRjXzAgLy8gMQpyZXR1cm4=";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "configure", desc: "", args: [{ type: "uint64", name: "app_id", desc: "" }, { type: "uint64", name: "min_bet", desc: "" }, { type: "uint64", name: "max_bet", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "flip_coin", desc: "", args: [{ type: "pay", name: "bet_payment", desc: "" }, { type: "bool", name: "heads", desc: "" }], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "settle", desc: "", args: [{ type: "account", name: "bettor", desc: "" }, { type: "application", name: "beacon_app", desc: "" }], returns: { type: "(bool,uint64)", desc: "" } })
    ];
    async configure(args: {
        app_id: bigint;
        min_bet: bigint;
        max_bet: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.configure({ app_id: args.app_id, min_bet: args.min_bet, max_bet: args.max_bet }, txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async flip_coin(args: {
        bet_payment: algosdk.TransactionWithSigner | algosdk.Transaction;
        heads: boolean;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.flip_coin({ bet_payment: args.bet_payment, heads: args.heads }, txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async settle(args: {
        bettor: string;
        beacon_app?: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<BetResult>> {
        const result = await this.execute(await this.compose.settle({ bettor: args.bettor, beacon_app: args.beacon_app === undefined ? await this.resolve("global-state", "beacon_app_id") as bigint : args.beacon_app }, txnParams));
        return new bkr.ABIResult<BetResult>(result, BetResult.decodeResult(result.returnValue));
    }
    compose = {
        configure: async (args: {
            app_id: bigint;
            min_bet: bigint;
            max_bet: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "configure"), { app_id: args.app_id, min_bet: args.min_bet, max_bet: args.max_bet }, txnParams, atc);
        },
        flip_coin: async (args: {
            bet_payment: algosdk.TransactionWithSigner | algosdk.Transaction;
            heads: boolean;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "flip_coin"), { bet_payment: args.bet_payment, heads: args.heads }, txnParams, atc);
        },
        settle: async (args: {
            bettor: string;
            beacon_app?: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "settle"), { bettor: args.bettor, beacon_app: args.beacon_app === undefined ? await this.resolve("global-state", "beacon_app_id") : args.beacon_app }, txnParams, atc);
        }
    };
}
