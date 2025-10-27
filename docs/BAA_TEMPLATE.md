# Business Associate Agreement (BAA) Template
## For DizzyDashboard HIPAA Compliance

**Version**: 1.0
**Last Updated**: 2025-10-22

---

## Document Overview

This template outlines the Business Associate Agreement requirements for DizzyDashboard's HIPAA compliance. This is a framework document and should be reviewed by legal counsel before execution.

---

## I. Parties to the Agreement

**COVERED ENTITY** (Healthcare Provider)
- Name: [Your Healthcare Organization]
- Address: [Street Address]
- City, State, ZIP: [Location]
- Contact: [Privacy Officer Name]
- Email: [privacy@yourdomain.com]

**BUSINESS ASSOCIATE** (DizzyDashboard Operator)
- Name: [Your Company/Individual Name]
- Application: DizzyDashboard Vestibular Screening Web Application
- Address: [Your Address]
- Contact: [Your Name]
- Email: [contact@yourdomain.com]

---

## II. Purpose and Scope

### A. Services Provided
The Business Associate will provide the following services involving Protected Health Information (PHI):

1. **Clinical Decision Support**: Processing vestibular assessment data to generate de-identified clinical narratives
2. **Temporary Data Storage**: Storing de-identified narratives for 24 hours to facilitate clinical workflow
3. **Data Retrieval**: Providing secure access to stored narratives via unique chart identifiers

### B. PHI Involved
The Business Associate will create, receive, maintain, or transmit the following PHI on behalf of the Covered Entity:

- **Primary Data**: De-identified clinical narratives describing vestibular examination findings
- **Metadata**: Chart identifiers, creation timestamps, expiration timestamps
- **NOT Included**: Patient names, dates of birth, medical record numbers, addresses, SSNs, or other direct identifiers

### C. De-Identification Commitment
The Business Associate commits to generating narratives that are PHI-free by design, using automated processes that exclude the 18 HIPAA identifiers listed in 45 CFR 164.514(b)(2).

---

## III. Permitted Uses and Disclosures of PHI

### A. Specific Permitted Uses
The Business Associate may use and disclose PHI only as follows:

1. **Service Provision**: To provide the clinical decision support services described in Section II.A
2. **Legal Requirements**: To comply with applicable federal, state, or local laws
3. **Data De-identification**: To create de-identified data sets under the HIPAA Safe Harbor method

### B. Prohibited Uses
The Business Associate shall NOT:

1. Use PHI for marketing purposes
2. Sell PHI to third parties
3. Disclose PHI to unauthorized parties
4. Use PHI for purposes other than those specified in this Agreement
5. Retain PHI beyond the 24-hour retention period (except for audit logs)

---

## IV. Safeguards and Security Measures

### A. Administrative Safeguards
The Business Associate shall implement the following administrative safeguards:

1. **Security Management Process**
   - Conduct annual risk assessments
   - Implement risk management policies
   - Maintain sanction policies for violations
   - Review information system activity regularly

2. **Workforce Training**
   - Train all personnel with PHI access on HIPAA requirements
   - Provide annual refresher training
   - Document all training activities

3. **Security Incident Procedures**
   - Establish incident response plan
   - Detect and respond to security incidents within 24 hours
   - Document all incidents in incident log

### B. Physical Safeguards
The Business Associate shall implement the following physical safeguards:

1. **Facility Access Controls**
   - Use cloud infrastructure with SOC 2 Type II certification (Vercel, Upstash)
   - Limit physical access to data centers to authorized personnel only
   - Maintain visitor logs at data center facilities

2. **Workstation Security**
   - Require screen lock after 5 minutes of inactivity
   - Use full-disk encryption on all devices accessing PHI
   - Prohibit use of personal devices for PHI access

### C. Technical Safeguards
The Business Associate shall implement the following technical safeguards:

1. **Encryption**
   - **In Transit**: TLS 1.2+ for all data transmission
   - **At Rest**: AES-256 encryption for stored narratives (application-layer)
   - **Key Management**: Rotate encryption keys annually

2. **Access Control**
   - **Unique User IDs**: Not applicable (no user authentication in MVP)
   - **Chart ID Security**: Use cryptographically random 6-character identifiers
   - **Session Management**: Implement short-lived access tokens (when auth added)

3. **Audit Controls**
   - Log all access to chart notes (CREATE, READ, DELETE events)
   - Retain audit logs for minimum 6 years
   - Include timestamp, IP address, chart ID, and success/failure status

4. **Transmission Security**
   - Use HTTPS for all API endpoints
   - Validate TLS certificates
   - Implement rate limiting to prevent brute-force attacks (10 requests/minute/IP)

---

## V. Breach Notification Obligations

### A. Discovery and Reporting
Upon discovery of a breach of unsecured PHI, the Business Associate shall:

1. **Notify Covered Entity**: Within 48 hours of discovery
2. **Provide Details**: Include nature of breach, PHI involved, individuals affected, and mitigation steps
3. **Investigate**: Conduct root cause analysis within 7 days
4. **Remediate**: Implement corrective actions within 30 days

### B. Definition of Breach
A breach includes any:
- Unauthorized access to PHI by persons not authorized under this Agreement
- Unauthorized disclosure of PHI to third parties
- Loss or theft of devices containing unencrypted PHI
- Ransomware or malware infection affecting PHI

### C. Notification Format
Breach notification must include:
- Date and time of breach discovery
- Description of breach incident
- Types of PHI involved (but not the actual PHI)
- Number of individuals affected
- Steps taken to mitigate harm
- Contact information for questions

---

## VI. Subcontractors and Third Parties

### A. Current Subcontractors
The Business Associate uses the following subcontractors who may access PHI:

| Subcontractor | Service | BAA Required | BAA Status |
|---------------|---------|--------------|------------|
| Vercel Inc. | Web hosting & API infrastructure | Yes | ❌ Pending (requires Enterprise plan) |
| Upstash (Redis) | Data storage (Vercel KV backend) | Yes | ❌ Pending (requires Enterprise plan) |
| [Add others] | [Service description] | [Yes/No] | [Status] |

### B. Subcontractor Requirements
Before engaging any subcontractor, the Business Associate shall:

1. Obtain written assurance (BAA) that the subcontractor will:
   - Implement appropriate safeguards
   - Report breaches to Business Associate
   - Comply with same restrictions as Business Associate

2. Provide Covered Entity with:
   - Name and contact information of subcontractor
   - Description of services provided
   - Copy of executed BAA (upon request)

### C. Liability
The Business Associate remains liable for any breaches or violations by its subcontractors.

---

## VII. Individual Rights

### A. Right to Access
Upon request by Covered Entity, the Business Associate shall provide access to PHI within 30 days to enable Covered Entity to fulfill individual access requests under 45 CFR 164.524.

**Implementation**: Provide API endpoint for chart note retrieval by authorized Covered Entity staff.

### B. Right to Amendment
The Business Associate shall make amendments to PHI within 60 days upon request by Covered Entity to fulfill individual amendment requests under 45 CFR 164.526.

**Implementation**: Not currently supported; recommend manual process via support ticket.

### C. Right to Accounting of Disclosures
The Business Associate shall provide an accounting of PHI disclosures within 60 days upon request by Covered Entity under 45 CFR 164.528.

**Implementation**: Generate report from audit logs showing all access events for specified chart ID.

---

## VIII. Audit and Inspection Rights

### A. Covered Entity Rights
The Covered Entity has the right to:

1. **Audit**: Conduct annual audits of Business Associate's security practices
2. **Inspect**: Review policies, procedures, and audit logs upon 30 days' notice
3. **Request Documentation**: Obtain copies of security assessments and penetration tests

### B. Regulatory Compliance
The Business Associate shall make its internal practices, books, and records available to the Secretary of Health and Human Services (HHS) for purposes of determining compliance with HIPAA.

### C. Audit Costs
- **Routine Audits**: Business Associate shall cooperate at no charge
- **For-Cause Audits**: Costs borne by party at fault (if breach) or Covered Entity (if no fault)

---

## IX. Data Retention and Destruction

### A. Retention Period
The Business Associate shall retain PHI only as long as necessary to provide services:

1. **Chart Notes**: Maximum 24 hours, automatic deletion via TTL
2. **Audit Logs**: Minimum 6 years from creation date
3. **Backup Data**: Maximum 30 days (if backups implemented)

### B. Destruction Methods
Upon expiration or termination, the Business Associate shall:

1. **Automated Deletion**: Allow Vercel KV TTL to expire chart notes (no action required)
2. **Manual Deletion**: Use `kv.del()` command to immediately remove expired notes
3. **Audit Logs**: Securely delete after 6-year retention using `kv.del()` batch operations

### C. Certification of Destruction
Upon request, the Business Associate shall provide written certification that all PHI has been destroyed, including:
- Date of destruction
- Method of destruction (TTL expiration, manual deletion)
- Confirmation that all copies (including backups) are destroyed

---

## X. Term and Termination

### A. Effective Date
This Agreement becomes effective on the date executed by both parties and remains in effect until terminated.

### B. Termination for Cause
Either party may terminate this Agreement immediately upon written notice if:

1. The other party breaches a material term and fails to cure within 30 days
2. The other party experiences a data breach affecting more than 500 individuals
3. Termination is required by law

### C. Termination Without Cause
Either party may terminate this Agreement without cause upon 90 days' written notice.

### D. Obligations Upon Termination
Upon termination, the Business Associate shall:

1. **Return PHI**: If feasible, return all PHI to Covered Entity within 30 days
2. **Destroy PHI**: If return is not feasible, destroy all PHI and certify destruction
3. **Continue Protections**: If retention is required by law, continue to protect PHI under this Agreement

---

## XI. Indemnification and Liability

### A. Business Associate Indemnification
The Business Associate shall indemnify and hold harmless the Covered Entity from any claims, damages, or penalties arising from:

1. Business Associate's breach of this Agreement
2. Business Associate's failure to implement required safeguards
3. Business Associate's unauthorized use or disclosure of PHI

### B. Covered Entity Indemnification
The Covered Entity shall indemnify and hold harmless the Business Associate from any claims arising from:

1. Covered Entity's breach of this Agreement
2. Covered Entity's provision of inaccurate or incomplete PHI
3. Covered Entity's failure to obtain necessary patient authorizations

### C. Limitation of Liability
Notwithstanding the above:

1. **Cap**: Total liability shall not exceed $500,000 per incident
2. **Exclusions**: Excludes liability for regulatory fines, criminal penalties, and willful misconduct
3. **Insurance**: Business Associate shall maintain cyber liability insurance with minimum $1,000,000 coverage

---

## XII. Miscellaneous Provisions

### A. Amendment
This Agreement may only be amended by written agreement signed by both parties. Amendments required to comply with HIPAA changes shall be implemented within 30 days.

### B. Survival
Sections IV (Safeguards), V (Breach Notification), VII (Individual Rights), IX (Retention), and XI (Indemnification) shall survive termination of this Agreement.

### C. Governing Law
This Agreement shall be governed by the laws of [Your State] and the federal HIPAA regulations (45 CFR Parts 160 and 164).

### D. Entire Agreement
This Agreement constitutes the entire agreement between the parties regarding PHI and supersedes all prior agreements.

### E. Severability
If any provision is found to be unenforceable, the remaining provisions shall remain in full force.

---

## XIII. Signature Page

**COVERED ENTITY** (Healthcare Provider)

Signature: ___________________________
Printed Name: ________________________
Title: _______________________________
Date: ________________________________


**BUSINESS ASSOCIATE** (DizzyDashboard)

Signature: ___________________________
Printed Name: ________________________
Title: _______________________________
Date: ________________________________

---

## Appendix A: Technical Specifications

### Encryption Standards
- **Algorithm**: AES-256-GCM
- **Key Length**: 256 bits
- **IV Length**: 128 bits (16 bytes)
- **Key Rotation**: Annually or upon suspected compromise

### Audit Log Format
```json
{
  "eventId": "uuid-v4",
  "timestamp": 1640000000000,
  "eventType": "CREATE | READ | DELETE",
  "resourceType": "ChartNote",
  "resourceId": "ABC123",
  "actorIp": "192.168.1.1",
  "actorUserAgent": "Mozilla/5.0...",
  "success": true,
  "errorMessage": null
}
```

### Rate Limiting
- **Threshold**: 10 requests per minute per IP address
- **Response**: HTTP 429 Too Many Requests
- **Reset**: Sliding window (not fixed interval)

---

## Appendix B: Required Vendor BAAs

### 1. Vercel Business Associate Agreement
**Obtain From**: https://vercel.com/legal/hipaa-baa
**Requirements**:
- Vercel Enterprise plan ($2,000+/month)
- Legal review and countersigning
- Annual renewal

**Key Terms**:
- Vercel acts as subcontractor to your BAA with Covered Entity
- Vercel provides infrastructure security (not application-layer encryption)
- Covered Entity must implement own encryption if required

### 2. Upstash Business Associate Agreement
**Obtain From**: Contact support@upstash.com
**Requirements**:
- Upstash Enterprise plan with HIPAA add-on
- Dedicated Redis cluster
- Customer-managed encryption keys

**Key Terms**:
- Upstash provides encryption at rest
- Audit logging available in Enterprise plan
- Minimum 12-month commitment

---

## Appendix C: Compliance Checklist

Use this checklist to track BAA implementation:

### Pre-Execution
- [ ] Legal counsel review of BAA template
- [ ] Risk assessment completed
- [ ] Security controls documented (see SECURITY.md)
- [ ] Vendor BAAs obtained (Vercel, Upstash)

### Technical Implementation
- [ ] Application-layer encryption implemented
- [ ] Audit logging deployed
- [ ] Rate limiting enabled
- [ ] Backup/recovery procedures documented

### Operational Readiness
- [ ] Workforce training completed
- [ ] Incident response plan tested
- [ ] Breach notification procedures documented
- [ ] Privacy officer designated

### Post-Execution
- [ ] BAA signed by both parties
- [ ] Copy provided to Covered Entity privacy officer
- [ ] Annual audit scheduled
- [ ] Insurance policy obtained

---

**Document Classification**: Legal - Confidential
**Next Review Date**: [12 months from execution]
**Document Owner**: [Legal/Compliance Team]
