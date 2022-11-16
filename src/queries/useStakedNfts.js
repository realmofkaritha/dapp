import { useGetAccountInfo, useGetNetworkConfig } from "@elrondnetwork/dapp-core/hooks";
import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers";
import { ResultsParser } from "@elrondnetwork/erdjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import contract from "contract/contract";
import padHex from "utils/padHex";
import { formatAmount } from "@elrondnetwork/dapp-core/utils";

const resultsParser = new ResultsParser();
const timeFormatter = new Intl.RelativeTimeFormat("en");
const unstakeTime = parseInt(process.env.REACT_APP_UNSTAKE_PENALTY || "7") * 86_400_000;

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

const getStaked = async (chainID, apiAddress, provider, address) => {
  const query = contract.methods
    .getAllUserStakedAndRewards([address])
    .withChainID(chainID)
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
  const sfts = [];
  Object.keys(totals).forEach((n) => {
    for (let i = 0; i < totals[n]; i++) {
      sfts.push({
        name: nftsData[n].name,
        image: nftsData[n].url,
        key: `${n}||${i}||staked`,
        unstaked: false,
      });
    }
  });

  const reward = formatAmount({
    input: rewardBigNumber,
    decimals: 18,
    showIsLessThanDecimalsLabel: true,
    digits: 2,
  });

  return { sfts, reward, hasReward: rewardBigNumber?.gt(0) || false };
};

const getPending = async (chainID, apiAddress, provider, address) => {
  const query = contract.methods.getPendingUnstake([address]).withChainID(chainID).buildQuery();
  const queryResponse = await provider.queryContract(query);
  const endpointDef = contract.getEndpoint("getPendingUnstake");
  const { values: pendingSfts } = resultsParser.parseQueryResponse(queryResponse, endpointDef);

  let canClaim = 0;
  const totals = {};
  pendingSfts[0].items.forEach((n) => {
    const [_timestamp, _sft] = n.getFields();
    const timestamp = new Date(_timestamp.value.valueOf().toNumber() * 1000);
    const now = new Date();
    const sft = _sft.value.valueOf();
    const identifier = `${sft.token_identifier}-${padHex(sft.token_nonce.toString(16))}`;
    if (now - timestamp > unstakeTime) {
      canClaim += sft.amount.toNumber();
    }

    totals[identifier] = {
      amount: sft.amount.toNumber(),
      claimable: now - timestamp > unstakeTime,
      claimTime: unstakeTime - (now - timestamp),
    };
  });

  const nftsData = await getNftsData(apiAddress, Object.keys(totals));
  const sfts = [];
  Object.keys(totals).forEach((n) => {
    for (let i = 0; i < totals[n].amount; i++) {
      sfts.push({
        name: nftsData[n].name,
        image: nftsData[n].url,
        key: `${n}||${i}||claimable`,
        unstaked: true,
        text: totals[n].claimable
          ? "Claimable now"
          : `Claimable ${getDateDiff(totals[n].claimTime)}`,
      });
    }
  });

  return { sfts, canClaim };
};

export default function useStakedNfts() {
  const {
    network: { apiAddress, apiTimeout },
    chainID,
  } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const provider = new ProxyNetworkProvider(apiAddress, {
    timeout: apiTimeout,
  });
  return useQuery(
    ["staked.nfts"],
    async () => {
      try {
        const {
          sfts: sftsStaked,
          reward,
          hasReward,
        } = await getStaked(chainID, apiAddress, provider, address);
        const { sfts: sftsPending, canClaim } = await getPending(
          chainID,
          apiAddress,
          provider,
          address
        );

        return { nfts: [...sftsStaked, ...sftsPending], reward, hasReward, canClaim };
      } catch (e) {
        console.log(e);
        return {};
      }
    },
    {
      refetchInterval: 8 * 1000,
      retryDelay: 1000,
    }
  );
}

function getDateDiff(time) {
  const seconds = Number(time / 1000);
  const d = Math.floor(seconds / (3600 * 24));
  if (d > 0) {
    return timeFormatter.format(d, "day");
  }
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  if (h > 0) {
    return timeFormatter.format(h, "hour");
  }
  const m = Math.floor((seconds % 3600) / 60);
  if (m > 0) {
    return timeFormatter.format(m, "minute");
  }
  return "";
}
