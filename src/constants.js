import { injected, walletconnect } from "./connectors";

export const SUPPORTED_WALLETS = {
  INJECTED: {
    connector: injected,
    name: "Injected",
    iconName: "arrow-right.svg",
    description: "Injected web3 provider.",
    href: null,
    color: "#010101",
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: "MetaMask",
    iconName: "metamask.png",
    description: "Easy-to-use browser extension.",
    href: null,
    color: "#E8831D",
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: "WalletConnect",
    iconName: "walletconnect.svg",
    description: "Connect to Trust Wallet, Rainbow Wallet and more...",
    href: null,
    color: "#4196FC",
    mobile: true,
  },
};

export const NetworkContextName = "NETWORK";
