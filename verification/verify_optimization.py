
from playwright.sync_api import sync_playwright

def verify_sorting(page):
    print("Navigating to home page...")
    # Navigate to the home page
    page.goto("http://localhost:3000")

    # Wait for the "Create New Course" button to be visible
    print("Waiting for 'Create New Course' button...")
    page.wait_for_selector("text=Create New Course", timeout=15000)

    # Create a new course
    print("Clicking 'Create New Course'...")
    page.click("text=Create New Course")

    # Wait for modal to open
    print("Waiting for modal input...")
    page.wait_for_selector("input[placeholder='e.g., Data Structures & Algorithms']", state="visible", timeout=5000)

    # Fill in the modal
    print("Filling modal...")
    page.fill("input[placeholder='e.g., Data Structures & Algorithms']", "Performance Test Course")
    page.fill("input[placeholder='Brief description of the course']", "Testing useMemo optimization")

    # Click "Create Course" in the modal
    print("Submitting form...")
    # Click the last "Create Course" text element, which should be the button in the modal
    page.click("text=Create Course >> nth=-1")

    # Wait for the course card to appear
    print("Waiting for course card...")
    page.wait_for_selector("text=Performance Test Course", timeout=5000)

    # Click on the course card to navigate to the course page
    print("Clicking course card...")
    page.click("text=Performance Test Course")

    # Wait for the course page to load
    print("Waiting for course page...")
    page.wait_for_selector("text=Performance Test Course", timeout=10000)

    # Verify we are on the course page
    assert "Performance Test Course" in page.content()

    # Check for elements
    page.wait_for_selector("input[placeholder='Search files...']")
    page.wait_for_selector("select")

    # Take a screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/course_page.png")
    print("Screenshot saved to verification/course_page.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_sorting(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
