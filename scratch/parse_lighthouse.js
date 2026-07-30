import fs from 'fs';

try {
  const fileContent = fs.readFileSync('scratch/lighthouse_report.json', 'utf8');
  const report = JSON.parse(fileContent);
  
  console.log('=== LIGHTHOUSE FAILED AUDITS ===');
  const audits = report.audits;
  for (const [auditId, auditData] of Object.entries(audits)) {
    if (auditData.score !== null && auditData.score < 0.9) {
      console.log(`\nAudit: ${auditData.title} (${auditId})`);
      console.log(`Score: ${auditData.score * 100}`);
      console.log(`Description: ${auditData.description}`);
      if (auditData.displayValue) {
        console.log(`Display Value: ${auditData.displayValue}`);
      }
      if (auditData.details && auditData.details.items && auditData.details.items.length > 0) {
        console.log(`Details: ${auditData.details.items.length} items affected`);
      }
    }
  }
} catch (err) {
  console.error('Error reading/parsing report:', err);
}
