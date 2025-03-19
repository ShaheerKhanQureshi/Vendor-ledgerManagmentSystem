// import PDFDocument from "pdfkit"

// export const generatePDFReport = async (res, vendorDetails, ledgerEntries, start_date, end_date) => {
//   try {
//     if (!res || !vendorDetails || !ledgerEntries) {
//       throw new Error("Invalid input parameters")
//     }
//     const doc = new PDFDocument({
//       margin: 40,
//       size: [842, 595],
//       bufferPages: true,
//     })

//     res.setHeader("Content-Type", "application/pdf")
//     res.setHeader("Content-Disposition", `attachment; filename="${vendorDetails.company_name}_ledger_report.pdf"`)
//     doc.pipe(res)

//     console.log("PDF Document initialized and piped to response")

//     // Calculate totals and balances
//     let openingBalance = 0,
//       totalDebit = 0,
//       totalCredit = 0
//     const totalTransactions = ledgerEntries.length

//     ledgerEntries.forEach((entry) => {
//       if (entry.date < (start_date || entry.date)) {
//         openingBalance += Number.parseFloat(entry.debit || 0) - Number.parseFloat(entry.credit || 0)
//       }
//       totalDebit += Number.parseFloat(entry.debit || 0)
//       totalCredit += Number.parseFloat(entry.credit || 0)
//     })

//     const finalBalance = openingBalance + totalDebit - totalCredit
//     const printDate = new Date().toLocaleString()

//     // Define colors to match the image
//     const colors = {
//       white: "#FFFFFF",
//       lightGray: "#F8F9FA",
//       borderGray: "#E9ECEF",
//       textDark: "#212529",
//       textMuted: "#6C757D",
//       primary: "#000000",
//     }

//     doc.font("Helvetica-Bold")
//       .fontSize(16)
//       .fillColor(colors.textDark)
//       .text(vendorDetails.company_name.toUpperCase(), {
//         align: "center",
//         underline: true
//       });

//     // Add date range if provided
//     if (start_date && end_date) {
//       doc.font("Helvetica").fontSize(10).fillColor(colors.textMuted)
//       doc.text(
//         `Date Range: ${new Date(start_date).toLocaleDateString("en-GB")} - ${new Date(end_date).toLocaleDateString("en-GB")}`,
//         50,
//         70,
//       )
//     }

//     // Add print date
//     doc.font("Helvetica").fontSize(10).fillColor(colors.textMuted)
//     doc.text(`Generated on: ${printDate}`, doc.page.width - 200, 50, { align: "right" })

//     // Add vendor details box
//     const vendorBoxY = 80
//     const vendorBoxHeight = 60
//     drawCard(doc, 50, vendorBoxY, 350, vendorBoxHeight, colors.white, colors.borderGray)

//     // Add vendor details
//     doc.font("Helvetica-Bold").fontSize(10).fillColor(colors.textDark)
//     doc.text("Vendor Details:", 60, vendorBoxY + 10)

//     doc.font("Helvetica").fontSize(9).fillColor(colors.textDark)
//     doc.text(`Company: ${vendorDetails.company_name}`, 60, vendorBoxY + 22)
//     doc.text(`Supplier: ${vendorDetails.supplier_name || "-"}`, 60, vendorBoxY + 34)
//     doc.text(`Contact: ${vendorDetails.contact_number || "-"}`, 60, vendorBoxY + 46)

//     doc.text(`Bank Details: ${vendorDetails.bank_details || "-"}`, 220, vendorBoxY + 22, {
//       width: 170,
//       align: "left",
//     })

//     // Draw summary cards (4 cards in a row) - moved down to accommodate vendor details
//     const cardY = vendorBoxY + vendorBoxHeight + 10
//     const cardHeight = 80
//     const cardWidth = (doc.page.width - 100 - 30) / 4 // 4 cards with 10px spacing between

//     // Format currency function
//     const formatCurrency = (amount) => {
//       return `Rs ${amount.toLocaleString("en-IN")}`
//     }

//     // Card 1: Total Transactions
//     drawCard(doc, 50, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
//     doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
//     doc.text("Total Transactions", 60, cardY + 15)
//     doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
//     doc.text(totalTransactions.toString(), 60, cardY + 40)

//     // Card 2: Total Balance
//     drawCard(doc, 50 + cardWidth + 10, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
//     doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
//     doc.text("Total Balance", 60 + cardWidth + 10, cardY + 15)
//     doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
//     doc.text(formatCurrency(Math.abs(finalBalance)), 60 + cardWidth + 10, cardY + 40)

//     // Card 3: Total Debit
//     drawCard(doc, 50 + (cardWidth + 10) * 2, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
//     doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
//     doc.text("Total Debit", 60 + (cardWidth + 10) * 2, cardY + 15)
//     doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
//     doc.text(formatCurrency(totalDebit), 60 + (cardWidth + 10) * 2, cardY + 40)

//     // Card 4: Total Credit
//     drawCard(doc, 50 + (cardWidth + 10) * 3, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
//     doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
//     doc.text("Total Credit", 60 + (cardWidth + 10) * 3, cardY + 15)
//     doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
//     doc.text(formatCurrency(totalCredit), 60 + (cardWidth + 10) * 3, cardY + 40)

//     // Table header position - adjusted for vendor details box
//     const tableTop = cardY + cardHeight + 20

//     // Define table columns to match the image - with centered alignment
//     // Added Cheque Number column
//     const columns = [
//       { title: "Date", width: 70 },
//       { title: "Challan No", width: 70 },
//       { title: "Description", width: 120 },
//       { title: "Quantity", width: 60 },
//       { title: "Unit", width: 50 },
//       { title: "Price", width: 60 },
//       { title: "Debit", width: 60 },
//       { title: "Credit", width: 60 },
//       { title: "Payment", width: 60 },
//       { title: "Cheque No", width: 70 },
//       { title: "Balance", width: 60 }, // Added Balance column
//     ]

//     // Calculate total table width
//     const tableWidth = columns.reduce((sum, col) => sum + col.width, 0)

//     // Calculate x positions for each column
//     let currentX = 40
//     columns.forEach((col) => {
//       col.x = currentX + col.width / 2 // Center position of column
//       currentX += col.width
//     })

//     // Draw table header
//     doc.rect(40, tableTop, tableWidth, 25).fillColor(colors.white).strokeColor(colors.borderGray).fillAndStroke()
//     doc.fillColor(colors.textDark).fontSize(10).font("Helvetica-Bold")

//     columns.forEach((column) => {
//       doc.text(column.title, column.x - column.width / 2 + 10, tableTop + 8, {
//         width: column.width - 10,
//         align: "left", // Changed from center to left
//       })
//     })

//     // Draw horizontal line after header
//     doc
//       .moveTo(40, tableTop + 25)
//       .lineTo(40 + tableWidth, tableTop + 25)
//       .strokeColor(colors.borderGray)
//       .stroke()

//     // Draw table rows
//     let currentY = tableTop + 25
//     let currentBalance = openingBalance

//     ledgerEntries.forEach((entry, index) => {
//       // Parse comma-separated values into arrays
//       const descriptions = entry.description
//         ? entry.description.split(",").map((item) => item.trim())
//         : ["Unknown Description"]
//       const quantities = entry.quantity ? entry.quantity.split(",").map((item) => item.trim()) : ["0"]
//       const prices = entry.price ? entry.price.split(",").map((item) => item.trim()) : ["-"]
//       const units = entry.unit ? entry.unit.split(",").map((item) => item.trim()) : ["meter"]
    
//       // Use the longest array to determine row count
//       const maxItems = Math.max(descriptions.length, quantities.length, prices.length, units.length)
    
//       // Ensure all arrays have the same length by padding with default values
//       while (descriptions.length < maxItems) descriptions.push("Unknown Description")
//       while (quantities.length < maxItems) quantities.push("")
//       while (prices.length < maxItems) prices.push("-")
//       while (units.length < maxItems) units.push("meter")

//       // Calculate row height based on the number of items
//       const rowHeight = Math.max(maxItems * 12 + 8, 30) // Minimum 30px height

//       // Add new page if needed
//       if (currentY + rowHeight > doc.page.height - 50) {
//         doc.addPage({ size: [842, 595], margin: 40 })

//         // Add header on new page
//         doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.textDark)
//         doc.text(vendorDetails.company_name, 40, 40)

//         // Add generation date on new page
//         doc.font("Helvetica").fontSize(9).fillColor(colors.textMuted)
//         doc.text(`Generated on: ${printDate}`, doc.page.width - 200, 40, { align: "right" })

//         // Redraw table header on new page
//         currentY = 70
//         doc.rect(40, currentY, tableWidth, 25).fillColor(colors.white).strokeColor(colors.borderGray).fillAndStroke()
//         doc.fillColor(colors.textDark).fontSize(10).font("Helvetica-Bold")

//         columns.forEach((column) => {
//           doc.text(column.title, column.x - column.width / 2 + 10, currentY + 8, {
//             width: column.width - 10,
//             align: "left", // Changed from center to left
//           })
//         })

//         // Draw horizontal line after header
//         doc
//           .moveTo(40, currentY + 25)
//           .lineTo(40 + tableWidth, currentY + 25)
//           .strokeColor(colors.borderGray)
//           .stroke()

//         currentY += 25
//       }

//       // Draw alternating row background
//       if (index % 2 === 0) {
//         doc.rect(40, currentY, tableWidth, rowHeight).fillColor(colors.lightGray).fill()
//       }

//       // Draw row border
//       doc.rect(40, currentY, tableWidth, rowHeight).strokeColor(colors.borderGray).stroke()

//       const debit = Number.parseFloat(entry.debit || 0)
//       const credit = Number.parseFloat(entry.credit || 0)
//       currentBalance += debit - credit

//       // Fill row data with centered text
//       doc.fillColor(colors.textDark).fontSize(9).font("Helvetica")

//       // Date
//       doc.text(
//         new Date(entry.date).toLocaleDateString("en-GB"),
//         columns[0].x - columns[0].width / 2 + 10,
//         currentY + rowHeight / 2 - 5,
//         {
//           width: columns[0].width - 10,
//           align: "left", // Changed from center to left
//         },
//       )

//       // Challan No
//       doc.text(entry.challan_no || "-", columns[1].x - columns[1].width / 2 + 10, currentY + rowHeight / 2 - 5, {
//         width: columns[1].width - 10,
//         align: "left",
//       })

//       // Description - stacked items
//       const descStartY = currentY + 6 // Start a bit below the top of the row
//       descriptions.forEach((desc, i) => {
//         doc.text(desc, columns[2].x - columns[2].width / 2 + 10, descStartY + i * 12, {
//           width: columns[2].width - 10,
//           align: "left",
//         })
//       })

//       // Quantity - stacked items
//       const qtyStartY = currentY + 6
//       quantities.forEach((qty, i) => {
//         doc.text(qty, columns[3].x - columns[3].width / 2 + 10, qtyStartY + i * 12, {
//           width: columns[3].width - 10,
//           align: "left",
//         })
//       })

      
//       const unitStartY = currentY + 6
//       units.forEach((unit, i) => {
//         doc.text(unit, columns[4].x - columns[4].width / 2 + 10, unitStartY + i * 12, {
//           width: columns[4].width - 10,
//           align: "left",
//         })
//       })
      
     

//       // Price - stacked items
//       const priceStartY = currentY + 6
//       prices.forEach((price, i) => {
//         const priceText = price && price !== "-" ? `Rs ${price}` : "-"
//         doc.text(priceText, columns[5].x - columns[5].width / 2 + 10, priceStartY + i * 12, {
//           width: columns[5].width - 10,
//           align: "left",
//         })
//       })

//       // Debit
//       doc.text(
//         debit ? `Rs ${debit.toLocaleString("en-IN")}` : "0",
//         columns[6].x - columns[6].width / 2 + 10,
//         currentY + rowHeight / 2 - 5,
//         {
//           width: columns[6].width - 10,
//           align: "left",
//         },
//       )

//       // Credit
//       doc.text(
//         credit ? `Rs ${credit.toLocaleString("en-IN")}` : "0",
//         columns[7].x - columns[7].width / 2 + 10,
//         currentY + rowHeight / 2 - 5,
//         {
//           width: columns[7].width - 10,
//           align: "left",
//         },
//       )

//       // Payment Method
//       doc.text(entry.payment_method || "cash", columns[8].x - columns[8].width / 2 + 10, currentY + rowHeight / 2 - 5, {
//         width: columns[8].width - 10,
//         align: "left",
//       })

//       // Cheque Number
//       doc.text(entry.cheque_number || "-", columns[9].x - columns[9].width / 2 + 10, currentY + rowHeight / 2 - 5, {
//         width: columns[9].width - 10,
//         align: "left",
//       })

//       // Balance
//       doc.text(
//         formatCurrency(Math.abs(currentBalance)),
//         columns[10].x - columns[10].width / 2 + 10,
//         currentY + rowHeight / 2 - 5,
//         {
//           width: columns[10].width - 10,
//           align: "left",
//         },
//       )

//       currentY += rowHeight
//     })

//     // Add pagination footer
//     const totalPages = doc.bufferedPageRange().count
//     for (let i = 0; i < totalPages; i++) {
//       doc.switchToPage(i)
//       doc.font("Helvetica").fontSize(9).fillColor(colors.textMuted)
//       doc.text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 100, doc.page.height - 30, { align: "right" })
//     }

//     doc.end()
//     console.log("PDF generation completed successfully")
//   } catch (error) {
//     console.error("Error generating PDF:", error)
//     res.status(400).json({ error: "Failed to generate PDF report", details: error.message })
//   }
// }

// // Helper function to draw a card with rounded corners
// function drawCard(doc, x, y, width, height, fillColor, strokeColor) {
//   const radius = 3
//   doc.roundedRect(x, y, width, height, radius).fillColor(fillColor).strokeColor(strokeColor).fillAndStroke()
// }

// // Helper function to split description text into lines
// function getDescriptionLines(text, maxWidth, doc) {
//   if (!text || text === "-") return ["-"]

//   // If text contains commas, split by commas
//   if (text.includes(",")) {
//     return text
//       .split(",")
//       .map((part) => part.trim())
//       .filter((part) => part.length > 0)
//   }

//   // Otherwise, split by width
//   const words = text.split(" ")
//   const lines = []
//   let currentLine = ""

//   words.forEach((word) => {
//     const testLine = currentLine ? `${currentLine} ${word}` : word
//     const width = doc.widthOfString(testLine)

//     if (width < maxWidth) {
//       currentLine = testLine
//     } else {
//       lines.push(currentLine)
//       currentLine = word
//     }
//   })

//   if (currentLine) {
//     lines.push(currentLine)
//   }

//   return lines.length > 0 ? lines : [text]
// }
import PDFDocument from "pdfkit"

export const generatePDFReport = async (res, vendorDetails, ledgerEntries, start_date, end_date) => {
  try {
    if (!res || !vendorDetails || !ledgerEntries) {
      throw new Error("Invalid input parameters")
    }
    const doc = new PDFDocument({
      margin: 40,
      size: [842, 595],
      bufferPages: true,
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${vendorDetails.company_name}_ledger_report.pdf"`)
    doc.pipe(res)

    console.log("PDF Document initialized and piped to response")

    // Calculate totals and balances
    let openingBalance = 0,
      totalDebit = 0,
      totalCredit = 0
    const totalTransactions = ledgerEntries.length

    ledgerEntries.forEach((entry) => {
      if (entry.date < (start_date || entry.date)) {
        // Reversed calculation for opening balance: credit - debit
        openingBalance += Number.parseFloat(entry.credit || 0) - Number.parseFloat(entry.debit || 0)
      }
      totalDebit += Number.parseFloat(entry.debit || 0)
      totalCredit += Number.parseFloat(entry.credit || 0)
    })

    // Reversed calculation for final balance: credit - debit
    const finalBalance = openingBalance + totalCredit - totalDebit
    const printDate = new Date().toLocaleString()

    // Define colors to match the image
    const colors = {
      white: "#FFFFFF",
      lightGray: "#F8F9FA",
      borderGray: "#E9ECEF",
      textDark: "#212529",
      textMuted: "#6C757D",
      primary: "#000000",
    }

    doc.font("Helvetica-Bold").fontSize(16).fillColor(colors.textDark).text(vendorDetails.company_name.toUpperCase(), {
      align: "center",
      underline: true,
    })

    // Add date range if provided
    if (start_date && end_date) {
      doc.font("Helvetica").fontSize(10).fillColor(colors.textMuted)
      doc.text(
        `Date Range: ${new Date(start_date).toLocaleDateString("en-GB")} - ${new Date(end_date).toLocaleDateString("en-GB")}`,
        50,
        70,
      )
    }

    // Add print date
    doc.font("Helvetica").fontSize(10).fillColor(colors.textMuted)
    doc.text(`Generated on: ${printDate}`, doc.page.width - 200, 50, { align: "right" })

    // Add vendor details box
    const vendorBoxY = 80
    const vendorBoxHeight = 60
    drawCard(doc, 50, vendorBoxY, 350, vendorBoxHeight, colors.white, colors.borderGray)

    // Add vendor details
    doc.font("Helvetica-Bold").fontSize(10).fillColor(colors.textDark)
    doc.text("Vendor Details:", 60, vendorBoxY + 10)

    doc.font("Helvetica").fontSize(9).fillColor(colors.textDark)
    doc.text(`Company: ${vendorDetails.company_name}`, 60, vendorBoxY + 22)
    doc.text(`Supplier: ${vendorDetails.supplier_name || "-"}`, 60, vendorBoxY + 34)
    doc.text(`Contact: ${vendorDetails.contact_number || "-"}`, 60, vendorBoxY + 46)

    doc.text(`Bank Details: ${vendorDetails.bank_details || "-"}`, 220, vendorBoxY + 22, {
      width: 170,
      align: "left",
    })

    // Draw summary cards (4 cards in a row) - moved down to accommodate vendor details
    const cardY = vendorBoxY + vendorBoxHeight + 10
    const cardHeight = 80
    const cardWidth = (doc.page.width - 100 - 30) / 4 // 4 cards with 10px spacing between

    // Format currency function
    const formatCurrency = (amount) => {
      return `Rs ${amount.toLocaleString("en-IN")}`
    }

    // Card 1: Total Transactions
    drawCard(doc, 50, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
    doc.text("Total Transactions", 60, cardY + 15)
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
    doc.text(totalTransactions.toString(), 60, cardY + 40)

    // Card 2: Total Balance
    drawCard(doc, 50 + cardWidth + 10, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
    doc.text("Total Balance", 60 + cardWidth + 10, cardY + 15)
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
    doc.text(formatCurrency(Math.abs(finalBalance)), 60 + cardWidth + 10, cardY + 40)

    // Card 3: Total Debit
    drawCard(doc, 50 + (cardWidth + 10) * 2, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
    doc.text("Total Debit", 60 + (cardWidth + 10) * 2, cardY + 15)
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
    doc.text(formatCurrency(totalDebit), 60 + (cardWidth + 10) * 2, cardY + 40)

    // Card 4: Total Credit
    drawCard(doc, 50 + (cardWidth + 10) * 3, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
    doc.text("Total Credit", 60 + (cardWidth + 10) * 3, cardY + 15)
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
    doc.text(formatCurrency(totalCredit), 60 + (cardWidth + 10) * 3, cardY + 40)

    // Table header position - adjusted for vendor details box
    const tableTop = cardY + cardHeight + 20

    // Define table columns to match the image - with centered alignment
    // Added Calculated Price column to show quantity*price calculation
    const columns = [
      { title: "Date", width: 70 },
      { title: "Challan No", width: 70 },
      { title: "Description", width: 120 },
      { title: "Quantity", width: 60 },
      { title: "Unit", width: 50 },
      { title: "Price", width: 60 },
      { title: "Debit", width: 60 },
      { title: "Credit", width: 60 },
      { title: "Payment", width: 60 },
      { title: "Cheque No", width: 70 },
      { title: "Balance", width: 60 },
    ]

    // Calculate total table width
    const tableWidth = columns.reduce((sum, col) => sum + col.width, 0)

    // Calculate x positions for each column
    let currentX = 40
    columns.forEach((col) => {
      col.x = currentX + col.width / 2 // Center position of column
      currentX += col.width
    })

    // Draw table header
    doc.rect(40, tableTop, tableWidth, 25).fillColor(colors.white).strokeColor(colors.borderGray).fillAndStroke()
    doc.fillColor(colors.textDark).fontSize(10).font("Helvetica-Bold")

    columns.forEach((column) => {
      doc.text(column.title, column.x - column.width / 2 + 10, tableTop + 8, {
        width: column.width - 10,
        align: "left", // Changed from center to left
      })
    })

    // Draw horizontal line after header
    doc
      .moveTo(40, tableTop + 25)
      .lineTo(40 + tableWidth, tableTop + 25)
      .strokeColor(colors.borderGray)
      .stroke()

    // Draw table rows
    let currentY = tableTop + 25
    let currentBalance = openingBalance

    ledgerEntries.forEach((entry, index) => {
      // Parse comma-separated values into arrays
      const descriptions = entry.description
        ? entry.description.split(",").map((item) => item.trim())
        : ["Unknown Description"]
      const quantities = entry.quantity ? entry.quantity.split(",").map((item) => item.trim()) : ["0"]
      const prices = entry.price ? entry.price.split(",").map((item) => item.trim()) : ["-"]
      const units = entry.unit ? entry.unit.split(",").map((item) => item.trim()) : ["meter"]

      // Use the longest array to determine row count
      const maxItems = Math.max(descriptions.length, quantities.length, prices.length, units.length)

      // Ensure all arrays have the same length by padding with default values
      while (descriptions.length < maxItems) descriptions.push("Unknown Description")
      while (quantities.length < maxItems) quantities.push("")
      while (prices.length < maxItems) prices.push("-")
      while (units.length < maxItems) units.push("meter")

      // Calculate row height based on the number of items
      const rowHeight = Math.max(maxItems * 12 + 8, 30) // Minimum 30px height

      // Add new page if needed
      if (currentY + rowHeight > doc.page.height - 50) {
        doc.addPage({ size: [842, 595], margin: 40 })

        // Add header on new page
        doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.textDark)
        doc.text(vendorDetails.company_name, 40, 40)

        // Add generation date on new page
        doc.font("Helvetica").fontSize(9).fillColor(colors.textMuted)
        doc.text(`Generated on: ${printDate}`, doc.page.width - 200, 40, { align: "right" })

        // Redraw table header on new page
        currentY = 70
        doc.rect(40, currentY, tableWidth, 25).fillColor(colors.white).strokeColor(colors.borderGray).fillAndStroke()
        doc.fillColor(colors.textDark).fontSize(10).font("Helvetica-Bold")

        columns.forEach((column) => {
          doc.text(column.title, column.x - column.width / 2 + 10, currentY + 8, {
            width: column.width - 10,
            align: "left", // Changed from center to left
          })
        })

        // Draw horizontal line after header
        doc
          .moveTo(40, currentY + 25)
          .lineTo(40 + tableWidth, currentY + 25)
          .strokeColor(colors.borderGray)
          .stroke()

        currentY += 25
      }

      // Draw alternating row background
      if (index % 2 === 0) {
        doc.rect(40, currentY, tableWidth, rowHeight).fillColor(colors.lightGray).fill()
      }

      // Draw row border
      doc.rect(40, currentY, tableWidth, rowHeight).strokeColor(colors.borderGray).stroke()

      const debit = Number.parseFloat(entry.debit || 0)
      const credit = Number.parseFloat(entry.credit || 0)

      // Updated balance calculation: credit - debit
      currentBalance = currentBalance + credit - debit

      // Fill row data with centered text
      doc.fillColor(colors.textDark).fontSize(9).font("Helvetica")

      // Date
      doc.text(
        new Date(entry.date).toLocaleDateString("en-GB"),
        columns[0].x - columns[0].width / 2 + 10,
        currentY + rowHeight / 2 - 5,
        {
          width: columns[0].width - 10,
          align: "left", // Changed from center to left
        },
      )

      // Challan No
      doc.text(entry.challan_no || "-", columns[1].x - columns[1].width / 2 + 10, currentY + rowHeight / 2 - 5, {
        width: columns[1].width - 10,
        align: "left",
      })

      // Description - stacked items
      const descStartY = currentY + 6 // Start a bit below the top of the row
      descriptions.forEach((desc, i) => {
        doc.text(desc, columns[2].x - columns[2].width / 2 + 10, descStartY + i * 12, {
          width: columns[2].width - 10,
          align: "left",
        })
      })

      // Quantity - stacked items
      const qtyStartY = currentY + 6
      quantities.forEach((qty, i) => {
        doc.text(qty, columns[3].x - columns[3].width / 2 + 10, qtyStartY + i * 12, {
          width: columns[3].width - 10,
          align: "left",
        })
      })

      // Unit - stacked items
      const unitStartY = currentY + 6
      units.forEach((unit, i) => {
        doc.text(unit, columns[4].x - columns[4].width / 2 + 10, unitStartY + i * 12, {
          width: columns[4].width - 10,
          align: "left",
        })
      })

      // Price - stacked items
      const priceStartY = currentY + 6
      prices.forEach((price, i) => {
        const priceText = price && price !== "-" ? `Rs ${price}` : "-"
        doc.text(priceText, columns[5].x - columns[5].width / 2 + 10, priceStartY + i * 12, {
          width: columns[5].width - 10,
          align: "left",
        })
      })

      // Debit
      doc.text(
        debit ? `Rs ${debit.toLocaleString("en-IN")}` : "0",
        columns[6].x - columns[6].width / 2 + 10,
        currentY + rowHeight / 2 - 5,
        {
          width: columns[6].width - 10,
          align: "left",
        },
      )

      // Credit
      doc.text(
        credit ? `Rs ${credit.toLocaleString("en-IN")}` : "0",
        columns[7].x - columns[7].width / 2 + 10,
        currentY + rowHeight / 2 - 5,
        {
          width: columns[7].width - 10,
          align: "left",
        },
      )

      // Payment Method
      doc.text(entry.payment_method || "cash", columns[8].x - columns[8].width / 2 + 10, currentY + rowHeight / 2 - 5, {
        width: columns[8].width - 10,
        align: "left",
      })

      // Cheque Number
      doc.text(entry.cheque_number || "-", columns[9].x - columns[9].width / 2 + 10, currentY + rowHeight / 2 - 5, {
        width: columns[9].width - 10,
        align: "left",
      })

      // Balance
      doc.text(
        formatCurrency(Math.abs(currentBalance)),
        columns[10].x - columns[10].width / 2 + 10,
        currentY + rowHeight / 2 - 5,
        {
          width: columns[10].width - 10,
          align: "left",
        },
      )

      currentY += rowHeight
    })

    // Add pagination footer
    const totalPages = doc.bufferedPageRange().count
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i)
      doc.font("Helvetica").fontSize(9).fillColor(colors.textMuted)
      doc.text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 100, doc.page.height - 30, { align: "right" })
    }

    doc.end()
    console.log("PDF generation completed successfully")
  } catch (error) {
    console.error("Error generating PDF:", error)
    res.status(400).json({ error: "Failed to generate PDF report", details: error.message })
  }
}

// Helper function to draw a card with rounded corners
function drawCard(doc, x, y, width, height, fillColor, strokeColor) {
  const radius = 3
  doc.roundedRect(x, y, width, height, radius).fillColor(fillColor).strokeColor(strokeColor).fillAndStroke()
}

// Helper function to split description text into lines
function getDescriptionLines(text, maxWidth, doc) {
  if (!text || text === "-") return ["-"]

  // If text contains commas, split by commas
  if (text.includes(",")) {
    return text
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
  }

  // Otherwise, split by width
  const words = text.split(" ")
  const lines = []
  let currentLine = ""

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = doc.widthOfString(testLine)

    if (width < maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : [text]
}

