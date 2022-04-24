var Web3 = require('web3')
//var url = 'https://mainnet.infura.io/v3/7d41763b6670479ea91c3ed2b76bfa73'
var url = 'HTTP://127.0.0.1:7545'
var EthereumTransaction = require('ethereumjs-tx')
var web3 = new Web3(url)
var sendingAddress = '0x8882ce419f78fB4BF9e50735Fc55519Eb4B6548A'
var receivingAddress = '0x1cD267a9B1A2D58AC4F94CD32DAB76C9AB81d800'
//web3.eth.getBalance(sendingAddress).then(console.log) 
//web3.eth.getBalance(receivingAddress).then(console.log)

// -- Step 4: Set up the transaction using the transaction variables as shown 
var rawTransaction = { nonce: 0, 
    to: receivingAddress, 
    gasPrice: 20000000, 
    gasLimit: 30000, 
    value: 1, 
    data: "" }

    web3.eth.getBalance(sendingAddress).then(console.log) 
    web3.eth.getBalance(receivingAddress).then(console.log)

    // -- Step 7: Sign the transaction with the Hex value of the private key of the sender 
    var privateKeySender = 'e4be96f9984cd1f3afd20bd5cd68c9436377cb25e9709d6c0d71c939f32ef338' 
    var privateKeySenderHex = new Buffer(privateKeySender, 'hex') 
    var transaction = new EthereumTransaction(rawTransaction) 
    transaction.sign(privateKeySenderHex)