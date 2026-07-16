import os
import json
import logging
from datetime import datetime
import urllib.parse

# Ensure logs and reports directories exist
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
LOGS_DIR = os.path.join(WORKSPACE_DIR, 'logs')
REPORTS_DIR = os.path.join(WORKSPACE_DIR, 'reports')

os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Setup Logging
log_filename = os.path.join(LOGS_DIR, f"scraper_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CropMedicUpdatePipeline")

# Import Scrapers
from fmcScraper import FMCScraper
from bayerScraper import BayerScraper
from syngentaScraper import SyngentaScraper
from suncropScraper import SuncropScraper

PRODUCTS_DB_PATH = os.path.join(WORKSPACE_DIR, 'data', 'products.json')
REPORT_PATH = os.path.join(REPORTS_DIR, 'update_report.json')

def load_current_database():
    """Loads current production products database."""
    if not os.path.exists(PRODUCTS_DB_PATH):
        logger.warning(f"Production database not found at {PRODUCTS_DB_PATH}. Initializing empty.")
        return {"products": []}
    try:
        with open(PRODUCTS_DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading products.json: {e}")
        return {"products": []}

def save_report(report_data):
    """Saves the update report to reports/update_report.json."""
    try:
        with open(REPORT_PATH, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Update report successfully written to {REPORT_PATH}")
    except Exception as e:
        logger.error(f"Failed writing update report: {e}")

def standardize_product_id(name, company):
    """Generates a clean, normalized, unique product ID."""
    norm_company = company.lower().split()[0]
    norm_name = name.lower().replace('-', '_').replace(' ', '_')
    clean_name = ''.join(c for c in norm_name if c.isalnum() or c == '_')
    return f"{norm_company}_{clean_name}"

def validate_product(product):
    """Validates the product fields: id, name, company, productType, and officialProductUrl."""
    required_fields = ['id', 'name', 'company', 'productType', 'officialProductUrl']
    for field in required_fields:
        if not product.get(field):
            logger.warning(f"Validation failed: Missing required field '{field}' in product: {product}")
            return False

    # URL Validation
    try:
        parsed = urllib.parse.urlparse(product['officialProductUrl'])
        if not parsed.scheme or not parsed.netloc:
            logger.warning(f"Validation failed: Invalid product URL: {product['officialProductUrl']}")
            return False
    except Exception:
        logger.warning(f"Validation failed: URL parse error: {product['officialProductUrl']}")
        return False

    return True

def merge_products(product_list):
    """Merges products sharing the same ID, aggregating crops and diseases."""
    merged = {}
    for p in product_list:
        p_id = p['id']
        if p_id not in merged:
            merged[p_id] = {
                "id": p_id,
                "name": p['name'].strip(),
                "company": p['company'].strip(),
                "companyName": p['company'].strip(),
                "productType": p['productType'].strip(),
                "activeIngredient": p.get('activeIngredient', '').strip(),
                "targetDiseases": list(set(p.get('supportedDiseases', []) + p.get('targetDiseases', []))),
                "targetCrops": list(set(p.get('supportedCrops', []) + p.get('targetCrops', []))),
                "officialProductUrl": p['officialProductUrl'].strip(),
                "notes": p.get('notes', '').strip()
            }
        else:
            merged[p_id]["targetDiseases"] = list(set(merged[p_id]["targetDiseases"] + p.get('supportedDiseases', []) + p.get('targetDiseases', [])))
            merged[p_id]["targetCrops"] = list(set(merged[p_id]["targetCrops"] + p.get('supportedCrops', []) + p.get('targetCrops', [])))
            if p.get('activeIngredient') and not merged[p_id]["activeIngredient"]:
                merged[p_id]["activeIngredient"] = p['activeIngredient']
            if p.get('notes') and p['notes'] not in merged[p_id]['notes']:
                merged[p_id]['notes'] += f" | {p['notes']}"
    return list(merged.values())

def run_pipeline():
    start_time = datetime.now()
    logger.info("Initializing Database Update Pipeline...")
    
    # 1. Load current database records
    current_db = load_current_database()
    current_products = {p['id']: p for p in current_db.get('products', [])}

    scrapers = {
        "FMC Pakistan": FMCScraper(),
        "Bayer Pakistan": BayerScraper(),
        "Syngenta Pakistan": SyngentaScraper(),
        "Suncrop Group": SuncropScraper()
    }
    
    raw_products = []
    failed_scrapers = []
    pages_visited = 0
    products_extracted = 0

    # 2. Run all scrapers and collect results
    for name, scraper in scrapers.items():
        try:
            logger.info(f"Running scraper for {name}...")
            pages_visited += 1
            scraped = scraper.scrape_products()
            
            if not scraped:
                logger.warning(f"[updateDatabase] Scraper for {name} returned 0 products. Retaining existing database records.")
                failed_scrapers.append(name)
                # Restore existing products for this company
                company_existing = [p for p in current_products.values() if p['company'].lower() == name.lower()]
                logger.info(f"[updateDatabase] Restored {len(company_existing)} existing database products for {name}.")
                for cp in company_existing:
                    raw_products.append({
                        "name": cp['name'],
                        "company": cp['company'],
                        "productType": cp['productType'],
                        "activeIngredient": cp.get('activeIngredient', ''),
                        "supportedCrops": cp.get('targetCrops', []),
                        "supportedDiseases": cp.get('targetDiseases', []),
                        "officialProductUrl": cp['officialProductUrl'],
                        "notes": cp.get('notes', '')
                    })
            else:
                products_extracted += len(scraped)
                raw_products.extend(scraped)
        except Exception as e:
            logger.error(f"Scraper for {name} encountered an unhandled exception: {e}")
            failed_scrapers.append(name)
            # Restore existing products for this company
            company_existing = [p for p in current_products.values() if p['company'].lower() == name.lower()]
            logger.info(f"[updateDatabase] Recovered {len(company_existing)} existing database products for failed scraper {name}.")
            for cp in company_existing:
                raw_products.append({
                    "name": cp['name'],
                    "company": cp['company'],
                    "productType": cp['productType'],
                    "activeIngredient": cp.get('activeIngredient', ''),
                    "supportedCrops": cp.get('targetCrops', []),
                    "supportedDiseases": cp.get('targetDiseases', []),
                    "officialProductUrl": cp['officialProductUrl'],
                    "notes": cp.get('notes', '')
                })

    # 3. Add IDs and validate
    validated_products = []
    for p in raw_products:
        p['id'] = standardize_product_id(p['name'], p['company'])
        if validate_product(p):
            validated_products.append(p)

    # 4. Merge duplicate records
    logger.info(f"Merging raw crawled products (extracted/retained: {len(validated_products)})...")
    final_crawled = merge_products(validated_products)
    logger.info(f"Merged into {len(final_crawled)} unique products.")

    added = []
    updated = []
    removed = []
    crawled_ids = set()

    for p in final_crawled:
        p_id = p['id']
        crawled_ids.add(p_id)

        if p_id not in current_products:
            added.append(p)
        else:
            # Compare fields to check for updates
            old = current_products[p_id]
            diff = {}
            for k in ['name', 'company', 'productType', 'activeIngredient', 'officialProductUrl', 'notes']:
                if old.get(k) != p.get(k):
                    diff[k] = {"old": old.get(k), "new": p.get(k)}
            if set(old.get('targetCrops', [])) != set(p.get('targetCrops', [])):
                diff['targetCrops'] = {"old": old.get('targetCrops', []), "new": p.get('targetCrops', [])}
            if set(old.get('targetDiseases', [])) != set(p.get('targetDiseases', [])):
                diff['targetDiseases'] = {"old": old.get('targetDiseases', []), "new": p.get('targetDiseases', [])}

            if diff:
                updated.append({"id": p_id, "changes": diff, "product": p})

    # Detect removed products (present in local DB but not returned in crawls)
    for old_id, old_p in current_products.items():
        if old_id not in crawled_ids:
            removed.append(old_p)

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    # 5. Build report structure
    report = {
        "timestamp": end_time.isoformat(),
        "duration_seconds": duration,
        "pages_visited": pages_visited,
        "products_extracted": products_extracted,
        "products_merged": len(final_crawled),
        "failed_scrapers": failed_scrapers,
        "added": added,
        "updated": updated,
        "removed": removed
    }

    # 6. Save update report JSON
    save_report(report)

    # 7. Print summary
    logger.info("=========================================")
    logger.info("          RUN REPORT SUMMARY")
    logger.info("=========================================")
    logger.info(f"Failed/Skipped Scrapers : {len(failed_scrapers)} ({', '.join(failed_scrapers) if failed_scrapers else 'None'})")
    logger.info(f"Products Added          : {len(added)}")
    logger.info(f"Products Updated        : {len(updated)}")
    logger.info(f"Products Removed        : {len(removed)}")
    logger.info(f"Logs written to         : {log_filename}")
    logger.info("=========================================")

    if not added and not updated and not removed:
        logger.info("Database matches crawled catalogs. No updates needed.")
        return

    try:
        confirm = input("\nWould you like to copy the updates to products.json? (yes/no): ").strip().lower()
        if confirm in ['y', 'yes']:
            new_products_list = []
            for p_id, p in current_products.items():
                if p_id not in crawled_ids:
                    continue
                if p_id in [u['id'] for u in updated]:
                    continue
                new_products_list.append(p)

            for p in final_crawled:
                new_products_list.append(p)

            with open(PRODUCTS_DB_PATH, 'w', encoding='utf-8') as f:
                json.dump({"products": new_products_list}, f, indent=2, ensure_ascii=False)
            logger.info("Production products.json successfully updated.")
        else:
            logger.info("Database update aborted. Only update_report.json was generated.")
    except Exception as e:
        logger.info(f"Interactive prompt skipped or aborted: {e}")

if __name__ == '__main__':
    run_pipeline()
