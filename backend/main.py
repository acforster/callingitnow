    )


@app.delete("/predictions/{prediction_id}/back", status_code=status.HTTP_204_NO_CONTENT)
def unback_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unback a prediction."""
    # Find the backing
    backing = db.query(Backing).filter(
        Backing.prediction_id == prediction_id,
        Backing.backer_user_id == current_user.user_id
    ).first()

    if not backing:
        raise HTTPException(status_code=404, detail="Not backed")

    # Decrement wisdom level of prediction author, ensuring it doesn't go below 0
    if backing.prediction.user.wisdom_level > 0:
        backing.prediction.user.wisdom_level -= 1

    db.delete(backing)
    db.commit()
    return


@app.delete("/predictions/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a prediction. Only the author can delete their own prediction."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()

    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    if prediction.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this prediction")

    # Manually delete associated votes and backings due to lack of cascade
    db.query(Vote).filter(Vote.prediction_id == prediction_id).delete()
    db.query(Backing).filter(Backing.prediction_id == prediction_id).delete()

    db.delete(prediction)
    db.commit()
    return


@app.get("/predictions/{prediction_id}/receipt", response_model=PredictionReceipt)
def get_prediction_receipt(
    prediction_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get a prediction receipt."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Check visibility
    if prediction.visibility == Visibility.PRIVATE and (not current_user or current_user.user_id != prediction.user_id):
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    return PredictionReceipt(
        prediction_id=prediction.prediction_id,
        title=prediction.title,
        content=prediction.content,
        user_handle=prediction.user.handle,
        timestamp=prediction.timestamp,
        hash=prediction.hash,
        verification_url=f"https://callingitnow.com/predictions/{prediction_id}"
    )
