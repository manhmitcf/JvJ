"""Custom exception handler for DRF."""
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Định dạng lỗi theo chuẩn JvJ API."""
    response = exception_handler(exc, context)

    if response is None:
        return response

    # non_field_errors (e.g. serializer-level ValidationError) → show first message
    if "non_field_errors" in response.data:
        errors = response.data["non_field_errors"]
        message = errors[0] if errors else "Đã xảy ra lỗi"
        details = {"non_field_errors": errors}
    elif "detail" in response.data:
        message = response.data["detail"]
        details = None
    else:
        message = "Đã xảy ra lỗi"
        details = response.data

    formatted = {
        "error": {
            "code": response.status_code,
            "message": message,
            "details": details,
        }
    }
    response.data = formatted
    return response
