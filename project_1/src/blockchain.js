/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        console.log('initializing chain')
        if (this.height === -1) {
            let block = new BlockClass.Block({
                data: 'Genesis Block'
            });
            console.log(block)
            await this._addBlock(block);

        }
    }

    /**
     * Utility method that returns a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }
    /**
     * Utility method that returns the current time
     */
    _getCurrentTime() {
        let time = new Date().getTime().toString().slice(0, -3);
        return time
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            // set block height
            const length = self.chain.length;
            block.height = length
            // set UTC timestamp
            block.time = self._getCurrentTime();

            if (length > 0) {
                // assign previous block hash
                block.previousBlockHash = self.chain[length - 1].hash;
            } else {
                // assign null for genesis block
                block.previousBlockHash = ""
            }
            // Generate a new hash based on the whole Block's object
            block.hash = SHA256(JSON.stringify(block)).toString();
            //execute the validateChain() function every time a block is added
            let errors = self.validateChain();
            if (errors.length > 0) {
                reject(new Error('Adding block failed'));

            } else {
                // add block to chain
                this.chain.push(block);
                resolve(block);
                // update height
                this.height = self.chain.length - 1;
            }
        })
    }


    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        let self = this;
        return new Promise((resolve) => {
            resolve(`${address}:${self._getCurrentTime()}:starRegistry`)
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Verify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            let messageTime = parseInt(message.split(':')[1])
            let currentTime = parseInt(self._getCurrentTime());
            // check time between message sent and current time less that 5 minutes
            if ((currentTime - messageTime) > 5 * 60) {
                resolve('It is taking too long, try again')
            } else {
                //Verify the message with wallet address and signature
                if (bitcoinMessage.verify(message, address, signature)) {
                    //Create the block with star data 
                    let block = new BlockClass.Block({
                        owner: address,
                        star: star
                    });
                    // add block to the chain
                    resolve(await self._addBlock(block));
                } else {
                    resolve('Invalid bitcoin message')
                }
            }
        });
    }


    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(block => block.hash == hash);
            if (block) {
                resolve(block);
            } else {
                reject('Error: hash not found');
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if (block) {
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress(address) {
        let self = this;
        let stars = [];
        if ((self.chain.length) >= 1) {
            return new Promise((resolve, reject) => {
                self.chain.map((block) => {
                    if (block.height > 0) {
                        let blockdata = block.getBData();
                        if (blockdata.owner == address) {
                            stars.push(blockdata)
                        } else {
                            reject(new Error('Address not found'))
                        }
                    }
                });
                resolve(stars);
            })
        }
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            for (let block of self.chain) {
                if (await block.validate()) {
                    let previous_block = self.chain[block.height - 1]
                    //check previous block hash
                    if (block.height > 0 && previous_block.hash !== block.previousBlockHash) {
                            const err = `The current previous block link ${block.previousBlockHash} of block ${block.height} does not contain to the hash ${previous_block.hash} of the previous block`
                            errorLog.push(err)
                             }
                            
                } else {
                    const err = `Unable to validate block ${block.height}`
                    errorLog.push(err)
                }
            }

            if (errorLog.length > 0) {
                resolve(errorLog);
            } else {
                console.log('Chain validated without errors')
                resolve(false);
            }
        });
    }

}

module.exports.Blockchain = Blockchain;