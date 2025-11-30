/** this submodule contains a common description of what a network connection (abbr. `conn`) must implement.
 * once you wrap your network primitives over the {@link NetConn} and {@link NetAddr} interfaces,
 * you'll be able to utilize a good chunk of this network library to easily create tcp and udp agnostic logic for your server-application.
 *
 * @module
*/
import { DEBUG } from "../deps.js";
import { AwaitableQueue } from "../promiseman.js";
/** this enum contains some common default buffer sizes used across the network library.
 * in most cases, you can either "bring your own" buffer if theses sizes do not suffice you,
 * or sometimes a custom buffer is not even needed, as
 * the underlying implementation takes care of using a sufficiently sized buffer
 * (such as in the case of `Deno.DatagramConn`, which, I think, always returns a fully loaded buffer when reading).
*/
export var SIZE;
(function (SIZE) {
    /** the buffer bytesize of common non-packet based connections (such as tcp). */
    SIZE[SIZE["BufferBytes"] = 4096] = "BufferBytes";
    /** while the MTU on most routers is set to `1500` bytes, and while practically speaking,
     * only ethernet jumboframes would increase this limit to about 9000 bytes,
     * if there's a udp packet coming from localhost, this size limit is greatly increased to 64kb on linux,
     * 16kb on mac-os, and unlimited bytes on windows.
     *
     * since the datagram is discarded after a single read (even if you couldn't entirely fit it into your buffer),
     * it presents a challenge for supporting udp packets from localhost applications if they do not segment the packets themselves.
     * thus, if you experience udp packet data corruption on localhost when receiving packets via this library,
     * you can either increase the buffer size set here to something much greater,
     * or modify your os-settings to set a 16kb limit on the MTU of udp datagrams.
     * - for windows, I found this [gist](https://gist.github.com/odyssey4me/c2f7542f985a953bb1e4).
     *   although, I haven't tried it or looked at it carefully myself.
    */
    SIZE[SIZE["DatagramMtu"] = 16384] = "DatagramMtu";
})(SIZE || (SIZE = {}));
/** a net-connection sink traps certain messages received from specific `hostname`s (ip-addresses),
 * while queuing the rest of messages elsewhere.
 *
 * you can think of it as network-connection with a builtin hostname filter system,
 * allowing you prioritize the reading of incoming messages from a certain hostname,
 * and later take care of the remaining un-organized/untrapped set of messages,
 * when nothing of high-priority is taking place.
 *
 * the way it works is that you must first set a `hostname` "trap" via the the {@link trapAddr} method,
 * and then, to read incoming messages coming from `hostname`,
 * you will use the {@link readAddr} method to receive the messages, one at a time.
*/
export class NetConnSink {
    base;
    trapped = {}; // hostname trap rules
    untrapped = new AwaitableQueue(); // untrapped queued messages
    size;
    abortController;
    #initLoopPromise;
    constructor(base_conn, abort_controller) {
        this.base = base_conn;
        this.size = base_conn.size;
        this.abortController = abort_controller ?? new AbortController();
        this.#initLoopPromise = this.initLoop(); // just so  that it isn't garbage collected in some js-implementation.
    }
    /** specify a hostname/ip-address to trap its future packets under a separate collection,
     * that can be read back via {@link readAddr}.
    */
    trapAddr(addr) {
        const hostname = addr.hostname;
        if (!hostname) {
            throw new Error(DEBUG.ERROR ? "[NetConnSink.trapAddr]: your hostname is not defined!" : "");
        }
        this.trapped[hostname] ??= new AwaitableQueue();
    }
    /** remove an address "trap", so that it will no longer be filtered.
     * the returned value will contain all unread messages that had been trapped for the given address.
    */
    untrapAddr(addr) {
        const hostname = addr.hostname, trapped = this.trapped;
        if (!hostname) {
            throw new Error(DEBUG.ERROR ? "[NetConnSink.untrapAddr]: your hostname is not defined!" : "");
        }
        if (!(hostname in trapped)) {
            return [];
        }
        const queue = trapped[hostname];
        delete trapped[hostname];
        return queue.dump();
    }
    /** read incoming messages from a certain "trapped" address.
     *
     * > [!note]
     * > remember, if a message from a certain address, `addr`,
     * > made its way through _before_ you add that address to the list of trapped addresses (via {@link trapAddr}),
     * > then that message will end up in the "untrapped" category, and you will not receive it through this method.
    */
    readAddr(addr) {
        const hostname = addr.hostname;
        if (!(hostname in this.trapped)) {
            throw new Error(DEBUG.ERROR ? `[NetConnSink.readAddr]: the "${hostname}" hostname was never trapped!` : "");
        }
        return this.trapped[hostname].shift();
    }
    /** read incoming "untrapped" messages, that do not fit into any of the existing address traps (added via {@link trapAddr}). */
    read() {
        return this.untrapped.shift();
    }
    /** returns the number of remaining untrapped unread messages.
     * the value may be negative, indicating that one or more things have already requested to snatch the message as soon as it comes.
    */
    remainingUnread() {
        return this.untrapped.getSize();
    }
    /** returns the number of remaining unread messages for the specified trapped address.
     * the value may be negative, indicating that one or more things have already requested to snatch the message as soon as it comes.
    */
    remainingUnreadAddr(addr) {
        const hostname = addr.hostname;
        if (!(hostname in this.trapped)) {
            throw new Error(DEBUG.ERROR ? `[NetConnSink.readAddr]: the "${hostname}" hostname was never trapped!` : "");
        }
        return this.trapped[hostname].getSize();
    }
    async send(buffer, addr) {
        return this.base.send(buffer, addr);
    }
    close() {
        this.abortController.abort();
        this.base.close();
    }
    /** this infinite loop reads all messages as they come in, and then organizes them as needed. */
    async initLoop() {
        const base = this.base, traps = this.trapped, untrapped = this.untrapped, abort_controller = this.abortController, abort_controller_signal = abort_controller.signal;
        try {
            while (!abort_controller_signal.aborted) {
                const response = await base.read(), hostname = response[1].hostname;
                if (hostname in traps) {
                    traps[hostname].push(response);
                }
                else {
                    untrapped.push(response);
                }
            }
        }
        catch (err) {
            abort_controller.abort(`[NetConnSink.initLoop]: ${err}`);
        }
    }
}
// TODO: add a class, `NetStream`, that composes a `NetConn` (or `NetConnSink`),
// to provide `readable` and `writable` streams, which can then be used as a basis for creating an http-client.
// (though, frankly speaking, `NetConn` alone is sufficient for that too.)
// TODO: also consider creating an interface `NetListen` that abstract away the actions a listening network server can take.
// in the case of udp, it wouldn't be very different from the existing `NetConn` interface, as udp is connectionless.
// moreover, one could pass the `connection` object they receive from a client connecting to one of the `NetConn` implementations,
// and then call it a day, without having a need for an abstract `NetListen`.
// in fact, the only place where a `NetListen` abstraction would be useful, would be functions that operate _over_ a network listener.
// i.e. think of mixins, such as `NetConnSink`, or higher order protocols, such as `HTTP`.
// but is there ever a need for such a thing on the server (listening) side?
// also what methods should I be abstracting?
// 1) `connect`/`accept` (for connecting and accepting new clients, then returning a `NetConn` object)
// 2) `disconnect` for closing down the communication with a client (is it even necessary when `NetConn` has the `close` method?
//   perhaps we could attach the `NetListener` as a parent to the `NetConn`, which would inform it when it closes down).
// 3) ability to set the `hostname` (i.e. local network adapter interface), hosting `port`, ip-version `family`, and the `reusePort` options.
