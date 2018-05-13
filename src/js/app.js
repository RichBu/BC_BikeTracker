var numToBurn = $('#numToBurn');
var address = $('#address');
var howManyToTransfer = $('#howManyToTransfer');
var addressToTransfer = $('#addressToTransfer');



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
    $.getJSON('Token.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var TokenArtifact = data;
      App.contracts.Token = TruffleContract(TokenArtifact);

      // Set the provider for our contract.
      App.contracts.Token.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },
  bindEvents: function() {
    $(document).on('click', '#grabState', App.grabState);
    // $(document).on('click', '#getBalance', App.getBalance);
    // $(document).on('click', '#burnTokens', App.burnTokens);
    $(document).on('click', '#transferBike', App.transferBike);
    $(document).on('click', '#grabOwner', App.displayStoreOwner);
    //put in the users address
        //add your address to the page
    var infoDiv = $('#div-info');
    var pTag = $('<p>');
    var sp = $('<strong>').text('Your Address: ');
    var add = $('<span>').text(web3.eth.accounts[0]);
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
    var TokenInstance;
    App.contracts.Token.deployed().then(function(instance) {
        TokenInstance = instance;
        var promises = [];
        promises.push(TokenInstance.storeOwner.call() );
        return Promise.all(promises);
        }).then(function(result) {
          //pull out who the owner of the bike shop is
          console.log(result[0]);
          var infoDiv = $('#div-info');
          var pTag = $('<p>');
          var sp = $('<strong>').text('Store owner: ');
          var add = $('<span>').text( result[0] );
          pTag.append(sp);
          pTag.append(add);
          infoDiv.append(pTag);
        });
  },
  grabState: function(event){
    //old routine leave it here for reference
    event.preventDefault(); 

    var TokenInstance;

    App.contracts.Token.deployed().then(function(instance) {
      TokenInstance = instance;

      return Promise.all([

        TokenInstance.name.call(),

        TokenInstance.symbol.call(),

        TokenInstance.LIMIT.call(), 

        TokenInstance.owner.call(), 

        ]);

    }).then(function(result) {
      
      var name = result[0];
      var symbol = result[1];
      var limit = result[2];
      var owner = result[3];

      var pName = $('<p>').text(`name:  ${name}`);
      var pSymbol = $('<p>').text(`symbol:  ${symbol}`);
      var pLimit = $('<p>').text(`limit:  ${limit}`);
      var pOwner = $('<p>').text(`owner:  ${owner}`);

      $('#displayInfo').append(pName, pSymbol, pLimit, pOwner);

    }).catch(function(err) {
      $('#displayInfo').text(err.message);
    });
  },
  getBalance: function(event){
    event.preventDefault();

    var TokenInstance;

    App.contracts.Token.deployed().then(function(instance) {
      TokenInstance = instance;

      var a = address.val();

      return TokenInstance.balance(a);

    }).then(function(result){

      $('#displayBalance').text(result.c.toString());

    }).catch(function(err) {
      $('#displayBalance').text(err.message);
    });
  },
  burnTokens: function(event){
    event.preventDefault();

    var num = parseInt(numToBurn.val());

    var TokenInstance;

    App.contracts.Token.deployed().then(function(instance) {
      TokenInstance = instance;

      return TokenInstance.burn(num);

    }).then(function(result) {
      
      addTransactionToDOM(result, $('#transactions'));
      $('#displayBurnResults').text('tokens were burned');

    }).catch(function(err) {
      $('#displayBurnResults').text(err.message);
    });
  },
  transferBike: function(event){
    event.preventDefault();

    var TokenInstance;

    App.contracts.Token.deployed().then(function(instance) {
      TokenInstance = instance;

      return TokenInstance.transfer(addressToTransfer.val(), bikeNum.val());

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
