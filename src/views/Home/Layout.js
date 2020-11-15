import React, { useEffect, useState } from "react";
import { createGlobalStyle } from "styled-components";
import styled, { css } from "styled-components";
import ethers from "ethers";
import { Panel, Cutout } from "react95";

import { useActiveWeb3React } from "../../hooks";
import { getContract, getEtherscanLink } from "../../utils";

import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";

import RootkitDistributionABI from "../../contracts/abi/RootKitDistribution.json";
import StonefaceABI from "../../contracts/abi/Stoneface.json";
import RootkitVaultABI from "../../contracts/abi/RootKitVault.json";
import RootkitTransferGateABI from "../../contracts/abi/RootKitTransferGate.json";
import KethABI from "../../contracts/abi/KETH.json";
import RootkitABI from "../../contracts/abi/RootKit.json";

const contractAddresses = {
  DEPLOYER: "0x804CC8D469483d202c69752ce0304F71ae14ABdf",
  STONEFACE_1: "0xB0684173F62815b2121C1030cA2423123bA81905",
  STONEFACE_2: "0x95c017BeE88284bEf2253E3c347980EF2a0e2ec2",
  LIQUIDITY_GENERATION: "0x4C66a6f06B8bC4243479121A4eF0061650e5D137",
  DISTRIBUTION: "0xdc436261C356E136b1671442d0bD0Ae183a6d77D",
  VAULT: "0xaa360Bd89Ac14533940114cf7205DdF5e0CA7fa6",
  GATE: "0xbFDF833E65Bd8B27c84fbE55DD17F7648C532168",
  KETH: "0x1df2099f6AbBf0b05C12a61835137D84F10DAA96",
  FLOOR_CALCULATOR: "0x621642243CC6bE2D18b451e2386c52d1e9f7eDF6",
  ROOTKIT: "0xCb5f72d37685C3D5aD0bB5F982443BC8FcdF570E",
  VOID: "0x0000000000000000000000000000000000000000",
};

const addressToName = Object.assign(
  {},
  ...Object.entries(contractAddresses).map(([a, b]) => ({ [b]: a }))
);

const HomePage = () => {
  const chainId = 1;
  const { library, account } = useActiveWeb3React();

  const [distributionState, setDistributionState] = useState({
    address: contractAddresses.DISTRIBUTION,
    owner: undefined,
    stonefaceAddress: contractAddresses.STONEFACE_1,
    stonefaceOwner: undefined,
    stonefaceWatching: undefined,
    transfers: [],
  });
  const [vaultState, setVaultState] = useState({
    address: contractAddresses.VAULT,
    owner: undefined,
    stonefaceAddress: contractAddresses.STONEFACE_2,
    stonefaceOwner: undefined,
    stonefaceWatching: undefined,
    transfers: [],
  });
  const [gateState, setGateState] = useState({
    address: contractAddresses.GATE,
    owner: undefined,
    stonefaceAddress: contractAddresses.STONEFACE_1,
    stonefaceOwner: undefined,
    stonefaceWatching: undefined,
    transfers: [],
  });
  const [kethState, setKethState] = useState({
    address: contractAddresses.KETH,
    owner: undefined,
    stonefaceAddress: contractAddresses.STONEFACE_1,
    stonefaceOwner: undefined,
    stonefaceWatching: undefined,
    transfers: [],
  });
  const [rootkitState, setRootkitState] = useState({
    address: contractAddresses.ROOTKIT,
    owner: undefined,
    stonefaceAddress: contractAddresses.STONEFACE_1,
    stonefaceOwner: undefined,
    stonefaceWatching: undefined,
    transfers: [],
  });

  useEffect(() => {
    if (library && account) {
      async function loadState({ state, abi, onLoad }) {
        const { address, stonefaceAddress } = state;
        const contract = getContract(address, abi, library, account);
        const stonefaceContract = getContract(
          stonefaceAddress,
          StonefaceABI,
          library,
          account
        );

        const logs = await library.getLogs({
          address,
          fromBlock: 10961240,
        });

        for (const log of logs) {
          const event = contract.interface.parseLog(log);

          if (event.name === "PendingOwnershipTransfer") {
            const target = event.args.target;
            const newOwner = event.args.newOwner;
            const when = event.args.when.toNumber();

            state.transfer.push({
              target,
              newOwner,
              when,
            });
          }
        }

        state.owner = await contract.owner();
        state.stonefaceWatching = await stonefaceContract.rootKitDistribution();
        state.stonefaceOwner = await stonefaceContract.owner();

        onLoad({
          ...state,
        });
      }

      loadState({
        state: distributionState,
        abi: RootkitDistributionABI,
        onLoad: setDistributionState,
      });

      loadState({
        state: vaultState,
        abi: RootkitVaultABI,
        onLoad: setVaultState,
      });

      loadState({
        state: gateState,
        abi: RootkitTransferGateABI,
        onLoad: setGateState,
      });

      loadState({
        state: kethState,
        abi: KethABI,
        onLoad: setKethState,
      });

      loadState({
        state: rootkitState,
        abi: RootkitABI,
        onLoad: setRootkitState,
      });
    }
  }, [library, account]);

  const getAddressText = (
    address,
    showAddress = true,
    showNumber = true,
    showName = true
  ) => {
    return address
      ? `${showAddress ? address + " " : ""}${
          showNumber
            ? `#${Object.keys(addressToName).indexOf(address) + 1} - `
            : ""
        }${showName ? addressToName[address] : ""}`
      : "Connect wallet...";
  };

  const ContractWatcher = ({ name, state }) => (
    <SPanel>
      <h1>{name}</h1>
      <p>
        {name} Address:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.address, "address")}
        >
          {getAddressText(state.address, false)}
        </AddressLink>
        <br />
        {name} Owner Address:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.owner, "address")}
        >
          {getAddressText(state.owner, false)}
        </AddressLink>
      </p>
      <p>
        Stoneface Address:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.stonefaceAddress, "address")}
        >
          {getAddressText(state.stonefaceAddress, false)}
        </AddressLink>
        <br />
        Stoneface Owner Address:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.stonefaceOwner, "address")}
        >
          {getAddressText(state.stonefaceOwner, false)}
        </AddressLink>
        <br />
        Stoneface Watching Address:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.stonefaceWatching, "address")}
        >
          {getAddressText(state.stonefaceWatching, false)}
        </AddressLink>
      </p>

      <SCutout>
        <p>Ownership Transfers:</p>
        {state.transfers.length === 0 ? <p>None</p> : null}
        {state.transfers.map((v) => {
          return (
            <div>
              Target: {getAddressText(v.target)}
              <br />
              New Owner: {getAddressText(v.newOwner)}
              <br />
              When: {v.when}
            </div>
          );
        })}
      </SCutout>
    </SPanel>
  );

  return (
    <>
      <GlobalStyles />
      <div
        css={css`
          text-align: center;
          padding: 40px 15px;
        `}
      >
        <h1 style={{ marginTop: 10, marginBottom: 0 }}>
          Welcome to Rootkit Status
        </h1>
        <h2
          style={{
            textAlign: "center",
            marginTop: 0,
            marginBottom: 0,
            fontSize: "1.3rem",
            opacity: 0.6,
            fontStyle: "italic",
          }}
        >
          Stoneface owns all contracts. Stoneface executes critical Rootkit
          contracts with a time delay.
        </h2>
        <br />
        <br />
        <br />
        <div
          css={css`
            text-align: center;
            margin-bottom: 20px;
          `}
        >
          <div
            css={css`
              margin: auto;
              max-width: 500px;
              text-align: left;
            `}
          >
            <ConnectWallet />
          </div>
        </div>
        <SPanel>
          <h1>Contracts</h1>
          {Object.keys(contractAddresses).map((key, index) => (
            <p>
              {index + 1}. {key}:
              <AddressLink
                target="_blank"
                href={getEtherscanLink(
                  chainId,
                  contractAddresses[key],
                  "address"
                )}
              >
                {getAddressText(contractAddresses[key], true, false, false)}
              </AddressLink>
            </p>
          ))}
        </SPanel>
        <ContractWatcher name="Rootkit" state={rootkitState} />
        <ContractWatcher name="Distribution" state={distributionState} />
        <ContractWatcher name="Vault" state={vaultState} />
        <ContractWatcher name="TransferGate" state={gateState} />
        <ContractWatcher name="KETH" state={kethState} />
      </div>
    </>
  );
};

export default HomePage;

const GlobalStyles = createGlobalStyle`
`;

const SPanel = styled(Panel)`
  width: 100%;
  margin-bottom: 30px;
  text-align: left;
  padding: 15px;
`;

const SCutout = styled(Cutout)`
  margin-top: 20px;
  padding: 10px;
`;

const AddressLink = styled.a`
  color: yellow;
  margin-left: 1rem;
  :hover {
    color: orange;
  }
`;
