import { Mina, Party, UInt64, PrivateKey, PublicKey, Field } from 'snarkyjs';

import { Voting } from './voting-snapp';
import { MerkleTree, Witness } from './merkle-tree';

type Transaction = ReturnType<typeof Mina.transaction>;

/**
 * Wraps zkapp contract running on a local simulator.
 */
export class ElectionsFactory {
  public votingCardWitnesses: Witness[] = [];

  public votingCardTree = new MerkleTree(256);

  constructor(public whitelistedVotingCards: Field[]) {
    for (let i = 0; i < whitelistedVotingCards.length; i++) {
      this.votingCardTree.setLeaf(BigInt(i), this.whitelistedVotingCards[i]);
    }

    for (let i = 0; i < whitelistedVotingCards.length; i++) {
      this.votingCardWitnesses.push(this.votingCardTree.getWitness(BigInt(i)));
    }
  }

  generateTransaction(
    deployerSecretKey: PrivateKey,
    args: any
  ): {
    deployTransaction: Transaction;
    snappPrivateKey: PrivateKey;
    snappAddress: PublicKey;
    votingCardTree: MerkleTree;
  } {
    const snappPrivateKey = PrivateKey.random();
    const snappAddress = snappPrivateKey.toPublicKey();
    const initialBalance = UInt64.fromNumber(1000000);

    const votingCardRoot = this.votingCardTree.getRoot();

    const nullifierRoot = new MerkleTree(256).getRoot();

    let deployTransaction = Mina.transaction(deployerSecretKey, () => {
      const snapp = new Voting(snappAddress);
      const p = Party.createSigned(deployerSecretKey, {
        isSameAsFeePayer: true,
      });
      p.balance.subInPlace(initialBalance);
      snapp.deploy({
        zkappKey: snappPrivateKey,
        votingCardRoot,
        nullifierRoot,
        ...args,
      });
      snapp.balance.addInPlace(initialBalance);
    });

    return {
      deployTransaction,
      snappPrivateKey,
      snappAddress,
      votingCardTree: this.votingCardTree,
    };
  }
}
