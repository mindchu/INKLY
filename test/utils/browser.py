import json
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

FRONTEND_URL = "http://localhost:6601"
COOKIE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cookies")

class BrowserUtility:
    def __init__(self, headless=False):
        options = Options()
        if headless:
            options.add_argument("--headless")
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def inject_cookies(self, user_filename):
        file_path = os.path.join(COOKIE_DIR, user_filename)
        if not os.path.exists(file_path):
            print(f"Error: {user_filename} not found.")
            return False

        with open(file_path, "r") as f:
            cookies = json.load(f)

        self.driver.get(FRONTEND_URL)
        for cookie in cookies:
            # Strip port from domain for localhost to ensure match
            if "localhost" in cookie.get("domain", ""):
                cookie["domain"] = "localhost"
            
            if 'sameSite' in cookie and cookie['sameSite'] not in ['Strict', 'Lax']:
                del cookie['sameSite']
            
            try:
                self.driver.add_cookie(cookie)
            except Exception as e:
                print(f"[Warning] Failed to add cookie {cookie.get('name')}: {e}")
        
        self.driver.refresh()
        return True

    def wait_and_click(self, selector, by=By.CSS_SELECTOR):
        element = self.wait.until(EC.element_to_be_clickable((by, selector)))
        element.click()
        return element

    def wait_and_type(self, selector, text, by=By.CSS_SELECTOR):
        element = self.wait.until(EC.presence_of_element_located((by, selector)))
        element.clear()
        element.send_keys(text)
        return element

    def quit(self):
        self.driver.quit()
