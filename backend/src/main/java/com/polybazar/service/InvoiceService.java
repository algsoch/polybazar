package com.polybazar.service;

import com.polybazar.controller.InvoiceController.InvoiceResponse;
import com.polybazar.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    @Value("${app.storage.invoices-path:./invoices}")
    private String invoicesPath;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // Methods for controller compatibility
    public InvoiceResponse getInvoice(String id, String userId) {
        // TODO: Implement actual invoice fetching from database
        log.info("Getting invoice {} for user {}", id, userId);
        return new InvoiceResponse(
                id,
                "order-id",
                "INV-" + id,
                "Buyer Name",
                "GSTIN123",
                "Seller Name",
                "GSTIN456",
                1000.0,
                180.0,
                1180.0,
                "GENERATED",
                java.time.LocalDateTime.now().toString()
        );
    }

    public byte[] generatePdf(String id, String userId) {
        // TODO: Implement actual PDF generation
        log.info("Generating PDF for invoice {} for user {}", id, userId);
        return "PDF content placeholder".getBytes();
    }

    public String getSignedUrl(String id, String userId) {
        // TODO: Implement actual signed URL generation
        log.info("Getting signed URL for invoice {} for user {}", id, userId);
        return baseUrl + "/api/v1/invoices/" + id + "/download?token=" + UUID.randomUUID();
    }

    public String generateInvoice(Order order) {
        try {
            String invoiceNumber = "INV-" + order.getOrderNumber();
            String filename = invoiceNumber + ".html";
            
            String htmlContent = generateInvoiceHtml(order, invoiceNumber);
            
            Path invoiceDir = Paths.get(invoicesPath);
            if (!Files.exists(invoiceDir)) {
                Files.createDirectories(invoiceDir);
            }

            Path invoiceFile = invoiceDir.resolve(filename);
            Files.writeString(invoiceFile, htmlContent);

            String invoiceUrl = baseUrl + "/api/invoices/" + filename;
            log.info("Invoice generated: {} for order: {}", invoiceNumber, order.getOrderNumber());

            return invoiceUrl;
        } catch (Exception e) {
            log.error("Failed to generate invoice for order: {}", order.getOrderNumber(), e);
            throw new RuntimeException("Failed to generate invoice", e);
        }
    }

    private String generateInvoiceHtml(Order order, String invoiceNumber) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invoice %s</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', -apple-system, sans-serif; background: #f5f5f5; padding: 20px; }
                    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0B6DF4; padding-bottom: 20px; }
                    .logo { font-size: 28px; font-weight: 700; color: #0B6DF4; }
                    .logo span { color: #00BFA6; }
                    .invoice-info { text-align: right; }
                    .invoice-info h2 { color: #333; margin-bottom: 5px; }
                    .invoice-info p { color: #666; font-size: 14px; }
                    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    .party h3 { color: #0B6DF4; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
                    .party p { color: #333; font-size: 14px; line-height: 1.6; }
                    .items { margin-bottom: 30px; }
                    .items table { width: 100%%; border-collapse: collapse; }
                    .items th { background: #0B6DF4; color: white; padding: 12px; text-align: left; font-size: 14px; }
                    .items td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                    .items .total-row { background: #f9f9f9; font-weight: 600; }
                    .items .grand-total { background: #0B6DF4; color: white; }
                    .totals { display: flex; justify-content: flex-end; }
                    .totals-table { width: 300px; }
                    .totals-table tr td { padding: 8px 12px; }
                    .totals-table tr:last-child { background: #0B6DF4; color: white; font-weight: 600; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
                    .terms { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                    .terms h4 { color: #333; margin-bottom: 10px; font-size: 14px; }
                    .terms p { color: #666; font-size: 12px; line-height: 1.6; }
                    @media print { body { padding: 0; background: white; } .invoice { box-shadow: none; } }
                </style>
            </head>
            <body>
                <div class="invoice">
                    <div class="header">
                        <div class="logo">Poly<span>Bazar</span></div>
                        <div class="invoice-info">
                            <h2>TAX INVOICE</h2>
                            <p><strong>Invoice #:</strong> %s</p>
                            <p><strong>Date:</strong> %s</p>
                            <p><strong>Order #:</strong> %s</p>
                        </div>
                    </div>
                    
                    <div class="parties">
                        <div class="party">
                            <h3>Bill To</h3>
                            <p>
                                <strong>Buyer ID:</strong> %s<br>
                                %s<br>
                                %s, %s - %s
                            </p>
                        </div>
                        <div class="party">
                            <h3>Ship To</h3>
                            <p>
                                %s<br>
                                %s, %s - %s
                            </p>
                        </div>
                    </div>
                    
                    <div class="items">
                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>%s</td>
                                    <td>%s %s</td>
                                    <td>%s %s/%s</td>
                                    <td>%s %s</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="totals">
                        <table class="totals-table">
                            <tr>
                                <td>Subtotal</td>
                                <td style="text-align: right;">%s %s</td>
                            </tr>
                            <tr>
                                <td>GST (%s%%)</td>
                                <td style="text-align: right;">%s %s</td>
                            </tr>
                            <tr>
                                <td>Shipping</td>
                                <td style="text-align: right;">%s %s</td>
                            </tr>
                            <tr>
                                <td>Grand Total</td>
                                <td style="text-align: right;">%s %s</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="terms">
                        <h4>Terms & Conditions</h4>
                        <p>
                            1. Payment is due within 7 days of invoice date.<br>
                            2. Goods once sold will not be taken back.<br>
                            3. Subject to Mumbai jurisdiction.<br>
                            4. E & O.E.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>PolyBazar - India's Premier Polymer Trading Platform</p>
                        <p>support@polybazar.com | www.polybazar.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                invoiceNumber,
                invoiceNumber,
                order.getCreatedAt().format(dateFormatter),
                order.getOrderNumber(),
                order.getBuyerId(),
                order.getBillingAddress() != null ? order.getBillingAddress() : "N/A",
                order.getShippingCity() != null ? order.getShippingCity() : "",
                order.getShippingState() != null ? order.getShippingState() : "",
                order.getShippingPincode() != null ? order.getShippingPincode() : "",
                order.getShippingAddress() != null ? order.getShippingAddress() : "N/A",
                order.getShippingCity() != null ? order.getShippingCity() : "",
                order.getShippingState() != null ? order.getShippingState() : "",
                order.getShippingPincode() != null ? order.getShippingPincode() : "",
                order.getProductTitle(),
                order.getQuantity(),
                order.getQuantityUnit() != null ? order.getQuantityUnit() : "KG",
                order.getCurrency(),
                order.getUnitPrice(),
                order.getQuantityUnit() != null ? order.getQuantityUnit() : "KG",
                order.getCurrency(),
                order.getTotalPrice(),
                order.getCurrency(),
                order.getTotalPrice(),
                order.getGstPercentage() != null ? order.getGstPercentage().intValue() : 18,
                order.getCurrency(),
                order.getGstAmount(),
                order.getCurrency(),
                order.getShippingAmount() != null ? order.getShippingAmount() : BigDecimal.ZERO,
                order.getCurrency(),
                order.getGrandTotal()
            );
    }
}
