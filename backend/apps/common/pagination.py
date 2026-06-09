"""Standard pagination class for all API endpoints."""
from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Phân trang chuẩn: 20 mục mỗi trang, tối đa 100."""

    page_size = 20
    page_size_query_param = "per_page"
    max_page_size = 100
