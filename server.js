const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = require('./db');
const { classifyLead } = require('./classifier');
const { buildEmailHtml } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TRACKING_PIXEL_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

app.post('/api/leads', (req, res) => {
  const { name, email, phone, company, requirement } = req.body;

  if (!name || !email || !phone || !requirement) {
    return res.status(400).json({ error: 'Name, email, phone and requirement are required.' });
  }

  const leadId = uuidv4();
  const submissionTime = new Date().toISOString();
  const classification = classifyLead(requirement);

  const lead = {
    id: leadId,
    name,
    email,
    phone,
    company: company || '',
    requirement,
    submissionTime,
    category: classification.category,
    priority: classification.priority,
  };
  db.addLead(lead);

  const emailId = uuidv4();
  const baseUrl = getBaseUrl(req);
  const targetUrl = 'https://example.com/learn-more';

  const htmlContent = buildEmailHtml({
    name,
    requirement,
    emailId,
    baseUrl,
    targetUrl,
  });

  const emailRecord = {
    id: emailId,
    leadId,
    to: email,
    subject: 'Thank you for reaching out!',
    htmlContent,
    targetUrl,
    sentAt: new Date().toISOString(),
    opened: false,
    openedAt: null,
    clicked: false,
    clickedAt: null,
  };
  db.addEmail(emailRecord);

  res.status(201).json({
    message: 'Lead captured and email sent successfully.',
    lead,
    emailId,
  });
});

app.get('/api/leads', (req, res) => {
  res.json(db.getLeads());
});

app.get('/track/open/:emailId', (req, res) => {
  const { emailId } = req.params;
  const email = db.findEmail(emailId);
  if (email && !email.opened) {
    db.updateEmail(emailId, { opened: true, openedAt: new Date().toISOString() });
  }
  res.set('Content-Type', 'image/gif');
  res.send(TRACKING_PIXEL_BUFFER);
});

app.get('/track/click/:emailId', (req, res) => {
  const { emailId } = req.params;
  const { url } = req.query;
  const email = db.findEmail(emailId);
  if (email) {
    const updates = { clicked: true, clickedAt: new Date().toISOString() };
    if (!email.opened) {
      updates.opened = true;
      updates.openedAt = new Date().toISOString();
    }
    db.updateEmail(emailId, updates);
  }
  const redirectTarget = url || (email ? email.targetUrl : 'https://example.com');
  res.redirect(redirectTarget);
});

app.get('/api/dashboard', (req, res) => {
  const leads = db.getLeads();
  const emails = db.getEmails();

  const totalLeads = leads.length;
  const totalEmailsSent = emails.length;
  const totalEmailsOpened = emails.filter(e => e.opened).length;
  const totalLinksClicked = emails.filter(e => e.clicked).length;

  const openRate = totalEmailsSent ? Math.round((totalEmailsOpened / totalEmailsSent) * 100) : 0;
  const clickRate = totalEmailsSent ? Math.round((totalLinksClicked / totalEmailsSent) * 100) : 0;

  const categoryBreakdown = {};
  const priorityBreakdown = {};
  leads.forEach(l => {
    categoryBreakdown[l.category] = (categoryBreakdown[l.category] || 0) + 1;
    priorityBreakdown[l.priority] = (priorityBreakdown[l.priority] || 0) + 1;
  });

  const recentLeads = leads
    .slice()
    .reverse()
    .slice(0, 20)
    .map(lead => {
      const email = emails.find(e => e.leadId === lead.id);
      return {
        ...lead,
        emailSent: !!email,
        opened: email ? email.opened : false,
        clicked: email ? email.clicked : false,
      };
    });

  res.json({
    totalLeads,
    totalEmailsSent,
    totalEmailsOpened,
    openRate,
    totalLinksClicked,
    clickRate,
    categoryBreakdown,
    priorityBreakdown,
    recentLeads,
  });
});

app.get('/api/inbox', (req, res) => {
  const emails = db.getEmails().slice().reverse();
  res.json(emails);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
