const CATEGORY_RULES = [
  { category: 'AI Automation', keywords: ['ai', 'chatbot', 'automation', 'automate', 'machine learning', 'ml', 'gpt', 'llm', 'bot'] },
  { category: 'Web Development', keywords: ['website', 'web app', 'web application', 'landing page', 'web development', 'frontend', 'backend'] },
  { category: 'Mobile App', keywords: ['mobile app', 'android', 'ios', 'app development', 'flutter', 'react native'] },
  { category: 'E-commerce', keywords: ['ecommerce', 'e-commerce', 'online store', 'shopify', 'cart', 'payment gateway'] },
  { category: 'Marketing', keywords: ['marketing', 'seo', 'social media', 'ads', 'campaign', 'branding'] },
  { category: 'Consulting', keywords: ['consult', 'advice', 'strategy', 'guidance'] },
];

const HIGH_PRIORITY_KEYWORDS = ['urgent', 'asap', 'immediately', 'enterprise', 'large scale', 'big project', 'budget approved', 'ready to start'];
const LOW_PRIORITY_KEYWORDS = ['just exploring', 'just curious', 'thinking about', 'maybe later', 'not sure yet', 'just researching'];

function classifyLead(requirementText) {
  const text = (requirementText || '').toLowerCase();

  let category = 'General Inquiry';
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      category = rule.category;
      break;
    }
  }

  let priority = 'Medium';
  if (HIGH_PRIORITY_KEYWORDS.some(kw => text.includes(kw))) {
    priority = 'High';
  } else if (LOW_PRIORITY_KEYWORDS.some(kw => text.includes(kw))) {
    priority = 'Low';
  } else if (text.length > 120) {
    priority = 'High';
  }

  return { category, priority };
}

module.exports = { classifyLead };
