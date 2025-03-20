
import pool from "../config/database.js"

const executeQuery = async (query, params) => {
  try {
    const [result] = await pool.query(query, params)
    return result
  } catch (error) {
    throw new Error(error.message)
  }
}

export const getVendorsList = async (req, res) => {
  try {
    const vendors = await executeQuery("SELECT company_name FROM vendors ORDER BY company_name")
    res.status(200).json(vendors)
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendors list", error: error.message })
  }
}

export const createLedger = async (req, res) => {
  const { vendor_name, date, challan_no, payment_method, cheque_number, descriptions, quantities, prices, units, debit, credit } =
    req.body

  try {
    if (!vendor_name || !date || !challan_no) {
      return res.status(400).json({ message: "Vendor name, date, and challan number are required" })
    }

    const maxLength = Math.max(descriptions.length, quantities.length, prices.length, units.length)
    while (descriptions.length < maxLength) descriptions.push("Unknown Description")
    while (quantities.length < maxLength) quantities.push(0)
    while (prices.length < maxLength) prices.push("-")
    while (units.length < maxLength) units.push("meter")

    const combinedDescriptions = descriptions.join(", ")
    const combinedQuantities = quantities.join(", ")
    const combinedPrices = prices.join(", ")
    const combinedUnits = units.join(", ")

    const query = `
      INSERT INTO ledgers (vendor_name, date, challan_no, description, quantity, debit, credit, payment_method, cheque_number, price, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await executeQuery(query, [
      vendor_name,
      date,
      challan_no,
      combinedDescriptions,
      combinedQuantities,
      debit,
      credit,
      payment_method,
      cheque_number,
      combinedPrices,
      combinedUnits,
    ])

    const balance = Math.abs(debit - credit)

    res.status(201).json({ message: "Ledger entry created successfully", balance })
  } catch (error) {
    res.status(500).json({ message: "Error creating ledger entry", error: error.message })
  }
}

export const updateLedger = async (req, res) => {
  const { id } = req.params;
  const { date, challan_no, descriptions, quantities, debit, credit, payment_method, cheque_number, vendor_name, prices, units } = req.body;

  try {
    if (!vendor_name || !date || !challan_no) {
      return res.status(400).json({ message: "Vendor name, date, and challan number are required" });
    }

    const combinedDescriptions = descriptions.join(", ");
    const combinedQuantities = quantities.join(", ");
    const combinedPrices = prices.join(", ");
    const combinedUnits = units.join(", ");

    const query = `
      UPDATE ledgers
      SET 
        vendor_name = ?, 
        date = ?, 
        challan_no = ?, 
        description = ?, 
        quantity = ?, 
        debit = ?, 
        credit = ?, 
        payment_method = ?,
        cheque_number = ?, 
        price = ?, 
        unit = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [
      vendor_name,
      date,
      challan_no,
      combinedDescriptions,
      combinedQuantities,
      debit,
      credit,
      payment_method,
      cheque_number,
      combinedPrices,
      combinedUnits,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ledger entry not found" });
    }

    res.status(200).json({ message: "Ledger entry updated successfully", id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating ledger entry", error: error.message });
  }
};

export const deleteLedger = async (req, res) => {
  const { id } = req.params
  try {
    const result = await executeQuery("DELETE FROM ledgers WHERE id = ?", [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ledger entry not found" })
    }
    res.status(200).json({ message: "Ledger entry deleted successfully", id })
  } catch (error) {
    res.status(500).json({ message: "Error deleting ledger entry", error: error.message })
  }
}

export const getLedgersByCompany = async (req, res) => {
  const { company } = req.params
  try {
    const result = await executeQuery(
      `
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
        l.cheque_number,
        l.price,
        l.unit
      FROM ledgers l 
      JOIN vendors v ON l.vendor_name = v.company_name 
      WHERE l.vendor_name = ? 
      ORDER BY l.date`,
      [company],
    )

    // Apply transformations such as calculating balance, etc.
    const resultWithBalance = result.map((entry) => {
      const debitValue = entry.debit === "-" ? 0 : Number.parseFloat(entry.debit)
      const creditValue = entry.credit === "-" ? 0 : Number.parseFloat(entry.credit)
      const balance = Math.abs(debitValue - creditValue)

      return { ...entry, balance }
    })

    const totalDebit = result.reduce(
      (acc, entry) => acc + (entry.debit === "-" ? 0 : Number.parseFloat(entry.debit)),
      0,
    )
    const totalCredit = result.reduce(
      (acc, entry) => acc + (entry.credit === "-" ? 0 : Number.parseFloat(entry.credit)),
      0,
    )
    const totalBalance = Math.abs(totalDebit - totalCredit)

    res.status(200).json({
      ledgerCount: result.length,
      totalDebit: `PKR ${totalDebit.toFixed(2)}`,
      totalCredit: `PKR ${totalCredit.toFixed(2)}`,
      totalBalance: `PKR ${totalBalance.toFixed(2)}`,
      ledgers: resultWithBalance,
      id: company,
    })
  } catch (error) {
    res.status(500).json({ message: "Error getting ledger entries", error: error.message })
  }
}

export const getLedgersByDateRange = async (req, res) => {
  const { vendor_name, start_date, end_date } = req.query
  try {
    const result = await executeQuery(
      `
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
        l.cheque_number,
        l.price,
        l.unit
      FROM ledgers l 
      JOIN vendors v ON l.vendor_name = v.company_name 
      WHERE l.vendor_name = ? AND l.date BETWEEN ? AND ? 
      ORDER BY l.date`,
      [vendor_name, start_date, end_date],
    )

    let runningBalance = 0
    const resultWithBalance = result.map((entry) => {
      runningBalance += (entry.debit === "-" ? 0 : entry.debit) - (entry.credit === "-" ? 0 : entry.credit)
      return { ...entry, balance: runningBalance }
    })

    res.status(200).json(resultWithBalance)
  } catch (error) {
    res.status(500).json({ message: "Error getting ledger entries", error: error.message })
  }
}

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
        GROUP_CONCAT(l.price ORDER BY l.id) AS prices,
        GROUP_CONCAT(l.unit ORDER BY l.id) AS units,
        SUM(l.debit) AS debit, 
        SUM(l.credit) AS credit, 
        l.payment_method
        l.cheque_number
      FROM ledgers l 
      JOIN vendors v ON l.vendor_name = v.company_name 
      GROUP BY l.challan_no, l.date, v.company_name, l.payment_method
      ORDER BY l.date`)

    let runningBalance = 0
    const resultWithBalance = result.map((entry) => {
      runningBalance += entry.debit - entry.credit
      return { ...entry, balance: runningBalance }
    })

    res.status(200).json(resultWithBalance)
  } catch (error) {
    res.status(500).json({ message: "Error getting all ledger entries", error: error.message })
  }
}

export const getAllCompaniesWithLedgers = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        v.id AS vendor_id,
        v.company_name, 
        v.supplier_name,
        v.contact_number AS phone_no,
        COALESCE(SUM(l.debit) - SUM(l.credit), 0) AS balance,  -- Final balance calculation
        MAX(l.created_at) AS created_at  -- Get the most recent ledger entry
      FROM ledgers l
      JOIN vendors v ON v.company_name = l.vendor_name
      GROUP BY v.id, v.company_name, v.supplier_name, v.contact_number
      ORDER BY v.company_name
    `)

    const companiesWithAbsoluteBalances = result.map((entry) => ({
      ...entry,
      balance: Math.abs(entry.balance), 
    }))

    
    const totalDebit = result.reduce((acc, entry) => acc + Math.abs(entry.balance > 0 ? entry.balance : 0), 0)
    const totalCredit = result.reduce((acc, entry) => acc + Math.abs(entry.balance < 0 ? -entry.balance : 0), 0)
    const totalBalance = result.reduce((acc, entry) => acc + Math.abs(entry.balance), 0)

    
    res.status(200).json({
      ledgerCount: result.length,
      totalDebit: `PKR ${totalDebit.toFixed(2)}`, 
      totalCredit: `PKR ${totalCredit.toFixed(2)}`,
      totalBalance: `PKR ${totalBalance.toFixed(2)}`,
      companies: companiesWithAbsoluteBalances, 
    })
  } catch (error) {
    res.status(500).json({ message: "Error getting vendors with ledgers", error: error.message })
  }
}

export const getLedgerByVendorNameForEntryPage = async (req, res) => {
  const { company } = req.params
  try {
    const result = await executeQuery("SELECT company_name FROM vendors WHERE company_name = ?", [company])
    if (result.length > 0) {
      res.status(200).json({ message: "Company found", companyName: company, id: company })
    } else {
      res.status(404).json({ message: "Company not found" })
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching company details", error: error.message })
  }
}

