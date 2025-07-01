import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Grid,
} from "@mui/material";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import TwitterIcon from "@mui/icons-material/Twitter";
import RedditIcon from "@mui/icons-material/Reddit";
import GaugeChart from "react-gauge-chart";

const SentimentAnalysis = ({ companyName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      if (!companyName) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5000/api/sentiment/${encodeURIComponent(
            companyName
          )}`
        );
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setAnalysis(data);
        }
      } catch (err) {
        setError("Failed to fetch sentiment data");
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [companyName]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!analysis) return null;

  // Convert sentiment score from -1 to 1 range to 0-100 for gauge
  const gaugePercent = (analysis.average_scores.combined + 1) / 2;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Consumer Sentiment Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Sentiment Gauge */}
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: "center" }}>
            <GaugeChart
              id="sentiment-gauge"
              percent={gaugePercent}
              colors={["#ff0000", "#ffff00", "#00ff00"]}
              arcWidth={0.3}
              textColor="#000"
              needleColor="#345243"
              animate={false}
              style={{ width: "100%" }}
            />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Average Sentiment: {analysis.average_scores.combined.toFixed(2)}
            </Typography>
            <Typography variant="caption" display="block">
              (-1 = Negative, 0 = Neutral, 1 = Positive)
            </Typography>
          </Box>
        </Grid>

        {/* Sentiment Distribution */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Sentiment Distribution
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <SentimentVerySatisfiedIcon color="success" sx={{ mr: 1 }} />
            <Typography sx={{ flexGrow: 1 }}>
              Positive: {analysis.sentiment_distribution.positive}
            </Typography>
            <Chip
              label={`${(
                (analysis.sentiment_distribution.positive /
                  analysis.total_mentions) *
                100
              ).toFixed(1)}%`}
              size="small"
            />
          </Box>
          <Box display="flex" alignItems="center" mb={1}>
            <SentimentNeutralIcon color="warning" sx={{ mr: 1 }} />
            <Typography sx={{ flexGrow: 1 }}>
              Neutral: {analysis.sentiment_distribution.neutral}
            </Typography>
            <Chip
              label={`${(
                (analysis.sentiment_distribution.neutral /
                  analysis.total_mentions) *
                100
              ).toFixed(1)}%`}
              size="small"
            />
          </Box>
          <Box display="flex" alignItems="center">
            <SentimentVeryDissatisfiedIcon color="error" sx={{ mr: 1 }} />
            <Typography sx={{ flexGrow: 1 }}>
              Negative: {analysis.sentiment_distribution.negative}
            </Typography>
            <Chip
              label={`${(
                (analysis.sentiment_distribution.negative /
                  analysis.total_mentions) *
                100
              ).toFixed(1)}%`}
              size="small"
            />
          </Box>
        </Grid>

        {/* Common Themes */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Common Themes
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {analysis.common_themes.map((theme, index) => (
              <Chip key={index} label={theme} variant="outlined" />
            ))}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Representative Quotes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Positive Feedback
          </Typography>
          <List dense>
            {analysis.representative_quotes.positive.map((quote, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ mb: 1 }}>
                <Avatar sx={{ bgcolor: "success.light", mr: 2 }}>
                  {quote.source === "twitter" ? (
                    <TwitterIcon />
                  ) : (
                    <RedditIcon />
                  )}
                </Avatar>
                <ListItemText
                  primary={quote.text}
                  secondary={`Score: ${quote.score.toFixed(2)} | Source: ${
                    quote.source
                  }`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Negative Feedback
          </Typography>
          <List dense>
            {analysis.representative_quotes.negative.map((quote, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ mb: 1 }}>
                <Avatar sx={{ bgcolor: "error.light", mr: 2 }}>
                  {quote.source === "twitter" ? (
                    <TwitterIcon />
                  ) : (
                    <RedditIcon />
                  )}
                </Avatar>
                <ListItemText
                  primary={quote.text}
                  secondary={`Score: ${quote.score.toFixed(2)} | Source: ${
                    quote.source
                  }`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SentimentAnalysis;
