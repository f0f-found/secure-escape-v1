SELECT
    u.FullName,
    u.Email,
    ac.*
FROM secureescape.authcredentials ac
JOIN secureescape.users u ON ac.UserId = u.Id;