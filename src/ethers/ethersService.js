const { formatEther, JsonRpcProvider } = require('ethers');

// Create a provider using Infura
const INFURA_ID = 'd404f2d478314b50b2498dcfa1652902';
const provider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);

const CONTRACT_ADDRESS = '0xa57F3911D1f21E3033bA1D4CDc2987a4B280658D';

const main = async () => {
    const balance = await provider.getBalance('0xd7830925daf4a323c3781a57c4aa57a512838743');
    console.log("Balance:", formatEther(balance), "ETH");
};

main();
