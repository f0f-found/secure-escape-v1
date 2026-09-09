SELECT
    u.FullName,
    u.Email,
    us.*
FROM secureescape.usersessions us
JOIN secureescape.users u ON us.UserId = u.Id;