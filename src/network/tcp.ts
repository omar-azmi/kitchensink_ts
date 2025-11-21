import { SIZE, type NetAddr, type NetConn, type NetConnReadValue } from "./conn.ts"


/** a {@link NetConn} interface implementation wrapper for `Deno.connect` (deno's tcp implementation). */
export class DenoTcpNetConn implements NetConn {
	protected readonly base: Deno.Conn<Deno.NetAddr>
	protected readonly buf: Uint8Array
	protected readonly remoteAddr: NetAddr
	public readonly size: number

	constructor(conn: Deno.Conn, bring_your_own_buffer?: Uint8Array) {
		this.base = conn as any
		this.buf = bring_your_own_buffer ?? new Uint8Array(SIZE.BufferBytes)
		this.size = this.buf.byteLength
		const { hostname, port } = (conn as Deno.Conn<Deno.NetAddr>).remoteAddr
		this.remoteAddr = { hostname, port, family: 4 }
	}

	async read(): Promise<NetConnReadValue> {
		// tcp is a stream based protocol. this means that there is no means of knowing _when_ a complete packet is fully received,
		// aside from inspecting the message itself and having your peer place certain markers in the streaming data,
		// that would allow you to understand where the stream should be segmented.
		// specifically in deno's implementation, I saw in their code base that they return a `null` when zero bytes are received.
		// so I will override that scenario and return a `0` for bytes read instead of a `null` for that situation.
		const
			base = this.base,
			buf = this.buf,
			bytes_read = await base.read(this.buf) ?? 0
		return [buf.slice(0, bytes_read), { ...this.remoteAddr }]
	}

	async send(buffer: Uint8Array, addr?: NetAddr): Promise<number> {
		let bytes_written = 0
		const
			base = this.base,
			bytes_to_write = buffer.byteLength
		// yes, we should permit empty messages, even if the underlying `base` class ignores zero sized messages.
		if (bytes_to_write === 0) { return base.write(buffer) }
		while (bytes_written < bytes_to_write) {
			bytes_written += await base.write(buffer.subarray(bytes_written))
		}
		// TODO: should we assert `bytes_written === bytes_to_write`?
		return bytes_written
	}

	close(): void {
		this.base.close()
	}
}

/** a {@link NetConn} interface implementation wrapper for `tjs.connect("tcp", ...)` (txiki.js's tcp implementation). */
export class TjsTcpNetConn implements NetConn {
	protected readonly base: tjs.Connection
	protected readonly buf: Uint8Array
	protected readonly remoteAddr: NetAddr
	public readonly size: number

	constructor(conn: tjs.Connection, bring_your_own_buffer?: Uint8Array) {
		this.base = conn
		this.buf = bring_your_own_buffer ?? new Uint8Array(SIZE.BufferBytes)
		this.size = this.buf.byteLength
		const { ip: hostname, port, family } = conn.remoteAddress
		this.remoteAddr = { hostname, port, family: family as any }
	}

	async read(): Promise<NetConnReadValue> {
		const
			base = this.base,
			buf = this.buf,
			bytes_read = await base.read(this.buf) ?? 0
		return [buf.slice(0, bytes_read), { ...this.remoteAddr }]
	}

	async send(buffer: Uint8Array, addr?: NetAddr): Promise<number> {
		let bytes_written = 0
		const
			base = this.base,
			bytes_to_write = buffer.byteLength
		// yes, we should permit empty messages, even if the underlying `base` class may ignore zero sized messages.
		if (bytes_to_write === 0) { return base.write(buffer) }
		while (bytes_written < bytes_to_write) {
			bytes_written += await base.write(buffer.subarray(bytes_written))
		}
		// TODO: should we assert `bytes_written === bytes_to_write`?
		return bytes_written
	}

	close(): void {
		this.base.close()
	}
}
