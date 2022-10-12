import React from "react";
import algosdk from 'algosdk'
import {
  Box,
  LinearProgress,
} from "@mui/material";

import {LoadingButton} from "@mui/lab"

export type SettleBetFormProps = {
  round: number;
  algodClient: algosdk.Algodv2
  settleBet(): void;
};

export function SettleBetForm(bfp: SettleBetFormProps) {
  const [currentRound, setCurrentRound] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [disabled, setDisabled] = React.useState<boolean>(true);

  const {round, algodClient, settleBet} = bfp;

  const waitRounds = 10
  const waitRound = round + waitRounds;

  React.useEffect(()=>{
    if(currentRound === 0) updateCurrentRound()
    if(currentRound >= waitRound) setDisabled(false)
  }, [currentRound])

  async function updateCurrentRound(): Promise<void> {
    const sp = await algodClient.getTransactionParams().do();
    let lastSeen = sp.firstRound;
    setCurrentRound(lastSeen);
    while (lastSeen < waitRound) {
      await algodClient.statusAfterBlock(lastSeen).do();
      setCurrentRound(lastSeen);
      lastSeen += 1;
    }
    setCurrentRound(lastSeen);
  }

  function normalizeValue(rnd: number): number {
    if(rnd>=waitRound) return 100;
    if(rnd === 0) return 0;
    return 100 - ((waitRound - rnd)*waitRounds)
  }

  async function submit() {
    setLoading(true);
    await settleBet();
    setLoading(false);
  }

  return (
    <div>
      <h3>Waiting for round {waitRound} (current round {currentRound})</h3>
      <Box>
        <LinearProgress variant='determinate' value={normalizeValue(currentRound)}></LinearProgress>
      </Box>
      <Box marginTop="10px">
        <LoadingButton variant="outlined" onClick={submit} disabled={disabled} loading={loading}>
          Settle
        </LoadingButton>
      </Box>
    </div>
  );
}
