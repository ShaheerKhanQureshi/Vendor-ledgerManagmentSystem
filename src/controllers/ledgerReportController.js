// import pool from "../config/database.js";
// import PDFDocument from "pdfkit";
// import ExcelJS from "exceljs";

// export const generateLedgerReport = async (req, res) => {
//   const { vendor_name } = req.params;
//   const { format } = req.query;

//   try {
//     // Fetch ledger data from the database
//     const [ledgers] = await pool.query(
//       `SELECT 
//         ROW_NUMBER() OVER (ORDER BY l.date) as s_no, 
//         v.company_name, 
//         v.contact_number as phone_no, 
//         l.date, 
//         l.challan_no, 
//         l.description, 
//         l.quantity, 
//         l.debit, 
//         l.credit, 
//         l.payment_method
//       FROM ledgers l 
//       JOIN vendors v ON l.vendor_name = v.company_name 
//       WHERE l.vendor_name = ? 
//       ORDER BY l.date`,
//       [vendor_name]
//     );

//     // Handle ledger balance calculation
//     let runningBalance = 0;
//     const resultWithBalance = ledgers.map((entry) => {
//       runningBalance += (entry.debit === '-' ? 0 : parseFloat(entry.debit)) - (entry.credit === '-' ? 0 : parseFloat(entry.credit));
//       const balance = Math.abs(runningBalance);
//       return { ...entry, balance };
//     });

//     if (format === 'pdf') {
//       // Generate PDF
//       const doc = new PDFDocument();
//       res.setHeader('Content-Disposition', `attachment; filename=${vendor_name}_ledger_report.pdf`);
//       res.setHeader('Content-Type', 'application/pdf');
//       doc.pipe(res); // Send PDF directly to the response

//       doc.fontSize(18).text(`Ledger Report for ${vendor_name}`, { align: 'center' });
//       doc.moveDown();

//       resultWithBalance.forEach((entry) => {
//         doc.fontSize(12).text(`Challan No: ${entry.challan_no}`);
//         doc.text(`Date: ${entry.date}`);
//         doc.text(`Description: ${entry.description}`);
//         doc.text(`Quantity: ${entry.quantity}`);
//         doc.text(`Debit: ${entry.debit}`);
//         doc.text(`Credit: ${entry.credit}`);
//         doc.text(`Payment Method: ${entry.payment_method}`);
//         doc.text(`Balance: ${entry.balance}`);
//         doc.moveDown();
//       });

//       doc.end(); // Finalize and send the PDF
//     } else if (format === 'excel' || format === 'csv') {
//       // Generate Excel
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet('Ledger Report');
//       worksheet.addRow(['Challan No', 'Date', 'Description', 'Quantity', 'Debit', 'Credit', 'Payment Method', 'Balance']);

//       resultWithBalance.forEach((entry) => {
//         worksheet.addRow([entry.challan_no, entry.date, entry.description, entry.quantity, entry.debit, entry.credit, entry.payment_method, entry.balance]);
//       });

//       // Handle Excel response
//       if (format === 'excel') {
//         res.setHeader('Content-Disposition', `attachment; filename=${vendor_name}_ledger_report.xlsx`);
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         await workbook.xlsx.write(res); // Write Excel to response
//         res.end();
//       }
//       // Handle CSV response
//       else if (format === 'csv') {
//         res.setHeader('Content-Disposition', `attachment; filename=${vendor_name}_ledger_report.csv`);
//         res.setHeader('Content-Type', 'text/csv');
//         await workbook.csv.write(res); // Write CSV to response
//         res.end();
//       }
//     } else {
//       // Invalid format
//       res.status(400).json({ message: "Invalid format. Supported formats are pdf, excel, csv." });
//     }

//   } catch (error) {
//     // Log and handle error
//     console.error("Error generating ledger report:", error);
//     res.status(500).json({ message: "Error generating ledger report", error: error.message });
//   }
// };
