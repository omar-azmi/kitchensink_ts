import { assertEquals, assertLessOrEqual } from "jsr:@std/assert"
import type { NetConnReadValue, NetConn, NetAddr } from "../src/network/conn.ts"
import { DenoTcpNetConn, NodeTcpNetConn } from "../src/network/tcp.ts"
import { DenoUdpNetConn, NodeUdpNetConn } from "../src/network/udp.ts"
import { textEncoder, textDecoder } from "../src/eightpack.ts"


Deno.test("Conn wrapper works", async (t) => {
	const server_listener = Deno.listen({
		transport: "tcp",
		hostname: "0.0.0.0",
		port: 9005,
	})

	const
		// the hostname cannot be "0.0.0.0" for connecting to localhost,
		// because (I think) "0.0.0.0" is only for broadcasting everywhere, and not for connecting _to_.
		client_conn_promise = Deno.connect({ transport: "tcp", hostname: "127.0.0.1", port: 9005 }),
		server_conn_promise = server_listener.accept(),
		client_conn = new DenoTcpNetConn(await client_conn_promise),
		server_conn = new DenoTcpNetConn(await server_conn_promise)

	// TODO: turn these into factory functions that take `server_conn` and `client_conn` as runtime-agnostic input parameters, and then execute their tests.
	await t.step("server can send and client can receive - small messages", async () => {
		await server_conn.send(textEncoder.encode("hello world!"))
		const [message, server_addr] = await client_conn.read()

		assertEquals(textDecoder.decode(message), "hello world!")
		assertEquals(server_addr, { hostname: "127.0.0.1", port: 9005, family: 4 })
	})

	await t.step("server can send and client can receive - large messages split into chunks", async () => {
		const
			big_message_size = 8 * 1024 * 1024 + 5, // 8 megabytes + 5 bytes (so that it is not perfectly divisible by `server_conn.size`)
			big_message = new Uint8Array(big_message_size)
		big_message.set(crypto.getRandomValues(new Uint8Array(2 ** 16)))
		// we do not wait for the promise below immediately because on linux,
		// the deno socket stops queuing more than 2.5mb, unless the client begins consuming the incoming bytes.
		const send_promise = server_conn.send(big_message)
		let total_bytes_received = 0
		while (total_bytes_received < big_message_size) {
			const
				[message, server_addr] = await client_conn.read(),
				chunk_size = message.byteLength
			total_bytes_received += chunk_size
			assertLessOrEqual(chunk_size, server_conn.size)
		}
		assertEquals(total_bytes_received, big_message_size)
		await send_promise
	})

	client_conn.close()
	server_conn.close()
	server_listener.close()
})
