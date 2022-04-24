# Private & fair voting system on Mina network

## Quick start
```
yarn install
yarn test
```
## Voting process
1. **Voters**:  each voter generates `votingCard` and correlated `nullifier`
2. **Voters**:  each voter submits `votingCard` to the *Elections Organizer*
3. **EO**:      collects `votingCard`s and submits it to a `ElectionsFactory`
4. **EO**:      deploys a Voting zkApp from the `ElectionsFactory` and publishes necessary data for others to vote
5. **Anyone**:  can run an `ElectionsNode` which keeps track of the elections state
6. **Voters**:  generates a voting transaction by interacting with an `ElectionsNode`
7. **Voters**:  submits the transaction to the MINA blockchain
8. **Public**:  gets election results from the contract state

## Features
- **Private**     - it's impossible to deduce who you've voted for
- **Fair**        - every voter gets exactly one vote
- **Unforgeable** - every voter can be sure their vote has been counted

## How it works

### Before elections

Each voter:
- generates random nonces: `nullifier` and `secret`
- calculates:
  - `votingCard = hash(nullifier, secret)`
- submits `votingCard` to be included in the votingCard Merkle tree

### Elections
Each voter submits a transaction containing:
- proof that his `votingCard` is included in the votingCard Merkle tree
- proof that `nullifierMerkleTree.leaves[nullifier] == 0`
- who is the vote for
- a new, updated nullifier Merkle tree root
    - after marking `nullifierMerkleTree.leaves[nullifier] = 1`
- proof that the new nullifier Merkle tree root is calculated correctly
- `nullifier`
  - we publicly disclose the nullifier, so others can recalculate their Merkle tree paths

### After elections
Read the results from the contract's state

## Project structure
- `ElectionsFactory` - preparation for elections contract deployment
- `ElectionsNode`    - interface to the elections in progress
- `MerkleTree`       - implementation for a sparse Merkle tree
- `Voting`           - smart contract

## Usage of MINA network
Although similar elections could be organized on e.g. Ethereum blockchain, Mina offers several advantages:
- proofs are natively supported & cheap
- high throughput due to SNARK workers

---

Done at ETH Amsterdam Hackathon 2022
