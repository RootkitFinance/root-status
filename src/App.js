import React, { useState, useEffect } from "react";
import { HashRouter, Route, useHistory } from "react-router-dom";
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";

import styled, {
  createGlobalStyle,
  ThemeProvider,
  css,
} from "styled-components";
import { styleReset } from "react95";
import original from "react95/dist/themes/original";
import rose from "react95/dist/themes/rose";
import rainyDay from "react95/dist/themes/rainyDay";
import travel from "react95/dist/themes/travel";
import marine from "react95/dist/themes/marine";
import olive from "react95/dist/themes/olive";
import theSixtiesUSA from "react95/dist/themes/theSixtiesUSA";
import candy from "react95/dist/themes/candy";
import tokyoDark from "react95/dist/themes/tokyoDark";
import vaporTeal from "react95/dist/themes/vaporTeal";
import { NetworkContextName } from "./constants";

import Web3ReactManager from "./components/Web3ReactManager/Web3ReactManager";
import getWeb3Provider from "./utils/getLibrary";
import { getNetworkLibrary } from "./connectors";
import getLibrary from "./utils/getLibrary";
import Home from "./views/Home/Home";
import "./App.css";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  html {
    font-size: ${({ fontSize }) => `${fontSize * 16}px`};
  }
  html, body, #root {
    height: 100%;
    font-family: ${({ vintageFont }) =>
      vintageFont ? "ms_sans_serif" : "sans-serif"};
  }
  body {
    color: ${({ theme }) => theme.materialText};
    --safe-area-inset-bottom: constant(safe-area-inset-bottom); 
    --safe-area-inset-bottom: env(safe-area-inset-bottom);
    background-color: #000;
    overflow: hidden;
    &:before {
      content: '';
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--safe-area-inset-bottom);
      background: black;
      z-index: 9999999;
    }
  }
  * {
    box-sizing: border-box;
      font-family: ${({ vintageFont }) =>
        vintageFont ? "ms_sans_serif" : "sans-serif"};
  }
  p, textarea {
    font-family: monospace !important;
  }

  h1 {
    font-size: 1.5rem;
  }

  strong {
    font-weight: bold;
  }

`;

const AppContent = (props) => {
  const history = useHistory();
  const location = useLocation();

  return (
    <>
      <PageWrapper>
        <Route exact path={"/"} component={<Home />} />
      </PageWrapper>
    </>
  );
};

const App = (props) => {
  const {
    theme,
    background,
    vintageFont,
    fontSize,
    scanLines,
    scanLinesIntensity,
  } = props;

  const themeSettings = {
    // rgba(0, 0, 0, 0.35) 4px 4px 10px 0px, rgb(223, 224, 227) 1px 1px 0px 1px inset, rgb(136, 140, 143) -1px -1px 0px 1px inset
    // 4px 4px 10px 0 rgba(0,0,0,0.35), inset 1px 1px 0px 1px #fefefe, inset -1px -1px 0 1px #848584
    // SCREEN SIZES
    SCREEN_DESKTOP: "1199px",
    SCREEN_TABLET: "991px",
    SCREEN_MOBILE: "767px",
    // MEDIA QUERIES
    MEDIA_ALL: "only screen and (max-width: 70000px)",
    MEDIA_MOBILE_ONLY: "only screen and (max-width: 767px)",
    MEDIA_TABLET_ONLY:
      "only screen and (min-width: 768px) and (max-width: 991px)",
    MEDIA_TABLET_OR_LESS: "only screen and (max-width: 991px)",
    MEDIA_TABLET_OR_MORE: "only screen and (min-width: 768px)",
    MEDIA_DESKTOP_ONLY:
      "only screen and (min-width: 992px) and (max-width: 1199px)",
    MEDIA_DESKTOP_OR_LESS: "only screen and (max-width: 1199px)",
    MEDIA_DESKTOP_OR_MORE: "only screen and (min-width: 992px)",
    MEDIA_DESKTOP_WIDE: "only screen and (min-width: 1200px)",

    // other
    red1: "#FF6871",
    red2: "#F82D3A",
    green1: "#27AE60",
    yellow1: "#FFE270",
    yellow2: "#F3841E",
    blue1: "#2172E5",

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  };
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ThemeProvider theme={themeSettings}>
          <>
            <GlobalStyles
              vintageFont={vintageFont}
              fontSize={fontSize}
              scanLines={scanLines}
              scanLinesIntensity={scanLinesIntensity}
              background={background.value}
            />
            <HashRouter>
              <Web3ReactManager>
                <AppContent />
              </Web3ReactManager>
            </HashRouter>
          </>
        </ThemeProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
};

const mapStateToProps = (state) => ({
  theme: state.user.theme,
  background: state.user.background,
  vintageFont: state.user.vintageFont,
  fontSize: state.user.fontSize,
  scanLines: state.user.scanLines,
  scanLinesIntensity: state.user.scanLinesIntensity,
});
export default connect(mapStateToProps, null)(App);

const PageWrapper = styled("div")`
  position: relative;
  height: 100%;
  height: calc(100% - var(--safe-area-inset-bottom) - 52px);
`;
