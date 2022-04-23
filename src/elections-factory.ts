import {  Mina, Party, UInt64, PrivateKey, Bool, PublicKey, Field } from 'snarkyjs';
import { Voting } from './voting-snap'
import { MerkleTree } from './merkle-tree'
import { getNullifierData } from './merkle-tree'

type Transaction = ReturnType<typeof Mina.transaction>;
type MinaInstance = ReturnType<typeof Mina.LocalBlockchain>;
type VotingCard = Field;

/**
 * Wraps zkapp contract running on a local simulator.
 */
 export class ElectionsFactory {

  public whitelistedVotingCards: VotingCard[] = []

  addTransaction(tx: Transaction){
    tx.send();
  }

  whitelistVotingCard(votingCard: VotingCard){
    this.whitelistedVotingCards.push(votingCard)
  }

  __buildVotingCardTree(): MerkleTree{
    const result = new MerkleTree(256);
    result.fill(this.whitelistedVotingCards);
    return result;
  }

  generateTransaction(deployerSecretKey: PrivateKey, args: any) : {deployTransaction: Transaction, snappAddress: PublicKey} {
    const snappPrivateKey = PrivateKey.random();
    const snappAddress = snappPrivateKey.toPublicKey();
    const initialBalance = UInt64.fromNumber(1000000);

    const votingCardTree = this.__buildVotingCardTree()
    const votingCardRoot = votingCardTree.getRoot()

    const nullifierRoot = new MerkleTree(256);

    let deployTransaction = Mina.transaction(deployerSecretKey, () => {
      const snapp = new Voting(snappAddress);
      const p = Party.createSigned(deployerSecretKey, {isSameAsFeePayer: true});
      p.balance.subInPlace(initialBalance);
      snapp.deploy({ zkappKey: snappPrivateKey, votingCardRoot, nullifierRoot, ...args });
      snapp.balance.addInPlace(initialBalance);
    });
  
    return {deployTransaction, snappAddress};
  }


  // async vote(vote: boolean) {
  //   let tx = Mina.transaction(this._voter, () => {
  //     const snapp = new Voting(this._snappAddress);
  //     snapp.vote(new Bool(vote));
  //     snapp.self.sign(this._snappPrivateKey);
  //     snapp.self.body.incrementNonce = new Bool(true);
  //   });
  //   await tx.send().wait();
  // }

  // async getFieldState() {
  //   let snappState = (await Mina.getAccount(this._snappAddress)).zkapp.appState;
  //   return {
  //     forCounter: snappState[0],
  //     againstCounter: snappState[1]
  //   };
  // }

  // async getState() {
  //   const { forCounter, againstCounter } = await this.getFieldState();
  //   return {
  //     forCounter: parseInt(forCounter.toString()),
  //     againstCounter: parseInt(againstCounter.toString())
  //   };
  // }
}
