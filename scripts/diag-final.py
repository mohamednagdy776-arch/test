import os
import paramiko, json
import shlex

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''), timeout=60, banner_timeout=60, auth_timeout=60)

BASE = "https://145-14-158-100.sslip.io/api/v1"

def call(method, path, body=None, token=None):
    h = "-H 'Content-Type: application/json'"
    # Use shlex.quote() to prevent OS command injection from token and other variables
    if token: h += f" -H {shlex.quote(f'Authorization: Bearer {token}')}"
    d = f"-d {shlex.quote(json.dumps(body or {}))}" if body else ""
    cmd = f"curl -s -X {shlex.quote(method)} {shlex.quote(BASE + path)} {h} {d}"
    _, o, _ = c.exec_command(cmd)
    raw = o.read().decode().strip()
    try: return json.loads(raw)
    except: return {"_raw": raw[:200]}

def run(cmd):
    _, o, _ = c.exec_command(cmd)
    return (o.read()).decode().strip()

login = call("POST", "/auth/login", {"email":"omar.khalifa@tayyibt.test","password":"Test1234"})
A = login["data"]["accessToken"]
ID_A = call("GET", "/users/me", token=A)["data"]["id"]
lb = call("POST", "/auth/login", {"email":"fatima.alzahra@tayyibt.test","password":"Test1234"})
B = lb["data"]["accessToken"]
ID_B = call("GET", "/users/me", token=B)["data"]["id"]
lc = call("POST", "/auth/login", {"email":"ahmed.alrashid@tayyibt.test","password":"Test1234"})
C = lc["data"]["accessToken"]
ID_C = call("GET", "/users/me", token=C)["data"]["id"]

print(f"IDs: A={ID_A[:8]} B={ID_B[:8]} C={ID_C[:8]}")

# Check if Ahmed has a profile
print("\n=== Ahmed profile in DB ===")
print(run(f"docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod -c \"SELECT u.email, p.id as profile_id, p.full_name FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id='{ID_C}';\""))

# Check match profile endpoint
print("\n=== /matches/profile with user who definitely has profile ===")
# Use one of our known seed users
r = run(f"docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod -t -c \"SELECT u.id FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.email LIKE '%tayyibt.test' AND u.gender='female' LIMIT 1;\"")
female_id = r.strip()
print(f"Female user with profile: {female_id[:8] if female_id else 'none'}")
if female_id:
    r2 = call("GET", f"/matches/profile/{female_id}", token=A)
    print(json.dumps(r2, indent=2)[:300])

# Check friend request error
print("\n=== Friend request (userId) ===")
r = call("POST", "/friends/request", {"userId": ID_B}, token=A)
print(json.dumps(r, indent=2)[:200])
# Also try addresseeId
r2 = call("POST", "/friends/request", {"addresseeId": ID_B}, token=A)
print("addresseeId:", json.dumps(r2, indent=2)[:100])

# Check friends follow routes in backend
print("\n=== Friends follow routes ===")
print(run("docker logs tayyibt-backend-1 2>&1 | grep -i 'follow\\|friends' | head -10"))

# Check group leave
print("\n=== Group leave ===")
r = call("POST", "/groups", {"name":"TestLeave","description":"x","privacy":"public","category":"Test"}, token=A)
gid = r.get("data",{}).get("id","")
if gid:
    r2 = call("POST", f"/groups/{gid}/join", {}, token=B)
    print(f"join: {r2.get('success')}")
    r3 = call("POST", f"/groups/{gid}/leave", {}, token=B)
    print(f"leave: {json.dumps(r3, indent=2)[:200]}")
    # try different method
    r4 = call("DELETE", f"/groups/{gid}/leave", {}, token=B)
    print(f"DELETE leave: {json.dumps(r4, indent=2)[:100]}")

# Event attendees
print("\n=== Event attendees ===")
r = call("POST", "/events", {"title":"T","description":"x","startDate":"2026-12-01T10:00:00Z","endDate":"2026-12-01T12:00:00Z","location":"Cairo"}, token=A)
eid = r.get("data",{}).get("id","")
call("POST", f"/events/{eid}/rsvp", {"status":"going"}, token=B)
r2 = call("GET", f"/events/{eid}/attendees", token=A)
print(json.dumps(r2, indent=2)[:200])
r3 = call("GET", f"/events/{eid}/rsvps", token=A)
print(f"rsvps: {json.dumps(r3, indent=2)[:200]}")

# Invalid UUID 500 issue
print("\n=== Invalid UUID path ===")
r = call("GET", "/posts/not-a-uuid", token=A)
print(f"status={r.get('statusCode')} msg={r.get('message','')[:50]}")

# Chat — how to create a conversation
print("\n=== Chat send message with targetUserId ===")
r = call("POST", "/chat/messages", {"targetUserId": ID_B, "content":"test direct", "type":"text"}, token=A)
print(json.dumps(r, indent=2)[:300])

c.close()
