const puppeteer = require('puppeteer');
const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const Client = require('@web3-storage/w3up-client').default
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const { default: generateCertificate } = require('../services/certificate-service');
const Web3StorageClient = require('../config/storage');
const { keccak256 } = require('ethers');

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
    category,
    targetAddress
  } = req.body;

  try {

    const result = await generateCertificate(req.body);

    // 2. Inisialisasi Web3 Storage Client
    const web3Client = Web3StorageClient.getInstance();
    await web3Client.initialize();


    const filePath = path.join(__dirname, '..', 'certificates', result.filePath);
    console.log('📍 File path:', filePath);


    if (!fsSync.existsSync(filePath)) {
      console.error('❌ File tidak ditemukan (existsSync)');
      throw new Error(`File tidak ditemukan: ${filePath}`);
    }


    await fs.access(filePath, fs.constants.R_OK);
    console.log('✅ File dapat diakses:', filePath);


    const fileContent = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const file = new File([fileContent], fileName, { type: 'text/plain' });

    const cid = await web3Client.uploadFile(file);
    console.log('📤 File uploaded to IPFS with CID:', cid);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Certificate issued successfully',
      error: {},
      data: {
        ...result,
        fileCid: "https://" + cid + ".ipfs.w3s.link/" + result.filePath,
      },
    });

  } catch (err) {
    console.error('🔥 Error issuing certificate:', err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error issuing certificate',
      error: err.message,
      data: {},
    });
  }
};

async function verifyCertificate(req, res) {
  const { url } = req.body;

  try {
    // Fetch the file as a stream
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer', // For binary files like PDFs
    });

    // Define the output directory and file path
    const outputDir = "/home/aguhh/Documents/Skripsweet/BE skripsi/src/certificates/downloads";
    const fileName = `certificate_${Date.now()}.pdf`; // Unique file name to avoid overwriting
    const filePath = path.join(outputDir, fileName); // Combine directory and file name



    // Ensure the directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Save the file
    await fs.writeFile(filePath, Buffer.from(response.data));

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'File downloaded successfully',
      keccak256: keccak256(response.data),
    });
  } catch (error) {
    console.error('Error downloading file:', error.message);
    throw error; // Re-throw for upstream handling
  }
}
module.exports = { create, issueCertificate, verifyCertificate };