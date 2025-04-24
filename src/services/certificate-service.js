
import puppeteer from 'puppeteer';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import Client from '@web3-storage/w3up-client';
import { prisma } from '../config/index.js';
import { ethers } from 'ethers';


async function generateCertificate(params) {
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
    } = params;
    
    try {
        // Generate PDF using Puppeteer or any other library
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        // Load the HTML template and fill in the data
        await page.setContent(template);
        
        // Fill in the data using JavaScript
        await page.evaluate((data) => {
        document.querySelector('#recipientName').textContent = data.recipientName;
        document.querySelector('#certificateTitle').textContent = data.certificateTitle;
        document.querySelector('#issueDate').textContent = data.issueDate;
        document.querySelector('#expiryDate').textContent = data.expiryDate;
        document.querySelector('#description').textContent = data.description;
        document.querySelector('#signature').src = data.signature;
        document.querySelector('#category').textContent = data.category;
        document.querySelector('#issuerAddress').textContent = data.issuerAddress;
        document.querySelector('#issuerName').textContent = data.issuerName;
        document.querySelector('#targetAddress').textContent = data.targetAddress;
        }, { recipientName, certificateTitle, issueDate, expiryDate, description, signature, category, issuerAddress, issuerName, targetAddress });
    
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
        await browser.close();
    
        return pdfBuffer;
    
    } catch (err) {
        console.error(err);
        throw new Error('Error generating certificate');
    }


}