import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

async function deploy() {
  const Bids = await ethers.getContractFactory('Bids');
  const bids = await Bids.deploy();
  await bids.deployed();

  return bids;
}

async function sayHello(bids: any) {
  console.log('I\'m bidding!: ', await bids.hello());
}

deploy();//.then(sayHello); 