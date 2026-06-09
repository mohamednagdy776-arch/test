"""Quick smoke-test: run 5 AI match pairs and 3 other AI endpoints."""
import os
import paramiko, json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)

def run(cmd):
    _, o, e = c.exec_command(cmd)
    return (o.read() + e.read()).decode().strip()

BASE = "https://145-14-158-100.sslip.io/ai/api/v1"

def post(endpoint, payload):
    body = json.dumps(payload).replace('"', '\\"')
    result = run(f'curl -sf -X POST {BASE}{endpoint} -H "Content-Type: application/json" -d "{body}"')
    try:
        return json.loads(result)
    except:
        return result

print("=" * 60)
print("AI MATCHING TEST — 5 pairs")
print("=" * 60)

PAIRS = [
    ("Ahmed (EG, 28M, Sunni, always, moderate) × Fatima (EG, 26F, Sunni, always, conservative)",
     {"user_a":{"user_id":"m1","gender":"male","age":28,"sect":"Sunni","prayer_level":5,"religious_commitment":5,"lifestyle_type":"moderate","cultural_level":3,"country":"Egypt","city":"Cairo","education_level":4,"wants_children":True},
      "user_b":{"user_id":"f1","gender":"female","age":26,"sect":"Sunni","prayer_level":5,"religious_commitment":5,"lifestyle_type":"conservative","cultural_level":2,"country":"Egypt","city":"Cairo","education_level":4,"wants_children":True}}),

    ("Omar (SA, 32M, Sunni, always, conservative) × Aisha (SA, 24F, Sunni, always, conservative)",
     {"user_a":{"user_id":"m2","gender":"male","age":32,"sect":"Sunni","prayer_level":5,"religious_commitment":5,"lifestyle_type":"conservative","cultural_level":2,"country":"Saudi Arabia","city":"Riyadh","wants_children":True},
      "user_b":{"user_id":"f2","gender":"female","age":24,"sect":"Sunni","prayer_level":5,"religious_commitment":5,"lifestyle_type":"conservative","cultural_level":2,"country":"Saudi Arabia","city":"Jeddah","wants_children":True}}),

    ("Zaid (IQ, 36M, Shia) × Zainab (IQ, 32F, Shia)",
     {"user_a":{"user_id":"m3","gender":"male","age":36,"sect":"Shia","prayer_level":5,"religious_commitment":5,"lifestyle_type":"moderate","cultural_level":3,"country":"Iraq","city":"Baghdad","wants_children":True},
      "user_b":{"user_id":"f3","gender":"female","age":32,"sect":"Shia","prayer_level":5,"religious_commitment":5,"lifestyle_type":"moderate","cultural_level":3,"country":"Iraq","city":"Baghdad","wants_children":True}}),

    ("Walid (LB, 34M, Sunni, sometimes, open) × Nour (LB, 30F, Sunni, sometimes, open)",
     {"user_a":{"user_id":"m4","gender":"male","age":34,"sect":"Sunni","prayer_level":2,"religious_commitment":3,"lifestyle_type":"open","cultural_level":4,"country":"Lebanon","wants_children":True},
      "user_b":{"user_id":"f4","gender":"female","age":30,"sect":"Sunni","prayer_level":2,"religious_commitment":3,"lifestyle_type":"open","cultural_level":5,"country":"Lebanon","wants_children":True}}),

    ("Bilal (PK, 27M, Sunni, always, conservative) × Khadija (SN, 27F, Sunni, always, conservative)",
     {"user_a":{"user_id":"m5","gender":"male","age":27,"sect":"Sunni","prayer_level":5,"religious_commitment":5,"lifestyle_type":"conservative","country":"Pakistan","wants_children":True},
      "user_b":{"user_id":"f5","gender":"female","age":27,"sect":"Sunni","prayer_level":5,"religious_commitment":5,"lifestyle_type":"conservative","country":"Senegal","wants_children":True}}),
]

for label, payload in PAIRS:
    result = post("/match", payload)
    score = result.get("compatibilityScore","?") if isinstance(result, dict) else "ERROR"
    reasons = result.get("matchReasons",[]) if isinstance(result, dict) else [str(result)]
    print(f"\n{label}")
    print(f"  Score: {score}/100")
    for r in reasons[:2]:
        print(f"  • {r}")

print("\n" + "=" * 60)
print("OTHER AI ENDPOINTS")
print("=" * 60)

# Profile tips
tips = post("/profile-tips", {"profile":{"user_id":"t1","age":25,"gender":"male","country":"Egypt"}})
print("\nProfile tips (25M, Egypt, minimal profile):")
for t in tips.get("tips",[])[:3]:
    print(f"  • {t}")
print(f"  Completeness: {tips.get('completeness_score','?')}%")

# Bio suggestion
bio = post("/bio-suggestion", {"age":29,"gender":"female","country":"Jordan","occupation":"Doctor","lifestyle":"moderate","sect":"Sunni","language":"en"})
print(f"\nBio suggestion (29F doctor, Jordan):\n  {bio.get('bio','?')[:200]}")

# Icebreaker
ice = post("/icebreaker", {"user_a_id":"u1","user_b_id":"u2","score":74,"shared_interests":["cooking","travel"],"user_b_country":"Morocco","user_b_occupation":"Architect"})
print("\nIcebreakers for 74% match:")
for s in ice.get("starters",[]):
    print(f"  • {s}")

# Moderation
mod = post("/moderate", {"content":"Looking for a pious, loving partner to build a halal home","content_type":"bio"})
print(f"\nModeration ('pious partner bio'): appropriate={mod.get('is_appropriate','?')}")

c.close()