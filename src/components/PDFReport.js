import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaDownload, FaPrint } from 'react-icons/fa';

// Office-friendly PDF report generator for Admin Dashboard quick action
// - Neutral colors, A4 layout, generous margins
// - No dummy fallback numbers; defaults to 0 when data is missing
const PDFReport = ({ data = {}, reportType = 'General Portal Statistics' }) => {
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text('University of the Immaculate Conception', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Alumni Portal - Administrative Report', pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 36, { align: 'center' });

    // Divider line
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, 42, pageWidth - margin, 42);

    // Report title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`${reportType} Report`, margin, 55);

    let yPosition = 65;

    switch (reportType) {
      case 'Alumni Statistics':
        generateAlumniStatsReport(doc, data, yPosition, margin);
        break;
      case 'Job Opportunities':
        generateJobReport(doc, data, yPosition, margin);
        break;
      case 'User Management':
        generateUserReport(doc, data, yPosition, margin);
        break;
      case 'News & Announcements':
        generateNewsReport(doc, data, yPosition, margin);
        break;
      default:
        generateGeneralReport(doc, data, yPosition, margin);
    }

    // Save the PDF
    doc.save(`UIC_Alumni_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const makeTable = (doc, head, body, startY) => {
    autoTable(doc, {
      startY,
      head: [head],
      body,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.25 },
      headStyles: { fillColor: [235, 235, 235], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [248, 248, 248] }
    });
    return (doc.lastAutoTable && doc.lastAutoTable.finalY) || startY;
  };

  const generateAlumniStatsReport = (doc, d, startY, margin) => {
    let y = startY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary Statistics', margin, y);
    y += 6;

    const summary = [
      ['Metric', 'Value'],
      ['Total Alumni', d.totalUsers ?? 0],
      ['Pending Approvals', d.pendingApprovals ?? 0],
      ['Tracer Study Responses', d.tracerStudyResponses ?? 0]
    ];
    y = makeTable(doc, summary[0], summary.slice(1), y + 4) + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Employment Status Distribution', margin, y);
    y += 4;
    y = makeTable(
      doc,
      ['Status', 'Count'],
      [
        ['Employed', d.employment?.employed ?? 0],
        ['Self-employed', d.employment?.selfEmployed ?? 0],
        ['Unemployed', d.employment?.unemployed ?? 0],
        ['Graduate School', d.employment?.graduateSchool ?? 0]
      ],
      y + 4
    ) + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Gender Distribution', margin, y);
    const genderRows = Object.entries(d.gender || {}).map(([k, v]) => [String(k), v ?? 0]);
    makeTable(doc, ['Gender', 'Count'], genderRows.length ? genderRows : [['—', 0]], y + 4);
  };

  const generateJobReport = (doc, d, startY, margin) => {
    let y = startY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Job Opportunities Summary', margin, y);
    y += 4;

    const summary = [
      ['Metric', 'Value'],
      ['Total Job Postings', d.totalJobs ?? 0],
      ['Active Jobs', d.activeJobs ?? 0],
      ['Jobs Posted This Month', d.monthlyJobs ?? 0]
    ];
    makeTable(doc, summary[0], summary.slice(1), y + 4);
  };

  const generateUserReport = (doc, d, startY, margin) => {
    let y = startY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('User Management Summary', margin, y);
    y += 4;

    const summary = [
      ['Metric', 'Value'],
      ['Total Users', d.totalUsers ?? 0],
      ['Verified Users', d.verifiedUsers ?? 0],
      ['Pending Approvals', d.pendingApprovals ?? 0]
    ];
    makeTable(doc, summary[0], summary.slice(1), y + 4);
  };

  const generateNewsReport = (doc, d, startY, margin) => {
    let y = startY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('News & Announcements Summary', margin, y);
    y += 4;

    const summary = [
      ['Metric', 'Value'],
      ['Total News Articles', d.totalNews ?? 0],
      ['Published Articles', d.publishedNews ?? 0],
      ['Draft Articles', d.draftNews ?? 0]
    ];
    makeTable(doc, summary[0], summary.slice(1), y + 4);
  };

  const generateGeneralReport = (doc, d, startY, margin) => {
    let y = startY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('General Portal Statistics', margin, y);

    const rows = [
      ['Total Alumni', d.totalUsers ?? 0],
      ['Total Job Postings', d.totalJobs ?? 0],
      ['Total News Articles', d.totalNews ?? 0],
      ['Pending Approvals', d.pendingApprovals ?? 0],
      ['Tracer Study Responses', d.tracerStudyResponses ?? 0]
    ];
    y = makeTable(doc, ['Metric', 'Value'], rows, y + 6) + 10;

    // Tracer Study Analytics
    doc.setFont('helvetica', 'bold');
    doc.text('Tracer Study - Employment Breakdown', margin, y);
    y = makeTable(
      doc,
      ['Status', 'Count'],
      [
        ['Employed', d.employment?.employed ?? 0],
        ['Self-employed', d.employment?.selfEmployed ?? 0],
        ['Unemployed', d.employment?.unemployed ?? 0],
        ['Graduate School', d.employment?.graduateSchool ?? 0]
      ],
      y + 4
    ) + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Tracer Study - Gender Breakdown', margin, y);
    const genderRows = Object.entries(d.gender || {}).map(([k, v]) => [String(k), v ?? 0]);
    makeTable(doc, ['Gender', 'Count'], genderRows.length ? genderRows : [['—', 0]], y + 4);
  };

  const printPDF = () => {
    generatePDF();
    setTimeout(() => { window.print(); }, 800);
  };

  return (
    <div className="pdf-report-controls">
      <button
        className="btn btn-primary"
        onClick={generatePDF}
        style={{ marginRight: '10px' }}
      >
        <FaDownload /> Download PDF
      </button>
      <button className="btn btn-secondary" onClick={printPDF}>
        <FaPrint /> Print Report
      </button>
    </div>
  );
};

export default PDFReport;
