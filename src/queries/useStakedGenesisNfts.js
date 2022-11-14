import { useGetAccountInfo, useGetNetworkConfig } from "@elrondnetwork/dapp-core/hooks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers";
import {
  Address,
  AddressValue,
  ContractFunction,
  Query,
  ResultsParser,
} from "@elrondnetwork/erdjs";

export default function useStakedGenesisNfts() {
  const {
    network: { apiAddress },
  } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();

  return useQuery(
    ["account.genesis.nfts"],
    async () => {
      try {
        const provider = new ProxyNetworkProvider(apiAddress);
        const query = new Query({
          address: new Address("erd1qqqqqqqqqqqqqpgqh438d42h9ltlqgpmjxc3srxafnx383n5kagq6hynlu"),
          func: new ContractFunction("getStakedNFTNonces"),
          args: [
            new AddressValue(
              new Address(address)
            ),
          ],
        });
        const response = await provider.queryContract(query);
        const noncesHex = [...chunk(Buffer.from(response.returnData[0], "base64").toString("hex"), 4)].map(
          (n) => parseInt(n, 16)
        );

        return noncesHex || [];
      } catch (e) {
        return [];
      }
    },
    {
      refetchInterval: 8 * 1000,
      retryDelay: 1000,
    }
  );
}

function* chunk(str, size = 3) {
  for (let i = 0; i < str.length; i += size) yield str.slice(i, i + size);
}
