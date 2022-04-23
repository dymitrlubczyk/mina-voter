import { Mina, PrivateKey, Bool, PublicKey, Field } from 'snarkyjs';
import { Voting, MerkleWitness } from './voting-snapp';
import { MerkleTree, Witness } from './merkle-tree';

/**
 * Wraps zkapp contract running on a local simulator.
 */
export class ElectionsNode {
  public nullifierTree = new MerkleTree(256);

  constructor(
    private snappAddress: PublicKey,
    private snappPrivateKey: PrivateKey
  ) {
    this.verifyNullifierIntegrity();
  }

  async getState() {
    const state = (await Mina.getAccount(this.snappAddress!)).zkapp.appState;
    const [
      forCounter,
      againstCounter,
      nullifierRoot,
      votingCardRoot,
      lastNullifier,
    ] = state;

    return {
      forCounter,
      againstCounter,
      nullifierRoot,
      votingCardRoot,
      lastNullifier,
    };
  }

  async verifyNullifierIntegrity() {
    const { nullifierRoot } = await this.getState();
    console.assert(
      this.nullifierTree.getRoot().equals(nullifierRoot).toBoolean(),
      'Nullifier tree unsynced'
    );
  }

  async refreshNullifierTree() {
    const { lastNullifier } = await this.getState();
    this.nullifierTree.setLeaf(BigInt(lastNullifier.toString()), Field(1));
    await this.verifyNullifierIntegrity();
  }

  async vote(
    vote: boolean,
    voterPrivateKey: PrivateKey,
    secret: Field,
    nullifier: Field,
    votingCardWitness: Witness
  ) {
    let tx = Mina.transaction(voterPrivateKey, () => {
      const snapp = new Voting(this.snappAddress);
      const nullifierWitness = this.nullifierTree.getWitness(
        BigInt(nullifier.toString())
      );

      snapp.vote(
        Bool(vote),
        nullifier,
        secret,
        new MerkleWitness(nullifierWitness),
        new MerkleWitness(votingCardWitness)
      );
      snapp.self.sign(this.snappPrivateKey);
      snapp.self.body.incrementNonce = new Bool(true);
    });

    await tx.send().wait();
    await this.refreshNullifierTree();
  }
}
