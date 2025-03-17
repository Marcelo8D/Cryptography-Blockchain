const { ethers } = require("hardhat");

async function main() {
    const token1 = "0x86817bAd117E148fcea662F2dbB833bCc061Af3E";
    const token2 = "0xd6a2c32E58A274787a74325DceA16CAb4C4814E3"; 
    

    const rateToken1ToToken2String = "1.5"; // 1 Token1 = 1.5 Token2
    const rateToken2ToToken1String = "0.6667"; // 1 Token2 = 0.6667 Token1

    const rateToken1ToToken2 = ethers.parseEther(rateToken1ToToken2String); // 1.5 * 10^18
    const rateToken2ToToken1 = ethers.parseEther(rateToken2ToToken1String); // 0.6667 * 10^18
    
    console.log(`Rate Token1 to Token2: ${rateToken1ToToken2String}`);
    console.log(`Rate Token2 to Token1: ${rateToken2ToToken1String}`);

    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    console.log("Deploying TokenSwap...");
    const tokenSwap = await TokenSwap.deploy(token1, token2, rateToken1ToToken2, rateToken2ToToken1);
    await tokenSwap.waitForDeployment();

    console.log(`TokenSwap deployed to: ${await tokenSwap.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
