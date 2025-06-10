import os
import requests
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime, timedelta
from dotenv import load_dotenv
import nltk
from nltk.tokenize import sent_tokenize
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from newsapi import NewsApiClient

nltk.download('punkt')

load_dotenv()

class NewsAnalyzer:
    def __init__(self):
        self.newsapi = NewsApiClient(api_key=os.getenv('NEWSAPI_KEY'))
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.summarizer = LsaSummarizer()

    def fetch_news(self, query, days=20):
        """Fetch news articles using newsapi-python client"""
        from_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        try:
            response = self.newsapi.get_everything(
                q=query,
                from_param=from_date,
                language='en',
                sort_by='relevancy',
                page_size=10 
            )
            return response.get('articles', [])
        except Exception as e:
            print(f"NewsAPI error: {e}")
            return []

    def analyze_sentiment(self, text):
        """Analyze text sentiment with multiple methods"""
        blob = TextBlob(text)
        vader_score = self.sentiment_analyzer.polarity_scores(text)
        
        return {
            'textblob': blob.sentiment.polarity,
            'vader': vader_score['compound'],
            'combined': (blob.sentiment.polarity + vader_score['compound']) / 2
        }

    def generate_summary(self, text, sentences_count=3):
        """Generate summary using LSA algorithm"""
        parser = PlaintextParser.from_string(text, Tokenizer('english'))
        summary = self.summarizer(parser.document, sentences_count)
        return ' '.join([str(sentence) for sentence in summary])

    def analyze_news(self, company_name, industry):
        """Comprehensive news analysis"""

        company_news = self.fetch_news(company_name)

        industry_news = self.fetch_news(industry)
        

        company_results = []
        company_sentiments = []
        for article in company_news:
            content = article.get('content', '') or article.get('description', '')
            sentiment = self.analyze_sentiment(content)
            summary = self.generate_summary(content)
            
            company_results.append({
                'title': article['title'],
                'source': article['source']['name'],
                'url': article['url'],
                'published_at': article['publishedAt'],
                'sentiment': sentiment,
                'summary': summary
            })
            company_sentiments.append(sentiment['combined'])
        
        # Analyze industry news
        industry_results = []
        industry_sentiments = []
        for article in industry_news:
            content = article.get('content', '') or article.get('description', '')
            sentiment = self.analyze_sentiment(content)
            summary = self.generate_summary(content)
            
            industry_results.append({
                'title': article['title'],
                'source': article['source']['name'],
                'url': article['url'],
                'published_at': article['publishedAt'],
                'sentiment': sentiment,
                'summary': summary
            })
            industry_sentiments.append(sentiment['combined'])
        
        # Calculate average scores
        company_avg = sum(company_sentiments)/len(company_sentiments) if company_sentiments else 0
        industry_avg = sum(industry_sentiments)/len(industry_sentiments) if industry_sentiments else 0
        
        return {
            'company': {
                'articles': company_results,
                'average_sentiment': company_avg,
                'prediction': 'positive' if company_avg > 0.1 else 'negative' if company_avg < -0.1 else 'neutral'
            },
            'industry': {
                'articles': industry_results,
                'average_sentiment': industry_avg,
                'prediction': 'positive' if industry_avg > 0.1 else 'negative' if industry_avg < -0.1 else 'neutral'
            },
            'last_updated': datetime.utcnow().isoformat()
        }