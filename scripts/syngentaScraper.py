import os
import json
from bs4 import BeautifulSoup
from baseScraper import BaseScraper

class SyngentaScraper(BaseScraper):
    """
    Scraper for Syngenta Pakistan product directories.
    Only extracts real data from the live website; returns empty list if blocked/offline.
    """
    def __init__(self, timeout=10, rate_limit_delay=1.0):
        super().__init__(
            allowed_domain="www.syngenta.com.pk",
            company_name="Syngenta Pakistan",
            timeout=timeout,
            rate_limit_delay=rate_limit_delay
        )
        self.start_url = "https://www.syngenta.com.pk/products/crop-protection/fungicides"
        self.output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_syngenta_products.json")

    def scrape_products(self):
        self.logger.info(f"[{self.company_name}] Starting live scraping from: {self.start_url}")
        html = self.fetch_url(self.start_url)

        if not html:
            self.logger.error(f"[{self.company_name}] Could not retrieve products listing page. Live scraping failed.")
            return []

        products = []
        try:
            soup = BeautifulSoup(html, 'html.parser')
            items = soup.find_all('div', class_='product-teaser')
            
            for item in items:
                try:
                    title_elem = item.find('h3', class_='title')
                    url_elem = item.find('a', href=True)
                    desc_elem = item.find('div', class_='description')

                    if title_elem and url_elem:
                        name = title_elem.text.strip()
                        product_url = url_elem['href']
                        if not product_url.startswith('http'):
                            product_url = f"https://www.syngenta.com.pk{product_url}"

                        desc = desc_elem.text.strip() if desc_elem else ""

                        products.append({
                            "name": name,
                            "company": self.company_name,
                            "productType": "Fungicide",
                            "activeIngredient": "Unknown",
                            "supportedCrops": [],
                            "supportedDiseases": [],
                            "officialProductUrl": product_url,
                            "notes": desc
                        })
                except Exception as e:
                    self.logger.error(f"[{self.company_name}] Error parsing element: {e}")
        except Exception as e:
            self.logger.error(f"[{self.company_name}] Failed parsing HTML: {e}")

        if products:
            try:
                with open(self.output_path, "w", encoding="utf-8") as f:
                    json.dump(products, f, indent=2, ensure_ascii=False)
                self.logger.info(f"[{self.company_name}] Saved {len(products)} scraped products to {self.output_path}")
            except Exception as e:
                self.logger.error(f"[{self.company_name}] Failed to save temp JSON file: {e}")

        return products
