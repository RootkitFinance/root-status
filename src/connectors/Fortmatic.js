import { FortmaticConnector as FortmaticConnectorCore } from "@web3-react/fortmatic-connector";
export const OVERLAY_READY = "OVERLAY_READY";

const ChainId = {
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  KOVAN: 42,
  LOCAL: 1337,
};
const CHAIN_ID_NETWORK_ARGUMENT = {
  [ChainId.MAINNET]: undefined,
  [ChainId.ROPSTEN]: "ropsten",
  [ChainId.RINKEBY]: "rinkeby",
  [ChainId.KOVAN]: "kovan",
};
export class FortmaticConnector extends FortmaticConnectorCore {
  async activate() {
    if (!this.fortmatic) {
      const { default: Fortmatic } = await import("fortmatic");
      const { apiKey, chainId } = this;
      if (chainId in CHAIN_ID_NETWORK_ARGUMENT) {
        this.fortmatic = new Fortmatic(
          apiKey,
          CHAIN_ID_NETWORK_ARGUMENT[chainId]
        );
      } else {
        throw new Error(`Unsupported network ID: ${chainId}`);
      }
    }
    const provider = this.fortmatic.getProvider();
    const pollForOverlayReady = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (provider.overlayReady) {
          clearInterval(interval);
          this.emit(OVERLAY_READY);
          resolve();
        }
      }, 200);
    });
    const [account] = await Promise.all([
      provider.enable().then((accounts) => accounts[0]),
      pollForOverlayReady,
    ]);
    return {
      provider: this.fortmatic.getProvider(),
      chainId: this.chainId,
      account,
    };
  }
}
