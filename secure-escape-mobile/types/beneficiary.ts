export type BeneficiaryResponse = {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  reference: string;
  status: string;
  createdAt: string;
};

export type AddBeneficiaryRequest = {
  name: string;
  bankName: string;
  accountNumber: string;
  reference: string;
};
