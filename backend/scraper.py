import requests
from bs4 import BeautifulSoup
from datetime import datetime

def get_text(el):
    return el.get_text(strip=True) if el else "N/A"

def get_linkedin_url(employee_url):
    try:
        full_url = f"https://growjo.com{employee_url}"
        res = requests.get(full_url)
        soup = BeautifulSoup(res.text, "html.parser")
        
        linkedin_div = soup.select_one('div.wpr i.fa-linkedin')
        if linkedin_div:
            linkedin_link = linkedin_div.find_next('a')
            if linkedin_link and 'href' in linkedin_link.attrs:
                return linkedin_link['href']
    except Exception as e:
        print(f"Error fetching LinkedIn URL: {e}")
    return None

def scrape_growjo(url):
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")

    name_tag = soup.select_one('div.col h1')
    if name_tag:
        name = name_tag.get_text(strip=True).split('Revenue')[0].strip()
    else:
        name = "N/A"

    # Rest of the basic info
    location = get_text(soup.select_one("#revenue-financials h4"))
    industry_name = get_text(soup.select_one('#revenue-financials a[href^="/industry/"]'))
    link_tag = soup.select_one("#revenue-financials a")
    link = link_tag["href"] if link_tag else "N/A"

    # Key metrics
    funding = employees = revenue = employee_growth = valuation = "N/A"
    detail_blocks = soup.select(".col-md-12 > div > div")
    for div in detail_blocks:
        text = get_text(div)
        if "Total Funding" in text:
            funding = get_text(div.select_one("p:nth-child(2)"))
        if "Number of Employees" in text:
            employees = get_text(div.select_one("p:nth-child(2)")).replace(",", "")
        if "Revenue (est)" in text:
            revenue = get_text(div.select_one("p:nth-child(2)"))
        if "Employee Growth %" in text:
            employee_growth = get_text(div.select_one("p:nth-child(2)")).replace("%", "")
        if "Valuation" in text:
            valuation = get_text(div.select_one("p:nth-child(2)"))

    # Funding rounds (4th tbody)
    funding_tables = soup.select("tbody")
    funding_rounds = []
    if len(funding_tables) >= 4:
        funding_table = funding_tables[3]
        table_rows = funding_table.select("tr")
        for row in table_rows:
            cols = row.find_all("td")
            if len(cols) < 5:
                continue
            date_str = get_text(cols[0])
            amount = get_text(cols[1])
            round_type = get_text(cols[2])
            lead_investor = get_text(cols[3])
            article_link = cols[4].find("a")["href"] if cols[4].find("a") else "N/A"

            try:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                date_str = date_obj.strftime("%Y-%m-%d")
            except ValueError:
                pass

            funding_rounds.append({
                'date': date_str,
                'amount': amount,
                'round': round_type,
                'lead_investor': lead_investor,
                'article_link': article_link,
            })

    # Competitors (2nd tbody)
    competitors = []
    if len(funding_tables) >= 2:
        competitors_table = funding_tables[1]
        table_rows = competitors_table.select("tr")
        for row in table_rows:
            cols = row.find_all("td")
            if len(cols) < 6:
                continue
                
            name_link = cols[0].select_one("a[href^='/company/']")
            comp_name = get_text(name_link) if name_link else "N/A"
            
            comp_revenue = get_text(cols[1])
            comp_employees = get_text(cols[2])
            comp_growth = get_text(cols[3]).replace("%", "")
            comp_funding = get_text(cols[4])
            comp_valuation = get_text(cols[5])

            competitors.append({
                'name': comp_name,
                'revenue': comp_revenue,
                'employees': comp_employees,
                'growth': comp_growth,
                'funding': comp_funding,
                'valuation': comp_valuation,
            })

        # Team members (1st tbody)
    team_members = []
    if len(funding_tables) >= 1:
        team_table = funding_tables[0]
        table_rows = team_table.select("tr")
        for row in table_rows:
            cols = row.find_all("td")
            if len(cols) < 2:  # Need at least name and role columns
                continue
                
            # Extract team member name and employee page URL
            name_link = cols[0].select_one("a[href^='/employee/']")
            member_name = get_text(name_link) if name_link else "N/A"
            employee_url = name_link['href'] if name_link else None
            
            # Extract role from second column
            role = get_text(cols[1]) if len(cols) > 1 else "N/A"

            # Get LinkedIn URL if available
            linkedin_url = get_linkedin_url(employee_url) if employee_url else None

            team_members.append({
                'name': member_name,
                'role': role,
                'linkedin_url': linkedin_url,
                'employee_url': f"https://growjo.com{employee_url}" if employee_url else None
            })
    return {
        'name': name,
        'location': location,
        'industry': industry_name,
        'website': link,
        'employees': employees,
        'revenue': revenue,
        'employee_growth': employee_growth,
        'valuation': valuation,
        'funding': funding,
        'funding_rounds': funding_rounds,
        'competitors': competitors,
        'team_members': team_members,
        'source_url': url
    }