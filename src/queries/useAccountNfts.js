import { useGetAccountInfo, useGetNetworkConfig } from "@elrondnetwork/dapp-core/hooks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useAccountNfts() {
  const {
    network: { apiAddress },
  } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  return useQuery(["account.nfts"], async () => {
    const res = await axios.get(`${apiAddress}/accounts/${address}/nfts`, {
      params: {
        collections: process.env.REACT_APP_NFT_COLLECTION,
      },
    });

    const nfts = [];
    res.data.forEach((n) => {
      for (let i = 0; i < parseInt(n.balance); i++) {
        nfts.push({ name:n.name, image: n.url,  key: `${n.identifier}||${i}` });
      }
    });

    return nfts;
  });
}
