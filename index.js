const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const { PDFDocument } = require('pdf-lib');
require('dotenv').config();

// Set up environment variables
const APP_ID = process.env.ICONTACT_APP_ID;
const API_USERNAME = process.env.ICONTACT_API_USERNAME;
const API_PASSWORD = process.env.ICONTACT_API_PASSWORD;
const ACCOUNT_ID = process.env.ICONTACT_ACCOUNT_ID;
const FOLDER_ID = process.env.ICONTACT_FOLDER_ID;

// iContact API base URL
const API_BASE_URL = `https://app.icontact.com/icp/a/${ACCOUNT_ID}/c/${FOLDER_ID}`;
const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'API-Version': '2.2',
  'API-AppId': APP_ID,
  'API-Username': API_USERNAME,
  'API-Password': API_PASSWORD,
};

// Ensure the output directory exists
if (!fs.existsSync('./output')) {
  fs.mkdirSync('./output', { recursive: true });
}

// Check if HTML content is effectively blank
function isHtmlContentBlank(htmlContent) {
  if (!htmlContent) return true;
  const $ = cheerio.load(htmlContent.trim());
  const textContent = $.text().trim();
  return textContent.length === 0;
}

// Sanitize filename to remove invalid characters
function sanitizeFilename(filename) {
  return filename.replace(/[<>:"\/\\|?*]+/g, '').replace(/\s+/g, '_');
}

// Fetch archived mailings and generate PDFs
async function GeneratePDFs() {
  try {
    const limit = 20;
    let offset = 0;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

    while (true) {
      const response = await axios.get(`${API_BASE_URL}/sends?limit=${limit}&offset=${offset}`, {
        headers: HEADERS,
      });

      const sendData = response.data.sends;
      if (sendData.length === 0) break;

      for (const item of sendData) {
        const messageId = item.messageId;

        try {
          const messageData = await axios.get(`${API_BASE_URL}/messages/${messageId}`, {
            headers: HEADERS,
          });

          const subject = sanitizeFilename(messageData.data.message.subject);
          let messageBody = messageData.data.message.htmlBody;
          const textBody = messageData.data.message.textBody;

          // If HTML content is blank, fallback to text body
          if (isHtmlContentBlank(messageBody)) {
            messageBody = `<html><body><pre>${textBody}</pre></body></html>`;
          }

          const pdfFileName = `./output/${subject}_${messageId}.pdf`;
          await createSinglePagePdf(browser, messageBody, pdfFileName, subject);
        } catch (messageError) {
          console.error(`Error fetching message ${messageId}:`, messageError.message);
        }
      }

      offset += limit;
    }

    await browser.close();
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

// Create a single-page PDF with the provided title
async function createSinglePagePdf(browser, htmlContent, outputFileName, title) {
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Adjust page size based on content
  const bodyHandle = await page.$('body');
  const boundingBox = await bodyHandle.boundingBox();
  const contentWidth = boundingBox.width + 20;
  const contentHeight = boundingBox.height + 20;

  // Generate PDF
  const pdfBuffer = await page.pdf({
    path: outputFileName,
    width: `${contentWidth}px`,
    height: `${contentHeight}px`,
    printBackground: true,
  });

  await page.close();

  // Load the PDF and set the title
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  pdfDoc.setTitle(title);  // Set the PDF title
  const modifiedPdfBytes = await pdfDoc.save();

  // Save modified PDF with title
  fs.writeFileSync(outputFileName, modifiedPdfBytes);

  console.log(`PDF created: ${outputFileName}`);
}

// Call the main function to fetch data and create PDFs
GeneratePDFs();
