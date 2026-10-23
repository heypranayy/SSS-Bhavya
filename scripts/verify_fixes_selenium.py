import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

def get_mobile_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=390,844")
    mobile_emulation = {
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    }
    opts.add_experimental_option("mobileEmulation", mobile_emulation)
    return webdriver.Chrome(options=opts)

def get_desktop_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1280,900")
    return webdriver.Chrome(options=opts)

def test_collections_tabs_and_no_test_data():
    print("\n>>> TEST 1: /collections Category Redirection Tabs & Zero Test Pollution")
    driver = get_desktop_driver()
    try:
        driver.get(f"{BASE_URL}/collections")
        time.sleep(2)
        
        # 1. Verify "Festive Test Collection 2026" is gone
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert "Festive Test Collection" not in body_text, "FAILED: Festive Test Collection found in body text!"
        assert "Festive Test" not in body_text, "FAILED: Festive Test found in body text!"
        print("  [PASS] 'Festive Test Collection 2026' completely removed from /collections!")
        
        # 2. Check category tabs specifically in the Quick Categories Bar
        cat_links = driver.find_elements(
            By.XPATH, 
            "//div[contains(@class, 'flex-wrap') and .//span[contains(text(), 'Browse Categories')]]//a"
        )
        print(f"  Found {len(cat_links)} category redirect links in Browse Categories bar.")
        assert len(cat_links) == 6, f"Expected 6 category links, found {len(cat_links)}"
        
        for link in cat_links:
            text = link.text.strip()
            href = link.get_attribute("href")
            print(f"    Tab: '{text}' -> Link: {href}")
            assert "/collections/" in href, f"Link {href} does not target /collections/[slug]"
            assert "(Legacy)" not in text, f"Legacy category shown: {text}"
            
        # 3. Test clicking a tab and verifying redirect
        first_tab = cat_links[0]
        tab_name = first_tab.text.strip()
        first_tab.click()
        time.sleep(2)
        current_url = driver.current_url
        print(f"  Clicked '{tab_name}' -> redirected to: {current_url}")
        assert "/collections/" in current_url and current_url != f"{BASE_URL}/collections", f"Redirect failed: {current_url}"
        print(f"  [PASS] Category tab successfully redirected to catalog page: {current_url}!")
    finally:
        driver.quit()

def test_catalog_mobile_whatsapp_drawer():
    print("\n>>> TEST 2: Mobile Catalog WhatsApp Modal & Sticky CTAs")
    driver = get_mobile_driver()
    try:
        url = f"{BASE_URL}/catalog/bhavya-vip-summer-2026?code=BF-2026-001"
        driver.get(url)
        time.sleep(2)
        viewport_h = driver.execute_script("return window.innerHeight;")
        print(f"  Mobile viewport height: {viewport_h}px")
        
        # Click "Quick Add Set" button
        add_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Quick Add Set')]")
        assert len(add_buttons) > 0, "No 'Quick Add Set' button found!"
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_buttons[0])
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", add_buttons[0])
        time.sleep(1)
        print("  Clicked 'Quick Add Set' on first design.")
        
        # Check Sticky SelectedDesignsDrawer
        sticky_bar = driver.find_element(By.CSS_SELECTOR, "div.fixed.bottom-0")
        assert sticky_bar.is_displayed(), "Sticky bottom drawer not visible!"
        bar_rect = driver.execute_script("return arguments[0].getBoundingClientRect();", sticky_bar)
        print(f"  Sticky bar rect: top={bar_rect.get('top')}, bottom={bar_rect.get('bottom')}, height={bar_rect.get('height')}")
        assert bar_rect.get('top') < viewport_h, "Sticky bar is below viewport!"
        
        # Click "Send Selection on WhatsApp" in the bottom bar
        wa_cta_in_bar = sticky_bar.find_element(By.XPATH, ".//button[contains(., 'Send Selection on WhatsApp')]")
        driver.execute_script("arguments[0].click();", wa_cta_in_bar)
        time.sleep(1)
        
        # Verify WhatsAppSelectionModal is opened
        modal = driver.find_element(By.XPATH, "//div[contains(., 'Send Selection on WhatsApp')]")
        assert modal.is_displayed(), "WhatsApp review modal is not visible!"
        print("  WhatsApp Review Modal opened successfully!")
        
        # Find the final Send on WhatsApp CTA link
        wa_links = driver.find_elements(By.XPATH, "//a[contains(@href, 'wa.me') or contains(@href, 'whatsapp.com')]")
        assert len(wa_links) > 0, "No WhatsApp link found in modal!"
        target_link = wa_links[0]
        href = target_link.get_attribute("href")
        print(f"  WhatsApp Link URL: {href[:70]}...")
        assert "wa.me/919830729210" in href or "919830729210" in href, f"Unexpected WhatsApp recipient: {href}"
        
        # Check bounding rect of the Send Selection CTA button
        btn_rect = driver.execute_script("return arguments[0].getBoundingClientRect();", target_link)
        btn_top = btn_rect.get('top', 0)
        btn_bottom = btn_rect.get('bottom', 0)
        print(f"  WhatsApp CTA Button position: top={btn_top}px, bottom={btn_bottom}px (viewport={viewport_h}px)")
        
        assert 0 <= btn_top <= viewport_h, f"FAILED: CTA button top ({btn_top}) is outside viewport ({viewport_h})!"
        assert btn_bottom <= viewport_h + 10, f"FAILED: CTA button bottom ({btn_bottom}) is hidden below viewport!"
        print("  [PASS] WhatsApp CTA button is perfectly visible in mobile viewport without sliding down!")
    finally:
        driver.quit()

def test_wholesale_mobile_review_drawer():
    print("\n>>> TEST 3: Mobile /wholesale Review Drawer WhatsApp Sticky Footer")
    driver = get_mobile_driver()
    try:
        url = f"{BASE_URL}/wholesale"
        driver.get(url)
        time.sleep(2)
        viewport_h = driver.execute_script("return window.innerHeight;")
        
        # Select items using "Select Design" or checkbox
        select_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Select Design') or contains(., 'Select')]")
        if not select_btns:
            select_btns = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        assert len(select_btns) > 0, "No select buttons found on /wholesale"
        
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", select_btns[0])
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", select_btns[0])
        time.sleep(1)
        print("  Selected 1 product in Wholesale Explorer.")
        
        # Check Review Items button
        review_btn = driver.find_element(By.XPATH, "//button[contains(., 'Review Items')]")
        driver.execute_script("arguments[0].click();", review_btn)
        time.sleep(1)
        print("  Opened Review Items drawer.")
        
        # Check WhatsApp CTA inside review drawer
        wa_btn = driver.find_element(By.XPATH, "//a[contains(., 'Send') and contains(., 'on WhatsApp')]")
        btn_rect = driver.execute_script("return arguments[0].getBoundingClientRect();", wa_btn)
        btn_top = btn_rect.get('top', 0)
        btn_bottom = btn_rect.get('bottom', 0)
        print(f"  Wholesale Review CTA position: top={btn_top}px, bottom={btn_bottom}px (viewport={viewport_h}px)")
        assert 0 <= btn_top <= viewport_h, f"FAILED: Wholesale CTA button top ({btn_top}) is outside viewport!"
        print("  [PASS] Wholesale Review WhatsApp CTA button is pinned and immediately visible on mobile!")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("==================================================")
    print(" RUNNING AUTOMATED SELENIUM VERIFICATION SUITE")
    print("==================================================")
    try:
        test_collections_tabs_and_no_test_data()
        test_catalog_mobile_whatsapp_drawer()
        test_wholesale_mobile_review_drawer()
        print("\n==================================================")
        print(" ALL SELENIUM TESTS PASSED WITH 100% SUCCESS! ")
        print("==================================================")
    except Exception as e:
        print(f"\n[!] TEST FAILED: {e}")
        sys.exit(1)
