//returns how much time passed since date/timestamp
import { css } from "styled-components";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { JsonRpcSigner, JsonRpcProvider } from "@ethersproject/providers";

export const formatCurrency = (amount, currency) =>
  amount.toLocaleString(
    "en-US",
    currency && {
      style: "currency",
      // currencyDisplay: "code",
      currency,
    }
  );
export const timeSince = (date) => {
  var seconds = Math.floor(new Date().getTime() / 1000 - date);
  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
};

// top / bottom/ full
export const createMaterialStyles = (mode = "top") => css`
  position: relative;
  box-sizing: border-box;
  /* width: 100%;
  padding: 0.5rem; */
  background: ${({ theme }) => theme.material};
  border-top: ${({ theme }) =>
    ["top", "full"].includes(mode) ? `2px solid ${theme.borderLight}` : "none"};
  padding: 2px;
  border-bottom: ${({ theme }) =>
    mode === "top" ? "none" : `2px solid ${theme.borderDarkest}`};
  border-left: 2px solid ${({ theme }) => theme.borderLight};
  border-right: 2px solid ${({ theme }) => theme.borderDarkest};
  &:before {
    content: "";
    display: block;
    position: absolute;
    width: calc(100% - 4px);
    height: calc(100% - ${mode === "full" ? "4px" : "2px"});
    ${["top", "full"].includes(mode) ? "bottom: 0px" : "top: 0px"};
    left: 0;
    pointer-events: none;
    border-left: 2px solid ${({ theme }) => theme.borderLightest};
    border-right: 2px solid ${({ theme }) => theme.borderDark};
    border-top: ${({ theme }) =>
      ["top", "full"].includes(mode)
        ? `2px solid ${theme.borderLightest}`
        : "none"};
    border-bottom: ${({ theme }) =>
      mode === "top" ? "none" : `2px solid ${theme.borderDark}`};
  }
`;

export const createDisabledTextStyles = () => css`
  -webkit-text-fill-color: ${({ theme }) => theme.materialTextDisabled};
  color: ${({ theme }) => theme.materialTextDisabled};
  text-shadow: 1px 1px ${({ theme }) => theme.materialTextDisabledShadow};
`;

export function copyToClipboard(str) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str);
  } else {
    let textarea;
    try {
      textarea = document.createElement("textarea");
      textarea.setAttribute("readonly", true);
      textarea.setAttribute("contenteditable", true);
      // prevent scroll from jumping to the bottom when focus is set.
      textarea.style.position = "fixed";
      textarea.value = str;

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();

      const range = document.createRange();
      range.selectNodeContents(textarea);

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      textarea.setSelectionRange(0, textarea.value.length);
      document.execCommand("copy");
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export function shadeColor(color, percent) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}
// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address, chars = 4) {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

const ETHERSCAN_PREFIXES = {
  1: "",
  3: "ropsten.",
  4: "rinkeby.",
  5: "goerli.",
  42: "kovan.",
};

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: "transaction" | "token" | "address" | "block"
): string {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]
  }etherscan.io`;

  switch (type) {
    case "transaction": {
      return `${prefix}/tx/${data}`;
    }
    case "token": {
      return `${prefix}/token/${data}`;
    }
    case "block": {
      return `${prefix}/block/${data}`;
    }
    case "address":
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

// account is not optional
export function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address, ABI: any, library, account) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account));
}
