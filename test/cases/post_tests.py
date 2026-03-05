import time
from utils.browser import BrowserUtility, FRONTEND_URL
from selenium.webdriver.common.by import By

def run_post_tests(browser: BrowserUtility, target_tests: list = None):
    print("\n--- Running Post Tests ---")
    
    run_note = not target_tests or "TC-POST-NOTE" in target_tests
    run_disc = not target_tests or "TC-POST-DISC" in target_tests
    
    if run_note or run_disc:
        if not browser.inject_cookies("user1_cookies.json"):
            print("[Error] Failed to inject cookies for post tests.")
            return

    # Create Note (Post)
    if run_note:
        print("[Info] Running Notes Generation Test...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            
            browser.wait_and_type("input[placeholder='Enter title...']", "Automated Test Note Title", By.CSS_SELECTOR)
            browser.wait_and_type("textarea[placeholder*='Write your notes here']", "This is an automated test note content for verification.", By.CSS_SELECTOR)
            
            browser.wait_and_click("//button[contains(text(), 'Publish Note')]", By.XPATH)
            
            time.sleep(1)
            try:
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "successfully" in alert_text.lower():
                     print("[Pass] Notes Generation Test: Note published successfully.")
                else:
                     print(f"[Fail] Notes Generation Test: Failed. Alert said: {alert_text}")
            except:
                print("[Fail] Notes Generation Test: No alert found after clicking publish.")
        except Exception as e:
            print(f"[Fail] Notes Generation Test encountered error: {e}")

    # Create Discussion
    if run_disc:
        print("[Info] Running Discussion Generation Test...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_discussion")
            time.sleep(2)
            
            browser.wait_and_type("input[placeholder='Enter title...']", "Automated Test Discussion Title", By.CSS_SELECTOR)
            browser.wait_and_type("textarea[placeholder*='Start a conversation']", "What are your thoughts on automated testing? Discuss below.", By.CSS_SELECTOR)
            
            browser.wait_and_click("//button[contains(text(), 'Publish Discussion')]", By.XPATH)
            
            time.sleep(1)
            try:
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "successfully" in alert_text.lower():
                     print("[Pass] Discussion Generation Test: Discussion published successfully.")
                else:
                     print(f"[Fail] Discussion Generation Test: Failed. Alert said: {alert_text}")
            except:
                print("[Fail] Discussion Generation Test: No alert found after clicking publish.")
        except Exception as e:
            print(f"[Fail] Discussion Generation Test encountered error: {e}")
