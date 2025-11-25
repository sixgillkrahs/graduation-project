export const AxiosMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH", // Cập nhật một phần của tài nguyên
  HEAD: "HEAD", // Lấy thông tin về tài nguyên mà không trả về response
  OPTIONS: "OPTIONS", // Lấy thông tin về các phương thức HTTP mà server hỗ trợ
  TRACE: "TRACE", // Gửi request đến server và trả về response mà không thay đổi
  CONNECT: "CONNECT", // Tạo một kết nối đến server thông qua protocol được chỉ định
};
