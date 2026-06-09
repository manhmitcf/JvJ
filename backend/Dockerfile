FROM python:3.12-slim

# Ngăn Python tạo .pyc files và đảm bảo output không buffer
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy requirements trước để tận dụng Docker layer cache
COPY requirements.txt /app/

# Cài đặt dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . /app/

# Tạo thư mục media với permissions
RUN mkdir -p /app/media/uploads && \
    chmod -R 755 /app/media

# Copy và set execute permission cho entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Tạo non-root user và chuyển ownership
RUN useradd -m -u 1000 jvjuser && \
    chown -R jvjuser:jvjuser /app && \
    chown -R jvjuser:jvjuser /app/media

# Expose port (optional, for documentation)
EXPOSE 8000

# Chuyển sang non-root user (security best practice)
USER jvjuser

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
