/// Tiny example module shipped with TxTrace.
/// Used by the "Load failing demo PTB" button: airdrop::claim_batch aborts on EAlreadyClaimed,
/// giving the trace inspector a deterministic, reproducible failing PTB to demo against.
module txtrace_core::airdrop {
    use sui::event;
    use sui::table::{Self, Table};

    const EAlreadyClaimed: u64 = 1;

    public struct Registry has key {
        id: UID,
        claimed: Table<address, bool>,
    }

    public struct Claimed has copy, drop { who: address }

    public entry fun init_registry(ctx: &mut TxContext) {
        let registry = Registry { id: object::new(ctx), claimed: table::new<address, bool>(ctx) };
        transfer::share_object(registry);
    }

    public entry fun claim_batch(reg: &mut Registry, ctx: &TxContext) {
        let who = tx_context::sender(ctx);
        assert!(!table::contains(&reg.claimed, who), EAlreadyClaimed);
        table::add(&mut reg.claimed, who, true);
        event::emit(Claimed { who });
    }
}
