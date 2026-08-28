from fastapi import Header, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from app.database import get_db
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_caregiver_id(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        caregiver_id: str = payload.get("sub")
        if caregiver_id is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    return caregiver_id

def verify_caregiver_access(patientId: str, caregiver_id: str = Depends(get_caregiver_id), db = Depends(get_db)):
    mapping = db.patient_caregiver.find_one({
        "patientId": patientId,
        "caregiverId": caregiver_id
    })
    if not mapping:
        raise HTTPException(status_code=403, detail="Caregiver not authorized for this patient")
    return caregiver_id
