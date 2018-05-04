pragma solidity ^0.4.4;

contract BiddingContract {


    address public owner;
    string public itemName;
    string public itemDescription;
    uint public itemDuration;
    uint public startBid;
    //uint createAt;

    struct Bidder{
        address bidder;
        string name;
        uint bidAmount;
        bool claimedEthers;
        //uint bidAt;
    }

    event HighBidChanged(address indexed addr, string name, uint newHighBid);
    event BidFailed(address indexed addr,string name, uint amount);
    Bidder highBidder;
    address highBidderAddr;
    
    mapping(address => Bidder) bidderMapping;

    modifier ownerOnly{
        require(msg.sender == owner);
        _;
    }

    function BiddingContract(string nm, string descr, uint dur, uint bid) public {
        // constructor
        itemName = nm;
        itemDescription = descr;
        itemDuration = dur;
        startBid = bid;
        owner = msg.sender;
    }

    function getItemInfo() public view returns (string, string, uint, uint){
        return (itemName, itemDescription, itemDuration, startBid);
    }

    function getHighBid() public view returns (uint){
        if (highBidderAddr == address(0x0)){
            return startBid;
        }
        return bidderMapping[highBidderAddr].bidAmount;
    }

    function placeBid(string nm) public payable {
        
        uint bid = msg.value;
        address sender = msg.sender;
        require(bidderMapping[msg.sender].bidder == address(0x0));
        Bidder highBidder = bidderMapping[highBidderAddr];
        bidderMapping[sender] = Bidder(sender, nm, bid, false);

        if(bid > highBidder.bidAmount){
            highBidderAddr = sender;
            HighBidChanged(sender, nm, bid);
        } else {
            BidFailed(sender, nm, bid);
        }
    }

    function claimBidAmount() public{
        require(bidderMapping[msg.sender].bidder != address(0x0));
        require(bidderMapping[msg.sender].claimedEthers == false);
        require(msg.sender != highBidderAddr);
        msg.sender.transfer(bidderMapping[msg.sender].bidAmount);
        bidderMapping[msg.sender] = Bidder(address(0x0), "", 0, false);
    }

    function bidEnd() public ownerOnly{
        selfdestruct(owner);
    }
}
