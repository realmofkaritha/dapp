// Soft UI Dashboard React examples
import {
  useGetAccount,
  useGetNetworkConfig,
  useTrackTransactionStatus,
} from "@elrondnetwork/dapp-core/hooks";
import { sendTransactions } from "@elrondnetwork/dapp-core/services";
import {
  Address,
  ContractFunction,
  Interaction,
  List,
  ListType,
  SmartContract,
  TokenPayment,
  TypedValue,
  U16Type,
  U16Value,
  U32Type,
  U32Value,
} from "@elrondnetwork/erdjs";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import SoftButton from "components/SoftButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import useAccountNfts from "queries/useAccountNfts";
import { useState } from "react";
import contract from "contract/contract";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import NftsRow from "layouts/dashboard/components/NftsRow";
import useStakedGenesisNfts from "queries/useStakedGenesisNfts";
const u32list = new ListType(new U32Type());
function Swap() {
  const { data, isLoading, refetch } = useAccountNfts(process.env.REACT_APP_OLD_COLLECTION);
  const { data: dataGenesis, refetch: refetchGenesis, isSuccess } = useStakedGenesisNfts();
  const { address } = useGetAccount();

  const [selectedNfts, setSelectedNfts] = useState([]);
  const network = useGetNetworkConfig();

  const [sid, setsid] = useState();
  useTrackTransactionStatus({
    transactionId: sid,
    onSuccess: () => {
      refetch();
      refetchGenesis();
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
      .withGasLimit(5_000_000 + payments.length * 2_000_000)
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
  const unstake = async () => {
    try {
      const c = new SmartContract({
        address: new Address("erd1qqqqqqqqqqqqqpgqh438d42h9ltlqgpmjxc3srxafnx383n5kagq6hynlu"),
      });
      const d = c.call({
        func: new ContractFunction("unstakeNFT"),
        args: dataGenesis?.map((d) => new U16Value(d)) || [],
        gasLimit: 5_000_000 + 2_000_000 * dataGenesis.length,
        chainID: network.chainID,
      });

      const { sessionId } = await sendTransactions({
        transactions: [d],
        transactionsDisplayInfo: {
          processingMessage: "Swapping",
          errorMessage: "An error has occured ",
          successMessage: "Swap successful",
          transactionDuration: 10000,
        },
      });

      setsid(sessionId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <DashboardLayout>
      <Stack alignItems="center" justifyContent="center" sx={{}} spacing={2}>
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
        {isSuccess && dataGenesis.length > 0 ? (
          <SoftButton size="large" variant="gradient" color="primary" onClick={unstake}>
            Unstake Genesis NFTs
          </SoftButton>
        ) : null}
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
          <Typography variant="body2">
            You don&apos;t have any Genesis NFTs in your wallet.
          </Typography>
        )}
      </Stack>
    </DashboardLayout>
  );
}

export default Swap;
