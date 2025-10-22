import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FaDownload, FaPrint, FaFilePdf } from 'react-icons/fa';

const PDFReport = ({ data, reportType }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add UIC header
    doc.setFontSize(20);
    doc.setTextColor(233, 30, 99); // UIC Pink
    doc.text('University of the Immaculate Conception', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Alumni Portal - Administrative Report', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });
    
    // Add report type title
    doc.setFontSize(16);
    doc.setTextColor(233, 30, 99);
    doc.text(`${reportType} Report`, 20, 55);
    
    let yPosition = 70;
    
    switch (reportType) {
      case 'Alumni Statistics':
        generateAlumniStatsReport(doc, data, yPosition);
        break;
      case 'Job Opportunities':
        generateJobReport(doc, data, yPosition);
        break;
      case 'User Management':
        generateUserReport(doc, data, yPosition);
        break;
      case 'News & Announcements':
        generateNewsReport(doc, data, yPosition);
        break;
      default:
        generateGeneralReport(doc, data, yPosition);
    }
    
    // Save the PDF
    doc.save(`UIC_Alumni_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  const generateAlumniStatsReport = (doc, data, startY) => {
    let y = startY;
    
    // Summary statistics
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('Summary Statistics', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Alumni: ${data.totalUsers || 1250}`, 20, y);
    y += 6;
    doc.text(`Active Users: ${data.activeUsers || 892}`, 20, y);
    y += 6;
    doc.text(`New Registrations: ${data.newRegistrations || 23}`, 20, y);
    y += 6;
    doc.text(`Pending Approvals: ${data.pendingApprovals || 15}`, 20, y);
    y += 15;
    
    // Employment statistics table
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('Employment Status Distribution', 20, y);
    y += 10;
    
    const employmentData = [
      ['Status', 'Count', 'Percentage'],
      ['Employed', '812', '65%'],
      ['Unemployed', '150', '12%'],
      ['Self-employed', '188', '15%'],
      ['Graduate School', '63', '5%'],
      ['Other', '37', '3%']
    ];
    
    doc.autoTable({
      startY: y,
      head: [employmentData[0]],
      body: employmentData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [233, 30, 99] },
      styles: { fontSize: 9 }
    });
    
    y = doc.lastAutoTable.finalY + 15;
    
    // Gender distribution
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('Gender Distribution', 20, y);
    y += 10;
    
    const genderData = [
      ['Gender', 'Count', 'Percentage'],
      ['Female', '725', '58%'],
      ['Male', '525', '42%']
    ];
    
    doc.autoTable({
      startY: y,
      head: [genderData[0]],
      body: genderData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [233, 30, 99] },
      styles: { fontSize: 9 }
    });
  };
  
  const generateJobReport = (doc, data, startY) => {
    let y = startY;
    
    // Job summary
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('Job Opportunities Summary', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Job Postings: ${data.totalJobs || 89}`, 20, y);
    y += 6;
    doc.text(`Active Jobs: ${data.activeJobs || 67}`, 20, y);
    y += 6;
    doc.text(`Jobs Posted This Month: ${data.monthlyJobs || 8}`, 20, y);
    y += 15;
    
    // Job opportunities table
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('Recent Job Postings', 20, y);
    y += 10;
    
    const jobData = [
      ['Title', 'Company', 'Location', 'Type', 'Salary Range'],
      ['Senior Software Engineer', 'TechCorp Inc.', 'Davao City', 'Full-time', '₱80,000 - ₱120,000'],
      ['Data Scientist', 'DataFlow Solutions', 'Manila', 'Full-time', '₱90,000 - ₱150,000'],
      ['Nurse Practitioner', 'City Hospital', 'Cebu City', 'Full-time', '₱60,000 - ₱90,000'],
      ['Marketing Manager', 'Global Solutions', 'Manila', 'Full-time', '₱75,000 - ₱110,000'],
      ['Accountant', 'FinancePro Services', 'Davao City', 'Full-time', '₱50,000 - ₱75,000']
    ];
    
    doc.autoTable({
      startY: y,
      head: [jobData[0]],
      body: jobData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [233, 30, 99] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 }
      }
    });
  };
  
  const generateUserReport = (doc, data, startY) => {
    let y = startY;
    
    // User summary
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('User Management Summary', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Users: ${data.totalUsers || 1250}`, 20, y);
    y += 6;
    doc.text(`Verified Users: ${data.verifiedUsers || 1235}`, 20, y);
    y += 6;
    doc.text(`Pending Approvals: ${data.pendingApprovals || 15}`, 20, y);
    y += 15;
    
    // Pending approvals table
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('Pending User Approvals', 20, y);
    y += 10;
    
    const pendingData = [
      ['Name', 'Email', 'Course', 'Batch Year', 'Registration Date'],
      ['Maria Santos', 'maria.santos@email.com', 'BS Computer Science', '2020', '2024-01-15'],
      ['John Dela Cruz', 'john.delacruz@email.com', 'BS Nursing', '2019', '2024-01-14'],
      ['Ana Garcia', 'ana.garcia@email.com', 'BS Accountancy', '2021', '2024-01-13'],
      ['Carlos Reyes', 'carlos.reyes@email.com', 'BS Engineering', '2018', '2024-01-12']
    ];
    
    doc.autoTable({
      startY: y,
      head: [pendingData[0]],
      body: pendingData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [233, 30, 99] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 }
      }
    });
  };
  
  const generateNewsReport = (doc, data, startY) => {
    let y = startY;
    
    // News summary
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('News & Announcements Summary', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total News Articles: ${data.totalNews || 45}`, 20, y);
    y += 6;
    doc.text(`Published Articles: ${data.publishedNews || 42}`, 20, y);
    y += 6;
    doc.text(`Draft Articles: ${data.draftNews || 3}`, 20, y);
    y += 15;
    
    // Recent news table
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('Recent News Articles', 20, y);
    y += 10;
    
    const newsData = [
      ['Title', 'Author', 'Status', 'Published Date'],
      ['UIC Alumni Homecoming 2024', 'Admin', 'Published', '2024-01-15'],
      ['New Job Opportunities Available', 'Admin', 'Published', '2024-01-14'],
      ['Alumni Directory Update', 'Admin', 'Published', '2024-01-13'],
      ['Professional Development Workshop', 'Admin', 'Published', '2024-01-12'],
      ['Scholarship Opportunities', 'Admin', 'Draft', '2024-01-11']
    ];
    
    doc.autoTable({
      startY: y,
      head: [newsData[0]],
      body: newsData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [233, 30, 99] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 }
      }
    });
  };
  
  const generateGeneralReport = (doc, data, startY) => {
    let y = startY;
    
    doc.setFontSize(12);
    doc.setTextColor(233, 30, 99);
    doc.text('General Portal Statistics', 20, y);
    y += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Alumni: ${data.totalUsers || 1250}`, 20, y);
    y += 6;
    doc.text(`Total Job Postings: ${data.totalJobs || 89}`, 20, y);
    y += 6;
    doc.text(`Total News Articles: ${data.totalNews || 45}`, 20, y);
    y += 6;
    doc.text(`Active Users This Week: ${data.activeUsers || 892}`, 20, y);
    y += 6;
    doc.text(`New Registrations This Month: ${data.newRegistrations || 23}`, 20, y);
  };
  
  const printPDF = () => {
    generatePDF();
    // The PDF will be downloaded and can be printed
    setTimeout(() => {
      window.print();
    }, 1000);
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
      <button 
        className="btn btn-secondary"
        onClick={printPDF}
      >
        <FaPrint /> Print Report
      </button>
    </div>
  );
};

export default PDFReport;
