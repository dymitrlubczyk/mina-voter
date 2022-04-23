import { Field, Poseidon } from 'snarkyjs';

/**
 * Levels are indexed from leafs (level 0) to root (level N - 1).
 */
export class MerkleTree {
  private nodes: Record<number, Record<number, Field>> = {}
  private zeroes: Field[]; // zeroes[i] = hash(zeroes[i+1], zeroes[i+1])

  constructor(
    public readonly height: number,
  ) {
    this.zeroes = [Field(0)]
    for(let i=1; i<this.height; i++){
      this.zeroes.push(Poseidon.hash([this.zeroes[i-1], this.zeroes[i-1]]))
    }
  }

  getNode(level: number, index: number): Field {
    return this.nodes[level]?.[index] ?? this.zeroes[level];
  }
  
  getRoot(): Field {
    return this.getNode(this.height - 1, 0)
  }

  setLeaf(index: number, leaf: Field) {
    ; (this.nodes[0] ??= {})[index] = leaf
    let currIndex = index;
    for(let level = 1; level < this.height; level++) {
      currIndex = Math.floor(currIndex / 2);
      const left = this.getNode(level - 1, currIndex * 2)
      const right = this.getNode(level - 1, currIndex * 2 + 1)

      ; (this.nodes[level] ??= {})[currIndex] = Poseidon.hash([left, right])
    }
  }

  getWitness(index: number): { isLeft: boolean, sibling: Field }[] {
    const witness = [];
    for(let level = 0; level < this.height - 1; level++) {
      const isLeft = index % 2 === 0;
      witness.push({
          isLeft,
          sibling: this.getNode(level, isLeft ? index + 1 : index - 1),
      })
      index = Math.floor(index / 2);
    }
    return witness;
  }

  validate(index: number): boolean {
    const path = this.getWitness(index);
    let hash = this.getNode(0, index)
    for (const node of path) {
        hash = Poseidon.hash(node.isLeft ? [hash, node.sibling] : [node.sibling, hash])
    }
    
    return hash.toString() === this.getRoot().toString()
  }

  fill(leaves: Field[]){
    leaves.forEach((value, index) => {
      this.setLeaf(index, value)
    })
  }
}
