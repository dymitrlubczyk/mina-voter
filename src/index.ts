import { isReady, shutdown } from 'snarkyjs';
import { Mina, Party, UInt64, PrivateKey, Bool, PublicKey,Field } from 'snarkyjs';


(async () => {
  await isReady;
  console.log("Mina ready")

  const { ElectionsNode } = await import('./elections-node');

  const electionsNode = new ElectionsNode();
  const testAccounts = electionsNode.getTestAccounts();
  console.log("Node ready")
 
  const nullifierRoot = Field(2137);
  const votingCardRoot = Field(420);

  const {deployTransaction, snappAddress } = electionsNode.createDeployTransaction(testAccounts[0].privateKey, {nullifierRoot, votingCardRoot});
  electionsNode.addTransaction(deployTransaction);
  electionsNode.setAddress(snappAddress);

  //@ts-ignore
  console.log(deployTransaction.toJSON());

  // await snapp.deploy();
  // console.log(await snapp.getState())
  // await snapp.vote(true);
  // await snapp.vote(true);
  // console.log(await snapp.getState())

  console.log("Done")
  await shutdown();
})()
