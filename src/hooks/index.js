import { useWeb3React as useWeb3ReactCore } from "@web3-react/core";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useSelector } from "react-redux";
import { injected } from "../connectors";
import { NetworkContextName } from "../constants";

export function useActiveWeb3React() {
  const context = useWeb3ReactCore();
  const contextNetwork = useWeb3ReactCore(NetworkContextName);
  return context.active ? context : contextNetwork;
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore(); // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false);

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    });
  }, [activate]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore(); // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error("Failed to activate after chain changed", error);
        });
      };

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error("Failed to activate after accounts changed", error);
          });
        }
      };

      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
    return undefined;
  }, [active, error, suppress, activate]);
}

// returns all the transactions for the current chain
export function useAllTransactions() {
  const { chainId } = useActiveWeb3React();

  const state = useSelector((state) => state.transactions);

  return chainId ? state[chainId] ?? {} : {};
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx) {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}
