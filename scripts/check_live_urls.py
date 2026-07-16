import os
import json
import time
import logging
from datetime import datetime
import urllib.parse
import requests
from urllib3.util import Retry
from requests.adapters import HTTPAdapter

# Setup directory paths relative to the script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
DATA_DIR = os.path.join(WORKSPACE_DIR, 'data')
REPORTS_DIR = os.path.join(WORKSPACE_DIR, 'reports')
LOGS_DIR = os.path.join(WORKSPACE_DIR, 'logs')

os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Configure Logging
log_filename = os.path.join(LOGS_DIR, f"url_checker_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CropMedicUrlChecker")

PRODUCTS_DB_PATH = os.path.join(DATA_DIR, 'products.json')
REPORT_PATH = os.path.join(REPORTS_DIR, 'live_urls_report.json')

def load_products():
    """Loads products from products.json database."""
    if not os.path.exists(PRODUCTS_DB_PATH):
        logger.error(f"Products database not found at: {PRODUCTS_DB_PATH}")
        return []
    try:
        with open(PRODUCTS_DB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('products', [])
    except Exception as e:
        logger.error(f"Failed to read products database: {e}")
        return []

def init_session(max_retries=2, timeout=8):
    """Configures requests Session with browser-like headers and retry logic."""
    session = requests.Session()
    retries = Retry(
        total=max_retries,
        backoff_factor=0.5,
        status_forcelist=[500, 502, 503, 504],
        raise_on_status=False
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    session.headers.update({
        "User-Agent": "CropMedicDeveloperPipeline/1.0 (+support@cropmedic.ai; link-auditor)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    })
    return session

def check_urls():
    logger.info("Initializing Product Live URL Verification...")
    products = load_products()
    if not products:
        logger.error("No products loaded. Exiting.")
        return

    # Map URLs to the products that use them
    url_to_products = {}
    for p in products:
        url = p.get('officialProductUrl', '').strip()
        if not url:
            logger.warning(f"Product '{p.get('name')}' (ID: {p.get('id')}) is missing officialProductUrl.")
            continue
        if url not in url_to_products:
            url_to_products[url] = []
        url_to_products[url].append({
            "id": p.get('id'),
            "name": p.get('name'),
            "company": p.get('company')
        })

    total_urls = len(url_to_products)
    logger.info(f"Loaded {len(products)} products with {total_urls} unique URLs to check.")

    session = init_session()
    results = []
    
    working_count = 0
    redirected_count = 0
    broken_count = 0
    connection_error_count = 0

    for idx, (url, linked_prods) in enumerate(url_to_products.items(), 1):
        logger.info(f"[{idx}/{total_urls}] Checking URL: {url}")
        
        # Enforce rate limiting delay between checks
        time.sleep(0.5)

        status_info = {
            "url": url,
            "linked_products": linked_prods,
            "status": "Unknown",
            "status_code": None,
            "error_detail": None,
            "final_destination": None
        }

        try:
            # We use allow_redirects=True to find the final landing page but track history
            response = session.get(url, timeout=8, allow_redirects=True)
            status_code = response.status_code
            status_info["status_code"] = status_code
            status_info["final_destination"] = response.url

            # Check if there were redirects
            has_redirects = len(response.history) > 0
            
            if 200 <= status_code < 300:
                if has_redirects:
                    status_info["status"] = "Redirected (OK)"
                    redirected_count += 1
                    logger.info(f"  -> Result: REDIRECTED to {response.url} (Status: {status_code})")
                else:
                    status_info["status"] = "OK"
                    working_count += 1
                    logger.info(f"  -> Result: OK (Status: {status_code})")
            else:
                status_info["status"] = "Broken"
                broken_count += 1
                logger.warning(f"  -> Result: BROKEN (Status: {status_code})")
                
        except requests.exceptions.Timeout:
            status_info["status"] = "Timeout"
            status_info["error_detail"] = "Request timed out after 8 seconds."
            broken_count += 1
            logger.error("  -> Result: TIMEOUT")
        except requests.exceptions.SSLError as ssl_err:
            status_info["status"] = "SSL Error"
            status_info["error_detail"] = str(ssl_err)
            broken_count += 1
            logger.error(f"  -> Result: SSL ERROR - {ssl_err}")
        except requests.exceptions.ConnectionError as conn_err:
            status_info["status"] = "Connection Error"
            status_info["error_detail"] = "Failed to resolve domain name or establish connection."
            connection_error_count += 1
            logger.error(f"  -> Result: CONNECTION ERROR (Domain name resolution or handshake failed)")
        except Exception as e:
            status_info["status"] = "Unhandled Exception"
            status_info["error_detail"] = str(e)
            broken_count += 1
            logger.error(f"  -> Result: ERROR - {e}")

        results.append(status_info)

    # Compile report structure
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_urls_checked": total_urls,
            "working_urls": working_count,
            "redirected_urls": redirected_count,
            "broken_urls": broken_count,
            "connection_errors": connection_error_count
        },
        "url_details": results
    }

    # Save to report path
    try:
        with open(REPORT_PATH, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        logger.info(f"Link checking report written successfully to: {REPORT_PATH}")
    except Exception as e:
        logger.error(f"Failed to write report file: {e}")

    # Log Terminal Summary
    logger.info("=========================================")
    logger.info("          LINK AUDIT SUMMARY")
    logger.info("=========================================")
    logger.info(f"Total Unique URLs Checked : {total_urls}")
    logger.info(f"Working Links (200 OK)    : {working_count}")
    logger.info(f"Redirected Links          : {redirected_count}")
    logger.info(f"Broken Links (HTTP errs)  : {broken_count}")
    logger.info(f"Connection Errors (DNS)   : {connection_error_count}")
    logger.info(f"Log written to            : {log_filename}")
    logger.info("=========================================")

    # Alert on broken links
    total_failures = broken_count + connection_error_count
    if total_failures > 0:
        logger.warning(f"ACTION REQUIRED: Found {total_failures} unreachable/broken product links.")
    else:
        logger.info("All scanned product URLs are healthy and active.")

if __name__ == '__main__':
    check_urls()
