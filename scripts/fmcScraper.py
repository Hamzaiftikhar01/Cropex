import os
import json
from bs4 import BeautifulSoup
from baseScraper import BaseScraper

class FMCScraper(BaseScraper):
    """
    Real live scraper for FMC Pakistan product directories.
    """
    def __init__(self, timeout=10, rate_limit_delay=1.0):
        super().__init__(
            allowed_domain="ag.fmc.com",
            company_name="FMC Pakistan",
            timeout=timeout,
            rate_limit_delay=rate_limit_delay
        )
        self.category_urls = [
            "https://ag.fmc.com/pk/en/products/fungicides",
            "https://ag.fmc.com/pk/en/products/insecticides-miticides"
        ]
        self.output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_fmc_products.json")

    def scrape_products(self):
        self.logger.info(f"[{self.company_name}] Starting live scraping...")
        detail_links = []

        for start_url in self.category_urls:
            self.logger.info(f"[{self.company_name}] Indexing listing page: {start_url}")
            html = self.fetch_url(start_url)
            if not html:
                self.logger.warning(f"[{self.company_name}] Could not retrieve directory page: {start_url}")
                continue

            try:
                soup = BeautifulSoup(html, 'html.parser')
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    # Look for details pages under fungicides or insecticides
                    if any(x in href for x in ['/products/fungicides/', '/products/insecticides/', '/products/insecticides-miticides/']):
                        full_url = f"https://ag.fmc.com{href}" if href.startswith('/') else href
                        detail_links.append(full_url)
            except Exception as e:
                self.logger.error(f"[{self.company_name}] Error parsing index page: {e}")

        # De-duplicate links
        detail_links = list(set(detail_links))
        self.logger.info(f"[{self.company_name}] Discovered {len(detail_links)} product pages to crawl.")

        products = []
        crops_list = ["Tomato", "Potato", "Rice", "Wheat", "Cotton", "Maize", "Onion", "Chili", "Sugarcane"]
        diseases_list = ["Blight", "Rust", "Smut", "Blast", "Anthracnose", "Purple Blotch", "Red Rot", "Leaf Curl", "Downy Mildew", "Powdery Mildew"]

        # Crawl each detail page
        for detail_url in detail_links:
            self.logger.info(f"[{self.company_name}] Crawling product detail page: {detail_url}")
            detail_html = self.fetch_url(detail_url)
            if not detail_html:
                self.logger.warning(f"[{self.company_name}] Skipping detail page {detail_url} due to fetch error.")
                continue

            try:
                detail_soup = BeautifulSoup(detail_html, 'html.parser')
                
                # Extract Title/Name
                h1_elem = detail_soup.find('h1')
                if not h1_elem:
                    self.logger.warning(f"[{self.company_name}] H1 title element not found at {detail_url}. Skipping.")
                    continue

                name = h1_elem.text.strip().replace('®', '').replace('™', '').strip()
                if not name:
                    continue

                # Determine product type based on path
                product_type = "Fungicide"
                if "insecticide" in detail_url or "insecticide" in name.lower():
                    product_type = "Insecticide"

                # Extract Active Ingredient (AI)
                active_ingredient = "Unknown"
                for tag in ['div', 'p', 'span', 'td']:
                    for elem in detail_soup.find_all(tag):
                        txt = elem.text.strip()
                        if 'AI:' in txt:
                            parts = txt.split('AI:')
                            if len(parts) > 1:
                                active_ingredient = parts[1].split('\n')[0].strip()
                                break
                        elif 'Active Ingredient:' in txt:
                            parts = txt.split('Active Ingredient:')
                            if len(parts) > 1:
                                active_ingredient = parts[1].split('\n')[0].strip()
                                break
                    if active_ingredient != "Unknown":
                        break

                # Extract Crop/Disease targeting by text matching
                full_text = detail_soup.text
                supported_crops = [crop for crop in crops_list if crop.lower() in full_text.lower()]
                supported_diseases = [disease for disease in diseases_list if disease.lower() in full_text.lower()]

                # Extract first paragraph as description fallback
                desc = ""
                desc_div = detail_soup.find('div', class_='field--name-body')
                if desc_div:
                    desc = desc_div.text.strip()
                else:
                    paragraphs = [p.text.strip() for p in detail_soup.find_all('p') if len(p.text.strip()) > 20]
                    if paragraphs:
                        desc = paragraphs[0]

                products.append({
                    "name": name,
                    "company": self.company_name,
                    "productType": product_type,
                    "activeIngredient": active_ingredient,
                    "supportedCrops": supported_crops,
                    "supportedDiseases": supported_diseases,
                    "officialProductUrl": detail_url,
                    "notes": desc[:300] + "..." if len(desc) > 300 else desc
                })

            except Exception as e:
                self.logger.error(f"[{self.company_name}] Exception parsing product {detail_url}: {e}")

        # Save to temporary JSON
        if products:
            try:
                with open(self.output_path, "w", encoding="utf-8") as f:
                    json.dump(products, f, indent=2, ensure_ascii=False)
                self.logger.info(f"[{self.company_name}] Saved {len(products)} scraped products to {self.output_path}")
            except Exception as e:
                self.logger.error(f"[{self.company_name}] Failed to save temp JSON file: {e}")
        else:
            self.logger.warning(f"[{self.company_name}] Zero live products extracted.")

        return products
