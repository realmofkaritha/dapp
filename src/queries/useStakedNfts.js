import { useGetAccountInfo, useGetNetworkConfig } from "@elrondnetwork/dapp-core/hooks";
import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers";
import { ResultsParser } from "@elrondnetwork/erdjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import contract from "contract/contract";
import padHex from "utils/padHex";

const resultsParser = new ResultsParser();

const getNftsData = async (apiAddress, identifiers) => {
  if (!identifiers.length) {
    return {};
  }
  const res = await axios.get(`${apiAddress}/nfts`, {
    params: {
      identifiers: identifiers.join(),
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
  return useQuery(["staked.nfts"], async () => {
    const query = contract.methods
      .getAllUserStakedAndRewards([address])
      .withChainID("D")
      .buildQuery();
    const queryResponse = await provider.queryContract(query);
    const endpointDef = contract.getEndpoint("getAllUserStakedAndRewards");
    const { firstValue } = resultsParser.parseQueryResponse(queryResponse, endpointDef);
    const { field0: stakedNfts, field1: reward } = firstValue.valueOf();

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

    return { nfts, reward };
  });
}
