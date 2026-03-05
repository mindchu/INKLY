import time
from utils.browser import BrowserUtility, FRONTEND_URL
from selenium.webdriver.common.by import By

def run_interaction_tests(browser: BrowserUtility, target_tests: list = None):
    print("\n--- Running Interaction Tests ---")
    
    run_05 = not target_tests or "TC-INT-05" in target_tests
    
    if run_05:
        if not browser.inject_cookies("user1_cookies.json"):
            print("[Error] Failed to inject cookies for interaction tests.")
            return

        print("[Info] Opening home page to find a post to interact with...")
        browser.driver.get(f"{FRONTEND_URL}/home")
        time.sleep(3)
        
        post_link = None
        try:
            elements = browser.driver.find_elements(By.XPATH, "//a[contains(@href, '/content/')]")
            if elements:
                post_link = elements[0].get_attribute("href")
            
            if not post_link:
                 browser.driver.get(f"{FRONTEND_URL}/note_forum")
                 time.sleep(3)
                 elements = browser.driver.find_elements(By.XPATH, "//a[contains(@href, '/content/')]")
                 if elements:
                      post_link = elements[0].get_attribute("href")
        except Exception as e:
            print(f"[Warning] Could not find a post automatically: {e}")

        if not post_link:
            print("[Fail] Interaction Tests: Could not find any existing post to interact with on the feed.")
            return
            
        print(f"[Info] Found post link: {post_link}")

        # TC-INT-05: Comment under a post
        if run_05:
            print("[Info] Running TC-INT-05 (Comment under a post)...")
            try:
                browser.driver.get(post_link)
                time.sleep(3)
                
                browser.wait_and_type("input[placeholder='Add a comment...']", "This is an automated test comment.", By.CSS_SELECTOR)
                browser.wait_and_click("//button[contains(text(), 'Post')]", By.XPATH)
                
                time.sleep(3)
                # Verify comment appears
                page_text = browser.driver.find_element(By.TAG_NAME, "body").text
                if "This is an automated test comment." in page_text:
                    print("[Pass] TC-INT-05: Comment posted successfully.")
                else:
                    print("[Fail] TC-INT-05: Comment not found on page after posting.")
            except Exception as e:
                print(f"[Fail] TC-INT-05 encountered error: {e}")
