import requests
import sys
import json
from datetime import datetime

class TailzyaiAPITester:
    def __init__(self, base_url="https://pet-memory-vault.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.pet_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    response_data = response.json()
                    details += f", Response: {json.dumps(response_data, indent=2)[:200]}..."
                    self.log_test(name, True, details)
                    return True, response_data
                except:
                    self.log_test(name, True, details)
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Error: {response.text[:200]}"
                self.log_test(name, False, details)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_signup(self):
        """Test user signup"""
        test_user_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@tailzyai.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        login_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@tailzyai.com",
            "password": "TestPass123!"
        }
        
        # First create a user
        signup_success, signup_response = self.run_test(
            "User Signup for Login Test",
            "POST",
            "auth/signup",
            200,
            data={**login_data, "name": "Login Test User"}
        )
        
        if not signup_success:
            return False
            
        # Now test login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_create_pet(self):
        """Test creating a pet"""
        pet_data = {
            "name": "Buddy",
            "species": "dog",
            "breed": "Golden Retriever",
            "dob": "2020-01-15",
            "photo_url": "https://example.com/buddy.jpg"
        }
        
        success, response = self.run_test(
            "Create Pet",
            "POST",
            "pets",
            200,
            data=pet_data
        )
        
        if success and 'id' in response:
            self.pet_id = response['id']
            return True
        return False

    def test_get_pets(self):
        """Test getting user's pets"""
        success, response = self.run_test(
            "Get Pets",
            "GET",
            "pets",
            200
        )
        return success

    def test_create_activity(self):
        """Test creating an activity"""
        if not self.pet_id:
            self.log_test("Create Activity", False, "No pet_id available")
            return False
            
        activity_data = {
            "pet_id": self.pet_id,
            "type": "Walk",
            "description": "Morning walk in the park",
            "date": "2025-01-15",
            "notes": "Buddy was very energetic today"
        }
        
        success, response = self.run_test(
            "Create Activity",
            "POST",
            "activities",
            200,
            data=activity_data
        )
        return success

    def test_get_activities(self):
        """Test getting activities"""
        success, response = self.run_test(
            "Get Activities",
            "GET",
            "activities",
            200
        )
        return success

    def test_create_health_record(self):
        """Test creating a health record"""
        if not self.pet_id:
            self.log_test("Create Health Record", False, "No pet_id available")
            return False
            
        health_data = {
            "pet_id": self.pet_id,
            "type": "Vaccination",
            "description": "Annual rabies vaccination",
            "date": "2025-01-15",
            "notes": "No adverse reactions"
        }
        
        success, response = self.run_test(
            "Create Health Record",
            "POST",
            "health-records",
            200,
            data=health_data
        )
        return success

    def test_get_health_records(self):
        """Test getting health records"""
        success, response = self.run_test(
            "Get Health Records",
            "GET",
            "health-records",
            200
        )
        return success

    def test_create_journal_entry(self):
        """Test creating a journal entry"""
        if not self.pet_id:
            self.log_test("Create Journal Entry", False, "No pet_id available")
            return False
            
        journal_data = {
            "pet_id": self.pet_id,
            "content": "Buddy had a great day today. He played fetch for hours and seemed very happy.",
            "mood": "Happy",
            "date": "2025-01-15"
        }
        
        success, response = self.run_test(
            "Create Journal Entry",
            "POST",
            "journal",
            200,
            data=journal_data
        )
        return success

    def test_get_journal_entries(self):
        """Test getting journal entries"""
        success, response = self.run_test(
            "Get Journal Entries",
            "GET",
            "journal",
            200
        )
        return success

    def test_chat_message(self):
        """Test sending a chat message to AI copilot"""
        chat_data = {
            "message": "How is my pet's health based on recent records?"
        }
        
        success, response = self.run_test(
            "Send Chat Message",
            "POST",
            "chat/message",
            200,
            data=chat_data
        )
        
        if success and 'content' in response:
            print(f"    AI Response: {response['content'][:100]}...")
        return success

    def test_get_chat_history(self):
        """Test getting chat history"""
        success, response = self.run_test(
            "Get Chat History",
            "GET",
            "chat/history",
            200
        )
        return success

def main():
    print("🧪 Starting Tailzyai API Tests...")
    print("=" * 50)
    
    tester = TailzyaiAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Signup", tester.test_signup),
        ("User Login", tester.test_login),
        ("Create Pet", tester.test_create_pet),
        ("Get Pets", tester.test_get_pets),
        ("Create Activity", tester.test_create_activity),
        ("Get Activities", tester.test_get_activities),
        ("Create Health Record", tester.test_create_health_record),
        ("Get Health Records", tester.test_get_health_records),
        ("Create Journal Entry", tester.test_create_journal_entry),
        ("Get Journal Entries", tester.test_get_journal_entries),
        ("Send Chat Message", tester.test_chat_message),
        ("Get Chat History", tester.test_get_chat_history),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            tester.log_test(test_name, False, f"Exception: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100
            },
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())