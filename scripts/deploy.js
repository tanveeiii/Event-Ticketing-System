// const hardhat = import("hardhat");
const { ethers } = require ("hardhat")
// import { ethers } from "hardhat"
async function main(){
    const contract = await ethers.getContractFactory("Event")
    const myContract = await contract.deploy()
    await myContract.waitForDeployment()
    const add = await myContract.getAddress()
    console.log("deployed address: ", add)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });