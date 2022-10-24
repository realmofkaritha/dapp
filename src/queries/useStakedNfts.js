import { useGetAccountInfo, useGetNetworkConfig } from "@elrondnetwork/dapp-core/hooks";
import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers";
import { ResultsParser } from "@elrondnetwork/erdjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import contract from "contract/contract";
import padHex from "utils/padHex";
import { formatAmount } from "@elrondnetwork/dapp-core/utils";

const resultsParser = new ResultsParser();

const getNftsData = async (apiAddress, identifiers) => {
  if (!identifiers.length) {
    return {};
  }
  const res = await axios.get(`${apiAddress}/nfts`, {
    params: {
      identifiers: identifiers.join(),
      size: 10000,
    },
  });

  const nfts = {};
  res.data.forEach((n) => {
    nfts[n.identifier] = n;
  });

  return nfts;
};

export default function useStakedNfts() {
  const {
    network: { apiAddress },
  } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const provider = new ProxyNetworkProvider(apiAddress);
  return useQuery(
    ["staked.nfts"],
    async () => {
      const query = contract.methods
        .getAllUserStakedAndRewards([address])
        .withChainID("D")
        .buildQuery();
      const queryResponse = await provider.queryContract(query);
      const endpointDef = contract.getEndpoint("getAllUserStakedAndRewards");
      const { firstValue } = resultsParser.parseQueryResponse(queryResponse, endpointDef);
      const { field0: stakedNfts, field1: rewardBigNumber } = firstValue?.valueOf() || {
        field0: [],
        field1: 0,
      };
      const totals = {};
      stakedNfts.forEach((n) => {
        const identifier = `${n.token_identifier}-${padHex(n.token_nonce.toString(16))}`;
        totals[identifier] = n.amount.toNumber();
      });

      const nftsData = await getNftsData(apiAddress, Object.keys(totals));
      const nfts = [];
      Object.keys(totals).forEach((n) => {
        for (let i = 0; i < totals[n]; i++) {
          nfts.push({
            name: nftsData[n].name,
            image: nftsData[n].url,
            key: `${n}||${i}`,
          });
        }
      });

      const reward = formatAmount({
        input: rewardBigNumber,
        decimals: 18,
        showIsLessThanDecimalsLabel: true,
        digits: 2,
      });

      return { nfts, reward, hasReward: rewardBigNumber.gt(0) };
    },
    {
      refetchInterval: 8 * 1000,
    }
  );
}
