import os
import tweepy
import praw
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from collections import defaultdict
import re
from datetime import datetime, timedelta

# Initialize sentiment analyzers
vader = SentimentIntensityAnalyzer()

def clean_text(text):
    """Clean text for sentiment analysis"""
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)  # Remove URLs
    text = re.sub(r'\@\w+|\#\w+', '', text)  # Remove mentions and hashtags
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    return text.strip()

def analyze_sentiment(text):
    """Get comprehensive sentiment analysis"""
    cleaned_text = clean_text(text)
    
    # TextBlob analysis
    blob = TextBlob(cleaned_text)
    textblob_sentiment = {
        'polarity': blob.sentiment.polarity,
        'subjectivity': blob.sentiment.subjectivity
    }
    
    # VADER analysis
    vader_sentiment = vader.polarity_scores(cleaned_text)
    
    # Combined score (weighted average)
    combined_score = (blob.sentiment.polarity + vader_sentiment['compound']) / 2
    
    return {
        'text': text,
        'textblob': textblob_sentiment,
        'vader': vader_sentiment,
        'combined_score': combined_score,
        'sentiment': 'positive' if combined_score > 0.1 else 'negative' if combined_score < -0.1 else 'neutral'
    }

class SocialMediaSentiment:
    def __init__(self):
        # Initialize APIs with environment variables
        self.twitter_auth = tweepy.AppAuthHandler(
            os.getenv('TWITTER_API_KEY'),
            os.getenv('TWITTER_API_SECRET')
        )
        self.twitter_api = tweepy.API(self.twitter_auth)
        
        self.reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent="startup_sentiment_analysis/1.0"
        )
    
    def get_twitter_data(self, company_name, limit=100):
        """Fetch tweets about the company"""
        try:
            tweets = []
            for tweet in tweepy.Cursor(self.twitter_api.search_tweets,
                                     q=f"{company_name} -filter:retweets",
                                     lang="en",
                                     tweet_mode='extended',
                                     since=datetime.now() - timedelta(days=7)).items(limit):
                tweets.append({
                    'text': tweet.full_text,
                    'created_at': tweet.created_at.isoformat(),
                    'source': 'twitter'
                })
            return tweets
        except Exception as e:
            print(f"Twitter API error: {e}")
            return []

    def get_reddit_data(self, company_name, limit=50):
        """Fetch Reddit posts and comments about the company"""
        try:
            content = []
            for submission in self.reddit.subreddit('all').search(company_name, limit=limit):
                content.append({
                    'text': submission.title,
                    'created_at': datetime.utcfromtimestamp(submission.created_utc).isoformat(),
                    'source': 'reddit'
                })
                
                submission.comments.replace_more(limit=0)
                for comment in submission.comments.list():
                    content.append({
                        'text': comment.body,
                        'created_at': datetime.utcfromtimestamp(comment.created_utc).isoformat(),
                        'source': 'reddit'
                    })
            return content
        except Exception as e:
            print(f"Reddit API error: {e}")
            return []

    def analyze_company(self, company_name):
        """Comprehensive sentiment analysis for a company"""
        # Get data from both sources
        twitter_data = self.get_twitter_data(company_name)
        reddit_data = self.get_reddit_data(company_name)
        all_data = twitter_data + reddit_data
        
        if not all_data:
            return None
        
        # Analyze sentiment for each item
        analyzed_data = []
        for item in all_data:
            analysis = analyze_sentiment(item['text'])
            analyzed_data.append({
                **item,
                **analysis
            })
        
        # Generate summary statistics
        total_items = len(analyzed_data)
        positive = sum(1 for item in analyzed_data if item['sentiment'] == 'positive')
        negative = sum(1 for item in analyzed_data if item['sentiment'] == 'negative')
        neutral = total_items - positive - negative
        
        # Calculate average scores
        avg_combined = sum(item['combined_score'] for item in analyzed_data) / total_items
        avg_polarity = sum(item['textblob']['polarity'] for item in analyzed_data) / total_items
        
        # Extract common themes
        common_words = self.extract_common_themes(analyzed_data)
        
        # Generate representative quotes
        top_positive = self.get_representative_quotes(analyzed_data, 'positive')
        top_negative = self.get_representative_quotes(analyzed_data, 'negative')
        
        return {
            'company_name': company_name,
            'total_mentions': total_items,
            'sentiment_distribution': {
                'positive': positive,
                'negative': negative,
                'neutral': neutral
            },
            'average_scores': {
                'combined': avg_combined,
                'polarity': avg_polarity
            },
            'common_themes': common_words,
            'representative_quotes': {
                'positive': top_positive,
                'negative': top_negative
            },
            'raw_data': analyzed_data[:10]  # Sample of raw data
        }
    
    def extract_common_themes(self, data, top_n=5):
        """Extract most common words from the data"""
        from collections import Counter
        words = []
        for item in data:
            tokens = clean_text(item['text']).lower().split()
            words.extend([token for token in tokens if len(token) > 3 and token not in ['this', 'that', 'they', 'their']])
        
        return [word for word, count in Counter(words).most_common(top_n)]
    
    def get_representative_quotes(self, data, sentiment, top_n=3):
        """Get most representative quotes for a sentiment"""
        filtered = [item for item in data if item['sentiment'] == sentiment]
        sorted_items = sorted(filtered, key=lambda x: abs(x['combined_score']), reverse=True)
        return [{
            'text': item['text'],
            'score': item['combined_score'],
            'source': item['source']
        } for item in sorted_items[:top_n]]