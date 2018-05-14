
var globalNumBikes;

var bike_owner = [];
var bike_mfg = [];
var bike_sn = [];

var storeOwner;  //to pre-check before sending to ether
var bikeOwner;
var currAddress;



function addTransactionToDOM(ob, transactionsDiv){
  //start a virtual unordered list (list with bullets - no numbers)
  var ul = $('<ul>');

  //the tx is in a key in ob, so we get to it directly
  var firstLi = $('<li>');
  var txTerm = $('<span>').html('<strong>tx</strong>').addClass('right-margin-5');
  var txVal = $('<span>').html(ob.tx);
  firstLi.append(txTerm);
  firstLi.append(txVal);

  ul.append(firstLi);

  //the rest of the data are grand childs of ob in ob.receipt

  var li, term, val;

  for (key in ob.receipt){
    li = $('<li>');
    term = $('<span>').html(`<strong>${key}</strong>`).addClass('right-margin-5');
    val = $('<span>').html(ob.receipt[key]);

    li.append(term)
    li.append(val);

    ul.append(li);
  }

  //we add the virtual unordered list onto the html
  transactionsDiv.append(ul);
}

App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Bikes.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var BikesArtifact = data;
      App.contracts.Bikes = TruffleContract(BikesArtifact);

      // Set the provider for our contract.
      App.contracts.Bikes.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },
  bindEvents: function() {
    $(document).on('click', '#grabState', App.grabState);
    // $(document).on('click', '#getBalance', App.getBalance);
    // $(document).on('click', '#burnTokens', App.burnTokens);
    $(document).on('click', '#transferBike', App.transferBike);
    $(document).on('click', '#grabOwner', App.displayStoreOwner);
    $(document).on('click', '#addBike', App.addBike);
    //put in the users address
        //add your address to the page
    var infoDiv = $('#div-info');
    var pTag = $('<p>');
    var sp = $('<strong>').text('Your Address: ');
    var add = $('<span>').text(web3.eth.accounts[0]);
    currAddress = web3.eth.accounts[0];
    console.log(pTag);
    pTag.append(sp);
    console.log(pTag);
    pTag.append(add);
    infoDiv.append(pTag);
    console.log(infoDiv);
    console.log('posted address');
    //return App.displayStoreOwner();
  },
  displayStoreOwner: function(event) {
    //event.preventDefault();
    var BikesInstance;
    App.contracts.Bikes.deployed().then(function(instance) {
        BikesInstance = instance;
        var promises = [];
        promises.push(BikesInstance.storeOwner.call() );
        return Promise.all(promises);
        }).then(function(result) {
          //pull out who the owner of the bike shop is
          console.log(result[0]);
          storeOwner = result[0];
          var infoDiv = $('#div-info');
          var pTag = $('<p>');
          var sp = $('<strong>').text('Store owner: ');
          var add = $('<span>').text( storeOwner );
          pTag.append(sp);
          pTag.append(add);
          infoDiv.append(pTag);
        });
  },
  grabState: function(event){
    //pets all of the current bikes
    event.preventDefault(); 

    var BikesInstance;
    App.contracts.Bikes.deployed().then(function(instance) {
          BikesInstance = instance;
          var promises = [];
          promises.push(BikesInstance.getBikesCount.call() );
          return Promise.all(promises);
        }).then(function(result) {
          //pull out who the owner of the bike shop is
          console.log(result[0]);
          //this won't work past int limit
          globalNumBikes = parseInt(result[0]);
        }).then( function(res){
          //grab all of the bike records
          var promises = [];

          for (var i = 0; i < globalNumBikes; i++) {
              promises.push(BikeInstance.getBike_rec(i).call());
          }
          return Promise.all(promises);
        }).then ( function(result) {
          //all the bikes are in
          console.log('');
          debugger;
        });
  },
  getBalance: function(event){
    event.preventDefault();

    var BikesInstance;

    App.contracts.Bikes.deployed().then(function(instance) {
      BikesInstance = instance;

      var a = address.val();

      return BikesInstance.balance(a);

    }).then(function(result){

      $('#displayBalance').text(result.c.toString());

    }).catch(function(err) {
      $('#displayBalance').text(err.message);
    });
  },
  addBike: function(event) {
    event.preventDefault();
    var mfg = $('#manufacturer').val();
    var sn = $('#serial_num').val()
    console.log(`mfg=${mfg}`);
    console.log(`serial num=${sn}`);
    //when adding a bike, the first owner becomes
    //the store owner
    $('#ownerAdd').text(storeOwner);

    if ( mfg==undefined || mfg==null || mfg.trim()=="" ) {
      //manufacturer has not been entered
      alert('manufacturer has not been entered');
      return
    };

    if ( sn==undefined || sn==null || sn.trim()=="" ) {
      //manufacturer has not been entered
      alert('serial number has not been entered');
      return
    };
    
    //everything entered ... just check if person signed in is the store owner
    if ( currAddress !== storeOwner ) {
      alert('Front end has detected you are not the store owner, wll still proceed to attempt to write but blockchain should block it');
    };

    var BikesInstance;
    App.contracts.Bikes.deployed().then(function(instance) {
          BikesInstance = instance;
          return BikesInstance.setBike_rec( mfg, sn);
        }).then(function(result) {
          //write was completed
          console.log('result from setBike_rec');
          console.log(result);
          console.log('write to blockchain completed');
        });
  },
  transferBike: function(event){
    event.preventDefault();

    var BikesInstance;

    App.contracts.Bikes.deployed().then(function(instance) {
      BikesInstance = instance;
      return BikesInstance.transfer(addressToTransfer.val(), bikeNum.val());

    }).then(function(result) {
      addTransactionToDOM(result, $('#div-trans-log') );
      //need to break here and 
      console.log(result);
      debugger;
      var pTag = $('<p>');
      pTag.append('bike transferred');
      $('#div-trans-log').append(pTag);
    }).catch(function(err) {
      var pTag = $('<p>');
      pTag.append('error -');
      pTag.append(err.message);
      pTag.append(' -- no transfer');
      $('#div-trans-log').append(pTag);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
