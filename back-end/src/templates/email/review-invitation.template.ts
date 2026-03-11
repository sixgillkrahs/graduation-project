export const getReviewInvitationEmailTemplate = (
  customerName: string,
  agentName: string,
  propertyName: string,
  reviewUrl: string,
) => {
  return `
  <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
    <h2 style="margin-bottom: 16px;">Danh gia trai nghiem xem nha cung Havenly</h2>
    <p>Xin chao <strong>${customerName}</strong>,</p>
    <p>
      Havenly hy vong ban da co trai nghiem xem nha tuyet voi. Hay danh 1 phut
      danh gia su ho tro cua moi gioi <strong>${agentName}</strong> cho buoi xem nha tai
      <strong>${propertyName}</strong>.
    </p>
    <p style="margin: 24px 0;">
      <a
        href="${reviewUrl}"
        style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600;"
      >
        Danh gia ngay
      </a>
    </p>
    <p style="font-size: 14px; color: #6b7280;">
      Link nay chi dung duoc mot lan. Neu nut bam khong hoat dong, hay sao chep duong dan sau vao trinh duyet:
    </p>
    <p style="font-size: 14px; word-break: break-all; color: #2563eb;">
      ${reviewUrl}
    </p>
  </div>`;
};
