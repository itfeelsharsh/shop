import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InfoPageLayout from '../components/InfoPageLayout';

function ReturnPolicy() {
  return (
    <>
      <Helmet>
        <title>Return Policy | KamiKoto</title>
        <meta name="description" content="Review KamiKoto's return, exchange, and refund policy." />
      </Helmet>

      <InfoPageLayout
        category="Support"
        title="Return Policy"
        description="Our return and refund information, including eligibility, timelines, and return shipping."
      >
        <h2>1. Returns &amp; Exchanges</h2>
        <p>
          You have <strong>7 days</strong> from the date of delivery to request a return or exchange for an item purchased from the store. To be eligible, the item must be unused, in the same condition that you received it, and in its original packaging.
        </p>

        <h2>2. Refunds</h2>
        <p>
          Once a returned item is received and inspected, we will email you to confirm receipt. If approved, your refund will be processed to your original method of payment within 5–7 business days.
        </p>

        <h2>3. Non-Returnable Items</h2>
        <p>Certain items are not eligible for returns or refunds, including:</p>
        <ul>
          <li>Customized or personalized items</li>
          <li>Gift cards and digital voucher purchases</li>
          <li>Items marked as final sale or clearance</li>
        </ul>

        <h2>4. Return Shipping Costs</h2>
        <p>
          Customers are responsible for return shipping costs. Shipping costs are non-refundable. If a refund is issued, the cost of return shipping will be deducted from the refund amount.
        </p>

        <div className="mt-8 rounded-xl border border-red-100 bg-red-50/50 p-5">
          <p className="mb-0">
            KamiKoto is a student portfolio concept demonstration site. No actual products are sold, and no real transactions, shipments, or returns take place.
          </p>
          <p className="mb-0 mt-3">
            Have a question? Visit our <Link to="/contact">Contact Us</Link> page.
          </p>
        </div>
      </InfoPageLayout>
    </>
  );
}

export default ReturnPolicy;
