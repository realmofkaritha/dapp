import useAccountNfts from "queries/useAccountNfts";
import NftsRow from "./NftsRow";
import contract from "contract/contract";
import { TokenPayment } from "@elrondnetwork/erdjs";
import { useGetAccount, useTrackTransactionStatus } from "@elrondnetwork/dapp-core/hooks";
import { Address } from "@elrondnetwork/erdjs";

import { sendTransactions } from "@elrondnetwork/dapp-core/services";
import { useState } from "react";
import useStakedNfts from "queries/useStakedNfts";

export default function WalletNftsRow() {
  const { data, isLoading, isError, refetch } = useAccountNfts(process.env.REACT_APP_NFT_COLLECTION);
  const { refetch: refetchStaked } = useStakedNfts();

  const { address } = useGetAccount();
  const [sid, setsid] = useState();
  useTrackTransactionStatus({
    transactionId: sid,
    onSuccess: () => {
      refetchStaked();
      refetch();
    },
  });

  const onStake = async (nfts) => {
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
      return TokenPayment.semiFungible(`${a}-${b}`, parseInt(nonce, 16), totals[n]);
    });

    const transaction = contract.methods
      .stakeSfts([])
      .withGasLimit(20_000_000)
      .withMultiESDTNFTTransfer(payments, new Address(address))
      .withChainID("D");

    const transactionFinal = transaction.buildTransaction();

    const { sessionId } = await sendTransactions({
      transactions: [transactionFinal],
      transactionsDisplayInfo: {
        processingMessage: "Staking",
        errorMessage: "An error has occured during the stake",
        successMessage: "Staking successful",
        transactionDuration: 10000,
      },
    });

    setsid(sessionId);
  };

  if (isLoading) {
    return <span>Loading</span>;
  }

  if (isError) {
    return <span>Error loading walelt SFTs</span>;
  }

  return (
    <NftsRow
      nfts={data}
      title="SFTs in your wallet"
      actionButtonTitle="Stake {{n}}"
      nftActionButtonTitle="Select to stake"
      selectedAction={onStake}
    />
  );
}
