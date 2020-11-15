import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { isMobile } from "react-device-detect";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useActiveWeb3React } from "../../hooks";
import PendingView from "../../components/AccountDetails/PendingView";
import Option from "../../components/Option/Option";
import MetamaskIcon from "../../assets/img/metamask.png";
import { SUPPORTED_WALLETS } from "../../constants";
import { injected } from "../../connectors";
import AccountDetails from "../../components/AccountDetails/AccountDetails";
import { isTransactionRecent, useAllTransactions } from "../../hooks";

const WALLET_VIEWS = {
  OPTIONS: "options",
  OPTIONS_SECONDARY: "options_secondary",
  ACCOUNT: "account",
  PENDING: "pending",
};

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr;
  grid-gap: 10px;
`;

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime;
}

const ConnectWallet = ({}) => {
  const { library } = useActiveWeb3React();
  const { active, account, connector, activate, error } = useWeb3React();

  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pendingTransactions = sortedRecentTransactions
    .filter((tx) => !tx.receipt)
    .map((tx) => tx.hash);
  const confirmedTransactions = sortedRecentTransactions
    .filter((tx) => tx.receipt)
    .map((tx) => tx.hash);

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState();

  const [pendingError, setPendingError] = useState();
  const tryActivation = async (connector) => {
    let name = "";
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });

    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true)
        .then(() => {
          setWalletView(WALLET_VIEWS.ACCOUNT);
        })
        .catch((error) => {
          if (error instanceof UnsupportedChainIdError) {
            activate(connector); // a little janky...can't use setError because the connector isn't set
          } else {
            setPendingError(true);
          }
        });
  };

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];

      // check for mobile options
      if (isMobile) {
        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector &&
                  !option.href &&
                  tryActivation(option.connector);
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require("../../assets/img/" + option.iconName)}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === "MetaMask") {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={"#E8831D"}
                header={"Install Metamask"}
                subheader={null}
                link={"https://metamask.io/"}
                icon={MetamaskIcon}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === "MetaMask" && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === "Injected" && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector);
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require("../../assets/img/" + option.iconName)}
          />
        )
      );
    });
  }

  if (error) {
    return (
      <div>
        <h2>
          {error instanceof UnsupportedChainIdError
            ? "Wrong Network"
            : "Error connecting"}
        </h2>
        <div>
          {error instanceof UnsupportedChainIdError ? (
            <h5>Please connect to the appropriate Ethereum network.</h5>
          ) : (
            "Error connecting. Try refreshing the page."
          )}
        </div>
      </div>
    );
  }

  if (account && walletView === WALLET_VIEWS.ACCOUNT) {
    return (
      <AccountDetails
        openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        pendingTransactions={pendingTransactions}
        confirmedTransactions={confirmedTransactions}
      />
    );
  }

  return (
    <div>
      {walletView !== WALLET_VIEWS.ACCOUNT ? (
        <p
          onClick={() => {
            setPendingError(false);
            setWalletView(WALLET_VIEWS.ACCOUNT);
          }}
        >
          Back
        </p>
      ) : (
        <div></div>
      )}
      <div>
        {walletView === WALLET_VIEWS.PENDING ? (
          <PendingView
            connector={pendingWallet}
            error={pendingError}
            setPendingError={setPendingError}
            tryActivation={tryActivation}
          />
        ) : (
          <OptionGrid>{getOptions()}</OptionGrid>
        )}
        {walletView !== WALLET_VIEWS.PENDING && (
          <div>
            <br />
            <span>New to Ethereum? &nbsp;</span>{" "}
            <a href="https://ethereum.org/wallets/">Learn more about wallets</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWallet;
