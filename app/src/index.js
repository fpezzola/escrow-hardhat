import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";

const localhost = {
  id: 31337,
  name: "Localhost",
  network: "localhost",
  nativeCurrency: "ETH",
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
};
const { publicClient, chains } = configureChains(
  [localhost],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient: publicClient,
  connectors: [
    new MetaMaskConnector({ chains: chains }),
    new InjectedConnector({
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
});

const root = ReactDOM.createRoot(document.getElementById("root"));

if (!window.ethereum) {
  root.render(
    <React.StrictMode>
      You need to install a browser wallet to build the escrow dapp
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <WagmiConfig config={config}>
        <App />
      </WagmiConfig>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
