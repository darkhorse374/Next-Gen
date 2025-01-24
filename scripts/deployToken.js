const hre = require("hardhat");

async function main() {
  console.log("Deploying EURFToken...");
  console.log("--------------------------------------------------------");

  // Make sure the initial owner address is set in the .env file
  if (!process.env.INITIAL_OWNER_ADDRESS) {
    throw new Error("⚠️ INITIAL_OWNER_ADDRESS is not set");
  }

  // Get the contract factory
  const Token = await hre.ethers.getContractFactory("EURFToken");

  // Deploy the UUPS proxy with the custom initializer
  const deployment = await hre.upgrades.deployProxy(Token, [], {
    initializer: "initialize",
    kind: "uups",
  });

  const proxy = await deployment.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  console.log("✅ Proxy deployed to:", proxyAddr);
  console.log(
    "ℹ️ (set this address as TOKEN_ADDRESS in the .env file for upgrades to work)"
  );

  const currentImplAddress =
    await hre.upgrades.erc1967.getImplementationAddress(proxyAddr);
  console.log("✅ Token tracker deployed to:", currentImplAddress);

  const owner = process.env.INITIAL_OWNER_ADDRESS;
  const tx = await proxy.setOwner(owner);
  await tx.wait();
  console.log("✅ Owner set to:", owner);

  // Verify in scanner
  try {
    await hre.run("verify", {
      address: currentImplAddress,
    });
  } catch (e) {
    if (String(e).indexOf("already verified") == -1) {
      // verified probably because it has the same bytecode as some other contract
      throw e;
    } else console.error(e);
  }

  console.log(
    "Contracts verified. You can now go to contract at " +
      proxyAddr +
      " and mark it as proxy"
  );
  console.log("--------------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
