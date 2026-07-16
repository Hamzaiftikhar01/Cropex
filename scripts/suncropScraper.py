import os
import json
from bs4 import BeautifulSoup
from baseScraper import BaseScraper

class SuncropScraper(BaseScraper):
    """
    Real live scraper for Suncrop Group product directories.
    """
    def __init__(self, timeout=10, rate_limit_delay=1.0):
        super().__init__(
            allowed_domain="www.suncropgroup.com",
            company_name="Suncrop Group",
            timeout=timeout,
            rate_limit_delay=rate_limit_delay
        )
        self.category_urls = [
            "https://www.suncropgroup.com/product-category/fungicides/",
            "https://www.suncropgroup.com/product-category/insecticides/"
        ]
        self.output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_suncrop_products.json")

    def scrape_products(self):
        self.logger.info(f"[{self.company_name}] Starting live category scraping...")
        detail_links = []

        # Discover product URLs from each category listing
        for start_url in self.category_urls:
            self.logger.info(f"[{self.company_name}] Indexing listing page: {start_url}")
            html = self.fetch_url(start_url)
            if not html:
                self.logger.warning(f"[{self.company_name}] Could not retrieve directory: {start_url}")
                continue

            try:
                soup = BeautifulSoup(html, 'html.parser')
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if '/product/' in href:
                        detail_links.append(href)
            except Exception as e:
                self.logger.error(f"[{self.company_name}] Error parsing index page: {e}")

        # De-duplicate links
        detail_links = list(set(detail_links))
        self.logger.info(f"[{self.company_name}] Discovered {len(detail_links)} product pages to crawl.")

        products = []
        crops_list = ["Tomato", "Potato", "Rice", "Wheat", "Cotton", "Maize", "Onion", "Chili", "Sugarcane"]
        diseases_list = ["Blight", "Rust", "Smut", "Blast", "Anthracnose", "Purple Blotch", "Red Rot", "Leaf Curl", "Downy Mildew", "Powdery Mildew"]
        
        known_ais = [
            "Azoxystrobin", "Difenoconazole", "Copper Oxychloride", "Tebuconazole",
            "Trifloxystrobin", "Propiconazole", "Propineb", "Metalaxyl", "Chlorothalonil",
            "Lufenuron", "Imidacloprid", "Acetamiprid", "Fipronil", "Emamectin", "Abamectin",
            "Bifenthrin", "Diafenthiuron", "Buprofezin", "Spirotetramat"
        ]

        # Crawl each detail page
        for detail_url in detail_links:
            self.logger.info(f"[{self.company_name}] Crawling product detail page: {detail_url}")
            detail_html = self.fetch_url(detail_url)
            if not detail_html:
                self.logger.warning(f"[{self.company_name}] Skipping detail page {detail_url} due to fetch error.")
                continue

            try:
                detail_soup = BeautifulSoup(detail_html, 'html.parser')
                
                # Extract Title
                h1_elem = detail_soup.find('h1')
                if not h1_elem:
                    self.logger.warning(f"[{self.company_name}] H1 title element not found at {detail_url}. Skipping.")
                    continue

                name = h1_elem.text.strip().replace('®', '').replace('™', '').strip()
                if not name:
                    continue

                # Determine product type based on URL or description keywords
                product_type = "Fungicide"
                if "insecticides" in detail_url or "insect" in name.lower() or "insecticide" in detail_soup.text.lower():
                    product_type = "Insecticide"

                # Extract Active Ingredient via text matching
                full_text = detail_soup.text
                found_ais = []
                for ai in known_ais:
                    if ai.lower() in full_text.lower():
                        found_ais.append(ai)
                active_ingredient = " + ".join(found_ais) if found_ais else "Unknown"

                # Extract Description
                desc = ""
                desc_elem = detail_soup.find('div', class_='elementor-widget-woocommerce-product-content')
                if desc_elem:
                    desc = desc_elem.text.strip()
                else:
                    # Fallbacks
                    for class_name in ['summary', 'woocommerce-product-details__short-description', 'entry-summary']:
                        e = detail_soup.find('div', class_=class_name)
                        if e:
                            desc = e.text.strip()
                            break

                # Extract Crop/Disease targeting
                supported_crops = [crop for crop in crops_list if crop.lower() in full_text.lower()]
                supported_diseases = [disease for disease in diseases_list if disease.lower() in full_text.lower()]

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
