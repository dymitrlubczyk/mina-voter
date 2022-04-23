import {  Mina, Party, UInt64, PrivateKey, Bool, PublicKey } from 'snarkyjs';
import { Voting } from './voting-snapp'


/**
 * Wraps zkapp contract running on a local simulator.
 */
export class VotingSimulator {
  private _deployer: PrivateKey;
  private _voter: PrivateKey;
  private _snappAddress: PublicKey;
  private _snappPrivateKey: PrivateKey

  constructor() {
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    this._deployer = Local.testAccounts[0].privateKey;
    this._voter = Local.testAccounts[1].privateKey;
    
    this._snappPrivateKey = PrivateKey.random();
    this._snappAddress = this._snappPrivateKey.toPublicKey();
  }

  async deploy() {
    let tx = Mina.transaction(this._deployer, () => {
      
      const p = Party.createSigned(this._voter);
      p.balance.subInPlace(initialBalance);
      const snapp = new Voting(this._snappAddress);
      snapp.deploy({ zkappKey: this._snappPrivateKey });
      snapp.balance.addInPlace(initialBalance);
    });
    await tx.send().wait();
  }

  async vote(vote: boolean) {
    let tx = Mina.transaction(this._voter, () => {
      const snapp = new Voting(this._snappAddress);
      snapp.vote(new Bool(vote));
      snapp.self.sign(this._snappPrivateKey);
      snapp.self.body.incrementNonce = new Bool(true);
    });
    await tx.send().wait();
  }

  async getFieldState() {
    let snappState = (await Mina.getAccount(this._snappAddress)).zkapp.appState;
    return {
      forCounter: snappState[0],
      againstCounter: snappState[1]
    };
  }

  async getState() {
    const { forCounter, againstCounter } = await this.getFieldState();
    return {
      forCounter: parseInt(forCounter.toString()),
      againstCounter: parseInt(againstCounter.toString())
    };
  }
}
