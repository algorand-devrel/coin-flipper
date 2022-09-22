Coin Flipper using Random Oracle
---------------------------------

A demo of using the Randomness Oracle Beacon Application to allow betting on a coin flip.


## Background

With the release of AVM7 including the `vrf_verify` opcode, a smart contract can take in some proof computed through a VRF process off chain and verify that it was computed honestly.

The application that verifies and stores the randomness can be treated as an oracle and other applications may call it to get the random value for a given round.

The Oracle application in this example is on testnet with app id `​110096026` and adheres to [ARC-21](https://arc.algorand.foundation/ARCs/arc-0021)

To read more about how VRF works and best practices when dealing with on-chain randomness, please see [this post](https://developer.algorand.org/articles/usage-and-best-practices-for-randomness-beacon/)



## Demo
To run the demo, in either Python or Typescript, clone down the repo and `cd` into it
```sh
$ git clone git@github.com:algorand-devrel/coin-flipper.git
$ cd coin-flipper
```

### Python

To run the demo with python, create a virtual environment, source it, and install requirements

```
$ python -m venv .venv
$ source .venv/bin/activate
(.venv) $ pip install -r requirements.txt
```

Edit the main.py file to add your funded testnet account's mnemonic and run the program

```sh
(.venv) $ python main.py
```

This will create the application, fund it, opt your user in, and call the coin flip endpoint (choosing heads) then after some rounds will try to settle the bet.

### Typescript 

To run the demo with typescript, cd into the `js` directory and install the requirements

```sh
$ cd js
$ npm install
```

Edit the `src/index.ts` file to add your funded testnet account's mnemonic and run the demo

```sh
npm run demo
```

This will create the application, fund it, opt your user in, and call the coin flip endpoint (choosing heads) then after some rounds will try to settle the bet.


