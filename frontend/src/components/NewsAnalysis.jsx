import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Link,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Grid,
  Avatar
} from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import BusinessIcon from '@mui/icons-material/Business';
import { format } from 'date-fns';

const NewsAnalysis = ({ companyName, industry }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsAnalysis = async () => {
      if (!companyName || !industry) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5000/api/news/${encodeURIComponent(companyName)}/${encodeURIComponent(industry)}`
        );
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setAnalysis(data);
        }
      } catch (err) {
        setError('Failed to fetch news analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsAnalysis();
  }, [companyName, industry]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!analysis) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4,mt: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        News Analysis
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Company Sentiment */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">{companyName} Sentiment</Typography>
          </Box>
          <GaugeChart
            id="company-sentiment-gauge"
            percent={(analysis.company.average_sentiment + 1) / 2}
            colors={['#ff0000', '#ffff00', '#00ff00']}
            arcWidth={0.3}
            textColor="#000"
            needleColor="#345243"
            animate={false}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Chip 
              label={`Score: ${analysis.company.average_sentiment.toFixed(2)}`}
              color={
                analysis.company.prediction === 'positive' ? 'success' :
                analysis.company.prediction === 'negative' ? 'error' : 'warning'
              }
            />
            <Chip 
              label={`Prediction: ${analysis.company.prediction}`}
              variant="outlined"
              color={
                analysis.company.prediction === 'positive' ? 'success' :
                analysis.company.prediction === 'negative' ? 'error' : 'warning'
              }
            />
          </Box>
        </Grid>

        {/* Industry Sentiment */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NewspaperIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="h6">{industry} Industry Sentiment</Typography>
          </Box>
          <GaugeChart
            id="industry-sentiment-gauge"
            percent={(analysis.industry.average_sentiment + 1) / 2}
            colors={['#ff0000', '#ffff00', '#00ff00']}
            arcWidth={0.3}
            textColor="#000"
            needleColor="#345243"
            animate={false}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Chip 
              label={`Score: ${analysis.industry.average_sentiment.toFixed(2)}`}
              color={
                analysis.industry.prediction === 'positive' ? 'success' :
                analysis.industry.prediction === 'negative' ? 'error' : 'warning'
              }
            />
            <Chip 
              label={`Prediction: ${analysis.industry.prediction}`}
              variant="outlined"
              color={
                analysis.industry.prediction === 'positive' ? 'success' :
                analysis.industry.prediction === 'negative' ? 'error' : 'warning'
              }
            />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Company News */}
      <Typography variant="h6" gutterBottom>
        Recent News About {companyName}
      </Typography>
      {analysis.company.articles.length > 0 ? (
        <List dense>
          {analysis.company.articles.map((article, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ mb: 2 }}>
              <ListItemText
                primary={
                  <Link href={article.url} target="_blank" rel="noopener">
                    {article.title}
                  </Link>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block">
                      {format(new Date(article.published_at), 'MMM d, yyyy')} • {article.source}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {article.summary}
                    </Typography>
                    <Chip 
                      label={`Sentiment: ${article.sentiment.combined.toFixed(2)}`}
                      size="small"
                      sx={{ mt: 1 }}
                      color={
                        article.sentiment.combined > 0.1 ? 'success' :
                        article.sentiment.combined < -0.1 ? 'error' : 'warning'
                      }
                    />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No recent news found about {companyName}
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Industry News */}
      <Typography variant="h6" gutterBottom>
        {industry} Industry News
      </Typography>
      {analysis.industry.articles.length > 0 ? (
        <List dense>
          {analysis.industry.articles.map((article, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ mb: 2 }}>
              <ListItemText
                primary={
                  <Link href={article.url} target="_blank" rel="noopener">
                    {article.title}
                  </Link>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block">
                      {format(new Date(article.published_at), 'MMM d, yyyy')} • {article.source}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {article.summary}
                    </Typography>
                    <Chip 
                      label={`Sentiment: ${article.sentiment.combined.toFixed(2)}`}
                      size="small"
                      sx={{ mt: 1 }}
                      color={
                        article.sentiment.combined > 0.1 ? 'success' :
                        article.sentiment.combined < -0.1 ? 'error' : 'warning'
                      }
                    />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No recent news found about {industry} industry
        </Typography>
      )}
    </Paper>
  );
};

export default NewsAnalysis;