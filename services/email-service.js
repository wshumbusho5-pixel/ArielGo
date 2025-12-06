// ==================================
// EMAIL SERVICE
// Handles sending email notifications
// ==================================

const nodemailer = require('nodemailer');
const pricingService = require('./pricing-service');

// Create email transporter
let transporter = null;

// Initialize email transporter
function initializeTransporter() {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️  Email credentials not configured. Email notifications will be disabled.');
        console.warn('   To enable emails, add EMAIL_USER and EMAIL_PASSWORD to your .env file');
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        console.log('✅ Email service initialized');
        return transporter;
    } catch (error) {
        console.error('Error initializing email service:', error);
        return null;
    }
}

// Initialize on module load
initializeTransporter();

/**
 * Send booking confirmation email to customer
 */
async function sendBookingConfirmation(booking) {
    if (!transporter) {
        console.log('Email service not configured, skipping confirmation email');
        return { success: false, reason: 'Email not configured' };
    }

    const serviceName = pricingService.getServicePricing(booking.service)?.name || booking.service;
    const totalDollars = pricingService.formatPrice(booking.totalPrice);

    // Customer email
    const customerMailOptions = {
        from: `${process.env.BUSINESS_NAME} <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: `Booking Confirmed - ${process.env.BUSINESS_NAME}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0066cc 0%, #004999 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px;">${process.env.BUSINESS_NAME}</h1>
                    <p style="margin: 10px 0 0; font-size: 16px;">Laundry Delivered Fast</p>
                </div>

                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #333; margin-top: 0;">Hi ${booking.name},</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for booking with ${process.env.BUSINESS_NAME}! We've received your request and will pick up your laundry soon.
                    </p>

                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #0066cc; margin-top: 0;">Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${serviceName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Number of Bags:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.numberOfBags}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Pickup Date:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.pickupDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Pickup Time:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${getTimeDisplay(booking.pickupTime)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Pickup Address:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.address}</td>
                            </tr>
                            <tr style="font-size: 18px; font-weight: bold;">
                                <td style="padding: 12px 0; color: #0066cc;">Total:</td>
                                <td style="padding: 12px 0; color: #0066cc;">${totalDollars}</td>
                            </tr>
                        </table>
                    </div>

                    ${booking.notes ? `
                        <div style="background: #fffbea; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                            <strong style="color: #856404;">Special Instructions:</strong>
                            <p style="margin: 5px 0 0; color: #856404;">${booking.notes}</p>
                        </div>
                    ` : ''}

                    <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0; color: #0066cc;">
                            <strong>What happens next?</strong><br>
                            We'll arrive during your selected pickup time window to collect your laundry. Please have your bag(s) ready by the door.
                        </p>
                    </div>

                    <p style="color: #666; line-height: 1.6;">
                        If you have any questions or need to make changes, please contact us:
                    </p>
                    <p style="color: #666;">
                        📞 Phone: ${process.env.BUSINESS_PHONE}<br>
                        📧 Email: ${process.env.BUSINESS_EMAIL}
                    </p>
                </div>

                <div style="background: #1a1a1a; color: #aaa; padding: 20px; text-align: center; font-size: 14px;">
                    <p style="margin: 0;">
                        ${process.env.BUSINESS_NAME} - ${process.env.SERVICE_AREA}<br>
                        © 2025 All rights reserved
                    </p>
                </div>
            </div>
        `
    };

    // Business notification email
    const businessMailOptions = {
        from: `${process.env.BUSINESS_NAME} <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: `🆕 New Booking #${booking.id} - ${booking.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0066cc; color: white; padding: 20px;">
                    <h2 style="margin: 0;">🆕 New Booking Received!</h2>
                </div>

                <div style="padding: 20px; background-color: #f9f9f9;">
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h3 style="color: #0066cc; margin-top: 0;">Booking #${booking.id}</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Customer Name:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;"><a href="tel:${booking.phone}">${booking.phone}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;"><a href="mailto:${booking.email}">${booking.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${serviceName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Number of Bags:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.numberOfBags}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Pickup Date:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.pickupDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Pickup Time:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${getTimeDisplay(booking.pickupTime)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Address:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.address}</td>
                            </tr>
                            ${booking.notes ? `
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Notes:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.notes}</td>
                            </tr>
                            ` : ''}
                            <tr style="font-size: 18px; font-weight: bold;">
                                <td style="padding: 12px 0; color: #0066cc;">Total Revenue:</td>
                                <td style="padding: 12px 0; color: #0066cc;">${totalDollars}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <strong style="color: #856404;">Action Required:</strong>
                        <p style="margin: 5px 0 0; color: #856404;">
                            Contact the customer to confirm pickup time and prepare for the scheduled pickup.
                        </p>
                    </div>
                </div>
            </div>
        `
    };

    try {
        // Send both emails
        await transporter.sendMail(customerMailOptions);
        console.log(`✉️  Confirmation email sent to ${booking.email}`);

        await transporter.sendMail(businessMailOptions);
        console.log(`✉️  Notification email sent to business`);

        return { success: true };
    } catch (error) {
        console.error('Error sending emails:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Helper function to format time display
 */
function getTimeDisplay(timeValue) {
    const timeMap = {
        'morning': '8:00 AM - 12:00 PM',
        'afternoon': '12:00 PM - 5:00 PM',
        'evening': '5:00 PM - 8:00 PM'
    };
    return timeMap[timeValue] || timeValue;
}

/**
 * Send status update email to customer
 */
async function sendStatusUpdate(booking, newStatus) {
    if (!transporter) {
        console.log('Email service not configured, skipping status update email');
        return { success: false, reason: 'Email not configured' };
    }

    const statusInfo = getStatusInfo(newStatus);
    const totalDollars = pricingService.formatPrice(booking.totalPrice);

    const mailOptions = {
        from: `${process.env.BUSINESS_NAME} <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: `${statusInfo.emoji} ${statusInfo.title} - Order #${booking.id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${statusInfo.color}; color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px;">${statusInfo.emoji}</h1>
                    <h2 style="margin: 10px 0 0;">${statusInfo.title}</h2>
                </div>

                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #333; margin-top: 0;">Hi ${booking.name},</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        ${statusInfo.message}
                    </p>

                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #0066cc; margin-top: 0;">Order #${booking.id}</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
                                <td style="padding: 8px 0; color: ${statusInfo.color}; border-bottom: 1px solid #eee; font-weight: bold;">${statusInfo.statusText}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${pricingService.getServicePricing(booking.service)?.name || booking.service}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Number of Bags:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.numberOfBags}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Pickup Date:</strong></td>
                                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #eee;">${booking.pickupDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Total:</strong></td>
                                <td style="padding: 8px 0; color: #0066cc; font-weight: bold;">${totalDollars}</td>
                            </tr>
                        </table>
                    </div>

                    ${statusInfo.nextSteps ? `
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <strong style="color: #0066cc;">What's Next?</strong>
                            <p style="margin: 5px 0 0; color: #0066cc;">${statusInfo.nextSteps}</p>
                        </div>
                    ` : ''}

                    <p style="color: #666; line-height: 1.6;">
                        Questions? Contact us:<br>
                        📞 ${process.env.BUSINESS_PHONE}<br>
                        📧 ${process.env.BUSINESS_EMAIL}
                    </p>
                </div>

                <div style="background: #1a1a1a; color: #aaa; padding: 20px; text-align: center; font-size: 14px;">
                    <p style="margin: 0;">
                        ${process.env.BUSINESS_NAME} - ${process.env.SERVICE_AREA}<br>
                        © 2025 All rights reserved
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️  Status update email sent to ${booking.email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending status update email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get status information for email templates
 */
function getStatusInfo(status) {
    const statusMap = {
        pending: {
            emoji: '⏳',
            title: 'Order Received',
            statusText: 'Pending Confirmation',
            color: '#ffa726',
            message: 'We\'ve received your laundry order and will confirm it shortly.',
            nextSteps: 'You\'ll receive a confirmation once we schedule your pickup.'
        },
        confirmed: {
            emoji: '✅',
            title: 'Pickup Confirmed',
            statusText: 'Confirmed',
            color: '#2196f3',
            message: 'Great news! Your laundry pickup has been confirmed.',
            nextSteps: 'Please have your laundry bag(s) ready by the door on the scheduled pickup date and time.'
        },
        in_progress: {
            emoji: '🧺',
            title: 'Processing Your Laundry',
            statusText: 'In Progress',
            color: '#9c27b0',
            message: 'We\'ve picked up your laundry and it\'s currently being washed, dried, and folded with care.',
            nextSteps: 'Your fresh, clean laundry will be delivered back to you soon!'
        },
        completed: {
            emoji: '🎉',
            title: 'Order Complete!',
            statusText: 'Completed',
            color: '#4caf50',
            message: 'Your laundry order is complete and has been delivered! Thank you for choosing ArielGo.',
            nextSteps: 'We hope you enjoy your fresh, clean laundry. See you next time!'
        },
        cancelled: {
            emoji: '❌',
            title: 'Order Cancelled',
            statusText: 'Cancelled',
            color: '#f44336',
            message: 'Your laundry order has been cancelled.',
            nextSteps: 'If you have any questions or would like to place a new order, please contact us.'
        }
    };

    return statusMap[status] || {
        emoji: 'ℹ️',
        title: 'Order Update',
        statusText: status,
        color: '#757575',
        message: `Your order status has been updated to: ${status}`,
        nextSteps: null
    };
}

module.exports = {
    sendBookingConfirmation,
    sendStatusUpdate
};
