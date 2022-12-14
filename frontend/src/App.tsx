import algosdk from "algosdk";
import { useState, useEffect } from "react";
import { Network, APIProvider, getAlgodClient } from "beaker-ts/lib/clients";
import {
  PlaceHolderSigner,
  SessionWalletManager,
  SessionWalletData,
} from "beaker-ts/lib/web";
import { CoinFlipper } from "./coinflipper_client";

import WalletSelector from "./WalletSelector";
import { AppBar, Box, Button, Grid, Toolbar } from "@mui/material";
import { BetForm, BetFormData } from "./BetForm";
import { SettleBetForm } from "./SettleBetForm";
import { LoadingButton } from "@mui/lab";

// AnonClient can still allow reads for an app but no transactions
// can be signed
const AnonClient = (client: algosdk.Algodv2, appId: number): CoinFlipper => {
  return new CoinFlipper({
    client: client,
    signer: PlaceHolderSigner,
    sender: "",
    appId: appId,
  });
};

export default function App() {
  // Start with no app id for this demo, since we allow creation
  // Otherwise it'd come in as part of conf
  const [appId, setAppId] = useState<number>(115885218);
  const [appAddress, setAppAddress] = useState<string>(
    algosdk.getApplicationAddress(appId)
  );

  // Setup config for client/network.
  const [apiProvider, setApiProvider] = useState(APIProvider.AlgoNode);
  const [network, setNetwork] = useState(Network.TestNet);

  // Init our algod client
  const algodClient = getAlgodClient(apiProvider, network);

  const [betRound, setBetRound] = useState<number>(0);
  const [optedIn, setOptedIn] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  // Set up user wallet from session
  const [accountSettings, setAccountSettings] = useState<SessionWalletData>(
    SessionWalletManager.read(network)
  );

  // Init our app client
  const [appClient, setAppClient] = useState<CoinFlipper>(
    AnonClient(algodClient, appId)
  );

  // If the account info, client, or app id change
  // update our app client
  useEffect(() => {
    // Bad way to track connected status but...
    if (accountSettings.data.acctList.length == 0 && appClient.sender !== "") {
      setAppClient(AnonClient(algodClient, appId));
    } else if (
      SessionWalletManager.connected(network) &&
      SessionWalletManager.address(network) !== appClient.sender
    ) {
      setAppClient(
        new CoinFlipper({
          client: algodClient,
          signer: SessionWalletManager.signer(network),
          sender: SessionWalletManager.address(network),
          appId: appId,
        })
      );
    }
  }, [accountSettings, appId, algodClient]);

  function connected(): boolean {
    return accountSettings.data.acctList.length>0
  }

  function account(): string {
    return connected()?SessionWalletManager.address(network):""
  }


  // Check for an update bet round
  useEffect(() => {
    if (!connected()) return setBetRound(0)
    if(betRound !== 0) return;
    getBetRound().then((round)=>{setBetRound(round)})
  }, [accountSettings]);

  async function getBetRound(): Promise<number> {
    try {
      const acctState = await appClient.getAccountState(account()) 
      if ("commitment_round" in acctState)
        return acctState["commitment_round"] as number;
    }catch(err) { }
    return 0;
  }

  // Check for an update opted in status
  useEffect(() => {
    const addr = account()
    if (addr === "") return setOptedIn(false);

    algodClient
      .accountApplicationInformation(addr, appId)
      .do()
      .then((data) => {
        setOptedIn('app-local-state' in data)
      })
      .catch((err) => { setOptedIn(false); });

  }, [accountSettings]);

  // Deploy the app on chain
  async function createApp() {
    setLoading(true)
    const { appId, appAddress } = await appClient.create();
    setAppId(appId);
    setAppAddress(appAddress);

    console.log(`Created app: ${appId}`);

    // Initial funding for app account
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: appClient.sender,
        suggestedParams: await appClient.getSuggestedParams(),
        to: appAddress,
        amount: 10 * 1_000_000,
      }),
      signer: appClient.signer,
    });
    await atc.execute(algodClient, 4);
    console.log("Funded app");
    setLoading(false)
  }

  // Opt account into app
  async function optIn() {
    setLoading(true);
    await appClient.optIn();
    setOptedIn(true);
    setLoading(false);
  }

  async function updateApp(){
    await appClient.update()
  }
  async function deleteApp(){
    await appClient.delete()
  }

  async function closeOut(){
    console.log("OptingOut...");
    setLoading(true)
    await appClient.closeOut();
    setOptedIn(false)
    setBetRound(0);
    setLoading(false)
  }

  async function flipCoin(bfd: BetFormData) {
    console.log(`Flip coin with data: `, bfd);

    try {
      const sp = await appClient.client.getTransactionParams().do();

      const result = await appClient.flip_coin({
        bet_payment: algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: appClient.sender,
          suggestedParams: sp,
          to: appAddress,
          amount: bfd.amount * 1_000,
        }),
        heads: bfd.heads,
      });


       setBetRound(Number(result.returnValue));
    } catch (err) {
      console.error(err);
    }
  }

  async function settleBet() {
    console.log("Settling...");
    const feePaySp = await appClient.getSuggestedParams(undefined, 1);
    const result = await appClient.settle(
      { bettor: appClient.sender },
      { suggestedParams: feePaySp }
    );
    setBetRound(0);
    const outcome = result.value?.won ? "Won!":"Lost :("
    const amount = result.value?.amount
    const msg = `You ${outcome} (${amount})`
    alert(msg);
  }


  // We allow creation, opt in, bet, settle
  const action = !appId ? (
    <Button variant="outlined" onClick={createApp}>
      Create App
    </Button>
  ) : !optedIn ? (
    <LoadingButton loading={loading} variant="outlined" onClick={optIn}>
      Opt In to app
    </LoadingButton>
  ) : !betRound ? (
    <BetForm flipCoin={flipCoin}></BetForm>
  ) : (
    <SettleBetForm
      round={betRound}
      settleBet={settleBet}
      algodClient={algodClient}
    ></SettleBetForm>
  );

  // The app ui
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar variant="regular">
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            {/* 
              Adding our wallet selector here with hooks to acct settings 
              lets us provide an input for logging in with different wallets
              and updating session and in memory state
            */}
            <WalletSelector
              network={network}
              accountSettings={accountSettings}
              setAccountSettings={setAccountSettings}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="space-around"
        spacing={6}
        margin="10px"
      >
          <Grid item lg>
            <Box>{action}</Box>
          </Grid>

          <Grid item lg>
            <LoadingButton color="warning" loading={loading} onClick={closeOut}>
              Opt Out of App
            </LoadingButton>
          </Grid>

      </Grid>
    </div>
  );
}
