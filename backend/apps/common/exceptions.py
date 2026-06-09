"""Custom exception handler for DRF."""
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Định dạng lỗi theo chuẩn JvJ API."""
    response = exception_handler(exc, context)

    if response is None:
        return response

    formatted = {
        "error": {
            "code": response.status_code,
            "message": response.data.get("detail", "Đã xảy ra lỗi"),
            "details": response.data if "detail" not in response.data else None,
        }
    }
    response.data = formatted
    return response
