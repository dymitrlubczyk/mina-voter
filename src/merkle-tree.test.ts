import { Field } from "snarkyjs"
import { MerkleTree } from './merkle-tree'
describe('Merkle Tree', () => {
    it.only('builds correct tree', () => {
        const fields = [new Field(0), new Field(1), new Field(2)]
        // const tree = new MerkleTree(fields)
        // console.log(tree.nodes);
    })
})