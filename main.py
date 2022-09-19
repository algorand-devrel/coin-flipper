from time import sleep
from algosdk.dryrun_results import DryrunResponse
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

beacon_id = 110096026

def demo(app_id: int = None):
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_HOST)

    # Create  an app client for our app
    app_client = client.ApplicationClient(
        algod_client,
        CoinFlipper(),
        signer=ACCOUNT_SIGNER,
        app_id=app_id
    )
    if app_id is None:
        app_id, app_addr, _ = app_client.create()
        print(f"Created app at {app_id} {app_addr}")
        app_client.fund(10*consts.algo)
        print("Funded app")
        app_client.opt_in()
        print("Opted in")
    else:
        app_addr = get_application_address(app_id)


    sp = algod_client.suggested_params()

    round = ((sp.first + 16) // 8) * 8

    print(f"Flipping coin, will find out if we won at round {round}")
    app_client.call(
        CoinFlipper.flip_coin,
        bet_payment=TransactionWithSigner(
            txn=transaction.PaymentTxn(ACCOUNT_ADDRESS, sp, app_addr, consts.algo),
            signer=ACCOUNT_SIGNER,
        ),
        round=round,
        heads=True,
    )

    print(f"Waiting for round: {round+11}")
    while True:
        sp = algod_client.suggested_params()
        print(f"Currently at round {sp.first}")

        if sp.first > (round + 11):
            break

        sleep(4)

    # Cover inner transactions
    sp = algod_client.suggested_params()
    sp.flat_fee = True
    sp.fee = 3000
    print("Settling...")
    result = app_client.call(CoinFlipper.settle, suggested_params=sp)
    print(result.return_value)

if __name__ == "__main__":
    demo(app_id=111784038)