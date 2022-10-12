import React from "react";
import {
  Slider,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

export type BetFormData = {
  amount: number;
  heads: boolean;
};

export type BetFormProps = {
  flipCoin(bfd: BetFormData): void;
};

const DEFAULT_BET = 25
export function BetForm(bfp: BetFormProps) {
  const [betAmount, setBetAmount] = React.useState<number>(DEFAULT_BET);
  const [heads, setHeads] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  async function submit() {
    setLoading(true);
    await bfp.flipCoin({ heads: heads, amount: betAmount });
    setLoading(false);
  }

  function updateBet(e: any) {
    setBetAmount(e.target.value);
  }
  function updateHeads(e: any) {
    setHeads(e.target.checked);
  }

  return (
    <div>
      <Box>
        <h3>Bet on the flip of a coin</h3>
        <FormGroup>
          <FormControlLabel
            labelPlacement="top"
            control={
              <Slider
                min={5}
                max={1000}
                size="small"
                defaultValue={DEFAULT_BET}
                step={5}
                aria-label="Small"
                valueLabelDisplay="auto"
                onChange={updateBet}
              />
            }
            label="Bet in mAlgos"
          />
          <FormControlLabel
            labelPlacement="top"
            control={<Switch id="heads" onChange={updateHeads} />}
            label={heads?"Heads":"Tails"}
          />
          <LoadingButton variant="outlined" onClick={submit} loading={loading}>
            Flip Coin
          </LoadingButton>
        </FormGroup>
      </Box>
    </div>
  );
}
