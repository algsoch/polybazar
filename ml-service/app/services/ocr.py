"""
OCR Service for KYC Document Processing
Supports PAN, Aadhaar, GST, and other Indian business documents
"""

import re
from typing import Dict, Any, Optional
from io import BytesIO
from PIL import Image
import httpx
import logging
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64

from app.config import settings

logger = logging.getLogger(__name__)

# Try to import pytesseract, but make it optional
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract not available, OCR will use mock data")


class OCRService:
    def __init__(self):
        self._ready = True
        self._cipher = self._init_encryption()
        logger.info("OCR service initialized")
    
    def _init_encryption(self):
        """Initialize AES-256 encryption for sensitive KYC data"""
        try:
            key = settings.ENCRYPTION_KEY.encode()
            # Derive a proper key using PBKDF2
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b'polybazar_kyc_salt',
                iterations=100000,
                backend=default_backend()
            )
            derived_key = base64.urlsafe_b64encode(kdf.derive(key))
            return Fernet(derived_key)
        except Exception as e:
            logger.error(f"Failed to initialize encryption: {e}")
            return None
    
    def is_ready(self) -> bool:
        return self._ready
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        if self._cipher:
            return self._cipher.encrypt(data.encode()).decode()
        return data
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        if self._cipher:
            return self._cipher.decrypt(encrypted_data.encode()).decode()
        return encrypted_data
    
    async def extract(self, document_url: str, document_type: str) -> Dict[str, Any]:
        """Extract data from document URL"""
        try:
            # Download image
            async with httpx.AsyncClient() as client:
                response = await client.get(document_url)
                response.raise_for_status()
                image_bytes = response.content
            
            return self.extract_bytes(image_bytes, document_type)
        except Exception as e:
            logger.error(f"Failed to extract document: {e}")
            raise
    
    def extract_bytes(self, image_bytes: bytes, document_type: str) -> Dict[str, Any]:
        """Extract data from document bytes"""
        
        # Get raw OCR text
        raw_text = self._perform_ocr(image_bytes)
        
        # Parse based on document type
        if document_type.lower() == "pan":
            extracted_data = self._parse_pan(raw_text)
        elif document_type.lower() == "aadhaar":
            extracted_data = self._parse_aadhaar(raw_text)
        elif document_type.lower() == "gst":
            extracted_data = self._parse_gst(raw_text)
        elif document_type.lower() == "cin":
            extracted_data = self._parse_cin(raw_text)
        else:
            extracted_data = {"raw": raw_text}
        
        # Calculate confidence based on how many fields were extracted
        total_fields = len(extracted_data)
        filled_fields = sum(1 for v in extracted_data.values() if v and v != "Not Found")
        confidence = filled_fields / max(total_fields, 1)
        
        return {
            "extracted_data": extracted_data,
            "confidence": round(confidence, 2),
            "raw_text": raw_text[:500]  # Truncate for response
        }
    
    def _perform_ocr(self, image_bytes: bytes) -> str:
        """Perform OCR on image"""
        if TESSERACT_AVAILABLE:
            try:
                image = Image.open(BytesIO(image_bytes))
                
                # Preprocess for better OCR
                # Convert to grayscale
                if image.mode != 'L':
                    image = image.convert('L')
                
                # Perform OCR
                text = pytesseract.image_to_string(image, lang='eng')
                return text
            except Exception as e:
                logger.error(f"OCR failed: {e}")
                return ""
        else:
            # Mock OCR for development
            return self._mock_ocr()
    
    def _mock_ocr(self) -> str:
        """Return mock OCR text for development"""
        return """
        INCOME TAX DEPARTMENT
        GOVT. OF INDIA
        
        Permanent Account Number
        ABCDE1234F
        
        Name
        JOHN DOE
        
        Father's Name
        JAMES DOE
        
        Date of Birth
        01/01/1990
        """
    
    def _parse_pan(self, text: str) -> Dict[str, Any]:
        """Parse PAN card data"""
        data = {
            "document_type": "PAN",
            "pan_number": None,
            "name": None,
            "father_name": None,
            "date_of_birth": None
        }
        
        # PAN number pattern: 5 letters + 4 digits + 1 letter
        pan_pattern = r'[A-Z]{5}[0-9]{4}[A-Z]'
        pan_match = re.search(pan_pattern, text.upper())
        if pan_match:
            data["pan_number"] = self.encrypt_data(pan_match.group())
        
        # Extract name (usually after "Name" label)
        name_pattern = r'(?:Name|NAME)\s*[:\n]\s*([A-Za-z\s]+)'
        name_match = re.search(name_pattern, text, re.IGNORECASE)
        if name_match:
            data["name"] = name_match.group(1).strip()
        
        # Extract father's name
        father_pattern = r"(?:Father|Father's Name)\s*[:\n]\s*([A-Za-z\s]+)"
        father_match = re.search(father_pattern, text, re.IGNORECASE)
        if father_match:
            data["father_name"] = father_match.group(1).strip()
        
        # Extract DOB
        dob_pattern = r'(\d{2}[/\-]\d{2}[/\-]\d{4})'
        dob_match = re.search(dob_pattern, text)
        if dob_match:
            data["date_of_birth"] = dob_match.group(1)
        
        return data
    
    def _parse_aadhaar(self, text: str) -> Dict[str, Any]:
        """Parse Aadhaar card data"""
        data = {
            "document_type": "Aadhaar",
            "aadhaar_number": None,
            "name": None,
            "date_of_birth": None,
            "gender": None,
            "address": None
        }
        
        # Aadhaar number pattern: 12 digits (may be in groups of 4)
        aadhaar_pattern = r'(\d{4}\s?\d{4}\s?\d{4})'
        aadhaar_match = re.search(aadhaar_pattern, text)
        if aadhaar_match:
            aadhaar_num = re.sub(r'\s', '', aadhaar_match.group(1))
            # Mask middle digits for privacy
            masked = f"{aadhaar_num[:4]}XXXX{aadhaar_num[-4:]}"
            data["aadhaar_number"] = self.encrypt_data(aadhaar_num)
        
        # Gender
        if re.search(r'\bMale\b', text, re.IGNORECASE):
            data["gender"] = "Male"
        elif re.search(r'\bFemale\b', text, re.IGNORECASE):
            data["gender"] = "Female"
        
        return data
    
    def _parse_gst(self, text: str) -> Dict[str, Any]:
        """Parse GST certificate data"""
        data = {
            "document_type": "GST",
            "gstin": None,
            "legal_name": None,
            "trade_name": None,
            "address": None,
            "state": None
        }
        
        # GSTIN pattern: 15 characters
        gstin_pattern = r'[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9][Z][A-Z0-9]'
        gstin_match = re.search(gstin_pattern, text.upper())
        if gstin_match:
            data["gstin"] = gstin_match.group()
        
        # Legal name
        legal_pattern = r'(?:Legal Name|Business Name)\s*[:\n]\s*([A-Za-z\s\.]+)'
        legal_match = re.search(legal_pattern, text, re.IGNORECASE)
        if legal_match:
            data["legal_name"] = legal_match.group(1).strip()
        
        return data
    
    def _parse_cin(self, text: str) -> Dict[str, Any]:
        """Parse Corporate Identification Number"""
        data = {
            "document_type": "CIN",
            "cin_number": None,
            "company_name": None,
            "registration_date": None
        }
        
        # CIN pattern: 21 characters
        cin_pattern = r'[LUu][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}'
        cin_match = re.search(cin_pattern, text.upper())
        if cin_match:
            data["cin_number"] = cin_match.group()
        
        return data
