import {  Mina, Party, UInt64, PrivateKey, Bool, PublicKey, Field } from 'snarkyjs';
import { Voting } from './voting-snapp'
import { MerkleTree } from './merkle-tree'
import { getNullifierData } from './merkle-tree'

type Transaction = ReturnType<typeof Mina.transaction>;
type MinaInstance = ReturnType<typeof Mina.LocalBlockchain>;
type VotingCard = Field;

/**
 * Wraps zkapp contract running on a local simulator.
 */
 export class ElectionsNode {

  public snappAddress : PublicKey;
  public nullifierTree: MerkleTree;

  constructor(snappAddress : PublicKey) {
    this.snappAddress = snappAddress;
    this.nullifierTree = new MerkleTree(256);
    this.verifyNullifierIntegrity()
  }

  async getState() {
    const state = (await Mina.getAccount(this.snappAddress!)).zkapp.appState;
    const [forCounter, againstCounter, nullifierRoot, votingCardRoot, lastNullifier] = state;

    return {forCounter, againstCounter, nullifierRoot, votingCardRoot, lastNullifier};
  }

  async verifyNullifierIntegrity(){
    const { nullifierRoot } = await this.getState();
    console.assert(this.nullifierTree.getRoot() == nullifierRoot, "Nullifier tree unsynced");
  }

  async refreshNullifierTree() {
    const { lastNullifier } = await this.getState();
    this.nullifierTree.setLeaf(BigInt(lastNullifier.toString()), Field(1));
    await this.verifyNullifierIntegrity();
  }

}
