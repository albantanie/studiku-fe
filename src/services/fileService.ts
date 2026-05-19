const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function getMaterialDownloadUrl(materialId: number): string {
  return `${API_BASE_URL}/materials/${materialId}/download`;
}

export function getSubmissionDownloadUrl(submissionId: number): string {
  return `${API_BASE_URL}/submissions/${submissionId}/download`;
}
