import React, { useEffect, useContext, useState } from "react";
import { createGlobalStyle, ThemeContext } from "styled-components";
import styled, { css } from "styled-components";
import { useLocation } from "react-router-dom";
import ethers from "ethers";

import { useActiveWeb3React } from "../../hooks";
import { getContract } from "../../utils";

import Window from "../../components/Window/Window";
import WindowIcon from "../../assets/img/pc.png";
import BookIcon from "../../assets/img/book.png";
import PlugIcon from "../../assets/img/plug.png";
import RootkitLiquidityGenerationABI from "../../contracts/abi/RootKitLiquidityGeneration.json";

const DistributionState = {
  Initializing: 0,
  Ready: 1,
  Active: 2,
  Broken: 3,
  Completing: 4,
  Complete: 5,
};

const Icon = styled.img`
  image-rendering: pixelated;
  /* filter: grayscale(1); */
  height: 24px;
  display: inline-block;
  padding-right: 8px;
  ${({ theme }) =>
    theme.name === "original"
      ? `
            filter: grayscale(100%) brightness(40%) sepia(100%) hue-rotate(50deg) saturate(5000%) contrast(1);
          `
      : ""}
`;

const DisconnectedIcon = () => (
  <img
    alt="connect"
    src="data:image/gif;base64,R0lGODlhIAAgAKIHAICAAP//AICAgMDAwP///wAAAP8AAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDM2MCwgMjAyMC8wMi8xMy0wMTowNzoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkE0QzU0RDc4RkY3QjExRUFBQzgyRjAwNTZFODFEQkVGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkE0QzU0RDc5RkY3QjExRUFBQzgyRjAwNTZFODFEQkVGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QTRDNTRENzZGRjdCMTFFQUFDODJGMDA1NkU4MURCRUYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QTRDNTRENzdGRjdCMTFFQUFDODJGMDA1NkU4MURCRUYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQFHgAHACwAAAAAIAAgAAADrni63P4wyklrK7hYO/rQ20SMxBdKQlqCJ7q2rglDwjs/tXw3ObsrvR/PJgQSi8GiUXfJnJJAFSlDda1S0pKWNPXxOjXSQDsukwVeHjZHbo+xaUeObS7D0ZTcANteFwAYeSUee2t+BAAAgoSEKRloAQQBiSh7jGBoiIADkZGUOBgpjI6diR2SRw6hAh6OnKimnEwQoZgYp5EfBR1xDwWscLeyGoEbv2gswr0UxU0NCQAh+QQJMgAHACwFAAYAFgAWAAADMmi6dv6OSQnhvK1GjDfn3neFYkmRomYu6pppxwdX8uy+z92u+e2ivJhPAaztUrDgcZEAACH5BAUeAAcALAAAAAAgACAAAAOGeLrc/jDKSau9OOv9Cp+D90HhSIpmU6Yqyirue8QvzdopXuw46ApAgpDAK1IIIWBQOEAOnzvJYCB4Nq9OLLV3UAa1WaeSq6hSw9qxgNxFUr/iMSA6MU+n3nyBAABQ7Hd3QDxrAQQBf1SBgmt8cwOGfztAi4OGAX1TF5MCjAWQh44yo6SlGwkAOw=="
    css={css`
      height: 23px;
      width: 23px;
      padding: 0px 0.2em;
      margin-right: 8px;
      ${({ theme }) =>
        theme.name === "original"
          ? `
              filter: grayscale(100%) brightness(40%) sepia(100%) hue-rotate(50deg)
      saturate(6000%) contrast(1);
          `
          : ""}
    `}
  />
);

const HomePage = ({
  data,
  showingFollowing,
  showFollowing,
  showTop,
  position,
  open,
  active,
  zIndex,
  onChangePage,
  onDragStart,
  onDragStop,
  onClose,
  onFocus,
}) => {
  const { library, account } = useActiveWeb3React();
  const location = useLocation();
  const theme = useContext(ThemeContext);
  const [distributionState, setDistributionState] = useState(0);
  const [totalContributed, setTotalContributed] = useState(0);
  const [liquidityGenerationActive, setLiquidityGenerationActive] = useState(
    true
  );

  useEffect(() => {
    if (library && account) {
      loadDistributionState();
    }
  }, [library, account, loadDistributionState]);

  async function loadDistributionState() {
    const contract = getContract(
      process.env.REACT_APP_ROOTKIT_LIQUIDITY_GENERATION_ADDRESS,
      RootkitLiquidityGenerationABI,
      library,
      account
    );

    //setLiquidityGenerationActive(await contract.isActive());

    //setDistributionState(await contract.state());
  }

  if (!open) return <></>;
  return (
    <Window
      title="Rootkit.exe"
      icon={WindowIcon}
      position={position}
      zIndex={zIndex}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onClose={onClose}
      onFocus={onFocus}
      contentCss={css`
        @media ${({ theme }) => theme.MEDIA_TABLET_OR_MORE} {
          width: 800px;
          height: 700px;
        }
      `}
    >
      <GlobalStyles />
      <div
        css={css`
          text-align: center;
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
            color: "#000",
            fontStyle: "italic",
          }}
        >
          hacking the financial system
        </h2>
        <h1>
          Stoneface executes critical Rootkit contracts with a time delay. This
          makes Rootkit effectively rug-proof.
        </h1>
        <Panel>
          <h1>Distribution Watcher:</h1>
          <p>
            Distribution Address: 0xB0684173F62815b2121C1030cA2423123bA81905
          </p>
          <p>
            7-Day Stoneface Address: 0xB0684173F62815b2121C1030cA2423123bA81905
          </p>
        </Panel>

        <Panel>
          <h1>Vault Watcher:</h1>
          <p>Vault Address: 0x95c017BeE88284bEf2253E3c347980EF2a0e2ec2</p>
          <p>
            3-Day Stoneface Address: 0x95c017BeE88284bEf2253E3c347980EF2a0e2ec2
          </p>
        </Panel>

        <h1>Transfer Gate:</h1>
        <p>Address: 0xBcEd48FD991846E267B02FBC1b7aFE2cc2E483D2</p>
      </div>
    </Window>
  );
};

export default HomePage;

const GlobalStyles = createGlobalStyle`
`;
