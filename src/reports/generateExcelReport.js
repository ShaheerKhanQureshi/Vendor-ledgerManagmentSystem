import ExcelJS from "exceljs"
import { reportFonts, formatCurrency } from "../utils/reportStyles.js"

export const generateExcelReport = async (res, vendorDetails, ledgerEntries, start_date, end_date) => {
  try {
  
    const sortedEntries = [...ledgerEntries].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Ledger Report", {
      views: [{ state: "frozen", ySplit: 13 }], 
      properties: { defaultRowHeight: 20 },
    })

    
    let openingBalance = 0,
      totalDebit = 0,
      totalCredit = 0
    
    
    ledgerEntries.forEach((entry) => {
      if (entry.date < (start_date || entry.date)) {
        openingBalance += Number.parseFloat(entry.credit || 0) - Number.parseFloat(entry.debit || 0)
      }
      totalDebit += Number.parseFloat(entry.debit || 0)
      totalCredit += Number.parseFloat(entry.credit || 0)
    })
    
    const finalBalance = openingBalance + totalCredit - totalDebit
      
    const totalTransactions = sortedEntries.length > 0 ? sortedEntries.length - 1 : 0
    
    const printDate = new Date().toLocaleString()

   
    const colors = {
      white: "FFFFFFFF",
      lightGray: "FFF8F9FA",
      borderGray: "FFE9ECEF",
      textDark: "FF212529",
      textMuted: "FF6C757D",
      primary: "FF000000",
    }

   
    const styles = {
      header: {
        font: { name: reportFonts.primary, bold: true, size: 16, color: { argb: colors.textDark } },
        alignment: { horizontal: "center", vertical: "middle" },
      },
      subheader: {
        font: { name: reportFonts.secondary, size: 10, color: { argb: colors.textMuted } },
        alignment: { horizontal: "left", vertical: "middle" },
      },
      dateHeader: {
        font: { name: reportFonts.secondary, size: 10, color: { argb: colors.textMuted } },
        alignment: { horizontal: "right", vertical: "middle" },
      },
      vendorDetails: {
        font: { name: reportFonts.secondary, bold: true, size: 10, color: { argb: colors.textDark } },
        alignment: { horizontal: "left", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colors.white },
        },
        border: {
          top: { style: "thin", color: { argb: colors.borderGray } },
          left: { style: "thin", color: { argb: colors.borderGray } },
          bottom: { style: "thin", color: { argb: colors.borderGray } },
          right: { style: "thin", color: { argb: colors.borderGray } },
        },
      },
      vendorInfo: {
        font: { name: reportFonts.secondary, size: 9, color: { argb: colors.textDark } },
        alignment: { horizontal: "left", vertical: "middle" },
      },
      cardTitle: {
        font: { name: reportFonts.secondary, size: 12, color: { argb: colors.textMuted } },
        alignment: { horizontal: "left", vertical: "middle" },
      },
      cardValue: {
        font: { name: reportFonts.secondary, bold: true, size: 18, color: { argb: colors.textDark } },
        alignment: { horizontal: "left", vertical: "middle" },
      },
      tableHeader: {
        font: { name: reportFonts.secondary, bold: true, size: 10, color: { argb: colors.textDark } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colors.white },
        },
        alignment: { horizontal: "left", vertical: "middle", wrapText: true },
        border: {
          top: { style: "thin", color: { argb: colors.borderGray } },
          left: { style: "thin", color: { argb: colors.borderGray } },
          bottom: { style: "thin", color: { argb: colors.borderGray } },
          right: { style: "thin", color: { argb: colors.borderGray } },
        },
      },
      cell: {
        font: { name: reportFonts.secondary, size: 9, color: { argb: colors.textDark } },
        alignment: { vertical: "middle", horizontal: "left", wrapText: true },
        border: {
          top: { style: "thin", color: { argb: colors.borderGray } },
          left: { style: "thin", color: { argb: colors.borderGray } },
          bottom: { style: "thin", color: { argb: colors.borderGray } },
          right: { style: "thin", color: { argb: colors.borderGray } },
        },
      },
      number: {
        font: { name: reportFonts.secondary, size: 9, color: { argb: colors.textDark } },
        alignment: { horizontal: "left", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: colors.borderGray } },
          left: { style: "thin", color: { argb: colors.borderGray } },
          bottom: { style: "thin", color: { argb: colors.borderGray } },
          right: { style: "thin", color: { argb: colors.borderGray } },
        },
      },
    }

  
    worksheet.mergeCells("A1:K1")
    const titleCell = worksheet.getCell("A1")
    titleCell.value = vendorDetails.company_name.toUpperCase()
    titleCell.style = styles.header
    
 
    if (start_date && end_date) {
      worksheet.mergeCells("A2:E2")
      const dateRangeCell = worksheet.getCell("A2")
      dateRangeCell.value = `Date Range: ${new Date(start_date).toLocaleDateString("en-GB")} - ${new Date(end_date).toLocaleDateString("en-GB")}`
      dateRangeCell.style = styles.subheader
    }
    
  
    worksheet.mergeCells("F2:K2")
    const generatedDateCell = worksheet.getCell("F2")
    generatedDateCell.value = `Generated on: ${printDate}`
    generatedDateCell.style = styles.dateHeader
    
  
    worksheet.mergeCells("A4:E6")
    const vendorBoxCell = worksheet.getCell("A4")
    vendorBoxCell.style = styles.vendorDetails
    
   
    const vendorTitleCell = worksheet.getCell("A4")
    vendorTitleCell.value = "Vendor Details:"
    vendorTitleCell.style = styles.vendorDetails
    
   
    worksheet.getCell("A5").value = `Company: ${vendorDetails.company_name}`
    worksheet.getCell("A5").style = styles.vendorInfo
    
    worksheet.getCell("A6").value = `Supplier: ${vendorDetails.supplier_name || "-"}`
    worksheet.getCell("A6").style = styles.vendorInfo
    
    worksheet.getCell("C5").value = `Contact: ${vendorDetails.contact_number || "-"}`
    worksheet.getCell("C5").style = styles.vendorInfo
    
    worksheet.getCell("C6").value = `Bank Details: ${vendorDetails.bank_details || "-"}`
    worksheet.getCell("C6").style = styles.vendorInfo
    
   
    worksheet.mergeCells("A8:B8")
    worksheet.getCell("A8").value = "Total Transactions"
    worksheet.getCell("A8").style = styles.cardTitle
    
    worksheet.mergeCells("A9:B9")
    worksheet.getCell("A9").value = totalTransactions.toString()
    worksheet.getCell("A9").style = styles.cardValue
    
   
    worksheet.mergeCells("C8:D8")
    worksheet.getCell("C8").value = "Total Balance"
    worksheet.getCell("C8").style = styles.cardTitle
    
    worksheet.mergeCells("C9:D9")
    worksheet.getCell("C9").value = formatCurrency(Math.abs(finalBalance))
    worksheet.getCell("C9").style = styles.cardValue
    
   
    worksheet.mergeCells("E8:F8")
    worksheet.getCell("E8").value = "Total Debit"
    worksheet.getCell("E8").style = styles.cardTitle
    
    worksheet.mergeCells("E9:F9")
    worksheet.getCell("E9").value = formatCurrency(totalDebit)
    worksheet.getCell("E9").style = styles.cardValue
    
   
    worksheet.mergeCells("G8:H8")
    worksheet.getCell("G8").value = "Total Credit"
    worksheet.getCell("G8").style = styles.cardTitle
    
    worksheet.mergeCells("G9:H9")
    worksheet.getCell("G9").value = formatCurrency(totalCredit)
    worksheet.getCell("G9").style = styles.cardValue
    
    
    const headerRow = 11
    const headers = [
      "Date", "Challan No", "Description", "Quantity", "Unit", 
      "Price", "Debit", "Credit", "Payment", "Cheque No", "Balance"
    ]
    
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(headerRow, index + 1)
      cell.value = header
      cell.style = styles.tableHeader
    })
    
   
    worksheet.columns = [
      { width: 12 },
      { width: 12 },
      { width: 20 },
      { width: 10 },
      { width: 8 },  
      { width: 10 }, 
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 12 },
      { width: 10 },
    ]
    
    
    let currentRow = headerRow + 1
    let currentBalance = openingBalance
    
   
    sortedEntries.forEach((entry, index) => {
      const debit = Number.parseFloat(entry.debit || 0)
      const credit = Number.parseFloat(entry.credit || 0)
      
   
      currentBalance = currentBalance + credit - debit
      
   
      const descriptions = entry.description
        ? entry.description.split(",").map((item) => item.trim())
        : ["Unknown Description"]
      const quantities = entry.quantity 
        ? entry.quantity.split(",").map((item) => item.trim()) 
        : ["0"]
      const prices = entry.price 
        ? entry.price.split(",").map((item) => item.trim()) 
        : ["-"]
      const units = entry.unit 
        ? entry.unit.split(",").map((item) => item.trim()) 
        : ["meter"]
      
      const maxItems = Math.max(descriptions.length, quantities.length, prices.length, units.length)
      
    
      while (descriptions.length < maxItems) descriptions.push("Unknown Description")
      while (quantities.length < maxItems) quantities.push("")
      while (prices.length < maxItems) prices.push("-")
      while (units.length < maxItems) units.push("meter")
      
   
      for (let i = 0; i < maxItems; i++) {
        const row = worksheet.getRow(currentRow + i)
        
     
        if (i === 0) {
          row.getCell(1).value = new Date(entry.date).toLocaleDateString("en-GB")
          row.getCell(2).value = entry.challan_no || "-"
          row.getCell(7).value = debit || "0"
          row.getCell(8).value = credit || "0"
          row.getCell(9).value = entry.payment_method || "cash"
          row.getCell(10).value = entry.cheque_number || "-"
          row.getCell(11).value = formatCurrency(Math.abs(currentBalance))
        }
        
      
        row.getCell(3).value = descriptions[i]
        row.getCell(4).value = quantities[i]
        row.getCell(5).value = units[i]
        row.getCell(6).value = prices[i] && prices[i] !== "-" ? `Rs ${prices[i]}` : "-"
        
      
        for (let col = 1; col <= 11; col++) {
          const cell = row.getCell(col)
          
        
          cell.style = [7, 8, 11].includes(col) ? styles.number : styles.cell
          
        
          if (index % 2 === 0) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: colors.lightGray },
            }
          }
        }
      }
      
   
      currentRow += maxItems
    })
    
   
    const buffer = await workbook.xlsx.writeBuffer()
    res.end(Buffer.from(buffer))
    
  } catch (error) {
    console.error("Error generating Excel report:", error)
    res.status(400).json({ error: "Failed to generate Excel report", details: error.message })
  }
}