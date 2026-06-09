"""Check remaining unknowns: chat conversations, blocks, match profile, refresh."""
import os
import paramiko, json

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
    raw = o.read().decode().strip()
    try: return json.loads(raw)
    except: return {"_raw": raw[:300]}

login = call("POST", "/auth/login", {"email":"omar.khalifa@tayyibt.test","password":"Test1234"})
A = login["data"]["accessToken"]
ID_A = call("GET", "/users/me", token=A)["data"]["id"]
login_b = call("POST", "/auth/login", {"email":"fatima.alzahra@tayyibt.test","password":"Test1234"})
B = login_b["data"]["accessToken"]
ID_B = call("GET", "/users/me", token=B)["data"]["id"]
login_c = call("POST", "/auth/login", {"email":"ahmed.alrashid@tayyibt.test","password":"Test1234"})
C = login_c["data"]["accessToken"]
ID_C = call("GET", "/users/me", token=C)["data"]["id"]

print(f"ID_A={ID_A[:8]} ID_B={ID_B[:8]} ID_C={ID_C[:8]}")

# Check chat routes
print("\n=== Chat routes ===")
_, o, _ = c.exec_command("docker logs tayyibt-backend-1 2>&1 | grep -i 'chat.*route\\|Mapped.*chat' | head -20")
print(o.read().decode().strip())

# Try different chat conversation routes
for body in [{"targetUserId": ID_B}, {"recipientId": ID_B}, {"userId": ID_B}, {"participants":[ID_B]}]:
    r = call("POST", "/chat/conversations", body, token=A)
    key = list(body.keys())[0]
    print(f"  {key}: {r.get('statusCode') or 'OK'} — {r.get('message','')[:50]}")

# Check /chat routes
r = call("GET", "/chat/conversations", token=A)
print(f"\nGET /chat/conversations: {r.get('success')} — data type: {type(r.get('data')).__name__}")
if r.get("data"):
    convs = r["data"]
    if isinstance(convs, list) and convs:
        conv_id = convs[0].get("id","")
        print(f"  existing conv_id: {conv_id[:8]}")

# Check blocks endpoint
print("\n=== Blocks ===")
r = call("POST", "/blocks", {"blockedUserId": ID_C}, token=A)
print(f"POST /blocks blockedUserId: {r}")
r = call("POST", "/blocks", {"userId": ID_C}, token=A)
print(f"POST /blocks userId: {r}")
# Check backend logs for blocks error
_, o, _ = c.exec_command("docker logs tayyibt-backend-1 --tail 5 2>&1 | grep -i 'error\\|Exception'")
print(o.read().decode().strip())

# Check match profile - does Fatima have a profile?
print("\n=== Match profile ===")
r = call("GET", f"/users/{ID_B}/profile", token=A)
print(f"Fatima profile: {r.get('success')} — {list(r.get('data',{}).keys()) if isinstance(r.get('data'),dict) else r.get('data','')}")
r = call("GET", f"/matches/profile/{ID_B}", token=A)
print(f"/matches/profile/{ID_B[:8]}: {r}")

# Check refresh token - look at the RefreshTokenDto
print("\n=== Auth refresh ===")
_, o, _ = c.exec_command("cat /opt/tayyibt/backend/src/auth/dto/refresh-token.dto.ts")
print(o.read().decode().strip())

c.close()