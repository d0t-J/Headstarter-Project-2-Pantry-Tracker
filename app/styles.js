import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";

// Inventory Box Styles
export const InventoryBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  boxShadow: theme.shadows[3],
  width: "800px",
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

// Inventory item styles
export const InventoryItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.grey[200],
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  borderRadius: "5px",
  transition: "background-color 0.3s",
  position: "relative",
  "&:hover": {
    backgroundColor: theme.palette.grey[400],
  },
  "& .item-buttons": {
    display: "none",
    position: "absolute",
    right: 10,
  },
  "&:hover .item-buttons": {
    display: "flex",
  },
}));

export const TruncatedText = styled(Typography)({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "150px",
});

// Circular button styles
export const CircularButton = styled(Button)(({ theme }) => ({
  borderRadius: "50%",
  minWidth: "40px",
  width: "40px",
  height: "40px",
  padding: "0",
}));
