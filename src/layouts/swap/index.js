// Soft UI Dashboard React examples
import { useGetAccount, useTrackTransactionStatus } from "@elrondnetwork/dapp-core/hooks";
import { sendTransactions } from "@elrondnetwork/dapp-core/services";
import { Address, TokenPayment } from "@elrondnetwork/erdjs/out";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import SoftButton from "components/SoftButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import useAccountNfts from "queries/useAccountNfts";
import { useState } from "react";
import contract from "contract/contract";

function Swap() {
  const { data, isLoading, refetch } = useAccountNfts(process.env.REACT_APP_OLD_COLLECTION);
  const { address } = useGetAccount();
  console.log(data?.length);
  console.log(data);
  const [sid, setsid] = useState();
  useTrackTransactionStatus({
    transactionId: sid,
    onSuccess: () => {
      refetch();
    },
  });

  const onSwap = async () => {
    const payments = data.map((n) => {
      return TokenPayment.nonFungible(n.collection, n.nonce);
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
        processingMessage: "Swapping",
        errorMessage: "An error has occured ",
        successMessage: "Swap successful",
        transactionDuration: 10000,
      },
    });

    setsid(sessionId);
  };

  return (
    <DashboardLayout>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "80vh", overflow: "hidden" }}
        spacing={2}
      >
        {isLoading ? (
          "Loading"
        ) : (
          <>
            <Typography variant="h2">Swap your old NFTs</Typography>
            <Typography>We&apos;ve decided to upgrade our NFTs</Typography>
            {data?.length > 0 ? (
              <>
                <Typography variant="body2">Click the button bellow</Typography>
                <SoftButton size="large" variant="gradient" color="primary" onClick={onSwap}>
                  Swap
                </SoftButton>
              </>
            ) : (
              <Typography variant="body2">You don&apos;t have any old NFTs</Typography>
            )}
          </>
        )}
      </Stack>
    </DashboardLayout>
  );
}

export default Swap;
