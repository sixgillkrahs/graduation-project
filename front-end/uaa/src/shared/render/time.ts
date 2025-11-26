function toVietnamTime(isoString: string) {
    const date = new Date(isoString);

    const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));

    const formatted = vietnamTime.toISOString()
        .replace('T', ' ')
        .replace(/\.\d{3}Z$/, '');

    return formatted;
}

export {
    toVietnamTime
}