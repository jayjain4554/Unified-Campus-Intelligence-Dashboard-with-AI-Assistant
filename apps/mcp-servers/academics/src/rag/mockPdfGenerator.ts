import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

async function generateHandbook() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const page1 = pdfDoc.addPage([600, 800]);
  const { width, height } = page1.getSize();

  const title = "Student Academic Handbook 2026";
  page1.drawText(title, { x: 50, y: height - 100, size: 24, font, color: rgb(0, 0, 0.5) });

  const text = `
Section 1: Academic Integrity
All students are expected to maintain the highest standards of academic integrity. Plagiarism, 
cheating, and unauthorized collaboration are strictly prohibited and may result in immediate 
expulsion.

Section 2: Attendance Policy
Attendance is mandatory for all core classes. A student is permitted a maximum of three (3) 
unexcused absences per semester. Exceeding this limit will result in an automatic grade 
deduction of 5% from the final course grade per additional absence. Excused absences require 
a valid medical certificate submitted within 48 hours of the missed class.

Section 3: Failing a Course
If a student fails a core course (receiving a grade below C-), they are required to retake 
the course in the subsequent semester. A course can only be retaken once. If a student fails 
the same core course twice, they will be placed on academic probation. During academic 
probation, the student must maintain a GPA of 2.5 or higher to remain enrolled in the 
university. Failing an elective course does not require a retake, but the failing grade 
will be calculated into the cumulative GPA.
  `;

  page1.drawText(text, {
    x: 50,
    y: height - 160,
    size: 12,
    font,
    color: rgb(0, 0, 0),
    lineHeight: 18,
    maxWidth: 500
  });

  const pdfBytes = await pdfDoc.save();
  const outPath = path.resolve(process.cwd(), "apps/mcp-servers/academics/handbook.pdf");
  
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Mock handbook generated at ${outPath}`);
}

generateHandbook().catch(console.error);
