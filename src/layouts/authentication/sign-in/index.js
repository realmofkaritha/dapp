import SoftButton from "components/SoftButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import curved9 from "assets/images/curved-images/curved-6.jpg";
import {
  ExtensionLoginButton,
  LedgerLoginButton,
  WalletConnectLoginButton,
  WebWalletLoginButton,
} from "@elrondnetwork/dapp-core/UI";
import { Stack } from "@mui/material";
import styled from "@emotion/styled";

import { useGetLoginInfo } from "@elrondnetwork/dapp-core/hooks";
import { useEffect } from "react";

const UnsetExtensionLoginButton = styled(ExtensionLoginButton)`
  all: unset;
`;
const UnsetLedgerLoginButton = styled(LedgerLoginButton)`
  all: unset;
`;
const UnsetWalletConnectLoginButton = styled(WalletConnectLoginButton)`
  all: unset;
`;
const UnsetWebWalletLoginButton = styled(WebWalletLoginButton)`
  all: unset;
`;

function SignIn() {
  const { isLoggedIn } = useGetLoginInfo();

  useEffect(() => {
    if (isLoggedIn) {
      window.location.href = "/";
    }
  }, [isLoggedIn]);

  return (
    <BasicLayout title="Karitha" description="Login to access our DApp" image={curved9}>
      <Stack spacing={1}>
        <UnsetWalletConnectLoginButton callbackRoute="/" isWalletConnectV2={true}>
          <SoftButton component="span" fullWidth color="primary">
            Maiar login
          </SoftButton>
        </UnsetWalletConnectLoginButton>
        <UnsetExtensionLoginButton callbackRoute="/">
          <SoftButton component="span" fullWidth color="primary">
            Extension login
          </SoftButton>
        </UnsetExtensionLoginButton>
        <UnsetLedgerLoginButton callbackRoute="/">
          <SoftButton component="span" fullWidth color="primary">
            Ledger login
          </SoftButton>
        </UnsetLedgerLoginButton>

        <UnsetWebWalletLoginButton callbackRoute="/" token="abc123">
          <SoftButton component="span" fullWidth color="primary">
            Web Wallet login
          </SoftButton>
        </UnsetWebWalletLoginButton>
      </Stack>
    </BasicLayout>
  );
}

export default SignIn;
