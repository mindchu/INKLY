# Bypassing Google UI for Automated Testing (Selenium)

To make automated tests reliable and avoid Google's bot detection, we can bypass the Google login interface entirely. This is standard practice in professional CI/CD pipelines.

## Suggested Strategy: Mocking the OAuth Flow

Instead of interacting with Google's servers, we simulate the backend receiving a successful "OK" from Google.

### 1. Backend Preparation (Mock Endpoint)

Add a temporary "Test-Only" route in your backend (`backend/routes/auth.py`). This route should only be active in development or testing environments.

```python
# Example Mock Endpoint in backend/routes/auth.py
@router.get("/auth/mock-login")
async def mock_login(request: Request, email: str = "testuser@gmail.com"):
    # 1. Simulated User Data (matching what Google would return)
    user_info = {
        'email': email,
        'name': 'Test User',
        'is_new': False # Or True to test registration flow
    }
    
    # 2. Replicate the backend session logic
    user_data = db.users.find_one({"email": email})
    if not user_data:
        # Create user if doesn't exist (simulating registration)
        from obj.user import User
        new_user = User.from_google_info(user_info)
        result = db.users.insert_one(new_user.to_dict())
        user_data = new_user.to_dict()
        user_data['_id'] = str(result.inserted_id)
        user_data['is_new'] = True
    else:
        user_data['_id'] = str(user_data['_id'])
        user_data['is_new'] = False

    # 3. Set the session exactly like the real auth flow
    request.session['user'] = user_data
    
    # 4. Redirect to Frontend
    redirect_url = f"{FRONTEND_URL}/"
    if user_data.get('is_new'):
        redirect_url = f"{FRONTEND_URL}/interests"
        
    return RedirectResponse(url=redirect_url)
```

### 2. Refined Selenium Script (Skipping Google UI)

The script now directly triggers the mock login, which handles the session and redirects to the app.

```python
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def test_login_bypassing_google():
    chrome_options = Options()
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    try:
        # FRONTEND and BACKEND URLs
        frontend_url = "http://localhost:6601"
        backend_url = "http://localhost:8000" # Change to your backend port

        # 1. Directly call the mock backend endpoint
        # This will set the session cookie in the browser and redirect to the frontend
        print("Triggering mock login...")
        driver.get(f"{backend_url}/auth/mock-login?email=test@example.com")

        # 2. Wait for redirect back to frontend
        time.sleep(2) 
        
        # 3. Verify we are on the Home page or Interests page
        current_url = driver.current_url
        print(f"Logged in successfully! Current URL: {current_url}")
        
        if frontend_url in current_url:
            print("Verified: User session active and redirected to application.")
            # Now you can proceed to test other features (Post, Search, etc.)
        else:
            print("Failed: Was not redirected to the application.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_login_bypassing_google()
```

## Why this is better:
1.  **Speed**: Tests run in seconds, not waiting for Google's UI transitions.
2.  **Reliability**: Zero chance of being blocked by Google's anti-bot system.
3.  **Isolation**: Focuses testing on *your* code, not Google's.
4.  **Deterministic**: You can force "New User" or "Existing User" states by changing the mock parameters.

---

## Alternative Strategy: "Dupe Cookies" (Session Injection)

The "Dupe Cookies" method involves logging in manually once, capturing the session cookie, and then "injecting" that cookie into your automated Selenium browser. This effectively bypasses the login flow by telling the backend you already have an active session.

### How it works:
1. **Login Manually**: You log in to INKLY in your browser.
2. **Save Cookies**: You run a script once to save the browser's cookies to a file (e.g., `cookies.pkl` or `cookies.json`).
3. **Inject Cookies**: In your test suite, you load these cookies and add them to the Selenium driver.

### Code Example: Injecting Cookies in Selenium

```python
import pickle
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def test_with_injected_cookies():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    # 1. You MUST visit the domain first so Selenium knows where to apply the cookies
    frontend_url = "http://localhost:6601"
    driver.get(frontend_url) 
    
    # 2. Load cookies from a file (e.g., using pickle)
    # Note: You need to have created this file previously by logging in and running
    # pickle.dump(driver.get_cookies(), open("cookies.pkl", "wb"))
    try:
        cookies = pickle.load(open("cookies.pkl", "rb"))
        for cookie in cookies:
            driver.add_cookie(cookie)
        
        # 3. Refresh or navigate to a protected page
        driver.refresh()
        print("Cookies injected. Session should be active.")
        
        # Verify login (e.g., look for a profile element or check URL)
        time.sleep(2)
        print(f"Current URL after injection: {driver.current_url}")
        
    except FileNotFoundError:
        print("Error: cookies.pkl not found. Please log in manually once and save cookies.")
    
    finally:
        driver.quit()

if __name__ == "__main__":
    test_with_injected_cookies()
```

### When to use this:
- **Pros**: Very fast; bypasses Google UI entirely without needing backend code changes (like mocking).
- **Cons**: Cookies expire. You will need to manually log in and update the `cookies.pkl` file whenever your session times out (typically every 24 hours as per your requirements).

---

### Comparison of Methods

| Method | Reliability | Speed | Setup Complexity | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Standard UI** | Low (Blocked by Google) | Slow | Low | Basic smoke tests (if undetected) |
| **Mocking OAuth** | High | Very Fast | Medium (Backend change required) | CI/CD Pipelines, rigorous testing |
| **Cookie Injection**| High | Fast | Low | Quick local dev testing, skipping UI |

I have updated the suggestions with the "Dupe Cookies" method. Which approach fits your workflow better?
