"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box,
  Button,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { styled } from "@mui/material/styles";
import theme from "./theme"; 

// Inventory box styles
const InventoryBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  boxShadow: theme.shadows[3],
  width: "800px",
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

// Inventory item styles
const InventoryItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  borderRadius: "5px",
  transition: "background-color 0.3s",
  position: "relative",
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
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

const TruncatedText = styled(Typography)({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth:"150px",
});

// Circular button styles
const CircularButton = styled(Button)(({ theme }) => ({
  borderRadius: "50%",
  minWidth: "40px",
  width: "40px",
  height: "40px",
  padding: "0",
}));

// Landing slider page styles
const SliderPage = styled(Box)(({ theme, open }) => ({
  position: "absolute",
  top: open ? 0 : "100vh",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#f5e0e0",
  transition: "top 0.5s ease",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

}));

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCategory, setItemCategory] = useState("");
  const [modalType, setModalType] = useState("new");
  const [filterCategory, setFilterCategory] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptItem, setPromptItem] = useState({
    name: "",
    category: "",
    quantity: 1,
  });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [filterInput, setFilterInput] = useState("");
  const [filterByName, setFilterByName] = useState(false);
  const [filterByCategory, setFilterByCategory] = useState(false);
2


  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    filterInventory(filterCategory, inventoryList);
  };

  const filterInventory = (category, inventoryList) => {
    let filteredList = inventoryList;
    if (category) {
      filteredList = filteredList.filter((item) =>
        item.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    setFilteredInventory(filteredList);
  };

  const handleFilterChange = (e) => {
    setFilterInput(e.target.value);
    filterInventory(e.target.value, inventory);
  };

  const handleFilterByNameChange = (e) => {
    setFilterByName(e.target.checked);
  };

  const handleFilterByCategoryChange = (e) => {
    setFilterByCategory(e.target.checked);
  };

  const removeItem = async (item, quantityToRemove = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data();
      if (quantity <= quantityToRemove) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          category,
          quantity: quantity - quantityToRemove,
        });
      }
    }
    await updateInventory();
  };

  const addItem = async (item, category, quantity = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity, category: existingCategory } =
        docSnap.data();
      await setDoc(docRef, {
        category: existingCategory,
        quantity: existingQuantity + quantity,
      });
    } else {
      await setDoc(docRef, { category, quantity });
    }
    await updateInventory();
  };

  const resetInventory = async () => {
    const batch = writeBatch(firestore);
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);

    docs.forEach((doc) => {
      const docRef = doc.ref;
      batch.delete(docRef);
    });

    await batch.commit();
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName("");
    setItemQuantity(1);
    setItemCategory("");
    setModalType("new");
  };

  const handlePromptClose = () => {
    setPromptOpen(false);
    setPromptItem({ name: "", category: "", quantity: 1 });
  };

  const handlePromptConfirm = async () => {
    await addItem(promptItem.name, promptItem.category, promptItem.quantity);
    handlePromptClose();
  };

  const handleResetConfirmOpen = () => setResetConfirmOpen(true);
  const handleResetConfirmClose = () => setResetConfirmOpen(false);
  const handleResetConfirm = async () => {
    await resetInventory();
    handleResetConfirmClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted. Action:", modalType);

    if (modalType === "new") {
      await addItem(itemName, itemCategory, itemQuantity);
    } else if (modalType === "update") {
      const docRef = doc(collection(firestore, "inventory"), itemName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity: existingQuantity, category: existingCategory } =
          docSnap.data();
        await setDoc(docRef, {
          category: existingCategory,
          quantity: existingQuantity + itemQuantity,
        });
        await updateInventory();
      } else {
        setPromptItem({
          name: itemName,
          category: itemCategory,
          quantity: itemQuantity,
        });
        setPromptOpen(true);
      }
    } else if (modalType === "delete") {
      await removeItem(itemName, itemQuantity);
    }
    handleClose();
  };

  return (
    <ThemeProvider theme={theme}>
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {/* Inventory Title */}
        <Typography variant="h4" gutterBottom>
          Inventory Management
        </Typography>

        {/* Manage and Reset Btns */}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleOpen}>
            Manage
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleResetConfirmOpen}
          >
            Reset
          </Button>
        </Stack>

        {/* Filter Box */}
        <Box
          width="800px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
          mb={2}
        >
          <TextField
            label="Filter"
            variant="outlined"
            fullWidth
            value={filterInput}
            onChange={handleFilterChange}
          />
          <Box display="flex" alignItems="center" ml={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterByName}
                  onChange={handleFilterByNameChange}
                />
              }
              label="Name"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterByCategory}
                  onChange={handleFilterByCategoryChange}
                />
              }
              label="Category"
            />
          </Box>
        </Box>

        {/* Inventory List */}
        <InventoryBox>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgcolor="primary.light"
            padding={2}
            borderBottom="1px solid"
            borderColor="divider"
            borderRadius="8px"
          >
            <Typography
              variant="h6"
              width="33%"
              color="#FFFFFF"
            >
              Name
            </Typography>
            <Typography
              variant="h6"
              width="33%"
              color="#FFFFFF"
            >
              Category
            </Typography>
            <Typography
              variant="h6"
              width="33%"
              color="#FFFFFF"
            >
              Quantity
            </Typography>
          </Box>
          {filteredInventory.map((item) => (
            <InventoryItem key={item.name}>
              <TruncatedText width="33%" variant="body1">{item.name}</TruncatedText>
              <TruncatedText width="33%" variant="body1">{item.category}</TruncatedText>
              <Typography width="33%" variant="body1">{item.quantity}</Typography>
              <Box className="item-buttons">
                <CircularButton
                  variant="contained"
                  color="primary"
                  onClick={() => addItem(item.name, item.category, 1)}
                >
                  +
                </CircularButton>
                <CircularButton
                  variant="contained"
                  color="secondary"
                  onClick={() => removeItem(item.name, 1)}
                >
                  -
                </CircularButton>
              </Box>
            </InventoryItem>
          ))}
        </InventoryBox>

        {/* Manage Item Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
            component="form"
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
            }}
            onSubmit={handleSubmit}
          >
            <Typography variant="h6">Manage Entries</Typography>
            <FormControl fullWidth>
              <InputLabel id="action-label">Action</InputLabel>
              <Select
                value={modalType}
                onChange={(e) => setModalType(e.target.value)}
                label="Action"
                labelId="action-label"
              >
                <MenuItem value="" disabled>
                  Select an action
                </MenuItem>
                <MenuItem value="new">New Item</MenuItem>
                <MenuItem value="update">Update Existing Item</MenuItem>
                <MenuItem value="delete">Remove Item</MenuItem>
              </Select>
            </FormControl>

            {modalType === "new" && (
              <>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Category"
                  variant="outlined"
                  fullWidth
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                />
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                />
              </>
            )}

            {modalType === "update" && (
              <>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Quantity to Add"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                />
              </>
            )}

            {modalType === "delete" && (
              <>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Quantity to Remove"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                />
              </>
            )}
            <Button variant="outlined" type="submit">
              {modalType === "new"
                ? "ADD"
                : modalType === "update"
                ? "UPDATE"
                : "DELETE"}
            </Button>
          </Box>
        </Modal>

        {/* Prompt to add new item if not found */}
        <Dialog open={promptOpen} onClose={handlePromptClose}>
          <DialogTitle>Item Not Found</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The item "{promptItem.name}" was not found. Do you want to add it
              as a new item with the specified quantity?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePromptClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handlePromptConfirm} color="primary">
              Add Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation to reset inventory */}
        <Dialog open={resetConfirmOpen} onClose={handleResetConfirmClose}>
          <DialogTitle>Reset Inventory</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to reset the inventory? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleResetConfirmClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleResetConfirm} color="secondary">
              Reset
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
