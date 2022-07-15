// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

enum Games {
    Game1,
    Game2,
    Game3
}

struct BidGame {
    string name;
    Games id;
    uint8 earningsLocal;
    uint8 earningsVisitor;
}

struct Bid {
    Games id;
    uint256 bidLocal;
    uint256 bidVisitor;
}

struct Winner {
    Games id;
    address winner;
}

contract Bids {
    Winner[] winners;
    bool areBidsOpen = true;

    mapping(address => Bid[]) addressesToBids;

    event BidPerformed();
    event CloseBids();

    function getOpenGamesForBids() public pure returns (BidGame[3] memory) {
        return [
            BidGame("football", Games.Game1, 15, 2),
            BidGame("tennis", Games.Game2, 8, 4),
            BidGame("basketball", Games.Game3, 3, 30)
        ];
    }

    function getBiddableState() public view returns (bool) {
        return areBidsOpen;
    }

    function setBidWinner(string calldata name, Games game) public {
        // Super duper unsecure
    }

    function getBidsResults() public {
        // I should return here the actual ammount of bids and the winner of the bids
    }

    function getAddressedBids() public view returns (Bid[] memory) {
        return addressesToBids[msg.sender];
    }

    function bidForAGame(
        Games game,
        uint256 bidLocal,
        uint256 bidVisitor
    ) public payable {
        uint256 totalBid = bidLocal + bidVisitor;

        require(msg.value != totalBid, "You don't send enaugh money");

        if (areBidsOpen) {
            addressesToBids[msg.sender].push(Bid(game, bidLocal, bidVisitor));
        } else {
            revert("Bids are already closed!");
        }
        emit BidPerformed();
    }

    function closeContractBids() public {
        areBidsOpen = false;
        emit CloseBids();
    }

    fallback() external {
        revert("missfounded method");
    }
}
