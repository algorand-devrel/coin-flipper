from typing import Final
from pyteal import *
from beaker import *


class CoinFlipper(Application):
    """
    Allows user to flip a coin, choosing heads or tails and some future round to settle.

    If the user guesses correctly, their bet is doubled and paid out to them.
    """

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
        """called to place a bet on the outcome of a coin flip

        Args:
            payment: Algo payment transaction held in escrow until settlement
            round: Uint64 representing the round to claim randomness for (must be multiple of 8 and in the future)
            heads: boolean representing heads or tails

        """
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
        """allows settlement of a bet placed during `flip_coin`

        Args:
            beacon_app: App ref for random oracle beacon

        Returns:
            A string with the result of the bet
        """
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
        """pays out the bet * 2 in the case the user guessed correctly"""
        return InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Txn.sender(),
                TxnField.amount: self.bet * Int(2),  # double the money, double the fun
            }
        )

    @internal(TealType.bytes)
    def get_randomness(self):
        """requests randomness from random oracle beacon for requested round"""
        return Seq(
            # Prep arguments
            (round := abi.Uint64()).set(self.commitment_round[Txn.sender()]),
            (user_data := abi.make(abi.DynamicArray[abi.Byte])).set([]),
            # Get randomness from oracle
            InnerTxnBuilder.ExecuteMethodCall(
                app_id=self.beacon_app_id,
                method_signature="must_get(uint64,byte[])byte[]",
                args=[round, user_data],
            ),
            # Remove first 4 bytes (ABI return prefix)
            # and return the rest
            Suffix(InnerTxn.last_log(), Int(4)),
        )


if __name__ == "__main__":
    CoinFlipper().dump("./artifacts")
