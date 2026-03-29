# UAA Admin Portal

## Docker

Chạy từ thư mục `front-end/uaa`:

```bash
docker compose up -d --build
```

App sẽ chạy tại `http://localhost:5173` theo mặc định.

Tùy chọn:

```bash
# đổi cổng publish ra máy host
$env:UAA_PORT=8088
docker compose up -d --build

# build staging thay vì production
$env:UAA_BUILD_SCRIPT="build:stag"
docker compose up -d --build
```

Dừng container:

```bash
docker compose down
```
