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
    try: return json.loads(o.read().decode().strip())
    except: return {}
A=call("POST","/auth/login",{"email":"omar.khalifa@tayyibt.test","password":"Test1234"})["data"]["accessToken"]

print("=== XSS sanitization ===")
payload="<img src=x onerror=alert(1)> hello <script>alert('x')</script> world"
r=call("POST","/posts",{"content":payload,"postType":"text","audience":"public"},A)
pid=r.get("data",{}).get("id","")
got=call("GET",f"/posts/{pid}",A).get("data",{}).get("content","")
print(f"  input : {payload}")
print(f"  stored: {got}")
print(f"  script stripped: {'<script>' not in got}")
print(f"  onerror stripped: {'onerror' not in got.lower()}")
call("DELETE",f"/posts/{pid}",A)

print("\n=== Chat: create direct conversation (C-03) ===")
fatima=call("GET","/search?q=fatima&category=users&limit=1",A).get("data",{}).get("users",[])
tid=fatima[0]["id"] if fatima else ""
conv=call("POST","/chat/conversations",{"targetUserId":tid},A)
cid=conv.get("data",{}).get("id","")
print(f"  conversation created: {bool(cid)} id={cid[:8]}")
msg=call("POST","/chat/messages",{"conversationId":cid,"content":"Salam","type":"text"},A)
print(f"  message sent: {bool(msg.get('data',{}).get('id'))}")
msgs=call("GET",f"/chat/conversations/{cid}/messages",A)
print(f"  messages readable (no 403): {msgs.get('success') is True}")

print("\n=== Group posts (H-09) ===")
g=call("POST","/groups",{"name":"VTest","description":"x","privacy":"public","category":"X"},A)
gid=g.get("data",{}).get("id","")
gp=call("POST",f"/groups/{gid}/posts",{"content":"group hello","postType":"text","audience":"public"},A)
print(f"  group post created: {bool(gp.get('data',{}).get('id')) or gp.get('success')}")
gpl=call("GET",f"/groups/{gid}/posts",A)
print(f"  group posts list: {gpl.get('success') is True or isinstance(gpl.get('data'),list)}")

print("\n=== Invalid UUID → 400 not 500 ===")
iv=call("GET","/posts/not-a-uuid",A)
print(f"  status: {iv.get('statusCode')} (expect 400)")

c.close()