const contractAddress = "0xd99628520B8B0bde4779d994b499d274E4A5BF6d";
let provider, signer, contract;
let contractABI = [];

fetch("./TokenSwap.json")
  .then((res) => res.json())
  .then((data) => {
    contractABI = data.abi;
    console.log("Contract ABI Loaded:", contractABI);
    document.getElementById("connectWallet").removeAttribute("disabled");
  })
  .catch((err) => console.error("Failed to load ABI:", err));

// Connect Wallet
document.getElementById("connectWallet").addEventListener("click", async () => {
    try {
        if (!window.ethereum) {
            alert("MetaMask not detected. Install MetaMask.");
            return;
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        document.getElementById("walletAddress").innerText = "Connected: " + userAddress;
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("Contract Connected:", contract);

        document.getElementById("swap1to2").removeAttribute("disabled");
        document.getElementById("swap2to1").removeAttribute("disabled");
        document.getElementById("setRate").removeAttribute("disabled");

    } catch (error) {
        console.error("Wallet Connection Error:", error);
        document.getElementById("walletAddress").innerText = "Connection Failed!";
    }
});

// Swap Token1 for Token2
async function swapToken1ForToken2() {
    if (!contract) return alert("Connect Wallet First");
    const amount = document.getElementById("amount").value;
    if (amount <= 0) return alert("Enter a valid amount");

    try {
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        console.log("Amount in Wei:", amountInWei.toString());

        const token1Address = "0x86817bAd117E148fcea662F2dbB833bCc061Af3E";
        const token1Contract = new ethers.Contract(token1Address, 
            ["function approve(address spender, uint256 amount) returns (bool)"], signer);

        const approveTx = await token1Contract.approve(contractAddress, amountInWei);
        await approveTx.wait();
        console.log("Token1 Approved!");

        const swapTx = await contract.swapToken1ForToken2(amountInWei);
        await swapTx.wait();
        console.log("Swap completed!");

        document.getElementById("status").innerText = "Swap successful!";
    } catch (error) {
        console.error("Transaction Error:", error);
        alert(`Transaction Failed: ${error.message}`);
    }
}

// Swap Token2 for Token1
async function swapToken2ForToken1() {
    if (!contract) return alert("Connect Wallet First");
    const amount = document.getElementById("amount").value;
    if (amount <= 0) return alert("Enter a valid amount");

    try {
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        console.log("Amount in Wei:", amountInWei.toString());

        const token2Address = "0xd6a2c32E58A274787a74325DceA16CAb4C4814E3";
        const token2Contract = new ethers.Contract(token2Address, 
            ["function approve(address spender, uint256 amount) returns (bool)"], signer);

        const approveTx = await token2Contract.approve(contractAddress, amountInWei);
        await approveTx.wait();
        console.log("Token2 Approved!");

        const swapTx = await contract.swapToken2ForToken1(amountInWei);
        await swapTx.wait();
        console.log("Swap completed!");

        document.getElementById("status").innerText = "Swap successful!";
    } catch (error) {
        console.error("Transaction Error:", error);
        alert(`Transaction Failed: ${error.message}`);
    }
}

// Set Exchange Rate (Owner Only)
async function setExchangeRate() {
    if (!contract) return alert("Connect Wallet First");
    
    const rate1to2 = document.getElementById("rate1to2").value;
    const rate2to1 = document.getElementById("rate2to1").value;

    if (rate1to2 <= 0 || rate2to1 <= 0) return alert("Enter valid exchange rates");

    try {
        const tx = await contract.setExchangeRates(
            ethers.parseUnits(rate1to2.toString(), 18), 
            ethers.parseUnits(rate2to1.toString(), 18)
        );
        await tx.wait();
        console.log("Exchange rate updated!");

        document.getElementById("status").innerText = "Exchange rate updated!";
    } catch (error) {
        console.error("Transaction Error:", error);
        alert(`Transaction Failed: ${error.message}`);
    }
}

// Attach functions to buttons
document.getElementById("swap1to2").addEventListener("click", swapToken1ForToken2);
document.getElementById("swap2to1").addEventListener("click", swapToken2ForToken1);
document.getElementById("setRate").addEventListener("click", setExchangeRate);
