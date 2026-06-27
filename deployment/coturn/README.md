# coturn (TURN/STUN) — Tayyibt voice calls

1:1 WebRTC voice calls relay through a **coturn** server installed natively on
the VPS (`145.14.158.100`, coturn v4.6.1). This directory documents and version-
controls that setup, which otherwise lived only as a hand-edited system file.

## Files
- [`turnserver.conf`](./turnserver.conf) — mirror of `/etc/turnserver.conf` (secret redacted).

## How the pieces fit
- **Backend** mints EPHEMERAL TURN credentials at `GET /api/v1/calls/ice-servers`
  using coturn's REST-API shared secret (`use-auth-secret`). The long-lived
  `static-auth-secret` never reaches the browser.
- The conf's `static-auth-secret` **must equal** the backend env `TURN_SECRET`
  (in `/opt/tayyibt/.env.production`). Related env: `TURN_URLS`, `TURN_TTL`,
  `STUN_URLS`.

## Install / update on the VPS
```bash
sudo apt-get install -y coturn
sudo cp deployment/coturn/turnserver.conf /etc/turnserver.conf
# set the real secret (must match backend TURN_SECRET):
sudo sed -i "s/__REPLACE_WITH_TURN_SECRET__/$TURN_SECRET/" /etc/turnserver.conf
echo 'TURNSERVER_ENABLED=1' | sudo tee /etc/default/coturn
sudo systemctl enable --now coturn
sudo systemctl restart coturn
```

## Firewall — REQUIRED (this is the part that bites)
coturn needs these inbound, at **both** the host (UFW) **and** the hosting
provider's network firewall. The provider firewall is the one that's easy to
miss — its default often only allows 22/80/443, which silently breaks all
cross-network calls (packets never reach the VM; verify with
`tcpdump -ni eth0 'udp and port 3478'`).

| Protocol | Port(s)        | Purpose                          |
| -------- | -------------- | -------------------------------- |
| UDP      | `3478`         | TURN/STUN allocation             |
| TCP      | `3478`         | TURN over TCP fallback           |
| UDP      | `49152-65535`  | relay media range                |

UFW:
```bash
sudo ufw allow 3478/udp && sudo ufw allow 3478/tcp && sudo ufw allow 49152:65535/udp
```

> Note: if only UDP/TCP `3478` is open (relay range still blocked), calls still
> connect because when **both** peers relay through the same coturn the media is
> bridged internally (`relay_portA → relay_portB` on the public IP, never leaving
> the box). Opening the relay range lets calls use the lighter single-relay path.

## Verifying a fix
- On the VPS: `turnutils_uclient -y -s -u tayyibt -W "$TURN_SECRET" -p 3478 145.14.158.100`
  → expect `Total lost packets 0`.
- From an EXTERNAL browser: create an `RTCPeerConnection` with
  `iceTransportPolicy:'relay'` and the minted creds — you should get a
  `typ relay` candidate on `145.14.158.100`.
