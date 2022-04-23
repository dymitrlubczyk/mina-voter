import { isReady, shutdown } from 'snarkyjs';
import { Mina, Party, UInt64, PrivateKey, Bool, PublicKey,Field } from 'snarkyjs';
import { MerkleTree } from './merkle-tree'
import { expect } from 'chai'
import { ElectionsFactory } from './elections-factory'

describe('Election Factory', () => {

    // var testAccounts : any;

    // beforeEach(async () => {
    //     await isReady;

    //     const Local = Mina.LocalBlockchain();
    //     Mina.setActiveInstance(Local);
    //     testAccounts = Local.testAccounts;

    // })

    // it("Generates transaction when empty", async () => {
    //     electionsFactory.generateTransaction(testAccounts[0].privateKey, {})
    // })

    // it("Deploys when empty", async () => {
    //     const {deployTransaction}  = electionsFactory.generateTransaction(testAccounts[0].privateKey, {})
    //     await deployTransaction.send().wait()
    // })


    // it("Generates transaction when non empty", () => {
    //     electionsFactory.whitelistVotingCard(Field(2137));
    //     electionsFactory.whitelistVotingCard(Field(420));
    //     electionsFactory.whitelistVotingCard(Field(69));
    //     electionsFactory.generateTransaction(testAccounts[0].privateKey, {})
    // })

    // it("Deploys when not empty", async () => {
    //     electionsFactory.whitelistVotingCard(Field(2137));
    //     electionsFactory.whitelistVotingCard(Field(420));
    //     electionsFactory.whitelistVotingCard(Field(69));
    //     const {deployTransaction}  = electionsFactory.generateTransaction(testAccounts[0].privateKey, {})
    //     await deployTransaction.send().wait()
    // })


})