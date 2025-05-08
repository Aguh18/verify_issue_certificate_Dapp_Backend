import puppeteer from 'puppeteer';
import fs from 'fs';
import fss from 'fs/promises';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { keccak256 } from 'ethers';

// Mendapatkan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tentukan lokasi folder untuk menyimpan PDF
const outputDir = path.join(__dirname, '../certificates');
console.log('Output directory:', outputDir);

// Buat folder jika belum ada
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Folder created: ${outputDir}`);
}

async function generateCertificate(params) {
    const {
        recipientName,
        issueDate,
        certificateTitle,
        description,
        category,
        targetAddress
    } = params;

    // Validasi not null
    if (!recipientName || !issueDate || !certificateTitle || !description ||
        !category || !targetAddress) {
        const missingFields = [
            !recipientName && 'recipientName',
            !issueDate && 'issueDate',
            !certificateTitle && 'certificateTitle',
            !description && 'description',
            !category && 'category',
            !targetAddress && 'targetAddress'
        ].filter(Boolean);
        throw new Error(`Semua field wajib diisi. Missing: ${missingFields.join(', ')}`);
    }

    // Bersihkan tanda kutip dari input
    const cleanData = {
        recipientName: recipientName.replace(/"/g, ''),
        issueDate: issueDate.replace(/"/g, ''),
        certificateTitle: certificateTitle.replace(/"/g, ''),
        description: description.replace(/"/g, ''),
        category: category.replace(/"/g, ''),
        targetAddress
    };

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
                .certificate .description {
                    font-size: 16px;
                }
                .certificate .category {
                    font-size: 16px;
                }
                .certificate .targetAddress {
                    font-size: 14px;
                    word-break: break-all;
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
                <h1 id="certificateTitle">${cleanData.certificateTitle}</h1>
                <p>Dengan ini menyatakan bahwa</p>
                <p class="name" id="recipientName">${cleanData.recipientName}</p>
                <p>Telah berhasil menyelesaikan program pendidikan dan memperoleh kelulusan pada tanggal:</p>
                <p class="date" id="issueDate">${cleanData.issueDate}</p>
                <p class="description" id="description">${cleanData.description}</p>
                <p class="category" id="category">${cleanData.category}</p>
                <p class="targetAddress" id="targetAddress">${cleanData.targetAddress}</p>
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

        // Load HTML template
        await page.setContent(certificateHtml, { waitUntil: 'load' });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `certificate_${cleanData.recipientName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
        const filePath = path.join(outputDir, fileName);

        // Generate dan simpan PDF
        await page.pdf({
            path: filePath, // Simpan ke file
            format: 'A4',
            printBackground: true
        });

        const pdfBuffer = fs.readFileSync(filePath);



        await browser.close();

        // Mengembalikan informasi file dan hash
        return {
            message: 'Certificate generated successfully',
            filePath: fileName,

        };

    } catch (err) {
        console.error(err);
        throw new Error('Error generating certificate: ' + err.message);
    }
}

async function verifyCertificate() {
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
        await fss.mkdir(outputDir, { recursive: true });

        // Save the file
        await fss.writeFile(filePath, Buffer.from(response.data));
        console.log(`File downloaded and saved to ${filePath}`);
    } catch (error) {
        console.error('Error downloading file:', error.message);
        throw error; // Re-throw for upstream handling
    }
    const pdfBuffe = fs.readFileSync(filePath);

    // Hitung hash keccak256 dari konten PDF
    const certificateId = keccak256(pdfBuffe);
    console.log('Certificate ID (hash):', certificateId);

}

export default generateCertificate;