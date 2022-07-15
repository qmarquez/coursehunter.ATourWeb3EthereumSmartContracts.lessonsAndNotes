import { ethers } from "ethers";
import BidsContractJSON from '../artifacts/contracts/Bids.sol/Bids.json'
let bidsState: 'Open' | 'Closed' = 'Open';

interface OpenBids {
  name: string
  id: number
  earningsLocal: number
  earningsVisitor: number
}

interface MyBids {
  id: number
  bidLocal: ethers.BigNumber
  bidVisitor: ethers.BigNumber
}

function getEth() {
  // @ts-ignore
  const eth = window.ethereum;
  if (!eth) {
    throw new Error("Get metamask");
  }
  return eth;
}

async function hasAccounts() {
  const eth = getEth();
  const accounts = await eth.request({ method: 'eth_accounts' }) as string[];

  return accounts && accounts.length;
}

async function requestAccounts() {
  const eth = getEth();
  const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];

  return accounts && accounts.length;
}

async function setup() {
  if (!await hasAccounts() && ! await requestAccounts()) {
    throw new Error('Please, let me access metamask');
  }

  const bids = new ethers.Contract(
    '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    BidsContractJSON.abi,
    new ethers.providers.Web3Provider(getEth()).getSigner()
  );

  const openBids = await bids.getOpenGamesForBids();
  const myBids = await bids.getAddressedBids();

  bids.on(bids.filters.CloseBids(), function () {
    bidsState = 'Closed';
    alert('bids are already close cowboy!');
  });

  bids.on(bids.filters.BidPerformed(), async function () {
    const myBids = await bids.getAddressedBids();
    printMyBids(myBids, openBids);
  });


  createBidder(bids, openBids);
  printMyBids(myBids, openBids);
  createBidsCloser(bids);
}

function createBidder(bidsContract, openBids: OpenBids[]) {
  for (const { name, earningsVisitor, earningsLocal, id } of openBids) {
    const bidTitle = document.createElement('div');
    bidTitle.innerText = `Make your winner bid! [${name}]`;

    const bidVisitorAmmountInput = document.createElement('input');
    bidVisitorAmmountInput.type = 'number';
    bidVisitorAmmountInput.placeholder = 'Visitor';
    bidVisitorAmmountInput.style.width = '150px';
    bidVisitorAmmountInput.style.margin = '20px 3px 20px 25px';

    const earningsVisitorLabel = document.createElement('span');
    earningsVisitorLabel.innerText = `(paids x${earningsVisitor})`;
    earningsVisitorLabel.style.marginRight = '10px';

    const bidLocalAmmountInput = document.createElement('input');
    bidLocalAmmountInput.type = 'number';
    bidLocalAmmountInput.placeholder = 'Local';
    bidLocalAmmountInput.style.width = '150px';
    bidLocalAmmountInput.style.margin = '20px 3px 20px 10px';

    const earningsLocalLabel = document.createElement('span');
    earningsLocalLabel.innerText = `(paids x${earningsLocal})`;
    earningsLocalLabel.style.marginRight = '50px';

    const bidButton = document.createElement('button');
    bidButton.innerText = `Bid for ${name}`;
    bidButton.onclick = async function () {
      if (bidsState === 'Open') {
        const bidLocalAmmount = ethers.utils.parseEther(bidLocalAmmountInput.value || '0');
        const bidVisitorAmmount = ethers.utils.parseEther(bidVisitorAmmountInput.value || '0');
        await bidsContract.bidForAGame(id, bidLocalAmmount, bidVisitorAmmount, {
          value: bidLocalAmmount.add(bidVisitorAmmount)
        });
      } else {
        alert('bids are already close cowboy!');
        bidButton.disabled = true;
      }
    }

    const bidderContainer = document.createElement('div');
    bidderContainer.appendChild(bidTitle);
    bidderContainer.appendChild(bidVisitorAmmountInput);
    bidderContainer.appendChild(earningsVisitorLabel);
    bidderContainer.appendChild(bidLocalAmmountInput);
    bidderContainer.appendChild(earningsLocalLabel);
    bidderContainer.appendChild(bidButton);
    document.body.appendChild(bidderContainer);
  }

}

function printMyBids(myBids: MyBids[], openBids: OpenBids[]) {
  const myBidsContainer = document.getElementById('myBidsTicket') || document.createElement('div');
  myBidsContainer.id = 'myBidsTicket';
  myBidsContainer.replaceChildren();

  for (const { bidLocal, bidVisitor, id } of myBids) {
    const bidLocalEther = ethers.utils.formatEther(bidLocal);
    const bidVisitorEther = ethers.utils.formatEther(bidVisitor);

    const myBidLine = document.createElement('div');
    myBidLine.innerText = `${openBids.find(({ id: gameId }) => gameId === id).name} | LOCAL: ${bidLocalEther} eth | VISITOR: ${bidVisitorEther} eth`
    myBidsContainer.appendChild(myBidLine);
  }

  if (!document.getElementById('myBidsTicket')) {
    document.body.appendChild(myBidsContainer);
  }
}


function createBidsCloser(bidsContract) {
  const bidButton = document.createElement('button');
  bidButton.innerText = `Close the bids!`;
  bidButton.onclick = async function () {
    await bidsContract.closeContractBids();
    console.log('Bids are closed!');
  }
  document.body.appendChild(bidButton);
}

setup();