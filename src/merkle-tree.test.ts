import { Field, shutdown } from "snarkyjs"
import { MerkleTree } from './merkle-tree'
describe('Merkle Tree', () => {
<<<<<<< HEAD
    afterAll(async () => {
        await shutdown();
      });
      
    it('builds correct tree', () => {
        console.log('adsdas')
        Field.one
        // const fields = [new Field(0), new Field(1), new Field(2)]
=======
    it('builds correct tree', () => {
        const fields = [new Field(0), new Field(1), new Field(2)]
>>>>>>> ac69782... Use mocha for tests
        // const tree = new MerkleTree(fields)
        // console.log(tree.nodes);
    })
})