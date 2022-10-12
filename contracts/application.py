from typing import Final
from pyteal import *
from beaker import *

class BetResult(abi.NamedTuple):
    won: abi.Field[abi.Bool]
    amount: abi.Field[abi.Uint64]

class CoinFlipper(Application):
    """
    Allows user to flip a coin, choosing heads or tails and some future round to settle.

    If the user guesses correctly, their bet is doubled and paid out to them.
    """

    ###
    # App state values
    ###
    beacon_app_id: Final[ApplicationStateValue] = ApplicationStateValue(
        TealType.uint64,
        default=Int(110096026),
        descr="The App ID of the randomness beacon. Should adhere to ARC-21",
    )
    min_bet: Final[ApplicationStateValue] = ApplicationStateValue(
        TealType.uint64,
        default=consts.MilliAlgos(5),
        descr="The minimum bet for flipping a coin",
    )
    max_bet: Final[ApplicationStateValue] = ApplicationStateValue(
        TealType.uint64,
        default=consts.Algos(1),
        descr="The maximum bet for flipping a coin",
    )
    bets_outstanding: Final[ApplicationStateValue] = ApplicationStateValue(
        TealType.uint64,
        default=Int(0),
        descr="Counter to keep track of how many bets are outstanding.",
    )

    ###
    # Account state values
    ###
    commitment_round: Final[AccountStateValue] = AccountStateValue(
        TealType.uint64,
        descr="The round this account committed to, to use for future randomness",
    )
    bet: Final[AccountStateValue] = AccountStateValue(
        TealType.uint64, descr="The amount of the bet, to be doubled on win"
    )
    heads: Final[AccountStateValue] = AccountStateValue(
        TealType.uint64, descr="The bet outcome, 0 for tails, >0 for heads"
    )


    ###
    # API Methods
    ###
    @external
    def flip_coin(
        self, bet_payment: abi.PaymentTransaction, round: abi.Uint64, heads: abi.Bool
    ):
        """called to place a bet on the outcome of a coin flip

        Args:
            payment: Algo payment transaction held in escrow until settlement
            round: Uint64 representing the round to claim randomness for (must be for a future round)
            heads: boolean representing heads or tails

        """
        return Seq(
            Assert(
                bet_payment.get().amount() >= self.min_bet,
                bet_payment.get().amount() <= self.max_bet,
                comment="payment must be >= 5mA and < 1A",
            ),
            Assert(
                bet_payment.get().receiver() == self.address,
                comment="payment must to the contract address",
            ),
            Assert(
                round.get() > Global.round(),
                round.get() < Global.round() + Int(10),
                comment="round requested must be at least 1 round in the future and no more than 10 rounds in the future",
            ),
            Assert(
                Not(self.commitment_round.exists()),
                comment="there is already a bet outstanding",
            ),
            # Set fields for this sender
            self.commitment_round[Txn.sender()].set(round.get()),
            self.bet[Txn.sender()].set(bet_payment.get().amount()),
            self.heads[Txn.sender()].set(heads.get()),
            self.bets_outstanding.increment(),
        )

    @external
    def settle(
        self,
        bettor: abi.Account,
        beacon_app: abi.Application = beacon_app_id,
        *,
        output: BetResult,
    ):
        """allows settlement of a bet placed during `flip_coin`

        Args:
            beacon_app: App ref for random oracle beacon

        Returns:
            A string with the result of the bet
        """

        won = abi.Bool()
        amount = abi.Uint64()

        return Seq(
            # Get the randomness back
            (randomness := abi.DynamicBytes()).decode(
                self.get_randomness(self.commitment_round[bettor.address()])
            ),
            # If they guessed right, payout
            # Take the very first bit and use it for heads/tails
            won.set(self.heads == GetBit(randomness.get(), Int(0))),
            If(won.get()).Then(
                self.payout(bettor.address()), 
                amount.set(self.bet[bettor.address()] * Int(2)),
                output.set(won, amount)
            )
            .Else(
                amount.set(self.bet[bettor.address()]),
                output.set(won, amount)
            ),
            # Reset state
            self.commitment_round[bettor.address()].delete(),
            self.bet[bettor.address()].delete(),
            self.heads[bettor.address()].delete(),
            # Decrement counter
            self.bets_outstanding.decrement(),
        )

    @internal(TealType.none)
    def payout(self, addr):
        """pays out the bet * 2 in the case the user guessed correctly"""
        return InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: addr,
                TxnField.amount: self.bet[addr] * Int(2),  # double the money, double the fun
            }
        )

    @internal(TealType.bytes)
    def get_randomness(self, acct_round: Expr):
        """requests randomness from random oracle beacon for requested round"""
        return Seq(
            # Prep arguments
            (round := abi.Uint64()).set(acct_round),
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

    ###
    # App lifecycle
    ###

    @create
    def create(self):
        return self.initialize_application_state()

    @external(authorize=Authorize.only(Global.creator_address()))
    def configure(self, app_id: abi.Uint64, min_bet: abi.Uint64, max_bet: abi.Uint64):
        """Allows configuration of the application state values

        Args:
            app_id: The uint64 app id of the beacon app to use
            min_bet: The uint64 minimum bet allowed, specified in base algo units
            max_bet: the uint64 maximum bet allowed, specified in base algo units
        """
        return Seq(
            Assert(min_bet.get() < max_bet.get(), comment="min bet must be < max bet"),
            self.beacon_app_id.set(app_id.get()),
            self.min_bet.set(min_bet.get()),
            self.max_bet.set(max_bet.get()),
        )

    @delete(authorize=Authorize.only(Global.creator_address()))
    def delete(self):
        return Seq(
            # Make sure we dont have any outstanding bets
            Assert(self.bets_outstanding == Int(0)),
            # Close out algo balance to app creator
            InnerTxnBuilder.Execute(
                {
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.receiver: Txn.sender(),
                    TxnField.amount: Int(0),
                    TxnField.close_remainder_to: Txn.sender(),
                }
            ),
            Approve(),
        )

    @update(authorize=Authorize.only(Global.creator_address()))
    def update(self):
        return Approve()

    @opt_in
    def opt_in(self):
        return Approve()

    # Clear/close out ok, but app keeps algos
    # otherwise user could see that they'd lose a bet
    # and try to cancel before settlement
    @clear_state
    def clear_state(self):
        return Seq(
            If(self.commitment_round[Txn.sender()] > Int(0)).Then(
                self.bets_outstanding.decrement()
            ),
            Approve(),
        )

    @close_out
    def close_out(self):
        return Seq(
            If(self.commitment_round[Txn.sender()] > Int(0)).Then(
                self.bets_outstanding.decrement()
            ),
            Approve(),
        )


if __name__ == "__main__":
    CoinFlipper().dump("./artifacts")
