import React from 'react';
import '../styles/Policy.css';

const DMCA = () => {
  return (
    <div className="policy-container">
      <h1>DMCA Notice</h1>
      <p>
        If you believe that your copyrighted work has been infringed, please notify us with the following information:
      </p>
      <ul>
        <li>Your contact information.</li>
        <li>A description of the copyrighted work.</li>
        <li>A description of where the infringing material is located on our site.</li>
        <li>A statement that you have a good faith belief that the use is not authorized.</li>
        <li>A statement that the information in the notification is accurate.</li>
      </ul>
      <h2>Contact Us</h2>
      <p>
        Please send your notice to [Your Contact Information].
      </p>
    </div>
  );
};

export default DMCA;
