export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Lead-Generator, you accept and agree to be bound by these Terms of Service.</p>

        <h2>2. Description of Service</h2>
        <p>Lead-Generator is a lead generation tool that helps users find and contact local businesses. The service includes features for creating and managing email campaigns.</p>

        <h2>3. User Responsibilities</h2>
        <ul>
          <li>You must provide accurate information when using our service</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You agree to use the service in compliance with all applicable laws</li>
        </ul>

        <h2>4. Email Campaign Guidelines</h2>
        <p>When using our email campaign features, you agree to:</p>
        <ul>
          <li>Not send spam or unsolicited emails</li>
          <li>Comply with anti-spam laws and regulations</li>
          <li>Respect recipient opt-out requests</li>
        </ul>

        <h2>5. Limitation of Liability</h2>
        <p>The service is provided "as is" without warranties of any kind.</p>

        <h2>6. Contact</h2>
        <p>For any questions regarding these Terms of Service, please contact: janocodeacc@gmail.com</p>
      </div>
    </div>
  )
} 