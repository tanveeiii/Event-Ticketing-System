async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const EventTicket = await ethers.getContractFactory("EventTicket");
    const eventTicket = await EventTicket.deploy();
    await eventTicket.waitForDeployment()
    console.log(eventTicket.deploymentTransaction())
    const contractAdd = await eventTicket.getAddress()
    console.log("EventTicket deployed to:", contractAdd );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });