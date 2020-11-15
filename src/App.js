import React from "react";
import { HashRouter, Route } from "react-router-dom";
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import { connect } from "react-redux";

import { createGlobalStyle, ThemeProvider, css } from "styled-components";
import { styleReset } from "react95";
import { NetworkContextName } from "./constants";

import Web3ReactManager from "./components/Web3ReactManager/Web3ReactManager";
import getLibrary from "./utils/getLibrary";
import Home from "./views/Home/Home";
import "./App.css";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  
  html {
    font-size: 16px;
  }

  html, body, #root {
    height: 100%;
    font-family: ${({ vintageFont }) =>
      vintageFont ? "ms_sans_serif" : "sans-serif"};
  }
  
  body {
    --safe-area-inset-bottom: constant(safe-area-inset-bottom); 
    --safe-area-inset-bottom: env(safe-area-inset-bottom);
    background-color: #000;
    color: #fff;
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
`;

const App = (props) => {
  const themeSettings = {
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
          <GlobalStyles />
          <HashRouter>
            <Web3ReactManager>
              <Route exact path={"/"} component={Home} />
            </Web3ReactManager>
          </HashRouter>
        </ThemeProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
};

const mapStateToProps = (state) => ({
  background: state.user.background,
});

export default connect(mapStateToProps, null)(App);
