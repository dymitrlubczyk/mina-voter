import { Field, shutdown } from "snarkyjs"
import { MerkleTree } from './merkle-tree'
describe('Merkle Tree', () => {
    afterAll(async () => {
        await shutdown();
      });
      
    it('builds correct tree', () => {
        console.log('adsdas')
        Field.one
        // const fields = [new Field(0), new Field(1), new Field(2)]
        // const tree = new MerkleTree(fields)
        // console.log(tree.nodes);
    })
})