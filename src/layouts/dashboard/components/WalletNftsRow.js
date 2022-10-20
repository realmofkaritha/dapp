import useAccountNfts from "queries/useAccountNfts";
import NftsRow from "./NftsRow";
import contract from "contract/contract";
import { TokenPayment } from "@elrondnetwork/erdjs";
import { useGetAccount } from "@elrondnetwork/dapp-core/hooks";
import { Address } from "@elrondnetwork/erdjs";

import { sendTransactions } from "@elrondnetwork/dapp-core/services";

export default function WalletNftsRow() {
  const { data, isLoading, isError } = useAccountNfts();
  const { address } = useGetAccount();
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
    return "Error loading walelt NFTs";
  }

  return (
    <NftsRow
      nfts={data}
      title="NFTs in your wallet"
      actionButtonTitle="Stake {{n}}"
      nftActionButtonTitle="Select to stake"
      selectedAction={onStake}
    />
  );
}
