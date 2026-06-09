"""
Seed 50 detailed, diverse Muslim users for AI matching tests.
Inserts directly into PostgreSQL via the postgres Docker container.
Resets existing users first.
"""
import os
import paramiko, uuid, json

# bcrypt hash of "Test1234"
PASS_HASH = "$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG"

# ── User dataset ──────────────────────────────────────────────────────────────
# Fields: first, last, gender, age, country, city, education, job, financial,
#         sect, prayer, commitment, lifestyle, cultural, bio,
#         marital, children, wants_children, relocate, preferred_country,
#         min_age, max_age
USERS = [
  # ── MALES ──────────────────────────────────────────────────────────────────
  { "first":"Ahmed",    "last":"Al-Rashid",   "gender":"male",   "age":28,
    "country":"Egypt",        "city":"Cairo",
    "education":"master's",   "job":"Software Engineer",   "financial":"middle",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Software engineer passionate about technology and Islamic history. I pray 5 times daily and value knowledge deeply. Seeking a righteous, educated partner to build a purposeful life together.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Egypt",    "min_age":22, "max_age":32 },

  { "first":"Omar",     "last":"Khalifa",     "gender":"male",   "age":32,
    "country":"Saudi Arabia",  "city":"Riyadh",
    "education":"bachelor's",  "job":"Civil Engineer",      "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Civil engineer from Riyadh. I hold my deen close to my heart, pray regularly, and enjoy reading Islamic literature and outdoor activities. Looking for a pious, family-oriented wife.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Saudi Arabia","min_age":24, "max_age":34 },

  { "first":"Yusuf",    "last":"Benali",      "gender":"male",   "age":26,
    "country":"Morocco",      "city":"Casablanca",
    "education":"bachelor's",  "job":"Graphic Designer",    "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Creative designer who loves calligraphy, travel, and cooking Moroccan food. I try to grow spiritually every day. Looking for a kind, open-minded partner who values both deen and culture.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Morocco",  "min_age":22, "max_age":30 },

  { "first":"Ibrahim",  "last":"Hassan",      "gender":"male",   "age":35,
    "country":"UAE",           "city":"Dubai",
    "education":"master's",   "job":"Financial Analyst",   "financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Finance professional living in Dubai. I enjoy reading, hiking, and volunteering. I have matured through life experiences and now prioritize building a peaceful, loving home.",
    "marital":"divorced","children":1,"wants_children":True,  "relocate":True,  "preferred_country":"UAE",      "min_age":26, "max_age":38 },

  { "first":"Khalid",   "last":"Al-Turki",    "gender":"male",   "age":30,
    "country":"Saudi Arabia",  "city":"Jeddah",
    "education":"phd",         "job":"University Lecturer", "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"University lecturer specializing in Islamic Economics. I value intellectual conversation, community service, and continuous learning. Seeking a well-educated, God-fearing partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Saudi Arabia","min_age":25, "max_age":34 },

  { "first":"Bilal",    "last":"Chaudhry",    "gender":"male",   "age":27,
    "country":"Pakistan",     "city":"Lahore",
    "education":"bachelor's",  "job":"Teacher",             "financial":"middle",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"High school teacher who loves his students and his community. I recite Quran daily, volunteer at the local masjid, and enjoy cricket. Looking for a modest, family-oriented partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Pakistan", "min_age":22, "max_age":30 },

  { "first":"Tariq",    "last":"Mansouri",    "gender":"male",   "age":33,
    "country":"Jordan",       "city":"Amman",
    "education":"master's",   "job":"Pharmacist",          "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Pharmacist who cares deeply about health and community well-being. I enjoy football, cooking, and travelling to learn about Islamic civilizations. Ready to commit and build a family.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Jordan",   "min_age":25, "max_age":36 },

  { "first":"Hassan",   "last":"Ibrahim",     "gender":"male",   "age":29,
    "country":"Egypt",        "city":"Alexandria",
    "education":"bachelor's",  "job":"Accountant",          "financial":"middle",
    "sect":"Sunni",  "prayer":"sometimes", "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Accountant from Alexandria who loves the sea, music, and good food. I am working on strengthening my practice and want a partner who inspires growth without judgment.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Egypt",    "min_age":23, "max_age":32 },

  { "first":"Abdullah", "last":"Al-Zahrani",  "gender":"male",   "age":38,
    "country":"Saudi Arabia",  "city":"Mecca",
    "education":"bachelor's",  "job":"Business Owner",      "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Entrepreneur from Mecca, deeply connected to the holy city and its values. I run a halal food business and prioritize family above all. Seeking a pious, mature partner.",
    "marital":"widowed","children":2,"wants_children":True,  "relocate":False, "preferred_country":"Saudi Arabia","min_age":28, "max_age":40 },

  { "first":"Faisal",   "last":"Al-Amin",     "gender":"male",   "age":24,
    "country":"Kuwait",       "city":"Kuwait City",
    "education":"bachelor's",  "job":"Marketing Specialist","financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Young professional from Kuwait City who loves traveling, photography, and investing. I balance modern life with Islamic values. Excited to start a family with the right person.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Kuwait",   "min_age":20, "max_age":28 },

  { "first":"Zaid",     "last":"Al-Shammari", "gender":"male",   "age":36,
    "country":"Iraq",         "city":"Baghdad",
    "education":"master's",   "job":"Doctor",              "financial":"high",
    "sect":"Shia",   "prayer":"always",    "commitment":"high",
    "lifestyle":"moderate",   "cultural":"traditional",
    "bio":"Cardiologist committed to serving patients and community. My faith guides everything I do. I enjoy reading poetry, gardening, and family gatherings. Looking for a compassionate, faithful partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Iraq",     "min_age":28, "max_age":38 },

  { "first":"Mustafa",  "last":"Ozdemir",     "gender":"male",   "age":31,
    "country":"Turkey",       "city":"Istanbul",
    "education":"master's",   "job":"Architect",           "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Architect who finds beauty in Islamic geometric patterns and Ottoman architecture. I pray regularly, enjoy hiking the Bosphorus hills, and love traditional Turkish cuisine. Seeking a cultured partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Turkey",   "min_age":25, "max_age":34 },

  { "first":"Hamza",    "last":"Malik",       "gender":"male",   "age":25,
    "country":"UK",            "city":"London",
    "education":"bachelor's",  "job":"IT Consultant",       "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"British-Pakistani IT consultant balancing two cultures. Active at my local mosque, enjoy football, hiking, and reading. Looking for someone who embraces both British and Islamic identity.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"UK",       "min_age":22, "max_age":30 },

  { "first":"Samir",    "last":"Benali",      "gender":"male",   "age":42,
    "country":"France",       "city":"Paris",
    "education":"phd",         "job":"Research Scientist",  "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Algerian-French research scientist in Paris. I combine intellectual curiosity with Islamic values. I enjoy philosophy, cycling, and cooking. Looking for a mature, open-minded partner.",
    "marital":"divorced","children":1,"wants_children":True,  "relocate":True,  "preferred_country":"France",   "min_age":32, "max_age":44 },

  { "first":"Karim",    "last":"Nasser",      "gender":"male",   "age":23,
    "country":"Egypt",        "city":"Mansoura",
    "education":"bachelor's",  "job":"Medical Student",     "financial":"low",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Final-year medical student from Mansoura. Islam is my compass. I volunteer at a free clinic, enjoy reading Seerah, and aspire to be a doctor who serves the underprivileged.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Egypt",    "min_age":20, "max_age":27 },

  { "first":"Nasser",   "last":"Al-Farsi",    "gender":"male",   "age":37,
    "country":"Oman",         "city":"Muscat",
    "education":"master's",   "job":"Government Official", "financial":"high",
    "sect":"Ibadi",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Government official from Muscat dedicated to public service. Family and faith are my pillars. I enjoy sailing, poetry recitation, and camel racing during festivals.",
    "marital":"widowed","children":3,"wants_children":False, "relocate":False, "preferred_country":"Oman",     "min_age":30, "max_age":42 },

  { "first":"Adil",     "last":"Rahman",      "gender":"male",   "age":29,
    "country":"Malaysia",     "city":"Kuala Lumpur",
    "education":"master's",   "job":"Data Scientist",      "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Data scientist passionate about using AI for social good. I balance a modern career with Islamic values, enjoy badminton, and cook really good nasi lemak. Looking for a progressive, faithful partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Malaysia", "min_age":24, "max_age":33 },

  { "first":"Walid",    "last":"Haddad",      "gender":"male",   "age":34,
    "country":"Lebanon",      "city":"Beirut",
    "education":"bachelor's",  "job":"Journalist",          "financial":"middle",
    "sect":"Sunni",  "prayer":"sometimes", "commitment":"moderate",
    "lifestyle":"open",       "cultural":"open",
    "bio":"Journalist covering social and political issues in the Arab world. I value truth, justice, and community. Gradually deepening my religious practice. Seeking a thoughtful, open-minded partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Lebanon",  "min_age":26, "max_age":38 },

  { "first":"Rami",     "last":"Aziz",        "gender":"male",   "age":27,
    "country":"Syria",        "city":"Damascus",
    "education":"bachelor's",  "job":"Engineer",            "financial":"low",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Engineering graduate who rebuilt his life after difficult years. Faith kept me strong. I enjoy cooking Syrian food, reading Quran, and working on my small business.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Any",      "min_age":22, "max_age":30 },

  { "first":"Hani",     "last":"Saleh",       "gender":"male",   "age":40,
    "country":"Egypt",        "city":"Cairo",
    "education":"bachelor's",  "job":"Business Manager",    "financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Business manager in Cairo who has dedicated 15 years to building a successful career. Now ready to invest equally in family life. I enjoy golf, travel, and classical Arabic poetry.",
    "marital":"divorced","children":0,"wants_children":True,  "relocate":False, "preferred_country":"Egypt",    "min_age":28, "max_age":40 },

  { "first":"Tamer",    "last":"Farouk",      "gender":"male",   "age":31,
    "country":"Qatar",        "city":"Doha",
    "education":"master's",   "job":"Project Manager",     "financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Project manager overseeing infrastructure projects. I am organized, goal-oriented, and care deeply about community. Enjoy swimming, chess, and learning new languages.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Qatar",    "min_age":25, "max_age":35 },

  { "first":"Ashraf",   "last":"Moussa",      "gender":"male",   "age":44,
    "country":"Egypt",        "city":"Luxor",
    "education":"high school", "job":"Tour Guide",          "financial":"low",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Humble tour guide sharing the wonders of Pharaonic history with the world. Despite simple means, I am rich in faith and warmth. Seeking a simple, God-fearing partner.",
    "marital":"widowed","children":4,"wants_children":False, "relocate":False, "preferred_country":"Egypt",    "min_age":35, "max_age":50 },

  { "first":"Khaled",   "last":"Al-Badawi",   "gender":"male",   "age":22,
    "country":"Jordan",       "city":"Aqaba",
    "education":"bachelor's",  "job":"Student / Part-time", "financial":"low",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"University student majoring in business administration. I grew up by the Red Sea and love diving and nature. Focused on completing my studies before starting a family.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Any",      "min_age":20, "max_age":26 },

  { "first":"Imad",     "last":"Al-Hasan",    "gender":"male",   "age":39,
    "country":"Bahrain",      "city":"Manama",
    "education":"master's",   "job":"Investment Banker",   "financial":"high",
    "sect":"Shia",   "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Investment banker grounded in Islamic finance principles. Faith is central to my life. I enjoy horse riding, calligraphy, and family reunions. Seeking a pious, cultured partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Bahrain",  "min_age":30, "max_age":42 },

  { "first":"Anas",     "last":"Siddiqui",    "gender":"male",   "age":26,
    "country":"USA",           "city":"Chicago",
    "education":"master's",   "job":"Biomedical Researcher","financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Pakistani-American biomedical researcher striving to cure diseases and serve humanity. Active in the Chicago Muslim community. Love hiking, basketball, and biryani. Looking for an ambitious, faith-driven partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"USA",      "min_age":23, "max_age":30 },

  # ── FEMALES ────────────────────────────────────────────────────────────────
  { "first":"Fatima",   "last":"Al-Zahra",    "gender":"female", "age":26,
    "country":"Egypt",        "city":"Cairo",
    "education":"master's",   "job":"Arabic Teacher",      "financial":"middle",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Arabic language teacher who believes education is the greatest gift. I wear hijab, recite Quran daily, and volunteer at a literacy NGO. Looking for a committed, educated partner who values knowledge.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Egypt",    "min_age":26, "max_age":34 },

  { "first":"Aisha",    "last":"Al-Rashidi",  "gender":"female", "age":24,
    "country":"Saudi Arabia",  "city":"Jeddah",
    "education":"bachelor's",  "job":"Pharmacist",          "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Pharmacist from Jeddah passionate about healthcare and community service. I love reading Islamic literature, baking, and spending time with family. Seeking a well-established, religious partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Saudi Arabia","min_age":26, "max_age":35 },

  { "first":"Maryam",   "last":"Bouazza",     "gender":"female", "age":29,
    "country":"Morocco",      "city":"Rabat",
    "education":"master's",   "job":"Lawyer",              "financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Human rights lawyer fighting for justice. My faith inspires my advocacy. I enjoy horseback riding, French literature, and Moroccan cuisine. Looking for a confident partner who respects my career.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Morocco",  "min_age":28, "max_age":38 },

  { "first":"Zainab",   "last":"Al-Hussaini", "gender":"female", "age":32,
    "country":"Iraq",         "city":"Baghdad",
    "education":"master's",   "job":"Medical Doctor",      "financial":"high",
    "sect":"Shia",   "prayer":"always",    "commitment":"high",
    "lifestyle":"moderate",   "cultural":"traditional",
    "bio":"Pediatrician dedicated to children's health. My Shia faith guides my daily life. I enjoy painting, Arabic calligraphy, and cooking traditional Iraqi dishes. Seeking a faithful, mature partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Iraq",     "min_age":30, "max_age":40 },

  { "first":"Khadija",  "last":"Diallo",      "gender":"female", "age":27,
    "country":"Senegal",      "city":"Dakar",
    "education":"bachelor's",  "job":"Social Worker",       "financial":"low",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Social worker helping displaced families in West Africa. My faith is my strength. I love Sufi poetry, cooking thieboudienne, and community organizing. Looking for a humble, service-oriented partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Any",      "min_age":25, "max_age":35 },

  { "first":"Sara",     "last":"Yilmaz",      "gender":"female", "age":25,
    "country":"Turkey",       "city":"Istanbul",
    "education":"bachelor's",  "job":"Interior Designer",   "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Interior designer who creates beautiful, functional spaces inspired by Islamic aesthetics. I love historical architecture, café conversations, and hiking the Bosphorus. Seeking a kind, ambitious partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Turkey",   "min_age":25, "max_age":33 },

  { "first":"Nour",     "last":"Haddad",      "gender":"female", "age":30,
    "country":"Lebanon",      "city":"Beirut",
    "education":"phd",         "job":"Neuroscience Researcher","financial":"middle",
    "sect":"Sunni",  "prayer":"sometimes", "commitment":"moderate",
    "lifestyle":"open",       "cultural":"open",
    "bio":"Neuroscience PhD researcher navigating faith and science. I pray, fast, and believe deeply in Islamic ethics. Love jazz music, mountain trekking, and debates. Looking for an open-minded, curious partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Any",      "min_age":28, "max_age":38 },

  { "first":"Huda",     "last":"Al-Zahrani",  "gender":"female", "age":34,
    "country":"Saudi Arabia",  "city":"Riyadh",
    "education":"master's",   "job":"University Professor", "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Islamic Studies professor at King Saud University. I have dedicated my life to education and scholarly work. Seeking a knowledgeable, mature partner who values Islamic scholarship.",
    "marital":"divorced","children":1,"wants_children":True,  "relocate":False, "preferred_country":"Saudi Arabia","min_age":32, "max_age":44 },

  { "first":"Layla",    "last":"Khan",        "gender":"female", "age":23,
    "country":"UK",            "city":"Birmingham",
    "education":"bachelor's",  "job":"Nurse",               "financial":"middle",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Pediatric nurse who finds purpose in caring for sick children. British-Bangladeshi, I honor both my heritage and faith. Love cooking fusion food, hiking, and charity work. Seeking a grounded, kind partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"UK",       "min_age":24, "max_age":32 },

  { "first":"Amira",    "last":"Hassan",      "gender":"female", "age":28,
    "country":"Egypt",        "city":"Alexandria",
    "education":"master's",   "job":"Marine Biologist",    "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Marine biologist studying Mediterranean ecosystems. The ocean inspires my wonder at Allah's creation. I love diving, photography, and writing poetry. Seeking a thoughtful, adventurous partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Egypt",    "min_age":27, "max_age":36 },

  { "first":"Rana",     "last":"Al-Saleh",    "gender":"female", "age":31,
    "country":"Kuwait",       "city":"Kuwait City",
    "education":"master's",   "job":"HR Director",         "financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"HR director who champions workplace inclusion and ethical business. Fitness enthusiast and avid reader. Looking for a successful, emotionally intelligent partner who values personal growth.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Kuwait",   "min_age":30, "max_age":40 },

  { "first":"Dina",     "last":"Sharaf",      "gender":"female", "age":22,
    "country":"Egypt",        "city":"Giza",
    "education":"bachelor's",  "job":"Graphic Design Student","financial":"low",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Design student and aspiring artist. I find beauty in Allah's creation and express it through art. I volunteer, love street photography, and am slowly building my freelance career.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Egypt",    "min_age":22, "max_age":30 },

  { "first":"Yasmin",   "last":"Benali",      "gender":"female", "age":35,
    "country":"France",       "city":"Lyon",
    "education":"phd",         "job":"Clinical Psychologist","financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Algerian-French clinical psychologist helping Muslims navigate mental health. My faith and profession are intertwined. I love hiking in the Alps, Arabic poetry, and cooking. Looking for a secure, empathetic partner.",
    "marital":"divorced","children":0,"wants_children":True,  "relocate":False, "preferred_country":"France",   "min_age":32, "max_age":45 },

  { "first":"Rima",     "last":"Al-Ahmad",    "gender":"female", "age":26,
    "country":"UAE",           "city":"Dubai",
    "education":"bachelor's",  "job":"Event Planner",       "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Event planner creating memorable Islamic celebrations. I love the energy of Dubai's international Muslim community. Enjoy yoga, travelling to historic cities, and calligraphy classes.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"UAE",      "min_age":25, "max_age":33 },

  { "first":"Safa",     "last":"Hamdan",      "gender":"female", "age":29,
    "country":"Jordan",       "city":"Amman",
    "education":"bachelor's",  "job":"Dentist",             "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Dentist who sees her work as a form of service. I grow in my deen daily, am close to family, and enjoy knitting, Quran circles, and cooking traditional Jordanian dishes.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Jordan",   "min_age":28, "max_age":36 },

  { "first":"Heba",     "last":"Mansour",     "gender":"female", "age":37,
    "country":"Egypt",        "city":"Cairo",
    "education":"master's",   "job":"NGO Director",        "financial":"middle",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"NGO director working on women empowerment and education in rural Egypt. My deen fuels my activism. I write, speak publicly, and love strong Arabic coffee and long conversations.",
    "marital":"divorced","children":2,"wants_children":False, "relocate":False, "preferred_country":"Egypt",    "min_age":32, "max_age":44 },

  { "first":"Nadia",    "last":"Rahman",      "gender":"female", "age":33,
    "country":"Malaysia",     "city":"Penang",
    "education":"master's",   "job":"Architect",           "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Architect drawing inspiration from Islamic geometric patterns. I pray five times daily, enjoy cycling the penang hills, and make the best nasi kandar. Seeking a thoughtful, stable partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Malaysia", "min_age":30, "max_age":40 },

  { "first":"Salma",    "last":"Idrissi",     "gender":"female", "age":24,
    "country":"Morocco",      "city":"Marrakech",
    "education":"bachelor's",  "job":"Tourism Manager",     "financial":"middle",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Tourism professional sharing Morocco's beauty with the world. I love hiking the Atlas Mountains, cooking traditional Moroccan food, and evening Quranic study circles.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Morocco",  "min_age":23, "max_age":31 },

  { "first":"Rania",    "last":"Al-Farhat",   "gender":"female", "age":38,
    "country":"Qatar",        "city":"Doha",
    "education":"phd",         "job":"Economist",           "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Economist specializing in Islamic finance at a Qatari think tank. I value intellectual depth, family bonds, and spiritual growth. Seeking an accomplished, principled partner ready for commitment.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Qatar",    "min_age":34, "max_age":46 },

  { "first":"Mai",      "last":"Yusuf",       "gender":"female", "age":21,
    "country":"Egypt",        "city":"Mansoura",
    "education":"high school", "job":"Home Business Owner", "financial":"low",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Running a small homemade food business while studying online. I am hardworking, modest, and deeply attached to my family and community. Looking for a serious, Allah-fearing partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Egypt",    "min_age":22, "max_age":30 },

  { "first":"Mona",     "last":"Siddiqui",    "gender":"female", "age":30,
    "country":"USA",           "city":"New York",
    "education":"master's",   "job":"Software Engineer",   "financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"open",
    "bio":"Pakistani-American engineer at a tech startup. I code by day, attend halaqa circles in the evening, and volunteer on weekends. Balancing ambition and faith, looking for a partner who does the same.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"USA",      "min_age":28, "max_age":36 },

  { "first":"Eman",     "last":"Al-Mutairi",  "gender":"female", "age":27,
    "country":"Saudi Arabia",  "city":"Medina",
    "education":"master's",   "job":"Child Psychologist",  "financial":"high",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Child psychologist blessed to work near the Prophet's mosque. My connection to Medina is deeply spiritual. I value quiet evenings, Quran recitation, and deep conversations. Seeking a mature, spiritual partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":False, "preferred_country":"Saudi Arabia","min_age":27, "max_age":38 },

  { "first":"Noha",     "last":"Fahmy",       "gender":"female", "age":41,
    "country":"Egypt",        "city":"Cairo",
    "education":"master's",   "job":"Financial Manager",   "financial":"high",
    "sect":"Sunni",  "prayer":"often",     "commitment":"high",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Senior financial manager who built her career through hard work and faith. I have traveled widely, speak three languages, and am ready to build a mature, loving partnership.",
    "marital":"divorced","children":1,"wants_children":False, "relocate":True,  "preferred_country":"Any",      "min_age":36, "max_age":50 },

  { "first":"Ghada",    "last":"Khalil",      "gender":"female", "age":28,
    "country":"Syria",        "city":"Aleppo",
    "education":"bachelor's",  "job":"Calligraphy Artist",  "financial":"low",
    "sect":"Sunni",  "prayer":"always",    "commitment":"high",
    "lifestyle":"conservative","cultural":"traditional",
    "bio":"Calligraphy artist preserving Syrian Islamic art traditions. My work is my prayer made visible. I dream of opening a cultural center to teach the next generation. Seeking a supportive, grounded partner.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Any",      "min_age":25, "max_age":36 },

  { "first":"Lina",     "last":"Ozdemir",     "gender":"female", "age":22,
    "country":"Turkey",       "city":"Ankara",
    "education":"bachelor's",  "job":"Nutrition Student",   "financial":"low",
    "sect":"Sunni",  "prayer":"often",     "commitment":"moderate",
    "lifestyle":"moderate",   "cultural":"moderate",
    "bio":"Nutrition student passionate about halal healthy living and Islamic wellbeing. I blog about healthy Islamic recipes, love dancing to Turkish folk music, and am very close to my family.",
    "marital":"single", "children":0, "wants_children":True,  "relocate":True,  "preferred_country":"Turkey",   "min_age":22, "max_age":29 },
]

# ── SQL generation ────────────────────────────────────────────────────────────
def q(s):
    """Escape a string for PostgreSQL single-quote literals."""
    return str(s).replace("'", "''")

def make_sql(users):
    user_rows = []
    profile_rows = []

    for i, u in enumerate(users):
        uid = str(uuid.uuid4())
        email = f"{u['first'].lower()}.{u['last'].lower().replace(' ', '').replace('-', '')}@tayyibt.test"
        phone = f"+9900000{i+1:04d}"
        username = f"{u['first'].lower()}{u['last'].lower().replace(' ', '').replace('-', '')}{i+1}"
        dob_year = 2024 - u["age"]

        user_rows.append(
            f"('{uid}','{email}','{phone}','{PASS_HASH}',"
            f"'{u['first']}','{u['last']}'.replace(\"'\",\"''\"),"  # escape apostrophes
            f"'{username}','{u['first']} {u['last']}',"
            f"'{dob_year}-06-01','{u['gender']}',true,false,"
            f"'{'active'}','user',"
            f"'tok{uid[:8]}',NOW() + INTERVAL '365 days',"
            f"NOW())"
        )

        bio_escaped = u["bio"].replace("'", "''")
        profile_rows.append(
            f"(gen_random_uuid(),'{uid}',"
            f"'{u['first']} {u['last']}',"
            f"{u['age']},'{u['gender']}','{u['country']}','{u['city']}',"
            f"'{u['marital']}',{u['children']},"
            f"'{bio_escaped}',"
            f"'{u['education']}','{u['job']}','{u['financial']}',"
            f"'{u['cultural']}','{u['lifestyle']}',"
            f"'{u['sect']}','{u['prayer']}','{u['commitment']}',"
            f"{u['min_age']},{u['max_age']},"
            f"'{u['preferred_country']}',"
            f"{str(u['relocate']).lower()},{str(u['wants_children']).lower()},"
            f"'public',NOW())"
        )

    # Build proper INSERT statements
    user_inserts = []
    profile_inserts = []

    for i, u in enumerate(users):
        uid = str(uuid.uuid4())
        last_clean = u['last'].lower().replace(' ','').replace('-','').replace("'","").replace(',','')
        email = f"{u['first'].lower()}.{last_clean}@tayyibt.test"
        phone = f"+9900000{i+1:04d}"
        username = f"{u['first'].lower()}{last_clean}{i+1}"
        dob_year = 2024 - u["age"]

        user_inserts.append(
            f"INSERT INTO users (id,email,phone,password_hash,first_name,last_name,username,full_name,"
            f"date_of_birth,gender,is_verified,is_deactivated,status,account_type,"
            f"verification_token,verification_expires,created_at) VALUES "
            f"('{uid}','{email}','{phone}','{PASS_HASH}',"
            f"'{q(u['first'])}','{q(u['last'])}','{username}','{q(u['first'])} {q(u['last'])}',"
            f"'{dob_year}-06-01','{u['gender']}',true,false,"
            f"'active','user',"
            f"'tok{uid[:8]}',NOW() + INTERVAL '365 days',NOW());"
        )
        profile_inserts.append(
            f"INSERT INTO profiles (id,user_id,full_name,age,gender,country,city,"
            f"social_status,children_count,bio,education,job_title,financial_level,"
            f"cultural_level,lifestyle,sect,prayer_level,religious_commitment,"
            f"min_age,max_age,preferred_country,relocate_willing,wants_children,"
            f"intro_visibility,created_at) VALUES "
            f"(gen_random_uuid(),'{uid}',"
            f"'{q(u['first'])} {q(u['last'])}',{u['age']},'{u['gender']}','{q(u['country'])}','{q(u['city'])}',"
            f"'{q(u['marital'])}',{u['children']},'{q(u['bio'])}',"
            f"'{q(u['education'])}','{q(u['job'])}','{q(u['financial'])}',"
            f"'{q(u['cultural'])}','{q(u['lifestyle'])}',"
            f"'{q(u['sect'])}','{q(u['prayer'])}','{q(u['commitment'])}',"
            f"{u['min_age']},{u['max_age']},"
            f"'{q(u['preferred_country'])}',"
            f"{str(u['relocate']).lower()},{str(u['wants_children']).lower()},"
            f"'public',NOW());"
        )

    return "\n".join(user_inserts), "\n".join(profile_inserts)


# ── Run on VPS ────────────────────────────────────────────────────────────────
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting to VPS...")
c.connect('145.14.158.100', username='root', password=os.environ.get('VPS_PASSWORD',''),
          timeout=60, banner_timeout=60, auth_timeout=60)
print("Connected.\n")

DB_USER = "tayyibt_user"
DB_NAME = "tayyibt_prod"

def psql(sql, label=""):
    if label: print(f"  [{label}]")
    # Write SQL to a temp file then execute
    _, o, e = c.exec_command(
        f"docker exec -i tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} -c \"{sql.replace(chr(34), chr(39))}\" 2>&1"
    )
    return (o.read() + e.read()).decode().strip()

def psql_file(sql_content, label=""):
    """Write SQL to temp file on VPS then execute via psql."""
    if label: print(f"  [{label}]")
    # Write to temp file
    _, _, _ = c.exec_command(f"cat > /tmp/seed.sql << 'ENDSQL'\n{sql_content}\nENDSQL")
    import time; time.sleep(1)
    _, o, e = c.exec_command(
        f"docker exec -i tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} -f /dev/stdin < /tmp/seed.sql 2>&1"
    )
    out = (o.read() + e.read()).decode().strip()
    return out

# Use SFTP to upload SQL file cleanly
sftp = c.open_sftp()

print("Step 1: Reset existing data (keep schema)")
reset_sql = """
DELETE FROM conversation_participants;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM friendships;
DELETE FROM matches;
DELETE FROM posts;
DELETE FROM profiles;
DELETE FROM sessions;
DELETE FROM users WHERE email NOT LIKE '%@tayyibt.com';
"""
with sftp.open("/tmp/reset.sql", "w") as f:
    f.write(reset_sql)
_, o, e = c.exec_command(
    f"docker exec -i tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} < /tmp/reset.sql 2>&1"
)
print((o.read() + e.read()).decode().strip())

print("\nStep 2: Generate SQL for 50 users...")
user_sql, profile_sql = make_sql(USERS)

print("Step 3: Insert users...")
with sftp.open("/tmp/users.sql", "w") as f:
    f.write(user_sql)
_, o, e = c.exec_command(
    f"docker exec -i tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} < /tmp/users.sql 2>&1"
)
out = (o.read() + e.read()).decode()
errors = [l for l in out.splitlines() if "ERROR" in l]
if errors:
    print(f"  Errors: {errors[:3]}")
else:
    print("  Users inserted OK")

print("\nStep 4: Insert profiles...")
with sftp.open("/tmp/profiles.sql", "w") as f:
    f.write(profile_sql)
_, o, e = c.exec_command(
    f"docker exec -i tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} < /tmp/profiles.sql 2>&1"
)
out = (o.read() + e.read()).decode()
errors = [l for l in out.splitlines() if "ERROR" in l]
if errors:
    print(f"  Errors: {errors[:3]}")
else:
    print("  Profiles inserted OK")

print("\nStep 5: Verify")
_, o, e = c.exec_command(
    f"docker exec tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} "
    f"-c \"SELECT COUNT(*) AS users FROM users WHERE email LIKE '%tayyibt.test';\" 2>&1"
)
print((o.read() + e.read()).decode().strip())

_, o, e = c.exec_command(
    f"docker exec tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} "
    f"-c \"SELECT gender, COUNT(*) FROM profiles GROUP BY gender ORDER BY gender;\" 2>&1"
)
print((o.read() + e.read()).decode().strip())

_, o, e = c.exec_command(
    f"docker exec tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} "
    f"-c \"SELECT country, COUNT(*) FROM profiles GROUP BY country ORDER BY COUNT(*) DESC;\" 2>&1"
)
print((o.read() + e.read()).decode().strip())

_, o, e = c.exec_command(
    f"docker exec tayyibt-postgres-1 psql -U {DB_USER} -d {DB_NAME} "
    f"-c \"SELECT sect, prayer_level, COUNT(*) FROM profiles GROUP BY sect, prayer_level ORDER BY sect, prayer_level;\" 2>&1"
)
print((o.read() + e.read()).decode().strip())

sftp.close()
c.close()
print("\nDone! 50 users seeded.")
print("Login: email = first.last@tayyibt.test | password = Test1234")