# DizzyDashboard Privacy Policy

**Effective Date**: [Date]
**Last Updated**: 2025-10-22
**Version**: 1.0

---

## Introduction

DizzyDashboard ("we," "our," or "us") is committed to protecting the privacy and security of your information. This Privacy Policy describes how we collect, use, disclose, and safeguard information when you use our vestibular screening web application.

**IMPORTANT**: DizzyDashboard is designed to be PHI-free. We do not collect, store, or transmit Protected Health Information (PHI) as defined by HIPAA.

---

## Information We Collect

### 1. Clinical Assessment Data (De-Identified)

**What We Collect**:
- Symptom descriptions (e.g., "vertigo," "nausea," "unsteadiness")
- Physical examination findings (e.g., "positive Dix-Hallpike test")
- Clinical impressions (e.g., "findings consistent with BPPV")
- Treatment information (e.g., "Epley maneuver performed")

**What We DO NOT Collect**:
- Patient names
- Dates of birth
- Medical record numbers (MRN)
- Social Security Numbers (SSN)
- Addresses
- Phone numbers
- Email addresses
- Any unique patient identifiers

**How We Use It**:
- To generate clinical narrative summaries
- To provide decision support for vestibular conditions
- To facilitate clinical documentation workflow

**Storage Duration**: 24 hours maximum, then automatically deleted

---

### 2. Technical Information

**What We Collect Automatically**:
- IP address (for rate limiting and security)
- Browser type and version (user-agent string)
- Device type (mobile, tablet, desktop)
- Operating system
- Timestamp of access
- Chart ID requested (for audit purposes)

**How We Use It**:
- To prevent abuse and brute-force attacks
- To diagnose technical issues
- To improve application performance
- To generate audit logs for security compliance

**Storage Duration**: 30 days for security logs, 6 years for audit logs

---

### 3. Local Storage Data (On Your Device)

**What We Store in Your Browser**:
- Form progress data (symptoms, findings)
- Current evaluation step
- HIPAA modal acknowledgment status

**Important Notes**:
- This data never leaves your device
- We cannot access this data
- Clearing browser data will delete this information
- No account or login required

---

## How We Protect Your Information

### Data Encryption

**In Transit** (While Sending Data):
- All data transmitted using HTTPS with TLS 1.2 or higher
- Modern encryption protocols (AES-128 or AES-256)
- Certificate validation to prevent man-in-the-middle attacks

**At Rest** (While Stored):
- Application-layer encryption using AES-256-GCM
- Infrastructure encryption provided by Vercel/Upstash
- Encryption keys stored separately from data
- Annual key rotation

### Access Controls

**Chart ID System**:
- Each chart note assigned a unique 6-character alphanumeric identifier
- ~2.2 million possible combinations (36^6)
- Cryptographically random generation
- Access requires knowledge of exact chart ID

**Rate Limiting**:
- Maximum 10 requests per minute per IP address
- Prevents brute-force enumeration of chart IDs
- Temporary IP blocking for suspicious activity

**No Authentication Required** (Current Version):
- No user accounts or passwords
- No email registration
- No cookies for tracking
- Access controlled solely by chart ID secrecy

---

### Automatic Data Deletion

**24-Hour Retention Policy**:
- All chart notes automatically deleted after 24 hours
- No manual deletion required
- No archival or backup retention
- No way to recover deleted notes

**Why 24 Hours?**:
- Aligns with clinical workflow (single-day use)
- Minimizes data retention risk
- Complies with data minimization principles
- Reduces HIPAA compliance requirements

---

## Data Sharing and Disclosure

### We DO NOT Share Your Data With:
- Third-party advertisers
- Marketing companies
- Data brokers
- Social media platforms
- Analytics services (no Google Analytics, etc.)

### We MAY Share Data With:

**1. Service Providers (Subcontractors)**:
- **Vercel** (web hosting): Stores encrypted chart notes temporarily
- **Upstash** (database): Backend for Vercel KV storage

All service providers are contractually obligated to protect your data and use it only for providing our services.

**2. Legal Requirements**:
We may disclose information if required by:
- Court order or subpoena
- Legal process (e.g., discovery request)
- Law enforcement investigation
- Protection of our legal rights

We will notify you of such requests unless prohibited by law.

---

## Your Privacy Rights

### Right to Access
You may request access to any chart note by providing the 6-character chart ID. We will provide the narrative text associated with that ID (if it still exists and has not expired).

**How to Request**: Enter chart ID in "Find My Chart Note" feature

### Right to Deletion
You may request deletion of a chart note before the 24-hour expiration.

**How to Request**: Email privacy@yourdomain.com with chart ID (verification required)

### Right to Opt-Out
Since we do not use cookies, tracking, or analytics, there is nothing to opt-out of. Your use of DizzyDashboard is already private by default.

### Right to Rectification
You may correct errors in a chart note before saving it by editing the narrative text in Step 9 of the evaluation.

**Limitation**: Once saved, narratives cannot be edited (contact us for deletion and re-creation)

---

## HIPAA Compliance Notice

### For Healthcare Providers

If you are a healthcare provider using DizzyDashboard in a clinical setting:

**Your Responsibilities**:
1. **Do not enter PHI** into custom edits of the narrative
2. **Do not include** patient names, DOB, MRN, SSN, or addresses
3. **Ensure compliance** with your organization's HIPAA policies
4. **Transfer to EHR**: Copy narrative to your HIPAA-compliant EHR system within 24 hours
5. **Do not rely** on DizzyDashboard for permanent medical record storage

**Our Guarantees**:
- Auto-generated narratives are PHI-free by design
- We display HIPAA compliance warnings before narrative access
- We require user acknowledgment of PHI responsibilities
- We automatically delete all data after 24 hours

**Business Associate Agreement (BAA)**:
- For enterprise deployments requiring a BAA, contact enterprise@yourdomain.com
- BAA execution requires legal review and may involve additional fees
- See [BAA_TEMPLATE.md](./BAA_TEMPLATE.md) for standard terms

---

### PHI-Free Certification

**Official Statement**:

> DizzyDashboard does not store Protected Health Information (PHI) after export. All generated clinical narratives exclude the 18 HIPAA identifiers listed in 45 CFR 164.514(b)(2):
>
> 1. Names ❌
> 2. Geographic subdivisions smaller than state ❌
> 3. Dates (except year) ❌
> 4. Telephone numbers ❌
> 5. Fax numbers ❌
> 6. Email addresses ❌
> 7. Social Security numbers ❌
> 8. Medical record numbers ❌
> 9. Health plan beneficiary numbers ❌
> 10. Account numbers ❌
> 11. Certificate/license numbers ❌
> 12. Vehicle identifiers ❌
> 13. Device identifiers ❌
> 14. Web URLs ❌
> 15. IP addresses ❌
> 16. Biometric identifiers ❌
> 17. Full-face photos ❌
> 18. Other unique identifying numbers/codes ❌
>
> Users remain responsible for ensuring manual edits comply with HIPAA requirements.

---

## Children's Privacy

DizzyDashboard is intended for use by healthcare professionals only. We do not knowingly collect information from individuals under 18 years of age.

If you believe we have inadvertently collected information from a minor, please contact us immediately at privacy@yourdomain.com.

---

## International Users

DizzyDashboard is hosted in the United States and subject to U.S. laws. If you access our application from outside the U.S., your information will be transferred to, stored, and processed in the U.S.

**For EU Users (GDPR)**:
- We comply with GDPR requirements for data minimization
- Data retention limited to 24 hours
- No profiling or automated decision-making
- Right to erasure honored (email us for immediate deletion)

**For UK Users**:
- We comply with UK GDPR and Data Protection Act 2018
- Data transfers subject to UK adequacy decisions

---

## Data Breach Notification

In the unlikely event of a data breach involving chart notes:

**We Will**:
1. Investigate the incident within 24 hours of discovery
2. Notify affected users within 72 hours (GDPR) or 60 days (HIPAA)
3. Provide details of what data was compromised
4. Explain steps taken to prevent future breaches
5. Offer assistance in mitigating harm

**You Should**:
1. Change passwords if authentication is later implemented
2. Monitor for suspicious activity in your EHR system
3. Consider notifying affected patients (if identifiable)

**Contact for Breach Reports**: security@yourdomain.com

---

## Cookies and Tracking

**We Do Not Use**:
- Cookies for tracking
- Google Analytics or similar analytics
- Facebook Pixel or advertising trackers
- Session cookies (no login system)
- Third-party tracking scripts

**We May Use** (Future):
- Essential cookies for session management (if authentication added)
- CSRF protection cookies (if forms require it)

You will be notified and asked for consent before any cookies are used.

---

## Third-Party Links

DizzyDashboard may contain links to external resources (e.g., clinical guidelines, research papers). We are not responsible for the privacy practices of these external sites.

**Current External Links**:
- None in the application interface
- Clinical references are text-only (no embedded links)

---

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect:
- Changes in our data practices
- New legal requirements
- User feedback and requests
- Security enhancements

**Notification Method**:
- Updated "Last Updated" date at top of policy
- Prominent notice in application (for material changes)
- Email notification (if we later collect email addresses)

**Your Consent**:
- Continued use of DizzyDashboard after changes constitutes acceptance
- If you disagree with changes, discontinue use

---

## Contact Us

For questions, concerns, or requests regarding this Privacy Policy:

**Privacy Officer**:
- Email: privacy@yourdomain.com
- Mail: [Your Mailing Address]
- Phone: [Your Phone Number] (Mon-Fri, 9am-5pm ET)

**Security Issues**:
- Email: security@yourdomain.com
- PGP Key: [Public key if available]

**General Inquiries**:
- Email: support@yourdomain.com
- Response time: Within 2 business days

---

## Acknowledgment

By using DizzyDashboard, you acknowledge that you have read, understood, and agree to this Privacy Policy.

**For Healthcare Providers**:
By clicking "I Understand & Acknowledge" on the HIPAA Compliance Notice, you certify that:
1. You have read this Privacy Policy
2. You understand DizzyDashboard's PHI-free design
3. You will not enter patient identifiers into the application
4. You will transfer narratives to a HIPAA-compliant EHR within 24 hours
5. You accept responsibility for any PHI you manually add to narratives

---

## Legal Basis for Processing (GDPR)

For users in the European Economic Area (EEA), we process your information based on:

1. **Legitimate Interests** (Article 6(1)(f)):
   - Providing clinical decision support
   - Preventing fraud and abuse
   - Improving application security

2. **Contractual Necessity** (Article 6(1)(b)):
   - Fulfilling our service to generate clinical narratives

3. **Legal Obligation** (Article 6(1)(c)):
   - Complying with data breach notification laws
   - Responding to legal requests

---

## Data Protection Officer

For enterprise deployments, a Data Protection Officer (DPO) may be appointed:

- Name: [To be appointed]
- Email: dpo@yourdomain.com
- Responsibilities: GDPR compliance, data protection impact assessments, breach coordination

---

**Document Version**: 1.0
**Language**: English (U.S.)
**Jurisdiction**: United States, [Your State] law
**Framework**: HIPAA, GDPR, CCPA (California Consumer Privacy Act)
