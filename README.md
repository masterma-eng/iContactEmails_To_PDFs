
# iContact PDF Generator

This project fetches archived email data from iContact and generates PDFs for each email. The email content is either in HTML or plain text format, and the generated PDFs are saved with titles based on the email's subject. 

## Features

- **Fetches archived mailings** from iContact using their API.
- **Generates single-page PDFs** for each email, converting HTML content or fallback text content into PDF format.
- **PDF Titles** are set to the subject of each email.
- **Handles empty or minimal HTML content** by using the plain text version of the email when necessary.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v14 or higher)
- npm (comes with Node.js)

### Dependencies

- [`axios`](https://github.com/axios/axios): For making HTTP requests to the iContact API.
- [`puppeteer`](https://github.com/puppeteer/puppeteer): For rendering HTML and generating PDFs.
- [`cheerio`](https://github.com/cheeriojs/cheerio): For parsing and processing HTML.
- [`pdf-lib`](https://github.com/Hopding/pdf-lib): For modifying the PDF metadata (e.g., setting the title).

Install dependencies using:

```bash
npm install
```

## Environment Variables

Set up your `.env` file with the following environment variables:

```
ICONTACT_APP_ID=your_icontact_app_id
ICONTACT_API_USERNAME=your_icontact_api_username
ICONTACT_API_PASSWORD=your_icontact_api_password
ICONTACT_ACCOUNT_ID=your_icontact_account_id
ICONTACT_FOLDER_ID=your_icontact_folder_id
```

## Usage

1. **Configure API credentials**: Set up the `.env` file with your iContact API credentials.
2. **Run the script**:

   ```bash
   node index.js
   ```

3. The PDFs will be generated and saved in the `output` folder with filenames based on the email subject.

## Output

- The generated PDF files are saved in the `output` folder.
- Each PDF will have the email subject as its title (shown in PDF properties) and filename.

## Folder Structure

```bash
.
├── output/              # Folder where generated PDFs will be saved
├── .env                 # Environment variables file (not tracked by Git)
├── .gitignore           # Ignoring unnecessary files and folders
├── index.js             # Main script file
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation (this file)
```

## Gitignore Configuration

The `.gitignore` file includes the following line to ignore all files inside the `output` folder:

```bash
/output/*
```

## Known Issues

- Ensure that the iContact API credentials in the `.env` file are correct.
- Large HTML content might require sufficient memory for rendering PDFs.

---

### Enjoy using the iContact PDF Generator! 🎉
