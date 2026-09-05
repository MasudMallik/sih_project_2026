oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)

        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )

        email = payload.get("email")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = collection.find_one(
            {"email": email},
            {"password": 0}
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


@app.get("/dashboard")
def dashboard(current_user=Depends(get_current_user)):

    return {
        "success": True,
        "message": "Dashboard data fetched successfully",
        "user": {
            "full_name": current_user.get("full_name"),
            "email": current_user.get("email"),
            "contact": current_user.get("contact"),
            "location": current_user.get("location")
        }
    }
