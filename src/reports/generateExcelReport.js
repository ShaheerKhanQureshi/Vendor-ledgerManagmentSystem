import ExcelJS from "exceljs"
import { reportFonts, formatCurrency } from "../utils/reportStyles.js"

export const generateExcelReport = async (res, vendorDetails, ledgerEntries, start_date, end_date) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Ledger Report", {
    views: [{ state: "frozen", ySplit: 7 }],
    properties: { defaultRowHeight: 20 },
  })

  // Calculate opening balance
  let openingBalance = 0
  ledgerEntries.forEach((entry) => {
    if (entry.date < (start_date || entry.date)) {
      openingBalance += Number.parseFloat(entry.debit || 0) - Number.parseFloat(entry.credit || 0)
    }
  })

  // Styling
  const styles = {
    header: {
      font: { name: reportFonts.primary, bold: true, size: 20 },
      alignment: { horizontal: "center", vertical: "middle" },
    },
    companyInfo: {
      font: { name: reportFonts.secondary, size: 11 },
      alignment: { horizontal: "left", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F7" },
      },
    },
    tableHeader: {
      font: { name: reportFonts.secondary, bold: true, size: 11 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F7" },
      },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      border: {
        top: { style: "thin", color: { argb: "FFE5E5E5" } },
        bottom: { style: "thin", color: { argb: "FFE5E5E5" } },
      },
    },
    cell: {
      font: { name: reportFonts.secondary, size: 10 },
      alignment: { vertical: "middle", wrapText: true },
    },
    number: {
      font: { name: reportFonts.secondary, size: 10 },
      alignment: { horizontal: "right", vertical: "middle" },
    },
    summary: {
      font: { name: reportFonts.secondary, bold: true, size: 11 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F7" },
      },
      alignment: { horizontal: "right", vertical: "middle" },
    },
  }

  // Title
  worksheet.mergeCells("A1:H1")
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "Ledger Report"
  titleCell.style = styles.header

  // Company Information
  const companyInfo = [
    `Company Name: ${vendorDetails.company_name}`,
    `Contact: ${vendorDetails.contact_number}`,
    `Bank Details: ${vendorDetails.bank_details}`,
    start_date && end_date ? `Period: ${start_date} to ${end_date}` : "",
  ].filter(Boolean)

  companyInfo.forEach((info, index) => {
    const row = index + 2
    worksheet.mergeCells(`A${row}:H${row}`)
    const cell = worksheet.getCell(`A${row}`)
    cell.value = info
    cell.style = styles.companyInfo
  })

  // Opening Balance
  const openingBalanceRow = companyInfo.length + 2
  worksheet.mergeCells(`A${openingBalanceRow}:H${openingBalanceRow}`)
  const balanceCell = worksheet.getCell(`A${openingBalanceRow}`)
  balanceCell.value = `Opening Balance: ${formatCurrency(openingBalance)}`
  balanceCell.style = { ...styles.companyInfo, font: { ...styles.companyInfo.font, bold: true } }

  // Headers
  const headerRow = worksheet.addRow([
    "Date",
    "Challan No",
    "Description",
    "Quantity",
    "Price/M",
    "Debit",
    "Credit",
    "Balance",
  ])
  headerRow.eachCell((cell) => {
    cell.style = styles.tableHeader
  })

  // Column widths
  worksheet.columns = [
    { width: 12 },
    { width: 12 },
    { width: 35 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
  ]

  // Data
  let balance = openingBalance
  let totalDebit = 0
  let totalCredit = 0

  ledgerEntries.forEach((entry, index) => {
    const debit = Number.parseFloat(entry.debit || 0)
    const credit = Number.parseFloat(entry.credit || 0)

    totalDebit += debit
    totalCredit += credit
    balance += debit - credit

    const descriptions = entry.description?.split(",").map((d) => d.trim()) || ["-"]
    const quantities = entry.quantity
      ?.toString()
      .split(",")
      .map((q) => q.trim()) || ["-"]
    const prices = entry.price_per_meter
      ?.toString()
      .split(",")
      .map((p) => p.trim()) || ["-"]

    descriptions.forEach((desc, i) => {
      const row = worksheet.addRow([
        i === 0 ? entry.date.toISOString().split("T")[0] : "",
        i === 0 ? entry.challan_no || "-" : "",
        desc,
        quantities[i] || "-",
        prices[i] || "-",
        i === 0 ? debit || "-" : "",
        i === 0 ? credit || "-" : "",
        i === 0 ? formatCurrency(balance) : "",
      ])

      // Apply styles
      row.eachCell((cell, colNumber) => {
        cell.style = [6, 7, 8].includes(colNumber) ? styles.number : styles.cell

        if (index % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFAFAFA" },
          }
        }
      })
    })
  })

  // Summary
  worksheet.addRow([]) // Spacing

  const summaryData = [
    ["Total Debit:", totalDebit],
    ["Total Credit:", totalCredit],
    ["Closing Balance:", balance],
  ]

  summaryData.forEach(([label, value]) => {
    const row = worksheet.addRow(["", "", "", "", label, "", "", formatCurrency(value)])
    row.getCell(5).style = styles.summary
    row.getCell(8).style = styles.summary
  })

  // Generate and send file
  const buffer = await workbook.xlsx.writeBuffer()

  res.end(Buffer.from(buffer))
}

