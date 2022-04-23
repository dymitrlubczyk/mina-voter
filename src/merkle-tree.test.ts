import { Field, Poseidon } from "snarkyjs"
import { MerkleTree } from './merkle-tree'
import { expect } from 'chai'

describe('Merkle Tree', () => {
    it('root of empty tree of size 1', () => {
        const tree = new MerkleTree(1);
        expect(tree.getRoot().toString())
            .to.eq(Field(0).toString())
    })

    it('root of empty tree of size 2', () => {
        const tree = new MerkleTree(2);
        expect(tree.getRoot().toString())
            .to.eq(Poseidon.hash([Field(0), Field(0)]).toString())
    })

    it('root is correct', () => {
        const tree = new MerkleTree(2)
        tree.setLeaf(0, Field(1))
        tree.setLeaf(1, Field(2))
        expect(tree.getRoot().toString())
            .to.eq(Poseidon.hash([Field(1), Field(2)]).toString())
    })

    it('builds correct tree', () => {
        const tree = new MerkleTree(4)
        tree.setLeaf(0, Field(1))
        tree.setLeaf(1, Field(2))
        tree.setLeaf(2, Field(3))
        expect(tree.validate(0)).to.be.true
        expect(tree.validate(1)).to.be.true
        expect(tree.validate(2)).to.be.true
        expect(tree.validate(3)).to.be.true
    })
})