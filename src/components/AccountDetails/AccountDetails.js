import React, { useCallback, useContext } from "react";
import { useDispatch } from "react-redux";
import styled, { ThemeContext } from "styled-components";
import { useActiveWeb3React } from "../../hooks";
//import { clearAllTransactions } from '../../state/transactions/actions'
import { shortenAddress } from "../../utils";
import { AutoRow } from "../Row";
import Transaction from "./Transaction";

import { SUPPORTED_WALLETS } from "../../constants";
import { ReactComponent as Close } from "../../assets/img/x.svg";
import { getEtherscanLink } from "../../utils";
import {
  injected,
  walletconnect,
  walletlink,
  fortmatic,
  portis,
} from "../../connectors";
import WalletConnectIcon from "../../assets/img/walletConnectIcon.svg";
import Identicon from "../Identicon";
import { ExternalLink as LinkIcon } from "react-feather";

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) =>
    props.color === "blue" ? ({ theme }) => theme.primary1 : "inherit"};
  padding: 1rem;
`;

const UpperSection = styled.div`
  position: relative;
`;

const InfoCard = styled.div`
  padding: 1rem;
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  margin-bottom: 20px;
`;

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }
`;

const AccountSection = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  padding: 0rem 1rem;
  padding: 0rem 1rem 1.5rem 1rem;
`;

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`;

const LowerSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  padding: 1.5rem;
  flex-grow: 1;
  overflow: auto;
  background-color: ${({ theme }) => theme.bg2};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.text3};
  }
`;

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const AddressLink = styled.a`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.text3};
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: ${({ theme }) => theme.text2};
  }
`;

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`;

const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text3};
`;

const IconWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + "px" : "32px")};
    width: ${({ size }) => (size ? size + "px" : "32px")};
  }
  align-items: flex-end;
`;

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`;

const WalletAction = styled.button`
  width: fit-content;
  font-weight: 400;
  margin-left: 8px;
  font-size: 0.825rem;
  padding: 4px 6px;
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const MainWalletAction = styled(WalletAction)`
  color: ${({ theme }) => theme.primary1};
`;

function renderTransactions(transactions) {
  return (
    <TransactionListWrapper>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />;
      })}
    </TransactionListWrapper>
  );
}

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}) {
  const { chainId, account, connector } = useActiveWeb3React();
  const theme = useContext(ThemeContext);
  const dispatch = useDispatch();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector &&
          (connector !== injected || isMetaMask === (k === "METAMASK"))
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return <WalletName>Connected with {name}</WalletName>;
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      );
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={"wallet connect logo"} />
        </IconWrapper>
      );
    }
    return null;
  }

  const clearAllTransactions = () => {};
  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  return (
    <>
      <UpperSection>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName()}
                <div>
                  {connector !== injected && connector !== walletlink && (
                    <WalletAction
                      style={{
                        fontSize: ".825rem",
                        fontWeight: 400,
                        marginRight: "8px",
                      }}
                      onClick={() => {
                        connector.close();
                      }}
                    >
                      Disconnect
                    </WalletAction>
                  )}
                  <WalletAction
                    style={{ fontSize: ".825rem", fontWeight: 400 }}
                    onClick={() => {
                      openOptions();
                    }}
                  >
                    Change
                  </WalletAction>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow id="web3-account-identifier-row">
                <AccountControl>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {ENSName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {account && shortenAddress(account)}</p>
                      </div>
                    </>
                  )}
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      <div>
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={true}
                            target="_blank"
                            href={
                              chainId &&
                              getEtherscanLink(chainId, ENSName, "address")
                            }
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: "4px" }}>
                              View on Etherscan
                            </span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      <div>
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={false}
                            target="_blank"
                            href={getEtherscanLink(chainId, account, "address")}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: "4px" }}>
                              View on Etherscan
                            </span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                )}
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
      {/* {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <AutoRow mb={"1rem"} style={{ justifyContent: "space-between" }}>
            <TYPE.body>Recent Transactions</TYPE.body>
            <LinkStyledButton onClick={clearAllTransactionsCallback}>
              (clear all)
            </LinkStyledButton>
          </AutoRow>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)}
        </LowerSection>
      ) : (
        <LowerSection>
          <TYPE.body color={theme.text1}>
            Your transactions will appear here...
          </TYPE.body>
        </LowerSection>
      )} */}
    </>
  );
}
