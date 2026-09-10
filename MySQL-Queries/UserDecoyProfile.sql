SELECT
    u.FullName,
    u.Email,
    dp.*
FROM secureescape.decoyprofiles dp
JOIN secureescape.users u ON dp.UserId = u.Id;