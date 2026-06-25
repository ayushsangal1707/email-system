const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function load() {
  if (!fs.existsSync(DB_FILE)) {
    return { leads: [], emails: [] };
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  if (!raw.trim()) return { leads: [], emails: [] };
  return JSON.parse(raw);
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getAll() {
  return load();
}

function addLead(lead) {
  const data = load();
  data.leads.push(lead);
  save(data);
  return lead;
}

function addEmail(email) {
  const data = load();
  data.emails.push(email);
  save(data);
  return email;
}

function findEmail(id) {
  const data = load();
  return data.emails.find(e => e.id === id);
}

function updateEmail(id, updates) {
  const data = load();
  const email = data.emails.find(e => e.id === id);
  if (!email) return null;
  Object.assign(email, updates);
  save(data);
  return email;
}

function getLeads() {
  return load().leads;
}

function getEmails() {
  return load().emails;
}

module.exports = {
  getAll,
  addLead,
  addEmail,
  findEmail,
  updateEmail,
  getLeads,
  getEmails,
};
