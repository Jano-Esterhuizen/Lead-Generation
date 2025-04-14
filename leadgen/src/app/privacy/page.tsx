export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Account information (name, email)</li>
          <li>Gmail authentication tokens for email sending functionality</li>
          <li>Campaign and lead information you create within the application</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Send emails on your behalf when you create email campaigns</li>
          <li>Communicate with you about our services</li>
        </ul>

        <h2>3. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information.</p>

        <h2>4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at: janocodeacc@gmail.com</p>
      </div>
    </div>
  )
} 