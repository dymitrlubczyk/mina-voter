import { isReady, shutdown } from 'snarkyjs';
import {
  Mina,
  Field,
  Poseidon,
} from 'snarkyjs';
import { ElectionsFactory } from './elections-factory';
import { ElectionsNode } from './elections-node';
import expect from 'expect';

describe('Elections node', async () => {
  const nonces = [
    {
      nullifier: Field(2137),
      secret: Field(420),
    },
    {
      nullifier: Field(69),
      secret: Field(123),
    },
    {
      nullifier: Field(7312),
      secret: Field(2040),
    },
  ];

  const votingCards = nonces.map(({ nullifier, secret }) =>
    Poseidon.hash([nullifier, secret])
  );

  let electionsNode: ElectionsNode;
  let electionsFactory: ElectionsFactory;
  let testAccounts: any[];

  beforeEach(async () => {
    await isReady;

    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    testAccounts = Local.testAccounts;

    electionsFactory = new ElectionsFactory(votingCards);

    const { deployTransaction, snappPrivateKey, snappAddress } =
      electionsFactory.generateTransaction(testAccounts[0].privateKey, {});

    await deployTransaction.send().wait();
    electionsNode = new ElectionsNode(snappAddress, snappPrivateKey);
  });

  after(async () => {
    await shutdown();
  });

  it('results when no one votes', async () => {
    const { forCounter, againstCounter } = await electionsNode.getState();
    expect(forCounter.toString()).toBe('0');
    expect(againstCounter.toString()).toBe('0');
  });

  it('results when some vote', async () => {
    await electionsNode.vote(
      true,
      testAccounts[0].privateKey,
      nonces[0].secret,
      nonces[0].nullifier,
      electionsFactory.votingCardWitnesses[0]
    );

    const { forCounter, againstCounter } = await electionsNode.getState();
    expect(forCounter.toString()).toBe('1');
    expect(againstCounter.toString()).toBe('0');
  });

  it('results when all vote', async () => {
    await electionsNode.vote(
      true,
      testAccounts[0].privateKey,
      nonces[0].secret,
      nonces[0].nullifier,
      electionsFactory.votingCardWitnesses[0]
    );

    await electionsNode.vote(
      true,
      testAccounts[1].privateKey,
      nonces[1].secret,
      nonces[1].nullifier,
      electionsFactory.votingCardWitnesses[1]
    );

    await electionsNode.vote(
      false,
      testAccounts[2].privateKey,
      nonces[2].secret,
      nonces[2].nullifier,
      electionsFactory.votingCardWitnesses[2]
    );

    const { forCounter, againstCounter } = await electionsNode.getState();
    expect(forCounter.toString()).toBe('2');
    expect(againstCounter.toString()).toBe('1');
  });


  it.skip('no double voting');
});
