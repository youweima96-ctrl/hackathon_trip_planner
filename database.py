import sqlite3
import json
import hashlib
from datetime import datetime

DB_NAME = "vibe_navigator_v2.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Users Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Plans Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            mood TEXT,
            start_loc TEXT,
            route_json TEXT,
            summary TEXT,
            post_mood TEXT,
            review_text TEXT,
            rating INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    
    # Try to add columns if they don't exist (Migration)
    try:
        c.execute("ALTER TABLE plans ADD COLUMN post_mood TEXT")
    except: pass
    try:
        c.execute("ALTER TABLE plans ADD COLUMN review_text TEXT")
    except: pass
    try:
        c.execute("ALTER TABLE plans ADD COLUMN rating INTEGER")
    except: pass
    
    # Meetups Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS meetups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER,
            host_id INTEGER,
            host_name TEXT,
            meetup_time TEXT,
            participants TEXT, -- JSON list of usernames
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(plan_id) REFERENCES plans(id),
            FOREIGN KEY(host_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def register_user(username, password):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    hashed_pw = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_pw))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def login_user(username, password):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    hashed_pw = hashlib.sha256(password.encode()).hexdigest()
    
    c.execute("SELECT id, username FROM users WHERE username = ? AND password = ?", (username, hashed_pw))
    user = c.fetchone()
    conn.close()
    return user # (id, username) or None

def save_plan(user_id, username, mood, start_loc, route_data, summary):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    route_json = json.dumps(route_data)
    
    c.execute("INSERT INTO plans (user_id, username, mood, start_loc, route_json, summary) VALUES (?, ?, ?, ?, ?, ?)",
              (user_id, username, mood, start_loc, route_json, summary))
    conn.commit()
    conn.close()

def add_review(plan_id, post_mood, review_text, rating):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("UPDATE plans SET post_mood = ?, review_text = ?, rating = ? WHERE id = ?",
              (post_mood, review_text, rating, plan_id))
    conn.commit()
    conn.close()

def get_all_plans():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, username, mood, start_loc, route_json, summary, created_at, post_mood, review_text, rating FROM plans ORDER BY created_at DESC")
    plans = c.fetchall()
    conn.close()
    
    # Convert back to list of dicts
    results = []
    for p in plans:
        results.append({
            "id": p[0],
            "username": p[1],
            "mood": p[2],
            "start_loc": p[3],
            "route": json.loads(p[4]),
            "summary": p[5],
            "created_at": p[6],
            "post_mood": p[7],
            "review_text": p[8],
            "rating": p[9]
        })
    return results

def create_meetup(plan_id, host_id, host_name, meetup_time):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Initial participants list contains only the host
    participants = json.dumps([host_name])
    
    c.execute("INSERT INTO meetups (plan_id, host_id, host_name, meetup_time, participants) VALUES (?, ?, ?, ?, ?)",
              (plan_id, host_id, host_name, meetup_time, participants))
    conn.commit()
    conn.close()

def join_meetup(meetup_id, username):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Get current participants
    c.execute("SELECT participants FROM meetups WHERE id = ?", (meetup_id,))
    row = c.fetchone()
    
    if row:
        current_list = json.loads(row[0])
        if username not in current_list:
            current_list.append(username)
            new_list_json = json.dumps(current_list)
            c.execute("UPDATE meetups SET participants = ? WHERE id = ?", (new_list_json, meetup_id))
            conn.commit()
            conn.close()
            return True
    
    conn.close()
    return False

def get_all_meetups():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Join with plans to get route info
    query = '''
        SELECT m.id, m.host_name, m.meetup_time, m.participants, m.created_at,
               p.mood, p.start_loc, p.route_json, p.summary
        FROM meetups m
        JOIN plans p ON m.plan_id = p.id
        ORDER BY m.created_at DESC
    '''
    c.execute(query)
    rows = c.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r[0],
            "host_name": r[1],
            "meetup_time": r[2],
            "participants": json.loads(r[3]),
            "created_at": r[4],
            "mood": r[5],
            "start_loc": r[6],
            "route": json.loads(r[7]),
            "summary": r[8]
        })
    return results
