import os
import paramiko, json, time
c=paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100',username='root',password=os.environ.get('VPS_PASSWORD',''),timeout=40,banner_timeout=40,auth_timeout=40)
BASE="https://145-14-158-100.sslip.io/api/v1"
def call(m,p,b=None,t=None):
    h="-H 'Content-Type: application/json'"
    if t: h+=f" -H 'Authorization: Bearer {t}'"
    safe=json.dumps(b).replace("'","'\\''") if b is not None else ""
    d=f"-d '{safe}'" if b is not None else ""
    _,o,_=c.exec_command(f"curl -s -X {m} '{BASE}{p}' {h} {d}")
    raw=o.read().decode().strip()
    try: return json.loads(raw)
    except: return {"_raw":raw[:150]}
def logtail():
    _,o,_=c.exec_command("docker logs tayyibt-backend-1 --tail 15 2>&1 | grep -B1 -A5 -i 'error\\|exception' | head -30")
    return o.read().decode().strip()

A=call("POST","/auth/login",{"email":"omar.khalifa@tayyibt.test","password":"Test1234"})["data"]["accessToken"]
users=call("GET","/search?q=egypt&category=users&limit=3",A).get("data",{}).get("users",[])
tid=users[0]["id"]
conv=call("POST","/chat/conversations",{"targetUserId":tid},A)
cid=conv.get("data",{}).get("id","")
msg=call("POST","/chat/messages",{"conversationId":cid,"content":"hello test","type":"text"},A)
mid=msg.get("data",{}).get("id","")
print("conv",cid[:8],"msg",mid[:8])

print("\n=== PUT edit ===")
print(call("PUT",f"/chat/messages/{mid}",{"content":"edited"},A))
print("LOG:",logtail())

print("\n=== POST reaction ===")
print(call("POST",f"/chat/messages/{mid}/reactions",{"emoji":"❤️"},A))
print("LOG:",logtail())

print("\n=== GET search ===")
print(call("GET",f"/chat/messages/{cid}/search?q=hello",A))
print("LOG:",logtail())

print("\n=== DELETE ===")
print(call("DELETE",f"/chat/messages/{mid}",A))
print("LOG:",logtail())
c.close()