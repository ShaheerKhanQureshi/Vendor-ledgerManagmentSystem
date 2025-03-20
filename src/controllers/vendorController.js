import pool from "../config/database.js";

export const createVendor = async (req, res) => {
  const { company_name, supplier_name, contact_number, bank_details } = req.body;

  if (typeof company_name !== 'string' || company_name.trim() === '') {
    return res.status(400).json({ message: "Company name must be a valid string" });
  }
  if (typeof supplier_name !== 'string' || supplier_name.trim() === '') {
    return res.status(400).json({ message: "Supplier name must be a valid string" });
  }
  if (typeof contact_number !== 'string' || contact_number.trim() === '') {
    return res.status(400).json({ message: "Contact number must be a valid string" });
  }
  if (typeof bank_details !== 'string' || bank_details.trim() === '') {
    return res.status(400).json({ message: "Bank details must be a valid string" });
  }

  try {
 
    const [existingVendor] = await pool.query(
      "SELECT * FROM vendors WHERE company_name = ?",
      [company_name]
    );

    if (existingVendor.length > 0) {
      return res.status(400).json({ message: "Vendor with this company name already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO vendors (company_name, supplier_name, contact_number, bank_details) VALUES (?, ?, ?, ?)",
      [company_name, supplier_name, contact_number, bank_details]
    );

    await pool.query(
      "INSERT INTO ledgers (vendor_name) VALUES (?)",
      [company_name] 
    );

    res.status(201).json({ message: "Vendor created successfully", vendorId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Error creating vendor", error: error.message });
  }
};
export const deleteVendor = async (req, res) => {
  const { id } = req.params;

  if (!Number(id)) {
    return res.status(400).json({ message: "Invalid vendor ID" });
  }

  try {

    const [vendorResult] = await pool.query("SELECT company_name FROM vendors WHERE id = ?", [id]);

    if (vendorResult.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const companyName = vendorResult[0].company_name;

    const [deleteVendorResult] = await pool.query("DELETE FROM vendors WHERE id = ?", [id]);

    if (deleteVendorResult.affectedRows === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ message: "Vendor and corresponding ledger deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vendor and ledger", error: error.message });
  }
};

export const updateVendor = async (req, res) => {
  const { id } = req.params;
  const { company_name, supplier_name, contact_number, bank_details } = req.body;

  if (!Number(id)) {
    return res.status(400).json({ message: "Invalid vendor ID" });
  }
  if (typeof company_name !== 'string' || company_name.trim() === '') {
    return res.status(400).json({ message: "Company name must be a valid string" });
  }
  if (typeof supplier_name !== 'string' || supplier_name.trim() === '') {
    return res.status(400).json({ message: "Supplier name must be a valid string" });
  }
  if (typeof contact_number !== 'string' || contact_number.trim() === '') {
    return res.status(400).json({ message: "Contact number must be a valid string" });
  }
  if (typeof bank_details !== 'string' || bank_details.trim() === '') {
    return res.status(400).json({ message: "Bank details must be a valid string" });
  }

  try {
    // First, update the vendor in the vendors table
    const [updateResult] = await pool.query(
      "UPDATE vendors SET company_name = ?, supplier_name = ?, contact_number = ?, bank_details = ? WHERE id = ?",
      [company_name, supplier_name, contact_number, bank_details, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Update the vendor_name in the ledger table (this should cascade automatically if FK is set properly)
    await pool.query(
      "UPDATE ledgers SET vendor_name = ? WHERE vendor_name = ?",
      [company_name, req.body.old_company_name]
    );

    res.status(200).json({ message: "Vendor and ledger updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating vendor", error: error.message });
  }
};


export const getAllVendors = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY id) as s_no,
        id,
        company_name,
        supplier_name,
        contact_number,
        bank_details
      FROM vendors
      ORDER BY company_name
    `)

    res.status(200).json(result)  
  } catch (error) {
    res.status(500).json({ message: "Error getting vendors", error: error.message })
  }
}

export const getLedgerForVendor = async (req, res) => {
  const { vendor_name } = req.params;

  try {
    const [result] = await pool.query(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY id) as s_no,
        id,
        vendor_name,
        date,
        balance,
        debit,
        credit,
        challan_no,
        description,
        quantity,
        payment_method
      FROM ledgers
      WHERE vendor_name = ? AND is_initial_entry = 0  -- Exclude initial ledger entry
      ORDER BY date DESC
    `, [vendor_name])

    res.status(200).json(result)  
  } catch (error) {
    res.status(500).json({ message: "Error fetching ledger entries", error: error.message })
  }
}


export const getVendorByName = async (req, res) => {
  const { company_name } = req.params;

  try {
    const [vendor] = await pool.query("SELECT * FROM vendors WHERE company_name = ?", [company_name]);

    if (vendor.length === 0) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    return res.status(200).json(vendor[0]);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving vendor.", error: error.message });
  }
};
