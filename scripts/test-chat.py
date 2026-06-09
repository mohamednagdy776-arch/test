import os, json, paramiko
c=paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100',username='root',password=os.environ.get('VPS_PASSWORD',''),timeout=40,banner_timeout=40,auth_timeout=40)
BASE="https://145-14-158-100.sslip.io/api/v1"
def call(m,p,b=None,t=None):
    h="-H 'Content-Type: application/json'"
    if t: h+=f" -H 'Authorization: Bearer {t}'"
    d=f"-d '{json.dumps(b).replace(chr(39),chr(39)+chr(92)+chr(39)+chr(39))}'" if b is not None else ""
    _,o,_=c.exec_command(f"curl -s -X {m} '{BASE}{p}' {h} {d}")
    raw=o.read().decode().strip()
    try: return json.loads(raw)
    except: return {"_raw":raw[:150]}

A=call("POST","/auth/login",{"email":"omar.khalifa@tayyibt.test","password":"Test1234"})["data"]["accessToken"]
B=call("POST","/auth/login",{"email":"fatima.alzahra@tayyibt.test","password":"Test1234"})["data"]["accessToken"]
# Fatima's real user id from the DB (reliable)
_,o,_=c.exec_command("docker exec tayyibt-postgres-1 psql -U tayyibt_user -d tayyibt_prod -t -c \"SELECT id FROM users WHERE email='fatima.alzahra@tayyibt.test';\"")
fid=o.read().decode().strip()
print("PASS" if fid else "FAIL","got fatima id", fid[:8])

print("\n=== 1. Create direct conversation (A→Fatima) ===")
conv=call("POST","/chat/conversations",{"targetUserId":fid},A).get("data",{})
cid=conv.get("id","")
print(f"  conv id: {cid[:8]}  name: {conv.get('name')}  otherUserId: {(conv.get('otherUserId') or '')[:8]}  otherUserName: {conv.get('otherUserName')}")
print("  PASS name is not generic" if conv.get('name') not in (None,'محادثة','') else "  WARN generic name")

print("\n=== 2. Idempotent (calling again returns same conv) ===")
conv2=call("POST","/chat/conversations",{"targetUserId":fid},A).get("data",{})
print(f"  same id: {conv2.get('id')==cid}")

print("\n=== 3. A sends a message ===")
msg=call("POST","/chat/messages",{"conversationId":cid,"content":"السلام عليكم","type":"text"},A).get("data",{})
mid=msg.get("id","")
print(f"  message id: {mid[:8]}")

print("\n=== 4. Fatima reads conversation (no 403) ===")
msgs_b=call("GET",f"/chat/conversations/{cid}/messages",t=B)
arr=msgs_b.get("data",{}).get("data",[]) if isinstance(msgs_b.get("data"),dict) else []
print(f"  messages visible to B: {len(arr)}  success={msgs_b.get('success')}")
print(f"  no duplicate (exactly 1 msg): {len(arr)==1}")

print("\n=== 5. Conversation appears in both inboxes ===")
ca=call("GET","/chat/conversations",t=A).get("data",[])
cb=call("GET","/chat/conversations",t=B).get("data",[])
print(f"  A inbox has conv: {any(x.get('id')==cid for x in ca)}  (A sees other='{[x.get('otherUserName') for x in ca if x.get('id')==cid]}')")
print(f"  B inbox has conv: {any(x.get('id')==cid for x in cb)}  (B sees other='{[x.get('otherUserName') for x in cb if x.get('id')==cid]}')")

print("\n=== 6. Edit / react / delete ===")
e=call("PUT",f"/chat/messages/{mid}",{"content":"وعليكم السلام"},A)
print(f"  edit: {e.get('success')}")
r=call("POST",f"/chat/messages/{mid}/reactions",{"emoji":'❤️'},B)
print(f"  react (B): {r.get('success')}")
d=call("DELETE",f"/chat/messages/{mid}",A)
print(f"  delete: {d.get('success')}")

c.close()
