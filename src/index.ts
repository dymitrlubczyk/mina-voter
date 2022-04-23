import { Field, SmartContract, state, State, method, UInt64, Permissions, Bool, Circuit } from 'snarkyjs';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 */
export class Voting extends SmartContract {
  @state(Field) for = State<Field>();
  @state(Field) against = State<Field>();

  // initialization
  deploy(args: any) {
    super.deploy(args);

    this.self.update.permissions.setValue({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature()
    })
  }

  @method vote(forState: Field, againstState: Field, vote: Bool) {
    // Workaround while state reading does not work.
    this.for.set(forState);
    this.against.set(againstState);

    // Update counters
    this.for.set(Circuit.if(vote, forState.add(1), forState));
    this.against.set(Circuit.if(vote, againstState, againstState.add(1)));
  }
}
