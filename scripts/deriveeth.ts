/**
 * deriveeth.ts
 * 
 * This script securely derives Ethereum private keys from a mnemonic phrase.
 * It uses only local computation and does not connect to the internet.
 * 
 * Run with: ts-node deriveeth.ts
 * (Install ts-node first if needed: npm install -g ts-node)
 */

const { ethers } = require('ethers');
const readline = require('readline');

// Create interface for reading from console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Securely prompt for a mnemonic phrase and derive Ethereum keys
 */
async function deriveMnemonicKeys() {
  console.log('\n===== Ethereum Key Derivation Tool =====');
  console.log('WARNING: This tool is for educational purposes only.');
  console.log('NEVER share your mnemonic phrase or private keys with anyone!');
  console.log('This tool performs all operations locally and does not connect to the internet.\n');

  // Prompt for mnemonic phrase
  rl.question('Enter your mnemonic phrase (12, 15, 18, 21, or 24 words): ', async (mnemonic) => {
    try {
      // Validate mnemonic format
      if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
        console.error('Error: Invalid mnemonic phrase. Please check and try again.');
        rl.close();
        return;
      }

      console.log('\nProcessing...\n');

      // Create a wallet from the mnemonic
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      // Derive info
      const privateKey = wallet.privateKey;
      const address = wallet.address;
      
      // Display information
      console.log('===== Derived Information =====');
      console.log(`Ethereum Address: ${address}`);
      console.log(`Private Key: ${privateKey}`);
      
      // Generate the first 5 accounts from this HD path (m/44'/60'/0'/0/*)
      console.log('\n===== First 5 Derived Accounts =====');
      for (let i = 0; i < 5; i++) {
        const hdPath = `m/44'/60'/0'/0/${i}`;
        const hdNode = ethers.HDNodeWallet.fromMnemonic(
          ethers.Mnemonic.fromPhrase(mnemonic),
          hdPath
        );
        console.log(`\nAccount #${i} (HD Path: ${hdPath})`);
        console.log(`Address: ${hdNode.address}`);
        console.log(`Private Key: ${hdNode.privateKey}`);
      }

      console.log('\n⚠️  IMPORTANT SECURITY WARNING ⚠️');
      console.log('1. Never share your private keys or mnemonic phrase with anyone');
      console.log('2. Store them securely offline');
      console.log('3. Clear your terminal history after using this tool');
      console.log('   (In most terminals, you can type "history -c" or "cls" to clear the screen)');
      
    } catch (error) {
      console.error('Error:', error.message || error);
    } finally {
      rl.close();
    }
  });
}

// Execute the function
deriveMnemonicKeys();
