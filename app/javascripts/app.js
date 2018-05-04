// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import biddingcontract_artifacts from '../../build/contracts/BiddingContract.json'

// BiddingContract is our usable abstraction, which we'll use through the code below.
var BiddingContract = contract(biddingcontract_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

function addEventTableItem(tableId, childData, len) {
  var table = document.getElementById(tableId);
  var num = table.rows.length
  
  //console.log(num);
  if (table.rows.length >= len) {
    var i = table.rows.length - 1; // last child
    table.deleteRow(i);
  }

  var Tr = table.insertRow(0);
  var Td = Tr.insertCell(Tr.cells.length);
  var p = document.createElement('A');
  p.text = childData.name;
  Td.appendChild(p);

  Td = Tr.insertCell(Tr.cells.length);
  var p = document.createElement('A');
  p.text = childData.amount;
  Td.appendChild(p);

  Td = Tr.insertCell(Tr.cells.length);
  var aLink = document.createElement('A')
  aLink.text = childData.addr;
    Td.appendChild(aLink);
}

function clearTable(tableId) {
  var table = document.getElementById(tableId);
  for (var i = table.childNodes.length - 1; i >= 0; i--) {
    //console.log(table.childNodes[i]);
    table.removeChild(table.childNodes[i]);
  }
}


window.App = {
  start: function() {
    var self = this;

    // Bootstrap the BiddingContract abstraction for Use.
    BiddingContract.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        console.log(err);
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      console.log('account:', account);

      self.refreshBalance();
      self.watchHighBidEvent();
      self.watchFailedBidEvent();
    });
  },

  getItem: function() {
    var self = this;
    var biddingcontract;
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      console.log('XXXX');
      return biddingcontract.getItemInfo();
    }).then(function(result){
        console.log(result);
        var  item_name = document.getElementById("item_name");
        item_name.innerHTML = result[0].toString();
        var  item_description = document.getElementById("item_description");
        item_description.innerHTML = result[1].toString();
        var  item_duration = document.getElementById("item_duration");
        item_duration.innerHTML = result[2].toNumber();
        var  item_started_price = document.getElementById("item_started_price");
        item_started_price.innerHTML = web3.fromWei(result[3].toNumber(), 'ether');
        return biddingcontract.getHighBid()
      }).then(function(result){
        var  hight_price = document.getElementById("hight_price");
        hight_price.innerHTML = web3.fromWei(result.toNumber(), 'ether');
      })
  },


  sendBid: function() {
    var self = this;
    var biddingcontract;
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      var bid_amount = parseFloat(document.getElementById("bid_amount").value);
      var bid_name = document.getElementById("bid_name").value;
      var account_num = parseInt(document.getElementById("account_num").value);
      console.log('bid_name:', bid_name);
      console.log('bid_amount:', bid_amount);
      return biddingcontract.placeBid(bid_name, {from:accounts[account_num], value:web3.toWei(bid_amount, 'ether'), gas:470000});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  
  claimBid: function() {
    var self = this;
    var biddingcontract;
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      var claim_account_num = parseInt(document.getElementById("claim_account_num").value);
      biddingcontract.claimBidAmount({from:accounts[claim_account_num]});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  suicide: function(){
    var self = this;
    var biddingcontract;
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      biddingcontract.bidEnd({from:account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },


  watchHighBidEvent: function(){
    var self = this;

    /* Load Event */

    var biddingcontract;
    clearTable('highBidEventTable');
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      var additionalFilterOptions = {
        "fromBlock": "0",
        "toBlock": "latest"
      };
      //event NumberSetEvent(address indexed caller, bytes32 indexed oldNum, bytes32 indexed newNum);
      var indexedEventValues = {};
      var event = biddingcontract.HighBidChanged(indexedEventValues, additionalFilterOptions);
      return event.watch(function(error, result){
        if(error){
          console.log(error)
        } else {

          //console.log(result.args);
          var watchEvent = {
            //'name': web3.toAscii(result['args']['name']),
            'addr': result['args']['addr'],
            'name': result['args']['name'],
            'amount': web3.fromWei(result['args']['newHighBid'].toNumber(), 'ether'),
          }
          console.log(watchEvent);
          addEventTableItem('highBidEventTable', watchEvent);
        }
      })
    });
  },


  watchFailedBidEvent: function(){
    var self = this;

    /* Load Event */

    var biddingcontract;
    clearTable('failedBidEventTable');
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      var additionalFilterOptions = {
        "fromBlock": "0",
        "toBlock": "latest"
      };
      //event NumberSetEvent(address indexed caller, bytes32 indexed oldNum, bytes32 indexed newNum);
      var indexedEventValues = {};
      var event = biddingcontract.BidFailed(indexedEventValues, additionalFilterOptions);
      return event.watch(function(error, result){
        if(error){
          console.log(error)
        } else {

          console.log(result.args);
          var watchEvent = {
            //'name': web3.toAscii(result['args']['name']),
            'addr': result['args']['addr'],
            'name': result['args']['name'],
            'amount': web3.fromWei(result['args']['amount'].toNumber(), 'ether'),
          }
          console.log(watchEvent);
          addEventTableItem('failedBidEventTable', watchEvent);
        }
      })
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;
    self.getItem();
    var biddingcontract;
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      var contract_address_element = document.getElementById("contract_address");
      contract_address_element.innerHTML = biddingcontract.address;
      return web3.eth.getBalance(biddingcontract.address, function(error, result){
        if (error) {
          console.log(error);

        } else {
          var contract_balance_element = document.getElementById("contract_balance");
          console.log(web3.fromWei(result.toNumber()));
          contract_balance_element.innerHTML = web3.fromWei(result.toNumber(), 'ether');
        }
      });
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var biddingcontract;
    BiddingContract.deployed().then(function(instance) {
      biddingcontract = instance;
      return biddingcontract.sendCoin(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  //if (typeof web3 !== 'undefined') {
  if (false) {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 BiddingContract, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-biddingcontractmask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-biddingcontractmask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
