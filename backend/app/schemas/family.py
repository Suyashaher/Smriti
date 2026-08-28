from pydantic import BaseModel, Field
from typing import Optional, Literal

RelationshipCode = Literal[
    "MOTHER", "FATHER", "GRANDMOTHER", "GRANDFATHER",
    "BROTHER", "SISTER", "SON", "DAUGHTER",
    "GRANDSON", "GRANDDAUGHTER", "UNCLE", "AUNT",
    "COUSIN", "SPOUSE", "OTHER"
]

class FamilyMemberBase(BaseModel):
    name: str
    relation: RelationshipCode
    nickname: Optional[str] = None
    active: bool = True

class FamilyMemberCreate(FamilyMemberBase):
    patientId: str

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relation: Optional[RelationshipCode] = None
    nickname: Optional[str] = None
    active: Optional[bool] = None

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    patientId: str
    photoId: Optional[str] = None
    createdAt: str
    updatedAt: str
    synced: bool
