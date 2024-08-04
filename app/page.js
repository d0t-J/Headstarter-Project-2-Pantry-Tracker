"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
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
  Checkbox
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

const InventoryBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  boxShadow: theme.shadows[5],
  width: "800px",
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const InventoryItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  borderRadius: "5px",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
  },
  "& .item-buttons": {
    display: "none",
  },
  "&:hover .item-buttons": {
    display: "flex",
  },
}));

const CircularButton = styled(Button)(({ theme }) => ({
  borderRadius: "50%",
  minWidth: "20px",
  width: "20px",
  height: "20px",
  padding: "0",
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
  const [promptItem, setPromptItem] = useState({ name: "", category: "", quantity: 1 });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [filterInput, setFilterInput] = useState("");
  const [filterByName, setFilterByName] = useState(false);
  const [filterByCategory, setFilterByCategory] = useState(false);

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
        await setDoc(docRef, { category, quantity: quantity - quantityToRemove });
      }
    }
    await updateInventory();
  };

  const addItem = async (item, category, quantity = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity, category: existingCategory } = docSnap.data();
      await setDoc(docRef, { category: existingCategory, quantity: existingQuantity + quantity });
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
        const { quantity: existingQuantity, category: existingCategory } = docSnap.data();
        await setDoc(docRef, { category: existingCategory, quantity: existingQuantity + itemQuantity });
        await updateInventory();
      } else {
        setPromptItem({ name: itemName, category: itemCategory, quantity: itemQuantity });
        setPromptOpen(true);
      }
    } else if (modalType === "delete") {
      await removeItem(itemName, itemQuantity);
    }
    handleClose();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
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
          sx={{
            mr: 2,
          }}
        />
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

      {/* Inventory List: Items are displayed */}
      <InventoryBox>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="primary.light"
          padding={2}
          borderBottom="1px solid"
          borderColor="divider"
        >
          <Typography variant="h6" color="textPrimary" width="33%">
            Name
          </Typography>
          <Typography variant="h6" color="textPrimary" width="33%">
            Category
          </Typography>
          <Typography variant="h6" color="textPrimary" width="33%">
            Qty
          </Typography>
        </Box>
        {filteredInventory.map((item, index) => (
          <InventoryItem key={index}>
            <Typography variant="body1" width="33%">
              {item.name}
            </Typography>
            <Typography variant="body1" width="33%">
              {item.category}
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              width="33%"
            >
              <Typography variant="body1" mr={2}>
                {item.quantity}
              </Typography>
              <Box className="item-buttons">
                <CircularButton
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => addItem(item.name, item.category)}
                >
                  +
                </CircularButton>
                <CircularButton
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => removeItem(item.name)}
                >
                  -
                </CircularButton>
              </Box>
            </Box>
          </InventoryItem>
        ))}
      </InventoryBox>

      {/* Manage Modal */}
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

      {/* Prompt Dialog */}
      <Dialog open={promptOpen} onClose={handlePromptClose}>
        <DialogTitle>Item not found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This item does not exist. Do you want to add it as a new item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePromptClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePromptConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetConfirmOpen}
        onClose={handleResetConfirmClose}
      >
        <DialogTitle>Reset Inventory</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the inventory? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResetConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
