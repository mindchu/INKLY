from utils.browser import BrowserUtility, FRONTEND_URL
from selenium.webdriver.common.by import By
import time

def run_auth_tests(browser: BrowserUtility, target_tests: list = None):
    print("\n--- Running Auth Tests ---")
    
    # TC-AUTH-03: Successful login (Verification via cookie injection)
    if not target_tests or "TC-AUTH-03" in target_tests:
        if browser.inject_cookies("user1_cookies.json"):
            time.sleep(2)  # Wait for redirect logic
            current_url = browser.driver.current_url
            print(f"[Info] Current URL after injection: {current_url}")
            
            # Check if we are NO LONGER on the signin/login page
            if "/signin" not in current_url and "/login" not in current_url:
                print("[Pass] TC-AUTH-03: Session injected and redirected away from login.")
            else:
                print("[Fail] TC-AUTH-03: Injection failed; still on login page.")
        else:
            print("[Fail] TC-AUTH-03: Cookie injection failed (file error).")

    # TC-AUTH-05: Logout
    if not target_tests or "TC-AUTH-05" in target_tests:
        # browser.wait_and_click("button#logout") # Example logic
        # print("[Pass] TC-AUTH-05: Logout successful.")
        pass
