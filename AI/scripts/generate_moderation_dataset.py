import argparse
import csv
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "moderation_synthetic_10k.csv"

LABELS = ["clean", "toxic", "hate", "sexual", "spam"]


def normalize_spaces(text: str) -> str:
    return " ".join(text.split())


def build_clean_templates():
    subjects_en = [
        "movie",
        "song",
        "message",
        "plan",
        "idea",
        "meeting",
        "lunch",
        "trip",
        "book",
        "class",
        "game",
        "photo",
        "project",
        "conversation",
        "schedule",
    ]
    subjects_vi = [
        "bộ phim",
        "bài hát",
        "tin nhắn",
        "kế hoạch",
        "ý tưởng",
        "cuộc họp",
        "bữa trưa",
        "chuyến đi",
        "cuốn sách",
        "buổi học",
        "trò chơi",
        "bức ảnh",
        "dự án",
        "cuộc trò chuyện",
        "lịch trình",
    ]
    actions_en = [
        "looks great",
        "needs more details",
        "works for me",
        "can be reviewed tomorrow",
        "fits my schedule",
        "sounds reasonable",
        "is useful for everyone",
        "should be discussed later",
        "makes a lot of sense",
        "is actually pretty good",
        "feels a bit confusing",
        "is ready to share",
    ]
    actions_vi = [
        "trông rất ổn",
        "cần thêm chi tiết",
        "phù hợp với tôi",
        "có thể xem lại vào ngày mai",
        "hợp với lịch của tôi",
        "nghe khá hợp lý",
        "hữu ích cho mọi người",
        "nên bàn thêm sau",
        "rất có lý",
        "thật ra khá tốt",
        "hơi khó hiểu",
        "đã sẵn sàng để chia sẻ",
    ]

    templates = []
    for subject in subjects_en:
        for action in actions_en:
            templates.append((f"the {subject} {action}", "clean"))
            templates.append((f"please check whether the {subject} {action}", "clean"))
            templates.append((f"i think this {subject} {action}", "clean"))
            templates.append((f"can we confirm the {subject} {action}", "clean"))
            templates.append((f"my {subject} {action}", "clean"))

    for subject in subjects_vi:
        for action in actions_vi:
            templates.append((f"{subject} này {action}", "clean"))
            templates.append((f"vui lòng kiểm tra xem {subject} này {action}", "clean"))
            templates.append((f"tôi nghĩ {subject} này {action}", "clean"))
            templates.append((f"mình muốn xác nhận {subject} này {action}", "clean"))
            templates.append((f"{subject} của mình {action}", "clean"))

    generic_clean = [
        ("hello, how is your day going", "clean"),
        ("good morning everyone", "clean"),
        ("thank you so much for helping me", "clean"),
        ("please call me when you are free", "clean"),
        ("can we meet later this afternoon", "clean"),
        ("i will send the file tonight", "clean"),
        ("that sounds good to me", "clean"),
        ("i agree with your idea", "clean"),
        ("let us talk after lunch", "clean"),
        ("see you tomorrow", "clean"),
        ("xin chào, hôm nay bạn thế nào", "clean"),
        ("cảm ơn bạn đã giúp mình", "clean"),
        ("khi nào rảnh thì gọi cho mình nhé", "clean"),
        ("chiều nay mình gặp nhau được không", "clean"),
        ("tối nay mình sẽ gửi file", "clean"),
        ("nghe ổn đó", "clean"),
        ("mình đồng ý với ý kiến này", "clean"),
        ("ăn trưa xong mình nói chuyện tiếp nhé", "clean"),
        ("hẹn mai gặp", "clean"),
        ("chúc bạn ngủ ngon", "clean"),
        ("em iu của anh ơi", "clean"),
        ("anh nhớ em nhiều lắm", "clean"),
        ("bé ơi hôm nay em ăn gì chưa", "clean"),
        ("thương em nhiều lắm", "clean"),
        ("em là cô gái dễ thương nhất", "clean"),
        ("anh yêu em", "clean"),
        ("yêu em nhiều", "clean"),
        ("nhớ em quá đi", "clean"),
        ("cục cưng ơi", "clean"),
        ("vợ ơi anh về rồi", "clean"),
        ("chồng ơi ngủ ngon nha", "clean"),
        ("em ngoan quá", "clean"),
        ("i miss you so much baby", "clean"),
        ("love you babe", "clean"),
        ("good night my love", "clean"),
        ("you are so adorable", "clean"),
        ("sweet dreams honey", "clean"),
        ("my dear, take care", "clean"),
        ("you are the cutest", "clean"),
        ("i adore you", "clean"),
    ]
    templates.extend(generic_clean)

    affection_prefixes_vi = [
        "em iu của anh ơi",
        "bé ơi",
        "cục cưng ơi",
        "anh yêu em",
        "em yêu à",
        "vợ ơi",
        "chồng ơi",
        "người đẹp ơi",
    ]
    affection_suffixes_vi = [
        "ngủ ngon nhé",
        "ăn cơm chưa",
        "hôm nay vui không",
        "anh nhớ em nhiều lắm",
        "yêu em nhiều",
        "nhớ giữ sức khỏe nha",
        "mai gặp nhé",
        "đừng thức khuya nhé",
    ]
    affection_prefixes_en = [
        "my love",
        "baby",
        "sweetheart",
        "honey",
        "darling",
        "babe",
    ]
    affection_suffixes_en = [
        "did you eat yet",
        "sleep well tonight",
        "i miss you so much",
        "take care please",
        "you are so cute",
        "see you tomorrow",
        "do not stay up late",
        "how was your day",
    ]

    for prefix in affection_prefixes_vi:
        for suffix in affection_suffixes_vi:
            templates.append((f"{prefix} {suffix}", "clean"))

    for prefix in affection_prefixes_en:
        for suffix in affection_suffixes_en:
            templates.append((f"{prefix}, {suffix}", "clean"))

    return templates


def build_toxic_templates():
    insults_en = [
        "idiot",
        "moron",
        "loser",
        "trash",
        "clown",
        "piece of garbage",
        "worthless fool",
        "stupid kid",
        "pathetic clown",
        "dumb scammer",
    ]
    insults_vi = [
        "đồ ngu",
        "thằng khốn",
        "đồ rác rưởi",
        "đồ óc chó",
        "đồ điên",
        "đồ mất dạy",
        "thứ vô dụng",
        "đồ súc sinh",
        "thằng lừa đảo",
        "con mẹ mày",
    ]
    prefixes_en = [
        "you are",
        "shut up",
        "go away",
        "nobody likes you,",
        "everyone knows you are",
        "what a",
        "seriously, you are a",
    ]
    prefixes_vi = [
        "mày là",
        "cút đi",
        "im mồm đi",
        "ai cũng biết mày là",
        "đúng là",
        "thứ",
        "vcl đúng là",
        "dm mày",
        "đ!t mẹ",
    ]

    rows = []
    for prefix in prefixes_en:
        for insult in insults_en:
            rows.append((normalize_spaces(f"{prefix} {insult}"), "toxic"))
    for prefix in prefixes_vi:
        for insult in insults_vi:
            rows.append((normalize_spaces(f"{prefix} {insult}"), "toxic"))
    return rows


def build_hate_templates():
    groups_en = [
        "immigrants",
        "gay people",
        "women",
        "men from that country",
        "muslims",
        "asians",
        "black people",
        "old people",
        "disabled people",
        "poor people",
    ]
    groups_vi = [
        "bọn nhập cư",
        "đám đồng tính",
        "phụ nữ",
        "đàn ông nước đó",
        "người hồi giáo",
        "người châu á",
        "người da đen",
        "người già",
        "người khuyết tật",
        "người nghèo",
    ]
    phrases_en = [
        "are disgusting",
        "are animals",
        "should disappear",
        "are the problem",
        "are inferior",
        "do not deserve respect",
    ]
    phrases_vi = [
        "thật ghê tởm",
        "chỉ là súc vật",
        "nên biến hết đi",
        "là vấn đề của xã hội",
        "thấp kém",
        "không đáng được tôn trọng",
    ]

    rows = []
    for group in groups_en:
        for phrase in phrases_en:
            rows.append((f"all {group} {phrase}", "hate"))
            rows.append((f"{group.capitalize()} {phrase}", "hate"))
    for group in groups_vi:
        for phrase in phrases_vi:
            rows.append((f"{group} {phrase}", "hate"))
            rows.append((f"tôi ghét {group} vì {phrase}", "hate"))
    return rows


def build_sexual_templates():
    phrases_en = [
        "send nudes now",
        "show me your naked body",
        "i want sex with you",
        "you look so sexy",
        "let me see your boobs",
        "do you want to have sex tonight",
        "send me hot photos",
        "i want to touch your body",
    ]
    phrases_vi = [
        "gửi ảnh nude đi",
        "cho xem ảnh khỏa thân đi",
        "muốn địt nhau không",
        "cơ thể em ngon quá",
        "cho xem ngực đi",
        "tối nay chat sex nhé",
        "gửi ảnh nóng đi",
        "tôi muốn sờ cơ thể em",
    ]
    mixed = [
        "con cặc",
        "lồn mẹ",
        "địt mẹ",
        "f*ck me now",
        "naked sexvideo tonight",
    ]

    rows = [(text, "sexual") for text in phrases_en]
    rows += [(text, "sexual") for text in phrases_vi]
    rows += [(text, "sexual|toxic") for text in mixed[:3]]
    rows += [(text, "sexual") for text in mixed[3:]]
    return rows


def build_spam_templates():
    phrases_en = [
        "join my telegram for guaranteed profit",
        "earn 5000 dollars per day with this trick",
        "click this link to win a free iphone",
        "cheap casino bonus register today",
        "buy followers fast instant delivery",
        "crypto signal guaranteed win",
        "limited offer buy now buy now",
        "free money click here now",
    ]
    phrases_vi = [
        "tham gia telegram để nhận kèo chắc thắng",
        "kiếm tiền online không cần vốn inbox ngay",
        "bấm vào link này để nhận quà",
        "nhận thưởng casino ngay hôm nay",
        "dịch vụ tăng follow siêu rẻ",
        "kèo coin đảm bảo thắng",
        "ưu đãi giới hạn mua ngay",
        "nhấp vào đây để nhận tiền miễn phí",
    ]
    mixed = [
        "watch porn for free click now",
        "porn miễn phí click ngay",
        "hot sexvideo free register now",
        "chat sex ngay tối nay inbox telegram",
    ]

    rows = [(text, "spam") for text in phrases_en]
    rows += [(text, "spam") for text in phrases_vi]
    rows += [(text, "sexual|spam") for text in mixed]
    return rows


def build_contextual_variations(seed_rows):
    prefixes = [
        "please note:",
        "urgent:",
        "new message:",
        "reported content:",
        "customer said:",
        "hệ thống ghi nhận:",
        "tin nhắn vừa nhận:",
        "moderation sample:",
        "",
    ]
    suffixes = [
        "",
        "right now",
        "today",
        "in chat",
        "in the comment section",
        "during the conversation",
        "trong đoạn chat",
        "trong phần bình luận",
        "ngay bây giờ",
    ]
    wrappers = [
        "{prefix} {text} {suffix}",
        "\"{text}\"",
        "{prefix} \"{text}\"",
        "{text}.",
        "{text} !!!",
        "{text} ???",
    ]

    rows = []
    for text, labels in seed_rows:
        for wrapper in wrappers:
            prefix = random.choice(prefixes)
            suffix = random.choice(suffixes)
            candidate = wrapper.format(prefix=prefix, text=text, suffix=suffix)
            rows.append((normalize_spaces(candidate), labels))
    return rows


def sample_rows(pool, count):
    if count <= len(pool):
        return random.sample(pool, count)
    rows = []
    while len(rows) < count:
        rows.extend(random.sample(pool, min(len(pool), count - len(rows))))
    return rows[:count]


def generate_dataset(size: int, seed: int):
    random.seed(seed)

    base_rows = (
        build_clean_templates()
        + build_toxic_templates()
        + build_hate_templates()
        + build_sexual_templates()
        + build_spam_templates()
    )
    expanded_rows = build_contextual_variations(base_rows)

    pools = {
        "clean": [row for row in expanded_rows if row[1] == "clean"],
        "toxic": [row for row in expanded_rows if row[1] == "toxic"],
        "hate": [row for row in expanded_rows if row[1] == "hate"],
        "sexual": [row for row in expanded_rows if row[1] == "sexual"],
        "spam": [row for row in expanded_rows if row[1] == "spam"],
        "sexual|toxic": [row for row in expanded_rows if row[1] == "sexual|toxic"],
        "sexual|spam": [row for row in expanded_rows if row[1] == "sexual|spam"],
    }

    targets = {
        "clean": int(size * 0.35),
        "toxic": int(size * 0.23),
        "hate": int(size * 0.12),
        "sexual": int(size * 0.12),
        "spam": int(size * 0.12),
        "sexual|toxic": int(size * 0.03),
        "sexual|spam": size
        - (
            int(size * 0.35)
            + int(size * 0.23)
            + int(size * 0.12)
            + int(size * 0.12)
            + int(size * 0.12)
            + int(size * 0.03)
        ),
    }

    rows = []
    for label, target_count in targets.items():
        rows.extend(sample_rows(pools[label], target_count))

    random.shuffle(rows)
    return rows


def write_dataset(rows, output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["text", "labels"])
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(
        description="Generate a synthetic bilingual moderation dataset."
    )
    parser.add_argument("--size", type=int, default=10000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    output_path = Path(args.output).resolve()
    rows = generate_dataset(args.size, args.seed)
    write_dataset(rows, output_path)
    print(f"Generated {len(rows)} rows at {output_path}")


if __name__ == "__main__":
    main()
