interface SendEmailParams {
  to: string;
  fragrances: Array<{
    title: string;
    description: string;
    image: string;
    matchScore: number;
    purchaseUrl?: string;
  }>;
  tags: string[];
}

export async function sendQuizResultsEmail({ to, fragrances, tags }: SendEmailParams) {
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not configured');
    return;
  }

  const topFragrances = fragrances.slice(0, 5); // Get top 5 fragrances
  const fragranceProfile = tags.map(tag => tag.replace(/-/g, ' ')).join(', ');

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: 'Fragrance Finder',
        email: 'noreply@fragrancefinder.co.uk',
      },
      to: [{ email: to }],
      subject: 'Your Top 5 Fragrance Matches',
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #ffffff;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
                padding: 20px 0;
                border-bottom: 1px solid #eee;
              }
              .fragrance-card { 
                border: 1px solid #eee; 
                border-radius: 16px; 
                padding: 24px; 
                margin-bottom: 24px;
                background: #ffffff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              }
              .match-score {
                display: inline-block;
                background: #000;
                color: white;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 600;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(to bottom, #000000, #333333);
                color: white;
                padding: 16px 24px;
                text-decoration: none;
                border-radius: 12px;
                margin-top: 16px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                width: 100%;
                box-sizing: border-box;
              }
              .profile-section {
                background: #f8f8f8;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 30px;
                border: 1px solid #eee;
              }
              .rank {
                font-size: 24px;
                font-weight: bold;
                color: #666;
                margin-right: 10px;
              }
              .fragrance-header {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
              }
              .fragrance-image {
                width: 100%;
                max-width: 260px;
                height: 260px;
                object-fit: contain;
                margin: 0 auto 20px;
                display: block;
                border-radius: 8px;
              }
              .fragrance-title {
                font-size: 24px;
                font-weight: bold;
                margin: 0 0 8px 0;
                color: #000;
              }
              .fragrance-description {
                color: #666;
                margin: 0 0 16px 0;
                font-size: 16px;
                line-height: 1.5;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px; color: #000;">Your Top 5 Fragrance Matches</h1>
                <p style="margin: 12px 0 0 0; color: #666;">Based on your preferences, we've found these perfect scents for you.</p>
              </div>

              <div class="profile-section">
                <h2 style="margin: 0 0 12px 0; font-size: 20px;">Your Fragrance Profile</h2>
                <p style="margin: 0; color: #666;">${fragranceProfile}</p>
              </div>

              ${topFragrances.map((fragrance, index) => `
                <div class="fragrance-card">
                  <div class="fragrance-header">
                    <span class="rank">#${index + 1}</span>
                    <span class="match-score">${fragrance.matchScore}% Match</span>
                  </div>
                  <img src="${fragrance.image}" alt="${fragrance.title}" class="fragrance-image" />
                  <h2 class="fragrance-title">${fragrance.title}</h2>
                  <p class="fragrance-description">${fragrance.description}</p>
                  ${fragrance.purchaseUrl ? `
                    <a href="${fragrance.purchaseUrl}" class="cta-button">Find Best Prices</a>
                  ` : ''}
                </div>
              `).join('')}

              <div class="footer">
                <p style="margin: 0;">© 2025 Fragrance Finder. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }

  return response.json();
} 