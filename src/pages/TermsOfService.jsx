import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InfoPageLayout from '../components/InfoPageLayout';

function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | KamiKoto</title>
        <meta name="description" content="Review the terms that apply to use of the KamiKoto application." />
      </Helmet>

      <InfoPageLayout
        category="Legal"
        title="Terms of Service"
        description="Please review these terms before accessing or using the KamiKoto application."
      >
        <h2>1. Acceptance of Terms</h2>
        <p>
          These Terms of Service govern use of the KamiKoto application. By using the app, you accept these terms in full. If you disagree with any part of these terms, do not use the application.
        </p>

        <h2>2. Purpose of the Application</h2>
        <p>
          KamiKoto is developed for educational purposes. It demonstrates React and Firebase integration in a shopping application.
        </p>

        <h2>3. No Data Collection</h2>
        <p>
          We do not collect, store, or process personal information from users. As a result, there are no user accounts, payment processing, or data storage mechanisms in place.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          All content, including text, images, logos, and software, is the property of KamiKoto or its respective owners. Unauthorized use or reproduction of materials is prohibited.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          KamiKoto is provided “as is” without warranties, express or implied. We are not liable for damages arising from the use or inability to use the application.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          We may modify these Terms of Service at any time. Changes are effective upon posting on this page. Continued use of the application constitutes acceptance of the revised terms.
        </p>

        <h2>7. Governing Law</h2>
        <p>
          These terms are governed by and construed in accordance with the laws of Sentinese Peoples Court. Any disputes arising from these terms shall be resolved in the courts of Sentinese Peoples Court.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          If you have questions about these Terms of Service, contact us through the <Link to="/contact">Contact Us</Link> page.
        </p>
      </InfoPageLayout>
    </>
  );
}

export default TermsOfService;
