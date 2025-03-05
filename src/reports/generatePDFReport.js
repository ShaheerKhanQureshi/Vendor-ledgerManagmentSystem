// import fs from 'fs';
// import PDFDocument from 'pdfkit';
// import { reportColors, reportFonts, formatCurrency } from '../utils/reportStyles.js';

// const validateFont = (fontPath) => {
//   try {
//     fs.accessSync(fontPath, fs.constants.R_OK);
//     return fontPath;
//   } catch (err) {
//     console.error(`Font not found: ${fontPath}`);
//     return null;
//   }
// };

// export const generatePDFReport = async (res, vendorDetails, ledgerEntries, start_date, end_date) => {
//   try {
//     const primaryFont = validateFont(reportFonts.primary) || 'Helvetica';
//     const secondaryFont = validateFont(reportFonts.secondary) || 'Helvetica';

//     const doc = new PDFDocument({
//       margin: 50,
//       size: 'A4',
//       bufferPages: true,
//       font: 'Helvetica',
//     });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${vendorDetails.company_name}_ledger_report.pdf"`);
//     doc.pipe(res);

//     let openingBalance = 0;
//     ledgerEntries.forEach((entry) => {
//       if (entry.date < (start_date || entry.date)) {
//         openingBalance += Number.parseFloat(entry.debit || 0) - Number.parseFloat(entry.credit || 0);
//       }
//     });

//     doc
//       .fontSize(28)
//       .font(primaryFont)
//       .fillColor(reportColors.primary)
//       .text('Ledger Report', { align: 'center' });
//     doc.moveDown(0.5);

//     const companyBox = () => {
//       doc
//         .rect(50, doc.y, doc.page.width - 100, 130)
//         .fillColor(reportColors.header)
//         .fill();

//       doc
//         .fillColor(reportColors.primary)
//         .font(`${primaryFont}-Bold`)
//         .fontSize(16)
//         .text('Company Information', 70, doc.y - 120);

//       doc
//         .fontSize(12)
//         .font(secondaryFont)
//         .fillColor(reportColors.secondary)
//         .text(`Company Name: ${vendorDetails.company_name}`, 70, doc.y - 90)
//         .text(`Contact: ${vendorDetails.contact_number}`, 70, doc.y - 70)
//         .text(`Bank Details: ${vendorDetails.bank_details}`, 70, doc.y - 50);

//       if (start_date && end_date) {
//         doc.text(`Period: ${start_date} to ${end_date}`, 70, doc.y - 30);
//       }
//     };

//     companyBox();
//     doc.moveDown(2);

//     doc
//       .font(`${primaryFont}-Bold`)
//       .fontSize(13)
//       .fillColor(reportColors.primary)
//       .text(`Opening Balance: ${formatCurrency(openingBalance)}`, { align: 'right' });

//     doc.moveDown(1);

//     const tableTop = doc.y;
//     const columns = {
//       date: { x: 50, width: 80 },
//       challan: { x: 130, width: 90 },
//       desc: { x: 220, width: 140 },
//       qty: { x: 360, width: 60 },
//       price: { x: 420, width: 70 },
//       debit: { x: 490, width: 80 },
//       credit: { x: 570, width: 80 },
//       balance: { x: 650, width: 90 },
//     };

//     const drawTableHeader = (y) => {
//       doc
//         .rect(50, y - 5, doc.page.width - 100, 25)
//         .fillColor(reportColors.header)
//         .fill();

//       doc.fillColor(reportColors.primary).fontSize(11).font(`${secondaryFont}-Bold`);

//       const headers = {
//         date: 'Date',
//         challan: 'Challan',
//         desc: 'Description',
//         qty: 'Qty',
//         price: 'Price/M',
//         debit: 'Debit',
//         credit: 'Credit',
//         balance: 'Balance',
//       };

//       Object.entries(headers).forEach(([key, text]) => {
//         const col = columns[key];
//         const align = ['qty', 'price', 'debit', 'credit', 'balance'].includes(key) ? 'right' : 'left';
//         doc.text(text, col.x, y, { width: col.width, align });
//       });
//     };

//     drawTableHeader(tableTop);
//     let currentY = tableTop + 25;

//     let balance = openingBalance;
//     let totalDebit = 0;
//     let totalCredit = 0;

//     const renderHeader = () => {
//       doc
//         .fontSize(10)
//         .font(`${primaryFont}-Bold`)
//         .fillColor(reportColors.primary)
//         .text(`Date`, columns.date.x, doc.y, { width: columns.date.width, align: 'left' })
//         .text(`Challan`, columns.challan.x, doc.y, { width: columns.challan.width, align: 'left' })
//         .text(`Description`, columns.desc.x, doc.y, { width: columns.desc.width, align: 'left' })
//         .text(`Qty`, columns.qty.x, doc.y, { width: columns.qty.width, align: 'right' })
//         .text(`Price/M`, columns.price.x, doc.y, { width: columns.price.width, align: 'right' })
//         .text(`Debit`, columns.debit.x, doc.y, { width: columns.debit.width, align: 'right' })
//         .text(`Credit`, columns.credit.x, doc.y, { width: columns.credit.width, align: 'right' })
//         .text(`Balance`, columns.balance.x, doc.y, { width: columns.balance.width, align: 'right' });
//       doc.moveDown(1);
//     };

//     const addTableRows = () => {
//       ledgerEntries.forEach((entry, index) => {
//         const descriptions = entry.description?.split(',').map((d) => d.trim()) || ['-'];
//         const quantities = entry.quantity
//           ?.toString()
//           .split(',')
//           .map((q) => q.trim()) || ['-'];
//         const prices = entry.price_per_meter
//           ?.toString()
//           .split(',')
//           .map((p) => p.trim()) || ['-'];

//         const rowHeight = Math.max(descriptions.length, quantities.length, prices.length) * 20;

//         if (currentY + rowHeight > 700) {
//           doc.addPage();
//           renderHeader();
//           currentY = 100; // Adjust the start position for the new page
//         }

//         if (index % 2 === 0) {
//           doc
//             .rect(50, currentY - 5, doc.page.width - 100, rowHeight + 10)
//             .fillColor(reportColors.zebra)
//             .fill();
//         }

//         const debit = Number.parseFloat(entry.debit || 0);
//         const credit = Number.parseFloat(entry.credit || 0);

//         totalDebit += debit;
//         totalCredit += credit;
//         balance += debit - credit;

//         doc.fillColor(reportColors.primary).font(secondaryFont).fontSize(10);

//         doc.text(new Date(entry.date).toLocaleDateString('en-GB'), columns.date.x, currentY);
//         doc.text(entry.challan_no || '-', columns.challan.x, currentY);

//         let itemY = currentY;
//         descriptions.forEach((desc, i) => {
//           doc.text(desc, columns.desc.x, itemY, { width: columns.desc.width });

//           if (quantities[i]) {
//             doc.text(quantities[i], columns.qty.x, itemY, { width: columns.qty.width, align: 'right' });
//           }

//           if (prices[i]) {
//             doc.text(prices[i], columns.price.x, itemY, { width: columns.price.width, align: 'right' });
//           }

//           itemY += 20;
//         });

//         const formatNumber = (num) => (num ? formatCurrency(num) : '-');

//         doc.text(formatNumber(debit), columns.debit.x, currentY, { width: columns.debit.width, align: 'right' });
//         doc.text(formatNumber(credit), columns.credit.x, currentY, { width: columns.credit.width, align: 'right' });
//         doc.text(formatNumber(balance), columns.balance.x, currentY, { width: columns.balance.width, align: 'right' });

//         currentY += rowHeight + 5;
//       });
//     };

//     renderHeader();
//     addTableRows();

//     currentY += 20;
//     doc
//       .moveTo(50, currentY)
//       .lineTo(doc.page.width - 50, currentY)
//       .lineWidth(0.5)
//       .stroke(reportColors.border);

//     currentY += 20;

//     doc
//       .rect(50, currentY, doc.page.width - 100, 100)
//       .fillColor(reportColors.header)
//       .fill();

//     doc
//       .fillColor(reportColors.primary)
//       .font(`${primaryFont}-Bold`)
//       .fontSize(16)
//       .text('Summary', 70, currentY + 15);

//     const summaryData = [
//       { label: 'Total Debit:', value: totalDebit },
//       { label: 'Total Credit:', value: totalCredit },
//       { label: 'Closing Balance:', value: balance },
//     ];

//     summaryData.forEach((item, index) => {
//       const y = currentY + 45 + index * 20;
//       doc.fontSize(11).font(`${secondaryFont}-Bold`).text(item.label, 70, y);

//       doc.text(formatCurrency(item.value), columns.balance.x, y, {
//         width: columns.balance.width,
//         align: 'right',
//       });
//     });

//     doc.end();

//   } catch (error) {
//     console.error('Error generating PDF report:', error);
//     res.status(500).json({ error: 'Failed to generate PDF report' });
//   }
// };
import PDFDocument from 'pdfkit';
import { reportColors, formatCurrency } from '../utils/reportStyles.js';

export const generatePDFReport = async (res, vendorDetails, ledgerEntries, start_date, end_date) => {
  try {
    if (!res || !vendorDetails || !ledgerEntries) {
      throw new Error('Invalid input parameters');
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${vendorDetails.company_name}_ledger_report.pdf"`);
    doc.pipe(res);

    console.log("PDF Document initialized and piped to response");

    let openingBalance = 0, totalDebit = 0, totalCredit = 0;

    ledgerEntries.forEach((entry) => {
      if (entry.date < (start_date || entry.date)) {
        openingBalance += Number.parseFloat(entry.debit || 0) - Number.parseFloat(entry.credit || 0);
      }
      totalDebit += Number.parseFloat(entry.debit || 0);
      totalCredit += Number.parseFloat(entry.credit || 0);
    });

    let balance = openingBalance + totalDebit - totalCredit;
    const printDate = new Date().toLocaleString();

    const addPageHeader = () => {
      doc.font('Helvetica-Bold').fontSize(18).text('Transaction Ledger Report', { align: 'center' });
      doc.font('Helvetica').fontSize(12).text(`Printed on: ${printDate}`, { align: 'center' });
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(14).text(`${vendorDetails.company_name}`, { align: 'center' });
      doc.font('Helvetica').fontSize(12).text(`${vendorDetails.contact_number}`, { align: 'center' });
      doc.moveDown();
    };

    const addPageFooter = () => {
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.font('Helvetica').fontSize(10).text(`Page ${i + 1} of ${range.count}`, doc.page.width - 100, doc.page.height - 50, { align: 'right' });
      }
    };

    // Example reportColors definition (ensure this is defined correctly)
    const reportColors = {
      header: '#d3d3d3',
      primary: '#000000',
      zebra: '#f7f7f7',
    };

    addPageHeader();
    const tableTop = 200;
    const columns = {
      date: { x: 50, width: 80 },
      challan: { x: 130, width: 80 },
      desc: { x: 210, width: 150 },
      quantity: { x: 370, width: 70 },
      price: { x: 450, width: 70 },
      debit: { x: 520, width: 70 },
      credit: { x: 590, width: 70 },
      balance: { x: 660, width: 70 },
    };

    const drawTableHeader = (y) => {
      doc.rect(50, y - 5, doc.page.width - 100, 25).fillColor(reportColors.header).fill();
      doc.fillColor(reportColors.primary).fontSize(11).font('Helvetica-Bold');
      Object.entries({
        date: 'Date',
        challan: 'Challan',
        desc: 'Description',
        quantity: 'Quantity',
        price: 'Price/M',
        debit: 'Debit',
        credit: 'Credit',
      }).forEach(([key, text]) => {
        doc.text(text, columns[key].x, y, { width: columns[key].width, align: 'center' });
      });
    };

    drawTableHeader(tableTop);
    let currentY = tableTop + 25;
    ledgerEntries.forEach((entry, index) => {
      const descriptions = entry.description?.split(',').map((d) => d.trim()) || ['-'];
      const rowHeight = descriptions.length * 20;

      if (currentY + rowHeight > 700) {
        doc.addPage();
        addPageHeader();
        drawTableHeader(150);
        currentY = 175;
      }

      if (index % 2 === 0) {
        doc.rect(50, currentY - 5, doc.page.width - 100, rowHeight + 10).fillColor(reportColors.zebra).fill();
      }

      const debit = Number.parseFloat(entry.debit || 0);
      const credit = Number.parseFloat(entry.credit || 0);
      balance += debit - credit;

      doc.fillColor(reportColors.primary).fontSize(10);
      doc.text(new Date(entry.date).toLocaleDateString('en-GB'), columns.date.x, currentY, { width: columns.date.width, align: 'center' });
      doc.text(entry.challan_no || '-', columns.challan.x, currentY, { width: columns.challan.width, align: 'center' });
      doc.text(entry.quantity || '-', columns.quantity.x, currentY, { width: columns.quantity.width, align: 'center' });
      doc.text(entry.price_per_meter ? formatCurrency(entry.price_per_meter) : '-', columns.price.x, currentY, { width: columns.price.width, align: 'center' });

      descriptions.forEach((desc, i) => {
        doc.text(desc, columns.desc.x, currentY + i * 20, { width: columns.desc.width, align: 'center' });
      });

      doc.text(formatCurrency(Math.abs(debit)), columns.debit.x, currentY, { width: columns.debit.width, align: 'center' });
      doc.text(formatCurrency(Math.abs(credit)), columns.credit.x, currentY, { width: columns.credit.width, align: 'center' });
      doc.text(formatCurrency(Math.abs(balance)), columns.balance.x, currentY, { width: columns.balance.width, align: 'center' });
      currentY += rowHeight + 5;
    });

    doc.moveDown().font('Helvetica-Bold').fontSize(12).text('Summary', { align: 'left' });
    doc.rect(50, currentY + 10, doc.page.width - 100, 50).stroke();
    doc.text(`Total Debit: ${formatCurrency(Math.abs(totalDebit))}`, 70, currentY + 20, { align: 'left' });
    doc.text(`Total Credit: ${formatCurrency(Math.abs(totalCredit))}`, 250, currentY + 20, { align: 'left' });
    doc.text(`Final Balance: ${formatCurrency(Math.abs(balance))}`, 430, currentY + 20, { align: 'left' });

    doc.end();
    addPageFooter();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(400).json({ error: 'Failed to generate PDF report', details: error.message });
  }
};
