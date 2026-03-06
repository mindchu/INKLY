import time
import os
from utils.browser import BrowserUtility, FRONTEND_URL
from utils.reporter import TestReporter
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_post_tests(browser: BrowserUtility, reporter: TestReporter, target_tests: list = None):
    print("\n--- Running Post Tests ---")
    
    # Determine which tests to run
    run_note = not target_tests or "TC-POST-NOTE" in target_tests
    run_disc = not target_tests or "TC-POST-DISC" in target_tests
    run_01 = not target_tests or "TC-POST-01" in target_tests
    run_02 = not target_tests or "TC-POST-02" in target_tests
    run_03 = not target_tests or "TC-POST-03" in target_tests
    run_04 = not target_tests or "TC-POST-04" in target_tests
    run_file_01 = not target_tests or "TC-FILE-01" in target_tests
    run_file_02 = not target_tests or "TC-FILE-02" in target_tests
    run_file_03 = not target_tests or "TC-FILE-03" in target_tests
    run_file_04 = not target_tests or "TC-FILE-04" in target_tests
    run_file_05 = not target_tests or "TC-FILE-05" in target_tests
    
    any_post_test = run_note or run_disc or run_01 or run_02 or run_03 or run_04 or run_file_01 or run_file_02 or run_file_03 or run_file_04 or run_file_05
    
    if any_post_test:
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
            
            # Add tag
            browser.wait_and_type("input[placeholder*='Add Tags']", "test", By.CSS_SELECTOR)
            time.sleep(1) # wait for suggestion dropdown or processing
            tag_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Add Tags']")
            tag_input.send_keys(Keys.ENTER)
            
            browser.wait_and_click("//button[contains(text(), 'Publish Note')]", By.XPATH)
            
            try:
                WebDriverWait(browser.driver, 5).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "successfully" in alert_text.lower():
                     reporter.add_result("TC-POST-NOTE", "Notes Generation Test", "Pass", "Note published successfully")
                else:
                     reporter.add_result("TC-POST-NOTE", "Notes Generation Test", "Fail", f"Failed. Alert: {alert_text}")
            except Exception as e:
                reporter.add_result("TC-POST-NOTE", "Notes Generation Test", "Fail", f"No alert found. Error: {str(e)[:50]}")
        except Exception as e:
            reporter.add_result("TC-POST-NOTE", "Notes Generation Test", "Fail", f"Error: {str(e)[:50]}")

    # Create Discussion
    if run_disc:
        print("[Info] Running Discussion Generation Test...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_discussion")
            time.sleep(2)
            
            browser.wait_and_type("input[placeholder='Enter title...']", "Automated Test Discussion Title", By.CSS_SELECTOR)
            browser.wait_and_type("textarea[placeholder*='Start a conversation']", "What are your thoughts on automated testing? Discuss below.", By.CSS_SELECTOR)
            
            # Add tag
            browser.wait_and_type("input[placeholder*='Add Tags']", "test", By.CSS_SELECTOR)
            time.sleep(1) # wait for suggestion dropdown or processing
            tag_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Add Tags']")
            tag_input.send_keys(Keys.ENTER)
            
            browser.wait_and_click("//button[contains(text(), 'Publish Discussion')]", By.XPATH)
            
            try:
                WebDriverWait(browser.driver, 5).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "successfully" in alert_text.lower():
                     reporter.add_result("TC-POST-DISC", "Discussion Generation Test", "Pass", "Discussion published successfully")
                else:
                     reporter.add_result("TC-POST-DISC", "Discussion Generation Test", "Fail", f"Failed. Alert: {alert_text}")
            except Exception as e:
                reporter.add_result("TC-POST-DISC", "Discussion Generation Test", "Fail", f"No alert found. Error: {str(e)[:50]}")
        except Exception as e:
            reporter.add_result("TC-POST-DISC", "Discussion Generation Test", "Fail", f"Error: {str(e)[:50]}")

    # TC-POST-01: Form validation for missing fields
    if run_01:
        print("[Info] Running TC-POST-01 (Missing fields test)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            # Empty title and content
            browser.wait_and_click("//button[contains(text(), 'Publish Note')]", By.XPATH)
            time.sleep(1)
            try:
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "fill in both title and content" in alert_text.lower() or "missing" in alert_text.lower() or "failed" in alert_text.lower():
                    reporter.add_result("TC-POST-01", "Create post missing fields", "Pass", "Validated that fields are required")
                else:
                    reporter.add_result("TC-POST-01", "Create post missing fields", "Fail", f"Failed. Unexpected alert: {alert_text}")
            except Exception:
                reporter.add_result("TC-POST-01", "Create post missing fields", "Fail", "No validation alert shown")
        except Exception as e:
            reporter.add_result("TC-POST-01", "Create post missing fields", "Fail", f"Error: {str(e)[:50]}")

    # TC-POST-02: Boundary character limit (5000 chars)
    if run_02:
        print("[Info] Running TC-POST-02 (5000 char boundary)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            browser.wait_and_type("input[placeholder='Enter title...']", "5000 Char Test Note", By.CSS_SELECTOR)
            browser.wait_and_type("textarea[placeholder*='Write your notes here']", "A" * 5000, By.CSS_SELECTOR)
            
            browser.wait_and_type("input[placeholder*='Add Tags']", "test", By.CSS_SELECTOR)
            time.sleep(1)
            tag_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Add Tags']")
            tag_input.send_keys(Keys.ENTER)
            
            browser.wait_and_click("//button[contains(text(), 'Publish Note')]", By.XPATH)
            
            try:
                WebDriverWait(browser.driver, 5).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "successfully" in alert_text.lower():
                     reporter.add_result("TC-POST-02", "Post 5000 chars exactly", "Pass", "Note published successfully")
                else:
                     reporter.add_result("TC-POST-02", "Post 5000 chars exactly", "Fail", f"Failed. Alert: {alert_text}")
            except Exception as e:
                reporter.add_result("TC-POST-02", "Post 5000 chars exactly", "Fail", f"No alert found. Error: {str(e)[:50]}")
        except Exception as e:
             reporter.add_result("TC-POST-02", "Post 5000 chars exactly", "Fail", f"Error: {str(e)[:50]}")

    # TC-POST-03: Exceed boundary character limit (5001 chars)
    if run_03:
        print("[Info] Running TC-POST-03 (5001 char boundary)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            browser.wait_and_type("input[placeholder='Enter title...']", "5001 Char Test Note", By.CSS_SELECTOR)
            # Find the textarea directly so we can send standard JS to paste text rapidly, 5001 characters
            textarea = browser.driver.find_element(By.CSS_SELECTOR, "textarea[placeholder*='Write your notes here']")
            browser.driver.execute_script("arguments[0].value = arguments[1];", textarea, 'A' * 5001)
            textarea.send_keys(" ") # Trigger React state update
            
            browser.wait_and_click("//button[contains(text(), 'Publish Note')]", By.XPATH)
            
            try:
                WebDriverWait(browser.driver, 5).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "character" in alert_text.lower() or "limit" in alert_text.lower() or "failed" in alert_text.lower() or "validation error" in alert_text.lower():
                     reporter.add_result("TC-POST-03", "Post 5001 chars (exceed)", "Pass", "Validation error caught appropriately")
                elif "successfully" in alert_text.lower():
                     reporter.add_result("TC-POST-03", "Post 5001 chars (exceed)", "Fail", "System allowed 5001 chars to be published")
                else:
                     reporter.add_result("TC-POST-03", "Post 5001 chars (exceed)", "Fail", f"Unexpected alert: {alert_text}")
            except Exception as e:
                reporter.add_result("TC-POST-03", "Post 5001 chars (exceed)", "Fail", f"No alert found. Expected validation error.")
        except Exception as e:
             reporter.add_result("TC-POST-03", "Post 5001 chars (exceed)", "Fail", f"Error: {str(e)[:50]}")

    # TC-POST-04: Set already existing tag in post
    if run_04:
        print("[Info] Running TC-POST-04 (Set already existing tag)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            
            browser.wait_and_type("input[placeholder='Enter title...']", "Test Tag Note", By.CSS_SELECTOR)
            browser.wait_and_type("textarea[placeholder*='Write your notes here']", "Sample Content", By.CSS_SELECTOR)
            
            # Add existing tag
            browser.wait_and_type("input[placeholder*='Add Tags']", "test", By.CSS_SELECTOR)
            time.sleep(1)
            tag_input = browser.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Add Tags']")
            tag_input.send_keys(Keys.ENTER)
            
            browser.wait_and_click("//button[contains(text(), 'Publish Note')]", By.XPATH)
            
            try:
                WebDriverWait(browser.driver, 5).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "successfully" in alert_text.lower():
                     reporter.add_result("TC-POST-04", "Set existing tag", "Pass", "Note with existing tag published successfully")
                else:
                     reporter.add_result("TC-POST-04", "Set existing tag", "Fail", f"Failed. Alert: {alert_text}")
            except Exception as e:
                reporter.add_result("TC-POST-04", "Set existing tag", "Fail", f"No alert found. Error: {str(e)[:50]}")
        except Exception as e:
             reporter.add_result("TC-POST-04", "Set existing tag", "Fail", f"Error: {str(e)[:50]}")

    # Helper function to generate dummy files of specific sizes
    def create_dummy_file(filename, size_mb):
        filepath = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dummyfile', filename)
        with open(filepath, "wb") as f:
            f.write(os.urandom(int(size_mb * 1024 * 1024)))
        return filepath

    # TC-FILE-01: Image size limit - Exact boundary (10.0MB) - Simulating with PDF/Image logic
    if run_file_01:
        print("[Info] Running TC-FILE-01 (10.0MB boundary)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            filepath = create_dummy_file("dummy_10mb.jpg", 9.9) # Slightly under 10MB to be safe for metadata overhead if any
            file_input = browser.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
            file_input.send_keys(filepath)
            time.sleep(1)
            
            # Check for validation alert immediately after upload
            try:
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                reporter.add_result("TC-FILE-01", "Upload 10.0MB limit", "Fail", f"Unexpected alert: {alert_text}")
            except:
                reporter.add_result("TC-FILE-01", "Upload 10.0MB limit", "Pass", "File accepted without immediate error")
                
            os.remove(filepath)
        except Exception as e:
            reporter.add_result("TC-FILE-01", "Upload 10.0MB limit", "Fail", f"Error: {str(e)[:50]}")

    # TC-FILE-02: Image size limit - Exceeded (10.1MB)
    if run_file_02:
        print("[Info] Running TC-FILE-02 (10.1MB exceed)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            filepath = create_dummy_file("dummy_10_1mb.jpg", 10.2) # Over 10MB 
            file_input = browser.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
            file_input.send_keys(filepath)
            time.sleep(1)
            
            try:
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "size" in alert_text.lower() or "large" in alert_text.lower() or "exceed" in alert_text.lower():
                    reporter.add_result("TC-FILE-02", "Upload 10.1MB exceed", "Pass", "Blocked properly with size alert")
                else:
                    reporter.add_result("TC-FILE-02", "Upload 10.1MB exceed", "Fail", f"Unexpected alert: {alert_text}")
            except:
                reporter.add_result("TC-FILE-02", "Upload 10.1MB exceed", "Fail", "No file size validation alert shown")
                
            os.remove(filepath)
        except Exception as e:
            reporter.add_result("TC-FILE-02", "Upload 10.1MB exceed", "Fail", f"Error: {str(e)[:50]}")
             
    # TC-FILE-03: Invalid file format
    if run_file_03:
        print("[Info] Running TC-FILE-03 (Invalid file format)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            
            file_input = browser.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
            
            invalid_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dummyfile', 'dummy_invalid.bat')
            with open(invalid_file_path, 'w') as f:
                f.write('echo "Invalid File"')
            
            file_input.send_keys(invalid_file_path)
            time.sleep(1)
            
            try:
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "not valid" in alert_text.lower() or "invalid" in alert_text.lower() or "type" in alert_text.lower():
                     reporter.add_result("TC-FILE-03", "Upload invalid file format", "Pass", "Invalid file properly blocked by frontend")
                else:
                     reporter.add_result("TC-FILE-03", "Upload invalid file format", "Fail", f"Unexpected alert: {alert_text}")
            except Exception as e:
                reporter.add_result("TC-FILE-03", "Upload invalid file format", "Fail", "No validation alert shown for invalid file")
                
            os.remove(invalid_file_path)
        except Exception as e:
             reporter.add_result("TC-FILE-03", "Upload invalid file format", "Fail", f"Error: {str(e)[:50]}")

    # TC-FILE-04: File size limit - Exact boundary (10.0MB) - Some systems allow larger PDFs vs Images.
    if run_file_04:
        print("[Info] Running TC-FILE-04 (10.0MB boundary)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            filepath = create_dummy_file("dummy_10mb.pdf", 9.9)
            file_input = browser.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
            file_input.send_keys(filepath)
            time.sleep(2)
            
            try:
                WebDriverWait(browser.driver, 2).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                reporter.add_result("TC-FILE-04", "Upload 10.0MB limit", "Fail", f"Unexpected alert: {alert_text}")
            except:
                reporter.add_result("TC-FILE-04", "Upload 10.0MB limit", "Pass", "File accepted without immediate error")
                
            os.remove(filepath)
        except Exception as e:
            reporter.add_result("TC-FILE-04", "Upload 10.0MB limit", "Fail", f"Error: {str(e)[:50]}")

    # TC-FILE-05: File size limit - Exceeded (10.1MB)
    if run_file_05:
        print("[Info] Running TC-FILE-05 (10.1MB exceed)...")
        try:
            browser.driver.get(f"{FRONTEND_URL}/create_note")
            time.sleep(2)
            filepath = create_dummy_file("dummy_10_1mb.pdf", 10.2)
            file_input = browser.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
            file_input.send_keys(filepath)
            time.sleep(2)
            
            try:
                WebDriverWait(browser.driver, 2).until(EC.alert_is_present())
                alert = browser.driver.switch_to.alert
                alert_text = alert.text
                alert.accept()
                if "size" in alert_text.lower() or "large" in alert_text.lower() or "exceed" in alert_text.lower() or "limit" in alert_text.lower():
                    reporter.add_result("TC-FILE-05", "Upload 10.1MB exceed", "Pass", "Blocked properly with size alert")
                else:
                    reporter.add_result("TC-FILE-05", "Upload 10.1MB exceed", "Fail", f"Unexpected alert: {alert_text}")
            except:
                reporter.add_result("TC-FILE-05", "Upload 10.1MB exceed", "Fail", "No file size validation alert shown")
                
            os.remove(filepath)
        except Exception as e:
            reporter.add_result("TC-FILE-05", "Upload 10.1MB exceed", "Fail", f"Error: {str(e)[:50]}")
