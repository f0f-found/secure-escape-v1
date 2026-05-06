import { useLocalSearchParams } from "expo-router";
import AccountDetailScreen from "../../screens/accounts/AccountDetailScreen";

export default function AccountDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AccountDetailScreen accountId={id || "1"} />;
}
