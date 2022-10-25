/**
=========================================================
* Soft UI Dashboard React - v4.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import PageLayout from "examples/LayoutContainers/PageLayout";

function BasicLayout({ title, description, children }) {
  return (
    <PageLayout background="url('https://karitha.io/static/media/clouds-bg.5b1f7f0a.png')">
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ textAlign: "center" }}
      >
        <Grid item xs={10} lg={4}>
          <SoftBox mt={6} mb={1}>
            <SoftTypography variant="h1" color="white" fontWeight="bold">
              {title}
            </SoftTypography>
          </SoftBox>
          <SoftBox mb={2}>
            <SoftTypography variant="body2" color="white" fontWeight="regular">
              {description}
            </SoftTypography>
          </SoftBox>
        </Grid>
      </Grid>
      <SoftBox px={1} width="calc(100% - 2rem)" mx="auto">
        <Grid container spacing={1} justifyContent="center">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
      </SoftBox>
    </PageLayout>
  );
}

// Setting default values for the props of BasicLayout
BasicLayout.defaultProps = {
  title: "",
  description: "",
};

// Typechecking props for the BasicLayout
BasicLayout.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
