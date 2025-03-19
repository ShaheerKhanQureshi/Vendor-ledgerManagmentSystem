// import { generatePDFReport } from "../reports/generatePDFReport.js"
// import { generateExcelReport } from "../reports/generateExcelReport.js"
// import pool from "../config/database.js"

// export const generateLedgerReport = async (req, res) => {
//   const { vendor_name } = req.params;
//   const { start_date, end_date, format } = req.query;

//   try {
//     // First get complete vendor details
//     const [vendorData] = await pool.execute(
//       "SELECT id, company_name, supplier_name, contact_number, bank_details FROM vendors WHERE company_name = ?",
//       [vendor_name]
//     );

//     if (vendorData.length === 0) {
//       return res.status(404).json({ message: "Vendor not found." });
//     }

//     const vendorDetails = vendorData[0];

//     // Then get ledger entries
//     let query = `
//     SELECT 
//     ROW_NUMBER() OVER (ORDER BY l.date) AS s_no, 
//     v.company_name, 
//     v.contact_number, 
//     v.bank_details,
//     l.date, 
//     l.challan_no, 
//     l.description, 
//     l.quantity, 
//     l.debit, 
//     l.credit, 
//     l.payment_method,
//     l.cheque_number,
//     l.price,
//     l.unit
//   FROM ledgers l
//   JOIN vendors v ON l.vendor_name = v.company_name
//   WHERE l.vendor_name = ?`;

//     const queryParams = [vendor_name];

//     if (start_date && end_date) {
//       query += " AND l.date BETWEEN ? AND ?";
//       queryParams.push(start_date, end_date);
//     }

//     query += " ORDER BY l.date";

//     const [ledgerEntries] = await pool.execute(query, queryParams);

//     if (ledgerEntries.length === 0) {
//       return res.status(404).json({ message: "No ledger entries found for the given dates." });
//     }

//     // Adjust ledger entries by adding quantity * price to debit
//     const adjustedLedgerEntries = ledgerEntries.map(entry => {
//       // Calculate price * quantity
//       const totalPrice = entry.quantity * entry.price;

//       // Add this to the existing debit
//       const calculatedDebit = entry.debit + totalPrice;

//       // Calculate the balance by subtracting debit and adding credit
//       let updatedBalance = calculatedDebit - entry.credit;

//       // Ensure all values (debit, credit, balance) are positive
//       const positiveDebit = Math.abs(calculatedDebit);
//       const positiveCredit = Math.abs(entry.credit);
//       const positiveBalance = Math.abs(updatedBalance);

//       return {
//         ...entry,
//         debit: positiveDebit,
//         credit: positiveCredit,
//         balance: positiveBalance,
//       };
//     });

//     const fileFormat =
//       format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf";
//     res.setHeader("Content-Type", fileFormat);
//     res.setHeader("Content-Disposition", `attachment; filename="${vendorDetails.company_name}_ledger_report.${format}"`);

//     if (format === "pdf") {
//       await generatePDFReport(res, vendorDetails, adjustedLedgerEntries, start_date, end_date);
//     } else if (format === "excel") {
//       await generateExcelReport(res, vendorDetails, adjustedLedgerEntries, start_date, end_date);
//     } else {
//       return res.status(400).json({ message: "Invalid format specified. Please use 'pdf' or 'excel'." });
//     }
//   } catch (error) {
//     console.error("Error generating report:", error);
//     res.status(500).json({ message: "An error occurred while generating the report.", error: error.message });
//   }
// };
import { generatePDFReport } from "../reports/generatePDFReport.js"
import { generateExcelReport } from "../reports/generateExcelReport.js"
import pool from "../config/database.js"

export const generateLedgerReport = async (req, res) => {
  const { vendor_name } = req.params
  const { start_date, end_date, format } = req.query

  try {
    // First get complete vendor details
    const [vendorData] = await pool.execute(
      "SELECT id, company_name, supplier_name, contact_number, bank_details FROM vendors WHERE company_name = ?",
      [vendor_name],
    )

    if (vendorData.length === 0) {
      return res.status(404).json({ message: "Vendor not found." })
    }

    const vendorDetails = vendorData[0]

    // Then get ledger entries
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
    l.cheque_number,
    l.price,
    l.unit
  FROM ledgers l
  JOIN vendors v ON l.vendor_name = v.company_name
  WHERE l.vendor_name = ?`

    const queryParams = [vendor_name]

    if (start_date && end_date) {
      query += " AND l.date BETWEEN ? AND ?"
      queryParams.push(start_date, end_date)
    }

    query += " ORDER BY l.date"

    const [ledgerEntries] = await pool.execute(query, queryParams)

    if (ledgerEntries.length === 0) {
      return res.status(404).json({ message: "No ledger entries found for the given dates." })
    }

    // Adjust ledger entries by calculating quantity * price and adding to debit
    const adjustedLedgerEntries = ledgerEntries.map((entry) => {
      // Initialize variables for calculations
      let totalPriceValue = 0

      // Process quantity and price if they exist and contain values
      if (entry.quantity && entry.price) {
        const quantities = entry.quantity.split(",").map((q) => Number.parseFloat(q.trim()) || 0)
        const prices = entry.price.split(",").map((p) => Number.parseFloat(p.trim()) || 0)

        // Calculate the sum of quantity * price for each pair
        for (let i = 0; i < Math.min(quantities.length, prices.length); i++) {
          totalPriceValue += quantities[i] * prices[i]
        }
      }

      // Get the original debit and credit values
      const originalDebit = Number.parseFloat(entry.debit || 0)
      const originalCredit = Number.parseFloat(entry.credit || 0)

      // Add the calculated price*quantity to the debit
      const calculatedDebit = originalDebit + totalPriceValue

      // Ensure all values are positive for display
      return {
        ...entry,
        debit: Math.abs(calculatedDebit),
        credit: Math.abs(originalCredit),
        // Store the calculated price*quantity for reference
        calculatedPrice: totalPriceValue,
      }
    })

    const fileFormat =
      format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf"
    res.setHeader("Content-Type", fileFormat)
    res.setHeader("Content-Disposition", `attachment; filename="${vendorDetails.company_name}_ledger_report.${format}"`)

    if (format === "pdf") {
      await generatePDFReport(res, vendorDetails, adjustedLedgerEntries, start_date, end_date)
    } else if (format === "excel") {
      await generateExcelReport(res, vendorDetails, adjustedLedgerEntries, start_date, end_date)
    } else {
      return res.status(400).json({ message: "Invalid format specified. Please use 'pdf' or 'excel'." })
    }
  } catch (error) {
    console.error("Error generating report:", error)
    res.status(500).json({ message: "An error occurred while generating the report.", error: error.message })
  }
}

