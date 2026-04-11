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

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

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

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )
        return success

    def test_chat_endpoint(self):
        """Test the chat endpoint with a sample message"""
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

    def test_translate_endpoint(self):
        """Test the translate endpoint"""
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

    def test_auth_endpoints(self):
        """Test auth endpoints"""
        # Test auth/me endpoint (should return 401 without auth)
        success, response = self.run_test(
            "Auth Me Endpoint (Unauthenticated)",
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
    print("🚀 Starting Sarvbhasa API Tests...")
    tester = SarvbhasaAPITester()

    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_translate_endpoint,
        tester.test_chat_endpoint,
        tester.test_auth_endpoints
    ]

    all_passed = True
    for test in tests:
        try:
            result = test()
            if not result:
                all_passed = False
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            all_passed = False

    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())