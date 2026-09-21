using SecureEscape.Api.Enums;
using SecureEscape.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace SecureEscape.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (string.Equals(
                    Environment.GetEnvironmentVariable("SECURE_ESCAPE_RESET_TEST_USERS"),
                    "true",
                    StringComparison.OrdinalIgnoreCase))
            {
                await ResetAdditionalTestUserProfilesAsync(context);
            }

            if (await context.BankIntegrations.AnyAsync())
            {
                await SeedAdditionalTestUsersAsync(context);
                await SeedBeneficiariesAsync(context);
                return;
            }

            // ── BANK INTEGRATIONS ──────────────────────────────────────────
            var zenithBank = new BankIntegration
            {
                Id = Guid.Parse("a1000000-0000-0000-0000-000000000001"),
                BankName = "Zenith Bank Africa",
                BankCode = "ZBA001",
                Status = BankIntegrationStatus.Active,
                WebhookUrl = "https://webhooks.zenithbankafrica.co.za/secure-escape",
                CreatedAt = DateTime.UtcNow
            };

            var savannaBank = new BankIntegration
            {
                Id = Guid.Parse("a2000000-0000-0000-0000-000000000002"),
                BankName = "Savanna Bank",
                BankCode = "SVB001",
                Status = BankIntegrationStatus.Active,
                WebhookUrl = "https://webhooks.savannabank.co.za/secure-escape",
                CreatedAt = DateTime.UtcNow
            };

            await context.BankIntegrations.AddRangeAsync(zenithBank, savannaBank);

            // ── API CLIENTS ────────────────────────────────────────────────
            var zenithApiClient = new ApiClient
            {
                Id = Guid.Parse("b1000000-0000-0000-0000-000000000001"),
                BankIntegrationId = zenithBank.Id,
                ClientId = "zenith-mobile-app",
                ClientSecretHash = "zenith-secret-plain-text",
                Scopes = "banking:read banking:write escape:trigger",
                Status = ApiClientStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var savannaApiClient = new ApiClient
            {
                Id = Guid.Parse("b2000000-0000-0000-0000-000000000002"),
                BankIntegrationId = savannaBank.Id,
                ClientId = "savanna-mobile-app",
                ClientSecretHash = "savanna-secret-plain-text",
                Scopes = "banking:read banking:write escape:trigger",
                Status = ApiClientStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            await context.ApiClients.AddRangeAsync(zenithApiClient, savannaApiClient);

            // ── USERS ──────────────────────────────────────────────────────
            var user1 = new User
            {
                Id = Guid.Parse("c1000000-0000-0000-0000-000000000001"),
                BankIntegrationId = zenithBank.Id,
                BankCustomerId = "ZBA-CUST-0001",
                FullName = "Thabo Nkosi",
                Email = "thabo.nkosi@email.co.za",
                PhoneNumber = "0821234567",
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var user2 = new User
            {
                Id = Guid.Parse("c2000000-0000-0000-0000-000000000002"),
                BankIntegrationId = zenithBank.Id,
                BankCustomerId = "ZBA-CUST-0002",
                FullName = "Amara Dlamini",
                Email = "amara.dlamini@email.co.za",
                PhoneNumber = "0837654321",
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var user3 = new User
            {
                Id = Guid.Parse("c3000000-0000-0000-0000-000000000003"),
                BankIntegrationId = zenithBank.Id,
                BankCustomerId = "ZBA-CUST-0003",
                FullName = "Lerato Mokoena",
                Email = "lerato.mokoena@email.co.za",
                PhoneNumber = "0611112222",
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var user4 = new User
            {
                Id = Guid.Parse("c4000000-0000-0000-0000-000000000004"),
                BankIntegrationId = savannaBank.Id,
                BankCustomerId = "SVB-CUST-0001",
                FullName = "Sipho Zulu",
                Email = "sipho.zulu@email.co.za",
                PhoneNumber = "0729998888",
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var user5 = new User
            {
                Id = Guid.Parse("c5000000-0000-0000-0000-000000000005"),
                BankIntegrationId = savannaBank.Id,
                BankCustomerId = "SVB-CUST-0002",
                FullName = "Naledi Khumalo",
                Email = "naledi.khumalo@email.co.za",
                PhoneNumber = "0845556666",
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddRangeAsync(user1, user2, user3, user4, user5);
            static string Hash(string value) => BCrypt.Net.BCrypt.HashPassword(value);
            // ── AUTH CREDENTIALS ───────────────────────────────────────────
            await context.AuthCredentials.AddRangeAsync(
            new AuthCredential
            {
                Id = Guid.NewGuid(),
                UserId = user1.Id,
                PasswordHash = Hash("Password@123"),
                NormalPinHash = Hash("1234"),
                DuressPinHash = Hash("9999"),
                CreatedAt = DateTime.UtcNow
            },
            new AuthCredential
            {
                Id = Guid.NewGuid(),
                UserId = user2.Id,
                PasswordHash = Hash("Password@123"),
                NormalPinHash = Hash("2222"),
                DuressPinHash = Hash("8888"),
                CreatedAt = DateTime.UtcNow
            },
            new AuthCredential
            {
                Id = Guid.NewGuid(),
                UserId = user3.Id,
                PasswordHash = Hash("Password@123"),
                NormalPinHash = Hash("3333"),
                DuressPinHash = Hash("7777"),
                CreatedAt = DateTime.UtcNow
            },
            new AuthCredential
            {
                Id = Guid.NewGuid(),
                UserId = user4.Id,
                PasswordHash = Hash("Password@123"),
                NormalPinHash = Hash("4444"),
                DuressPinHash = Hash("6666"),
                CreatedAt = DateTime.UtcNow
            },
            new AuthCredential
            {
                Id = Guid.NewGuid(),
                UserId = user5.Id,
                PasswordHash = Hash("Password@123"),
                NormalPinHash = Hash("5555"),
                DuressPinHash = Hash("0000"),
                CreatedAt = DateTime.UtcNow
            }
        );

            // ── BANK ACCOUNTS ──────────────────────────────────────────────
            await context.BankAccounts.AddRangeAsync(
                new BankAccount
                {
                    Id = Guid.Parse("d1000000-0000-0000-0000-000000000001"),
                    UserId = user1.Id,
                    AccountNumber = "4001001001",
                    AccountName = "Thabo Nkosi Savings",
                    AccountType = AccountType.Savings,
                    AvailableBalance = 18500.00m,
                    CurrentBalance = 18500.00m,
                    Currency = "ZAR",
                    Status = AccountStatus.Active,
                    CreatedAt = DateTime.UtcNow
                },
                new BankAccount
                {
                    Id = Guid.Parse("d2000000-0000-0000-0000-000000000002"),
                    UserId = user2.Id,
                    AccountNumber = "4002002002",
                    AccountName = "Amara Dlamini Cheque",
                    AccountType = AccountType.Cheque,
                    AvailableBalance = 32000.00m,
                    CurrentBalance = 32000.00m,
                    Currency = "ZAR",
                    Status = AccountStatus.Active,
                    CreatedAt = DateTime.UtcNow
                },
                new BankAccount
                {
                    Id = Guid.Parse("d3000000-0000-0000-0000-000000000003"),
                    UserId = user3.Id,
                    AccountNumber = "4003003003",
                    AccountName = "Lerato Mokoena Savings",
                    AccountType = AccountType.Savings,
                    AvailableBalance = 9750.00m,
                    CurrentBalance = 9750.00m,
                    Currency = "ZAR",
                    Status = AccountStatus.Active,
                    CreatedAt = DateTime.UtcNow
                },
                new BankAccount
                {
                    Id = Guid.Parse("d4000000-0000-0000-0000-000000000004"),
                    UserId = user4.Id,
                    AccountNumber = "4004004004",
                    AccountName = "Sipho Zulu Cheque",
                    AccountType = AccountType.Cheque,
                    AvailableBalance = 54200.00m,
                    CurrentBalance = 54200.00m,
                    Currency = "ZAR",
                    Status = AccountStatus.Active,
                    CreatedAt = DateTime.UtcNow
                },
                new BankAccount
                {
                    Id = Guid.Parse("d5000000-0000-0000-0000-000000000005"),
                    UserId = user5.Id,
                    AccountNumber = "4005005005",
                    AccountName = "Naledi Khumalo Savings",
                    AccountType = AccountType.Savings,
                    AvailableBalance = 12300.00m,
                    CurrentBalance = 12300.00m,
                    Currency = "ZAR",
                    Status = AccountStatus.Active,
                    CreatedAt = DateTime.UtcNow
                }
            );

            // ── BENEFICIARIES ──────────────────────────────────────────────
            await context.Beneficiaries.AddRangeAsync(
                new Beneficiary
                {
                    Id = Guid.NewGuid(),
                    UserId = user1.Id,
                    Name = "Mama Nkosi",
                    BankName = "Zenith Bank Africa",
                    AccountNumber = "5001001001",
                    Reference = "Grocery Money",
                    Status = BeneficiaryStatus.Active,
                    CreatedAt = DateTime.UtcNow
                },
                new Beneficiary
                {
                    Id = Guid.NewGuid(),
                    UserId = user2.Id,
                    Name = "City Power JHB",
                    BankName = "Savanna Bank",
                    AccountNumber = "5002002002",
                    Reference = "Electricity",
                    Status = BeneficiaryStatus.Active,
                    CreatedAt = DateTime.UtcNow
                },
                new Beneficiary
                {
                    Id = Guid.NewGuid(),
                    UserId = user3.Id,
                    Name = "Kagiso Sithole",
                    BankName = "Savanna Bank",
                    AccountNumber = "5003003003",
                    Reference = "Rent",
                    Status = BeneficiaryStatus.Active,
                    CreatedAt = DateTime.UtcNow
                }
            );

            // ── ADMIN USERS ────────────────────────────────────────────────
            await context.AdminUsers.AddRangeAsync(
                new AdminUser
                {
                    Id = Guid.NewGuid(),
                    BankIntegrationId = zenithBank.Id,
                    FullName = "Kagiso Moyo",
                    Email = "kagiso.moyo@zenithbank.co.za",
                    PasswordHash = Hash("Admin@123"),
                    AdminRole = AdminRole.FraudManager,
                    ActivityStatus = AdminUserStatus.Active,
                    CreatedAt = DateTime.UtcNow
                },
                new AdminUser
                {
                    Id = Guid.NewGuid(),
                    BankIntegrationId = savannaBank.Id,
                    FullName = "Zanele Dube",
                    Email = "zanele.dube@savannabank.co.za",
                    PasswordHash = Hash("Admin@123"),
                    AdminRole = AdminRole.FraudAnalyst,
                    ActivityStatus = AdminUserStatus.Active,
                    CreatedAt = DateTime.UtcNow
                }
            );

            await context.SaveChangesAsync();
            await SeedAdditionalTestUsersAsync(context);
            await SeedBeneficiariesAsync(context);
        }

        private static async Task SeedBeneficiariesAsync(AppDbContext context)
        {
            const int beneficiariesPerUser = 5;
            var beneficiaryPool = new[]
            {
                ("Nomsa Mthembu", "ABSA", "Grocery Money"),
                ("Thandiwe Ndlovu", "FNB", "Family Support"),
                ("Mandla Khumalo", "Nedbank", "Monthly Rent"),
                ("Anele Jacobs", "Standard Bank", "School Fees"),
                ("Bongani Dube", "Capitec Bank", "Household Expenses"),
                ("Zanele Mokoena", "TymeBank", "Utilities"),
                ("Kabelo Molefe", "Discovery Bank", "Medical Aid"),
                ("Lindiwe Sithole", "African Bank", "Savings Transfer"),
                ("Sibusiso Zulu", "Investec", "Vehicle Instalment"),
                ("Nokuthula Maseko", "Sasfin", "Emergency Fund"),
                ("Ayanda Cele", "Bidvest Bank", "Insurance"),
                ("Mpho Radebe", "Grindrod Bank", "Internet"),
                ("Lerato Mokoena", "ABSA", "Childcare"),
                ("Sipho Nkosi", "FNB", "Building Materials"),
                ("Karabo Modise", "Nedbank", "Tuition"),
                ("Busisiwe Dlamini", "Standard Bank", "Water Account"),
                ("Themba Mhlongo", "Capitec Bank", "Airtime"),
                ("Palesa Molefe", "TymeBank", "Household Help"),
                ("Vusi Ncube", "Discovery Bank", "Pharmacy"),
                ("Nosipho Qwabe", "African Bank", "Travel"),
                ("Mzwandile Hadebe", "Investec", "Business Supplies"),
                ("Refilwe Motloung", "Sasfin", "Electricity"),
                ("Siyabonga Mthethwa", "Bidvest Bank", "Rent"),
                ("Puleng Sekwati", "Grindrod Bank", "Groceries"),
                ("Lungile Buthelezi", "ABSA", "Family Support"),
                ("Kagiso Sithole", "FNB", "Rent"),
                ("Nandi Maseko", "Nedbank", "School Transport"),
                ("Sanele Gumede", "Standard Bank", "Home Repairs"),
                ("Nompumelelo Hlongwane", "Capitec Bank", "Monthly Support"),
                ("Buhle Msimang", "TymeBank", "Community Contribution"),
                ("Lwazi Dlamini", "Discovery Bank", "Doctor"),
                ("Mbalenhle Zungu", "African Bank", "Funeral Cover"),
                ("Sakhile Mthembu", "Investec", "Loan Repayment"),
                ("Amanda van der Merwe", "Sasfin", "Rates and Taxes"),
                ("Johan Botha", "Bidvest Bank", "Car Service"),
                ("Naledi Khumalo", "Grindrod Bank", "Savings"),
                ("Tebogo Mokoena", "ABSA", "Cellphone"),
                ("Nkosinathi Cele", "FNB", "Security"),
                ("Charmaine Adams", "Nedbank", "Domestic Services"),
                ("Dumisani Ndlovu", "Standard Bank", "Furniture"),
                ("Masechaba Radebe", "Capitec Bank", "School Uniform"),
                ("Wandile Zulu", "TymeBank", "Fuel"),
                ("Mokgadi Modise", "Discovery Bank", "Dentist"),
                ("Luyanda Jacobs", "African Bank", "Donation"),
                ("Musa Dube", "Investec", "Consulting"),
                ("Nonhle Mkhize", "Sasfin", "Clothing"),
                ("Tshepo Mokoena", "Bidvest Bank", "Subscriptions"),
                ("Nosimilo Zulu", "Grindrod Bank", "Garden Services"),
                ("Keitumetse Phiri", "ABSA", "Legal Fees"),
                ("Wendy Naidoo", "FNB", "Optometrist")
            };

            var users = await context.Users
                .Select(user => user.Id)
                .ToListAsync();

            foreach (var userId in users)
            {
                var existingBeneficiaries = await context.Beneficiaries
                    .Where(beneficiary => beneficiary.UserId == userId)
                    .ToListAsync();

                var existingNames = existingBeneficiaries
                    .Select(beneficiary => beneficiary.Name)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);
                var activeCount = existingBeneficiaries.Count(
                    beneficiary => beneficiary.Status == BeneficiaryStatus.Active);
                var missingCount = beneficiariesPerUser - activeCount;
                if (missingCount <= 0)
                {
                    continue;
                }

                var selectedPool = beneficiaryPool
                    .Where(candidate => !existingNames.Contains(candidate.Item1))
                    .OrderBy(_ => Random.Shared.Next())
                    .Take(missingCount)
                    .ToList();

                foreach (var (name, bankName, reference) in selectedPool)
                {
                    await context.Beneficiaries.AddAsync(new Beneficiary
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = name,
                        BankName = bankName,
                        AccountNumber = CreateSeedAccountNumber(userId, name),
                        Reference = reference,
                        Status = BeneficiaryStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await context.SaveChangesAsync();
        }

        private static string CreateSeedAccountNumber(Guid userId, string beneficiaryName)
        {
            var hash = (uint)HashCode.Combine(userId, beneficiaryName);
            return $"6{hash:000000000000000}"[..16];
        }

        private static async Task ResetAdditionalTestUserProfilesAsync(AppDbContext context)
        {
            var testEmails = new[]
            {
                "test.user.one@email.co.za",
                "test.user.two@email.co.za",
                "test.user.three@email.co.za"
            };

            var testUserIds = await context.Users
                .Where(user => testEmails.Contains(user.Email))
                .Select(user => user.Id)
                .ToListAsync();

            var profiles = await context.DecoyProfiles
                .Where(profile => testUserIds.Contains(profile.UserId))
                .ToListAsync();

            if (profiles.Count == 0)
            {
                return;
            }

            context.DecoyProfiles.RemoveRange(profiles);
            await context.SaveChangesAsync();
        }

        private static async Task SeedAdditionalTestUsersAsync(AppDbContext context)
        {
            var zenithBank = await context.BankIntegrations
                .FirstAsync(x => x.BankCode == "ZBA001");

            var testUsers = new[]
            {
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000001"),
                    CustomerId = "ZBA-TEST-0001",
                    Name = "Test User One",
                    Email = "test.user.one@email.co.za",
                    Phone = "0827001001",
                    AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000001"),
                    AccountNumber = "4901001001",
                    Balance = 15000.00m,
                    NormalPin = "1357",
                    DuressPin = "9753"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000002"),
                    CustomerId = "ZBA-TEST-0002",
                    Name = "Test User Two",
                    Email = "test.user.two@email.co.za",
                    Phone = "0827001002",
                    AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000002"),
                    AccountNumber = "4901001002",
                    Balance = 27500.00m,
                    NormalPin = "2468",
                    DuressPin = "8642"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000003"),
                    CustomerId = "ZBA-TEST-0003",
                    Name = "Test User Three",
                    Email = "test.user.three@email.co.za",
                    Phone = "0827001003",
                    AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000003"),
                    AccountNumber = "4901001003",
                    Balance = 42000.00m,
                    NormalPin = "4826",
                    DuressPin = "6284"
                }
            };

            foreach (var testUser in testUsers)
            {
                if (await context.Users.AnyAsync(x => x.Email == testUser.Email))
                {
                    continue;
                }

                var user = new User
                {
                    Id = testUser.Id,
                    BankIntegrationId = zenithBank.Id,
                    BankCustomerId = testUser.CustomerId,
                    FullName = testUser.Name,
                    Email = testUser.Email,
                    PhoneNumber = testUser.Phone,
                    Status = UserStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(user);
                await context.AuthCredentials.AddAsync(new AuthCredential
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                    NormalPinHash = BCrypt.Net.BCrypt.HashPassword(testUser.NormalPin),
                    DuressPinHash = BCrypt.Net.BCrypt.HashPassword(testUser.DuressPin),
                    CreatedAt = DateTime.UtcNow
                });
                await context.BankAccounts.AddAsync(new BankAccount
                {
                    Id = testUser.AccountId,
                    UserId = user.Id,
                    AccountNumber = testUser.AccountNumber,
                    AccountName = $"{testUser.Name} Main Account",
                    AccountType = AccountType.Cheque,
                    AvailableBalance = testUser.Balance,
                    CurrentBalance = testUser.Balance,
                    Currency = "ZAR",
                    Status = AccountStatus.Active,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await context.SaveChangesAsync();
        }
    }
}