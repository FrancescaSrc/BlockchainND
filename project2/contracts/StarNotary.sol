pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    string public name = "My little stars";
    string public symbol = "MLS";
    

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    //  looks up the stars using the Token ID, and then returns the name of the star
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        require(bytes(tokenIdToStarInfo[_tokenId].name).length > 0, "Unknown star");
        //You should return the Star saved in tokenIdToStarInfo mapping
        return tokenIdToStarInfo[_tokenId].name;
    }
   

    // Implement Task 1 Exchange Stars function
    // allows 2 users to exchange their star tokens..
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
        address ownerAddress1 = ownerOf(_tokenId1);
        address ownerAddress2 = ownerOf(_tokenId2);
         // Use _transferFrom function to exchange the tokens.
        require(ownerAddress1 == msg.sender || ownerAddress2== msg.sender, "you are not the owner");
        _transferFrom(ownerAddress1, ownerAddress2, _tokenId1);
        _transferFrom(ownerAddress2, ownerAddress1, _tokenId2);
            
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
         address ownerAddress = ownerOf(_tokenId);
          //1. Check if the sender is the ownerOf(_tokenId)
        require(msg.sender ==ownerAddress, "unknown owner");
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        _transferFrom(msg.sender, _to1, _tokenId);
              
        
    }

}
