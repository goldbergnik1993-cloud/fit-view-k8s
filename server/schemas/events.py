from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, model_validator

from database.models.events import EventTypeEnum


class FitViewEventCreateSchema(BaseModel):
    item_id: int = Field(..., gt=0)
    event_type: EventTypeEnum
    height_used_cm: Optional[float] = Field(None, ge=140.0, le=220.0)

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def enforce_analytics_rules(self) -> "FitViewEventCreateSchema":
        if (
            self.event_type == EventTypeEnum.WIDGET_SHOWN
            and self.height_used_cm is not None
        ):
            self.height_used_cm = None

        if (
            self.event_type == EventTypeEnum.HEIGHT_ENTERED
            and self.height_used_cm is None
        ):
            raise ValueError("height_used_cm is required for the height_entered event.")

        return self
