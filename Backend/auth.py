"""Signup and login endpoints.

Location is required at signup (architecture spec, Section 6a) and is
stored directly on the user record — there is no separate "add your
location later" flow. Login itself only checks email + password; the
location permission gate is enforced client-side after login succeeds
(see frontend/LocationGate.jsx).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginRequest, SignupRequest, TokenResponse, UserResponse
from security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    point = from_shape(Point(payload.location.longitude, payload.location.latitude), srid=4326)

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        home_location=point,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(id=str(user.id), email=user.email, role=user.role.value)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)
