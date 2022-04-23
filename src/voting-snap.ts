//import assert from 'assert';
import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Permissions,
  Bool,
  Circuit,
  Poseidon,
  arrayProp,
  CircuitValue,
  isReady,
} from 'snarkyjs';
import { Witness } from './merkle-tree';

await isReady;

export class MerkleWitness extends CircuitValue {
  @arrayProp(Field, 255) path: Field[];
  @arrayProp(Bool, 255) isLeft: Bool[];

  constructor(witness: Witness) {
    super();

    this.path = witness.map(x => x.sibling);
    this.isLeft = witness.map(x => Bool(x.isLeft));
  }

  calculateRoot(leaf: Field) : Field {
    let hash = leaf;

    for (let i = 1; i < 256; ++i) {
      const left = Circuit.if(this.isLeft[i - 1], hash, this.path[i - 1]);
      const right = Circuit.if(this.isLeft[i - 1], this.path[i - 1], hash);
      hash = Poseidon.hash([left, right]);
    }

    return hash
  }

  calculateIndex(): Field {
    let powerOfTwo = Field(1);
    let index = Field(0);

    for (let i = 1; i < 256; ++i) {
      index = Circuit.if(this.isLeft[i - 1], index, index.add(powerOfTwo))
      powerOfTwo = powerOfTwo.mul(2);
    }

    return index;
  }
}

export class Voting extends SmartContract {
  @state(Field) for = State<Field>();
  @state(Field) against = State<Field>();
  @state(Field) nullifierRoot = State<Field>();
  @state(Field) votingCardRoot = State<Field>();
  @state(Field) lastNullifier = State<Field>();

  // initialization
  deploy(args: any) {
    super.deploy(args);

    this.self.update.permissions.setValue({
      ...Permissions.default(), editState: Permissions.signature()});

    const {nullifierRoot, votingCardRoot} = args;

    this.for.set(Field(0));
    this.against.set(Field(0));
    this.nullifierRoot.set(nullifierRoot);
    this.votingCardRoot.set(votingCardRoot);
  }

  @method vote(
    vote: Bool,
    nullifier: Field,
    secret: Field,
    nullifierWitness: MerkleWitness,
    votingCardWitness: MerkleWitness
  ) {
    // votingCard = hash(nullifier, secret)
    const votingCard = Poseidon.hash([nullifier, secret]);

    // verify votingCardPath
    this.votingCardRoot.assertEquals(votingCardWitness.calculateRoot(votingCard));

    // traverse nullifierPath

    const nullifierRootFromPath = nullifierWitness.calculateRoot(Field(0));
    const nullifierFromPath = nullifierWitness.calculateIndex();

    // verify nullifierPath

    this.nullifierRoot.assertEquals(nullifierRootFromPath);
    nullifier.assertEquals(nullifierFromPath)

    // nullify, i.e. calculate new nullifier tree

    const nullifierRootNew = nullifierWitness.calculateRoot(Field(1));
    this.nullifierRoot.set(nullifierRootNew);

    // publish nullifier so that others can update merklePath

    this.lastNullifier.set(nullifier);

    // increase appropiate counter
    const forState = this.for.get();
    const againstState = this.against.get();

    // Update counters
    this.for.set(Circuit.if(vote, forState.add(1), forState));
    this.against.set(Circuit.if(vote, againstState, againstState.add(1)));
  }
}
