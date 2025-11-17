# <img src="https://image.eveonline.com/Character/1_64.jpg" width="32" height="32" align="center"> EveWho

> Track EVE Online corporations, alliances, and character memberships in real-time

EveWho provides comprehensive visibility into EVE Online's organizational structure, allowing you to view current members of corporations and alliances. This information is not readily available within the game itself.

[![Part of zz Suite](https://img.shields.io/badge/zz-Suite-blueviolet?style=flat-square)](https://zzeve.com)

## ✨ Features

- 📊 **Real-time Membership Data** - View current members of any corporation or alliance
- 📈 **Historical Tracking** - Monitor membership changes over time with delta calculations
- 🔍 **Smart Search** - Autocomplete search for characters, corporations, and alliances
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌐 **Public API** - CORS-enabled API for integration with your tools

## 🔌 API

EveWho provides a simple, CORS-enabled API for accessing character and organization data.

### Endpoints

```bash
# Character information and history
GET https://evewho.com/api/character/1633218082

# Corporation member list
GET https://evewho.com/api/corplist/98330748

# Alliance member list
GET https://evewho.com/api/allilist/99006319
```

### Rate Limiting

To ensure fair usage and prevent abuse:
- **Limit**: 10 requests per 30-second window
- **User-Agent Required**: CloudFlare may block requests without a user-agent header

> 💡 **Tip**: For more detailed ESI data, use [EVE Online's ESI API](https://developers.eveonline.com/api-explorer)


## 🛠️ Tech Stack

- **Backend**: Node.js with [Fundamen](https://www.npmjs.com/package/fundamen) framework
- **Database**: MySQL
- **Cache**: Redis
- **Frontend**: jQuery, Bootstrap 4, Pug templates
- **Deployment**: PM2 process manager

## 🚀 Getting Started

### Prerequisites

```bash
node >= 12.x
mysql >= 5.7
redis >= 5.0
```

### Installation

```bash
# Clone the repository
git clone https://github.com/zKillboard/evewho.git
cd evewho

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and Redis credentials

# Run database migrations
mysql -u root -p < setup/evewho.ddl

# Start the application
npm start
```

## 📖 FAQ

### What does Delta mean?

Delta represents the change in membership over the past 7 days. For example:
- Corp had 13 pilots 7 days ago
- Corp has 18 pilots today
- **Delta = +5** (5 new members)

### How do you get all this data? Is it scraped?

No scraping involved! All data collection complies with CCP's Terms of Service through:
- Official EVE Online ESI API
- Public character affiliation endpoints
- Historical tracking of membership changes

Learn more in the [official forum announcement](https://forums.eveonline.com/default.aspx?g=posts&t=25940).

### How is corporation activity calculated?

Activity is measured by recruitment activity in the last 90 days. While not perfect (doesn't account for kills/losses), it's a reliable indicator since most active corporations recruit regularly.

### How are Pirate and Carebear rankings determined?

Rankings use a weighted algorithm based on average security status:

```javascript
corp_security_level = avg(sec_status) * log(memberCount)
```

This balances individual pilot security status with corporation size.

### Can I remove my pilot/corporation from the site?

All data is owned by CCP Games and obtained through their official APIs. To request name changes or removal:
1. Contact [CCP Games](https://www.ccpgames.com/contact-us/)
2. Once changed in-game, it will automatically update via ESI
3. EveWho will reflect the changes within 24 hours

### Why am I getting blocked when using automated tools?

To prevent abuse and maintain performance:
- **Rate Limit**: 10 requests per 30 seconds
- **Solution**: Use the public API endpoints instead of scraping
- **Best Practice**: Implement proper rate limiting in your tools

## 📝 License

This project is part of the [zz Suite](https://zzeve.com) of EVE Online tools.

---

**EVE Online** and all associated logos and designs are the intellectual property of CCP hf.  
EveWho is not affiliated with or endorsed by CCP Games.
