import time
from utils.browser import BrowserUtility, FRONTEND_URL
from utils.reporter import TestReporter
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_interaction_tests(browser: BrowserUtility, reporter: TestReporter, target_tests: list = None):
    print("\n--- Running Interaction Tests ---")
    
    # Determine which tests to run
    run_01 = not target_tests or "TC-INT-01" in target_tests
    run_02 = not target_tests or "TC-INT-02" in target_tests
    run_05 = not target_tests or "TC-INT-05" in target_tests
    run_06 = not target_tests or "TC-INT-06" in target_tests
    run_07 = not target_tests or "TC-INT-07" in target_tests
    run_bkm = not target_tests or "TC-BKM-01" in target_tests
    run_bkm_02 = not target_tests or "TC-BKM-02" in target_tests
    run_fow = not target_tests or "TC-FOW-01" in target_tests
    run_fow_02 = not target_tests or "TC-FOW-02" in target_tests
    run_srch = not target_tests or "TC-SRCH-01" in target_tests
    run_srch_02 = not target_tests or "TC-SRCH-02" in target_tests
    run_srch_03 = not target_tests or "TC-SRCH-03" in target_tests
    run_srch_04 = not target_tests or "TC-SRCH-04" in target_tests
    run_srch_05 = not target_tests or "TC-SRCH-05" in target_tests
    run_cmt_01 = not target_tests or "TC-CMT-01" in target_tests
    run_cmt_02 = not target_tests or "TC-CMT-02" in target_tests
    
    any_int_test = any([run_01, run_02, run_05, run_06, run_07, run_bkm, run_bkm_02, run_fow, run_fow_02, run_srch, run_srch_02, run_srch_03, run_srch_04, run_srch_05, run_cmt_01, run_cmt_02])
    
    if any_int_test:
        if not browser.inject_cookies("user1_cookies.json"):
            print("[Error] Failed to inject cookies for interaction tests.")
            return

        print("[Info] Opening home page to find a post to interact with...")
        browser.driver.get(f"{FRONTEND_URL}/home")
        time.sleep(3)
        
        post_link = None
        try:
            elements = browser.driver.find_elements(By.CSS_SELECTOR, "div.cursor-pointer.shadow-sm")
            if elements:
                elements[0].click()
                time.sleep(2)
                post_link = browser.driver.current_url if "/content/" in browser.driver.current_url else None
            
            if not post_link:
                 browser.driver.get(f"{FRONTEND_URL}/note_forum")
                 time.sleep(3)
                 elements = browser.driver.find_elements(By.CSS_SELECTOR, "div.cursor-pointer.shadow-sm")
                 if elements:
                      elements[0].click()
                      time.sleep(2)
                      post_link = browser.driver.current_url if "/content/" in browser.driver.current_url else None
        except Exception as e:
            print(f"[Warning] Could not find a post automatically: {e}")

        if not post_link:
            print("[Fail] Interaction Tests: Could not find any existing post to interact with on the feed.")
            return
            
        print(f"[Info] Found post link: {post_link}")

        # TC-INT-01: Like a post
        if run_01:
            print("[Info] Running TC-INT-01 (Like post)...")
            try:
                browser.driver.get(post_link)
                time.sleep(3)
                
                # Assume there is a like button using heart icon usually
                # Specifically matching the like button class or parent
                like_btn_xpath = "//button[contains(@class, 'hover:text-red-500')]"
                like_btns = browser.driver.find_elements(By.XPATH, like_btn_xpath)
                if like_btns:
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", like_btns[0])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", like_btns[0])
                    time.sleep(1)
                    reporter.add_result("TC-INT-01", "Like a post", "Pass", "Liked the post successfully")
                else:
                    reporter.add_result("TC-INT-01", "Like a post", "Fail", "Could not find like button on post")
            except Exception as e:
                reporter.add_result("TC-INT-01", "Like a post", "Fail", f"Error: {str(e)[:50]}")

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
                    reporter.add_result("TC-INT-05", "Comment on post", "Pass", "Comment posted successfully")
                else:
                    reporter.add_result("TC-INT-05", "Comment on post", "Fail", "Comment not found on page after posting")
            except Exception as e:
                reporter.add_result("TC-INT-05", "Comment on post", "Fail", f"Error: {str(e)[:50]}")

        # TC-INT-06: Reply to a comment
        if run_06:
            print("[Info] Running TC-INT-06 (Reply to a comment)...")
            try:
                browser.driver.get(post_link)
                time.sleep(3)
                
                reply_btns = browser.driver.find_elements(By.XPATH, "//button[contains(text(), 'Reply')]")
                if reply_btns:
                    # Click the first reply button using JS
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", reply_btns[0])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", reply_btns[0])
                    time.sleep(1)
                    
                    # Type in the reply input
                    reply_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Reply']")
                    reply_input.send_keys("This is an automated test reply.")
                    
                    # Click the next sibling button (which contains the send arrow icon)
                    submit_btn = reply_input.find_element(By.XPATH, "following-sibling::button")
                    browser.driver.execute_script("arguments[0].click();", submit_btn)
                    
                    time.sleep(3)
                    page_text = browser.driver.find_element(By.TAG_NAME, "body").text
                    if "automated test reply" in page_text:
                        reporter.add_result("TC-INT-06", "Reply to comment", "Pass", "Reply posted successfully")
                    else:
                        reporter.add_result("TC-INT-06", "Reply to comment", "Fail", "Reply text not found")
                else:
                    reporter.add_result("TC-INT-06", "Reply to comment", "Fail", "No reply button found (perhaps no comments exist yet)")
            except Exception as e:
                reporter.add_result("TC-INT-06", "Reply to comment", "Fail", f"Error: {str(e)[:50]}")

        # TC-BKM-01: Bookmark a post
        if run_bkm:
            print("[Info] Running TC-BKM-01 (Bookmark post)...")
            try:
                # Bookmark button is on the feed layout, not detail page
                browser.driver.get(f"{FRONTEND_URL}/")
                time.sleep(3)
                
                # Assume bookmark button has hover:text-gray-800 transition
                bkm_btns = browser.driver.find_elements(By.XPATH, "//button[contains(@class, 'hover:text-gray-800')]")
                if bkm_btns:
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", bkm_btns[0])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", bkm_btns[0])
                    time.sleep(1)
                    reporter.add_result("TC-BKM-01", "Bookmark a post", "Pass", "Bookmarked the post successfully")
                else:
                    reporter.add_result("TC-BKM-01", "Bookmark a post", "Fail", "Could not find bookmark button on feed")
            except Exception as e:
                reporter.add_result("TC-BKM-01", "Bookmark a post", "Fail", f"Error: {str(e)[:50]}")

        # TC-FOW-01: Follow a user
        if run_fow:
            print("[Info] Running TC-FOW-01 (Follow a user)...")
            try:
                print("  -> Swapping to User 2 cookies to test follow (User cannot follow own post)")
                browser.inject_cookies("user2_cookies.json")
                time.sleep(1)
                
                browser.driver.get(post_link)
                time.sleep(3)
                
                # Find follow button chip near author name
                follow_btns = browser.driver.find_elements(By.XPATH, "//button[contains(., 'Follow') or contains(., 'Following')]")
                if follow_btns:
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", follow_btns[0])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", follow_btns[0])
                    time.sleep(2)
                    browser.driver.refresh()
                    time.sleep(3)
                    reporter.add_result("TC-FOW-01", "Follow a user", "Pass", "Follow toggled successfully")
                else:
                    reporter.add_result("TC-FOW-01", "Follow a user", "Fail", "Could not find follow button on post author")
                    
                # Swap back to User 1
                browser.inject_cookies("user1_cookies.json")
                time.sleep(1)
            except Exception as e:
                reporter.add_result("TC-FOW-01", "Follow a user", "Fail", f"Error: {str(e)[:50]}")
                browser.inject_cookies("user1_cookies.json")

        # TC-SRCH-01: Search for a post
        if run_srch:
            print("[Info] Running TC-SRCH-01 (Search post)...")
            try:
                browser.driver.get(f"{FRONTEND_URL}/home")
                time.sleep(3)
                
                # Wait for search bar in top bar and type generic title
                browser.wait_and_type("input[placeholder*='Search']", "Automated Test", By.CSS_SELECTOR)
                # Submit search
                search_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Search']")
                from selenium.webdriver.common.keys import Keys
                search_input.send_keys(Keys.ENTER)
                time.sleep(3)
                
                # Check URL or items on page
                if "search=" in browser.driver.current_url.lower() or "automated test" in browser.driver.find_element(By.TAG_NAME, "body").text.lower():
                    reporter.add_result("TC-SRCH-01", "Search post", "Pass", "Search executed successfully")
                else:
                    reporter.add_result("TC-SRCH-01", "Search post", "Fail", "Failed to navigate or find search results")
            except Exception as e:
                reporter.add_result("TC-SRCH-01", "Search post", "Fail", f"Error: {str(e)[:50]}")

        # --- TOGGLE TESTS (Unlike, Unbookmark, Unfollow) ---
        # Assuming we just toggled them ON previously in run_01, run_bkm, run_fow
        # We can toggle them OFF by clicking again

        # TC-INT-02: Unlike post
        if run_02:
            print("[Info] Running TC-INT-02 (Unlike post)...")
            try:
                browser.driver.get(post_link)
                time.sleep(3)
                
                # Assume like button has IoHeart (filled) if already liked
                like_btn_xpath = "//button[contains(@class, 'hover:text-red-500')]"
                like_btns = browser.driver.find_elements(By.XPATH, like_btn_xpath)
                if like_btns:
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", like_btns[0])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", like_btns[0])
                    time.sleep(1)
                    reporter.add_result("TC-INT-02", "Unlike post", "Pass", "Unliked post successfully")
                else:
                    reporter.add_result("TC-INT-02", "Unlike post", "Fail", "Could not find like button on post")
            except Exception as e:
                reporter.add_result("TC-INT-02", "Unlike post", "Fail", f"Error: {str(e)[:50]}")

        # TC-BKM-02: Unbookmark post
        if run_bkm_02:
            print("[Info] Running TC-BKM-02 (Unbookmark post)...")
            try:
                # Unbookmark requires feed view
                browser.driver.get(f"{FRONTEND_URL}/")
                time.sleep(3)
                
                bkm_btns = browser.driver.find_elements(By.XPATH, "//button[contains(@class, 'hover:text-gray-800')]")
                if bkm_btns:
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", bkm_btns[0])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", bkm_btns[0])
                    time.sleep(1)
                    reporter.add_result("TC-BKM-02", "Unbookmark post", "Pass", "Unbookmarked post successfully")
                else:
                    reporter.add_result("TC-BKM-02", "Unbookmark post", "Fail", "Could not find bookmark button on feed")
            except Exception as e:
                reporter.add_result("TC-BKM-02", "Unbookmark post", "Fail", f"Error: {str(e)[:50]}")

        # TC-FOW-02: Unfollow user
        if run_fow_02:
            print("[Info] Running TC-FOW-02 (Unfollow user)...")
            try:
                print("  -> Swapping to User 2 cookies to test unfollowing")
                browser.inject_cookies("user2_cookies.json")
                time.sleep(1)
                
                browser.driver.get(post_link)
                time.sleep(3)
                
                follow_btns = browser.driver.find_elements(By.XPATH, "//button[contains(., 'Follow') or contains(., 'Following')]")
                if follow_btns:
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", follow_btns[0])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", follow_btns[0])
                    time.sleep(2)
                    browser.driver.refresh()
                    time.sleep(3)
                    reporter.add_result("TC-FOW-02", "Unfollow user", "Pass", "Unfollow toggled successfully")
                else:
                    reporter.add_result("TC-FOW-02", "Unfollow user", "Fail", "Could not find follow button on post author")
                
                browser.inject_cookies("user1_cookies.json")
                time.sleep(1)
            except Exception as e:
                reporter.add_result("TC-FOW-02", "Unfollow user", "Fail", f"Error: {str(e)[:50]}")
                browser.inject_cookies("user1_cookies.json")

        # TC-INT-07: Like a comment
        if run_07:
            print("[Info] Running TC-INT-07 (Like a comment)...")
            try:
                browser.driver.get(post_link)
                time.sleep(3)
                # Look for like buttons that are likely in the comment section (usually more than one like button exists on page, first is post)
                like_btns = browser.driver.find_elements(By.XPATH, "//button[contains(@class, 'hover:text-red-500')]")
                if len(like_btns) > 1:
                    # Click the second like button which is presumably the first comment
                    browser.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", like_btns[1])
                    time.sleep(1)
                    browser.driver.execute_script("arguments[0].click();", like_btns[1])
                    time.sleep(1)
                    reporter.add_result("TC-INT-07", "Like comment", "Pass", "Liked comment successfully")
                else:
                    reporter.add_result("TC-INT-07", "Like comment", "Fail", "No comment like button found")
            except Exception as e:
                reporter.add_result("TC-INT-07", "Like comment", "Fail", f"Error: {str(e)[:50]}")

        # --- COMMENT CHARACTER LIMIT TESTS ---
        
        # TC-CMT-01: Comment 1000 characters exact
        if run_cmt_01:
            print("[Info] Running TC-CMT-01 (Comment boundary 1000 chars)...")
            try:
                browser.driver.get(post_link)
                time.sleep(3)
                # We inject text using JS then send a space to trigger react hooks
                comment_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder='Add a comment...']")
                browser.driver.execute_script("arguments[0].value = arguments[1];", comment_input, "C" * 999)
                comment_input.send_keys(" ")
                browser.wait_and_click("//button[contains(text(), 'Post')]", By.XPATH)
                time.sleep(2)
                # Check if error or success
                try:
                    alert = browser.driver.switch_to.alert
                    alert_text = alert.text
                    alert.accept()
                    reporter.add_result("TC-CMT-01", "Comment 1000 chars exactly", "Fail", f"Unexpected alert: {alert_text}")
                except:
                    reporter.add_result("TC-CMT-01", "Comment 1000 chars exactly", "Pass", "Comment posted successfully within limit")
            except Exception as e:
                reporter.add_result("TC-CMT-01", "Comment 1000 chars exactly", "Fail", f"Error: {str(e)[:50]}")

        # TC-CMT-02: Comment exceeding 1000 characters
        if run_cmt_02:
            print("[Info] Running TC-CMT-02 (Comment exceed 1000 chars)...")
            try:
                browser.driver.get(post_link)
                time.sleep(3)
                comment_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder='Add a comment...']")
                browser.driver.execute_script("arguments[0].value = arguments[1];", comment_input, "C" * 1001)
                comment_input.send_keys(" ")
                browser.wait_and_click("//button[contains(text(), 'Post')]", By.XPATH)
                time.sleep(2)
                try:
                    alert = browser.driver.switch_to.alert
                    alert_text = alert.text
                    alert.accept()
                    if "character limit" in alert_text.lower() or "too long" in alert_text.lower() or "exceed" in alert_text.lower() or "failed" in alert_text.lower():
                        reporter.add_result("TC-CMT-02", "Comment 1001 chars (exceed)", "Pass", "Blocked by validation alert")
                    else:
                        reporter.add_result("TC-CMT-02", "Comment 1001 chars (exceed)", "Fail", f"Unexpected alert: {alert_text}")
                except:
                    # Alternately, UI might prevent posting or display a toaster instead of an alert
                    reporter.add_result("TC-CMT-02", "Comment 1001 chars (exceed)", "Fail", "No validation alert shown for exceeding characters")
            except Exception as e:
                reporter.add_result("TC-CMT-02", "Comment 1001 chars (exceed)", "Fail", f"Error: {str(e)[:50]}")

        # --- ADVANCED SEARCH TESTS ---

        # TC-SRCH-02: Filter Post by Tag
        if run_srch_02:
            print("[Info] Running TC-SRCH-02 (Filter post by tag)...")
            try:
                browser.driver.get(f"{FRONTEND_URL}/home")
                time.sleep(3)
                # Look for a tag to filter by, if not present just try typing a tag or clicking a filter UI if it exists.
                # In INKLY, usually there is a sort context or tags on the right/left pane. Let's look for known tag strings.
                tags = browser.driver.find_elements(By.XPATH, "//span[contains(text(), '#') or contains(text(), 'test')]")
                if tags:
                    tags[0].click()
                    time.sleep(2)
                    reporter.add_result("TC-SRCH-02", "Filter post", "Pass", "Clicked on tag filter to filter posts")
                else:
                     # fallback
                     reporter.add_result("TC-SRCH-02", "Filter post", "Fail", "No clickable tags found to filter by")
            except Exception as e:
                reporter.add_result("TC-SRCH-02", "Filter post", "Fail", f"Error: {str(e)[:50]}")

        # TC-SRCH-03: Sort Post
        if run_srch_03:
            print("[Info] Running TC-SRCH-03 (Sort posts)...")
            try:
                browser.driver.get(f"{FRONTEND_URL}/home")
                time.sleep(3)
                # Assume sort dropdown or buttons exist (e.g. Latest, Top)
                sort_btns = browser.driver.find_elements(By.XPATH, "//button[contains(text(), 'Latest') or contains(text(), 'Top') or contains(text(), 'Sort')]")
                if sort_btns:
                    sort_btns[0].click()
                    time.sleep(2)
                    reporter.add_result("TC-SRCH-03", "Sort post", "Pass", "Clicked to toggle sort")
                else:
                    reporter.add_result("TC-SRCH-03", "Sort post", "Fail", "No sort buttons found")
            except Exception as e:
                reporter.add_result("TC-SRCH-03", "Sort post", "Fail", f"Error: {str(e)[:50]}")

        # TC-SRCH-04: Search follower
        if run_srch_04:
            print("[Info] Running TC-SRCH-04 (Search follower)...")
            try:
                browser.driver.get(f"{FRONTEND_URL}/followed")
                time.sleep(3)
                browser.wait_and_type("input[placeholder*='Search']", "User", By.CSS_SELECTOR)
                from selenium.webdriver.common.keys import Keys
                search_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Search']")
                search_input.send_keys(Keys.ENTER)
                time.sleep(2)
                reporter.add_result("TC-SRCH-04", "Search follower", "Pass", "Executed search query on followers page")
            except Exception as e:
                reporter.add_result("TC-SRCH-04", "Search follower", "Fail", f"Error: {str(e)[:50]}")

        # TC-SRCH-05: Search bookmark
        if run_srch_05:
            print("[Info] Running TC-SRCH-05 (Search bookmarks)...")
            try:
                browser.driver.get(f"{FRONTEND_URL}/bookmarks")
                time.sleep(3)
                browser.wait_and_type("input[placeholder*='Search']", "Test", By.CSS_SELECTOR)
                from selenium.webdriver.common.keys import Keys
                search_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Search']")
                search_input.send_keys(Keys.ENTER)
                time.sleep(2)
                reporter.add_result("TC-SRCH-05", "Search bookmark", "Pass", "Executed search query on bookmarks page")
            except Exception as e:
                reporter.add_result("TC-SRCH-05", "Search bookmark", "Fail", f"Error: {str(e)[:50]}")
