from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import scrape_growjo
import os
    
from news_analyzer import NewsAnalyzer


app = Flask(__name__)
CORS(app) 

@app.route('/api/search', methods=['POST'])
def search_startup():
    data = request.json
    company_name = data.get('company_name')
    
    if not company_name:
        return jsonify({'error': 'Company name is required'}), 400
    
    try:
        url = f"https://growjo.com/company/{company_name.lower().replace(' ', '')}"
        scraped_data = scrape_growjo(url)
        return jsonify(scraped_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


news_analyzer = NewsAnalyzer()
@app.route('/api/news/<company_name>/<industry>')
def get_news_analysis(company_name, industry):
    try:
        analysis = news_analyzer.analyze_news(company_name, industry)
        if not analysis['company']['articles'] and not analysis['industry']['articles']:
            return jsonify({'error': 'No news articles found'}), 404
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)