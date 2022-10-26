from time import sleep
from algosdk.mnemonic import *
from algosdk.future import transaction
from algosdk.atomic_transaction_composer import *
from algosdk.logic import get_application_address
from application import *
from beaker import *


ALGOD_HOST = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""


ACCOUNT_MNEMONIC = "tenant helmet motor sauce appear buddy gloom park average glory course wire buyer ostrich history time refuse room blame oxygen film diamond confirm ability spirit"
#ACCOUNT_MNEMONIC = ""
ACCOUNT_ADDRESS = to_public_key(ACCOUNT_MNEMONIC)
ACCOUNT_SECRET = to_private_key(ACCOUNT_MNEMONIC)
ACCOUNT_SIGNER = AccountTransactionSigner(ACCOUNT_SECRET)

# TODO uncomment this if you want to use the currently deployed coin-flipper app on testnet
APP_ID = 115057669 
#APP_ID = 0

WAIT_DELAY = 11 


def demo(app_id: int = 0):
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_HOST)

    # Create  an app client for our app
    app_client = client.ApplicationClient(
        algod_client, CoinFlipper(), signer=ACCOUNT_SIGNER, app_id=app_id
    )

    # If no app id, we need to create it
    if app_id == 0:
        app_id, app_addr, _ = app_client.create()
        print(f"Created app at {app_id} {app_addr}")
        app_client.fund(5 * consts.algo)
        print("Funded app")
        app_client.opt_in()
        print("Opted in")
    else:
        app_addr = get_application_address(app_id)

    print(f"Current app state:{app_client.get_application_state()}")

    acct_state = app_client.get_account_state()

    # We don't have a bet yet
    if "commitment_round" not in acct_state:
        sp = algod_client.suggested_params()

        # Call coin flip to reserve randomness in the future
        print(f"Flipping coin :crossed_fingers:")
        result = app_client.call(
            CoinFlipper.flip_coin,
            bet_payment=TransactionWithSigner(
                txn=transaction.PaymentTxn(ACCOUNT_ADDRESS, sp, app_addr, consts.algo),
                signer=ACCOUNT_SIGNER,
            ),
            heads=True,
        )
        round = result.return_value
    else:
        # We have a bet
        round = acct_state["commitment_round"]

    print(f"Bet placed for round: {round}")

    # wait an extra few rounds to make sure its available
    wait_round = round + 5

    sp = algod_client.suggested_params()
    current_round = sp.first
    while current_round<wait_round:
        print(f"Currently at round {current_round}")
        algod_client.status_after_block(current_round)
        current_round += 1

    print("Settling...")
    sp = algod_client.suggested_params()
    sp.flat_fee = True
    sp.fee = 2000  # cover this and 1 inner transaction
    result = app_client.call(
        CoinFlipper.settle, bettor=ACCOUNT_ADDRESS, suggested_params=sp
    )
    print(f"Results: {result.return_value}")


if __name__ == "__main__":
    demo(app_id=APP_ID)
