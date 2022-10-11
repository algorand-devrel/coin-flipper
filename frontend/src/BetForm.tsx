import React from "react";
import {
  Slider,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";

export type BetFormData = {
  amount: number;
  heads: boolean;
};

export type BetFormProps = {
  flipCoin(bfd: BetFormData): void;
};

export function BetForm(bfp: BetFormProps) {
  const [betAmount, setBetAmount] = React.useState<number>(3);
  const [heads, setHeads] = React.useState<boolean>(true);
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
        <FormGroup>
          <FormControlLabel
            labelPlacement="top"
            control={
              <Slider
                min={5}
                max={1000}
                size="small"
                defaultValue={10}
                step={1}
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
            label="Heads"
          />
        </FormGroup>
      </Box>
      <Box marginTop="10px">
        <Button variant="outlined" onClick={submit}>
          FlipCoin
        </Button>
      </Box>
    </div>
  );
}
