"""Trigger each failing endpoint, then capture the exact backend error stack trace."""
import os
import paramiko, json, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''), timeout=60, banner_timeout=60, auth_timeout=60)
BASE = "https://145-14-158-100.sslip.io/api/v1"

def call(method, path, body=None, token=None):
    h = "-H 'Content-Type: application/json'"
    if token: h += f" -H 'Authorization: Bearer {token}'"
    d = f"-d '{json.dumps(body or {}).replace(chr(39), chr(39)+chr(92)+chr(39)+chr(39))}'" if body else ""
    _, o, _ = c.exec_command(f"curl -s -X {method} '{BASE}{path}' {h} {d}")
    raw = o.read().decode().strip()
    try: return json.loads(raw)
    except: return {"_raw": raw[:200]}

def logs_since():
    _, o, _ = c.exec_command("docker logs tayyibt-backend-1 --tail 25 2>&1 | grep -A 8 -i 'ERROR\\|QueryFailed\\|Exception' | head -40")
    return o.read().decode().strip()

login = call("POST", "/auth/login", {"email":"omar.khalifa@tayyibt.test","password":"Test1234"})
A = login["data"]["accessToken"]
ID_A = call("GET", "/users/me", token=A)["data"]["id"]
lc = call("POST", "/auth/login", {"email":"ahmed.alrashid@tayyibt.test","password":"Test1234"})
ID_C = call("GET", "/users/me", token=lc["data"]["accessToken"])["data"]["id"]

# clear logs marker
c.exec_command("docker logs tayyibt-backend-1 --tail 1 > /tmp/marker 2>&1")

print("=== TEST 1: POST /blocks ===")
r = call("POST", "/blocks", {"blockedUserId": ID_C}, token=A)
print("response:", r)
time.sleep(1)
print("LOG:\n", logs_since())

print("\n=== TEST 2: POST /friends/request ===")
r = call("POST", "/friends/request", {"userId": ID_C}, token=A)
print("response:", r)
time.sleep(1)
print("LOG:\n", logs_since())

print("\n=== TEST 3: POST /posts/:id/save ===")
post = call("POST", "/posts", {"content":"x","postType":"text","audience":"public"}, token=A)
pid = post.get("data",{}).get("id","")
r = call("POST", f"/posts/{pid}/save", {}, token=A)
print("response:", r)
time.sleep(1)
print("LOG:\n", logs_since())
call("DELETE", f"/posts/{pid}", token=A)

print("\n=== TEST 4: GET /groups (listing) ===")
for q in ["", "?type=public", "?filter=suggested"]:
    r = call("GET", f"/groups{q}", token=A)
    print(f"/groups{q}: {r.get('statusCode', 'OK') if isinstance(r,dict) else 'OK'} {str(r)[:80]}")
time.sleep(1)
print("LOG:\n", logs_since())

print("\n=== TEST 5: GET /pages (listing) ===")
r = call("GET", "/pages", token=A)
print(f"/pages: {str(r)[:100]}")
time.sleep(1)
print("LOG:\n", logs_since())

print("\n=== TEST 6: GET /groups/:id/posts ===")
g = call("POST", "/groups", {"name":"T","description":"x","privacy":"public","category":"X"}, token=A)
gid = g.get("data",{}).get("id","")
r = call("GET", f"/groups/{gid}/posts", token=A)
print(f"group posts: {str(r)[:120]}")

c.close()