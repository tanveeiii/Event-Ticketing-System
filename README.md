# Event Ticketing System (Decentralized)

A fully decentralized event ticketing system built on the Ethereum blockchain using smart contracts and NFTs (ERC-721). This platform enables event organizers to create events and issue NFT-based tickets, while allowing users to buy, sell, and verify tickets securely without intermediaries.

## Tech Stack

- **Smart Contracts:** Solidity, OpenZeppelin (ERC-721)
- **Blockchain Development:** Truffle, Ganache
- **Frontend:** React.js, Web3.js
- **Wallet Integration:** MetaMask
- **Local Blockchain:** Ganache

## Features

- Organizer can create events
- NFT-based ticket generation using ERC-721
- Ticket purchase and ownership via MetaMask
- Secondary market transfers (resale)
- Event and ticket details stored on-chain
- Full transparency and traceability

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Truffle (`npm install -g truffle`)
- Ganache (GUI or CLI)
- MetaMask browser extension

### Clone the Repository

```bash
git clone https://github.com/tanveeiii/Event-Ticketing-System.git
cd Event-Ticketing-System

```

### Install dependencies

```bash
npm i
```
### Compile and deploy your smart contract on ganache

```bash
npx truffle compile
npx truffle migrate
```

### .env Configuration

After deploying the smart contract, create a .env file and add the addresses of the deployed contracts into it.

```env
VITE_EVENT_TICKET_ADDRESS="Address of EventTicket smart contract"
VITE_TICKET_MARKETPLACE_ADDRESS="Address of TicketMarketplace contract"
```

### Start ganache

- Open ganache or run it via cli.
- Copy one of the account private keys and import it into MetaMask.
- Connect MetaMask to http://127.0.0.1:7545 (or your ganache port).

### Starting the website

```bash
npm run dev
```
