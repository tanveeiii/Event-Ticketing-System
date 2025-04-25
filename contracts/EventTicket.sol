// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicket is ERC721URIStorage, Ownable {
    uint public nextTokenId;
    uint public eventIdCounter;

    struct Event {
        string name;
        uint256 date;
        uint price;
        uint totalTickets;
        uint ticketsSold;
        address organizer;
    }

    mapping(uint => Event) public events;
    mapping(uint => uint) public ticketToEvent;
    mapping(uint => bool) public ticketValidity;

    constructor() ERC721("EventTicket", "ETIX") {}

    function createEvent(
        string memory name,
        uint date,
        uint price,
        uint totalTickets
    ) external {
        require(date > block.timestamp, "Event must be in the future");
        require(totalTickets > 0, "Tickets must be more than 0");

        events[eventIdCounter] = Event(
            name,
            date,
            price,
            totalTickets,
            0,
            msg.sender
        );

        eventIdCounter++;
    }

    function buyTicket(uint eventId, string memory tokenURI) external payable {
        Event storage _event = events[eventId];
        require(_event.date != 0, "Event does not exist");
        require(block.timestamp < _event.date, "Event already occurred");
        require(_event.ticketsSold < _event.totalTickets, "Sold out");
        require(msg.value == _event.price, "Incorrect amount");

        _event.ticketsSold++;
        uint tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        ticketToEvent[tokenId] = eventId;
        ticketValidity[tokenId] = true;

        address payable organizer = payable(_event.organizer);
        organizer.transfer(msg.value);
    }

    function resellTicket(address to, uint tokenId) external payable {
        require(ownerOf(tokenId) == msg.sender, "Not the ticket owner");

        uint resalePrice = msg.value;

        require(resalePrice > 0, "Resale price must be greater than 0");

        ticketValidity[tokenId] = false;
        _transfer(msg.sender, to, tokenId);

        address payable seller = payable(msg.sender);
        seller.transfer(resalePrice);
    }

    function invalidateTicket(uint tokenId) external onlyOwner {
        ticketValidity[tokenId] = false;
    }

    function isTicketValid(uint tokenId) external view returns (bool) {
        return ticketValidity[tokenId];
    }
}
