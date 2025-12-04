const { Receipt, Booking, Service, Station, User } = require('../models');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class ReceiptController {
  // Generate receipt for booking
  static async generateReceipt(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;

      // Check if booking exists and user has access
      const booking = await Booking.findOne({
        where: { 
          id: bookingId,
          userId // Users can only generate receipts for their own bookings
        },
        include: [
          { model: Service, as: 'service' },
          { model: Station, as: 'station' },
          { model: User, as: 'user' }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Receipt can only be generated for completed bookings'
        });
      }

      // Check if receipt already exists
      let receipt = await Receipt.findOne({ where: { bookingId } });

      if (!receipt) {
        // Generate receipt number
        const receiptNumber = `RC${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Calculate tax (example: 10%)
        const subtotal = booking.totalPrice;
        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        receipt = await Receipt.create({
          bookingId,
          receiptNumber,
          items: [
            {
              name: booking.service.name,
              description: booking.service.description,
              quantity: 1,
              unitPrice: booking.totalPrice,
              total: booking.totalPrice
            }
          ],
          subtotal,
          tax,
          total
        });
      }

      logger.info(`Receipt generated: ${receipt.receiptNumber} for booking ${bookingId}`);

      res.json({
        success: true,
        message: 'Receipt generated successfully',
        data: receipt
      });
    } catch (error) {
      logger.error('Generate receipt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate receipt'
      });
    }
  }

  // Get receipt by booking ID
  static async getReceiptByBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;

      // Check if user has access to this booking
      const booking = await Booking.findOne({
        where: { 
          id: bookingId,
          userId // Users can only view receipts for their own bookings
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      const receipt = await Receipt.findOne({
        where: { bookingId },
        include: [{
          model: Booking,
          as: 'booking',
          include: [
            { model: Service, as: 'service' },
            { model: Station, as: 'station' },
            { model: User, as: 'user' }
          ]
        }]
      });

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Receipt not found'
        });
      }

      res.json({
        success: true,
        data: receipt
      });
    } catch (error) {
      logger.error('Get receipt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get receipt'
      });
    }
  }

  // Generate PDF receipt
  static async generatePDFReceipt(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;

      // Check if booking exists and user has access
      const booking = await Booking.findOne({
        where: { 
          id: bookingId,
          userId
        },
        include: [
          { model: Service, as: 'service' },
          { model: Station, as: 'station' },
          { model: User, as: 'user' }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      // Get or create receipt
      let receipt = await Receipt.findOne({ where: { bookingId } });
      if (!receipt) {
        receipt = await this.createReceiptForBooking(booking);
      }

      // Generate HTML receipt
      const htmlContent = this.generateReceiptHTML(receipt, booking);

      // Generate PDF using puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      await browser.close();

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);

      // Send PDF
      res.send(pdfBuffer);

      logger.info(`PDF receipt generated: ${receipt.receiptNumber}`);
    } catch (error) {
      logger.error('Generate PDF receipt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF receipt'
      });
    }
  }

  // Helper method to create receipt
  static async createReceiptForBooking(booking) {
    const receiptNumber = `RC${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const subtotal = booking.totalPrice;
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    return await Receipt.create({
      bookingId: booking.id,
      receiptNumber,
      items: [
        {
          name: booking.service.name,
          description: booking.service.description,
          quantity: 1,
          unitPrice: booking.totalPrice,
          total: booking.totalPrice
        }
      ],
      subtotal,
      tax,
      total
    });
  }

  // Helper method to generate HTML receipt
  static generateReceiptHTML(receipt, booking) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt ${receipt.receiptNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007AFF;
            margin: 0;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .receipt-info {
            margin-bottom: 30px;
          }
          .receipt-info div {
            margin-bottom: 10px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .totals {
            float: right;
            width: 300px;
            border: 1px solid #ddd;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .total-row.total {
            font-weight: bold;
            font-size: 1.2em;
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Car Service Station</h1>
          <p>123 Service Road, City, Country</p>
          <p>Phone: (123) 456-7890 | Email: info@carservicestation.com</p>
          <h2>SERVICE RECEIPT</h2>
        </div>

        <div class="receipt-info">
          <div><strong>Receipt Number:</strong> ${receipt.receiptNumber}</div>
          <div><strong>Issue Date:</strong> ${new Date(receipt.issuedAt).toLocaleDateString()}</div>
          <div><strong>Booking ID:</strong> ${booking.id}</div>
          <div><strong>Customer:</strong> ${booking.user.firstName} ${booking.user.lastName}</div>
          <div><strong>Email:</strong> ${booking.user.email}</div>
          <div><strong>Phone:</strong> ${booking.user.phone || 'N/A'}</div>
          <div><strong>Service Station:</strong> ${booking.station.name}</div>
          <div><strong>Station Address:</strong> ${booking.station.address}</div>
          <div><strong>Service Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice.toFixed(2)}</td>
                <td>$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${receipt.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (10%):</span>
            <span>$${receipt.tax.toFixed(2)}</span>
          </div>
          <div class="total-row total">
            <span>Total:</span>
            <span>$${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="clear: both;"></div>

        <div class="footer">
          <p>Thank you for choosing Car Service Station!</p>
          <p>For any queries, please contact us at support@carservicestation.com</p>
          <p>This is a computer-generated receipt. No signature required.</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = ReceiptController;