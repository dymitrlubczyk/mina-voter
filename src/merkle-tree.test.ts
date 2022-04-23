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
        tree.setLeaf(0n, Field(1))
        tree.setLeaf(1n, Field(2))
        expect(tree.getRoot().toString())
            .to.eq(Poseidon.hash([Field(1), Field(2)]).toString())
    })

    it('builds correct tree', () => {
        const tree = new MerkleTree(4)
        tree.setLeaf(0n, Field(1))
        tree.setLeaf(1n, Field(2))
        tree.setLeaf(2n, Field(3))
        expect(tree.validate(0n)).to.be.true
        expect(tree.validate(1n)).to.be.true
        expect(tree.validate(2n)).to.be.true
        expect(tree.validate(3n)).to.be.true
    })

    it('tree of height 128', () => {
        const tree = new MerkleTree(128)

        const index = 2n ** 64n
        expect(tree.validate(index)).to.be.true

        tree.setLeaf(index, Field(1))
        expect(tree.validate(index)).to.be.true
    })

    it('tree of height 256', () => {
        const tree = new MerkleTree(256)

        const index = 2n ** 128n
        expect(tree.validate(index)).to.be.true

        tree.setLeaf(index, Field(1))
        expect(tree.validate(index)).to.be.true
    })
})