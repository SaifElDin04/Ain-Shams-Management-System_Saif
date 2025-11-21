// Fallback logic for in-memory application storage
// All fallback usage is logged to the console
const inMemoryApps = [];

function logFallbackUsage(action) {
  console.log(`[IN-MEMORY FALLBACK] ${action}`);
}

function buildAppObjectFromBody(body, files) {
  const id = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
  const idPhotoFile = files.idPhoto && files.idPhoto[0];
  const selfieFile = files.selfiePhoto && files.selfiePhoto[0];
  const certFiles = files.certificates || [];
  const certMeta = certFiles.map(f => ({ url: `/uploads/${f.filename}`, originalName: f.originalname, filename: f.filename }));
  const documents = [];
  return {
    id,
    studentName: body.studentName || '',
    email: body.email || '',
    phoneNumber: body.phoneNumber || '',
    appliedProgram: body.appliedProgram || '',
    gpa: body.gpa || '',
    testScore: body.testScore !== undefined ? Number(body.testScore) : undefined,
    age: body.age || '',
    nationalId: body.nationalId || '',
    idPhoto: idPhotoFile ? `/uploads/${idPhotoFile.filename}` : null,
    selfiePhoto: selfieFile ? `/uploads/${selfieFile.filename}` : null,
    certificates: certMeta,
    documents,
    submittedAt: body.submittedAt || new Date().toISOString(),
    applicationStatus: body.applicationStatus || 'pending',
  };
}

module.exports = {
  inMemoryApps,
  logFallbackUsage,
  buildAppObjectFromBody,
};