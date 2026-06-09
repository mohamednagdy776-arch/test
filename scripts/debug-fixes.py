import os
import paramiko, json
c=paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100',username='root',password=os.environ.get('VPS_PASSWORD',''),timeout=40,banner_timeout=40,auth_timeout=40)
BASE="https://145-14-158-100.sslip.io/api/v1"
def call(m,p,b=None,t=None):
    h="-H 'Content-Type: application/json'"
    if t: h+=f" -H 'Authorization: Bearer {t}'"
    d=f"-d '{json.dumps(b).replace(chr(39),chr(39)+chr(92)+chr(39)+chr(39))}'" if b else ""
    _,o,_=c.exec_command(f"curl -s -X {m} '{BASE}{p}' {h} {d}")
    raw=o.read().decode().strip()
    try: return json.loads(raw)
    except: return {"_raw":raw[:200]}
def logs():
    _,o,_=c.exec_command("docker logs tayyibt-backend-1 --tail 12 2>&1 | grep -A6 -i 'error\\|exception' | head -25")
    return o.read().decode().strip()
A=call("POST","/auth/login",{"email":"omar.khalifa@tayyibt.test","password":"Test1234"})["data"]["accessToken"]
users=call("GET","/search?q=egypt&category=users&limit=5",A).get("data",{}).get("users",[])
print("search returned",len(users),"users")
tid=users[0]["id"] if users else ""
print("target id:",tid[:8] if tid else "NONE")
print("=== POST /chat/conversations raw ===")
r=call("POST","/chat/conversations",{"targetUserId":tid},A)
print(json.dumps(r,indent=2,ensure_ascii=False)[:400])
print("LOG:",logs())

print("\n=== XSS content check ===")
r=call("POST","/posts",{"content":"<img src=x onerror=alert(1)> hello world","postType":"text","audience":"public"},A)
pid=r.get("data",{}).get("id","")
g=call("GET",f"/posts/{pid}",A)
print("content repr:",repr(g.get("data",{}).get("content")))
call("DELETE",f"/posts/{pid}",A)

print("\n=== Group posts list raw ===")
g=call("POST","/groups",{"name":"DBG","description":"x","privacy":"public","category":"X"},A)
gid=g.get("data",{}).get("id","")
call("POST",f"/groups/{gid}/posts",{"content":"hi","postType":"text","audience":"public"},A)
gpl=call("GET",f"/groups/{gid}/posts",A)
print(json.dumps(gpl,indent=2,ensure_ascii=False)[:300])
c.close()