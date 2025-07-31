import asyncio
import aiohttp
import logging
from typing import Dict, List, Optional, Any
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse

class WebScraper:
    """Web scraping component for AGENT internet access"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(headers=self.headers)
        return self.session
    
    async def search_and_scrape(self, query: str, domain: str) -> List[Dict[str, Any]]:
        """Search for information and scrape relevant content"""
        try:
            # Simulate search results (in production, use actual search APIs)
            search_urls = await self._get_search_urls(query, domain)
            
            # Scrape content from URLs
            scraped_content = []
            for url in search_urls[:3]:  # Limit to top 3 results
                content = await self._scrape_url(url)
                if content:
                    scraped_content.append(content)
            
            return scraped_content
            
        except Exception as e:
            self.logger.error(f"Error in search and scrape: {e}")
            return []
    
    async def _get_search_urls(self, query: str, domain: str) -> List[str]:
        """Get search URLs based on query and domain"""
        # Domain-specific URL patterns
        domain_urls = {
            "developer": [
                "https://stackoverflow.com/search?q=" + query.replace(" ", "+"),
                "https://github.com/search?q=" + query.replace(" ", "+"),
                "https://developer.mozilla.org/en-US/search?q=" + query.replace(" ", "+")
            ],
            "trader": [
                "https://finance.yahoo.com/quote/" + query.upper() if len(query) <= 5 else "https://finance.yahoo.com/",
                "https://www.investopedia.com/search?q=" + query.replace(" ", "+"),
                "https://www.marketwatch.com/search?q=" + query.replace(" ", "+")
            ],
            "lawyer": [
                "https://www.law.cornell.edu/search/site/" + query.replace(" ", "%20"),
                "https://www.justia.com/search?cx=" + query.replace(" ", "+"),
                "https://www.findlaw.com/search?query=" + query.replace(" ", "+")
            ]
        }
        
        return domain_urls.get(domain, [
            f"https://www.google.com/search?q={query.replace(' ', '+')}",
            f"https://en.wikipedia.org/wiki/Special:Search/{query.replace(' ', '_')}",
            f"https://duckduckgo.com/?q={query.replace(' ', '+')}"
        ])
    
    async def _scrape_url(self, url: str) -> Optional[Dict[str, Any]]:
        """Scrape content from a single URL"""
        try:
            session = await self.get_session()
            
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract title
                    title = soup.find('title')
                    title_text = title.get_text().strip() if title else "No title"
                    
                    # Extract main content
                    content = self._extract_main_content(soup)
                    
                    # Clean and limit content
                    clean_content = self._clean_text(content)[:1000]
                    
                    return {
                        "url": url,
                        "title": title_text,
                        "content": clean_content,
                        "scraped_at": asyncio.get_event_loop().time()
                    }
                    
        except Exception as e:
            self.logger.error(f"Error scraping {url}: {e}")
            return None
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from HTML"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "header", "footer"]):
            script.decompose()
        
        # Try to find main content areas
        main_selectors = [
            'main', 'article', '.content', '#content', 
            '.post-content', '.entry-content', '.article-body'
        ]
        
        for selector in main_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                return main_content.get_text()
        
        # Fallback to body content
        body = soup.find('body')
        return body.get_text() if body else soup.get_text()
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', '', text)
        
        return text.strip()
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
