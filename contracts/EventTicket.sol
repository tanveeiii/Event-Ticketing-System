// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EventTicket
 * @dev A contract for creating and managing event tickets as NFTs
 * Allows organizers to create events and users to purchase tickets
 */
contract EventTicket is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint public nextTokenId;
    uint public eventIdCounter;
    uint public constant MAX_TICKETS_PER_USER = 5; // Maximum tickets a user can buy per event

    // Gas optimization: pack related variables together to use fewer storage slots
    struct Event {
        string name;
        uint256 date;
        string location;
        string description;
        string imageUrl;
        uint price;
        uint totalTickets;
        uint ticketsSold;
        address organizer;
        string category;
        uint maxTicketsPerBuyer; // Each event can set its own ticket purchase limit
    }

    // Storage mappings
    mapping(uint => Event) public events;
    mapping(uint => uint) public ticketToEvent;
    mapping(uint => bool) public ticketValidity;
    
    // Track tickets purchased by each user for each event
    mapping(address => mapping(uint => uint)) public userTicketsPerEvent;
    
    string public calledFallbackFun;

    /**
     * @dev Constructor initializes the NFT with name and symbol
     */
    constructor() ERC721("EventTicket", "ETIX") {}

    // Events for logging important contract activities
    event EventCreated(
        uint indexed eventId,
        string eventName,
        uint256 eventDate,
        uint256 eventPrice,
        uint256 totalTickets,
        string location,
        address indexed organizer,
        uint maxTicketsPerBuyer
    );
    
    event TicketPurchased(
        uint indexed eventId, 
        address indexed buyer, 
        uint tokenId, 
        uint purchaseCount
    );
    
    event PaymentTransferred(address indexed organizer, uint amount);
    event Fallback(string calledFallbackFun);

    /**
     * @dev Fallback function to handle unexpected calls to the contract
     */
    fallback() external payable {
        calledFallbackFun = "Fallback function is executed!";
        emit Fallback(calledFallbackFun);
    }

    /**
     * @dev Receive function to accept ETH payments
     */
    receive() external payable {
        // Allow the contract to receive ETH
    }

    /**
     * @dev Creates a new event with specified parameters
     * @param name Event name
     * @param date Event date (timestamp)
     * @param price Ticket price in wei
     * @param totalTickets Total available tickets
     * @param location Event location
     * @param description Event description
     * @param imageUrl Event image URL
     * @param category Event category
     * @param maxTicketsPerBuyer Maximum tickets a single buyer can purchase (capped by global limit)
     */
    function createEvent(
        string memory name,
        uint date,
        uint price,
        uint totalTickets,
        string memory location,
        string memory description,
        string memory imageUrl,
        string memory category,
        uint maxTicketsPerBuyer
    ) external {
        require(date > block.timestamp, "Event must be in the future");
        require(totalTickets > 0, "Tickets must be more than 0");
        
        // Ensure max tickets per buyer is within global limit
        uint actualMaxTickets = maxTicketsPerBuyer > MAX_TICKETS_PER_USER ? 
                                MAX_TICKETS_PER_USER : 
                                maxTicketsPerBuyer;
        require(actualMaxTickets > 0, "Max tickets per buyer must be positive");

        // Use current value as ID and then increment
        uint currentEventId = eventIdCounter;
        eventIdCounter++;

        // Create event with supplied parameters
        events[currentEventId] = Event({
            name: name,
            date: date,
            location: location,
            description: description,
            imageUrl: imageUrl,
            price: price,
            totalTickets: totalTickets,
            ticketsSold: 0,
            organizer: msg.sender,
            category: category,
            maxTicketsPerBuyer: actualMaxTickets
        });

        // Gas optimization: Emit fewer indexed parameters
        emit EventCreated(
            currentEventId,
            name,
            date,
            price,
            totalTickets,
            location,
            msg.sender,
            actualMaxTickets
        );
    }

    /**
     * @dev Allows a user to buy multiple tickets for an event
     * @param eventId ID of the event
     * @param tokenURIs Array of token URIs for each ticket
     * @param quantity Number of tickets to purchase
     */
    function buyMultipleTickets(
        uint eventId, 
        string[] calldata tokenURIs, 
        uint quantity
    ) external payable nonReentrant {
        Event storage _event = events[eventId];
        require(_event.date != 0, "Event does not exist");
        require(block.timestamp < _event.date, "Event already occurred");
        
        // Check available tickets
        require(_event.ticketsSold + quantity <= _event.totalTickets, "Not enough tickets available");
        
        // Check if buyer is within their limit
        uint currentUserTickets = userTicketsPerEvent[msg.sender][eventId];
        require(currentUserTickets + quantity <= _event.maxTicketsPerBuyer, "Exceeds maximum tickets per buyer");
        
        // Check correct payment amount
        require(msg.value == _event.price * quantity, "Incorrect payment amount");
        
        // Check tokenURIs array length matches quantity
        require(tokenURIs.length == quantity, "Token URIs don't match quantity");

        // Update user's ticket count for this event
        userTicketsPerEvent[msg.sender][eventId] += quantity;
        
        // Mint tickets
        uint[] memory tokenIds = new uint[](quantity);
        for (uint i = 0; i < quantity; i++) {
            uint tokenId = nextTokenId++;
            tokenIds[i] = tokenId;
            
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            ticketToEvent[tokenId] = eventId;
            ticketValidity[tokenId] = true;
        }
        
        // Update event ticket count
        _event.ticketsSold += quantity;
        
        // Gas optimization: Transfer funds only once after minting all tickets
        payable(_event.organizer).transfer(msg.value);
        
        emit TicketPurchased(eventId, msg.sender, tokenIds[0], quantity);
        emit PaymentTransferred(_event.organizer, msg.value);
    }

    /**
     * @dev Legacy function to buy a single ticket (maintained for backward compatibility)
     * @param eventId ID of the event
     * @param tokenURI Token URI for the ticket
     */
    function buyTicket(uint eventId, string memory tokenURI) external payable nonReentrant {
        Event storage _event = events[eventId];
        require(_event.date != 0, "Event does not exist");
        require(block.timestamp < _event.date, "Event already occurred");
        require(_event.ticketsSold < _event.totalTickets, "Sold out");
        
        // Check if buyer is within their limit
        uint currentUserTickets = userTicketsPerEvent[msg.sender][eventId];
        require(currentUserTickets < _event.maxTicketsPerBuyer, "Exceeds maximum tickets per buyer");
        
        require(msg.value == _event.price, "Incorrect amount");

        // Update user's ticket count for this event
        userTicketsPerEvent[msg.sender][eventId]++;
        
        // Update event ticket count
        _event.ticketsSold++;
        
        // Mint ticket
        uint tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        ticketToEvent[tokenId] = eventId;
        ticketValidity[tokenId] = true;

        payable(_event.organizer).transfer(msg.value);
        
        emit TicketPurchased(eventId, msg.sender, tokenId, 1);
        emit PaymentTransferred(_event.organizer, msg.value);
    }

    /**
     * @dev Allows event organizer to invalidate a ticket
     * @param tokenId ID of the ticket to invalidate
     */
    function invalidateTicket(uint tokenId) external {
        uint eventId = ticketToEvent[tokenId];
        Event storage _event = events[eventId];
        
        // Only organizer or contract owner can invalidate tickets
        require(
            msg.sender == _event.organizer || msg.sender == owner(),
            "Only organizer or owner can invalidate"
        );
        
        ticketValidity[tokenId] = false;
    }

    /**
     * @dev Checks if a ticket is valid
     * @param tokenId ID of the ticket to check
     * @return Boolean indicating if the ticket is valid
     */
    function isTicketValid(uint tokenId) external view returns (bool) {
        return ticketValidity[tokenId];
    }

    /**
     * @dev Gets all ticket IDs owned by a user
     * @param user Address of the user
     * @return Array of ticket IDs owned by the user
     */
    function getTicketsOfUser(address user) external view returns (uint[] memory) {
        // Gas optimization: Count first to allocate exact array size
        uint totalTokens = nextTokenId;
        uint count = 0;

        for (uint i = 0; i < totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == user) {
                count++;
            }
        }

        uint[] memory ticketIds = new uint[](count);
        uint index = 0;

        for (uint i = 0; i < totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == user) {
                ticketIds[index] = i;
                index++;
            }
        }

        return ticketIds;
    }

    /**
     * @dev Gets user's ticket count for a specific event
     * @param user Address of the user
     * @param eventId ID of the event
     * @return Number of tickets the user has for the event
     */
    function getUserTicketCount(address user, uint eventId) external view returns (uint) {
        return userTicketsPerEvent[user][eventId];
    }

    /**
     * @dev Gets event details from a ticket ID
     * @param tokenId ID of the ticket
     * @return Event details
     */
    function getEventFromToken(uint256 tokenId) external view returns (Event memory) {
        require(_exists(tokenId), "Token does not exist");
        uint eventId = ticketToEvent[tokenId];
        return events[eventId];
    }

    /**
     * @dev Allows organizer to add more tickets to an event
     * @param eventId ID of the event
     * @param additionalTickets Number of tickets to add
     */
    function addTickets(uint eventId, uint additionalTickets) external {
        Event storage _event = events[eventId];
        
        // Only organizer can add tickets
        require(msg.sender == _event.organizer, "Only organizer can add tickets");
        require(additionalTickets > 0, "You must add at least 1 ticket");
        
        _event.totalTickets += additionalTickets;
    }

    /**
     * @dev Allows organizer to update maximum tickets per buyer
     * @param eventId ID of the event
     * @param newMaxTickets New maximum tickets per buyer (capped by global limit)
     */
    function updateMaxTicketsPerBuyer(uint eventId, uint newMaxTickets) external {
        Event storage _event = events[eventId];
        
        // Only organizer can update ticket limit
        require(msg.sender == _event.organizer, "Only organizer can update ticket limit");
        
        // Ensure new limit is within global limit
        uint actualMaxTickets = newMaxTickets > MAX_TICKETS_PER_USER ? 
                                MAX_TICKETS_PER_USER : 
                                newMaxTickets;
        require(actualMaxTickets > 0, "Max tickets per buyer must be positive");
        
        _event.maxTicketsPerBuyer = actualMaxTickets;
    }
}