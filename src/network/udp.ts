import type { Socket as NodeUdpSocket } from "node:dgram"
import { math_ceil, number_MAX_SAFE_INTEGER, promise_outside, string_toLowerCase } from "../alias.ts"
import { AwaitableQueue, SIZE, type NetAddr, type NetConn, type NetConnReadValue } from "./conn.ts"


/** a {@link NetConn} interface implementation wrapper for `Deno.listenDatagram` (deno's udp implementation). */
export class DenoUdpNetConn implements NetConn {
	protected readonly base: Deno.DatagramConn
	public readonly size: number

	constructor(conn: Deno.DatagramConn) {
		this.base = conn
		// I think deno handles arbitrarily large MTUs, so I'll set the limit to the max possible (on windows).
		this.size = number_MAX_SAFE_INTEGER
	}

	async read(): Promise<NetConnReadValue> {
		const
			base = this.base,
			[buf, deno_addr] = await base.receive() as [Uint8Array<ArrayBuffer>, Deno.NetAddr],
			{ hostname, port } = deno_addr
		return [buf, { hostname, port, family: 4 }]
	}

	async send(buffer: Uint8Array, addr: NetAddr): Promise<number> {
		let bytes_written = 0
		const
			base = this.base,
			bytes_to_write = buffer.byteLength,
			{ hostname, port } = addr,
			deno_addr: Deno.NetAddr = { hostname, port, transport: "udp" }
		// yes, we should permit empty messages, even if the underlying `base` class ignores zero sized messages.
		if (bytes_to_write === 0) { return base.send(buffer, deno_addr) }
		while (bytes_written < bytes_to_write) {
			bytes_written += await base.send(buffer.subarray(bytes_written), deno_addr)
		}
		// TODO: should we assert `bytes_written === bytes_to_write`?
		return bytes_written
	}

	close(): void {
		this.base.close()
	}
}

/** a {@link NetConn} interface implementation wrapper for `tjs.connect("udp", ...)` (txiki.js's udp implementation). */
export class TjsUdpNetConn implements NetConn {
	protected readonly base: tjs.DatagramEndpoint
	protected readonly buf: Uint8Array
	public readonly size: number

	constructor(conn: tjs.DatagramEndpoint, bring_your_own_buffer?: Uint8Array) {
		this.base = conn
		this.buf = bring_your_own_buffer ?? new Uint8Array(SIZE.DatagramMtu)
		this.size = this.buf.byteLength
	}

	async read(): Promise<NetConnReadValue> {
		const
			base = this.base,
			buf = this.buf,
			{ addr: tjs_addr, nread, partial } = await base.recv(buf) as unknown as tjs.DatagramData, // the return type on tjs is incorrect.
			{ ip: hostname, port, family } = tjs_addr
		return [buf.slice(0, nread), { hostname, port, family: family as any }]
	}

	async send(buffer: Uint8Array, addr: NetAddr): Promise<number> {
		let bytes_written = 0
		const
			base = this.base,
			bytes_to_write = buffer.byteLength,
			{ hostname: ip, port, family } = addr,
			tjs_addr: tjs.Address = { ip, port, family }
		// yes, we should permit empty messages, even if the underlying `base` class may ignore zero sized messages.
		if (bytes_to_write === 0) { return base.send(buffer, tjs_addr) as unknown as number } // the return type on tjs is incorrect.
		while (bytes_written < bytes_to_write) {
			// the return type on tjs is incorrect.
			bytes_written += await base.send(buffer.subarray(bytes_written), tjs_addr) as unknown as number
		}
		// TODO: should we assert `bytes_written === bytes_to_write`?
		return bytes_written
	}

	close(): void {
		this.base.close()
	}
}

/** a {@link NetConn} interface implementation wrapper for node's `dgram` udp implementation. */
export class NodeUdpNetConn implements NetConn {
	protected readonly base: NodeUdpSocket
	protected readonly queue: AwaitableQueue<NetConnReadValue>
	public readonly size: number

	constructor(conn: NodeUdpSocket) {
		const dataQueue = new AwaitableQueue<NetConnReadValue>()
		this.base = conn
		this.size = conn.getRecvBufferSize()
		this.queue = dataQueue
		conn.on("message", (data, info) => {
			// TODO: as noted in "https://nodejs.org/api/dgram.html#event-message",
			// the `address` may contain the name of the network-interface (like "eth0", or "enp0") if the data comes from a localhost.
			// should I be stripping away that info or not? I don't know.
			const
				{ address: hostname, family: family_str, port } = info,
				addr: NetAddr = {
					hostname,
					port,
					family: string_toLowerCase(family_str) === "ipv6" ? 6 : 4,
				}
			dataQueue.push([new Uint8Array(data), addr])
		})
	}

	async read(): Promise<NetConnReadValue> {
		return this.queue.shift()
	}

	async send(buffer: Uint8Array, addr: NetAddr): Promise<number> {
		const
			base = this.base,
			bytes_to_write = buffer.byteLength,
			{ hostname, port, family } = addr,
			[promise, resolve, reject] = promise_outside<number>()
		// from what I read, node queues the entire buffer to be sent in one go.
		// however, if the buffer's size exceeds the os-level MTU size, the os will return an `"EMSGSIZE"` error,
		// which will mean that **nothing** has been sent; and so, _we_ will have to segment our buffer into tinier bits.
		// so, what I'm going to do is that each time we encounter that issue, I will split the size of the buffer into half,
		// and then send it as two packets instead of one.
		// (note: you cannot send it as an array of two buffers, as it will be concatenated onto one for a single datagram, and not _two_ datagrams)
		base.send(buffer, port, hostname, async (err, bytes_sent) => {
			// assert `bytes_sent === bytes_to_write` if no `err` exists
			if (err) {
				if ((err as any).code === "EMSGSIZE") {
					try {
						const
							// the first packet will always be larger or equal to the second.
							// this way, it should't be possible for the first packet to get transmitted, while the second one gets rejected for its size.
							midway = math_ceil(bytes_to_write / 2),
							bytesize1 = await this.send(buffer.subarray(0, midway), addr),
							bytesize2 = await this.send(buffer.subarray(midway), addr)
						return resolve(bytesize1 + bytesize2)
					} catch (e) { err = e as Error }
				}
				reject(err)
			}
			return resolve(bytes_sent)
		})
		return promise
	}

	close(): void {
		this.base.close()
	}
}
