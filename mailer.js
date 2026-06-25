function buildEmailHtml({ name, requirement, emailId, baseUrl, targetUrl }) {
  const trackingPixel = `${baseUrl}/track/open/${emailId}`;
  const trackedLink = `${baseUrl}/track/click/${emailId}?url=${encodeURIComponent(targetUrl)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f1f33;">
      <h2 style="color:#2c1f70;">Hi ${name},</h2>
      <p>Thank you for reaching out.</p>
      <p>We received your requirement: <em>"${requirement}"</em></p>
      <p>
        <a href="${trackedLink}" style="display:inline-block; background:#b5651d; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
          Learn more
        </a>
      </p>
      <p>Regards,<br/>Team</p>
      <img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />
    </div>
  `;
  return html;
}

module.exports = { buildEmailHtml };
