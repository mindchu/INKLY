from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

def validate(data: dict, model_class: type[BaseModel]):
    """
    Validates dictionary data against a Pydantic model.
    Raises HTTPException 422 if validation fails.
    """
    try:
        return model_class(**data)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
