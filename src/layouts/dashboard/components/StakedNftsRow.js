import { useTrackTransactionStatus } from "@elrondnetwork/dapp-core/hooks";
import { sendTransactions } from "@elrondnetwork/dapp-core/services";
import SoftButton from "components/SoftButton";
import contract from "contract/contract";
import useAccountNfts from "queries/useAccountNfts";
import useStakedNfts from "queries/useStakedNfts";
import { useCallback, useState } from "react";
import NftsRow from "./NftsRow";

export default function StakedNftsRow() {
  const { data, isLoading, isError, refetch } = useStakedNfts();
  const { refetch:refetchAccountNfts } = useAccountNfts(process.env.REACT_APP_NFT_COLLECTION);

  const [sid, setsid] = useState();
  useTrackTransactionStatus({transactionId: sid, onSuccess:()=>{
    refetch();
    refetchAccountNfts();
  }});

  const reward = data?.reward || "";

  const extraStakeButton = useCallback(() => {
    return data?.hasReward ? (
      <SoftButton size="small" onClick={onClaim}>
        Claim {reward}
      </SoftButton>
    ) : null;
  }, [reward]);

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

    const { sessionId } = await sendTransactions({
      transactions: [transactionFinal],
      transactionsDisplayInfo: {
        processingMessage: "Unstaking",
        errorMessage: "An error has occured during the unstake",
        successMessage: "Unstake successful",
        transactionDuration: 10000,
      },
    });

    setsid(sessionId);
  };

  const onClaim = async () => {
    const transaction = contract.methods.claimReward().withGasLimit(20_000_000).withChainID("D");

    const transactionFinal = transaction.buildTransaction();

    await sendTransactions({
      transactions: [transactionFinal],
      transactionsDisplayInfo: {
        processingMessage: "Claiming",
        errorMessage: "An error has occured during the claim",
        successMessage: "Claim successful",
        transactionDuration: 10000,
      },
    });
  };

  if (isLoading) {
    return <span>Loading</span>;
  }

  if (isError) {
    return <span>Error loading staked SFTs</span>;
  }

  return (
    <NftsRow
      nfts={data.nfts.map((n) => ({ ...n, reward: 10 }))}
      title="Staked SFTs"
      actionButtonTitle="Unstake {{n}}"
      nftActionButtonTitle="Select to unstake"
      selectedAction={onUnstake}
      extraActionButtons={extraStakeButton}
    />
  );
}
