SELECT
    u.FullName,
    u.Email,
    t.*
FROM secureescape.banktransactions t
JOIN secureescape.users u ON t.UserId = u.Id;