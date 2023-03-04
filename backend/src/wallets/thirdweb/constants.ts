import * as sabi from "./simpleAcctABI.json";
import * as safbi from "./SimpleAccountFactory.json";
import dotenv from 'dotenv';

dotenv.config();

export const abis = {
  simpleAccount: sabi,
  simpleAccountFactory: safbi
}

export interface Network {
  url: string;
  chainId: number;
  scanUrl: string;
  SAFAddress: string;
  owner?: string;
}

const WAGMIGangDeployer = "0x8b559858E63f14d323A1ad7c5238A96b273f999c";

export const NETWORKS: { [key: string]: Network } = {
  goerli: {
    url: process.env.GOERLI_INFURA_URL,
    chainId: 5,
    scanUrl: "https://goerli.etherscan.io",
    SAFAddress: "0x822cFC6B982285Ccb35Df85287DE57f44cb25814",
    owner: WAGMIGangDeployer,
  },
  mumbai: {
    url: process.env.MUMBAI_INFURA_URL,
    chainId: 80001,
    scanUrl: "https://mumbai.polygonscan.com",
    SAFAddress: "0xC529a6A67181E50859808eEFe5bBc589eB3dd609",
    owner: WAGMIGangDeployer,
  },
  // base: {
  //   url: process.env.BASE_INFURA_URL,
  //   chainId: 84531,
  // scanUrl: "",
  //   SAFAddress: "0x???",
  //   owner: WAGMIGangDeployer,
  // },
}

export const prevCreatedSimpleAccts = {
  goerli: "0x5914594613c2fb4a3fb80f22f7baa8906368e3b3",
  mumbai: "0x2Cd8961b040c831eFC31DFdFaC6Aa52D33C79f2f",
  base: "0x???",
}
