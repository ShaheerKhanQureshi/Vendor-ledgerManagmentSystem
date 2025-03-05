
// import pool from "../config/database.js"

// export const getVendorsList = async (req, res) => {
//   try {
//     const [vendors] = await pool.query("SELECT company_name FROM vendors ORDER BY company_name")
//     res.status(200).json(vendors)
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching vendors list", error: error.message })
//   }
// }

// export const createLedger = async (req, res) => {
//   const { vendor_name, date, challan_no, payment_method, descriptions, quantities, price_per_meters, debits, credits } = req.body;

//   try {
//     const maxLength = Math.max(descriptions.length, quantities.length, price_per_meters.length);

//     // Pad the arrays to ensure all arrays are the same length
//     while (descriptions.length < maxLength) descriptions.push("Unknown Description");
//     while (quantities.length < maxLength) quantities.push(0);
//     while (price_per_meters.length < maxLength) price_per_meters.push("-");

//     const combinedDescriptions = descriptions.join(", ");
//     const combinedQuantities = quantities.join(", ");
//     const combinedPrices = price_per_meters.join(", ");
//     const combinedDebits = debits.join(", ");
//     const combinedCredits = credits.join(", ");

//     const query = `
//       INSERT INTO ledgers (vendor_name, date, challan_no, description, quantity, debit, credit, payment_method, price_per_meter)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     await pool.query(query, [
//       vendor_name,
//       date,
//       challan_no,
//       combinedDescriptions,
//       combinedQuantities,
//       combinedDebits,
//       combinedCredits,
//       payment_method,
//       combinedPrices
//     ]);

//     res.status(201).json({ message: "Ledger entry created successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating ledger entry", error: error.message });
//   }
// };

// export const updateLedger = async (req, res) => {
//   const { id } = req.params;
//   const { date, challan_no, descriptions, quantities, debits, credits, payment_method, vendor_name, price_per_meters } = req.body;

//   try {
//     const combinedDescriptions = descriptions.join(", ");
//     const combinedQuantities = quantities.join(", ");
//     const combinedPrices = price_per_meters.join(", ");
//     const combinedDebits = debits.join(", ");
//     const combinedCredits = credits.join(", ");

//     await pool.query("DELETE FROM ledgers WHERE id = ?", [id]);

//     const query = `
//       INSERT INTO ledgers (vendor_name, date, challan_no, description, quantity, debit, credit, payment_method, price_per_meter)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     await pool.query(query, [
//       vendor_name,
//       date,
//       challan_no,
//       combinedDescriptions,
//       combinedQuantities,
//       combinedDebits,
//       combinedCredits,
//       payment_method,
//       combinedPrices
//     ]);

//     if (vendor_name) {
//       await pool.query(
//         "UPDATE vendors SET company_name = ? WHERE company_name = ?",
//         [vendor_name, vendor_name]
//       );
//     }

//     res.status(200).json({ message: "Ledger entry updated successfully", id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating ledger entry", error: error.message });
//   }
// };

// export const deleteLedger = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query("DELETE FROM ledgers WHERE id = ?", [id]);
//     res.status(200).json({ message: "Ledger entry deleted successfully", id });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting ledger entry", error: error.message });
//   }
// };

// export const getLedgersByCompany = async (req, res) => {
//   const { vendor_name } = req.params;
//   try {
//     const [result] = await pool.query(
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
//       ORDER BY l.date`,
//       [vendor_name]
//     );

//     let runningBalance = 0;
//     const totalDebit = result.reduce((acc, entry) => acc + (entry.debit === '-' ? 0 : parseFloat(entry.debit)), 0);
//     const totalCredit = result.reduce((acc, entry) => acc + (entry.credit === '-' ? 0 : parseFloat(entry.credit)), 0);
//     const ledgerCount = result.length;

//     const resultWithBalance = result.map((entry) => {
//       runningBalance += (entry.debit === '-' ? 0 : parseFloat(entry.debit)) - (entry.credit === '-' ? 0 : parseFloat(entry.credit));
//       const balance = Math.abs(runningBalance);

//       return { ...entry, balance };
//     });
//     const totalDebitPKR = `PKR ${totalDebit.toFixed(2)}`;
//     const totalCreditPKR = `PKR ${totalCredit.toFixed(2)}`;

//     res.status(200).json({
//       ledgerCount,
//       totalDebit: totalDebitPKR,
//       totalCredit: totalCreditPKR,
//       totalBalance: Math.abs(runningBalance),  
//       ledgers: resultWithBalance,
//       id: vendor_name
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error getting ledger entries", error: error.message });
//   }
// };

// export const getLedgersByDateRange = async (req, res) => {
//   const { vendor_name, start_date, end_date } = req.query;
//   try {
//     const [result] = await pool.query(
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
//       WHERE l.vendor_name = ? AND l.date BETWEEN ? AND ? 
//       ORDER BY l.date`,
//       [vendor_name, start_date, end_date]
//     );
//     let runningBalance = 0;
//     const resultWithBalance = result.map((entry) => {
//       runningBalance += (entry.debit === '-' ? 0 : entry.debit) - (entry.credit === '-' ? 0 : entry.credit);
//       return { ...entry, balance: runningBalance };
//     });
//     res.status(200).json(resultWithBalance);
//   } catch (error) {
//     res.status(500).json({ message: "Error getting ledger entries", error: error.message });
//   }
// };


// export const getAllLedgers = async (req, res) => {
//   try {
//     const [result] = await pool.query(
//       `SELECT 
//         ROW_NUMBER() OVER (ORDER BY l.date) as s_no, 
//         v.company_name, 
//         v.contact_number as phone_no, 
//         l.date, 
//         l.challan_no, 
//         GROUP_CONCAT(l.description ORDER BY l.id) AS descriptions,
//         GROUP_CONCAT(l.quantity ORDER BY l.id) AS quantities,
//         GROUP_CONCAT(l.price_per_meter ORDER BY l.id) AS price_per_meters,
//         SUM(l.debit) AS debit, 
//         SUM(l.credit) AS credit, 
//         l.payment_method
//       FROM ledgers l 
//       JOIN vendors v ON l.vendor_name = v.company_name 
//       GROUP BY l.challan_no, l.date, v.company_name, l.payment_method
//       ORDER BY l.date`
//     );

//     let runningBalance = 0;
//     const resultWithBalance = result.map((entry) => {
//       runningBalance += entry.debit - entry.credit;
//       return { ...entry, balance: runningBalance };
//     });

//     res.status(200).json(resultWithBalance);
//   } catch (error) {
//     res.status(500).json({ message: "Error getting all ledger entries", error: error.message });
//   }
// };

// export const getAllCompaniesWithLedgers = async (req, res) => {
//   try {
//     const [result] = await pool.query(`
//       SELECT 
//         v.id as vendor_id,
//         v.company_name, 
//         v.supplier_name,
//         v.contact_number as phone_no,
//         ABS(l.balance) as balance,
//         l.created_at
//       FROM (
//         SELECT 
//           vendor_name,
//           SUM(debit - credit) OVER (PARTITION BY vendor_name ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as balance,
//           created_at,
//           ROW_NUMBER() OVER (PARTITION BY vendor_name ORDER BY created_at DESC) as row_num
//         FROM ledgers
//       ) l
//       JOIN vendors v ON v.company_name = l.vendor_name
//       WHERE l.row_num = 1
//       ORDER BY v.company_name;
//     `);

//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error getting vendors with ledgers", error: error.message });
//   }
// };

// export const getLedgerByVendorNameForEntryPage = async (req, res) => {
//   const { company } = req.params;
//   try {
//     const [result] = await pool.query(
//       "SELECT company_name FROM vendors WHERE company_name = ?",
//       [company]
//     );
//     if (result.length > 0) {
//       res.status(200).json({ message: "Company found", companyName: company, id: company });
//     } else {
//       res.status(404).json({ message: "Company not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching company details", error: error.message });
//   }
// };

import pool from "../config/database.js";

const executeQuery = async (query, params) => {
  try {
    const [result] = await pool.query(query, params);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getVendorsList = async (req, res) => {
  try {
    const vendors = await executeQuery("SELECT company_name FROM vendors ORDER BY company_name");
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendors list", error: error.message });
  }
};

export const createLedger = async (req, res) => {
  const { vendor_name, date, challan_no, payment_method, descriptions, quantities, price_per_meters, debit, credit } = req.body;

  try {
    if (!vendor_name || !date || !challan_no) {
      return res.status(400).json({ message: "Vendor name, date, and challan number are required" });
    }

    const maxLength = Math.max(descriptions.length, quantities.length, price_per_meters.length);
    while (descriptions.length < maxLength) descriptions.push("Unknown Description");
    while (quantities.length < maxLength) quantities.push(0);
    while (price_per_meters.length < maxLength) price_per_meters.push("-");

    const combinedDescriptions = descriptions.join(", ");
    const combinedQuantities = quantities.join(", ");
    const combinedPrices = price_per_meters.join(", ");

    const query = `
      INSERT INTO ledgers (vendor_name, date, challan_no, description, quantity, debit, credit, payment_method, price_per_meter)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [
      vendor_name,
      date,
      challan_no,
      combinedDescriptions,
      combinedQuantities,
      debit,
      credit,
      payment_method,
      combinedPrices
    ]);

    const balance = Math.abs(debit - credit);

    res.status(201).json({ message: "Ledger entry created successfully", balance });
  } catch (error) {
    res.status(500).json({ message: "Error creating ledger entry", error: error.message });
  }
};


export const updateLedger = async (req, res) => {
  const { id } = req.params;
  const { date, challan_no, descriptions, quantities, debit, credit, payment_method, vendor_name, price_per_meters } = req.body;

  try {
    if (!vendor_name || !date || !challan_no || !id) {
      return res.status(400).json({ message: "Vendor name, date, challan number, and ID are required" });
    }

    const combinedDescriptions = descriptions.join(", ");
    const combinedQuantities = quantities.join(", ");
    const combinedPrices = price_per_meters.join(", ");

    await pool.getConnection(async (err, connection) => {
      if (err) throw err;

      try {
        await connection.beginTransaction();

        await connection.query("DELETE FROM ledgers WHERE id = ?", [id]);

        const query = `
          INSERT INTO ledgers (vendor_name, date, challan_no, description, quantity, debit, credit, payment_method, price_per_meter)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [
          vendor_name,
          date,
          challan_no,
          combinedDescriptions,
          combinedQuantities,
          debit,
          credit,
          payment_method,
          combinedPrices
        ]);

        await connection.commit();
        res.status(200).json({ message: "Ledger entry updated successfully", id });
      } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Error updating ledger entry", error: error.message });
      } finally {
        connection.release();
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating ledger entry", error: error.message });
  }
};

export const deleteLedger = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await executeQuery("DELETE FROM ledgers WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ledger entry not found" });
    }
    res.status(200).json({ message: "Ledger entry deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting ledger entry", error: error.message });
  }
};

export const getLedgersByCompany = async (req, res) => {
  const { vendor_name } = req.params;
  try {
    const result = await executeQuery(`
      SELECT 
        l.id,  
        ROW_NUMBER() OVER (ORDER BY l.date) as s_no, 
        v.company_name, 
        v.contact_number as phone_no, 
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
      WHERE l.vendor_name = ? 
      ORDER BY l.date`, [vendor_name]);

    const totalDebit = result.reduce((acc, entry) => acc + (entry.debit === '-' ? 0 : parseFloat(entry.debit)), 0);
    const totalCredit = result.reduce((acc, entry) => acc + (entry.credit === '-' ? 0 : parseFloat(entry.credit)), 0);
    const ledgerCount = result.length;

    const resultWithBalance = result.map((entry) => {
      // Calculate balance per row based on debit and credit
      const debitValue = entry.debit === '-' ? 0 : parseFloat(entry.debit);
      const creditValue = entry.credit === '-' ? 0 : parseFloat(entry.credit);
      const balance = Math.abs(debitValue - creditValue);

      return { ...entry, balance };
    });

    const totalDebitPKR = `PKR ${totalDebit.toFixed(2)}`;
    const totalCreditPKR = `PKR ${totalCredit.toFixed(2)}`;

    res.status(200).json({
      ledgerCount,
      totalDebit: totalDebitPKR,
      totalCredit: totalCreditPKR,
      totalBalance: Math.abs(totalDebit - totalCredit),  // Total balance considering all entries
      ledgers: resultWithBalance,
      id: vendor_name
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting ledger entries", error: error.message });
  }
};


export const getLedgersByDateRange = async (req, res) => {
  const { vendor_name, start_date, end_date } = req.query;
  try {
    const result = await executeQuery(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY l.date) as s_no, 
        v.company_name, 
        v.contact_number as phone_no, 
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
      WHERE l.vendor_name = ? AND l.date BETWEEN ? AND ? 
      ORDER BY l.date`, [vendor_name, start_date, end_date]);

    let runningBalance = 0;
    const resultWithBalance = result.map((entry) => {
      runningBalance += (entry.debit === '-' ? 0 : entry.debit) - (entry.credit === '-' ? 0 : entry.credit);
      return { ...entry, balance: runningBalance };
    });

    res.status(200).json(resultWithBalance);
  } catch (error) {
    res.status(500).json({ message: "Error getting ledger entries", error: error.message });
  }
};

export const getAllLedgers = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY l.date) as s_no, 
        v.company_name, 
        v.contact_number as phone_no, 
        l.date, 
        l.challan_no, 
        GROUP_CONCAT(l.description ORDER BY l.id) AS descriptions,
        GROUP_CONCAT(l.quantity ORDER BY l.id) AS quantities,
        GROUP_CONCAT(l.price_per_meter ORDER BY l.id) AS price_per_meters,
        SUM(l.debit) AS debit, 
        SUM(l.credit) AS credit, 
        l.payment_method
      FROM ledgers l 
      JOIN vendors v ON l.vendor_name = v.company_name 
      GROUP BY l.challan_no, l.date, v.company_name, l.payment_method
      ORDER BY l.date`);

    let runningBalance = 0;
    const resultWithBalance = result.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return { ...entry, balance: runningBalance };
    });

    res.status(200).json(resultWithBalance);
  } catch (error) {
    res.status(500).json({ message: "Error getting all ledger entries", error: error.message });
  }
};

export const getAllCompaniesWithLedgers = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        v.id as vendor_id,
        v.company_name, 
        v.supplier_name,
        v.contact_number as phone_no,
        ABS(l.balance) as balance,
        l.created_at
      FROM (
        SELECT 
          vendor_name,
          SUM(debit - credit) OVER (PARTITION BY vendor_name ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as balance,
          created_at,
          ROW_NUMBER() OVER (PARTITION BY vendor_name ORDER BY created_at DESC) as row_num
        FROM ledgers
      ) l
      JOIN vendors v ON v.company_name = l.vendor_name
      WHERE l.row_num = 1
      ORDER BY v.company_name`);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error getting vendors with ledgers", error: error.message });
  }
};

export const getLedgerByVendorNameForEntryPage = async (req, res) => {
  const { company } = req.params;
  try {
    const result = await executeQuery("SELECT company_name FROM vendors WHERE company_name = ?", [company]);
    if (result.length > 0) {
      res.status(200).json({ message: "Company found", companyName: company, id: company });
    } else {
      res.status(404).json({ message: "Company not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching company details", error: error.message });
  }
};
