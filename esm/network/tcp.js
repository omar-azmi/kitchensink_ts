import { noop, number_MAX_SAFE_INTEGER, promise_outside, promise_resolve, string_toLowerCase } from "../alias.js";
import { AwaitableQueue } from "../promiseman.js";
import { SIZE } from "./conn.js";
/** a {@link NetConn} interface implementation wrapper for `Deno.connect` (deno's tcp implementation). */
export class DenoTcpNetConn {
    base;
    buf;
    remoteAddr;
    size;
    constructor(conn, bring_your_own_buffer) {
        this.base = conn;
        this.buf = bring_your_own_buffer ?? new Uint8Array(SIZE.BufferBytes);
        this.size = this.buf.byteLength;
        const { hostname, port } = conn.remoteAddr;
        this.remoteAddr = { hostname, port, family: 4 };
    }
    async read() {
        // tcp is a stream based protocol. this means that there is no means of knowing _when_ a complete packet is fully received,
        // aside from inspecting the message itself and having your peer place certain markers in the streaming data,
        // that would allow you to understand where the stream should be segmented.
        // specifically in deno's implementation, I saw in their code base that they return a `null` when zero bytes are received.
        // so I will override that scenario and return a `0` for bytes read instead of a `null` for that situation.
        const base = this.base, buf = this.buf, bytes_read = await base.read(this.buf) ?? 0;
        return [buf.slice(0, bytes_read), { ...this.remoteAddr }];
    }
    async send(buffer, addr) {
        let bytes_written = 0;
        const base = this.base, bytes_to_write = buffer.byteLength;
        // yes, we should permit empty messages, even if the underlying `base` class ignores zero sized messages.
        if (bytes_to_write === 0) {
            return base.write(buffer);
        }
        while (bytes_written < bytes_to_write) {
            bytes_written += await base.write(buffer.subarray(bytes_written));
        }
        // TODO: should we assert `bytes_written === bytes_to_write`?
        return bytes_written;
    }
    close() {
        this.base.close();
    }
}
/** a {@link NetConn} interface implementation wrapper for `tjs.connect("tcp", ...)` (txiki.js's tcp implementation). */
export class TjsTcpNetConn {
    base;
    buf;
    remoteAddr;
    size;
    constructor(conn, bring_your_own_buffer) {
        this.base = conn;
        this.buf = bring_your_own_buffer ?? new Uint8Array(SIZE.BufferBytes);
        this.size = this.buf.byteLength;
        const { ip: hostname, port, family } = conn.remoteAddress;
        this.remoteAddr = { hostname, port, family: family };
    }
    async read() {
        const base = this.base, buf = this.buf, bytes_read = await base.read(this.buf) ?? 0;
        return [buf.slice(0, bytes_read), { ...this.remoteAddr }];
    }
    async send(buffer, addr) {
        let bytes_written = 0;
        const base = this.base, bytes_to_write = buffer.byteLength;
        // yes, we should permit empty messages, even if the underlying `base` class may ignore zero sized messages.
        if (bytes_to_write === 0) {
            return base.write(buffer);
        }
        while (bytes_written < bytes_to_write) {
            bytes_written += await base.write(buffer.subarray(bytes_written));
        }
        // TODO: should we assert `bytes_written === bytes_to_write`?
        return bytes_written;
    }
    close() {
        this.base.close();
    }
}
/** a {@link NetConn} interface implementation wrapper for node's `net.connect` tcp implementation. */
export class NodeTcpNetConn {
    base;
    queue;
    remoteAddr;
    writeIsFree;
    size;
    constructor(conn) {
        const dataQueue = new AwaitableQueue();
        this.base = conn;
        this.size = number_MAX_SAFE_INTEGER;
        this.queue = dataQueue;
        this.writeIsFree = promise_resolve();
        this.remoteAddr = {
            hostname: conn.remoteAddress, // TODO: node's ipv6-address is not enclosed in square brackets. we should enclose it for our `NetAddr` interface.
            port: conn.remotePort,
            family: string_toLowerCase(conn.remoteFamily) === "ipv6" ? 6 : 4,
        };
        // event listener for incoming readable data.
        conn.on("data", (data) => { dataQueue.push(new Uint8Array(data)); });
    }
    read() {
        const buf_maybe_promise = this.queue.shift(), is_promise = buf_maybe_promise instanceof Promise, addr = { ...this.remoteAddr };
        return is_promise
            ? buf_maybe_promise.then((buf) => ([buf, addr]))
            : [buf_maybe_promise, addr];
    }
    async send(buffer, addr) {
        await this.writeIsFree;
        const base = this.base, bytes_to_write = buffer.byteLength, [promise, resolve, reject] = promise_outside(), can_accept_more = base.write(buffer, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(bytes_to_write);
            }
        });
        // when node's internal write buffer is filled beyond a certain limit, it complains that it cannot take more data.
        // in such cases, we must wait for it to emit the "drain" event,
        // which would indicate that it is now sufficiently free to accept new data to send.
        if (!can_accept_more) {
            const [promise_writeIsFree, resolve_writeIsFree, reject] = promise_outside();
            this.writeIsFree = promise_writeIsFree;
            base.once("drain", () => { resolve_writeIsFree(); });
        }
        return promise;
    }
    close() {
        this.base.destroySoon();
    }
}
var BunTcpSocketWriteReturnValue;
(function (BunTcpSocketWriteReturnValue) {
    BunTcpSocketWriteReturnValue[BunTcpSocketWriteReturnValue["BACKPRESSURE"] = -1] = "BACKPRESSURE";
    BunTcpSocketWriteReturnValue[BunTcpSocketWriteReturnValue["DROPPED"] = 0] = "DROPPED";
    BunTcpSocketWriteReturnValue[BunTcpSocketWriteReturnValue["SUCCESS"] = 1] = "SUCCESS";
})(BunTcpSocketWriteReturnValue || (BunTcpSocketWriteReturnValue = {}));
/** a {@link NetConn} interface implementation wrapper for bun's `Bun.connect` tcp implementation. */
export class BunTcpNetConn {
    base;
    queue;
    remoteAddr;
    writeIsFree;
    writeIsFreeResolve;
    size;
    constructor(conn) {
        const _this = this, dataQueue = new AwaitableQueue();
        this.base = conn;
        this.queue = dataQueue;
        this.writeIsFree = promise_resolve();
        this.writeIsFreeResolve = noop;
        this.size = number_MAX_SAFE_INTEGER;
        this.remoteAddr = {
            // TODO: just like node, bun's ipv6 addresses are not enclosed in square-brackets. so I must add them in the future when an ipv6 is detected.
            hostname: conn.remoteAddress,
            port: conn.remotePort,
            family: string_toLowerCase(conn.remoteFamily) === "ipv6" ? 6 : 4,
        };
        // bun only permits a single handler for every even. so, to update it, we must use the `reload` method on the socket.
        // read more here: "https://bun.com/docs/runtime/networking/tcp#hot-reloading"
        conn.reload({
            data(self_socket, data) { dataQueue.push(new Uint8Array(data)); },
            drain(self_socket) {
                // when we're writing/sending too quickly to the tcp socket,
                // a backpressure may be applied, resulting in us getting a `-1` when `this.base.write()` is called.
                // the `drain` method/handler is called once the write buffer is ready to accept more data to send again.
                _this.writeIsFreeResolve();
            },
        });
    }
    read() {
        const buf_maybe_promise = this.queue.shift(), is_promise = buf_maybe_promise instanceof Promise, addr = { ...this.remoteAddr };
        return is_promise
            ? buf_maybe_promise.then((buf) => ([buf, addr]))
            : [buf_maybe_promise, addr];
    }
    async send(buffer, addr) {
        await this.writeIsFree;
        const bytes_sent = buffer.byteLength, status = this.base.write(buffer);
        switch (status) {
            case BunTcpSocketWriteReturnValue.SUCCESS: {
                return bytes_sent;
            }
            // connection dropped, hence no bytes can be sent.
            case BunTcpSocketWriteReturnValue.DROPPED: {
                return 0;
            }
            // buffer was sent, but a backpressure was applied, hence we shall pause until the internal buffer has drained sufficiently.
            case BunTcpSocketWriteReturnValue.BACKPRESSURE: {
                const [promise, resolve, reject] = promise_outside();
                this.writeIsFree = promise;
                this.writeIsFreeResolve = resolve;
                return bytes_sent;
            }
        }
    }
    close() {
        this.base.close();
    }
}
