export const getDealClosedEmailTemplate = (
  customerName: string,
  propertyName: string,
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Congratulations on your new property!</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px; }
    .logo { color: #2563eb; font-size: 24px; font-weight: bold; text-decoration: none; }
    .content { padding: 0 20px; }
    h1 { color: #1e40af; font-size: 24px; margin-bottom: 20px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0; color: #6b7280; font-size: 14px; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { background-color: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">EstateX</div>
  </div>
  
  <div class="content">
    <h1>Xin chúc mừng giao dịch thành công! 🎉</h1>
    
    <p>Kính gửi anh/chị <strong>${customerName}</strong>,</p>
    
    <p>Thay mặt EstateX và đội ngũ môi giới, chúng tôi xin gửi lời chúc mừng chân thành nhất đến anh/chị đã chốt giao dịch thành công bất động sản: <strong>${propertyName}</strong>.</p>
    
    <p>Đây là một cột mốc quan trọng và chúng tôi rất vinh dự khi được đồng hành cùng anh/chị trong quá trình tìm kiếm và sở hữu bất động sản này.</p>
    
    <p>Chuyên viên tư vấn của chúng tôi sẽ sớm liên hệ lại với anh/chị để hỗ trợ các bước tiếp theo về thủ tục pháp lý, hợp đồng và bàn giao.</p>

    <p>Kính chúc anh/chị thật nhiều sức khỏe, may mắn và thịnh vượng cùng với tài sản mới của mình!</p>
    
    <p>Trân trọng,<br>Đội ngũ EstateX</p>
  </div>
  
  <div class="footer">
    <p>EstateX - Nền tảng Bất động sản Công nghệ</p>
  </div>
</body>
</html>
  `;
};
