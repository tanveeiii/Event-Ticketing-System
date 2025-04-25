// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IEventTicket {
    function transferFrom(address from, address to, uint256 tokenId) external;

    function ownerOf(uint256 tokenId) external view returns (address);

    function isTicketValid(uint tokenId) external view returns (bool);
}

// Contract to resell tickets in the marketplace
contract TicketMarketplace {
    struct Listing {
        address seller;
        uint price;
    }

    address public eventTicketAddress;
    mapping(uint => Listing) public listings;

    constructor(address _eventTicketAddress) {
        eventTicketAddress = _eventTicketAddress;
    }

    function listTicket(uint tokenId, uint price) external {
        IEventTicket ticket = IEventTicket(eventTicketAddress);

        require(ticket.ownerOf(tokenId) == msg.sender, "Not the ticket owner");
        require(ticket.isTicketValid(tokenId), "Ticket is invalid");
        require(price > 0, "Price must be greater than 0");

        listings[tokenId] = Listing(msg.sender, price);
    }

    function cancelListing(uint tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        delete listings[tokenId];
    }

    function buyTicket(uint tokenId) external payable {
        Listing memory item = listings[tokenId];
        require(item.price > 0, "Ticket not for sale");
        require(msg.value == item.price, "Incorrect payment");

        // Transfer the ticket
        IEventTicket(eventTicketAddress).transferFrom(
            item.seller,
            msg.sender,
            tokenId
        );

        // Pay the seller
        payable(item.seller).transfer(msg.value);

        // Remove listing
        delete listings[tokenId];
    }

    function getListing(
        uint tokenId
    ) external view returns (address seller, uint price) {
        Listing memory item = listings[tokenId];
        return (item.seller, item.price);
    }
}
