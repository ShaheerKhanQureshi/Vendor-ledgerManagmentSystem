// import { generatePDFReport } from '../reports/generatePDFReport.js';
// import { generateExcelReport } from '../reports/generateExcelReport.js';

// export const generateLedgerReport = async (req, res) => {
//   const { vendor_name } = req.params;
//   const { start_date, end_date, format } = req.query;

//   try {
//     const [ledgerEntries] = await pool.query(
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
//         l.payment_method,
//         l.price_per_meter
//       FROM ledgers l 
//       JOIN vendors v ON l.vendor_name = v.company_name 
//       WHERE l.vendor_name = ? 
//       ${start_date && end_date ? 'AND l.date BETWEEN ? AND ?' : ''} 
//       ORDER BY l.date`,
//       start_date && end_date ? [vendor_name, start_date, end_date] : [vendor_name]
//     );

//     if (ledgerEntries.length === 0) {
//       return res.status(404).json({ message: "Vendor not found or no ledger entries" });
//     }

//     let runningBalance = 0;
//     const totalDebit = ledgerEntries.reduce((acc, entry) => acc + (entry.debit === '-' ? 0 : parseFloat(entry.debit)), 0);
//     const totalCredit = ledgerEntries.reduce((acc, entry) => acc + (entry.credit === '-' ? 0 : parseFloat(entry.credit)), 0);
    
//     const resultWithBalance = ledgerEntries.map((entry) => {
//       runningBalance += (entry.debit === '-' ? 0 : parseFloat(entry.debit)) - (entry.credit === '-' ? 0 : parseFloat(entry.credit));
//       const balance = Math.abs(runningBalance);

//       return { ...entry, balance };
//     });

//     const totalDebitPKR = `PKR ${totalDebit.toFixed(2)}`;
//     const totalCreditPKR = `PKR ${totalCredit.toFixed(2)}`;

//     if (format === 'pdf') {
//       await generatePDFReport(res, ledgerEntries[0], resultWithBalance, start_date, end_date, totalDebitPKR, totalCreditPKR, Math.abs(runningBalance));
//     } else if (format === 'excel') {
//       await generateExcelReport(res, ledgerEntries[0], resultWithBalance, start_date, end_date, totalDebitPKR, totalCreditPKR, Math.abs(runningBalance));
//     } else {
//       res.status(400).json({ message: "Invalid format specified. Use 'pdf' or 'excel'." });
//     }
//   } catch (error) {
//     console.error('Error generating report:', error);
//     res.status(500).json({ message: "Error generating report", error: error.message });
//   }
// };
import { generatePDFReport } from "../reports/generatePDFReport.js";
import { generateExcelReport } from "../reports/generateExcelReport.js";
import pool from "../config/database.js";

export const generateLedgerReport = async (req, res) => {
  const { vendor_name } = req.params;
  const { start_date, end_date, format } = req.query;

  try {
    let query = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY l.date) AS s_no, 
        v.company_name, 
        v.contact_number, 
        v.bank_details,
        l.date, 
        l.challan_no, 
        l.description, 
        l.quantity, 
        l.debit, 
        l.credit, 
        l.payment_method,
        l.price_per_meter
      FROM ledgers l
      JOIN vendors v ON l.vendor_name = v.company_name
      WHERE l.vendor_name = ?`;

    const queryParams = [vendor_name];
    if (start_date && end_date) {
      query += " AND l.date BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    }

    query += " ORDER BY l.date";

    const [ledgerEntries] = await pool.execute(query, queryParams);

    if (ledgerEntries.length === 0) {
      return res.status(404).json({ message: "Vendor not found or no ledger entries for the given dates." });
    }

    const vendorDetails = {
      company_name: ledgerEntries[0].company_name,
      contact_number: ledgerEntries[0].contact_number,
      bank_details: ledgerEntries[0].bank_details,
    };

    const fileFormat = format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf";
    res.setHeader("Content-Type", fileFormat);
    res.setHeader("Content-Disposition", `attachment; filename="${vendorDetails.company_name}_ledger_report.${format}"`);

    if (format === "pdf") {
      await generatePDFReport(res, vendorDetails, ledgerEntries, start_date, end_date);
    } else if (format === "excel") {
      await generateExcelReport(res, vendorDetails, ledgerEntries, start_date, end_date);
    } else {
      return res.status(400).json({ message: "Invalid format specified. Please use 'pdf' or 'excel'." });
    }

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "An error occurred while generating the report.", error: error.message });
  }
};
