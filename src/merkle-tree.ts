import { Field, Poseidon } from 'snarkyjs';

export type Witness = {
  isLeft: boolean;
  sibling: Field;
}[];

/**
 * Levels are indexed from leafs (level 0) to root (level N - 1).
 */
export class MerkleTree {
  private nodes: Record<number, Record<string, Field>> = {};
  private zeroes: Field[]; // zeroes[i] = hash(zeroes[i+1], zeroes[i+1])

  constructor(public readonly height: number) {
    this.zeroes = [Field(0)];
    for (let i = 1; i < height; i++) {
      this.zeroes.push(Poseidon.hash([this.zeroes[i - 1], this.zeroes[i - 1]]));
    }
  }

  getNode(level: number, index: bigint): Field {
    return this.nodes[level]?.[index.toString()] ?? this.zeroes[level];
  }

  getRoot(): Field {
    return this.getNode(this.height - 1, 0n);
  }

  private setNode(level: number, index: bigint, value: Field) {
    (this.nodes[level] ??= {})[index.toString()] = value;
  }

  setLeaf(index: bigint, leaf: Field) {
    this.setNode(0, index, leaf);
    let currIndex = index;
    for (let level = 1; level < this.height; level++) {
      currIndex = currIndex / 2n;

      const left = this.getNode(level - 1, currIndex * 2n);
      const right = this.getNode(level - 1, currIndex * 2n + 1n);

      this.setNode(level, currIndex, Poseidon.hash([left, right]));
    }
  }

  getWitness(index: bigint): Witness {
    const witness = [];
    for (let level = 0; level < this.height - 1; level++) {
      const isLeft = index % 2n === 0n;
      witness.push({
        isLeft,
        sibling: this.getNode(level, isLeft ? index + 1n : index - 1n),
      });
      index = index / 2n;
    }
    return witness;
  }

  validate(index: bigint): boolean {
    const path = this.getWitness(index);
    let hash = this.getNode(0, index);
    for (const node of path) {
      hash = Poseidon.hash(
        node.isLeft ? [hash, node.sibling] : [node.sibling, hash]
      );
    }

    return hash.toString() === this.getRoot().toString();
  }

  fill(leaves: Field[]) {
    leaves.forEach((value, index) => {
      this.setLeaf(BigInt(index), value);
    });
  }
}
