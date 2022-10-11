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
import { AppBar, Box, Button, Grid, Input, Toolbar } from "@mui/material";

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
  const [appId, setAppId] = useState<number>(0);

  // Setup config for client/network. 
  const [apiProvider, setApiProvider] = useState(APIProvider.Sandbox);
  const [network, setNetwork] = useState(Network.SandNet);
  // Init our algod client
  const algodClient = getAlgodClient(apiProvider, network);

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
    }else if (SessionWalletManager.connected(network) && SessionWalletManager.address(network) !== appClient.sender){
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

  // Deploy the app on chain
  async function createApp() {
    const {appId} = await appClient.create();
    setAppId(appId);
    alert(`Created app: ${appId}`);
  }

  // Call the greet function
  async function greet() {
    //const ta = document.getElementById("name") as HTMLTextAreaElement;
    //const result = await appClient.hello({ name: ta.value });
    //alert(result.value);
  }

  // The two actions we allow
  const action = !appId ? (
    <Button variant="outlined" onClick={createApp}>
      Create App
    </Button>
  ) : (
    <div>
      <Box>
        <Input type="text" id="name" placeholder="what is your name?"></Input>
      </Box>
      <Box marginTop="10px">
        <Button variant="outlined" onClick={greet}>
          Greet
        </Button>
      </Box>
    </div>
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
        justifyContent="center"
        alignItems="center"
      >
        <Grid item lg>
          <Box margin="10px">{action}</Box>
        </Grid>
      </Grid>
    </div>
  );
}
