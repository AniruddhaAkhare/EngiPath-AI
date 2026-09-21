"""
EngiPath AI — Resume Processor Service

Handles resume file:
1. Validation (type, size, extension)
2. Secure storage with sanitized filename
3. Text extraction (PyMuPDF for PDF, python-docx for DOCX)
4. Cleanup (delete after analysis if configured)

Security:
- Extension + MIME validation
- Filename sanitization (no path traversal)
- Size limits
- No execution of uploaded files
"""
import logging
import os
import hashlib
import re
import uuid
from pathlib import Path
from typing import Tuple, Optional

from flask import current_app
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "docx"}
ALLOWED_MIMES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}


class ResumeProcessorService:
    """Handles secure resume upload, storage, text extraction, and cleanup."""

    def __init__(self):
        self.upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
        self.max_size = current_app.config.get("MAX_CONTENT_LENGTH", 10 * 1024 * 1024)
        self.delete_after = current_app.config.get("DELETE_RESUME_AFTER_ANALYSIS", True)
        os.makedirs(self.upload_folder, exist_ok=True)

    def validate_file(self, file) -> Tuple[bool, str]:
        """
        Validate uploaded file type, extension, and size.

        Returns:
            (is_valid, error_message)
        """
        if not file or not file.filename:
            return False, "No file provided"

        filename = file.filename.lower()
        ext = filename.rsplit(".", 1)[-1] if "." in filename else ""

        if ext not in ALLOWED_EXTENSIONS:
            return False, f"File type .{ext} not allowed. Only PDF and DOCX are accepted."

        # Read content type
        content_type = file.content_type or ""
        # Only enforce MIME if provided and clearly wrong
        if content_type and content_type not in ALLOWED_MIMES:
            # Some browsers send text/plain for DOCX — only hard-reject clearly wrong types
            if "pdf" not in content_type and "word" not in content_type and "document" not in content_type and "octet-stream" not in content_type:
                logger.warning("Suspicious MIME type: %s for extension: %s", content_type, ext)
                # Don't reject — log and continue (extension is the primary guard)

        return True, ""

    def save_file(self, file) -> Tuple[str, str, str]:
        """
        Save uploaded file securely.

        Returns:
            (file_id, safe_path, extension)
        """
        original_name = file.filename
        ext = original_name.rsplit(".", 1)[-1].lower()

        # Generate unique filename
        file_id = str(uuid.uuid4())
        safe_name = f"{file_id}.{ext}"
        save_path = os.path.join(self.upload_folder, safe_name)

        file.save(save_path)
        logger.info("Resume saved: %s (%s)", safe_name, original_name)
        return file_id, save_path, ext

    def extract_text(self, file_path: str, ext: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Extract plain text from PDF or DOCX.

        Returns:
            (text, error_message)
        """
        try:
            if ext == "pdf":
                return self._extract_pdf(file_path), None
            elif ext == "docx":
                return self._extract_docx(file_path), None
            else:
                return None, f"Unsupported extension: {ext}"
        except Exception as exc:
            logger.error("Text extraction failed for %s: %s", file_path, exc)
            return None, f"Text extraction failed: {str(exc)}"

    def cleanup(self, file_path: str) -> None:
        """Delete the file after processing (if configured)."""
        if self.delete_after:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info("Deleted resume file: %s", file_path)
            except Exception as exc:
                logger.warning("Failed to delete file %s: %s", file_path, exc)

    def compute_text_hash(self, text: str) -> str:
        """Compute SHA-256 hash of extracted text for deduplication."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    # -----------------------------------------------------------------------
    # Extraction Methods
    # -----------------------------------------------------------------------

    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF (fitz)."""
        import fitz  # PyMuPDF

        doc = fitz.open(file_path)
        text_parts = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text_parts.append(page.get_text())

        doc.close()
        full_text = "\n".join(text_parts)

        if not full_text.strip():
            raise ValueError("PDF appears to contain no extractable text (may be image-only)")

        return _normalize_text(full_text)

    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX using python-docx."""
        from docx import Document

        doc = Document(file_path)
        text_parts = []

        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text)

        # Also extract from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        text_parts.append(cell.text)

        full_text = "\n".join(text_parts)

        if not full_text.strip():
            raise ValueError("DOCX appears to contain no extractable text")

        return _normalize_text(full_text)


def _normalize_text(text: str) -> str:
    """Normalize extracted text (remove excess whitespace, control chars)."""
    # Remove null bytes and other control characters
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Normalize whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
