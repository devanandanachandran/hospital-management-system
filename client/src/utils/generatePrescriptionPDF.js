import jsPDF from 'jspdf';

export function generatePrescriptionPDF(appointment) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175); // blue
  doc.text('MediCare HMS', 20, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text('Prescription Summary', 20, 28);

  doc.setDrawColor(220);
  doc.line(20, 32, 190, 32);

  // Patient / doctor info
  doc.setFontSize(11);
  doc.setTextColor(30);
  let y = 45;

  const addLine = (label, value) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(value), 60, y);
    y += 8;
  };

  addLine('Patient', appointment.patient?.name || 'N/A');
  addLine('Doctor', `Dr. ${appointment.doctor?.name || 'N/A'}`);
  addLine('Date', new Date(appointment.date).toLocaleDateString());
  addLine('Time', new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  addLine('Reason', appointment.reason || 'N/A');

  y += 5;
  doc.setDrawColor(220);
  doc.line(20, y, 190, y);
  y += 12;

  // Prescription content
  doc.setFont(undefined, 'bold');
  doc.setFontSize(13);
  doc.text('Prescription', 20, y);
  y += 10;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  const prescriptionText = appointment.prescription || 'No prescription recorded';
  const splitText = doc.splitTextToSize(prescriptionText, 170);
  doc.text(splitText, 20, y);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} — MediCare HMS`,
    20,
    pageHeight - 15
  );

  doc.save(`Prescription_${appointment.patient?.name || 'patient'}_${new Date(appointment.date).toLocaleDateString().replace(/\//g, '-')}.pdf`);
}