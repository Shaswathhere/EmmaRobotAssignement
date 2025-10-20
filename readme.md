# Kaggle to HubSpot Data Pipeline

This project is an **automated data pipeline** that performs the following tasks:

---

## Overview

## Scrapes Data

Uses **Playwright** to programmatically log into [Kaggle.com](https://www.kaggle.com/), navigate to a specific dataset, and download a ZIP archive containing baby names.

## Stores Data

Unzips the downloaded file, parses the CSV data within, and stores the relevant fields (**Name**, **Sex**) in a local **MySQL** database using the **Sequelize ORM**.

## Syncs Data

Pushes the records from the MySQL database to **HubSpot’s CRM**, creating a new contact for each entry.

---

## Tech Stack

- **Node.js** – JavaScript runtime environment
- **TypeScript** – Typed superset of JavaScript for robust code
- **Playwright** – Browser automation and web scraping
- **MySQL** – Relational database for persistent data storage
- **Sequelize** – Object-Relational Mapper (ORM) for MySQL interaction
- **HubSpot API** – For programmatically creating contacts in HubSpot CRM

---

## File Structure

```
textproject-root/
│
├── src/
│   ├── index.ts          # Main entry point orchestrating the pipeline
│   ├── scraper.ts        # Handles login and data download using Playwright
│   ├── database.ts       # Handles CSV parsing and MySQL data insertion
│   └── hubspot.ts        # Manages syncing records with HubSpot API
│
├── config/               # Sequelize database configuration
├── migrations/           # Database schema migrations
├── downloads/            # Default directory for downloaded data files
└── .env                  # Environment configuration file
```

---

## Setup and Installation

## 1. Clone the Repository

```
bashgit clone <repository_url>
cd <project_directory>
```

## 2. Install Dependencies

```
bashnpm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory. Copy from `.env.example` (if available) or add the following:

```
bashKAGGLE_EMAIL="your-kaggle-email@example.com"
KAGGLE_PASSWORD="your-kaggle-password"
DB_NAME="baby_names_db"
DB_USER="root"
DB_PASSWORD="your_mysql_root_password"
DB_HOST="127.0.0.1"
HUBSPOT_API_KEY="your-hubspot-private-app-token"
```

---

## Database Setup

Ensure your **MySQL server** is running.
Update connection credentials in `config/config.json` if necessary.

Run the following commands to create the database and apply migrations:

```
bashnpx sequelize-cli db:create
npx sequelize-cli db:migrate
```

---

## Running the Pipeline

To execute the full data pipeline:

```
bashnpm start
```

The script will log its progress in the terminal — from logging into Kaggle to syncing the processed data with HubSpot CRM.