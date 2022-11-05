import { Card, CardActions, CardContent, CardMedia } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import SoftButton from "../../../components/SoftButton";
import SoftTypography from "../../../components/SoftTypography";

export default function Nft({
  image,
  name,
  buttonText = "Select",
  defaultSelected = false,
  selected: controlledSelected,
  reward,
  onChange,
  unstaked,
  text,
}) {
  const isControlled = controlledSelected !== undefined;
  const [ownSelected, setOwnSelected] = useState(defaultSelected);
  const selected = isControlled ? controlledSelected : ownSelected;

  const onClick = () => {
    if (!isControlled) {
      setOwnSelected(!selected);
    }
    onChange?.(!selected);
  };

  return (
    <Card>
      <CardMedia component="img" image={image} alt="nft image" sx={{ mb: 1 }} />
      <CardContent>
        <Stack justifyContent="space-between">
          <SoftTypography variant="h5">{name}</SoftTypography>
          {/* {reward ? <SoftTypography variant="body2">Rewards: {reward} REALM</SoftTypography> : null} */}
        </Stack>
      </CardContent>
      <CardActions>
        <SoftButton
          variant="gradient"
          fullWidth
          color={unstaked || selected ? "secondary" : "primary"}
          onClick={onClick}
          disabled={unstaked}
        >
          {unstaked ? text : selected ? "Deselect" : buttonText}
        </SoftButton>
      </CardActions>
    </Card>
  );
}
