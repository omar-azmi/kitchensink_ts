import { number_MAX_SAFE_INTEGER } from "../alias.ts"
import { SIZE, type NetAddr, type NetConn, type NetConnReadValue } from "./conn.ts"


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
