export const APP_NAME = "NayePankh Fundraising Portal";
export const APP_TAGLINE = "Together, We Can Create a Better Tomorrow.";

export const CATEGORIES = [
  "Education",
  "Healthcare",
  "Food",
  "Women Empowerment",
  "Child Welfare",
  "Emergency Relief",
] as const;

export const PRESET_AMOUNTS = [100, 500, 1000, 2500, 5000];

export const MIN_DONATION = 10;

export const MILESTONES = [
  { amount: 1000, title: "First Step", description: "You've taken the first step toward making a difference." },
  { amount: 5000, title: "Supporter", description: "You're a true supporter of the cause." },
  { amount: 10000, title: "Change Maker", description: "You're making real change happen." },
  { amount: 25000, title: "Community Champion", description: "You're a champion for the community." },
  { amount: 50000, title: "Fundraising Hero", description: "You're a hero in the fundraising community!" },
] as const;

export const IMPACT_TIERS = [
  { amount: 500, impact: "Provides educational materials for a child" },
  { amount: 1000, impact: "Supports essential supplies for a family" },
  { amount: 2500, impact: "Helps provide healthcare support" },
  { amount: 5000, impact: "Funds a month of community programs" },
];

export const FAQS = [
  {
    question: "How does the referral system work?",
    answer: "When you register, you receive a unique referral code. Share your personalized donation link with friends and family. When someone donates through your link, the donation is automatically tracked and attributed to your referral code.",
  },
  {
    question: "Is my donation secure?",
    answer: "Yes. All payments are processed through secure payment gateways. We never store your card details, and all transactions are encrypted end-to-end. In demo mode, no real money is charged.",
  },
  {
    question: "Can I donate anonymously?",
    answer: "Absolutely. When making a donation, you can check the 'Donate anonymously' option. Your name will be hidden from public displays, but the transaction record is still maintained securely for transparency.",
  },
  {
    question: "How do I track my fundraising progress?",
    answer: "Your dashboard shows real-time statistics including total amount raised, number of donations, progress toward your goal, and a full transaction history. The dashboard updates automatically after each successful donation.",
  },
  {
    question: "What is the minimum donation amount?",
    answer: "The minimum donation amount is ₹10. There is no maximum limit — every contribution, big or small, makes a meaningful impact.",
  },
  {
    question: "Can I share my referral link on social media?",
    answer: "Yes! You can share your donation link via WhatsApp, Facebook, LinkedIn, Telegram, Email, or copy it directly. We also provide a QR code you can download for offline sharing.",
  },
  {
    question: "How do I become a volunteer or intern?",
    answer: "Visit the Contact page and send us a message expressing your interest. Our team will get back to you with available opportunities and next steps.",
  },
  {
    question: "Are donations tax-deductible?",
    answer: "NayePankh Foundation is a registered NGO. Donations may be eligible for tax deductions under applicable laws. Please consult with a tax advisor for specific guidance.",
  },
];

export const TERMS_SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: "By accessing and using the NayePankh Fundraising Portal, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.",
  },
  {
    title: "User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information during registration.",
  },
  {
    title: "Donations",
    content: "All donations are voluntary. In demo mode, no real financial transactions occur. When live payment is enabled, donations are processed through secure payment gateways and are non-refundable except in cases of proven fraud or system error.",
  },
  {
    title: "Referral System",
    content: "Users receive a unique referral code for tracking donations generated through their shared links. Misuse of the referral system, including self-referrals or fraudulent activity, may result in account suspension.",
  },
  {
    title: "Privacy",
    content: "We respect your privacy and handle all personal data in accordance with our Privacy Policy. We do not sell or share your information with third parties without consent.",
  },
  {
    title: "Prohibited Conduct",
    content: "Users must not engage in fraudulent, abusive, or unlawful activity on the platform. This includes fake donations, impersonation, spam sharing, or any activity that harms the platform or its users.",
  },
  {
    title: "Limitation of Liability",
    content: "NayePankh Foundation is not liable for indirect, incidental, or consequential damages arising from the use of this platform. Our liability is limited to the maximum extent permitted by law.",
  },
  {
    title: "Changes to Terms",
    content: "We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.",
  },
];

export const PRIVACY_SECTIONS = [
  {
    title: "Information We Collect",
    content: "We collect information you provide during registration (name, email, phone number), donation details (amount, campaign, payment method), and usage data (referral clicks, page visits). We do not collect or store credit card information.",
  },
  {
    title: "How We Use Your Information",
    content: "Your information is used to process donations, track referral activity, send notifications about your fundraising progress, provide support, and improve our services. We never sell your data to third parties.",
  },
  {
    title: "Donor Privacy",
    content: "Donor email and phone numbers are never displayed publicly. Anonymous donations hide the donor name from public views. Only authenticated users and administrators can access appropriate transaction information.",
  },
  {
    title: "Data Security",
    content: "We use industry-standard encryption, secure payment gateways, and row-level security to protect your data. Passwords are hashed using bcrypt. Access to sensitive data is restricted and monitored.",
  },
  {
    title: "Cookies and Tracking",
    content: "We use cookies and local storage to maintain your session, remember preferences, and track referral link visits for analytics. You can disable cookies in your browser, but some features may not work properly.",
  },
  {
    title: "Your Rights",
    content: "You have the right to access, update, or delete your personal information. You can control your leaderboard visibility and notification preferences in your account settings.",
  },
  {
    title: "Data Retention",
    content: "We retain your information for as long as your account is active or as needed to provide services. You can request account deletion at any time through the Contact page.",
  },
  {
    title: "Contact Us",
    content: "If you have questions about this Privacy Policy, please contact us through the Contact page or email us at privacy@naye-pankh.org.",
  },
];
