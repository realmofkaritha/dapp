import { Chip, Collapse, Divider, Grid, Stack } from "@mui/material";
import breakpoints from "assets/theme/base/breakpoints";
import SoftBox from "components/SoftBox";
import { useEffect, useMemo, useState } from "react";
import SoftTypography from "components/SoftTypography";
import Nft from "./Nft";
import SoftButton from "components/SoftButton";

export default function NftsRow({
  nfts,
  title,
  actionButtonTitle,
  nftActionButtonTitle,
  extraActionButtons,
  selectedAction,
  onChange,
}) {
  const [firstRowNftsMax, setFirstRowNftsMax] = useState(4);
  const [showRest, setShowRest] = useState(false);

  const [selectedNfts, setSelectedNfts] = useState([]);
  const selectedNftsSet = useMemo(() => new Set(selectedNfts), [selectedNfts]);
  const firstRowNfts = useMemo(() => {
    return nfts.slice(0, firstRowNftsMax);
  }, [firstRowNftsMax]);

  const restNfts = useMemo(() => {
    return nfts.slice(firstRowNftsMax);
  }, [firstRowNftsMax]);

  const handleSelect = (val, name) => {
    const newSet = new Set(selectedNftsSet);
    if (!val) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedNfts([...newSet]);
  };

  const handleSelectAll = () => {
    if (selectedNfts.length === nfts.length) {
      setSelectedNfts([]);
    } else {
      setSelectedNfts(nfts.map((n) => n.key));
    }
  };

  const handleSelectedAction = async () => {
    await selectedAction?.(selectedNfts);
    setSelectedNfts([]);
  };

  useEffect(() => {
    onChange?.(selectedNfts);
  }, [selectedNfts]);

  useEffect(() => {
    function hanleResize() {
      if (window.innerWidth < breakpoints.values.sm) {
        setFirstRowNftsMax(4);
      } else if (window.innerWidth < breakpoints.values.md) {
        setFirstRowNftsMax(3);
      } else if (window.innerWidth < breakpoints.values.lg) {
        setFirstRowNftsMax(3);
      } else if (window.innerWidth < breakpoints.values.xl) {
        setFirstRowNftsMax(4);
      } else {
        setFirstRowNftsMax(6);
      }
    }
    window.addEventListener("resize", hanleResize);
    hanleResize();
    return () => window.removeEventListener("resize", hanleResize);
  }, []);

  return (
    <SoftBox borderRadius="md">
      <Stack direction="row" justifyContent="space-between">
        {title ? <SoftTypography variant="h5">{title}</SoftTypography> : null}
      </Stack>
      {nfts.length > 0 ? (
        <Stack
          direction="row"
          justifyContent={window.innerWidth < breakpoints.values.sm ? "space-between" : "flex-end"}
          mb={2}
          spacing={2}
        >
          {actionButtonTitle ? (
            <SoftButton
              size="small"
              sx={{ visibility: selectedNfts.length ? "visible" : "hidden" }}
              onClick={handleSelectedAction}
            >
              {actionButtonTitle.replace("{{n}}", selectedNfts.length)}
            </SoftButton>
          ) : null}
          {extraActionButtons?.() || null}
          <SoftButton size="small" onClick={handleSelectAll}>
            {selectedNfts.length === nfts.length ? "Deselect All" : "Select All"}
          </SoftButton>
        </Stack>
      ) : null}
      {nfts.length > 0 ? (
        <>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              {firstRowNfts.map((n) => (
                <Grid item xs={6} sm={4} md={4} lg={3} xl={2} key={n.key}>
                  <Nft
                    image={n.image}
                    name={n.name}
                    buttonText={nftActionButtonTitle}
                    selected={selectedNftsSet.has(n.key)}
                    onChange={(val) => handleSelect(val, n.key)}
                    reward={n.reward}
                  />
                </Grid>
              ))}
            </Grid>
            <Collapse in={showRest}>
              <Grid container spacing={2}>
                {restNfts.map((n) => (
                  <Grid item xs={6} sm={4} md={4} lg={3} xl={2} key={n.key}>
                    <Nft
                      image={n.image}
                      name={n.name}
                      buttonText={nftActionButtonTitle}
                      selected={selectedNftsSet.has(n.key)}
                      onChange={(val) => handleSelect(val, n.key)}
                      reward={n.reward}
                    />
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </Stack>
          {restNfts.length > 0 ? (
            <Divider>
              <Chip
                color="primary"
                variant="outlined"
                onClick={() => setShowRest(!showRest)}
                label={showRest ? "Show Less" : "Show All"}
                sx={({ palette }) => ({
                  "&:hover": {
                    color: "white !important",
                    backgroundColor: `${palette.primary.main} !important`,
                  },
                })}
              />
            </Divider>
          ) : null}
        </>
      ) : (
        <SoftBox sx={{ display: "flex", justifyContent: "center" }}>
          <SoftTypography variant="h2" mb={5} color="secondary" fontWeight="light">
            No SFTs found!
          </SoftTypography>
        </SoftBox>
      )}
    </SoftBox>
  );
}
