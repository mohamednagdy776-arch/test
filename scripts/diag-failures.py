"""Investigate the 13 failing test cases to find correct endpoint shapes."""
import os
import paramiko, json, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

BASE = "https://145-14-158-100.sslip.io/api/v1"

def call(method, path, body=None, token=None):
    h = "-H 'Content-Type: application/json'"
    if token: h += f" -H 'Authorization: Bearer {token}'"
    d = f"-d '{json.dumps(body or {}).replace(chr(39), chr(39)+chr(92)+chr(39)+chr(39))}'" if body else ""
    _, o, _ = c.exec_command(f"curl -s -X {method} '{BASE}{path}' {h} {d}")
    raw = (o.read()).decode().strip()
    try: return json.loads(raw)
    except: return {"_raw": raw[:200]}

# Login
login = call("POST", "/auth/login", {"email":"omar.khalifa@tayyibt.test","password":"Test1234"})
A = login["data"]["accessToken"]
ID_A = call("GET", "/users/me", token=A)["data"]["id"]

login_b = call("POST", "/auth/login", {"email":"fatima.alzahra@tayyibt.test","password":"Test1234"})
B = login_b["data"]["accessToken"]
ID_B = login_b["data"]["id"] if "id" in login_b.get("data",{}) else call("GET", "/users/me", token=B)["data"]["id"]

refresh = login["data"]["refreshToken"]

print("=== 1.8 Refresh token ===")
r = call("POST", "/auth/refresh", {"refreshToken": refresh})
print(json.dumps(r, indent=2)[:300])

print("\n=== 2.5 /matches/profile/:id ===")
r = call("GET", f"/matches/profile/{ID_B}", token=A)
print(json.dumps(r, indent=2)[:300])

print("\n=== 5.5 /posts/:id/save (need a post ID) ===")
post = call("POST", "/posts", {"content":"test save","postType":"text","audience":"public"}, token=A)
pid = post.get("data",{}).get("id","")
print(f"post_id={pid}")
r = call("POST", f"/posts/{pid}/save", {}, token=A)
print(json.dumps(r, indent=2)[:200])
# Also try /saved-items directly
r2 = call("POST", "/saved-items", {"entityId": pid, "entityType": "post"}, token=A)
print("saved-items POST:", json.dumps(r2, indent=2)[:200])

print("\n=== 5.7 /comments ===")
r = call("POST", "/comments", {"postId": pid, "content": "test comment"}, token=B)
print(json.dumps(r, indent=2)[:300])
# Try posts/:id/comments
r2 = call("POST", f"/posts/{pid}/comments", {"content": "test"}, token=B)
print("posts/:id/comments:", json.dumps(r2, indent=2)[:200])

print("\n=== 5.8 GET /comments ===")
r = call("GET", f"/comments?postId={pid}", token=A)
print(json.dumps(r, indent=2)[:300])

print("\n=== 6.2 /friends/request ===")
r = call("POST", "/friends/request", {"addresseeId": ID_B}, token=A)
print(json.dumps(r, indent=2)[:300])

print("\n=== 7.1 /chat/conversations ===")
r = call("POST", "/chat/conversations", {"targetUserId": ID_B}, token=A)
print(json.dumps(r, indent=2)[:300])
# Try participantIds
r2 = call("POST", "/chat/conversations", {"participantIds": [ID_B]}, token=A)
print("participantIds:", json.dumps(r2, indent=2)[:200])

print("\n=== 10.3 /events/:id/rsvp ===")
ev = call("POST", "/events", {"title":"Test","description":"x","startDate":"2026-12-01T10:00:00Z","endDate":"2026-12-01T12:00:00Z","location":"Cairo"}, token=A)
eid = ev.get("data",{}).get("id","")
print(f"event_id={eid}")
r = call("POST", f"/events/{eid}/rsvp", {"status":"attending"}, token=B)
print(json.dumps(r, indent=2)[:300])
r2 = call("POST", f"/events/{eid}/rsvp", {"response":"attending"}, token=B)
print("response key:", json.dumps(r2, indent=2)[:200])

print("\n=== 12.1 GET /saved-items ===")
r = call("GET", "/saved-items", token=A)
print(json.dumps(r, indent=2)[:300])
r2 = call("GET", "/saved", token=A)
print("/saved:", json.dumps(r2, indent=2)[:200])

print("\n=== 12.3 POST /saved-items/collections ===")
r = call("POST", "/saved-items/collections", {"name":"My Collection"}, token=A)
print(json.dumps(r, indent=2)[:300])
r2 = call("POST", "/saved/collections", {"name":"My Collection"}, token=A)
print("/saved/collections:", json.dumps(r2, indent=2)[:200])

print("\n=== 13.6 POST /blocks ===")
login_c = call("POST", "/auth/login", {"email":"ahmed.alrashid@tayyibt.test","password":"Test1234"})
ID_C = call("GET", "/users/me", token=login_c["data"]["accessToken"])["data"]["id"]
r = call("POST", "/blocks", {"blockedUserId": ID_C}, token=A)
print(json.dumps(r, indent=2)[:300])
r2 = call("POST", "/settings/blocks", {"blockedUserId": ID_C}, token=A)
print("/settings/blocks:", json.dumps(r2, indent=2)[:200])

# Cleanup
call("DELETE", f"/posts/{pid}", token=A)
c.close()