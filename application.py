from mimetypes import common_types
from typing import Final
from pyteal import *
from beaker import *


class CoinFlipper(Application):

    commitment_round: Final[AccountStateValue] = AccountStateValue(TealType.uint64)
    bet: Final[AccountStateValue] = AccountStateValue(TealType.uint64)
    heads: Final[AccountStateValue] = AccountStateValue(TealType.uint64)

    min_bet: Final[Int] = consts.MilliAlgos(5)
    round_interval: Final[Int] = Int(8)

    beacon_app_id: Int = Int(110096026)

    @delete(authorize=Authorize.only(Global.creator_address()))
    def delete(self):
        return Approve()

    @opt_in
    def opt_in(self):
        return Approve()

    @external
    def flip_coin(
        self, bet_payment: abi.PaymentTransaction, round: abi.Uint64, heads: abi.Bool
    ):
        return Seq(
            Assert(
                bet_payment.get().amount() >= self.min_bet,
                comment="payment must be >= 5mA",
            ),
            Assert(
                bet_payment.get().receiver() == self.address,
                comment="payment must to the contract address",
            ),
            Assert(
                round.get() % self.round_interval == Int(0),
                comment="round must be a multiple of 8",
            ),
            Assert(
                round.get() >= (Global.round() + self.round_interval),
                comment="round must be at least 1 interval in the future",
            ),
            Assert(
                Not(self.commitment_round.exists()),
                comment="there is already a commitment outstanding",
            ),
            # Set fields for this sender
            self.commitment_round[Txn.sender()].set(round.get()),
            self.bet[Txn.sender()].set(bet_payment.get().amount()),
            self.heads[Txn.sender()].set(heads.get()),
        )

    @external
    def settle(
        self, beacon_app: abi.Application = beacon_app_id, *, output: abi.String
    ):
        return Seq(
            # Get the randomness back
            (randomness := abi.DynamicBytes()).decode(self.get_randomness()),
            # Take the very first bit and use it for heads/tails
            (is_heads := ScratchVar()).store(GetBit(randomness.get(), Int(0))),
            # If they guessed right, payout
            If(self.heads == is_heads.load())
            .Then(self.payout(), output.set(Bytes("You won!")))
            .Else(output.set(Bytes("You lost :("))),
            # Reset state
            self.commitment_round.delete(),
            self.bet.delete(),
            self.heads.delete(),
        )

    @internal(TealType.none)
    def payout(self):
        return InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Txn.sender(),
                TxnField.amount: self.bet * Int(2),  # double the money, double the fun
                # We'll cover the fee
                #TxnField.fee: Int(0),
            }
        )

    @internal(TealType.bytes)
    def get_randomness(self):
        return Seq(
            (round := abi.Uint64()).set(self.commitment_round[Txn.sender()]),
            (user_data := abi.make(abi.DynamicArray[abi.Byte])).set([]),
            InnerTxnBuilder.ExecuteMethodCall(
                app_id=self.beacon_app_id,
                method_signature="must_get(uint64,byte[])byte[]",
                args=[round, user_data],
            ),
            Suffix(InnerTxn.last_log(), Int(4)),
        )


if __name__ == "__main__":
    CoinFlipper().dump("./artifacts")
