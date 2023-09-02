const { ethers } = require('hardhat');

async function main() {
  const nft = await ethers.deployContract('SimpleNFT', {});

  await nft.waitForDeployment();

  console.log(`SimpleNFT deployed to ${nft.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
