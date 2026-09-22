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
                    Password = "Password@123",
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
                    Password = "Password@123",
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
                    Password = "Password@123",
                    NormalPin = "4826",
                    DuressPin = "6284"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000004"), CustomerId = "ZBA-TEST-0004", Name = "Ayanda Maseko", Email = "ayanda.maseko@email.co.za", Phone = "0827001004", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000004"), AccountNumber = "4901001004", Balance = 18500.00m, Password = "1001", NormalPin = "1001", DuressPin = "9048"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000005"), CustomerId = "ZBA-TEST-0005", Name = "Sibusiso Ndlovu", Email = "sibusiso.ndlovu@email.co.za", Phone = "0827001005", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000005"), AccountNumber = "4901001005", Balance = 22300.00m, Password = "1002", NormalPin = "1002", DuressPin = "8059"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000006"), CustomerId = "ZBA-TEST-0006", Name = "Palesa Mokoena", Email = "palesa.mokoena@email.co.za", Phone = "0827001006", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000006"), AccountNumber = "4901001006", Balance = 31750.00m, Password = "1003", NormalPin = "1003", DuressPin = "7160"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000007"), CustomerId = "ZBA-TEST-0007", Name = "Kabelo Molefe", Email = "kabelo.molefe@email.co.za", Phone = "0827001007", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000007"), AccountNumber = "4901001007", Balance = 14600.00m, Password = "1004", NormalPin = "1004", DuressPin = "6271"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000008"), CustomerId = "ZBA-TEST-0008", Name = "Nokuthula Dube", Email = "nokuthula.dube@email.co.za", Phone = "0827001008", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000008"), AccountNumber = "4901001008", Balance = 28900.00m, Password = "1005", NormalPin = "1005", DuressPin = "5380"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000009"), CustomerId = "ZBA-TEST-0009", Name = "Mandla Khumalo", Email = "mandla.khumalo@email.co.za", Phone = "0827001009", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000009"), AccountNumber = "4901001009", Balance = 36200.00m, Password = "1006", NormalPin = "1006", DuressPin = "4493"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000010"), CustomerId = "ZBA-TEST-0010", Name = "Busisiwe Zungu", Email = "busisiwe.zungu@email.co.za", Phone = "0827001010", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000010"), AccountNumber = "4901001010", Balance = 19800.00m, Password = "1007", NormalPin = "1007", DuressPin = "3504"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000011"), CustomerId = "ZBA-TEST-0011", Name = "Themba Mthembu", Email = "themba.mthembu@email.co.za", Phone = "0827001011", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000011"), AccountNumber = "4901001011", Balance = 40500.00m, Password = "1008", NormalPin = "1008", DuressPin = "2615"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000012"), CustomerId = "ZBA-TEST-0012", Name = "Zinhle Cele", Email = "zinhle.cele@email.co.za", Phone = "0827001012", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000012"), AccountNumber = "4901001012", Balance = 25100.00m, Password = "1009", NormalPin = "1009", DuressPin = "1726"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000013"), CustomerId = "ZBA-TEST-0013", Name = "Lungile Hadebe", Email = "lungile.hadebe@email.co.za", Phone = "0827001013", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000013"), AccountNumber = "4901001013", Balance = 17400.00m, Password = "1010", NormalPin = "1010", DuressPin = "7837"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000014"), CustomerId = "ZBA-TEST-0014", Name = "Refilwe Modise", Email = "refilwe.modise@email.co.za", Phone = "0827001014", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000014"), AccountNumber = "4901001014", Balance = 33200.00m, Password = "1011", NormalPin = "1011", DuressPin = "6948"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000015"), CustomerId = "ZBA-TEST-0015", Name = "Mpho Radebe", Email = "mpho.radebe@email.co.za", Phone = "0827001015", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000015"), AccountNumber = "4901001015", Balance = 21900.00m, Password = "1012", NormalPin = "1012", DuressPin = "9059"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000016"), CustomerId = "ZBA-TEST-0016", Name = "Karabo Seema", Email = "karabo.seema@email.co.za", Phone = "0827001016", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000016"), AccountNumber = "4901001016", Balance = 28700.00m, Password = "1013", NormalPin = "1013", DuressPin = "8160"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000017"), CustomerId = "ZBA-TEST-0017", Name = "Thandeka Msimang", Email = "thandeka.msimang@email.co.za", Phone = "0827001017", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000017"), AccountNumber = "4901001017", Balance = 15300.00m, Password = "1014", NormalPin = "1014", DuressPin = "7271"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000018"), CustomerId = "ZBA-TEST-0018", Name = "Bongani Mahlangu", Email = "bongani.mahlangu@email.co.za", Phone = "0827001018", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000018"), AccountNumber = "4901001018", Balance = 37600.00m, Password = "1015", NormalPin = "1015", DuressPin = "4382"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000019"), CustomerId = "ZBA-TEST-0019", Name = "Nandi Zwane", Email = "nandi.zwane@email.co.za", Phone = "0827001019", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000019"), AccountNumber = "4901001019", Balance = 24400.00m, Password = "1016", NormalPin = "1016", DuressPin = "3493"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000020"), CustomerId = "ZBA-TEST-0020", Name = "Siyabonga Mkhize", Email = "siyabonga.mkhize@email.co.za", Phone = "0827001020", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000020"), AccountNumber = "4901001020", Balance = 29800.00m, Password = "1017", NormalPin = "1017", DuressPin = "2504"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000021"), CustomerId = "ZBA-TEST-0021", Name = "Keaobaka Tlou", Email = "keaobaka.tlou@email.co.za", Phone = "0827001021", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000021"), AccountNumber = "4901001021", Balance = 16700.00m, Password = "1018", NormalPin = "1018", DuressPin = "1615"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000022"), CustomerId = "ZBA-TEST-0022", Name = "Lindiwe Mabuza", Email = "lindiwe.mabuza@email.co.za", Phone = "0827001022", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000022"), AccountNumber = "4901001022", Balance = 35100.00m, Password = "1019", NormalPin = "1019", DuressPin = "8726"
                },
                new
                {
                    Id = Guid.Parse("e1000000-0000-0000-0000-000000000023"), CustomerId = "ZBA-TEST-0023", Name = "Tshepo Letsoalo", Email = "tshepo.letsoalo@email.co.za", Phone = "0827001023", AccountId = Guid.Parse("e2000000-0000-0000-0000-000000000023"), AccountNumber = "4901001023", Balance = 26300.00m, Password = "1020", NormalPin = "1020", DuressPin = "6837"
                }
            };

            foreach (var testUser in testUsers)
            {
                var existingUser = await context.Users
                    .Include(x => x.AuthCredential)
                    .FirstOrDefaultAsync(x => x.Email == testUser.Email);

                if (existingUser != null)
                {
                    // Preserve completed setup and deliberate test-account resets.
                    // Startup seeding must not replace an existing user's PINs.
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
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(testUser.Password),
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
