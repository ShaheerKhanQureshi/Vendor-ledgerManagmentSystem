import PDFDocument from "pdfkit"

export const generatePDFReport = async (res, vendorDetails, ledgerEntries, start_date, end_date) => {
  try {
    if (!res || !vendorDetails || !ledgerEntries) {
      throw new Error("Invalid input parameters")
    }
  
    const sortedEntries = [...ledgerEntries].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
  
    const doc = new PDFDocument({
      margin: 40,
      size: [842, 595],
      bufferPages: true,
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${vendorDetails.company_name}_ledger_report.pdf"`)
    doc.pipe(res)

    console.log("PDF Document initialized and piped to response")

    let openingBalance = 0,
      totalDebit = 0,
      totalCredit = 0
    const totalTransactions = sortedEntries.length

   
    ledgerEntries.forEach((entry) => {
      if (entry.date < (start_date || entry.date)) {
        openingBalance += Number.parseFloat(entry.credit || 0) - Number.parseFloat(entry.debit || 0)
      }
      totalDebit += Number.parseFloat(entry.debit || 0)
      totalCredit += Number.parseFloat(entry.credit || 0)
    })

    const finalBalance = openingBalance + totalCredit - totalDebit
    const printDate = new Date().toLocaleString()

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

    if (start_date && end_date) {
      doc.font("Helvetica").fontSize(10).fillColor(colors.textMuted)
      doc.text(
        `Date Range: ${new Date(start_date).toLocaleDateString("en-GB")} - ${new Date(end_date).toLocaleDateString("en-GB")}`,
        50,
        70,
      )
    }

    const vendorBoxY = 80
    const vendorBoxHeight = 60
    drawCard(doc, 50, vendorBoxY, 350, vendorBoxHeight, colors.white, colors.borderGray)

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

    const cardY = vendorBoxY + vendorBoxHeight + 10
    const cardHeight = 80
    const cardWidth = (doc.page.width - 100 - 30) / 4 

    const formatCurrency = (amount) => {
      return `Rs ${amount.toLocaleString("en-IN")}`
    }

    drawCard(doc, 50, cardY, cardWidth, cardHeight, colors.white, colors.borderGray);
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted);
    doc.text("Total Transactions", 60, cardY + 15);
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark);
    
    
    doc.text((totalTransactions - 1).toString(), 60, cardY + 40);
    
    drawCard(doc, 50 + cardWidth + 10, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
    doc.text("Total Balance", 60 + cardWidth + 10, cardY + 15)
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
    doc.text(formatCurrency(Math.abs(finalBalance)), 60 + cardWidth + 10, cardY + 40)

    drawCard(doc, 50 + (cardWidth + 10) * 2, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
    doc.text("Total Debit", 60 + (cardWidth + 10) * 2, cardY + 15)
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
    doc.text(formatCurrency(totalDebit), 60 + (cardWidth + 10) * 2, cardY + 40)

    drawCard(doc, 50 + (cardWidth + 10) * 3, cardY, cardWidth, cardHeight, colors.white, colors.borderGray)
    doc.font("Helvetica").fontSize(12).fillColor(colors.textMuted)
    doc.text("Total Credit", 60 + (cardWidth + 10) * 3, cardY + 15)
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.textDark)
    doc.text(formatCurrency(totalCredit), 60 + (cardWidth + 10) * 3, cardY + 40)

    const tableTop = cardY + cardHeight + 20

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

    const tableWidth = columns.reduce((sum, col) => sum + col.width, 0)

    let currentX = 40
    columns.forEach((col) => {
      col.x = currentX + col.width / 2 
      currentX += col.width
    })

    doc.rect(40, tableTop, tableWidth, 25).fillColor(colors.white).strokeColor(colors.borderGray).fillAndStroke()
    doc.fillColor(colors.textDark).fontSize(10).font("Helvetica-Bold")

    columns.forEach((column) => {
      doc.text(column.title, column.x - column.width / 2 + 10, tableTop + 8, {
        width: column.width - 10,
        align: "left", 
      })
    })

    doc
      .moveTo(40, tableTop + 25)
      .lineTo(40 + tableWidth, tableTop + 25)
      .strokeColor(colors.borderGray)
      .stroke()

    let currentY = tableTop + 25
    let currentBalance = openingBalance


    sortedEntries.forEach((entry, index) => {
      const descriptions = entry.description
        ? entry.description.split(",").map((item) => item.trim())
        : ["Unknown Description"]
      const quantities = entry.quantity ? entry.quantity.split(",").map((item) => item.trim()) : ["0"]
      const prices = entry.price ? entry.price.split(",").map((item) => item.trim()) : ["-"]
      const units = entry.unit ? entry.unit.split(",").map((item) => item.trim()) : ["meter"]

      const maxItems = Math.max(descriptions.length, quantities.length, prices.length, units.length)

      while (descriptions.length < maxItems) descriptions.push("Unknown Description")
      while (quantities.length < maxItems) quantities.push("")
      while (prices.length < maxItems) prices.push("-")
      while (units.length < maxItems) units.push("meter")

      const rowHeight = Math.max(maxItems * 12 + 8, 30) 

      if (currentY + rowHeight > doc.page.height - 50) {
        doc.addPage({ size: [842, 595], margin: 40 })

        doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.textDark)
        doc.text(vendorDetails.company_name, 40, 40)

        // We'll add the page number and date in the final pass
        
        currentY = 70
        doc.rect(40, currentY, tableWidth, 25).fillColor(colors.white).strokeColor(colors.borderGray).fillAndStroke()
        doc.fillColor(colors.textDark).fontSize(10).font("Helvetica-Bold")

        columns.forEach((column) => {
          doc.text(column.title, column.x - column.width / 2 + 10, currentY + 8, {
            width: column.width - 10,
            align: "left", 
          })
        })

        doc
          .moveTo(40, currentY + 25)
          .lineTo(40 + tableWidth, currentY + 25)
          .strokeColor(colors.borderGray)
          .stroke()

        currentY += 25
      }

      if (index % 2 === 0) {
        doc.rect(40, currentY, tableWidth, rowHeight).fillColor(colors.lightGray).fill()
      }

      doc.rect(40, currentY, tableWidth, rowHeight).strokeColor(colors.borderGray).stroke()

      const debit = Number.parseFloat(entry.debit || 0)
      const credit = Number.parseFloat(entry.credit || 0)

     
      currentBalance = currentBalance + credit - debit

      doc.fillColor(colors.textDark).fontSize(9).font("Helvetica")

      doc.text(
        new Date(entry.date).toLocaleDateString("en-GB"),
        columns[0].x - columns[0].width / 2 + 10,
        currentY + rowHeight / 2 - 5,
        {
          width: columns[0].width - 10,
          align: "left", 
        },
      )

      doc.text(entry.challan_no || "-", columns[1].x - columns[1].width / 2 + 10, currentY + rowHeight / 2 - 5, {
        width: columns[1].width - 10,
        align: "left",
      })

      const descStartY = currentY + 6 
      descriptions.forEach((desc, i) => {
        doc.text(desc, columns[2].x - columns[2].width / 2 + 10, descStartY + i * 12, {
          width: columns[2].width - 10,
          align: "left",
        })
      })

      const qtyStartY = currentY + 6
      quantities.forEach((qty, i) => {
        doc.text(qty, columns[3].x - columns[3].width / 2 + 10, qtyStartY + i * 12, {
          width: columns[3].width - 10,
          align: "left",
        })
      })

      const unitStartY = currentY + 6
      units.forEach((unit, i) => {
        doc.text(unit, columns[4].x - columns[4].width / 2 + 10, unitStartY + i * 12, {
          width: columns[4].width - 10,
          align: "left",
        })
      })

      const priceStartY = currentY + 6
      prices.forEach((price, i) => {
        const priceText = price && price !== "-" ? `Rs ${price}` : "-"
        doc.text(priceText, columns[5].x - columns[5].width / 2 + 10, priceStartY + i * 12, {
          width: columns[5].width - 10,
          align: "left",
        })
      })

      doc.text(
        debit ? `Rs ${debit.toLocaleString("en-IN")}` : "0",
        columns[6].x - columns[6].width / 2 + 10,
        currentY + rowHeight / 2 - 5,
        {
          width: columns[6].width - 10,
          align: "left",
        },
      )

      doc.text(
        credit ? `Rs ${credit.toLocaleString("en-IN")}` : "0",
        columns[7].x - columns[7].width / 2 + 10,
        currentY + rowHeight / 2 - 5,
        {
          width: columns[7].width - 10,
          align: "left",
        },
      )

      doc.text(entry.payment_method || "cash", columns[8].x - columns[8].width / 2 + 10, currentY + rowHeight / 2 - 5, {
        width: columns[8].width - 10,
        align: "left",
      })

      doc.text(entry.cheque_number || "-", columns[9].x - columns[9].width / 2 + 10, currentY + rowHeight / 2 - 5, {
        width: columns[9].width - 10,
        align: "left",
      })

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

   
    const totalPages = doc.bufferedPageRange().count
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i)
      doc.font("Helvetica").fontSize(9).fillColor(colors.textMuted)
      
     
      doc.text(`Generated on: ${printDate} | Page ${i + 1} of ${totalPages}`, doc.page.width - 250, 50, { 
        align: "right" 
      })
    }

    doc.end()
    console.log("PDF generation completed successfully")
  } catch (error) {
    console.error("Error generating PDF:", error)
    res.status(400).json({ error: "Failed to generate PDF report", details: error.message })
  }
}

function drawCard(doc, x, y, width, height, fillColor, strokeColor) {
  const radius = 3
  doc.roundedRect(x, y, width, height, radius).fillColor(fillColor).strokeColor(strokeColor).fillAndStroke()
}

function getDescriptionLines(text, maxWidth, doc) {
  if (!text || text === "-") return ["-"]

  if (text.includes(",")) {
    return text
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
  }

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