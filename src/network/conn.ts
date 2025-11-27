/** this submodule contains a common description of what a network connection (abbr. `conn`) must implement.
 * once you wrap your network primitives over the {@link NetConn} and {@link NetAddr} interfaces,
 * you'll be able to utilize a good chunk of this network library to easily create tcp and udp agnostic logic for your server-application.
 * 
 * @module
*/

import { AwaitableQueue } from "../promiseman.ts"
import type { MaybePromise, Require } from "../typedefs.ts"


/** this enum contains some common default buffer sizes used across the network library.
 * in most cases, you can either "bring your own" buffer if theses sizes do not suffice you,
 * or sometimes a custom buffer is not even needed, as
 * the underlying implementation takes care of using a sufficiently sized buffer
 * (such as in the case of `Deno.DatagramConn`, which, I think, always returns a fully loaded buffer when reading).
*/
export const enum SIZE {
	/** the buffer bytesize of common non-packet based connections (such as tcp). */
	BufferBytes = 4096,

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
	DatagramMtu = 16384,
}

/** a net address is an ip-address and port-number pair,
 * that specifies where a packet is being sent or received from.
*/
export interface NetAddr {
	/** either the ip, or domain-name of the network-address.
	 * 
	 * ### examples
	 * - `"192.168.100.1"` (ipv4)
	 * - `"[::ffff:192.168.100.1]"` (ipv4 in [ipv6 representation](https://stackoverflow.com/a/186848))
	 * - `"example.com"` (a hostname)
	 * - `"0.0.0.0"` (an address that portrays "all self-host nicknames".
	 *    this is only acceptable for a server/listening. it is not for a client to connect to.)
	 * 
	 * ### invalid examples
	 * - `"192.168.100.1/24"` (an ipv4 [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing))
	 * - `"192.168.100.1:8000"` (an ipv4 with a port number)
	 * - `"[::ffff:192.168.100.1]:8000"` (an ipv6 with a port number)
	 * - `"http://example.com"` (an http url. a host name is not a url! but the url _does_ contain the host name)
	 * - `"localhost"` (it is only defined on windows, and may only work in browsers.
	 *   use `"0.0.0.0"`, or `"127.0.0.1"` instead for local loopback)
	*/
	hostname: string

	/** a 2-byte number (1-65534) that dictates the destination or source port on a specific {@link hostname | host}.
	 * 
	 * use the special `0` empherial port to let your os assign any general purpose temporary port to you,
	 * that is guaranteed to be available.
	 * 
	 * also, I think the `0xFFFF` (65535) port is reserved.
	 * 
	 * @defaultValue `0`
	*/
	port: number

	/** specifies whether this address is an ipv4 or an ipv6 address.
	 * if an ip is in essence an ipv4, but dressed up like an ipv6, such as `"::ffff:192.168.100.1"`,
	 * then the ip-family should be set to `4` rather than `6`.
	 * 
	 * @defaultValue `4`
	*/
	family: 4 | 6
}

/** the return value of a {@link NetConn | connection} when it is read. */
export type NetConnReadValue = [buffer: Uint8Array<ArrayBuffer>, Addr: NetAddr]

/** our abstract definition of a network connection is simply a _socket_ that can perform asynchronous read and send operations. */
export interface NetConn {
	/** the buffer size of the underlying `Uint8Array` of this connection.
	 * 
	 * when you receive a {@link NetConnReadValue | buffer} of this {@link size} from the {@link read} method,
	 * it might be an indication that there are already _more remaining_ bytes available that could to be read.
	*/
	readonly size: number

	/** read the incoming data from the connection into a `Uint8Array` buffer,
	 * and get the {@link NetAddr | address} from which the message came from.
	 * 
	 * if a readable data is already available, returned value will be of the {@link NetConnReadValue} kind,
	 * but if it isn't immediately available, a `Promise` to {@link NetConnReadValue} will be returned.
	 * this way, you can operate in both, immediate synchronous mode (for tasks, such as polling),
	 * or in asynchronous mode (for situations where you are anticipating a message).
	 * 
	 * the awaitable {@link NetConnReadValue} value is a 2-tuple consisting of the `Uint8Array` buffer that's read,
	 * and the {@link NetAddr} from which the message originates from.
	 * 
	 * it is possible for a read to successfully return with a buffer of zero bytesize,
	 * because it would indicate that a zero sized packet was received,
	 * which is different from _not receiving_ any packets.
	 * 
	 * TODO: what about partial packet? should the `NetConn` interface demand that they be joined before being presented by this interface?
	 * or should we allow the implementations to return data as it comes in?
	 * 
	 * TODO: actually, I think it would be better to define this in a way that _is_ intentionally blocking when awaited,
	 * rather than saying that it _may_ return `undefined` when it hasn't received any messages.
	 * 
	 * TODO: I just figured out that tcp, unlike udp, is stream-based.
	 * meaning that if a client sends us 2 tcp messages, they will be concatenated back to back.
	 * and if our internal read buffer is large enough, it will consume/contain both messages, with no segmentationg.
	*/
	read(): MaybePromise<NetConnReadValue>

	/** send the contents of the array buffer to a host with the `addr` network-address, over your connection.
	 *
	 * resolves to the number of bytes written. though it is kind of pointless given the TODO conundrum below:
	 *
	 * TODO: what should we do about input buffers that are not entirely sent in a single packet?
	 * should the implementation loop until all of it has been sent? or should it be up to the user of this interface to do that on their own?
	 * 
	 * for now, I will enforce the rule that the `send` method **must** completely send the buffer before resolving its promise.
	 * it really makes things simpler for the end user,
	 * and it only adds one line of code for underlying implementations that do not necessarily send their buffer all in one go.
	*/
	send(buffer: Uint8Array, addr: NetAddr): Promise<number>

	/** closes the connection on your local device to free up resources. */
	close(): void
}

/** a dictionary with "hostname" (ip) as its keys, and an an array queue of {@link NetConnReadValue} as its value.
 * 
 * uncaught (or untrapped) hostnames are not stored in here. they go to a different queue.
*/
type NetConnSink_traps = Record<
	string, // hostname
	AwaitableQueue<NetConnReadValue> // queued messages
>

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
export class NetConnSink<BASE extends NetConn = NetConn> implements NetConn {
	protected readonly base: BASE
	protected readonly trapped: NetConnSink_traps = {} // hostname trap rules
	protected readonly untrapped: AwaitableQueue<NetConnReadValue> = new AwaitableQueue() // untrapped queued messages
	public readonly size: number
	public readonly abortController: AbortController
	#initLoopPromise: Promise<void>

	constructor(base_conn: BASE, abort_controller?: AbortController) {
		this.base = base_conn
		this.size = base_conn.size
		this.abortController = abort_controller ?? new AbortController()
		this.#initLoopPromise = this.initLoop() // just so  that it isn't garbage collected in some js-implementation.
	}

	/** specify a hostname/ip-address to trap its future packets under a separate collection,
	 * that can be read back via {@link readAddr}.
	*/
	trapAddr(addr: Require<Partial<NetAddr>, "hostname">): void {
		const hostname = addr.hostname
		if (!hostname) { throw new Error("[NetConnSink.trapAddr]: your hostname is not defined!") }
		this.trapped[hostname] ??= new AwaitableQueue()
	}

	/** remove an address "trap", so that it will no longer be filtered.
	 * the returned value will contain all unread messages that had been trapped for the given address.
	*/
	untrapAddr(addr: Require<Partial<NetAddr>, "hostname">): Array<NetConnReadValue> {
		const
			hostname = addr.hostname,
			trapped = this.trapped
		if (!hostname) { throw new Error("[NetConnSink.untrapAddr]: your hostname is not defined!") }
		if (!(hostname in trapped)) { return [] }
		const queue = trapped[hostname]
		delete trapped[hostname]
		return queue.dump()
	}

	/** read incoming messages from a certain "trapped" address.
	 * 
	 * > [!note]
	 * > remember, if a message from a certain address, `addr`,
	 * > made its way through _before_ you add that address to the list of trapped addresses (via {@link trapAddr}),
	 * > then that message will end up in the "untrapped" category, and you will not receive it through this method.
	*/
	readAddr(addr: Require<Partial<NetAddr>, "hostname">): MaybePromise<NetConnReadValue> {
		const hostname = addr.hostname
		if (!(hostname in this.trapped)) { throw new Error(`[NetConnSink.readAddr]: the "${hostname}" hostname was never trapped!`) }
		return this.trapped[hostname].shift()
	}

	/** read incoming "untrapped" messages, that do not fit into any of the existing address traps (added via {@link trapAddr}). */
	read(): MaybePromise<NetConnReadValue> {
		return this.untrapped.shift()
	}

	/** returns the number of remaining untrapped unread messages.
	 * the value may be negative, indicating that one or more things have already requested to snatch the message as soon as it comes.
	*/
	remainingUnread(): number {
		return this.untrapped.getSize()
	}

	/** returns the number of remaining unread messages for the specified trapped address.
	 * the value may be negative, indicating that one or more things have already requested to snatch the message as soon as it comes.
	*/
	remainingUnreadAddr(addr: Require<Partial<NetAddr>, "hostname">): number {
		const hostname = addr.hostname
		if (!(hostname in this.trapped)) { throw new Error(`[NetConnSink.readAddr]: the "${hostname}" hostname was never trapped!`) }
		return this.trapped[hostname].getSize()
	}

	async send(buffer: Uint8Array, addr: NetAddr): Promise<number> {
		return this.base.send(buffer, addr)
	}

	close(): void {
		this.abortController.abort()
		this.base.close()
	}

	/** this infinite loop reads all messages as they come in, and then organizes them as needed. */
	protected async initLoop() {
		const
			base = this.base,
			traps = this.trapped,
			untrapped = this.untrapped,
			abort_controller = this.abortController,
			abort_controller_signal = abort_controller.signal
		try {
			while (!abort_controller_signal.aborted) {
				const
					response = await base.read(),
					hostname = response[1].hostname
				if (hostname in traps) { traps[hostname].push(response) }
				else { untrapped.push(response) }
			}
		} catch (err) { abort_controller.abort(`[NetConnSink.initLoop]: ${err}`) }
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
