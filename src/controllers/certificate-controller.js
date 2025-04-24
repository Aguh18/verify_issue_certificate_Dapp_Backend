const puppeteer = require('puppeteer');
const { StatusCodes } = require('http-status-codes');
const Client = require('@web3-storage/w3up-client').default;

const fs = require('fs');

const create = async (req, res) => {
  // HTML template sertifikat dengan styling menggunakan CSS inline
  const certificateHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sertifikat Kelulusan</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f3f4f6;
        }
        .certificate {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          text-align: center;
        }
        .certificate h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .certificate p {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .certificate .name {
          font-size: 22px;
          font-weight: bold;
          color: #007bff;
        }
        .certificate .date {
          font-size: 18px;
          font-style: italic;
        }
        .verify-btn {
          display: inline-block;
          margin-top: 15px;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <h1>Sertifikat Kelulusan</h1>
        <p>Dengan ini menyatakan bahwa</p>
        <p class="name">Udin</p>
        <p>Telah berhasil menyelesaikan program pendidikan dan memperoleh kelulusan pada tanggal:</p>
        <p class="date">Dadang</p>
        <a href="#" class="verify-btn">Verifikasi Sertifikat</a>
      </div>
    </body>
    </html>
  `;

  try {
    // Launch Puppeteer dengan opsi tambahan
    const browser = await puppeteer.launch({
      headless: 'new', // Mode headless Puppeteer terbaru
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();


    await page.setContent(certificateHtml, { waitUntil: 'networkidle0' });


    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    const pdfPath = './certificate.pdf';
    fs.writeFileSync(pdfPath, pdfBuffer);

    await browser.close();

    res.status(StatusCodes.OK).send("Sertifikat berhasil dibuat");

  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error generating certificate',
      error: err.message,
      data: {},
    });
  }
};

const issueCertificate = async (req, res) => {
  const {
    template,
    recipientName,
    certificateTitle,
    issueDate,
    expiryDate,
    description,
    signature,
    category,
    issuerAddress,
    issuerName,
    targetAddress
  } = req.body;


  try {


    const cid = await client.storeBlob(fs.createReadStream('./certificate.pdf'));

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Certificate issued successfully',
      error: {},
      data: { cid },
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error issuing certificate',
      error: err.message,
      data: {},
    });
  }
}

module.exports = { create, issueCertificate };