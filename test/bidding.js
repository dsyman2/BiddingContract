var BiddingContract = artifacts.require("./BiddingContract.sol")


contract('biddingdontract', function(accounts) {

  
  // Test Case#1
  it("Total guesses should be 2 after guessing twice times", function() {
    var biddingdontract;
    var old_balance;
    return BiddingContract.deployed().then(function(instance){
      biddingdontract = instance;
      console.log('Contract address:', biddingdontract.address);
      return biddingdontract.getHighBid();
      }).then(function(result){
        console.log(web3.fromWei(result.toNumber(), 'ether'));
        return biddingdontract.placeBid('albert', {from:accounts[0], value:web3.toWei(2, 'ether')});
      }).then(function(result){
        console.log(result.logs[0].event);
        console.log(result.logs[0].args);
        assert.equal('HighBidChanged',result.logs[0].event);
        return biddingdontract.placeBid('marc', {from:accounts[1], value:web3.toWei(1, 'ether')});
      }).then(function(result){
        console.log(result.logs[0].event);
        console.log(result.logs[0].args);
        assert.equal('BidFailed',result.logs[0].event);
        return biddingdontract.getHighBid();
      }).then(function(result){
        console.log(web3.fromWei(result.toNumber(), 'ether'));
        assert.equal(web3.fromWei(result.toNumber(), 'ether'), 2);
        return web3.eth.getBalance(accounts[1]);
      }).then(function(result){
        console.log("Marc balance:", web3.fromWei(result.toNumber(), 'ether'));
        old_balance = result.toNumber();
        return biddingdontract.claimBidAmount({from:accounts[1]});
      }).then(function(){
        return web3.eth.getBalance(accounts[1]);
      }).then(function(result){
        console.log("Marc balance:", result.toNumber());
        assert.isTrue(result.toNumber() > old_balance);
        return web3.eth.getBalance(accounts[0]);
      }).then(function(result){
        console.log("Albert balance:", result.toNumber());
        return biddingdontract.bidEnd({from:accounts[0]});
      }).then(function(result){
        return web3.eth.getBalance(accounts[0]);
      }).then(function(result){
        console.log("Albert balance:", result.toNumber());
        return biddingdontract.placeBid('marc', {from:accounts[1], value:web3.toWei(1, 'ether')});
     });
  })

/*  
  // Test Case#2
  it("should the correct amount of ehter in player's balance after betting", function() {
    var biddingdontract;
    return BiddingContract.deployed().then(function(instance){
      biddingdontract = instance;
      return web3.eth.getBalance(albert_address);
      }).then(function(result){
        console.log('Albert balance', web3.fromWei(result.toNumber(), 'ether'));
        old_albert_balance = result.toNumber();
        return biddingdontract.guess(7, 'Albert', {from: albert_address, value:web3.toWei(2, 'ether')});
      }).then(function(result){
        assert.equal('LosingBet',result.logs[0].event );
        return web3.eth.getBalance(albert_address);
      }).then(function(result){
        console.log('Albert balance after betting', web3.fromWei(result.toNumber(), 'ether'));
        assert.isTrue(result.toNumber() < old_albert_balance, 'Albert balance should less than before')
        return web3.eth.getBalance(bob_address);
      }).then(function(result){
        console.log('Bob balance', web3.fromWei(result.toNumber(), 'ether'));
        old_bob_balance = result.toNumber();
        return biddingdontract.guess(1, 'Bob', {from: bob_address, value:web3.toWei(2, 'ether')});
      }).then(function(result){
        assert.equal('WinningBet',result.logs[0].event );
        return web3.eth.getBalance(bob_address);
      }).then(function(result){
        console.log('Bob balance after betting', web3.fromWei(result.toNumber(), 'ether'));
        assert.isTrue(result.toNumber() > old_bob_balance, 'Bob balance should greater than before')
        return biddingdontract.bidEnd(1, 'Bob', {from: bob_address, value:web3.toWei(2, 'ether')});
      })
  })
  
  /*
  // Test Case#3
  it("Last winner/checking winner should be bob/cinder", function() {
    var biddingdontract;
    return BiddingContract.deployed().then(function(instance){
      biddingdontract = instance;
      return biddingdontract.getLastWinnerInfo.call();
      }).then(function(result){
        console.log('Last winner info:', result);
        assert.equal(result[0].toString(), bob_address, "Last winner addr should be Bob addr");
        assert.equal(result[1].toString(), 'Bob', "Last winner should be Bob");
        assert.equal(result[2].toNumber(), 1, "Last winner guess should be 1");
        assert.equal(web3.fromWei(result[4].toNumber(), 'ether'), 2, "Last winner bet should be 2");
        return biddingdontract.checkWinning(cindy_address);
      }).then(function(result){
        console.log('check winning result:', result);
        assert.equal(result[0].toString(), cindy_address, "Checking winner addr should be Cinder addr");
        assert.equal(result[1].toString(), 'Cindy', "Checking winner should be Cindy");
        assert.equal(result[2].toNumber(), 1, "Checking winner guess should be 1");
        assert.equal(web3.fromWei(result[4].toNumber(), 'ether'), 2, "Checking winner bet should be 2");
    });
  })

  
  // Test Case#4
  it("Check Last winner time", function() {
    var biddingdontract;
    return BiddingContract.deployed().then(function(instance){
      biddingdontract = instance;
      return biddingdontract.daysSinceLastWinning.call();
    }).then(function(result){
      console.log("Days since last winning:", result.toNumber());
      return biddingdontract.hoursSinceLastWinning.call()
    }).then(function(result){
      console.log("Hours since last winning:", result.toNumber());
      return biddingdontract.minutesSinceLastWinning.call()
    }).then(function(result){
      console.log("Minutes since last winning:", result.toNumber());
    });
  })

    
  // Test Case#5
  it("Check Owner Withdraw", function() {
    var biddingdontract;
    var old_balance;
    return BiddingContract.deployed().then(function(instance){
      biddingdontract = instance;
      
      return web3.eth.getBalance(albert_address)
    }).then(function(result){
      old_balance = result.toNumber();
      var returnFund = web3.toWei(3, 'ether');
      return biddingdontract.ownerWithdraw(returnFund,{form:albert_address});
    }).then(function(result){
      console.log(result);
      return web3.eth.getBalance(albert_address);
    }).then(function(result){
      console.log("old_balance:", old_balance);
      console.log("new_balance:", result.toNumber());
      assert.isTrue(result.toNumber() > old_balance);
    });
  })
*/

});
