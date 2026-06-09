"""Verify real-time chat: presence (online/offline), message relay, read receipts."""
import os, time, json, paramiko, socketio

# Get two real user ids + a shared conversation from the VPS DB
ssh = paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('145.14.158.100', username='root', password=os.environ['VPS_PASSWORD'], timeout=40, banner_timeout=40, auth_timeout=40)
def q(sql):
    _, o, _ = ssh.exec_command(f"docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod -t -c \"{sql}\"")
    return o.read().decode().strip()
A = q("SELECT id FROM users WHERE email='omar.khalifa@tayyibt.test';")
B = q("SELECT id FROM users WHERE email='fatima.alzahra@tayyibt.test';")
conv = q(f"SELECT \\\"conversationId\\\" FROM conversation_participants WHERE \\\"userId\\\"='{A}' AND \\\"conversationId\\\" IN (SELECT \\\"conversationId\\\" FROM conversation_participants WHERE \\\"userId\\\"='{B}') LIMIT 1;")
ssh.close()
print(f"A(omar)={A[:8]} B(fatima)={B[:8]} conv={conv[:8] if conv else 'none'}")

URL = "https://145-14-158-100.sslip.io"
results = {}

ca = socketio.Client(reconnection=False)
cb = socketio.Client(reconnection=False)

@ca.on('presence')
def a_presence(d): results.setdefault('a_presence', []).append(d)
@ca.on('newMessage')
def a_new(d): results.setdefault('a_new', []).append(d)
@ca.on('messageSeen')
def a_seen(d): results.setdefault('a_seen', []).append(d)
@cb.on('newMessage')
def b_new(d): results.setdefault('b_new', []).append(d)

print("\n1. Connect A and B")
ca.connect(f"{URL}?userId={A}", socketio_path='/socket.io', transports=['websocket'], wait_timeout=10)
cb.connect(f"{URL}?userId={B}", socketio_path='/socket.io', transports=['websocket'], wait_timeout=10)
time.sleep(1)
print(f"   A connected={ca.connected}  B connected={cb.connected}")

print("\n2. A queries B presence (expect online=True)")
pres = ca.call('getPresence', {'userId': B}, timeout=5)
print(f"   getPresence -> {pres}")

print("\n3. Both join conversation; A relays a message -> B should receive newMessage")
ca.emit('joinConversation', {'conversationId': conv, 'userId': A})
cb.emit('joinConversation', {'conversationId': conv, 'userId': B})
time.sleep(0.5)
ca.emit('relayMessage', {'conversationId': conv, 'message': {'id': 'sock-test-1', 'content': 'hi via socket', 'senderId': A, 'createdAt': '2026-01-01T00:00:00Z'}})
time.sleep(1)
print(f"   B received newMessage: {len(results.get('b_new', []))} (content: {[m.get('content') for m in results.get('b_new',[])]})")
print(f"   A did NOT receive own echo: {len(results.get('a_new', []))==0}")

print("\n4. B marks seen -> A should receive messageSeen")
cb.emit('markSeen', {'conversationId': conv, 'userId': B, 'messageId': 'sock-test-1'})
time.sleep(1)
print(f"   A received messageSeen: {len(results.get('a_seen', []))} {results.get('a_seen', [])}")

print("\n5. B disconnects -> A should receive presence offline")
cb.disconnect()
time.sleep(1.5)
offline = [p for p in results.get('a_presence', []) if p.get('userId')==B and p.get('online') is False]
print(f"   A received B-offline presence: {len(offline)>0}  ({results.get('a_presence', [])})")

ca.disconnect()
print("\nDone.")
