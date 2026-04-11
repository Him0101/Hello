import requests
import sys
import json
from datetime import datetime

class SarvbhasaAPITester:
    def __init__(self, base_url="https://india-ai-platform-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.session = requests.Session()  # For cookie persistence

    def run_test(self, name, method, endpoint, expected_status, data=None, use_session=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            client = self.session if use_session else requests
            
            if method == 'GET':
                response = client.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = client.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                    print(f"Response: {json.dumps(result['response_data'], indent=2)}")
                except:
                    result["response_data"] = response.text
                    print(f"Response: {response.text}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result["error"] = response.json()
                except:
                    result["error"] = response.text
                print(f"Error response: {result['error']}")

            self.test_results.append(result)
            return success, result["response_data"] if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/",
            200
        )
        return success

    def test_register_new_user(self):
        """Test user registration"""
        test_data = {
            "name": "TestUser",
            "email": "test123@test.com",
            "password": "Test@123456"
        }
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=test_data,
            use_session=True
        )
        
        if success:
            # Verify response structure
            if "user_id" in response and "email" in response and "name" in response:
                print(f"✅ Registration response structure is correct")
                return True
            else:
                print(f"❌ Registration response structure is incorrect: {response}")
                return False
        return False

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@sarvbhasa.com",
            "password": "Sarvbhasa@123"
        }
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data=admin_data,
            use_session=True
        )
        
        if success:
            # Verify response structure
            if "user_id" in response and "email" in response and "role" in response:
                print(f"✅ Login response structure is correct")
                print(f"Admin role: {response.get('role')}")
                return True
            else:
                print(f"❌ Login response structure is incorrect: {response}")
                return False
        return False

    def test_auth_me(self):
        """Test auth/me endpoint when authenticated"""
        success, response = self.run_test(
            "Auth Me (Authenticated)",
            "GET",
            "api/auth/me",
            200,
            use_session=True
        )
        
        if success:
            if "user_id" in response and "email" in response:
                print(f"✅ Auth me response structure is correct")
                return True
            else:
                print(f"❌ Auth me response structure is incorrect: {response}")
                return False
        return False

    def test_logout(self):
        """Test logout"""
        success, response = self.run_test(
            "Logout",
            "POST",
            "api/auth/logout",
            200,
            use_session=True
        )
        return success

    def test_translate_endpoint(self):
        """Test the translate endpoint with real Sarvam API"""
        test_data = {
            "text": "Hello",
            "source_language": "en-IN",
            "target_language": "hi-IN"
        }
        success, response = self.run_test(
            "Translate Endpoint",
            "POST",
            "api/translate",
            200,
            data=test_data
        )
        
        if success:
            # Verify response structure
            if "translated_text" in response and "source_language" in response and "target_language" in response:
                print(f"✅ Translate response structure is correct")
                print(f"Translation: '{test_data['text']}' -> '{response['translated_text']}'")
                return True
            else:
                print(f"❌ Translate response structure is incorrect: {response}")
                return False
        return False

    def test_chat_endpoint(self):
        """Test the chat endpoint"""
        test_message = "Hello, how are you?"
        success, response = self.run_test(
            "Chat Endpoint",
            "POST",
            "api/chat",
            200,
            data={
                "message": test_message,
                "language": "en-IN",
                "target_language": "hi-IN"
            }
        )
        
        if success:
            # Verify response structure
            if "content" in response and "id" in response and "role" in response:
                print(f"✅ Chat response structure is correct")
                print(f"Bot response: {response['content']}")
                return True
            else:
                print(f"❌ Chat response structure is incorrect: {response}")
                return False
        return False

    def test_translation_history(self):
        """Test translation history endpoint (requires auth)"""
        # First login as admin
        admin_data = {
            "email": "admin@sarvbhasa.com",
            "password": "Sarvbhasa@123"
        }
        login_success, _ = self.run_test(
            "Login for History Test",
            "POST",
            "api/auth/login",
            200,
            data=admin_data,
            use_session=True
        )
        
        if not login_success:
            print("❌ Failed to login for history test")
            return False
            
        success, response = self.run_test(
            "Translation History",
            "GET",
            "api/translations/history",
            200,
            use_session=True
        )
        
        if success:
            if isinstance(response, list):
                print(f"✅ Translation history response is a list with {len(response)} items")
                return True
            else:
                print(f"❌ Translation history response is not a list: {response}")
                return False
        return False

    def test_chat_history(self):
        """Test chat history endpoint (requires auth)"""
        success, response = self.run_test(
            "Chat History",
            "GET",
            "api/chat/history",
            200,
            use_session=True
        )
        
        if success:
            if isinstance(response, list):
                print(f"✅ Chat history response is a list with {len(response)} items")
                return True
            else:
                print(f"❌ Chat history response is not a list: {response}")
                return False
        return False

    def test_payment_checkout(self):
        """Test payment checkout endpoint (requires auth)"""
        checkout_data = {
            "origin_url": "https://india-ai-platform-2.preview.emergentagent.com"
        }
        success, response = self.run_test(
            "Payment Checkout",
            "POST",
            "api/payments/checkout",
            200,
            data=checkout_data,
            use_session=True
        )
        
        if success:
            if "url" in response and "session_id" in response:
                print(f"✅ Payment checkout response structure is correct")
                print(f"Checkout URL: {response['url']}")
                return True
            else:
                print(f"❌ Payment checkout response structure is incorrect: {response}")
                return False
        return False

    def test_unauthenticated_endpoints(self):
        """Test endpoints that should require authentication"""
        # Clear session cookies
        self.session.cookies.clear()
        
        # Test auth/me endpoint (should return 401 without auth)
        success, response = self.run_test(
            "Auth Me (Unauthenticated)",
            "GET",
            "api/auth/me",
            401
        )
        return success

    def print_summary(self):
        """Print test summary"""
        print(f"\n" + "="*50)
        print(f"📊 TEST SUMMARY")
        print(f"="*50)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed < self.tests_run:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test_name']}: {result['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🚀 Starting Comprehensive Sarvbhasa API Tests...")
    tester = SarvbhasaAPITester()

    # Run all tests in order
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Registration", tester.test_register_new_user),
        ("Admin Login", tester.test_admin_login),
        ("Auth Me (Authenticated)", tester.test_auth_me),
        ("Translate API", tester.test_translate_endpoint),
        ("Chat API", tester.test_chat_endpoint),
        ("Translation History", tester.test_translation_history),
        ("Chat History", tester.test_chat_history),
        ("Payment Checkout", tester.test_payment_checkout),
        ("Logout", tester.test_logout),
        ("Unauthenticated Access", tester.test_unauthenticated_endpoints)
    ]

    all_passed = True
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"🧪 Running: {test_name}")
        print(f"{'='*60}")
        try:
            result = test_func()
            if not result:
                all_passed = False
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {str(e)}")
            all_passed = False

    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())