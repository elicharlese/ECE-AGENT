# Authentication System for AGENT
import hashlib
import secrets
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

class AuthenticationManager:
    def __init__(self, config_path: str = "config/auth_config.json"):
        self.config_path = config_path
        self.sessions = {}
        self.users = {}
        self.load_config()
        self.setup_default_admin()
    
    def load_config(self):
        """Load authentication configuration"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    self.users = config.get('users', {})
                    self.session_timeout = config.get('session_timeout', 3600)  # 1 hour
            else:
                self.session_timeout = 3600
                self.save_config()
        except Exception as e:
            print(f"Error loading auth config: {e}")
            self.users = {}
            self.session_timeout = 3600
    
    def save_config(self):
        """Save authentication configuration"""
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            config = {
                'users': self.users,
                'session_timeout': self.session_timeout,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"Error saving auth config: {e}")
    
    def setup_default_admin(self):
        """Setup default admin user"""
        admin_username = "admin"
        admin_password = "CyberAgent2025!"
        
        if admin_username not in self.users:
            password_hash = self.hash_password(admin_password)
            self.users[admin_username] = {
                'password_hash': password_hash,
                'role': 'admin',
                'created_at': datetime.now().isoformat(),
                'last_login': None,
                'permissions': [
                    'admin_panel',
                    'model_training',
                    'user_management',
                    'system_config',
                    'security_tools',
                    'container_management'
                ]
            }
            self.save_config()
            print(f"Default admin user created: {admin_username}")
    
    def hash_password(self, password: str) -> str:
        """Hash password with salt"""
        salt = secrets.token_hex(32)
        password_hash = hashlib.pbkdf2_hmac('sha256', 
                                          password.encode('utf-8'), 
                                          salt.encode('utf-8'), 
                                          100000)
        return f"{salt}:{password_hash.hex()}"
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            salt, hash_hex = password_hash.split(':')
            password_check = hashlib.pbkdf2_hmac('sha256',
                                               password.encode('utf-8'),
                                               salt.encode('utf-8'),
                                               100000)
            return password_check.hex() == hash_hex
        except Exception:
            return False
    
    def authenticate(self, username: str, password: str) -> Optional[str]:
        """Authenticate user and return session token"""
        if username not in self.users:
            return None
        
        user = self.users[username]
        if not self.verify_password(password, user['password_hash']):
            return None
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        self.sessions[session_token] = {
            'username': username,
            'role': user['role'],
            'permissions': user['permissions'],
            'created_at': datetime.now(),
            'last_activity': datetime.now()
        }
        
        # Update last login
        self.users[username]['last_login'] = datetime.now().isoformat()
        self.save_config()
        
        return session_token
    
    def validate_session(self, session_token: str) -> Optional[Dict[str, Any]]:
        """Validate session token"""
        if session_token not in self.sessions:
            return None
        
        session = self.sessions[session_token]
        now = datetime.now()
        
        # Check if session expired
        if (now - session['last_activity']).seconds > self.session_timeout:
            del self.sessions[session_token]
            return None
        
        # Update last activity
        session['last_activity'] = now
        return session
    
    def logout(self, session_token: str) -> bool:
        """Logout user by removing session"""
        if session_token in self.sessions:
            del self.sessions[session_token]
            return True
        return False
    
    def has_permission(self, session_token: str, permission: str) -> bool:
        """Check if user has specific permission"""
        session = self.validate_session(session_token)
        if not session:
            return False
        return permission in session.get('permissions', [])
    
    def get_user_info(self, session_token: str) -> Optional[Dict[str, Any]]:
        """Get user information from session"""
        session = self.validate_session(session_token)
        if not session:
            return None
        
        username = session['username']
        user = self.users[username]
        
        return {
            'username': username,
            'role': session['role'],
            'permissions': session['permissions'],
            'last_login': user.get('last_login'),
            'session_created': session['created_at'].isoformat()
        }

# Global authentication manager instance
auth_manager = AuthenticationManager()
