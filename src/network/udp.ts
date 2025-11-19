import { number_MAX_SAFE_INTEGER } from "../alias.ts"
import type { NetAddr, NetConn, NetConnReadValue } from "./conn.ts"


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
