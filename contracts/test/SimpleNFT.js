const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SimpleNFT", function () {
  it("Should mint a new NFT", async function () {
    const simpleNFT = await ethers.deployContract("SimpleNFT");

    await simpleNFT.waitForDeployment();

    await simpleNFT.mint("0x08A2DE6F3528319123b25935C92888B16db8913E"); // Use random address for testing
    expect(await simpleNFT.totalSupply()).to.equal(1);
  });
});
