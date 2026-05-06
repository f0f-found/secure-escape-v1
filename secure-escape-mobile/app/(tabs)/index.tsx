import HomeScreen from "../../screens/home/HomeScreen";

export default function TabsHomeScreen() {
  const handleActionPress = (actionId: string) => {
    // Handle favorite action presses here
    console.log("Action pressed:", actionId);
    // You can navigate to specific screens based on actionId
    // e.g., router.push(`/airtime`) if actionId === 'airtime'
  };

  return <HomeScreen onActionPress={handleActionPress} />;
}
