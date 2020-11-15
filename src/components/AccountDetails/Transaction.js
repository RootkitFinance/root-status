import React from "react";
import styled from "styled-components";
import { CheckCircle, Triangle } from "react-feather";

import { useActiveWeb3React } from "../../hooks";
import { getEtherscanLink } from "../../utils";
import { useAllTransactions } from "../../hooks";
import { RowFixed } from "../Row";
import Loader from "../Loader/Loader";

const TransactionWrapper = styled.div``;

const TransactionStatusText = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  :hover {
    text-decoration: underline;
  }
`;

const TransactionState = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none !important;
  border-radius: 0.5rem;
  padding: 0.25rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.primary1};
`;

const IconWrapper = styled.div`
  color: ${({ pending, success, theme }) =>
    pending ? theme.primary1 : success ? theme.green1 : theme.red1};
`;

export default function Transaction({ hash }) {
  const { chainId } = useActiveWeb3React();
  const allTransactions = useAllTransactions();

  const tx = allTransactions?.[hash];
  const summary = tx?.summary;
  const pending = !tx?.receipt;
  const success =
    !pending &&
    tx &&
    (tx.receipt?.status === 1 || typeof tx.receipt?.status === "undefined");

  if (!chainId) return null;

  return (
    <TransactionWrapper>
      <TransactionState
        href={getEtherscanLink(chainId, hash, "transaction")}
        pending={pending}
        success={success}
      >
        <RowFixed>
          <TransactionStatusText>{summary ?? hash} ↗</TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={pending} success={success}>
          {pending ? (
            <Loader />
          ) : success ? (
            <CheckCircle size="16" />
          ) : (
            <Triangle size="16" />
          )}
        </IconWrapper>
      </TransactionState>
    </TransactionWrapper>
  );
}
