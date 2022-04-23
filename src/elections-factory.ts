import {  Mina, Party, UInt64, PrivateKey, Bool, PublicKey, Field } from 'snarkyjs';
import { Voting } from './voting-snap'
import { MerkleTree, Witness } from './merkle-tree'

type Transaction = ReturnType<typeof Mina.transaction>;

/**
 * Wraps zkapp contract running on a local simulator.
 */
 export class ElectionsFactory {

  public votingCardWitnesses: Witness[] = []

  public votingCardTree = new MerkleTree(256);

  constructor(public whitelistedVotingCards: Field[]) {
    for(let i = 0; i < whitelistedVotingCards.length; i++) {
      this.votingCardTree.setLeaf(BigInt(i), this.whitelistedVotingCards[i])
    }

    for(let i = 0; i < whitelistedVotingCards.length; i++) {
      this.votingCardWitnesses.push(this.votingCardTree.getWitness(BigInt(i)))
    }
  }

  addTransaction(tx: Transaction) {
    tx.send();
  }

  generateTransaction(deployerSecretKey: PrivateKey, args: any) : {deployTransaction: Transaction, snappPrivateKey:PrivateKey, snappAddress: PublicKey, votingCardTree: MerkleTree} {
    const snappPrivateKey = PrivateKey.random();
    const snappAddress = snappPrivateKey.toPublicKey();
    const initialBalance = UInt64.fromNumber(1000000);

    const votingCardRoot = this.votingCardTree.getRoot()

    const nullifierRoot = new MerkleTree(256).getRoot();

    let deployTransaction = Mina.transaction(deployerSecretKey, () => {
      const snapp = new Voting(snappAddress);
      const p = Party.createSigned(deployerSecretKey, {isSameAsFeePayer: true});
      p.balance.subInPlace(initialBalance);
      snapp.deploy({ zkappKey: snappPrivateKey, votingCardRoot, nullifierRoot, ...args });
      snapp.balance.addInPlace(initialBalance);
    });

    return {deployTransaction, snappPrivateKey, snappAddress, votingCardTree: this.votingCardTree};
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
