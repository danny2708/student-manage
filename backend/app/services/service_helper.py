from datetime import datetime, date

def parse_date_safe(d):
    """Chuyển đổi giá trị ngày từ Excel sang date object."""
    if not d:
        return None

    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, date):
        return d

    # Nếu là số serial ngày của Excel
    if isinstance(d, (int, float)):
        try:
            return datetime.fromordinal(datetime(1900, 1, 1).toordinal() + int(d) - 2).date()
        except Exception:
            return None

    # Nếu là string
    if isinstance(d, str):
        d = d.strip()
        # Thử parse dạng ISO có time: "1969-09-06 00:00:00"
        try:
            return datetime.strptime(d, "%Y-%m-%d %H:%M:%S").date()
        except Exception:
            pass
        # Thử parse dạng ISO chỉ có ngày: "1969-09-06"
        try:
            return datetime.strptime(d, "%Y-%m-%d").date()
        except Exception:
            pass
        # Thử parse dạng Việt Nam: "14/03/2012"
        for fmt in ("%d/%m/%Y", "%d-%m-%Y"):
            try:
                return datetime.strptime(d, fmt).date()
            except Exception:
                continue

    return None
