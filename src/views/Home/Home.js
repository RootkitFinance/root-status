import React, { useEffect, useState } from "react";
import { createGlobalStyle } from "styled-components";
import styled, { css } from "styled-components";
import ethers from "ethers";

import { useActiveWeb3React } from "../../hooks";
import { getContract, getEtherscanLink } from "../../utils";

import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";

import RootkitDistributionABI from "../../contracts/abi/RootKitDistribution.json";
import StonefaceABI from "../../contracts/abi/Stoneface.json";
import RootkitVaultABI from "../../contracts/abi/RootKitVault.json";
import RootkitTransferGateABI from "../../contracts/abi/RootKitTransferGate.json";
import RootkitFloorCalculatorABI from "../../contracts/abi/RootKitFloorCalculator.json";
import RootABI from "../../contracts/abi/RootKit.json";
import KethABI from "../../contracts/abi/KETH.json";

const contractAddresses = {
  DEPLOYER: "0x804CC8D469483d202c69752ce0304F71ae14ABdf",
  STONEFACE_1: "0xB0684173F62815b2121C1030cA2423123bA81905",
  STONEFACE_2: "0x95c017BeE88284bEf2253E3c347980EF2a0e2ec2",
  LIQUIDITY_GENERATION: "0x4C66a6f06B8bC4243479121A4eF0061650e5D137",
  DISTRIBUTION: "0xdc436261C356E136b1671442d0bD0Ae183a6d77D",
  VAULT: "0xaa360Bd89Ac14533940114cf7205DdF5e0CA7fa6",
  TRANSFER_GATE: "0xbFDF833E65Bd8B27c84fbE55DD17F7648C532168",
  FLOOR_CALCULATOR: "0x621642243CC6bE2D18b451e2386c52d1e9f7eDF6",
  ROOT: "0xCb5f72d37685C3D5aD0bB5F982443BC8FcdF570E",
  KETH: "0x1df2099f6AbBf0b05C12a61835137D84F10DAA96",
};

const addressToName = Object.assign(
  {},
  ...Object.entries(contractAddresses).map(([a, b]) => ({ [b]: a }))
);

const HomePage = () => {
  const chainId = 1;
  const { library, account } = useActiveWeb3React();

  const [stoneface1State, setStoneface1State] = useState({
    name: "STONEFACE_1",
    address: contractAddresses.STONEFACE_1,
    owner: undefined,
    watching: undefined,
    transfers: undefined,
  });
  const [stoneface2State, setStoneface2State] = useState({
    name: "STONEFACE_2",
    address: contractAddresses.STONEFACE_2,
    owner: undefined,
    watching: undefined,
    transfers: undefined,
  });
  const [distributionState, setDistributionState] = useState({
    name: "DISTRIBUTION",
    address: contractAddresses.DISTRIBUTION,
    owner: undefined,
  });
  const [vaultState, setVaultState] = useState({
    name: "VAULT",
    address: contractAddresses.VAULT,
    owner: undefined,
  });
  const [transferGateState, setTransferGateState] = useState({
    name: "TRANSFER_GATE",
    address: contractAddresses.TRANSFER_GATE,
    owner: undefined,
  });
  const [floorCalculatorState, setFloorCalculatorState] = useState({
    name: "FLOOR_CALCULATOR",
    address: contractAddresses.FLOOR_CALCULATOR,
    owner: undefined,
  });
  const [rootState, setRootState] = useState({
    name: "ROOT",
    address: contractAddresses.ROOT,
    owner: undefined,
  });
  const [kethState, setKethState] = useState({
    name: "KETH",
    address: contractAddresses.KETH,
    owner: undefined,
  });

  useEffect(() => {
    if (library && account) {
      async function loadState({ state, abi, onLoad }) {
        const { address } = state;
        const contract = getContract(address, abi, library, account);

        state.owner = await contract.owner();

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
        state: transferGateState,
        abi: RootkitTransferGateABI,
        onLoad: setTransferGateState,
      });

      loadState({
        state: floorCalculatorState,
        abi: RootkitFloorCalculatorABI,
        onLoad: setFloorCalculatorState,
      });

      loadState({
        state: rootState,
        abi: RootABI,
        onLoad: setRootState,
      });

      loadState({
        state: kethState,
        abi: KethABI,
        onLoad: setKethState,
      });

      async function loadStonefaceState({ state, abi, onLoad }) {
        const { address } = state;
        const contract = getContract(address, abi, library, account);

        state.owner = await contract.owner();
        state.watching = await contract.rootKitDistribution();

        onLoad({
          ...state,
        });

        const logs = await library.getLogs({
          address,
          fromBlock: 10961240,
        });

        state.transfers = [];

        for (const log of logs) {
          const event = contract.interface.parseLog(log);

          if (event.name === "PendingOwnershipTransfer") {
            const target = event.args.target;
            const newOwner = event.args.newOwner;
            const when = event.args.when.toNumber();

            state.transfers.push({
              target,
              newOwner,
              when,
            });
          }
        }

        onLoad({
          ...state,
        });
      }

      loadStonefaceState({
        state: stoneface1State,
        abi: StonefaceABI,
        onLoad: setStoneface1State,
      });

      loadStonefaceState({
        state: stoneface2State,
        abi: StonefaceABI,
        onLoad: setStoneface2State,
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
    <div
      css={css`
        text-align: left;
        padding: 40px 0;
      `}
    >
      <h1>{name}</h1>
      <p>
        Address:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.address, "address")}
        >
          {getAddressText(state.address, false)}
        </AddressLink>
        <br />
        Owner:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.owner, "address")}
        >
          {getAddressText(state.owner, false)}
        </AddressLink>
        {state.name === "FLOOR_CALCULATOR" ? (
          <p>
            (The owner doesn't matter because there aren't any owner-only
            functions)
          </p>
        ) : state.name === "TRANSFER_GATE" ? (
          <p>
            (The concern with the transfer gate was setParameters would let us
            set a tax rate of 100%. All transfers could be redirected to devs.
            Essentially a rug, albeit super unconventional, and could only rug
            down to the floor. But it was fixed by adding hard-coded caps that
            the owner cannot override.)
          </p>
        ) : state.name === "DISTRIBUTION" ? (
          <p>
            (Once a sale starts, the only relevant owner-only functions are
            setJengaCount and distribute, which are used to end the sale and
            complete the distribution. There is no opportunity to rug.)
          </p>
        ) : null}
      </p>
    </div>
  );

  const StonefaceWatcher = ({ name, state }) => (
    <div
      css={css`
        text-align: left;
        margin-bottom: 20px;
        padding: 20px 0;
      `}
    >
      <h1>{name}</h1>
      <p>
        Address:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.address, "address")}
        >
          {getAddressText(state.address, false)}
        </AddressLink>
        <br />
        Owner:
        <AddressLink
          target="_blank"
          href={getEtherscanLink(chainId, state.owner, "address")}
        >
          {getAddressText(state.owner, false)}
        </AddressLink>
        {state.name === "STONEFACE_1" ? (
          <p>(Owner actions are delayed by 7 days)</p>
        ) : state.name === "STONEFACE_2" ? (
          <p>(Owner actions are delayed by 3 days)</p>
        ) : null}
        {state.watching !== "0x0000000000000000000000000000000000000000" ? (
          <>
            <br />
            Watching:
            <AddressLink
              target="_blank"
              href={getEtherscanLink(chainId, state.watching, "address")}
            >
              {getAddressText(state.watching, false)}
            </AddressLink>
          </>
        ) : null}
      </p>

      <div
        css={css`
          padding: 10px 0;
        `}
      >
        <p>Ownership Transfers:</p>
        {state.transfers === undefined ? <p>Loading...</p> : null}
        {state.transfers && state.transfers.length === 0 ? <p>None</p> : null}
        {state.transfers
          ? state.transfers.map((v, i) => {
              return (
                <div key={i}>
                  Target:
                  <AddressLink
                    target="_blank"
                    href={getEtherscanLink(chainId, v.target, "address")}
                  >
                    {getAddressText(v.target, false)}
                  </AddressLink>
                  <br />
                  New Owner:
                  <AddressLink
                    target="_blank"
                    href={getEtherscanLink(chainId, v.newOwner, "address")}
                  >
                    {getAddressText(v.newOwner, false)}
                  </AddressLink>
                  <br />
                  When: {v.when}
                </div>
              );
            })
          : null}
      </div>
    </div>
  );

  return (
    <>
      <GlobalStyles />
      <div
        css={css`
          text-align: center;
          padding: 50px 30px;
        `}
      >
        <h1 style={{ marginTop: 10, marginBottom: 0 }}>Rootkit Status</h1>
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
        <div
          css={css`
            text-align: left;
            margin-bottom: 20px;
            padding: 40px 0;
          `}
        >
          <h1>Address List</h1>
          {Object.keys(contractAddresses).map((key, index) => (
            <p key={key}>
              #{index + 1} - {key}:
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
        </div>
        <StonefaceWatcher name="Stoneface1" state={stoneface1State} />
        <StonefaceWatcher name="Stoneface2" state={stoneface2State} />
        <ContractWatcher name="Distribution" state={distributionState} />
        <ContractWatcher name="Vault" state={vaultState} />
        <ContractWatcher name="TransferGate" state={transferGateState} />
        <ContractWatcher name="FloorCalculator" state={floorCalculatorState} />
        <ContractWatcher name="ROOT" state={rootState} />
        <ContractWatcher name="KETH" state={kethState} />
      </div>
    </>
  );
};

export default HomePage;

const GlobalStyles = createGlobalStyle`
`;

const AddressLink = styled.a`
  color: yellow;
  margin-left: 1rem;
  :hover {
    color: orange;
  }
`;
