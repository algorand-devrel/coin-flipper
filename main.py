from time import sleep
from algosdk.mnemonic import *
from algosdk.future import transaction
from algosdk.atomic_transaction_composer import *
from algosdk.logic import get_application_address
from application import *
from beaker import *


ALGOD_HOST = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""

# Generated account with algos on Testnet
ACCOUNT_MNEMONIC = "tenant helmet motor sauce appear buddy gloom park average glory course wire buyer ostrich history time refuse room blame oxygen film diamond confirm ability spirit"
ACCOUNT_ADDRESS = to_public_key(ACCOUNT_MNEMONIC)
ACCOUNT_SECRET = to_private_key(ACCOUNT_MNEMONIC)
ACCOUNT_SIGNER = AccountTransactionSigner(ACCOUNT_SECRET)


def demo(app_id: int = None):
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_HOST)

    # Create  an app client for our app
    app_client = client.ApplicationClient(
        algod_client, CoinFlipper(), signer=ACCOUNT_SIGNER, app_id=app_id
    )

    # If no app id, we need to create it
    if app_id is None:
        app_id, app_addr, _ = app_client.create()
        print(f"Created app at {app_id} {app_addr}")
        app_client.fund(10 * consts.algo)
        print("Funded app")
        app_client.opt_in()
        print("Opted in")
    else:
        app_addr = get_application_address(app_id)

    sp = algod_client.suggested_params()

    # Figure out what round to pick, making sure its a multiple of 8
    # Give enough time for at least 1 full interval
    round = ((sp.first + 16) // 8) * 8
    # We wait for the round + 11 rounds just to be sure its available
    wait_round = round + 11

    # Call coin flip to reserve randomness in the future
    print(f"Flipping coin, will find out if we won at round {wait_round}")
    app_client.call(
        CoinFlipper.flip_coin,
        bet_payment=TransactionWithSigner(
            txn=transaction.PaymentTxn(ACCOUNT_ADDRESS, sp, app_addr, consts.algo),
            signer=ACCOUNT_SIGNER,
        ),
        round=round,
        heads=True,
    )

    print(f"Waiting for round: {wait_round}")
    while True:
        sp = algod_client.suggested_params()
        print(f"Currently at round {sp.first}")
        if sp.first > (round + 11):
            break
        sleep(4)

    # Cover inner transactions
    print("Settling...")

    sp = algod_client.suggested_params()
    sp.flat_fee = True
    sp.fee = 2000  # cover this and 1 inner transaction
    result = app_client.call(CoinFlipper.settle, suggested_params=sp)

    print(f"Results: {result.return_value}")


if __name__ == "__main__":
    demo(app_id=111784038)
