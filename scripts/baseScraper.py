import time
import logging
import urllib.parse
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

class BaseScraper:
    """
    Base class for agricultural web scrapers.
    Handles HTTP session configuration, request retries, rate limiting, and domain boundaries.
    """
    def __init__(self, allowed_domain, company_name, timeout=10, rate_limit_delay=1.0, max_retries=3):
        self.allowed_domain = allowed_domain
        self.company_name = company_name
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries
        self.headers = {
            "User-Agent": "CropMedicDeveloperPipeline/1.0 (+support@cropmedic.ai; dev-mode)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
        self.logger = logging.getLogger("CropMedicUpdatePipeline")
        self.session = self._init_session()

    def _init_session(self):
        """Initializes a requests.Session with connection pooling and custom retry logic."""
        session = requests.Session()
        retries = Retry(
            total=self.max_retries,
            backoff_factor=1.0,
            status_forcelist=[500, 502, 503, 504],
            raise_on_status=False
        )
        adapter = HTTPAdapter(max_retries=retries)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    def is_valid_url(self, url):
        """Validates that a URL is well-formed and resides within the allowed domain boundary."""
        if not url:
            return False
        try:
            parsed = urllib.parse.urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return False
            # Check domain restriction
            if self.allowed_domain.lower() not in parsed.netloc.lower():
                return False
            return True
        except Exception:
            return False

    def fetch_url(self, url):
        """Fetches page content with rate-limiting delay, timeout rules, and exception safety."""
        if not self.is_valid_url(url):
            self.logger.error(f"[{self.company_name}] Access blocked: URL '{url}' is outside domain boundary '{self.allowed_domain}'")
            return None

        # Rate limiting: wait before making request
        time.sleep(self.rate_limit_delay)

        try:
            self.logger.info(f"[{self.company_name}] Requesting: {url}")
            response = self.session.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            self.logger.error(f"[{self.company_name}] Connection error fetching {url}: {e}")
            return None

    def scrape_products(self):
        """Abstract method to be implemented by child company scraper classes."""
        raise NotImplementedError("Child scrapers must implement the scrape_products() method.")
