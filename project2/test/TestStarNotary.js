const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
   // await instance.approve(user2, starId, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:7});
   // const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let gasfee = balanceOfUser2BeforeTransaction-balanceAfterUser2BuysStar-starPrice
    let difference = Number(balanceOfUser2BeforeTransaction - gasfee - balanceAfterUser2BuysStar);
    // calculate the gas fee   
    assert.equal(difference, starPrice)
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let tokenId55 = 55;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star5!', tokenId55, {from: accounts[0]});
    assert.equal(await instance.name.call(), 'My little stars');
    assert.equal(await instance.symbol.call(), 'MLS');
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let tokenId1 = 16;
    let tokenId2 = 18;
    let ownerId1 = accounts[0];
    let ownerId2 = accounts[1];
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star 16!', tokenId1, {from: ownerId1});
    await instance.createStar('Awesome Star 18!', tokenId2, {from: ownerId2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2, {from: ownerId1});
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(tokenId1), ownerId2);
    assert.equal(await instance.ownerOf(tokenId2), ownerId1);

});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let tokenId7 = 7;
    let to1 =  accounts[1]
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star7!', tokenId7, {from: accounts[0]})
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(to1, tokenId7)
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(tokenId7), to1);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let tokenId9 = 9;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star8!', tokenId9, {from: accounts[0]})
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId9), 'Awesome Star8!')
});