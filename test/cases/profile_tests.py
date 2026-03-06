import os
import time
from utils.browser import BrowserUtility, FRONTEND_URL
from utils.reporter import TestReporter
from selenium.webdriver.common.by import By

def run_profile_tests(browser: BrowserUtility, reporter: TestReporter, target_tests: list = None):
    print("\n--- Running Profile Tests ---")
    
    # Check if we should run any profile tests
    run_01 = not target_tests or "TC-PROF-01" in target_tests
    run_02 = not target_tests or "TC-PROF-02" in target_tests
    run_03 = not target_tests or "TC-PROF-03" in target_tests
    run_04 = not target_tests or "TC-PROF-04" in target_tests

    if run_01 or run_02 or run_03 or run_04:
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
                reporter.add_result("TC-PROF-01", "Set unique account name", "Pass", "Account name updated successfully")
            else:
                reporter.add_result("TC-PROF-01", "Set unique account name", "Fail", "Failed to redirect to profile page")
        except Exception as e:
            reporter.add_result("TC-PROF-01", "Set unique account name", "Fail", f"Error: {str(e)[:50]}")

    # TC-PROF-02: Set duplicate account name
    if run_02:
        print("[Info] Running TC-PROF-02 (Set duplicate account name)...")
        try:
            from selenium.webdriver.common.keys import Keys
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            import platform
            cmd_ctrl = Keys.COMMAND if platform.system() == 'Darwin' else Keys.CONTROL
            
            # Step 1: Claim the name 'admin' using User 2
            print("  -> Pre-arranging: Logging in as User 2 to claim 'admin' name so it exists.")
            if browser.inject_cookies("user2_cookies.json"):
                time.sleep(1)
                browser.driver.get(f"{FRONTEND_URL}/edit_profile")
                time.sleep(2)
                
                username_input = WebDriverWait(browser.driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']")))
                username_input.send_keys(cmd_ctrl + "a")
                username_input.send_keys(Keys.BACKSPACE)
                username_input.send_keys("admin")
                
                browser.wait_and_click("//button[contains(text(), 'Save changes')]", By.XPATH)
                time.sleep(2)
            
            # Step 2: Swap back to User 1 and try claiming it
            print("  -> Testing: Logging back to User 1 and attempting to claim 'admin'.")
            browser.inject_cookies("user1_cookies.json")
            time.sleep(1)
            
            browser.driver.get(f"{FRONTEND_URL}/edit_profile")
            time.sleep(2)
            
            # Attempting to steal the assigned username
            username_input2 = WebDriverWait(browser.driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']")))
            username_input2.send_keys(cmd_ctrl + "a")
            username_input2.send_keys(Keys.BACKSPACE)
            username_input2.send_keys("admin")
            
            browser.wait_and_click("//button[contains(text(), 'Save changes')]", By.XPATH)
            
            try:
                WebDriverWait(browser.driver, 5).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                
                # Check if alert text contains duplicate indication
                if "already exists" in alert_text.lower() or "taken" in alert_text.lower() or "error" in alert_text.lower() or "failed" in alert_text.lower():
                    reporter.add_result("TC-PROF-02", "Set duplicate account name", "Pass", f"Duplicate blocked with alert: {alert_text}")
                else:
                    reporter.add_result("TC-PROF-02", "Set duplicate account name", "Fail", f"Unexpected alert: {alert_text}")
            except:
                reporter.add_result("TC-PROF-02", "Set duplicate account name", "Fail", "No validation alert shown for duplicate name")
        except Exception as e:
            reporter.add_result("TC-PROF-02", "Set duplicate account name", "Fail", f"Error: {str(e)[:50]}")

    # TC-PROF-03: Set profile interests/tags
    if run_03:
        print("[Info] Running TC-PROF-03 (Set profile interests/tags)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/edit_profile")
            time.sleep(2)
            
            # Type a tag
            browser.wait_and_type("input[placeholder*='e.g., Calculus']", "test", By.CSS_SELECTOR)
            
            # Click add button
            browser.wait_and_click("//button[contains(text(), 'Add')]", By.XPATH)
            
            # Save changes
            browser.wait_and_click("//button[contains(text(), 'Save changes')]", By.XPATH)
            
            time.sleep(2)
            if "/profile" in browser.driver.current_url and "/edit_profile" not in browser.driver.current_url:
                reporter.add_result("TC-PROF-03", "Set interest tag", "Pass", "Profile interests updated successfully")
            else:
                reporter.add_result("TC-PROF-03", "Set interest tag", "Fail", "Failed to save interests")
        except Exception as e:
            reporter.add_result("TC-PROF-03", "Set interest tag", "Fail", f"Error: {str(e)[:50]}")

    # TC-PROF-04: Set profile picture
    if run_04:
        print("[Info] Running TC-PROF-04 (Set profile picture)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/edit_profile")
            time.sleep(2)
            
            # Find the file input for avatar
            file_input = browser.driver.find_element(By.CSS_SELECTOR, "input[type='file'][accept='image/*']")
            
            # Get absolute path to dummy image
            dummy_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dummyfile', 'dummy_image.png')
            
            # Send keys to upload
            file_input.send_keys(dummy_image_path)
            time.sleep(2) # Give it time to upload via API
            
            # Click save changes
            browser.wait_and_click("//button[contains(text(), 'Save changes')]", By.XPATH)
            
            time.sleep(2)
            if "/profile" in browser.driver.current_url and "/edit_profile" not in browser.driver.current_url:
                reporter.add_result("TC-PROF-04", "Set profile picture", "Pass", "Profile picture uploaded successfully")
            else:
                reporter.add_result("TC-PROF-04", "Set profile picture", "Fail", "Failed to redirect after picture upload")
        except Exception as e:
            reporter.add_result("TC-PROF-04", "Set profile picture", "Fail", f"Error: {str(e)[:50]}")
