import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import sqlite3
import os

class CyberSecurityKnowledgeBase:
    """Comprehensive cybersecurity and computer science knowledge database"""
    
    def __init__(self, db_path: str = "cybersec_knowledge.db"):
        self.db_path = db_path
        self.logger = logging.getLogger(__name__)
        self.init_database()
        self.populate_knowledge()
    
    def init_database(self):
        """Initialize the knowledge database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS vulnerabilities (
                id INTEGER PRIMARY KEY,
                cve_id TEXT UNIQUE,
                name TEXT,
                description TEXT,
                severity TEXT,
                category TEXT,
                mitigation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attack_techniques (
                id INTEGER PRIMARY KEY,
                technique_id TEXT UNIQUE,
                name TEXT,
                description TEXT,
                category TEXT,
                hat_type TEXT,
                detection_methods TEXT,
                prevention TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tools (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                description TEXT,
                category TEXT,
                usage_type TEXT,
                installation TEXT,
                examples TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS frameworks (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                description TEXT,
                category TEXT,
                phases TEXT,
                applications TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cs_concepts (
                id INTEGER PRIMARY KEY,
                concept TEXT UNIQUE,
                category TEXT,
                description TEXT,
                algorithms TEXT,
                complexity TEXT,
                applications TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def populate_knowledge(self):
        """Populate the database with comprehensive knowledge"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if already populated
        cursor.execute("SELECT COUNT(*) FROM vulnerabilities")
        if cursor.fetchone()[0] > 0:
            conn.close()
            return
        
        # Vulnerabilities
        vulnerabilities = [
            ("CVE-2021-44228", "Log4Shell", "Remote code execution in Apache Log4j", "Critical", "Injection", "Update Log4j, disable JNDI lookups"),
            ("CVE-2020-1472", "Zerologon", "Privilege escalation in Windows Netlogon", "Critical", "Authentication", "Apply Windows security updates"),
            ("CVE-2019-0708", "BlueKeep", "RDP vulnerability allowing RCE", "Critical", "Network", "Disable RDP or apply patches"),
            ("CVE-2017-0144", "EternalBlue", "SMB vulnerability exploited by WannaCry", "Critical", "Network", "Apply MS17-010 patch"),
            ("CVE-2014-0160", "Heartbleed", "OpenSSL memory disclosure vulnerability", "High", "Cryptographic", "Update OpenSSL, revoke certificates")
        ]
        
        for vuln in vulnerabilities:
            cursor.execute('''
                INSERT OR IGNORE INTO vulnerabilities 
                (cve_id, name, description, severity, category, mitigation)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', vuln)
        
        # Attack Techniques
        attack_techniques = [
            ("T1566", "Phishing", "Sending malicious emails to gain access", "Initial Access", "black", "Email filtering, user training", "Security awareness training"),
            ("T1059", "Command Line Interface", "Using command line for execution", "Execution", "grey", "Process monitoring, logging", "Restrict CLI access"),
            ("T1055", "Process Injection", "Injecting code into running processes", "Defense Evasion", "black", "Process monitoring, behavioral analysis", "Application whitelisting"),
            ("T1003", "Credential Dumping", "Extracting credentials from memory", "Credential Access", "black", "Memory protection, monitoring", "Credential Guard, LSASS protection"),
            ("T1046", "Network Service Scanning", "Scanning for network services", "Discovery", "white", "Network monitoring, IDS", "Network segmentation"),
            ("T1190", "Exploit Public-Facing Application", "Exploiting internet-facing apps", "Initial Access", "black", "Patch management, WAF", "Regular security assessments"),
            ("T1068", "Exploitation for Privilege Escalation", "Exploiting vulnerabilities for higher privileges", "Privilege Escalation", "black", "Patch management, least privilege", "Regular vulnerability scanning")
        ]
        
        for technique in attack_techniques:
            cursor.execute('''
                INSERT OR IGNORE INTO attack_techniques 
                (technique_id, name, description, category, hat_type, detection_methods, prevention)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', technique)
        
        # Tools
        tools = [
            ("Nmap", "Network discovery and security auditing", "Network Scanner", "white", "sudo apt install nmap", "nmap -sS -O target_ip"),
            ("Metasploit", "Penetration testing framework", "Exploitation", "white/black", "curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb | sudo bash", "msfconsole"),
            ("Burp Suite", "Web application security testing", "Web Security", "white", "Download from PortSwigger", "Proxy web traffic through Burp"),
            ("Wireshark", "Network protocol analyzer", "Network Analysis", "white", "sudo apt install wireshark", "wireshark -i eth0"),
            ("John the Ripper", "Password cracking tool", "Password Security", "white/black", "sudo apt install john", "john --wordlist=rockyou.txt hashes.txt"),
            ("Hashcat", "Advanced password recovery", "Password Security", "white/black", "sudo apt install hashcat", "hashcat -m 0 -a 0 hashes.txt wordlist.txt"),
            ("Aircrack-ng", "WiFi security auditing", "Wireless Security", "white", "sudo apt install aircrack-ng", "aircrack-ng -w wordlist.txt capture.cap"),
            ("SQLmap", "SQL injection testing tool", "Web Security", "white", "pip install sqlmap", "sqlmap -u 'http://target.com/page?id=1' --dbs"),
            ("Nikto", "Web server scanner", "Web Security", "white", "sudo apt install nikto", "nikto -h http://target.com"),
            ("Hydra", "Network logon cracker", "Brute Force", "white/black", "sudo apt install hydra", "hydra -l admin -P passwords.txt ssh://target.com")
        ]
        
        for tool in tools:
            cursor.execute('''
                INSERT OR IGNORE INTO tools 
                (name, description, category, usage_type, installation, examples)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', tool)
        
        # Security Frameworks
        frameworks = [
            ("NIST Cybersecurity Framework", "Comprehensive cybersecurity framework", "Risk Management", "Identify,Protect,Detect,Respond,Recover", "Enterprise security programs"),
            ("OWASP Top 10", "Top 10 web application security risks", "Web Security", "Risk identification and mitigation", "Web application security"),
            ("MITRE ATT&CK", "Adversarial tactics and techniques", "Threat Intelligence", "Tactics,Techniques,Procedures", "Threat hunting and detection"),
            ("ISO 27001", "Information security management", "Compliance", "Plan,Do,Check,Act", "Information security management systems"),
            ("SANS Top 25", "Most dangerous software errors", "Secure Development", "Error categorization and prevention", "Secure coding practices"),
            ("PTES", "Penetration Testing Execution Standard", "Penetration Testing", "Pre-engagement,Intelligence,Threat Modeling,Vulnerability Analysis,Exploitation,Post Exploitation,Reporting", "Structured penetration testing")
        ]
        
        for framework in frameworks:
            cursor.execute('''
                INSERT OR IGNORE INTO frameworks 
                (name, description, category, phases, applications)
                VALUES (?, ?, ?, ?, ?)
            ''', framework)
        
        # Computer Science Concepts
        cs_concepts = [
            ("Binary Search", "Algorithms", "Efficient searching in sorted arrays", "O(log n)", "O(log n)", "Database indexing, game AI"),
            ("Hash Tables", "Data Structures", "Key-value data structure with O(1) average access", "Hash function dependent", "O(1) average", "Caching, database indexing"),
            ("RSA Encryption", "Cryptography", "Public-key cryptosystem based on prime factorization", "Key generation, encryption, decryption", "O(k³) for k-bit keys", "Secure communications, digital signatures"),
            ("TCP/IP Stack", "Networking", "Layered network protocol suite", "Physical, Data Link, Network, Transport, Application", "Variable", "Internet communications"),
            ("SQL Injection", "Security", "Code injection technique targeting SQL databases", "Input validation, parameterized queries", "N/A", "Web application security testing"),
            ("Machine Learning", "AI", "Algorithms that improve through experience", "Supervised, unsupervised, reinforcement learning", "Varies by algorithm", "Pattern recognition, prediction"),
            ("Blockchain", "Distributed Systems", "Decentralized ledger technology", "Hashing, consensus, merkle trees", "O(n) for verification", "Cryptocurrencies, smart contracts"),
            ("Buffer Overflow", "Security", "Memory corruption vulnerability", "Stack/heap overflow detection", "N/A", "Exploit development, security research")
        ]
        
        for concept in cs_concepts:
            cursor.execute('''
                INSERT OR IGNORE INTO cs_concepts 
                (concept, category, description, algorithms, complexity, applications)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', concept)
        
        conn.commit()
        conn.close()
        self.logger.info("Knowledge base populated successfully")
    
    async def search_vulnerabilities(self, query: str, category: str = None) -> List[Dict[str, Any]]:
        """Search for vulnerabilities"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        sql = "SELECT * FROM vulnerabilities WHERE description LIKE ? OR name LIKE ?"
        params = [f"%{query}%", f"%{query}%"]
        
        if category:
            sql += " AND category = ?"
            params.append(category)
        
        cursor.execute(sql, params)
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                "cve_id": row[1],
                "name": row[2],
                "description": row[3],
                "severity": row[4],
                "category": row[5],
                "mitigation": row[6]
            }
            for row in results
        ]
    
    async def search_attack_techniques(self, query: str, hat_type: str = None) -> List[Dict[str, Any]]:
        """Search for attack techniques"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        sql = "SELECT * FROM attack_techniques WHERE description LIKE ? OR name LIKE ?"
        params = [f"%{query}%", f"%{query}%"]
        
        if hat_type:
            sql += " AND hat_type LIKE ?"
            params.append(f"%{hat_type}%")
        
        cursor.execute(sql, params)
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                "technique_id": row[1],
                "name": row[2],
                "description": row[3],
                "category": row[4],
                "hat_type": row[5],
                "detection_methods": row[6],
                "prevention": row[7]
            }
            for row in results
        ]
    
    async def search_tools(self, query: str, category: str = None) -> List[Dict[str, Any]]:
        """Search for security tools"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        sql = "SELECT * FROM tools WHERE description LIKE ? OR name LIKE ?"
        params = [f"%{query}%", f"%{query}%"]
        
        if category:
            sql += " AND category = ?"
            params.append(category)
        
        cursor.execute(sql, params)
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                "name": row[1],
                "description": row[2],
                "category": row[3],
                "usage_type": row[4],
                "installation": row[5],
                "examples": row[6]
            }
            for row in results
        ]
    
    async def get_cs_concepts(self, category: str = None) -> List[Dict[str, Any]]:
        """Get computer science concepts"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if category:
            cursor.execute("SELECT * FROM cs_concepts WHERE category = ?", (category,))
        else:
            cursor.execute("SELECT * FROM cs_concepts")
        
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                "concept": row[1],
                "category": row[2],
                "description": row[3],
                "algorithms": row[4],
                "complexity": row[5],
                "applications": row[6]
            }
            for row in results
        ]
