var BiddingContract = artifacts.require("./BiddingContract.sol");


module.exports = function(deployer) {
  deployer.deploy(BiddingContract, 'assertBid', 'test bid', 86400, web3.toWei(1, 'ether'));
};
