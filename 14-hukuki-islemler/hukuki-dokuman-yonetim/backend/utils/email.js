const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const mailOptions = {
      from: `Legal Document Management <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendDocumentShareNotification = async (recipient, document, sharer, permissions) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Document Shared With You</h2>
      <p>${sharer.name} has shared a document with you.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${document.title}</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Category:</strong> ${document.category}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Permissions:</strong> ${permissions.join(', ')}</p>
      </div>
      
      <p>You can access this document by logging into the Legal Document Management System.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>This is an automated message from the Legal Document Management System.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipient.email,
    subject: `Document Shared: ${document.title}`,
    html
  });
};

const sendWorkflowNotification = async (recipient, workflow, document, action) => {
  const actionText = {
    assigned: 'You have been assigned to a workflow step',
    completed: 'A workflow step has been completed',
    rejected: 'A workflow has been rejected',
    deadline: 'A workflow deadline is approaching'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${actionText[action] || 'Workflow Update'}</h2>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${workflow.name}</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Document:</strong> ${document.title}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Type:</strong> ${workflow.type}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Priority:</strong> ${workflow.priority}</p>
        ${workflow.deadline ? `<p style="color: #d9534f; margin: 5px 0;"><strong>Deadline:</strong> ${new Date(workflow.deadline).toLocaleDateString()}</p>` : ''}
      </div>
      
      <p>Please log into the Legal Document Management System to take action.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>This is an automated message from the Legal Document Management System.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipient.email,
    subject: `Workflow ${action}: ${workflow.name}`,
    html
  });
};

const sendDocumentExpiryNotification = async (recipient, document, daysUntilExpiry) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d9534f;">Document Expiry Notice</h2>
      
      <p>The following document will expire in ${daysUntilExpiry} days:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${document.title}</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Category:</strong> ${document.category}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Expiry Date:</strong> ${new Date(document.validUntil).toLocaleDateString()}</p>
      </div>
      
      <p>Please take necessary action before the document expires.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>This is an automated message from the Legal Document Management System.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipient.email,
    subject: `Document Expiry Warning: ${document.title}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendDocumentShareNotification,
  sendWorkflowNotification,
  sendDocumentExpiryNotification
};