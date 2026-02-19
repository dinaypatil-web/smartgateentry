/**
 * Utility to generate and download a maintenance receipt as a text file
 */
export const downloadReceipt = (payment, user, societyName) => {
    if (!payment) return;

    const receiptContent = `
=========================================
        SMART GATE ENTRY - RECEIPT
=========================================

SOCIETY:    ${societyName || 'N/A'}
RESIDENT:   ${user?.name || 'Valued Resident'}
FLAT:       ${user?.flatNo || user?.flatNumber || 'N/A'}

-----------------------------------------
RECEIPT DETAILS
-----------------------------------------
Receipt ID:     ${payment.id}
Period:         ${payment.month} ${payment.year}
Amount Paid:    ₹${payment.amount}
Status:         FULLY PAID
Paid Date:      ${new Date(payment.updatedAt || payment.paymentDate || payment.createdAt).toLocaleDateString()}
Payment Mode:   App Simulation / Digital

-----------------------------------------
Thank you for your timely payment!
This is a computer-generated receipt and 
does not require a signature.
=========================================
    `.trim();

    const fileName = `Receipt_${payment.month}_${payment.year}.txt`;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
