// Soft UI Dashboard React examples
import { Stack } from "@mui/system";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import StakedNftsRow from "./components/StakedNftsRow";
import WalletNftsRow from "./components/WalletNftsRow";

function Dashboard() {

  return (
    <DashboardLayout>
      <Stack spacing={2}>
        <WalletNftsRow />
        <StakedNftsRow />
      </Stack>
    </DashboardLayout>
  );
}

export default Dashboard;
