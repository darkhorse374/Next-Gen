require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');

require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;
const infuraKey = process.env.INFURA_KEY;
const etherscanKey = process.env.ETHERSCAN_KEY;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity:{
    version: "0.8.20",
    settings: {
      evmVersion: "shanghai",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  networks: {
    hardhat: {
      gas: 12000000, 
      blockGasLimit: 0x1fffffffffffff, // Maximum gas limit
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${infuraKey}`,
      accounts: [privateKey]
    },
    amoy: {
      url: `https://polygon-amoy.infura.io/v3/${infuraKey}`,
      accounts: [privateKey]
    }
  },
  etherscan: {
    apiKey: etherscanKey
  },
  sourcify: {
    enabled: true
  }
};