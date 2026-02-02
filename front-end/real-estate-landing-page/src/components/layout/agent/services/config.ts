export const NoticeEndpoint = {
  getMyNotices: () => `/notices/me`,
  readNotice: (id: string) => `/notices/${id}/read`,
  deleteNotice: (id: string) => `/notices/${id}`,
  deleteAllNotices: () => `/notices/me/all`,
};

export const NoticeKey = {
  getMyNotices: "getMyNotices",
  readNotice: "readNotice",
  deleteNotice: "deleteNotice",
  deleteAllNotices: "deleteAllNotices",
};
