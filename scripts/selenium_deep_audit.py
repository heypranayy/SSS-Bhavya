import sys
import time
import json
import urllib.request
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

def get_driver(mobile=False):
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    # Enable browser logging
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    if mobile:
        opts.add_argument("--window-size=390,844")
        mobile_emulation = {
            "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        }
        opts.add_experimental_option("mobileEmulation", mobile_emulation)
    else:
        opts.add_argument("--window-size=1280,900")
        
    return webdriver.Chrome(options=opts)

def audit_page(driver, path, mode="desktop"):
    url = f"{BASE_URL}{path}"
    print(f"\n--- Auditing [{mode.upper()}] {path} ---")
    driver.get(url)
    time.sleep(2) # Allow hydration
    
    report = {
        "path": path,
        "mode": mode,
        "title": driver.title,
        "console_errors": [],
        "broken_images": [],
        "horizontal_overflow": False,
        "category_tabs_found": 0,
        "category_tabs_clickable": 0,
        "found_test_text": False,
    }
    
    # 1. Console logs
    try:
        logs = driver.get_log('browser')
        for entry in logs:
            if entry.get('level') in ['SEVERE', 'ERROR']:
                msg = entry.get('message', '')
                # Filter out favicon 404 or harmless warnings if any
                report["console_errors"].append(msg)
    except Exception as e:
        pass
        
    # 2. Check broken images
    images = driver.find_elements(By.TAG_NAME, "img")
    for img in images:
        src = img.get_attribute("src") or ""
        alt = img.get_attribute("alt") or ""
        # Check naturalWidth via JS
        try:
            natural_width = driver.execute_script("return arguments[0].naturalWidth;", img)
            is_displayed = img.is_displayed()
            if is_displayed and natural_width == 0:
                report["broken_images"].append({"src": src[:100], "alt": alt})
        except Exception:
            pass

    # 3. Check horizontal overflow on mobile
    if mode == "mobile":
        try:
            scroll_width = driver.execute_script("return document.documentElement.scrollWidth;")
            client_width = driver.execute_script("return document.documentElement.clientWidth;")
            if scroll_width > client_width:
                report["horizontal_overflow"] = True
                print(f"  [!] HORIZONTAL OVERFLOW DETECTED: scrollWidth={scroll_width} > clientWidth={client_width}")
        except Exception:
            pass

    # 4. Specific checks on /collections
    if path == "/collections":
        # Check for category tabs
        # Find elements containing 'Browse Categories'
        try:
            # Check for "Festive Test Collection"
            page_text = driver.find_element(By.TAG_NAME, "body").text
            if "Festive Test Collection" in page_text or "Test Collection" in page_text:
                report["found_test_text"] = True
                print("  [!] Found 'Festive Test Collection' on /collections page!")
            
            # Check browse categories elements
            cat_spans_or_links = driver.find_elements(By.XPATH, "//div[contains(., 'Browse Categories') or contains(., 'BROWSE CATEGORIES')]//*[self::a or self::span][contains(@class, 'rounded-full') or contains(@class, 'rounded')]")
            report["category_tabs_found"] = len(cat_spans_or_links)
            links_count = 0
            for el in cat_spans_or_links:
                tag = el.tag_name
                href = el.get_attribute("href")
                if tag == "a" and href:
                    links_count += 1
            report["category_tabs_clickable"] = links_count
            print(f"  Category tabs found: {len(cat_spans_or_links)}, Clickable Links: {links_count}")
        except Exception as e:
            print(f"  Error checking /collections: {e}")

    return report

def audit_catalog_whatsapp_mobile(driver, token="bhavya-vip-summer-2026"):
    url = f"{BASE_URL}/catalog/{token}"
    print(f"\n--- Testing Catalog Mobile WhatsApp Flow at {url} ---")
    driver.get(url)
    time.sleep(2)
    
    result = {
        "url": url,
        "selected_item": False,
        "sticky_bar_visible": False,
        "sticky_bar_rect": None,
        "modal_opened": False,
        "whatsapp_button_in_viewport": False,
        "whatsapp_link": None,
        "viewport_height": 0
    }
    
    viewport_h = driver.execute_script("return window.innerHeight;")
    result["viewport_height"] = viewport_h
    
    # Try selecting a design
    try:
        # Look for size inputs or select buttons in DesignSelector
        inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='number']")
        if inputs:
            # Type 6 into first input
            first_input = inputs[0]
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_input)
            time.sleep(0.5)
            first_input.clear()
            first_input.send_keys("6")
            # Trigger change event
            driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", first_input)
            time.sleep(1)
            result["selected_item"] = True
            print("  Selected 6 pcs in first item.")
        else:
            print("  [!] No quantity inputs found!")
    except Exception as e:
        print(f"  Error selecting item: {e}")
        
    # Check sticky bar
    try:
        sticky_bar = driver.find_element(By.CSS_SELECTOR, "div.fixed.bottom-0")
        if sticky_bar.is_displayed():
            result["sticky_bar_visible"] = True
            rect = driver.execute_script("return arguments[0].getBoundingClientRect();", sticky_bar)
            result["sticky_bar_rect"] = rect
            print(f"  Sticky bar visible at top={rect.get('top')}, bottom={rect.get('bottom')}, height={rect.get('height')}")
            
            # Look for Send on WhatsApp button in the sticky bar
            wa_buttons = sticky_bar.find_elements(By.XPATH, ".//button[contains(., 'WhatsApp') or contains(., 'Send')]")
            if wa_buttons:
                print("  Clicking WhatsApp button in sticky bar...")
                driver.execute_script("arguments[0].click();", wa_buttons[0])
                time.sleep(1)
                
                # Check if modal opened
                modal = driver.find_elements(By.XPATH, "//div[contains(., 'Send Product Selection on WhatsApp') or contains(., 'Review & Share')]")
                if modal:
                    result["modal_opened"] = True
                    print("  WhatsApp Review Modal opened successfully!")
                    
                    # Find the WhatsApp send link/button inside modal
                    wa_links = driver.find_elements(By.XPATH, "//a[contains(@href, 'wa.me') or contains(@href, 'whatsapp.com')]")
                    if wa_links:
                        target_link = wa_links[0]
                        href = target_link.get_attribute("href")
                        result["whatsapp_link"] = href
                        
                        # Check bounding rect of this CTA button relative to viewport
                        btn_rect = driver.execute_script("return arguments[0].getBoundingClientRect();", target_link)
                        btn_top = btn_rect.get('top', 0)
                        btn_bottom = btn_rect.get('bottom', 0)
                        print(f"  WhatsApp CTA button bounding rect: top={btn_top}, bottom={btn_bottom}, viewport height={viewport_h}")
                        
                        # Is it within initial viewport without scrolling down a lot?
                        if 0 <= btn_top <= viewport_h:
                            result["whatsapp_button_in_viewport"] = True
                            print("  WhatsApp CTA is immediately visible in viewport! SUCCESS")
                        else:
                            print(f"  [!] WhatsApp CTA is BELOW VIEWPORT (top={btn_top} > {viewport_h})! User has to scroll down or slide down!")
    except Exception as e:
        print(f"  Error during mobile flow: {e}")
        
    return result

def main():
    pages_to_test = [
        "/",
        "/wholesale",
        "/collections",
        "/collections/3-piece-kurtis",
        "/collections/2-piece-kurtis",
        "/collections/coord-sets",
        "/collections/anarkalis-gowns",
        "/collections/single-kurtis",
        "/collections/western-midi",
        "/products",
        "/catalog/bhavya-vip-summer-2026",
        "/about",
        "/blog",
        "/contact",
    ]
    
    print("==================================================")
    print(" STARTING SELENIUM FULL-SITE AUDIT ")
    print("==================================================")
    
    results = {"desktop": [], "mobile": []}
    
    # 1. Desktop Audit
    driver = get_driver(mobile=False)
    try:
        for path in pages_to_test:
            res = audit_page(driver, path, mode="desktop")
            results["desktop"].append(res)
    finally:
        driver.quit()
        
    # 2. Mobile Audit
    driver_m = get_driver(mobile=True)
    try:
        for path in pages_to_test:
            res = audit_page(driver_m, path, mode="mobile")
            results["mobile"].append(res)
            
        # Catalog WhatsApp flow on mobile
        cat_res = audit_catalog_whatsapp_mobile(driver_m)
        results["catalog_mobile_flow"] = cat_res
    finally:
        driver_m.quit()
        
    with open("scripts/audit_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("\n==================================================")
    print(" AUDIT FINISHED - RESULTS SAVED TO scripts/audit_results.json")
    print("==================================================")

if __name__ == "__main__":
    main()
