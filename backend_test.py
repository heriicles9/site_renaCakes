import requests
import sys
import json
from datetime import datetime

class CakeShopAPITester:
    def __init__(self, base_url="https://cake-shop-19.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        print("\n=== TESTING ADMIN LOGIN ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"✅ Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_products_endpoints(self):
        """Test all product-related endpoints"""
        print("\n=== TESTING PRODUCTS ENDPOINTS ===")
        
        # Get all products
        success, products = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        if not success or not products:
            print("❌ No products found - cannot continue product tests")
            return False
            
        print(f"✅ Found {len(products)} products")
        
        # Test category filtering
        categories = ["Bolos Redondos", "Bolos Retangulares", "Doces", "Kits"]
        for category in categories:
            success, filtered = self.run_test(
                f"Filter Products by {category}",
                "GET",
                f"products?category={category}",
                200
            )
            if success:
                filtered_count = len([p for p in filtered if p.get('category') == category])
                print(f"   Found {filtered_count} products in {category}")
        
        # Test get single product
        if products:
            product_id = products[0]['id']
            success, product = self.run_test(
                "Get Single Product",
                "GET",
                f"products/{product_id}",
                200
            )
            if success:
                print(f"   Product: {product.get('name', 'Unknown')}")
        
        # Test product not found
        self.run_test(
            "Get Non-existent Product",
            "GET",
            "products/non-existent-id",
            404
        )
        
        return True

    def test_orders_endpoints(self):
        """Test order-related endpoints"""
        print("\n=== TESTING ORDERS ENDPOINTS ===")
        
        # Create a test order
        order_data = {
            "customer_name": "João Silva",
            "customer_phone": "(75) 98177-7873",
            "customer_address": "Rua das Flores, 123, Centro, Feira de Santana",
            "items": [
                {
                    "id": "test-product-1",
                    "name": "Bolo de Chocolate",
                    "price": 45.0,
                    "quantity": 2
                }
            ],
            "subtotal": 90.0,
            "delivery_fee": 5.0,
            "total": 95.0,
            "payment_method": "pix"
        }
        
        success, order = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if not success:
            print("❌ Order creation failed")
            return False
            
        order_id = order.get('id')
        print(f"✅ Order created with ID: {order_id}")
        
        # Get all orders (requires auth)
        if self.token:
            success, orders = self.run_test(
                "Get All Orders",
                "GET",
                "orders",
                200,
                auth_required=True
            )
            if success:
                print(f"✅ Found {len(orders)} orders")
        
        # Update order status (requires auth)
        if self.token and order_id:
            success, result = self.run_test(
                "Update Order Status",
                "PATCH",
                f"orders/{order_id}/status?status=Confirmado",
                200,
                auth_required=True
            )
        
        return True

    def test_settings_endpoint(self):
        """Test settings endpoint"""
        print("\n=== TESTING SETTINGS ENDPOINT ===")
        
        success, settings = self.run_test(
            "Get Settings",
            "GET",
            "settings",
            200
        )
        
        if success:
            print(f"✅ Delivery fee: R$ {settings.get('delivery_fee', 0)}")
            print(f"✅ PIX key: {settings.get('pix_key', 'Not set')}")
        
        return success

    def test_unauthorized_access(self):
        """Test endpoints that require authentication without token"""
        print("\n=== TESTING UNAUTHORIZED ACCESS ===")
        
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        # Test protected endpoints
        self.run_test(
            "Get Orders Without Auth",
            "GET",
            "orders",
            401
        )
        
        self.run_test(
            "Create Product Without Auth",
            "POST",
            "products",
            401,
            data={"name": "Test", "price": 10.0, "category": "Test"}
        )
        
        # Restore token
        self.token = temp_token
        return True

def main():
    print("🍰 Starting Renaildes Cakes API Tests...")
    tester = CakeShopAPITester()
    
    # Test admin login first
    if not tester.test_admin_login():
        print("❌ Admin login failed - stopping tests")
        return 1
    
    # Run all tests
    tester.test_products_endpoints()
    tester.test_orders_endpoints()
    tester.test_settings_endpoint()
    tester.test_unauthorized_access()
    
    # Print final results
    print(f"\n📊 FINAL RESULTS:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed tests:")
        for failure in tester.failed_tests:
            print(f"  - {failure}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())