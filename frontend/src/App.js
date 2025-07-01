import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CompanyHeader from "./components/CompanyHeader";
import PaginatedTable from "./components/PaginatedTable";
import TeamMembersScroller from "./components/TeamMembersScroller";
import NewsAnalysis from "./components/NewsAnalysis";

function App() {
  const [companyName, setCompanyName] = useState("");
  const [startupData, setStartupData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!companyName.trim()) {
      setError("Please enter a company name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/search", {
        company_name: companyName,
      });
      setStartupData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch startup data");
      setStartupData(null);
    } finally {
      setLoading(false);
    }
  };

  const fundingColumns = [
    { field: "date", headerName: "Date" },
    { field: "amount", headerName: "Amount" },
    { field: "round", headerName: "Round" },
    { field: "lead_investor", headerName: "Lead Investor" },
    {
      field: "article_link",
      headerName: "Details",
      renderCell: (row) =>
        row.article_link !== "N/A" ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.open(row.article_link, "_blank")}
          >
            View Article
          </Button>
        ) : (
          "N/A"
        ),
    },
  ];

  const competitorColumns = [
    { field: "name", headerName: "Competitor Name" },
    { field: "revenue", headerName: "Revenue" },
    { field: "employees", headerName: "Employees" },
    { field: "growth", headerName: "Growth %" },
    { field: "funding", headerName: "Funding" },
    { field: "valuation", headerName: "Valuation" },
  ];

  const teamColumns = [
    { field: "name", headerName: "Team Member" },
    { field: "role", headerName: "Role" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(to bottom, #f5f7fa, #e4e8f0)",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: "bold",
            mb: 4,
            color: "primary.main",
          }}
        >
          Startup Intelligence Dashboard
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            label="Search for a startup"
            variant="outlined"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} /> : <SearchIcon />
            }
            sx={{
              minWidth: 120,
              height: 56,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            Search
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {startupData && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              mb: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <CompanyHeader startupData={startupData} />
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mt: 3,
                  mb: 2,
                  fontWeight: "bold",
                  color: "primary.dark",
                }}
              >
                Funding Rounds
              </Typography>
              {startupData.funding_rounds.length > 0 ? (
                <PaginatedTable
                  data={startupData.funding_rounds}
                  columns={fundingColumns}
                  rowsPerPage={5}
                />
              ) : (
                <Chip
                  label="No funding rounds data available"
                  color="warning"
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
              )}

              <Divider sx={{ my: 4 }} />

              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 0,
                  fontWeight: "bold",
                  color: "primary.dark",
                }}
              >
                Top Competitors
              </Typography>
              {startupData.competitors.length > 0 ? (
                <PaginatedTable
                  data={startupData.competitors}
                  columns={competitorColumns}
                  rowsPerPage={5}
                />
              ) : (
                <Chip
                  label="No competitors data available"
                  color="warning"
                  variant="outlined"
                />
              )}
              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: "primary.dark",
                }}
              >
                Key Team Members
              </Typography>

              <TeamMembersScroller members={startupData.team_members } />
              <NewsAnalysis
                companyName={startupData.name}
                industry={startupData.industry}
              />
            </CardContent>
          </Card>
        )}

        {startupData && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            Data sourced from{" "}
            <a
              href={startupData.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: "bold" }}
            >
              Growjo
            </a>
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default App;
