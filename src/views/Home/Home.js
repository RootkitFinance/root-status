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
import MoneyButtonABI from "../../contracts/abi/RootKitMoneyButton.json";
import DirectABI from "../../contracts/abi/RootKitDirect.json";
import WethZapperABI from "../../contracts/abi/RootWethZapper.json";

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
  MONEY_BUTTON: "0x7803B983492EB76406BDbF222D77937198ABa03c",
  DIRECT: "0x1DDDbC37231965897d4131BdbA0ade7069d28AB0",
  WETH_ZAPPER: "0x6342de49eA6795e24fafb4Bda3ac13a021FbE014",
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
  const [moneyButtonState, setMoneyButtonState] = useState({
    name: "MONEY_BUTTON",
    address: contractAddresses.MONEY_BUTTON,
    owner: undefined,
  });
  const [directState, setDirectState] = useState({
    name: "DIRECT",
    address: contractAddresses.DIRECT,
    owner: undefined,
  });
  const [wethZapperState, setWethZapperState] = useState({
    name: "WETH_ZAPPER",
    address: contractAddresses.WETH_ZAPPER,
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

      loadState({
        state: moneyButtonState,
        abi: MoneyButtonABI,
        onLoad: setMoneyButtonState,
      });

      loadState({
        state: directState,
        abi: DirectABI,
        onLoad: setDirectState,
      });

      loadState({
        state: wethZapperState,
        abi: WethZapperABI,
        onLoad: setWethZapperState,
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
            const when = new Date(event.args.when.toNumber() * 1000) + "";

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
          <Note>
            (The owner doesn't matter because there aren't any owner-only
            functions)
          </Note>
        ) : state.name === "TRANSFER_GATE" ? (
          <Note>
            (The concern with the transfer gate was setParameters would let us
            set a tax rate of 100%. All transfers could be redirected to devs.
            Essentially a rug, albeit super unconventional, and could only rug
            down to the floor. But it was fixed by adding hard-coded caps that
            the owner cannot override.)
          </Note>
        ) : state.name === "DISTRIBUTION" ? (
          <Note>
            (Once a sale starts, the only relevant owner-only functions are
            setJengaCount and distribute, which are used to end the sale and
            complete the distribution. There is no opportunity to rug.)
          </Note>
        ) : state.name === "MONEY_BUTTON" ? (
          <Note>
            (The owner doesn't matter, as it has no access to funds. There is no
            opportunity to rug.)
          </Note>
        ) : state.name === "DIRECT" ? (
          <Note>
            (The owner doesn't matter, as it has no access to funds. There is no
            opportunity to rug.)
          </Note>
        ) : state.name === "WETH_ZAPPER" ? (
          <Note>
            (The owner doesn't matter, as it has no access to funds. There is no
            opportunity to rug.)
          </Note>
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
          <Note>(Owner actions are delayed by 7 days)</Note>
        ) : state.name === "STONEFACE_2" ? (
          <Note>(Owner actions are delayed by 3 days)</Note>
        ) : null}
        {state.watching !== "0x0000000000000000000000000000000000000000" ? (
          <>
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
          padding: 10px 0 0 30px;
        `}
      >
        <p>Ownership Transfers:</p>
        {state.transfers === undefined ? <p>Loading...</p> : null}
        {state.transfers && state.transfers.length === 0 ? <p>None</p> : null}
        {state.transfers
          ? state.transfers.map((v, i) => {
              return (
                <p key={i}>
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
                </p>
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
        <ContractWatcher name="MoneyButton" state={moneyButtonState} />
        <ContractWatcher name="Direct" state={directState} />
        <ContractWatcher name="WethZapper" state={wethZapperState} />
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

const Note = styled.div`
  opacity: 0.6;
  font-style: italic;
`;
