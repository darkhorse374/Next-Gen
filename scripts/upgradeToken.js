const { ethers, defender } = require("hardhat");

async function main() {
  console.log("Proposing upgrade for EUROPToken...");
  console.log("--------------------------------------------------------");

  // Make sure the token address is set in the .env file
  if (!ethers.isAddress(process.env.TOKEN_ADDRESS)) {
    throw new Error("⚠️ TOKEN_ADDRESS is not set");
  }

  const Contract = await ethers.getContractFactory("EUROPToken");

  const proposal = await defender.proposeUpgradeWithApproval(
    process.env.TOKEN_ADDRESS,
    Contract
  );

  console.log(`✅ Upgrade proposed with URL: ${proposal.url}`);
  console.log("ℹ️ (share this URL with your token owner approvers)");
  console.log("--------------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
