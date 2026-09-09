USE secureescape;

INSERT INTO `Users` (`Id`, `BankIntegrationId`, `BankCustomerId`, `FullName`, `Email`, `PhoneNumber`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
('7d6d4845-658f-4e98-b106-61797a4ec0e8', 'a1000000-0000-0000-0000-000000000001', 'ZBA-CUST-0004', 'Bongani Mahlangu', 'bongani.mahlangu@email.co.za', '0721112233', 'Active', UTC_TIMESTAMP(), NULL),
('9201d38d-9443-4fc5-9831-29cb7b106a24', 'a1000000-0000-0000-0000-000000000001', 'ZBA-CUST-0005', 'Precious Ndlovu', 'precious.ndlovu@email.co.za', '0832223344', 'Active', UTC_TIMESTAMP(), NULL),
('9f9f7408-edd1-492c-9d60-aa0b93a25020', 'a1000000-0000-0000-0000-000000000001', 'ZBA-CUST-0006', 'Tshepo Radebe', 'tshepo.radebe@email.co.za', '0613334455', 'Active', UTC_TIMESTAMP(), NULL),
('42bcc936-2760-41cd-afaf-8d2d44b33763', 'a1000000-0000-0000-0000-000000000001', 'ZBA-CUST-0007', 'Nomvula Mabaso', 'nomvula.mabaso@email.co.za', '0724445566', 'Active', UTC_TIMESTAMP(), NULL),
('ace60c5f-41a8-415c-a625-522bdd1551be', 'a1000000-0000-0000-0000-000000000001', 'ZBA-CUST-0008', 'Sibusiso Khoza', 'sibusiso.khoza@email.co.za', '0835556677', 'Active', UTC_TIMESTAMP(), NULL),
('94cc6c18-e5ff-4fe3-8eaf-cdf6722ffd7f', 'a2000000-0000-0000-0000-000000000002', 'SVB-CUST-0003', 'Palesa Motaung', 'palesa.motaung@email.co.za', '0616667788', 'Active', UTC_TIMESTAMP(), NULL),
('58e217d5-d691-4a3a-8535-db0bca556ced', 'a2000000-0000-0000-0000-000000000002', 'SVB-CUST-0004', 'Themba Mnisi', 'themba.mnisi@email.co.za', '0727778899', 'Active', UTC_TIMESTAMP(), NULL),
('afd6255f-4b3d-4a11-844e-2f26e560f697', 'a2000000-0000-0000-0000-000000000002', 'SVB-CUST-0005', 'Ayanda Cele', 'ayanda.cele@email.co.za', '0838889900', 'Active', UTC_TIMESTAMP(), NULL),
('8ed6d87b-6f22-4362-8f0f-40629a98fb6d', 'a2000000-0000-0000-0000-000000000002', 'SVB-CUST-0006', 'Refilwe Sithole', 'refilwe.sithole@email.co.za', '0619990011', 'Active', UTC_TIMESTAMP(), NULL),
('545b32a9-1613-429f-8285-48440b2fcdfe', 'a2000000-0000-0000-0000-000000000002', 'SVB-CUST-0007', 'Mpho Baloyi', 'mpho.baloyi@email.co.za', '0720001122', 'Active', UTC_TIMESTAMP(), NULL);

INSERT INTO `AuthCredentials` (`Id`, `UserId`, `PasswordHash`, `NormalPinHash`, `DuressPinHash`, `CreatedAt`) VALUES
('fb942ad8-0546-4327-a360-a56a8028dd6a', '7d6d4845-658f-4e98-b106-61797a4ec0e8', '$2b$10$cnFYSgrfvBMBzvuTFRzPPu.T9n0/OdXA4noRPbDQm73VkG740WNlO', '$2b$10$w.Icfiz/RQ8e9wslyo/aOeo.tR0cw2Os5lk.LrdmOiQed8i3uf97K', '$2b$10$ePNNmA9VBYwS.V.F4xSnD.3FgQoVh6U7A9gmcLRqCYn51VIpy7.Ky', UTC_TIMESTAMP()),
('4d45d73d-fe3c-4d06-aba2-a96d46661f55', '9201d38d-9443-4fc5-9831-29cb7b106a24', '$2b$10$izelR.xDzCDncWAiaUnVM.sXac8DdaOs1nSu/dxS99QYEa3xaqECS', '$2b$10$XtEYSkz2Mci3WvY1zxPPneYVl469IreCZDkg5xmELzTWFPvvpJslq', '$2b$10$mdnwLX0rDVIS9yt7rxzmw.z5q4.xkkq64yyLJ1Lx27nXm9ZyMwFyC', UTC_TIMESTAMP()),
('0277c72a-0ecc-4fba-9d4e-04f57fa8fdd7', '9f9f7408-edd1-492c-9d60-aa0b93a25020', '$2b$10$n97YY8huzVyxyKKf35xm7.O1bi.kfqywgEXUL6KPNGo7E92dRJ3li', '$2b$10$mhgDqgDmasRiUJp6j7ViAOysxw1ZeLgyqU4PXT9zCn3XoR7dEvVWy', '$2b$10$qv8vOLbwKMvk.WGxJCx0meFY8V.R9TGIp14lYBD7tH1HunuDHx3C6', UTC_TIMESTAMP()),
('5d4ed9b2-a547-494f-b148-abe5ab178771', '42bcc936-2760-41cd-afaf-8d2d44b33763', '$2b$10$LcAKfXhj5CDhoee4JRK4sOM7BWCPI2UBUHdegzAUyAGF5yzXGQ3D.', '$2b$10$FdfbAvDPCQCz6SvSM4SaxeeXuUzraG7dFYgMdLzv4Ndkt/0o8KJGm', '$2b$10$h1wJ8BFTgAHDoH3Hm5JF0uFPc64JtQr142e6ojPXvB6ve7KyG5Oc2', UTC_TIMESTAMP()),
('093a352b-a924-4d4c-8e83-b01673c7796c', 'ace60c5f-41a8-415c-a625-522bdd1551be', '$2b$10$O2DX.UM0Dh7zDNXohAPsjuNUit5LpZKcKowqXXbLRbNNfbEwXRHlq', '$2b$10$GQ6WPmYqH2Rn1i1mFTXRJuL.x5Fd.JRzO20Qkut7zeSrKkb8ncIJC', '$2b$10$WO3kyHDLhESySSbUR529xuCi7qDZUfaw.3HTYWhMKmw.INkKucFqm', UTC_TIMESTAMP()),
('5c8120db-8ffe-4bbf-8f86-26c5b69ccdb5', '94cc6c18-e5ff-4fe3-8eaf-cdf6722ffd7f', '$2b$10$ApX7yBvdjxjCca9RDrlevuVsmC2Qw.eNgliY1vNf9S23/EL5pXkwq', '$2b$10$1Wl//7NfS1b8IFNkzN6P8OZDVF8s2EdwD9cVv60rg/0CwgNnEhnwO', '$2b$10$yAnW1IlqfjxqJKKEI7MgH.7teHEg.eASul6J02c8oixRncisuS/P2', UTC_TIMESTAMP()),
('c7a0de16-81e2-440f-aba9-549b4411763c', '58e217d5-d691-4a3a-8535-db0bca556ced', '$2b$10$XbZas1EqWdmb8U6Df.eZZu7WANL0k8Nlj88TYg661IHbKbH4UDmIG', '$2b$10$xuqTkA6rmfHHZ2sPWWINlufYFQaOzdCccuBKvJlypOWjvWuZxx6jC', '$2b$10$/DzF/H.Mz2vz1A9ybl.iuOzK3i8CKqtYvPF5ekB89/SUoz4D2BxkO', UTC_TIMESTAMP()),
('0571d509-7f58-4e86-8d0e-1a21cbd0e02d', 'afd6255f-4b3d-4a11-844e-2f26e560f697', '$2b$10$qu7XYRKi64io7pPpgnyBteyB6Ni79uQTQznJNWSZ76P8gzifZvEQi', '$2b$10$jr6XxPT399a0.iFAfT.JbOKKF22Wu9UuIYAMsjLg6QNPe5iWL.65y', '$2b$10$iWz9NIlShUvYTWA9gSi3xe/LtQdI4a6ekOtNIVBRXIP/DHvDgQ2iq', UTC_TIMESTAMP()),
('eedbb9e6-23ec-4644-bb67-c215e5c19760', '8ed6d87b-6f22-4362-8f0f-40629a98fb6d', '$2b$10$P3p/.LIkXqDcQCnMGD.NOuA.olKdHWbm..SiGqX3F.1fTaZXGKPmG', '$2b$10$E621IWi.HmVPCCQcbI.WPuDcZrov0ZQelxEwy4lrfMxb6fCswI0Y6', '$2b$10$oxiZ06n.1sUlz7laS1wTA.4SURhyBBOtyH06K.DQN6zK8RR0YeWMW', UTC_TIMESTAMP()),
('bf5d84cb-d15a-449c-b330-313dacdbbd61', '545b32a9-1613-429f-8285-48440b2fcdfe', '$2b$10$XgdvW1J8Uu/89BHSR/8TCunWS7GwXbuRJ2iCj.YQy3S1jn7qCJAOm', '$2b$10$oEnW.fBR1ob8qqT8mraet.DjYbuCW4Vf0LGgqzymotSXCIy7hsjwW', '$2b$10$CpYmxS41joQMQjO1rukU5Oj1tRmlcx8YiPL9RiNnV585h7NI84UCu', UTC_TIMESTAMP());

INSERT INTO `BankAccounts` (`Id`, `UserId`, `AccountNumber`, `AccountName`, `AccountType`, `AvailableBalance`, `CurrentBalance`, `Currency`, `Status`, `CreatedAt`) VALUES
('820b7d96-0139-4afa-9407-062554d7d90d', '7d6d4845-658f-4e98-b106-61797a4ec0e8', '4000110011', 'Bongani Mahlangu Savings', 'Savings', 6234.56, 6234.56, 'ZAR', 'Active', UTC_TIMESTAMP()),
('dc6874a8-76a1-40f2-bdaf-ac182d0c4ac7', '9201d38d-9443-4fc5-9831-29cb7b106a24', '4000120012', 'Precious Ndlovu Savings', 'Savings', 7469.12, 7469.12, 'ZAR', 'Active', UTC_TIMESTAMP()),
('0d51bae6-531b-48f7-ad83-cdee65f184ac', '9f9f7408-edd1-492c-9d60-aa0b93a25020', '4000130013', 'Tshepo Radebe Savings', 'Savings', 8703.68, 8703.68, 'ZAR', 'Active', UTC_TIMESTAMP()),
('f6883c8c-420d-43c6-83a9-9ea9c7b6e601', '42bcc936-2760-41cd-afaf-8d2d44b33763', '4000140014', 'Nomvula Mabaso Savings', 'Savings', 9938.24, 9938.24, 'ZAR', 'Active', UTC_TIMESTAMP()),
('d22acda6-313b-44cf-bf58-9196a32c75a8', 'ace60c5f-41a8-415c-a625-522bdd1551be', '4000150015', 'Sibusiso Khoza Savings', 'Savings', 11172.80, 11172.80, 'ZAR', 'Active', UTC_TIMESTAMP()),
('6c411686-f4d8-4e20-bc95-90334133b38a', '94cc6c18-e5ff-4fe3-8eaf-cdf6722ffd7f', '4000160016', 'Palesa Motaung Savings', 'Savings', 12407.36, 12407.36, 'ZAR', 'Active', UTC_TIMESTAMP()),
('ca2adb0f-e46d-42bf-ab7f-e7c3ec4f6605', '58e217d5-d691-4a3a-8535-db0bca556ced', '4000170017', 'Themba Mnisi Savings', 'Savings', 13641.92, 13641.92, 'ZAR', 'Active', UTC_TIMESTAMP()),
('715cec5f-70f4-4895-ab88-12dea39615f4', 'afd6255f-4b3d-4a11-844e-2f26e560f697', '4000180018', 'Ayanda Cele Savings', 'Savings', 14876.48, 14876.48, 'ZAR', 'Active', UTC_TIMESTAMP()),
('12e0feef-a632-44ba-b446-fc02482be194', '8ed6d87b-6f22-4362-8f0f-40629a98fb6d', '4000190019', 'Refilwe Sithole Savings', 'Savings', 16111.04, 16111.04, 'ZAR', 'Active', UTC_TIMESTAMP()),
('dd4cc2ec-5401-43fb-853a-9489851bc275', '545b32a9-1613-429f-8285-48440b2fcdfe', '4000200020', 'Mpho Baloyi Savings', 'Savings', 17345.60, 17345.60, 'ZAR', 'Active', UTC_TIMESTAMP());