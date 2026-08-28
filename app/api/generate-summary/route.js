import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function generateSummaryPdf(pagesData, sourceFileName = "labels.pdf") {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const skuMap = {};
  const multiQtyOrders = [];
  let totalQtySum = 0;

  pagesData.forEach((item, index) => {
    const sku = (item.sku || "UNSPECIFIED_SKU").trim();
    const qtyVal = parseInt(item.qty, 10) || 1;
    totalQtySum += qtyVal;

    if (!skuMap[sku]) {
      skuMap[sku] = {
        sku,
        totalOrders: 0,
        totalQty: 0,
        multiQtyCount: 0,
        orders: [],
      };
    }

    skuMap[sku].totalOrders += 1;
    skuMap[sku].totalQty += qtyVal;
    if (qtyVal > 1) {
      skuMap[sku].multiQtyCount += 1;
      multiQtyOrders.push({
        page: item.page || index + 1,
        orderNo: item.orderNo || "N/A",
        sku,
        qty: qtyVal,
        customerName: item.customerName || "N/A",
      });
    }
    skuMap[sku].orders.push(item);
  });

  const skuList = Object.values(skuMap).sort((a, b) => b.totalQty - a.totalQty);
  const totalLabels = pagesData.length;
  const totalSkus = skuList.length;
  const totalMultiQty = multiQtyOrders.length;

  let page = pdfDoc.addPage([595.28, 841.89]);
  let { width, height } = page.getSize();
  let y = height - 40;

  function checkPageSpace(requiredHeight) {
    if (y - requiredHeight < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 50;
      page.drawText("ORDER & SKU SUMMARY REPORT (Continued)", {
        x: 40,
        y: y,
        size: 9,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 25;
    }
  }

  // Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 70,
    width,
    height: 70,
    color: rgb(0.06, 0.09, 0.16),
  });

  page.drawText("ORDER & SKU BATCH SUMMARY", {
    x: 40,
    y: height - 38,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const cleanFileName = sourceFileName.replace(/\.pdf$/i, "");
  page.drawText(`File: ${cleanFileName}.pdf  |  Generated: ${new Date().toLocaleString("en-IN")}`, {
    x: 40,
    y: height - 56,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.7, 0.8, 0.95),
  });

  y = height - 95;

  // Stats Box Cards
  const cardW = 120;
  const cardH = 44;
  const gap = 11;
  const stats = [
    { label: "TOTAL LABELS", val: String(totalLabels), color: rgb(0.1, 0.45, 0.9) },
    { label: "TOTAL ITEM QTY", val: String(totalQtySum), color: rgb(0.05, 0.65, 0.4) },
    { label: "UNIQUE SKUs", val: String(totalSkus), color: rgb(0.5, 0.2, 0.8) },
    { label: "MULTI-QTY (>1)", val: String(totalMultiQty), color: totalMultiQty > 0 ? rgb(0.85, 0.2, 0.2) : rgb(0.4, 0.4, 0.4) },
  ];

  stats.forEach((s, idx) => {
    const cardX = 40 + idx * (cardW + gap);
    page.drawRectangle({
      x: cardX,
      y: y - cardH,
      width: cardW,
      height: cardH,
      color: rgb(0.96, 0.97, 0.98),
      borderColor: s.color,
      borderWidth: 1.5,
    });
    page.drawText(s.label, {
      x: cardX + 8,
      y: y - 14,
      size: 7,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(s.val, {
      x: cardX + 8,
      y: y - 36,
      size: 16,
      font: fontBold,
      color: s.color,
    });
  });

  y -= (cardH + 25);

  // Table 1: SKU Breakdown
  checkPageSpace(60);
  page.drawText("1. SKU ORDER BREAKDOWN", {
    x: 40,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 16;

  const colX = [40, 75, 320, 405, 480];
  page.drawRectangle({
    x: 40,
    y: y - 18,
    width: 515,
    height: 20,
    color: rgb(0.15, 0.23, 0.37),
  });

  const headers = ["S.No", "SKU Name / Description", "Total Orders", "Total Qty", "Multi-Qty (>1)"];
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colX[i] + 4,
      y: y - 13,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  });

  y -= 20;

  skuList.forEach((item, idx) => {
    checkPageSpace(20);
    const isEven = idx % 2 === 0;
    page.drawRectangle({
      x: 40,
      y: y - 16,
      width: 515,
      height: 18,
      color: isEven ? rgb(1, 1, 1) : rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 0.5,
    });

    page.drawText(String(idx + 1), { x: colX[0] + 4, y: y - 12, size: 8, font: fontRegular });
    
    let skuText = item.sku;
    if (skuText.length > 42) skuText = skuText.substring(0, 39) + "...";
    page.drawText(skuText, { x: colX[1] + 4, y: y - 12, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    page.drawText(String(item.totalOrders), { x: colX[2] + 4, y: y - 12, size: 8, font: fontRegular });
    page.drawText(String(item.totalQty), { x: colX[3] + 4, y: y - 12, size: 8, font: fontBold, color: rgb(0.05, 0.6, 0.35) });
    
    const multiText = item.multiQtyCount > 0 ? `${item.multiQtyCount} Orders` : "0";
    const multiColor = item.multiQtyCount > 0 ? rgb(0.85, 0.15, 0.15) : rgb(0.5, 0.5, 0.5);
    page.drawText(multiText, { x: colX[4] + 4, y: y - 12, size: 8, font: item.multiQtyCount > 0 ? fontBold : fontRegular, color: multiColor });

    y -= 18;
  });

  // Table 1 Total Row
  checkPageSpace(22);
  page.drawRectangle({
    x: 40,
    y: y - 18,
    width: 515,
    height: 20,
    color: rgb(0.92, 0.95, 0.98),
    borderColor: rgb(0.7, 0.8, 0.9),
    borderWidth: 1,
  });
  page.drawText("TOTAL BATCH SUMMARY", { x: colX[1] + 4, y: y - 13, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
  page.drawText(String(totalLabels), { x: colX[2] + 4, y: y - 13, size: 8.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
  page.drawText(String(totalQtySum), { x: colX[3] + 4, y: y - 13, size: 8.5, font: fontBold, color: rgb(0.05, 0.6, 0.35) });
  page.drawText(String(totalMultiQty), { x: colX[4] + 4, y: y - 13, size: 8.5, font: fontBold, color: totalMultiQty > 0 ? rgb(0.85, 0.15, 0.15) : rgb(0.3, 0.3, 0.3) });

  y -= 35;

  // Table 2: Multi-Quantity Orders Section (Highlighted Box)
  checkPageSpace(60);

  if (multiQtyOrders.length > 0) {
    page.drawRectangle({
      x: 40,
      y: y - 22,
      width: 515,
      height: 24,
      color: rgb(0.98, 0.9, 0.9),
      borderColor: rgb(0.85, 0.2, 0.2),
      borderWidth: 1.5,
    });

    page.drawText("MULTI-QUANTITY ORDERS (QTY > 1) - HIGHLIGHTED PACKING ALERT", {
      x: 48,
      y: y - 15,
      size: 9,
      font: fontBold,
      color: rgb(0.75, 0.1, 0.1),
    });

    y -= 26;

    const mColX = [40, 85, 230, 410, 470];
    page.drawRectangle({
      x: 40,
      y: y - 18,
      width: 515,
      height: 20,
      color: rgb(0.8, 0.15, 0.15),
    });

    const mHeaders = ["Page #", "Order Number", "SKU Name", "QUANTITY", "Customer Name"];
    mHeaders.forEach((h, i) => {
      page.drawText(h, {
        x: mColX[i] + 4,
        y: y - 13,
        size: 8,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    });

    y -= 20;

    multiQtyOrders.forEach((mOrder, idx) => {
      checkPageSpace(20);
      
      page.drawRectangle({
        x: 40,
        y: y - 18,
        width: 515,
        height: 20,
        color: idx % 2 === 0 ? rgb(1, 0.94, 0.94) : rgb(0.98, 0.9, 0.9),
        borderColor: rgb(0.9, 0.6, 0.6),
        borderWidth: 0.5,
      });

      page.drawText(`Page ${mOrder.page}`, { x: mColX[0] + 4, y: y - 13, size: 8, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(String(mOrder.orderNo), { x: mColX[1] + 4, y: y - 13, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      
      let skuText = mOrder.sku;
      if (skuText.length > 28) skuText = skuText.substring(0, 25) + "...";
      page.drawText(skuText, { x: mColX[2] + 4, y: y - 13, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

      // Highlighted QTY Badge
      page.drawRectangle({
        x: mColX[3] + 2,
        y: y - 16,
        width: 48,
        height: 15,
        color: rgb(0.85, 0.15, 0.15),
      });
      page.drawText(`QTY: ${mOrder.qty}`, { x: mColX[3] + 6, y: y - 12, size: 8.5, font: fontBold, color: rgb(1, 1, 1) });

      let custText = mOrder.customerName;
      if (custText.length > 16) custText = custText.substring(0, 13) + "...";
      page.drawText(custText, { x: mColX[4] + 4, y: y - 13, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

      y -= 20;
    });
  } else {
    page.drawRectangle({
      x: 40,
      y: y - 24,
      width: 515,
      height: 26,
      color: rgb(0.9, 0.98, 0.94),
      borderColor: rgb(0.1, 0.65, 0.35),
      borderWidth: 1,
    });
    page.drawText("ALL ORDERS ARE SINGLE QUANTITY (QTY = 1) - No multi-quantity packing alerts.", {
      x: 52,
      y: y - 16,
      size: 8.5,
      font: fontBold,
      color: rgb(0.05, 0.5, 0.25),
    });
    y -= 30;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { pages = [], fileName = "labels.pdf" } = body;
    if (!Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "No page data available" }, { status: 400 });
    }

    const pdfBuffer = await generateSummaryPdf(pages, fileName);
    const baseName = fileName.replace(/\.pdf$/i, "");
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}_summary.pdf"`,
      },
    });
  } catch (err) {
    console.error("Summary generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
