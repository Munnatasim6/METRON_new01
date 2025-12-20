
import sqlite3
import os

# ডাইনামিক ভাবে ফাইলের পাথ বের করা
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "bot_data.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # সেটিংস টেবিল তৈরি করা (যদি না থাকে)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    # ডিফল্ট স্ট্র্যাটেজি সেট করা (যদি না থাকে)
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('strategy', 'conservative')")
    conn.commit()
    conn.close()

def get_strategy():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key='strategy'")
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else "conservative"

def set_strategy(new_strategy):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE settings SET value = ? WHERE key='strategy'", (new_strategy,))
    conn.commit()
    conn.close()
