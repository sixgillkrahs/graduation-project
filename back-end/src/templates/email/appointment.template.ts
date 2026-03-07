export const getAppointmentConfirmedEmailTemplate = (
  name: string,
  date: string,
  time: string,
  location: string,
): string => {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #10b981; margin-bottom: 10px;">Lịch Hẹn Đã Được Xác Nhận! 🎉</h2>
    </div>
    <p>Chào <strong>${name}</strong>,</p>
    <p>Tuyệt vời! Yêu cầu đặt lịch hẹn xem bất động sản của bạn đã được đối tác của chúng tôi xác nhận thành công.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #374151;">Thông tin cuộc hẹn:</h3>
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 8px;">📅 <strong>Ngày:</strong> ${date}</li>
        <li style="margin-bottom: 8px;">⏰ <strong>Thời gian:</strong> ${time}</li>
        <li>📍 <strong>Địa điểm:</strong> ${location}</li>
      </ul>
    </div>

    <p style="margin-top: 20px;">Vui lòng có mặt đúng giờ để việc tham quan, trao đổi diễn ra thuận lợi nhất. Nếu bạn có thay đổi lịch trình đột xuất, vui lòng liên hệ lại để được hỗ trợ dời lịch.</p>
    
    <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280;">Trân trọng,<br><strong>Đội ngũ hỗ trợ</strong></p>
  </div>
  `;
};
