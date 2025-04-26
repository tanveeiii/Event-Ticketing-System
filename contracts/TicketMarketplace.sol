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
    uint[] public listedTokenIds;
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
        listedTokenIds.push(tokenId); // <-- add to array
    }

    function cancelListing(uint tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        delete listings[tokenId];
        _removeTokenId(tokenId); // <-- remove from array
    }

    function buyTicket(uint tokenId) external payable {
        Listing memory item = listings[tokenId];
        require(item.price > 0, "Ticket not for sale");
        require(msg.value == item.price, "Incorrect payment");

        IEventTicket(eventTicketAddress).transferFrom(
            item.seller,
            msg.sender,
            tokenId
        );
        payable(item.seller).transfer(msg.value);

        delete listings[tokenId];
        _removeTokenId(tokenId); // <-- remove from array
    }

    function getListing(
        uint tokenId
    ) external view returns (address seller, uint price) {
        Listing memory item = listings[tokenId];
        return (item.seller, item.price);
    }

    function _removeTokenId(uint tokenId) internal {
        for (uint i = 0; i < listedTokenIds.length; i++) {
            if (listedTokenIds[i] == tokenId) {
                listedTokenIds[i] = listedTokenIds[listedTokenIds.length - 1];
                listedTokenIds.pop();
                break;
            }
        }
    }

    function getAllListings()
        external
        view
        returns (Listing[] memory, uint[] memory)
    {
        Listing[] memory allListings = new Listing[](listedTokenIds.length);
        for (uint i = 0; i < listedTokenIds.length; i++) {
            allListings[i] = listings[listedTokenIds[i]];
        }
        return (allListings, listedTokenIds);
    }
}
