"""Shared validators for phone numbers, addresses, prices."""
import re

from django.core.exceptions import ValidationError


def validate_vietnamese_phone(value: str) -> str:
    """Kiểm tra định dạng số điện thoại Việt Nam."""
    if not value:
        return value
    pattern = r"^(0|\+84)[3|5|7|8|9][0-9]{8}$"
    if not re.match(pattern, value.replace(" ", "")):
        raise ValidationError(
            "Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx"
        )
    return value


def validate_positive_price(value) -> None:
    """Kiểm tra giá phải lớn hơn 0."""
    if value <= 0:
        raise ValidationError("Giá phải lớn hơn 0")
