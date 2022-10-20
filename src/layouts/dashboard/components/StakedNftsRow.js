import { useGetAccount } from "@elrondnetwork/dapp-core/hooks";
import { sendTransactions } from "@elrondnetwork/dapp-core/services";
import { Address, TokenPayment } from "@elrondnetwork/erdjs/out";
import SoftButton from "components/SoftButton";
import contract from "contract/contract";
import useStakedNfts from "queries/useStakedNfts";
import { useCallback } from "react";
import NftsRow from "./NftsRow";

export default function StakedNftsRow() {
  const { data, isLoading, isError } = useStakedNfts();
  const { address } = useGetAccount();

  const extraStakeButton = useCallback(() => {
    return <SoftButton size="small">Claim All</SoftButton>;
  }, []);

  const onUnstake = async (nfts) => {
    const totals = {};
    nfts.forEach((n) => {
      const [identifier] = n.split("||");
      if (!totals[identifier]) {
        totals[identifier] = 1;
      } else {
        totals[identifier]++;
      }
    });
    const payments = Object.keys(totals).map((n) => {
      const [a, b, nonce] = n.split("-");
      return {
        token_identifier: `${a}-${b}`,
        token_nonce: parseInt(nonce, 16),
        amount: totals[n],
      };
    });

    const transaction = contract.methods
      .unstakeSfts(payments)
      .withGasLimit(20_000_000)
      .withChainID("D");

    const transactionFinal = transaction.buildTransaction();

    await sendTransactions({
      transactions: [transactionFinal],
      transactionsDisplayInfo: {
        processingMessage: "Staking",
        errorMessage: "An error has occured during the stake",
        successMessage: "Transaction successful",
        transactionDuration: 10000,
      },
    });
  };

  if (isLoading) {
    return "Loading";
  }

  if (isError) {
    return "Error loading staked NFTs";
  }

  return (
    <NftsRow
      nfts={data.nfts.map((n) => ({ ...n, reward: 10 }))}
      title="Staked NFTs"
      actionButtonTitle="Unstake {{n}}"
      nftActionButtonTitle="Select to unstake"
      selectedAction={onUnstake}
      extraActionButtons={extraStakeButton}
    />
  );
}
