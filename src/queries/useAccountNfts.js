import { useGetAccountInfo, useGetNetworkConfig } from "@elrondnetwork/dapp-core/hooks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useAccountNfts(collection) {
  const {
    network: { apiAddress },
  } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  return useQuery(
    ["account.nfts", collection],
    async () => {
      const res = await axios.get(`${apiAddress}/accounts/${address}/nfts`, {
        params: {
          collections: collection,
          size: 10000,
        },
      });

      const nfts = [];
      res.data.forEach((n) => {
        for (let i = 0; i < parseInt(n.balance || 1); i++) {
          nfts.push({
            name: n.name,
            image: n.url,
            key: `${n.identifier}||${i}`,
            collection: n.collection,
            nonce: n.nonce,
          });
        }
      });

      return nfts;
    },
    {
      refetchInterval: 8 * 1000,
    }
  );
}
