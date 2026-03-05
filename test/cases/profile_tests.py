import time
from utils.browser import BrowserUtility, FRONTEND_URL
from selenium.webdriver.common.by import By

def run_profile_tests(browser: BrowserUtility, target_tests: list = None):
    print("\n--- Running Profile Tests ---")
    
    # Check if we should run any profile tests
    run_01 = not target_tests or "TC-PROF-01" in target_tests
    run_03 = not target_tests or "TC-PROF-03" in target_tests

    if run_01 or run_03:
        if not browser.inject_cookies("user1_cookies.json"):
            print("[Error] Failed to inject cookies for profile tests.")
            return

    # TC-PROF-01: Set unique account name
    if run_01:
        print("[Info] Running TC-PROF-01 (Set unique account name)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/edit_profile")
            time.sleep(2)
            
            # Find the username input and type a unique name
            browser.wait_and_type("input[name='username']", "InklyTestUser99", By.CSS_SELECTOR)
            
            # Find and click save changes
            browser.wait_and_click("//button[contains(text(), 'Save changes')]", By.XPATH)
            
            time.sleep(2)
            if "/profile" in browser.driver.current_url and "/edit_profile" not in browser.driver.current_url:
                print("[Pass] TC-PROF-01: Account name updated successfully.")
            else:
                print("[Fail] TC-PROF-01: Failed to redirect to profile page after save.")
        except Exception as e:
            print(f"[Fail] TC-PROF-01 encountered error: {e}")

    # TC-PROF-03: Set profile interests/tags
    if run_03:
        print("[Info] Running TC-PROF-03 (Set profile interests/tags)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/edit_profile")
            time.sleep(2)
            
            # Type a tag
            browser.wait_and_type("input[placeholder*='e.g., Calculus']", "AutomatedTesting", By.CSS_SELECTOR)
            
            # Click add button
            browser.wait_and_click("//button[contains(text(), 'Add')]", By.XPATH)
            
            # Save changes
            browser.wait_and_click("//button[contains(text(), 'Save changes')]", By.XPATH)
            
            time.sleep(2)
            if "/profile" in browser.driver.current_url and "/edit_profile" not in browser.driver.current_url:
                print("[Pass] TC-PROF-03: Profile interests updated successfully.")
            else:
                print("[Fail] TC-PROF-03: Failed to save interests.")
        except Exception as e:
            print(f"[Fail] TC-PROF-03 encountered error: {e}")
