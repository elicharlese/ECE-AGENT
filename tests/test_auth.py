import pytest
import os
import tempfile
import shutil
from datetime import datetime, timedelta
from agent.auth import AuthenticationManager


class TestAuthenticationManager:
    """Test suite for the AuthenticationManager class"""
    
    def setup_method(self):
        """Set up test environment"""
        # Create a temporary directory for test config
        self.test_dir = tempfile.mkdtemp()
        self.config_path = os.path.join(self.test_dir, 'auth_config.json')
        self.auth_manager = AuthenticationManager(self.config_path)
    
    def teardown_method(self):
        """Clean up test environment"""
        # Remove temporary directory
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_init_creates_config_file(self):
        """Test that AuthenticationManager creates config file on init"""
        assert os.path.exists(self.config_path)
        
    def test_setup_default_admin(self):
        """Test that default admin user is created"""
        assert 'admin' in self.auth_manager.users
        admin_user = self.auth_manager.users['admin']
        assert admin_user['role'] == 'admin'
        assert 'admin_panel' in admin_user['permissions']
        
    def test_hash_password_creates_valid_hash(self):
        """Test that password hashing works correctly"""
        password = "test_password"
        hashed = self.auth_manager.hash_password(password)
        
        # Check that hash contains salt and hash parts
        assert ':' in hashed
        salt, hash_part = hashed.split(':')
        assert len(salt) > 0
        assert len(hash_part) > 0
        
    def test_verify_password_with_correct_password(self):
        """Test that password verification works with correct password"""
        password = "test_password"
        hashed = self.auth_manager.hash_password(password)
        assert self.auth_manager.verify_password(password, hashed) is True
        
    def test_verify_password_with_incorrect_password(self):
        """Test that password verification fails with incorrect password"""
        password = "test_password"
        wrong_password = "wrong_password"
        hashed = self.auth_manager.hash_password(password)
        assert self.auth_manager.verify_password(wrong_password, hashed) is False
        
    def test_authenticate_valid_user(self):
        """Test that authentication works for valid user"""
        # Create a test user
        username = "testuser"
        password = "testpass123"
        hashed_password = self.auth_manager.hash_password(password)
        
        self.auth_manager.users[username] = {
            'password_hash': hashed_password,
            'role': 'user',
            'created_at': datetime.now().isoformat(),
            'last_login': None,
            'permissions': ['basic_access']
        }
        
        # Authenticate user
        session_token = self.auth_manager.authenticate(username, password)
        assert session_token is not None
        assert isinstance(session_token, str)
        assert len(session_token) > 0
        
    def test_authenticate_invalid_user(self):
        """Test that authentication fails for invalid user"""
        session_token = self.auth_manager.authenticate("nonexistent", "password")
        assert session_token is None
        
    def test_authenticate_invalid_password(self):
        """Test that authentication fails with invalid password"""
        username = "testuser"
        password = "testpass123"
        wrong_password = "wrongpass"
        hashed_password = self.auth_manager.hash_password(password)
        
        self.auth_manager.users[username] = {
            'password_hash': hashed_password,
            'role': 'user',
            'created_at': datetime.now().isoformat(),
            'last_login': None,
            'permissions': ['basic_access']
        }
        
        session_token = self.auth_manager.authenticate(username, wrong_password)
        assert session_token is None
        
    def test_validate_session_valid_session(self):
        """Test that session validation works for valid session"""
        # Create a test session
        session_token = "test_session_token"
        username = "testuser"
        
        self.auth_manager.sessions[session_token] = {
            'username': username,
            'role': 'user',
            'permissions': ['basic_access'],
            'created_at': datetime.now(),
            'last_activity': datetime.now()
        }
        
        session_info = self.auth_manager.validate_session(session_token)
        assert session_info is not None
        assert session_info['username'] == username
        
    def test_validate_session_invalid_session(self):
        """Test that session validation fails for invalid session"""
        session_info = self.auth_manager.validate_session("nonexistent_session")
        assert session_info is None
        
    def test_validate_session_expired_session(self):
        """Test that session validation fails for expired session"""
        # Create an expired session
        session_token = "expired_session_token"
        username = "testuser"
        
        self.auth_manager.sessions[session_token] = {
            'username': username,
            'role': 'user',
            'permissions': ['basic_access'],
            'created_at': datetime.now() - timedelta(seconds=self.auth_manager.session_timeout + 100),
            'last_activity': datetime.now() - timedelta(seconds=self.auth_manager.session_timeout + 100)
        }
        
        session_info = self.auth_manager.validate_session(session_token)
        assert session_info is None
        # Check that expired session was removed
        assert session_token not in self.auth_manager.sessions
        
    def test_logout_valid_session(self):
        """Test that logout works for valid session"""
        # Create a test session
        session_token = "test_session_token"
        self.auth_manager.sessions[session_token] = {
            'username': "testuser",
            'role': 'user',
            'permissions': ['basic_access'],
            'created_at': datetime.now(),
            'last_activity': datetime.now()
        }
        
        result = self.auth_manager.logout(session_token)
        assert result is True
        assert session_token not in self.auth_manager.sessions
        
    def test_logout_invalid_session(self):
        """Test that logout fails gracefully for invalid session"""
        result = self.auth_manager.logout("nonexistent_session")
        assert result is False
        
    def test_has_permission_valid_session(self):
        """Test that permission checking works for valid session"""
        # Create a test session with permissions
        session_token = "test_session_token"
        self.auth_manager.sessions[session_token] = {
            'username': "testuser",
            'role': 'user',
            'permissions': ['basic_access', 'advanced_feature'],
            'created_at': datetime.now(),
            'last_activity': datetime.now()
        }
        
        assert self.auth_manager.has_permission(session_token, 'basic_access') is True
        assert self.auth_manager.has_permission(session_token, 'advanced_feature') is True
        assert self.auth_manager.has_permission(session_token, 'nonexistent_permission') is False
        
    def test_has_permission_invalid_session(self):
        """Test that permission checking fails for invalid session"""
        assert self.auth_manager.has_permission("nonexistent_session", 'basic_access') is False
        
    def test_get_user_info_valid_session(self):
        """Test that user info retrieval works for valid session"""
        # Create a test user and session
        username = "testuser"
        session_token = "test_session_token"
        
        # Add user
        self.auth_manager.users[username] = {
            'password_hash': "dummy_hash",
            'role': 'user',
            'created_at': datetime.now().isoformat(),
            'last_login': datetime.now().isoformat(),
            'permissions': ['basic_access']
        }
        
        # Add session
        self.auth_manager.sessions[session_token] = {
            'username': username,
            'role': 'user',
            'permissions': ['basic_access'],
            'created_at': datetime.now(),
            'last_activity': datetime.now()
        }
        
        user_info = self.auth_manager.get_user_info(session_token)
        assert user_info is not None
        assert user_info['username'] == username
        assert user_info['role'] == 'user'
        assert 'basic_access' in user_info['permissions']
        
    def test_get_user_info_invalid_session(self):
        """Test that user info retrieval fails for invalid session"""
        user_info = self.auth_manager.get_user_info("nonexistent_session")
        assert user_info is None


if __name__ == "__main__":
    pytest.main([__file__])
