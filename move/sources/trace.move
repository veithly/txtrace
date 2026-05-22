module txtrace_core::trace {
    use std::string::{Self, String};
    use sui::event;

    public struct TraceReport has key, store {
        id: UID,
        owner: address,
        source_digest: String,
        status: String,
        failing_step: u64,
        recorded_at_ms: u64,
    }

    public struct TraceRecorded has copy, drop {
        report_id: ID,
        owner: address,
        failing_step: u64,
    }

    public entry fun record_trace(
        source_digest: vector<u8>,
        status: vector<u8>,
        failing_step: u64,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext,
    ) {
        let owner = tx_context::sender(ctx);
        let report = TraceReport {
            id: object::new(ctx),
            owner,
            source_digest: string::utf8(source_digest),
            status: string::utf8(status),
            failing_step,
            recorded_at_ms: sui::clock::timestamp_ms(clock),
        };
        let report_id = object::id(&report);
        event::emit(TraceRecorded { report_id, owner, failing_step });
        transfer::public_transfer(report, owner);
    }
}
