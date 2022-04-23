import { isReady, shutdown } from 'snarkyjs';
import { Mina, Party, UInt64, PrivateKey, Bool, PublicKey,Field } from 'snarkyjs';


(async () => {
  await isReady;
  console.log("SnarkyJS ready")

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const testAccounts = Local.testAccounts;

  console.log("Mina ready")

  const { ElectionsFactory } = await import('./elections-factory');

  const electionsFactory= new ElectionsFactory();
  electionsFactory.whitelistVotingCard(Field(2137));
  const {deployTransaction, snappAddress } = electionsFactory.generateTransaction(testAccounts[0].privateKey, {});

  console.log("Factory ready")

  deployTransaction.send()
  const { ElectionsNode } = await import('./elections-node');
  const electionsNode = new ElectionsNode(snappAddress)

  console.log("Node ready")

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
