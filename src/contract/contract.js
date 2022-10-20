import abiJson from "./abi.json";
import { AbiRegistry, SmartContractAbi, SmartContract, Address } from "@elrondnetwork/erdjs";

const abiRegistry = AbiRegistry.create(abiJson);
const scAbi = new SmartContractAbi(abiRegistry, ["MainModule"]);
// eslint-disable-next-line no-undef
const contract = new SmartContract({address: new Address(process.env.REACT_APP_STAKE_SC_ADDRESS), abi:scAbi});
export default contract;
