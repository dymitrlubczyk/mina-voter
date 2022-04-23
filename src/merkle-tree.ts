import { Field, Poseidon } from 'snarkyjs';


export class MerkleTree {
  public nodes: { [key: string]: MerkleNode } = {};
  private root: MerkleNode;
  readonly height = 8;

  constructor(leaves: Field[]) {
    this.fillWithZeros(leaves);
    console.log(1)
    let nodes = leaves.map((leaf) => {
      const node = new MerkleNode(null, null);
      node.hash = leaf;
      return node;
    });
    console.log(2)

    while (nodes.length !== 1) {
      let parents: MerkleNode[] = [];

      for (let i = 0; i < nodes.length; i += 2) {
        const left = nodes[i];
        const right = nodes[i + 1];

        this.nodes[left.hash.toString()] = left;
        this.nodes[right.hash.toString()] = right;

        parents.push(new MerkleNode(left, right));
      }

      nodes = parents;
      parents = [];
    }

    this.root = nodes[0];
  }
  
  getRoot(): Field {
    return this.root.hash;
  }

  getPath(hash: Field): Field[] {
    const path = [];
    let node = this.nodes[hash.toString()];

    while (node.parent !== null) {
      const sibling = this.getSimbling(node)

      path.push(sibling?.hash as Field);
      node = node.parent;
    }

    return path;
  }

  update(hash: Field, newHash: Field): void {
    const node = this.nodes[hash.toString()];
    this.nodes[newHash.toString()] = node;
    node.hash = newHash;
    
    let iter = node.parent
    while (iter) {
        const {left, right} = iter 
        iter.hash = Poseidon.hash([left?.hash as Field, right?.hash as Field])
    }
  }

  private fillWithZeros(leaves: Field[]) {
    while (leaves.length < Math.pow(2, this.height))
      leaves.push(Poseidon.hash([Field(0)]));
  }

  private getSimbling(node: MerkleNode): MerkleNode | null {
    if (node.parent) {
      const parent = node.parent;
      const { left, right } = parent;

      return node.hash === left?.hash ? right : left;
    }

    return null
  }
}

class MerkleNode {
  public hash: Field;
  public parent: MerkleNode | null = null;

  constructor(public left: MerkleNode | null, public right: MerkleNode | null) {
    this.hash = Field(0);

    if (left && right) {
      this.hash = Poseidon.hash([left.hash, right.hash]);
      left.parent = this;
      right.parent = this;
    }
  }
}
