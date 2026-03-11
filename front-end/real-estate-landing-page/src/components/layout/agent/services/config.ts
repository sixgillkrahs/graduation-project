export const NoticeEndpoint = {
  getMyNotices: () => `/notices/me`,
  readNotice: (id: string) => `/notices/${id}/read`,
  markAllAsRead: () => `/notices/me/read-all`,
  deleteNotice: (id: string) => `/notices/${id}`,
  deleteAllNotices: () => `/notices/me/all`,
};

export const NoticeKey = {
  getMyNotices: "getMyNotices",
  readNotice: "readNotice",
  markAllAsRead: "markAllAsRead",
  deleteNotice: "deleteNotice",
  deleteAllNotices: "deleteAllNotices",
};
