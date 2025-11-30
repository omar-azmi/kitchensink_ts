/** this submodule contains implementations of the {@link NetConn}
 * interface for udp connections running on the following js-runtimes:
 * - `deno`: {@link DenoUdpNetConn}
 * - `node`: {@link NodeUdpNetConn}
 * - `bun`: {@link BunUdpNetConn}
 * - `txiki.js`: {@link TjsUdpNetConn}
 *
 * @module
*/
import type { Socket as NodeUdpSocket } from "node:dgram";
import { AwaitableQueue } from "../promiseman.js";
import type { MaybePromise } from "../typedefs.js";
import { type NetAddr, type NetConn, type NetConnReadValue } from "./conn.js";
/** a {@link NetConn} interface implementation wrapper for `Deno.listenDatagram` (deno's udp implementation). */
export declare class DenoUdpNetConn implements NetConn {
    protected readonly base: Deno.DatagramConn;
    readonly size: number;
    constructor(conn: Deno.DatagramConn);
    read(): Promise<NetConnReadValue>;
    send(buffer: Uint8Array, addr: NetAddr): Promise<number>;
    close(): void;
}
/** a {@link NetConn} interface implementation wrapper for `tjs.connect("udp", ...)` (txiki.js's udp implementation). */
export declare class TjsUdpNetConn implements NetConn {
    protected readonly base: tjs.DatagramEndpoint;
    protected readonly buf: Uint8Array;
    readonly size: number;
    constructor(conn: tjs.DatagramEndpoint, bring_your_own_buffer?: Uint8Array);
    read(): Promise<NetConnReadValue>;
    send(buffer: Uint8Array, addr: NetAddr): Promise<number>;
    close(): void;
}
/** a {@link NetConn} interface implementation wrapper for node's `dgram` udp implementation. */
export declare class NodeUdpNetConn implements NetConn {
    protected readonly base: NodeUdpSocket;
    protected readonly queue: AwaitableQueue<NetConnReadValue>;
    readonly size: number;
    constructor(conn: NodeUdpSocket);
    read(): MaybePromise<NetConnReadValue>;
    send(buffer: Uint8Array, addr: NetAddr): Promise<number>;
    close(): void;
}
/** a {@link NetConn} interface implementation wrapper for bun's `Bun.udpSocket` udp implementation. */
export declare class BunUdpNetConn implements NetConn {
    protected readonly base: Bun.udp.Socket<"uint8array">;
    protected readonly queue: AwaitableQueue<NetConnReadValue>;
    protected writeIsFree: Promise<void>;
    protected writeIsFreeResolve: (() => void);
    readonly size: number;
    constructor(conn: Bun.udp.Socket<"uint8array">);
    read(): MaybePromise<NetConnReadValue>;
    send(buffer: Uint8Array, addr: NetAddr): Promise<number>;
    close(): void;
}
//# sourceMappingURL=udp.d.ts.map