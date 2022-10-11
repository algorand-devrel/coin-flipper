import algosdk from "algosdk";
import * as bkr from "beaker-ts";
import { CoinFlipper } from "./coinflipper_client";

// TODO: uncomment this if you want to use the testnet one, but you'll need also make sure the account is opted in 
//const APP_ID: number = 111923397;
const APP_ID: number = 0;

const ACCOUNT_MNEMONIC = "";
const ACCOUNT = algosdk.mnemonicToSecretKey(ACCOUNT_MNEMONIC);
const ACCOUNT_SIGNER = algosdk.makeBasicAccountTransactionSigner(ACCOUNT);


async function demo(){
  const appClient = new CoinFlipper({
    client: new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", ""),
    signer: ACCOUNT_SIGNER,
    sender: ACCOUNT.addr,
    appId: APP_ID,
  });

  let appAddr; 

  if(APP_ID === 0){
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

  let round = 0;
  const acctState = await appClient.getAccountState();
  console.log(`Current account state: ${acctState}`)
  if(!("commitment_round" in acctState)){
    // Call coin flip
    console.log("Flipping coin")
    const sp = await appClient.client.getTransactionParams().do();

    round = sp.firstRound + 3;

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

  }else{
    round = acctState["commitment_round"] as number
  }

  const waitRound = round + 11;
  console.log(`Waiting for round: ${waitRound}`)

  const sp = await appClient.client.getTransactionParams().do()
  let currentRound = sp.firstRound
  while (currentRound<waitRound) {
    await appClient.client.statusAfterBlock(currentRound).do();
    currentRound += 1
    console.log(`at round: ${currentRound}`);
  }

  console.log("Settling...")
  const feePaySp = await appClient.client.getTransactionParams().do();
  feePaySp.flatFee = true
  feePaySp.fee = 2000
  const result = await appClient.settle({bettor: ACCOUNT.addr}, {suggestedParams: feePaySp})
  console.log(result.value)
}


(async function () { await demo() })();
