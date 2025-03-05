import pool from "../config/database.js";

export const getDashboardData = async (req, res) => {
  try {
    const [totalLedgersResult] = await pool.query("SELECT COUNT(*) AS totalLedgers FROM ledgers");
    const totalLedgers = totalLedgersResult[0].totalLedgers;

    const [totalVendorsResult] = await pool.query("SELECT COUNT(*) AS totalVendors FROM vendors");
    const totalVendors = totalVendorsResult[0].totalVendors;

    const [totalCreditResult] = await pool.query("SELECT SUM(credit) AS totalCredit FROM ledgers");
    const totalCredit = totalCreditResult[0].totalCredit || 0;

    const [totalDebitResult] = await pool.query("SELECT SUM(debit) AS totalDebit FROM ledgers");
    const totalDebit = totalDebitResult[0].totalDebit || 0;

    // Ensure total balance is non-negative by using absolute value
    const totalBalance = Math.abs(totalDebit - totalCredit);

    const [topFiveLedgers] = await pool.query(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY (l.debit + l.credit) DESC) AS s_no,
        l.vendor_name, 
        l.date, 
        l.challan_no, 
        l.description, 
        l.debit, 
        l.credit, 
        (l.debit + l.credit) AS transaction_amount
      FROM ledgers l
      ORDER BY transaction_amount DESC
      LIMIT 5
    `);

    const [topFiveVendors] = await pool.query(`
      SELECT 
        v.company_name, 
        COUNT(l.id) AS ledger_count
      FROM vendors v
      LEFT JOIN ledgers l ON v.company_name = l.vendor_name
      GROUP BY v.company_name
      ORDER BY ledger_count DESC
      LIMIT 5
    `);

    res.status(200).json({
      totalLedgers,
      totalVendors,
      totalCredit,
      totalDebit,
      totalBalance, // Display the absolute balance here
      topFiveLedgers,
      topFiveVendors,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting dashboard data", error: error.message });
  }
}

// export const getDashboardData = async (req, res) => {
//   try {
//     const [totalLedgersResult] = await pool.query("SELECT COUNT(*) AS totalLedgers FROM ledgers");
//     const totalLedgers = totalLedgersResult[0].totalLedgers;

//     const [totalVendorsResult] = await pool.query("SELECT COUNT(*) AS totalVendors FROM vendors");
//     const totalVendors = totalVendorsResult[0].totalVendors;

//     const [totalCreditResult] = await pool.query("SELECT SUM(credit) AS totalCredit FROM ledgers");
//     const totalCredit = totalCreditResult[0].totalCredit || 0;

//     const [totalDebitResult] = await pool.query("SELECT SUM(debit) AS totalDebit FROM ledgers");
//     const totalDebit = totalDebitResult[0].totalDebit || 0;

//     const totalBalance = totalDebit - totalCredit;

//     const [topFiveLedgers] = await pool.query(`
//       SELECT 
//         ROW_NUMBER() OVER (ORDER BY (l.debit + l.credit) DESC) AS s_no,
//         l.vendor_name, 
//         l.date, 
//         l.challan_no, 
//         l.description, 
//         l.debit, 
//         l.credit, 
//         (l.debit + l.credit) AS transaction_amount
//       FROM ledgers l
//       ORDER BY transaction_amount DESC
//       LIMIT 5
//     `);

//     const [topFiveVendors] = await pool.query(`
//       SELECT 
//         v.company_name, 
//         COUNT(l.id) AS ledger_count
//       FROM vendors v
//       LEFT JOIN ledgers l ON v.company_name = l.vendor_name
//       GROUP BY v.company_name
//       ORDER BY ledger_count DESC
//       LIMIT 5
//     `);

//     res.status(200).json({
//       totalLedgers,
//       totalVendors,
//       totalCredit,
//       totalDebit,
//       totalBalance,
//       topFiveLedgers,
//       topFiveVendors,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error getting dashboard data", error: error.message });
//   }
// }
