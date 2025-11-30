/** this submodule contains implementations of the {@link NetConn}
 * interface for tcp connections running on the following js-runtimes:
 * - `deno`: {@link DenoTcpNetConn}
 * - `node`: {@link NodeTcpNetConn}
 * - `bun`: {@link BunTcpNetConn}
 * - `txiki.js`: {@link TjsTcpNetConn}
 *
 * @module
*/
import type { Socket as NodeTcpSocket } from "node:net";
import { AwaitableQueue } from "../promiseman.js";
import type { MaybePromise } from "../typedefs.js";
import { type NetAddr, type NetConn, type NetConnReadValue } from "./conn.js";
/** a {@link NetConn} interface implementation wrapper for `Deno.connect` (deno's tcp implementation). */
export declare class DenoTcpNetConn implements NetConn {
    protected readonly base: Deno.Conn<Deno.NetAddr>;
    protected readonly buf: Uint8Array;
    protected readonly remoteAddr: NetAddr;
    readonly size: number;
    constructor(conn: Deno.Conn, bring_your_own_buffer?: Uint8Array);
    read(): Promise<NetConnReadValue>;
    send(buffer: Uint8Array, addr?: NetAddr): Promise<number>;
    close(): void;
}
/** a {@link NetConn} interface implementation wrapper for `tjs.connect("tcp", ...)` (txiki.js's tcp implementation). */
export declare class TjsTcpNetConn implements NetConn {
    protected readonly base: tjs.Connection;
    protected readonly buf: Uint8Array;
    protected readonly remoteAddr: NetAddr;
    readonly size: number;
    constructor(conn: tjs.Connection, bring_your_own_buffer?: Uint8Array);
    read(): Promise<NetConnReadValue>;
    send(buffer: Uint8Array, addr?: NetAddr): Promise<number>;
    close(): void;
}
/** a {@link NetConn} interface implementation wrapper for node's `net.connect` tcp implementation. */
export declare class NodeTcpNetConn implements NetConn {
    protected readonly base: NodeTcpSocket;
    protected readonly queue: AwaitableQueue<Uint8Array<ArrayBuffer>>;
    protected readonly remoteAddr: NetAddr;
    protected writeIsFree: Promise<void>;
    readonly size: number;
    constructor(conn: NodeTcpSocket);
    read(): MaybePromise<NetConnReadValue>;
    send(buffer: Uint8Array, addr?: NetAddr): Promise<number>;
    close(): void;
}
/** a {@link NetConn} interface implementation wrapper for bun's `Bun.connect` tcp implementation. */
export declare class BunTcpNetConn implements NetConn {
    protected readonly base: Bun.Socket;
    protected readonly queue: AwaitableQueue<Uint8Array<ArrayBuffer>>;
    protected readonly remoteAddr: NetAddr;
    protected writeIsFree: Promise<void>;
    protected writeIsFreeResolve: (() => void);
    readonly size: number;
    constructor(conn: Bun.Socket);
    read(): MaybePromise<NetConnReadValue>;
    send(buffer: Uint8Array, addr?: NetAddr): Promise<number>;
    close(): void;
}
//# sourceMappingURL=tcp.d.ts.map