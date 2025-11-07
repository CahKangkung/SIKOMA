// src/components/TermsContent.jsx
import React from "react";

export default function TermsContent() {
  const year = new Date().getFullYear();
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
      <p className="italic text-neutral-500">
        This document is a general template for SIKOMA (Correspondence Information and
        Management System). It is provided for informational purposes only and does not
        constitute legal advice. Please adapt it to your organization’s policies and
        applicable laws.
      </p>
      <p className="text-neutral-500">Last updated: {lastUpdated}</p>

      <h3 className="text-base font-semibold text-neutral-900">1) Introduction</h3>
      <p>
        SIKOMA provides tools for correspondence, document, and records management.
        By creating an account or using SIKOMA, you agree to these Terms of Service
        and this Privacy Policy (collectively, the “Terms”).
      </p>

      <h3 className="text-base font-semibold text-neutral-900">2) Eligibility & Account</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>You must be authorized by your organization to use SIKOMA.</li>
        <li>You are responsible for the accuracy of your registration information and for keeping it up to date.</li>
        <li>Keep your credentials confidential. Activities performed through your account are deemed to be yours.</li>
        <li>Notify your SIKOMA administrator promptly of any suspected breach or unauthorized access.</li>
      </ul>

      <h3 className="text-base font-semibold text-neutral-900">3) Acceptable Use</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Do not upload unlawful, infringing, defamatory, discriminatory, or harmful content.</li>
        <li>Do not attempt to disrupt, reverse engineer, or gain unauthorized access to the service or data.</li>
        <li>Use SIKOMA only for legitimate organizational purposes and in line with internal policies.</li>
      </ul>

      <h3 className="text-base font-semibold text-neutral-900">4) Your Content & Records</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          You (or your organization) retain ownership of the documents and records you
          submit to SIKOMA.
        </li>
        <li>
          You grant SIKOMA and relevant organizational administrators a limited license
          to process and display your content solely to operate and improve the service,
          comply with law, and enforce these Terms.
        </li>
        <li>
          You represent that you have all rights and permissions necessary to store and
          process the content in SIKOMA.
        </li>
      </ul>

      <h3 className="text-base font-semibold text-neutral-900">5) Intellectual Property</h3>
      <p>
        The software, user interface, and brand elements of SIKOMA are protected by
        intellectual property laws. Except for content you own, you may not copy,
        modify, or distribute materials from SIKOMA without prior written permission.
      </p>

      <h3 className="text-base font-semibold text-neutral-900">6) Service Availability & Changes</h3>
      <p>
        SIKOMA is provided on an “as is” and “as available” basis. Features may change,
        be suspended, or discontinued to maintain, improve, or secure the service. We
        endeavor to notify users of material changes where feasible.
      </p>

      <h3 className="text-base font-semibold text-neutral-900">7) Disclaimers & Limitation of Liability</h3>
      <p>
        To the maximum extent permitted by law, SIKOMA and its operators are not liable
        for indirect, incidental, consequential, or punitive damages, or for any loss
        of data, revenue, or business arising from the use or inability to use the
        service. Nothing in these Terms excludes liability where such exclusion is
        not permitted by applicable law.
      </p>

      <h3 className="text-base font-semibold text-neutral-900">8) Termination</h3>
      <p>
        We may suspend or terminate access if you violate these Terms, pose a security
        risk, or as required by law. Your organization may also manage or revoke your
        access in line with internal policy. Upon termination, certain sections of these
        Terms survive (e.g., intellectual property, disclaimers, governing law).
      </p>

      <h3 className="text-base font-semibold text-neutral-900">9) Privacy Policy</h3>
      <p>
        This section explains what personal data SIKOMA processes, for what purposes,
        and your choices. Where required by law (e.g., GDPR), references to “legal
        bases” are included and should be adapted by your organization.
      </p>

      <h4 className="font-semibold text-neutral-900">9.1 Data We Collect</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <span className="font-medium">Account Data:</span> username, email address,
          organizational unit/role, and preferences.
        </li>
        <li>
          <span className="font-medium">Content & Metadata:</span> documents, messages,
          attachments, correspondence metadata (e.g., sender/recipient, timestamps),
          workflow actions (routing, approval).
        </li>
        <li>
          <span className="font-medium">Usage & Device Data:</span> log files, IP address,
          browser information, device identifiers, diagnostics, and performance metrics.
        </li>
        <li>
          <span className="font-medium">Cookies/Local Storage:</span> used for session
          management, security, and user preferences.
        </li>
      </ul>

      <h4 className="font-semibold text-neutral-900">9.2 How We Use Data</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Provide, maintain, and improve SIKOMA and its security.</li>
        <li>Authenticate users and authorize access according to roles/policies.</li>
        <li>Enable organizational workflows (e.g., routing, review, audit trails).</li>
        <li>Communicate about service updates, incidents, and support.</li>
        <li>Comply with legal obligations and enforce these Terms.</li>
      </ul>

      <h4 className="font-semibold text-neutral-900">9.3 Legal Bases (where required)</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Performance of a contract (providing the service to your organization).</li>
        <li>Legitimate interests (security, service improvement, internal analytics).</li>
        <li>Compliance with legal obligations.</li>
        <li>Consent, where expressly obtained (e.g., optional features or notices).</li>
      </ul>

      <h4 className="font-semibold text-neutral-900">9.4 Sharing & Disclosure</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <span className="font-medium">Within your organization:</span> administrators
          and authorized users may access data as required by policy.
        </li>
        <li>
          <span className="font-medium">Service providers:</span> vetted vendors that
          support hosting, storage, security, or analytics under appropriate safeguards.
        </li>
        <li>
          <span className="font-medium">Legal and compliance:</span> when required by
          law, court order, or to protect rights, safety, or systems.
        </li>
      </ul>

      <h4 className="font-semibold text-neutral-900">9.5 Retention</h4>
      <p>
        We retain personal data for as long as your account is active or as required by
        organizational records management and applicable law. Retention periods for specific
        classes of records may be defined by your organization’s policy.
      </p>

      <h4 className="font-semibold text-neutral-900">9.6 Security</h4>
      <p>
        We implement reasonable technical and organizational measures to protect data
        (e.g., HTTPS in transit, access controls, logging). No system is 100% secure;
        you are encouraged to follow best practices for passwords and access.
      </p>

      <h4 className="font-semibold text-neutral-900">9.7 International Transfers</h4>
      <p>
        If data is transferred across borders, we use appropriate safeguards
        (e.g., contractual clauses) as required by applicable law. Your organization
        may also impose residency requirements that govern where data is stored.
      </p>

      <h4 className="font-semibold text-neutral-900">9.8 Your Rights</h4>
      <p>
        Depending on your jurisdiction, you may have rights to access, correct, delete,
        restrict, or object to processing of your personal data, and to data portability.
        Requests may be routed through your organization’s administrator.
      </p>

      <h4 className="font-semibold text-neutral-900">9.9 Children’s Privacy</h4>
      <p>
        SIKOMA is intended for authorized organizational users and is not directed to
        children under the age at which consent is legally required in your jurisdiction.
      </p>

      <h4 className="font-semibold text-neutral-900">9.10 Cookies & Local Storage</h4>
      <p>
        We use cookies and/or local storage for session continuity, security protections,
        and preferences. You can control cookies via your browser settings; certain features
        may not function properly if disabled.
      </p>

      <h3 className="text-base font-semibold text-neutral-900">10) Changes to These Terms</h3>
      <p>
        We may update these Terms from time to time. Material changes will be communicated
        via the application or official organizational channels. Continued use of SIKOMA
        after changes become effective constitutes acceptance of the updated Terms.
      </p>

      <h3 className="text-base font-semibold text-neutral-900">11) Governing Law</h3>
      <p>
        These Terms are governed by the laws applicable to your organization’s principal
        place of business. <span className="italic">[Replace with the specific jurisdiction
        if required by policy, e.g., “Republic of Indonesia.”]</span>
      </p>

      <h3 className="text-base font-semibold text-neutral-900">12) Contact</h3>
      <p>
        For questions about these Terms or our data practices, contact the SIKOMA
        administrator at <span className="font-mono">admin@sikoma.example</span> or your
        organization’s official helpdesk. <span className="italic">[Replace with your
        real contact.]</span>
      </p>

      <p className="text-center text-neutral-500">© {year} SIKOMA. All rights reserved.</p>
    </div>
  );
}
