import algosdk from "algosdk";
import * as bkr from "beaker-ts";
import { CoinFlipper } from "./coinflipper_client";

const APP_ID = 111784038;

const ACCOUNT_MNEMONIC = "tenant helmet motor sauce appear buddy gloom park average glory course wire buyer ostrich history time refuse room blame oxygen film diamond confirm ability spirit";
const ACCOUNT = algosdk.mnemonicToSecretKey(ACCOUNT_MNEMONIC);
const ACCOUNT_SIGNER = algosdk.makeBasicAccountTransactionSigner(ACCOUNT);



(async function () {
  const appClient = new CoinFlipper({
    client: new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", ""),
    signer: ACCOUNT_SIGNER,
    sender: ACCOUNT.addr,
    appId: APP_ID,
  });

  let appAddr; 
  if(APP_ID === undefined){
    const [appId, addr, txId] = await appClient.create();
    console.log(`Created app ${appId} with address ${appAddr} in tx ${txId}`);

    appAddr = addr

    // Initial funding
    const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: ACCOUNT.addr,
      suggestedParams: await appClient.getSuggestedParams(),
      to: appAddr,
      amount: 10 * 1_000_000,
    });
    await appClient.client.sendRawTransaction(ptxn.signTxn(ACCOUNT.sk)).do();
    await algosdk.waitForConfirmation(appClient.client, ptxn.txID(), 4);
    console.log("Funded app");

    // Opt account into app
    await appClient.optIn();
    console.log("Opted in")
  }else{
    appAddr = algosdk.getApplicationAddress(APP_ID);
  }


  // Call coin flip
  console.log("Flipping coin")
  const sp = await appClient.client.getTransactionParams().do();
  const round = Math.floor((sp.firstRound + 16) / 8) * 8;
  await appClient.flip_coin({
    bet_payment: algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: ACCOUNT.addr,
      suggestedParams: sp,
      to: appAddr,
      amount: 1 * 1_000_000,
    }),
    round: BigInt(round),
    heads: true,
  });

  const waitRound = round + 11;
  console.log(`Waiting for round: ${waitRound}`)
  while (true) {
    const sp = await appClient.client.getTransactionParams().do();
    if (sp.firstRound > waitRound) {
      break;
    }
    console.log(`at round: ${sp.firstRound}`);
    await new Promise(f => setTimeout(f, 4000));
  }

  console.log("Settling...")
  const feePaySp = await appClient.client.getTransactionParams().do();
  feePaySp.flatFee = true
  feePaySp.fee = 3000
  const result = await appClient.settle({}, {suggestedParams: feePaySp})
  console.log(result.value)

})();
