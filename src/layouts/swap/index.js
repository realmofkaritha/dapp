// Soft UI Dashboard React examples
import {
  useGetAccount,
  useGetNetworkConfig,
  useTrackTransactionStatus,
} from "@elrondnetwork/dapp-core/hooks";
import { sendTransactions } from "@elrondnetwork/dapp-core/services";
import { Address, TokenPayment } from "@elrondnetwork/erdjs/out";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import SoftButton from "components/SoftButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import useAccountNfts from "queries/useAccountNfts";
import { useState } from "react";
import contract from "contract/contract";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import NftsRow from "layouts/dashboard/components/NftsRow";

function Swap() {
  const { data, isLoading, refetch } = useAccountNfts(process.env.REACT_APP_OLD_COLLECTION);
  const { address } = useGetAccount();

  const [selectedNfts, setSelectedNfts] = useState([]);
  const network = useGetNetworkConfig();

  const [sid, setsid] = useState();
  useTrackTransactionStatus({
    transactionId: sid,
    onSuccess: () => {
      refetch();
    },
  });

  const onSwap = async () => {
    const payments = selectedNfts.map((n) => {
      const [identifier] = n.split("||");
      const [a, b, nonce] = identifier.split("-");

      return TokenPayment.nonFungible(`${a}-${b}`, parseInt(nonce, 16));
    });

    const transaction = contract.methods
      .swap()
      .withGasLimit(5_000_000 + payments.length * 500_000)
      .withMultiESDTNFTTransfer(payments, new Address(address))
      .withChainID(network.chainID);

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
        sx={{ }}
        spacing={2}
      >
        <Typography variant="h1" textAlign="center">
          Upgrade Your Genesis
        </Typography>
        <Typography variant="h5" textAlign="center">
          Join the new Era of Karitha and Upgrade your Genesis
        </Typography>
        <Stack direction="row" alignItems="center">
          <Box
            sx={({ breakpoints }) => ({
              height: 120,
              width: 120,
              [breakpoints.up("sm")]: {
                height: 200,
                width: 200,
              },
            })}
          >
            <img
              src="/Tavern2.png"
              style={{ width: "100%", backgroundColor: "#e0a26d", borderRadius: 10 }}
            />
          </Box>
          <SwapHoriz
            sx={({ breakpoints }) => ({
              fontSize: "2em !important",
              [breakpoints.up("sm")]: { fontSize: "4em !important" },
            })}
          />
          <Box
            sx={({ breakpoints }) => ({
              height: 120,
              width: 120,
              [breakpoints.up("sm")]: {
                height: 200,
                width: 200,
              },
            })}
          >
            <img
              src="/Tavern1.png"
              style={{ width: "100%", backgroundColor: "#e0a26d", borderRadius: 10 }}
            />
          </Box>
        </Stack>
        {isLoading ? (
          "Loading"
        ) : data?.length > 0 ? (
          <>
            <SoftButton
              disabled={selectedNfts.length === 0}
              size="large"
              variant="gradient"
              color="primary"
              onClick={onSwap}
            >
              Upgrade
            </SoftButton>
            <NftsRow
              nfts={data}
              onChange={(nfts) => {
                setSelectedNfts(nfts);
              }}
            />
          </>
        ) : (
          <Typography variant="body2">You don&apos;t have any Genesis NFTs</Typography>
        )}
      </Stack>
    </DashboardLayout>
  );
}

export default Swap;
