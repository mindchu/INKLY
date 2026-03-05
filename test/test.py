import os
import sys
import argparse

# Add the current directory to sys.path so we can import from utils and cases
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.browser import BrowserUtility
from cases.auth_tests import run_auth_tests
from cases.post_tests import run_post_tests
from cases.profile_tests import run_profile_tests
from cases.interaction_tests import run_interaction_tests

def main():
    parser = argparse.ArgumentParser(description="INKLY Automated Test Suite")
    parser.add_argument('testcases', metavar='TC', type=str, nargs='*', help='Specific test cases to run (e.g., TC-AUTH-03)')
    parser.add_argument('--headless', action='store_true', help='Run browser without UI')
    args = parser.parse_args()

    print("========================================")
    print("   INKLY AUTOMATED TEST SUITE (MODULAR)  ")
    if args.testcases:
        print(f"   Running tests: {', '.join(args.testcases)}")
    print("========================================")

    # Initialize Browser
    browser = BrowserUtility(headless=args.headless)

    try:
        # 1. Run Auth Tests (TC-AUTH)
        run_auth_tests(browser, args.testcases)

        # 2. Run Profile Tests (TC-PROF)
        run_profile_tests(browser, args.testcases)

        # 3. Run Post Tests (TC-POST, TC-TAG, TC-FILE)
        run_post_tests(browser, args.testcases)

        # 4. Run Interaction Tests (TC-INT, TC-FOW, TC-BKM)
        run_interaction_tests(browser, args.testcases)

    except Exception as e:
        print(f"\n[Error] Test Suite interrupted: {e}")
    finally:
        print("\n========================================")
        print("   TEST SUITE EXECUTION FINISHED         ")
        print("========================================")
        browser.quit()

if __name__ == "__main__":
    main()
