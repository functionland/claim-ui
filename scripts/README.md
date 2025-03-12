# Ethereum Key Derivation Tool

This folder contains utility scripts for Ethereum key management.

## deriveeth.ts

A secure command-line tool that derives Ethereum keys from a mnemonic seed phrase. This script:

- Works 100% offline with no network connections
- Uses only the trusted ethers.js library which is already a dependency of this project
- Never stores or shares your information
- Derives the main account and the first 5 BIP-39 standard derivation path accounts

### Security Features

- All computation happens locally on your machine
- No external API calls or internet connectivity
- No data persistence (keys are only in memory during execution)
- Warns you to clear terminal history after use

### Usage

1. Install ts-node if you don't have it already:
   ```
   npm install -g ts-node
   ```

2. Run the script:
   ```
   cd scripts
   ts-node deriveeth.ts
   ```
   
   Or from the project root:
   ```
   ts-node scripts/deriveeth.ts
   ```

3. Enter your mnemonic phrase when prompted
4. The script will display the derived information
5. Clear your terminal history afterwards for security

### Technical Notes

- The script uses CommonJS module syntax (`require()`) for compatibility with default ts-node settings
- Uses ethers.js v6 for cryptographic operations
- Follows BIP-39 standards for HD wallet derivation

### Important Security Note

NEVER share your mnemonic phrase or private keys with anyone. This tool is for educational purposes and personal wallet management only. For maximum security, consider running this on an air-gapped computer.
