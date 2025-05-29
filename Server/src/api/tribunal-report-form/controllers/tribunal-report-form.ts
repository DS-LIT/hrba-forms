/**
 * tribunal-report-form controller
 */

import { factories } from '@strapi/strapi';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';


export default factories.createCoreController('api::tribunal-report-form.tribunal-report-form', ({ strapi }) => ({
  async create(ctx) {
    // Call the default create logic
    const response = await super.create(ctx);

    // Fetch the created entry (with all fields)
    const entry = response.data;
    const reportData = [entry];

    // PDF template (all fields from schema)
    const template = `<style>
    body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-left: 75px;
        margin-right: 75px;
        margin-top: 50px;
        margin-bottom: 50px;
    }

    header {
        display: flex;
        flex-direction: column;
        width: 100%;

    }

    .header-img {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        margin: 8px 0;
    }

    .header-text {
        margin: 8px 0;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .content {
        margin-top: 12px;
    }


    span {
        font-weight: 800;
    }

    h1:first-child {
        margin: 0;
    }

    p {
        margin: 24px 0;
    }


    h1:last-child {
        text-decoration: underline;
        font-weight: 300;
        margin: 0;
    }
</style>
<header>
    <div class="header-img"><img src="data:image/png;base64,
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
" /></div>
    <div class="header-text">
        <h1>BASKETBALL WA</h1>
        <h1>REPORT FORM</h1>
    </div>
</header>
<div class="content">
    {{#each reports}}
    <p><span>Name:</span> {{this.name}}</p>
    <p><span>Co-Official:</span> {{this.co_official}}</p>
    <p><span>Teams:</span> {{this.team_1_name}} ({{this.team_1_colour}}) <strong>vs</strong>
        {{this.team_2_name}} ({{this.team_2_colour}})</p>
    <p><span>Date:</span> {{this.date}} <strong>at</strong> {{this.time}}</p>
    <p><span>Venue:</span> {{this.venue}}</p>
    <p><span>Person on Report:</span> {{this.person_on_report}}</p>
    <p><span>Allegations:</span></p>
    {{#if this.allegations}}
    <ul>
        {{#each this.allegations}}
        <li>{{this}}</li>
        {{/each}}
    </ul>
    {{else}}
    None
    {{/if}}
    <p><span>Summary:</span></p>
    <p>{{this.summary}}</p>
    <p><span>Person Notified:</span> {{#if this.person_notified}}Yes{{else}}No{{/if}}</p>
    <p style="margin-top: 48px;"><span>Signature:</span>
        <img src="{{this.signature}}" alt="Signature" style="max-width:200px;max-height:80px;" />
    </p>
</div> {{/each}}`;

    // Format date and time fields for the report
    function formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    function formatTime(timeStr) {
      if (!timeStr) return '';
      const [hour, minute] = timeStr.split(':');
      let h = parseInt(hour, 10);
      const m = minute;
      const ampm = h >= 12 ? 'pm' : 'am';
      h = h % 12;
      if (h === 0) h = 12;
      return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
    }
    // Format the entry for the template
    const formattedReportData = reportData.map(r => ({
      ...r,
      date: formatDate(r.date),
      time: formatTime(r.time),
    }));

    // Compile the Handlebars template with the report data
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({ reports: formattedReportData });

    // Generate the PDF using Puppeteer
    let pdfBuffer;
    try {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();

    } catch (err) {
      strapi.log.error('Puppeteer PDF generation error:', err);
      throw new Error('PDF generation failed (puppeteer error).');
    }

    // Remove strict Buffer type check, just check for length
    if (!pdfBuffer || pdfBuffer.length === 0) {
      strapi.log.error('PDF generation failed or returned empty buffer.');
      throw new Error('PDF generation failed.');
    }

    // Determine recipient based on environment
    const isProd = process.env.NODE_ENV === 'production';
    const emailTo = isProd ? process.env.REPORT_EMAIL_RECIPIENT : 'itadmin@hillsraiders.com.au';

    // Send the PDF as an email attachment using Strapi's email plugin
    await strapi.plugin('email').service('email').send({
      to: emailTo,
      from: process.env.EMAIL_USER,
      subject: 'New Basketball WA Report Form Submission',
      text: `${entry.name} has submitted a new Basketball WA Report Form See attached PDF.`,
      attachments: [
        {
          filename: `tribunal-report-form-${entry.venue}-${entry.date}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // Delete the data row after email is sent
    await strapi.entityService.delete('api::tribunal-report-form.tribunal-report-form', entry.id);

    return response;
  },
}));
